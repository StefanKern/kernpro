import { Injectable, inject } from '@angular/core';
import { FirebaseApp } from '@angular/fire/app';
import {
  getVertexAI,
  getGenerativeModel,
  GenerativeModel,
  FunctionDeclarationsTool,
  ObjectSchemaInterface,
  Schema,
} from '@angular/fire/vertexai';
import { SkillService } from './skill.service';
import { SkillCategory, SkillWord, SkillSearchResult } from './skill.service';

@Injectable({
  providedIn: 'root'
})
export class AiSkillService {
  private readonly firebaseApp = inject(FirebaseApp);
  private readonly skillService = inject(SkillService);
  private readonly model: GenerativeModel;

  constructor() {
    // Define the skill search tool for Vertex AI
    const skillSearchToolSet: FunctionDeclarationsTool = {
      functionDeclarations: [
        {
          name: "getSkillsByCategory",
          description: "Get skills that belong to a specific category or technology domain (e.g., web technologies, programming languages, tools, etc.)",
          parameters: Schema.object({
            properties: {
              category: Schema.string({
                description: "The category or domain to filter skills by (e.g., 'web technologies', 'programming languages', 'development tools', 'frontend', 'backend', 'styling', 'version control')"
              })
            },
            required: ["category"]
          }) as ObjectSchemaInterface
        },
        {
          name: "getAllSkills",
          description: "Get all available skills in the skill set"
        },
        {
          name: "searchSkillsByText",
          description: "Search for skills that contain specific text or keywords",
          parameters: Schema.object({
            properties: {
              searchText: Schema.string({
                description: "The text or keyword to search for in skill names"
              })
            },
            required: ["searchText"]
          }) as ObjectSchemaInterface
        },
        {
          name: "explainNoResults",
          description: "Provide a human explanation when a search query doesn't match any skills or when the query is unclear/gibberish",
          parameters: Schema.object({
            properties: {
              query: Schema.string({
                description: "The original user query that didn't yield results"
              }),
              reason: Schema.string({
                description: "The reason why no results were found (e.g., 'skill not in portfolio', 'unclear query', 'gibberish input')"
              })
            },
            required: ["query", "reason"]
          }) as ObjectSchemaInterface
        },
        {
          name: "findSimilarSkills",
          description: "Find skills in the portfolio that are similar or related to the requested skill/technology, and provide an intelligent explanation about alternatives",
          parameters: Schema.object({
            properties: {
              requestedSkill: Schema.string({
                description: "The skill or technology the user asked about that's not in the portfolio"
              }),
              skillCategory: Schema.string({
                description: "The category of the requested skill (e.g., 'programming language', 'frontend framework', 'database', 'cloud platform', etc.)"
              })
            },
            required: ["requestedSkill", "skillCategory"]
          }) as ObjectSchemaInterface
        }
      ]
    };

    // Initialize Vertex AI
    const vertexAI = getVertexAI(this.firebaseApp);
    const systemInstruction = this.generateSystemInstruction();

    this.model = getGenerativeModel(vertexAI, {
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      tools: [skillSearchToolSet]
    });
  }

  /**
   * Generate dynamic system instruction based on actual skills
   */
  private generateSystemInstruction(): string {
    const skillsByCategory = this.skillService.getAvailableCategories()
      .map(category => {
        const skills = this.skillService.getSkillsByCategory(category);
        const skillNames = skills.map(s => s.text).join(', ');
        return `    - ${ this.capitalizeFirst(category) }: ${ skillNames }`;
      })
      .join('\n');

    // Generate common query variations for each category
    const queryMappings: { [key in SkillCategory]?: string[] } = {
      frontend: ['web technologies', 'frontend'],
      programming: ['programming skills', 'languages'],
      tools: ['development tools', 'project management'],
      styling: ['styling', 'design', 'CSS'],
      backend: ['backend', 'server'],
      ai: ['AI', 'artificial intelligence', 'machine learning', 'generative AI'],
      automation: ['automation', 'workflow']
    };

    const categoryExamples = this.skillService.getAvailableCategories()
      .map(category => {
        const variations = queryMappings[category] || [category];
        return `    - "${ variations.join('" or "') }" → ${ this.capitalizeFirst(category) } skills`;
      })
      .join('\n');

    return `You are an intelligent skill categorization assistant for a developer's portfolio. 
    You help users find relevant skills by understanding natural language queries about technology categories, skill types, and programming domains.
    
    Available skills are organized by category:
${ skillsByCategory }
    
    When users ask about skill categories, interpret their intent and map to the appropriate skills. Common query variations:
${ categoryExamples }
    
    IMPORTANT: When users ask about specific technologies that are NOT in the available skill set:
    1. If it's a specific technology (like C#, React, Python, etc.), use the findSimilarSkills function to suggest related skills and provide intelligent alternatives
    2. If the query is unclear/gibberish, use the explainNoResults function
    3. Only use explainNoResults for truly unclear queries, not for valid technologies that just aren't in the portfolio`;
  }

  /**
   * Utility method to capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * AI-powered skill search using natural language queries
   * @param query Natural language query like "web technologies", "programming skills", etc.
   */
  async searchSkills(query: string): Promise<SkillSearchResult> {
    try {
      const chat = this.model.startChat();
      let result = await chat.sendMessage(query);
      const functionCalls = result.response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        for (const functionCall of functionCalls) {
          switch (functionCall.name) {
            case "getSkillsByCategory": {
              const args = functionCall.args as { category: string };
              const functionResult = this.getSkillsByCategoryQuery(args.category);
              result = await chat.sendMessage([
                {
                  functionResponse: {
                    name: functionCall.name,
                    response: { skills: functionResult },
                  },
                },
              ]);
              break;
            }
            case "getAllSkills": {
              const functionResult = this.skillService.getAllSkills();
              result = await chat.sendMessage([
                {
                  functionResponse: {
                    name: functionCall.name,
                    response: { skills: functionResult },
                  },
                },
              ]);
              break;
            }
            case "searchSkillsByText": {
              const args = functionCall.args as { searchText: string };
              const functionResult = this.skillService.searchSkillsByText(args.searchText);
              result = await chat.sendMessage([
                {
                  functionResponse: {
                    name: functionCall.name,
                    response: { skills: functionResult },
                  },
                },
              ]);
              break;
            }
            case "explainNoResults": {
              const args = functionCall.args as { query: string; reason: string };
              const explanation = this.generateNoResultsExplanation(args.query, args.reason);
              return {
                skills: [],
                explanation: explanation
              };
            }
            case "findSimilarSkills": {
              const args = functionCall.args as { requestedSkill: string; skillCategory: string };
              const similarSkillsResult = this.findSimilarSkills(args.requestedSkill, args.skillCategory);
              return {
                skills: similarSkillsResult.skills,
                explanation: similarSkillsResult.explanation
              };
            }
          }
        }
      }

      // Parse the AI response to extract skills
      const responseText = result.response.text();

      // The AI should have identified relevant skills, but as a fallback,
      // we'll return all skills if the response suggests it
      if (responseText.toLowerCase().includes('all') ||
        responseText.toLowerCase().includes('every')) {
        return { skills: this.skillService.getAllSkills() };
      }

      // Try to extract skill names from the response
      const allSkills = this.skillService.getAllSkills();
      const mentionedSkills = allSkills.filter(skill =>
        responseText.toLowerCase().includes(skill.text.toLowerCase())
      );

      return {
        skills: mentionedSkills.length > 0 ? mentionedSkills : this.skillService.getAllSkills()
      };

    } catch (error) {
      console.error('AI search failed, falling back to simple search:', error);
      // Fallback to simple text search
      const fallbackResults = this.skillService.searchSkillsByText(query);
      if (fallbackResults.length === 0) {
        // Try to find similar skills as a last resort
        const similarSkillsResult = this.findSimilarSkills(query, 'general');
        return {
          skills: similarSkillsResult.skills,
          explanation: similarSkillsResult.explanation
        };
      }
      return { skills: fallbackResults };
    }
  }

  /**
   * Get skills by category query (internal helper for AI)
   */
  private getSkillsByCategoryQuery(category: string): SkillWord[] {
    const categoryLower = category.toLowerCase();

    // Map query terms to our internal categories
    const queryToCategories: { [key: string]: SkillCategory[] } = {
      'web': ['frontend', 'styling'],
      'tool': ['tools'],
      'development': ['tools'],
      'server': ['backend'],
      'style': ['styling'],
      'css': ['styling'],
      'design': ['styling'],
      'version': ['tools'],
      'project management': ['tools'],
      'artificial intelligence': ['ai'],
      'machine learning': ['ai'],
      'generative': ['ai'],
      'workflow': ['automation']
    };

    // Start with direct category matches
    let targetCategories: SkillCategory[] = [];

    // Check for direct category name matches
    const availableCategories = this.skillService.getAvailableCategories();
    const directMatch = availableCategories.find(cat =>
      categoryLower.includes(cat.toLowerCase())
    );
    if (directMatch) {
      targetCategories.push(directMatch);
    }

    // Check for query term matches
    for (const [queryTerm, categories] of Object.entries(queryToCategories)) {
      if (categoryLower.includes(queryTerm)) {
        targetCategories.push(...categories);
      }
    }

    // Special cases that map to multiple categories
    if (categoryLower.includes('automation')) {
      targetCategories.push('automation', 'ai');
    }

    // Remove duplicates
    targetCategories = [...new Set(targetCategories)];

    // If no specific categories found, return all skills
    if (targetCategories.length === 0) {
      return this.skillService.getAllSkills();
    }

    // Filter skills by categories
    return this.skillService.getSkillsByCategories(targetCategories);
  }

  /**
   * Get example usage of AI search
   */
  getSearchExamples(): string[] {
    return [
      "What are programming skills?",
      "Show me frontend development skills",
      "What are your AI skills?",
      "What tools do I use for development?",
      "Do you know C#?",
      "Can you work with React?", // Example that will trigger explanation
      "What are my styling and design skills?"
    ];
  }

  /**
   * Generate a human-friendly explanation when search doesn't return results
   */
  private generateNoResultsExplanation(query: string, reason: string): string {
    const skillsByCategory = this.skillService.getAvailableCategories()
      .map((category: SkillCategory) => `${ category }: ${ this.skillService.getSkillsByCategory(category).map((s: SkillWord) => s.text).join(', ') }`)
      .join(' | ');

    switch (reason) {
      case 'skill not in portfolio':
        return `I don't have experience with "${ query }" in my current skill set. My expertise includes: ${ skillsByCategory }. Would you like to know about any of these technologies?`;

      case 'unclear query':
        return `I'm not sure what you're looking for with "${ query }". Could you be more specific? You can ask about ${ this.skillService.getAvailableCategories().join(', ') } skills, or any specific technologies.`;

      case 'gibberish input':
        return `I couldn't understand "${ query }". Please ask about specific technologies or skill categories. For example, you could ask "What are your web development skills?" or "Do you know JavaScript?".`;

      default:
        return `I couldn't find any skills matching "${ query }". My current skill set includes: ${ skillsByCategory }. Feel free to ask about any of these!`;
    }
  }

  /**
   * Find skills that are similar or related to the requested skill
   */
  private findSimilarSkills(requestedSkill: string, skillCategory: string): SkillSearchResult {
    const requested = requestedSkill.toLowerCase();
    const category = skillCategory.toLowerCase();

    // Define skill relationships and alternatives
    const skillMappings: { [key: string]: { categories: SkillCategory[], explanation: string } } = {
      // Programming Languages
      'java': {
        categories: ['programming'],
        explanation: `While I don't work with Java extensively, I have experience with C#, TypeScript, and JavaScript. TypeScript and C# provide similar object-oriented programming concepts and static typing that you'd find in Java.`
      },
      'php': {
        categories: ['backend', 'programming'],
        explanation: `I don't work with PHP, but I have extensive backend experience with Node.js using JavaScript and TypeScript, as well as some experience with Python. Node.js provides similar server-side capabilities for web applications.`
      },

      // Frontend Frameworks
      'react': {
        categories: ['frontend', 'programming'],
        explanation: `I don't use React, but I'm proficient with Angular, which is another major frontend framework. Both use component-based architecture and modern JavaScript/TypeScript for building dynamic web applications.`
      },
      'vue': {
        categories: ['frontend', 'programming'],
        explanation: `While I don't work with Vue.js, I have extensive experience with Angular. Both are component-based frontend frameworks that help build reactive user interfaces with TypeScript/JavaScript.`
      },
      'svelte': {
        categories: ['frontend', 'programming'],
        explanation: `I don't use Svelte, but I work with Angular for building modern web applications. Both focus on component-based development and provide excellent developer experiences.`
      },

      // Backend Technologies
      'express': {
        categories: ['backend', 'programming'],
        explanation: `While I don't specifically list Express.js, I work with Node.js using JavaScript and TypeScript for backend development. Express is a common Node.js framework that I likely use in my Node.js projects.`
      },
      'django': {
        categories: ['backend'],
        explanation: `I don't work with Django, but I have backend experience with Node.js and Firebase. These provide similar capabilities for building server-side applications and APIs.`
      },
      'spring': {
        categories: ['backend'],
        explanation: `I don't use Spring Framework, but I work with Node.js for backend development and Firebase for cloud services. These provide similar enterprise-level backend capabilities.`
      },

      // Databases
      'mongodb': {
        categories: ['backend'],
        explanation: `While I don't specifically mention MongoDB, I work with Firebase which includes Firestore (a NoSQL database) and have Node.js experience for database integration.`
      },
      'mysql': {
        categories: ['backend'],
        explanation: `I don't work directly with MySQL, but I use Firebase for data storage and Node.js for backend development, which can integrate with various database systems.`
      },
      'postgresql': {
        categories: ['backend'],
        explanation: `I don't have PostgreSQL experience, but I work with Firebase for data storage and Node.js for backend services, providing similar database and server capabilities.`
      },

      // Cloud & DevOps
      'aws': {
        categories: ['backend', 'tools'],
        explanation: `I don't work with AWS specifically, but I use Firebase for cloud services and Node.js for backend development. Firebase provides similar cloud infrastructure capabilities to AWS.`
      },
      'azure': {
        categories: ['backend', 'tools'],
        explanation: `While I don't use Azure, I have experience with Firebase for cloud services and Node.js for backend development, which provide similar cloud computing capabilities.`
      },
      'docker': {
        categories: ['tools'],
        explanation: `I don't specifically work with Docker, but I use Node.js for backend development and have experience with development tools like Git and VS Code that often integrate with containerization workflows.`
      },

      // Styling & UI
      'tailwind': {
        categories: ['styling'],
        explanation: `I don't use Tailwind CSS, but I work extensively with SCSS, CSS3, Bootstrap, and Material Design for styling applications. These provide similar capabilities for creating modern, responsive designs.`
      },

      // Build Tools
      'vite': {
        categories: ['tools'],
        explanation: `I don't use Vite specifically, but I work with Webpack for module bundling and npm for package management. These tools serve similar purposes in the build process.`
      },
      'rollup': {
        categories: ['tools'],
        explanation: `While I don't use Rollup, I have experience with Webpack for bundling and npm for package management, which provide similar build tool capabilities.`
      }
    };

    // Check for direct match
    if (skillMappings[requested]) {
      const mapping = skillMappings[requested];
      const relatedSkills = this.skillService.getAllSkills().filter(skill =>
        mapping.categories.includes(skill.category)
      );
      return {
        skills: relatedSkills,
        explanation: mapping.explanation
      };
    }

    // Category-based fallbacks
    if (category.includes('programming') || category.includes('language')) {
      const programmingSkills = this.skillService.getSkillsByCategory('programming');
      return {
        skills: programmingSkills,
        explanation: `I don't have experience with ${ requestedSkill }, but I work with TypeScript, JavaScript, C#, and Python. These are versatile programming languages that can be used for various development needs.`
      };
    }

    if (category.includes('frontend') || category.includes('framework')) {
      const frontendSkills = this.skillService.getAllSkills().filter(skill =>
        ['frontend', 'programming', 'styling'].includes(skill.category)
      );
      return {
        skills: frontendSkills,
        explanation: `While I don't work with ${ requestedSkill }, I have extensive frontend experience with Angular, TypeScript, JavaScript, HTML5, CSS3, and Bootstrap for building modern web applications.`
      };
    }

    if (category.includes('backend') || category.includes('server')) {
      const backendSkills = this.skillService.getAllSkills().filter(skill =>
        ['backend', 'programming'].includes(skill.category)
      );
      return {
        skills: backendSkills,
        explanation: `I don't have experience with ${ requestedSkill }, but I work with Node.js, Firebase, TypeScript, JavaScript, and have some experience with Python for backend development and server-side applications.`
      };
    }

    if (category.includes('styling') || category.includes('css')) {
      const stylingSkills = this.skillService.getSkillsByCategory('styling');
      return {
        skills: stylingSkills,
        explanation: `While I don't use ${ requestedSkill }, I have strong styling capabilities with CSS3, SCSS, Bootstrap, and Material Design for creating modern and responsive user interfaces.`
      };
    }

    // Default fallback
    return {
      skills: [],
      explanation: `I don't have experience with ${ requestedSkill } in my current skill set. My expertise focuses on modern web development with Angular, TypeScript, JavaScript, and related technologies. Feel free to ask about any of these areas!`
    };
  }
}
