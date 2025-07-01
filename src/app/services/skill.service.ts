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

export type SkillWord = {
  text: string;
  size: number;
  color: string;
};

export type SkillSearchResult = {
  skills: SkillWord[];
  explanation?: string;
};

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private readonly firebaseApp = inject(FirebaseApp);
  private readonly model: GenerativeModel;

  private readonly skillWords: SkillWord[] = [
    { text: 'Angular', size: 60, color: '#DD0031' },
    { text: 'TypeScript', size: 55, color: '#007ACC' },
    { text: 'JavaScript', size: 50, color: '#F7DF1E' },
    { text: 'HTML5', size: 45, color: '#E34F26' },
    { text: 'CSS3', size: 45, color: '#1572B6' },
    { text: 'Node.js', size: 40, color: '#339933' },
    { text: 'ChatGPT', size: 40, color: '#10A37F' },
    { text: 'Claude', size: 35, color: '#D97706' },
    { text: 'Git', size: 35, color: '#F05032' },
    { text: 'RxJS', size: 35, color: '#B7178C' },
    { text: 'Firebase', size: 35, color: '#FFCA28' },
    { text: 'n8n', size: 30, color: '#EA4B71' },
    { text: 'Agentic AI', size: 30, color: '#8B5CF6' },
    { text: 'Material Design', size: 30, color: '#757575' },
    { text: 'SCSS', size: 30, color: '#CC6699' },
    { text: 'REST API', size: 30, color: '#61DAFB' },
    { text: 'ComfyUI', size: 25, color: '#FF6B6B' },
    { text: 'Flux', size: 25, color: '#4ECDC4' },
    { text: 'Webpack', size: 25, color: '#8DD6F9' },
    { text: 'npm', size: 25, color: '#CB3837' },
    { text: 'VS Code', size: 25, color: '#007ACC' }
  ];

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
    const systemInstruction = `You are an intelligent skill categorization assistant for a developer's portfolio. 
    You help users find relevant skills by understanding natural language queries about technology categories, skill types, and programming domains.
    
    Available skills and their categories:
    - Web Technologies: Angular, HTML5, CSS3, SCSS, Material Design, REST API
    - Programming Languages: TypeScript, JavaScript
    - Runtime/Platforms: Node.js
    - Libraries/Frameworks: RxJS, Angular, Firebase
    - Development Tools: Git, VS Code, Webpack, npm
    - AI Technologies: ChatGPT, Claude, Agentic AI, n8n, ComfyUI, Flux
    
    When users ask about skill categories, interpret their intent and map to the appropriate skills. Be helpful and understand variations like:
    - "web technologies" → HTML5, CSS3, SCSS, Angular, etc.
    - "programming skills" → TypeScript, JavaScript
    - "development tools" → Git, VS Code, Webpack, npm
    - "frontend" → Angular, HTML5, CSS3, SCSS, Material Design
    - "backend" → Node.js, Firebase
    - "project management skills" → Git (version control), npm (package management)
    - "AI skills" or "artificial intelligence" → ChatGPT, Claude, Agentic AI, n8n, ComfyUI, Flux
    - "automation" → n8n, Agentic AI
    - "generative AI" → ChatGPT, Claude, ComfyUI, Flux
    
    IMPORTANT: When users ask about specific technologies that are NOT in the available skill set:
    1. If it's a specific technology (like C#, React, Python, etc.), use the findSimilarSkills function to suggest related skills and provide intelligent alternatives
    2. If the query is unclear/gibberish, use the explainNoResults function
    3. Only use explainNoResults for truly unclear queries, not for valid technologies that just aren't in the portfolio`;

    this.model = getGenerativeModel(vertexAI, {
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      tools: [skillSearchToolSet]
    });
  }

  /**
   * Get all skills without filtering
   */
  getAllSkills(): SkillWord[] {
    return [...this.skillWords];
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
              const functionResult = this.getSkillsByCategory(args.category);
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
              const functionResult = this.getAllSkills();
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
              const functionResult = this.searchSkillsByText(args.searchText);
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
        return { skills: this.getAllSkills() };
      }

      // Try to extract skill names from the response
      const mentionedSkills = this.skillWords.filter(skill =>
        responseText.toLowerCase().includes(skill.text.toLowerCase())
      );

      return {
        skills: mentionedSkills.length > 0 ? mentionedSkills : this.getAllSkills()
      };

    } catch (error) {
      console.error('AI search failed, falling back to simple search:', error);
      // Fallback to simple text search
      const fallbackResults = this.searchSkillsByText(query);
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
   * Generate a human-friendly explanation when search doesn't return results
   */
  private generateNoResultsExplanation(query: string, reason: string): string {
    const availableSkills = this.skillWords.map(skill => skill.text).join(', ');

    switch (reason) {
      case 'skill not in portfolio':
        return `I don't have experience with "${ query }" in my current skill set. My expertise includes: ${ availableSkills }. Would you like to know about any of these technologies?`;

      case 'unclear query':
        return `I'm not sure what you're looking for with "${ query }". Could you be more specific? You can ask about web technologies, programming languages, development tools, or any of these skills: ${ availableSkills }.`;

      case 'gibberish input':
        return `I couldn't understand "${ query }". Please ask about specific technologies or skill categories. For example, you could ask "What are your web development skills?" or "Do you know JavaScript?".`;

      default:
        return `I couldn't find any skills matching "${ query }". My current skill set includes: ${ availableSkills }. Feel free to ask about any of these!`;
    }
  }

  /**
   * Get skills by category (internal helper for AI)
   */
  private getSkillsByCategory(category: string): SkillWord[] {
    const categoryLower = category.toLowerCase();

    if (categoryLower.includes('web') || categoryLower.includes('frontend')) {
      return this.skillWords.filter(skill =>
        ['Angular', 'HTML5', 'CSS3', 'SCSS', 'Material Design', 'REST API'].includes(skill.text)
      );
    }

    if (categoryLower.includes('programming') || categoryLower.includes('language')) {
      return this.skillWords.filter(skill =>
        ['TypeScript', 'JavaScript'].includes(skill.text)
      );
    }

    if (categoryLower.includes('tool') || categoryLower.includes('development')) {
      return this.skillWords.filter(skill =>
        ['Git', 'VS Code', 'Webpack', 'npm'].includes(skill.text)
      );
    }

    if (categoryLower.includes('backend') || categoryLower.includes('server')) {
      return this.skillWords.filter(skill =>
        ['Node.js', 'Firebase'].includes(skill.text)
      );
    }

    if (categoryLower.includes('style') || categoryLower.includes('css')) {
      return this.skillWords.filter(skill =>
        ['CSS3', 'SCSS', 'Material Design'].includes(skill.text)
      );
    }

    if (categoryLower.includes('version') || categoryLower.includes('project management')) {
      return this.skillWords.filter(skill =>
        ['Git', 'npm'].includes(skill.text)
      );
    }

    if (categoryLower.includes('ai') || categoryLower.includes('artificial intelligence') ||
      categoryLower.includes('machine learning') || categoryLower.includes('generative')) {
      return this.skillWords.filter(skill =>
        ['ChatGPT', 'Claude', 'Agentic AI', 'n8n', 'ComfyUI', 'Flux'].includes(skill.text)
      );
    }

    if (categoryLower.includes('automation') || categoryLower.includes('workflow')) {
      return this.skillWords.filter(skill =>
        ['n8n', 'Agentic AI'].includes(skill.text)
      );
    }

    // Default: return all skills
    return this.getAllSkills();
  }

  /**
   * Search skills by text (internal helper for AI and fallback)
   */
  private searchSkillsByText(searchText: string): SkillWord[] {
    const searchLower = searchText.toLowerCase();
    return this.skillWords.filter(skill =>
      skill.text.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get skills by size range
   * @param minSize Minimum size
   * @param maxSize Maximum size (optional)
   */
  getSkillsBySize(minSize: number, maxSize?: number): SkillWord[] {
    return this.skillWords.filter(skill => {
      return skill.size >= minSize && (!maxSize || skill.size <= maxSize);
    });
  }

  /**
   * Get skills by color
   * @param color The color to filter by
   */
  getSkillsByColor(color: string): SkillWord[] {
    return this.skillWords.filter(skill => skill.color === color);
  }

  /**
   * Simple synchronous search for backwards compatibility
   * @param predicate Function to test each skill
   */
  searchSkillsSync(predicate: (skill: SkillWord) => boolean): SkillWord[] {
    return this.skillWords.filter(predicate);
  }

  /**
   * Get example usage of AI search
   */
  getSearchExamples(): string[] {
    return [
      "What skills are in the field of web technologies?",
      "What are programming skills?",
      "What are project management skills?",
      "Show me frontend development skills",
      "What tools do I use for development?",
      "What are my styling and design skills?",
      "What backend technologies do I know?",
      "What are your AI skills?",
      "Do you work with artificial intelligence?",
      "What automation tools do you use?",
      "Show me generative AI technologies",
      "Do you know C#?", // Example that will trigger explanation
      "Can you work with React?", // Example that will trigger explanation
      "asdfghjkl" // Example gibberish that will trigger explanation
    ];
  }

  /**
   * Find skills that are similar or related to the requested skill
   */
  private findSimilarSkills(requestedSkill: string, skillCategory: string): SkillSearchResult {
    const requested = requestedSkill.toLowerCase();
    const category = skillCategory.toLowerCase();

    // Define skill relationships and alternatives
    const skillMappings: { [key: string]: { skills: string[], explanation: string } } = {
      // Programming Languages
      'c#': {
        skills: ['TypeScript', 'JavaScript'],
        explanation: `I don't have experience with C#, but I work extensively with TypeScript and JavaScript, which are also strongly-typed and object-oriented languages. TypeScript especially shares many concepts with C# like static typing, classes, and interfaces.`
      },
      'java': {
        skills: ['TypeScript', 'JavaScript'],
        explanation: `While I don't work with Java, I have strong experience with TypeScript and JavaScript. TypeScript provides similar object-oriented programming concepts and static typing that you'd find in Java.`
      },
      'python': {
        skills: ['JavaScript', 'TypeScript', 'Node.js'],
        explanation: `I don't have Python in my current stack, but I work with JavaScript and TypeScript for both frontend and backend development with Node.js. Both are versatile scripting languages good for rapid development.`
      },
      'php': {
        skills: ['Node.js', 'JavaScript', 'TypeScript'],
        explanation: `I don't work with PHP, but I have extensive backend experience with Node.js using JavaScript and TypeScript. Node.js provides similar server-side capabilities for web applications.`
      },

      // Frontend Frameworks
      'react': {
        skills: ['Angular', 'TypeScript', 'JavaScript'],
        explanation: `I don't use React, but I'm proficient with Angular, which is another major frontend framework. Both use component-based architecture and modern JavaScript/TypeScript for building dynamic web applications.`
      },
      'vue': {
        skills: ['Angular', 'TypeScript', 'JavaScript'],
        explanation: `While I don't work with Vue.js, I have extensive experience with Angular. Both are component-based frontend frameworks that help build reactive user interfaces with TypeScript/JavaScript.`
      },
      'svelte': {
        skills: ['Angular', 'TypeScript', 'JavaScript'],
        explanation: `I don't use Svelte, but I work with Angular for building modern web applications. Both focus on component-based development and provide excellent developer experiences.`
      },

      // Backend Technologies
      'express': {
        skills: ['Node.js', 'JavaScript', 'TypeScript'],
        explanation: `While I don't specifically list Express.js, I work with Node.js using JavaScript and TypeScript for backend development. Express is a common Node.js framework that I likely use in my Node.js projects.`
      },
      'django': {
        skills: ['Node.js', 'Firebase'],
        explanation: `I don't work with Django, but I have backend experience with Node.js and Firebase. These provide similar capabilities for building server-side applications and APIs.`
      },
      'spring': {
        skills: ['Node.js', 'Firebase'],
        explanation: `I don't use Spring Framework, but I work with Node.js for backend development and Firebase for cloud services. These provide similar enterprise-level backend capabilities.`
      },

      // Databases
      'mongodb': {
        skills: ['Firebase', 'Node.js'],
        explanation: `While I don't specifically mention MongoDB, I work with Firebase which includes Firestore (a NoSQL database) and have Node.js experience for database integration.`
      },
      'mysql': {
        skills: ['Firebase', 'Node.js'],
        explanation: `I don't work directly with MySQL, but I use Firebase for data storage and Node.js for backend development, which can integrate with various database systems.`
      },
      'postgresql': {
        skills: ['Firebase', 'Node.js'],
        explanation: `I don't have PostgreSQL experience, but I work with Firebase for data storage and Node.js for backend services, providing similar database and server capabilities.`
      },

      // Cloud & DevOps
      'aws': {
        skills: ['Firebase', 'Node.js'],
        explanation: `I don't work with AWS specifically, but I use Firebase for cloud services and Node.js for backend development. Firebase provides similar cloud infrastructure capabilities to AWS.`
      },
      'azure': {
        skills: ['Firebase', 'Node.js'],
        explanation: `While I don't use Azure, I have experience with Firebase for cloud services and Node.js for backend development, which provide similar cloud computing capabilities.`
      },
      'docker': {
        skills: ['Node.js', 'Git', 'VS Code'],
        explanation: `I don't specifically work with Docker, but I use Node.js for backend development and have experience with development tools like Git and VS Code that often integrate with containerization workflows.`
      },

      // Styling & UI
      'tailwind': {
        skills: ['SCSS', 'CSS3', 'Material Design'],
        explanation: `I don't use Tailwind CSS, but I work extensively with SCSS, CSS3, and Material Design for styling applications. These provide similar capabilities for creating modern, responsive designs.`
      },
      'bootstrap': {
        skills: ['Material Design', 'CSS3', 'SCSS'],
        explanation: `While I don't use Bootstrap, I work with Material Design, CSS3, and SCSS for creating responsive and modern user interfaces with similar component-based styling approaches.`
      },

      // Build Tools
      'vite': {
        skills: ['Webpack', 'npm'],
        explanation: `I don't use Vite specifically, but I work with Webpack for module bundling and npm for package management. These tools serve similar purposes in the build process.`
      },
      'rollup': {
        skills: ['Webpack', 'npm'],
        explanation: `While I don't use Rollup, I have experience with Webpack for bundling and npm for package management, which provide similar build tool capabilities.`
      }
    };

    // Check for direct match
    if (skillMappings[requested]) {
      const mapping = skillMappings[requested];
      const relatedSkills = this.skillWords.filter(skill =>
        mapping.skills.includes(skill.text)
      );
      return {
        skills: relatedSkills,
        explanation: mapping.explanation
      };
    }

    // Category-based fallbacks
    if (category.includes('programming') || category.includes('language')) {
      const programmingSkills = this.skillWords.filter(skill =>
        ['TypeScript', 'JavaScript'].includes(skill.text)
      );
      return {
        skills: programmingSkills,
        explanation: `I don't have experience with ${ requestedSkill }, but I work with TypeScript and JavaScript. These are versatile programming languages that can be used for various development needs.`
      };
    }

    if (category.includes('frontend') || category.includes('framework')) {
      const frontendSkills = this.skillWords.filter(skill =>
        ['Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3'].includes(skill.text)
      );
      return {
        skills: frontendSkills,
        explanation: `While I don't work with ${ requestedSkill }, I have extensive frontend experience with Angular, TypeScript, JavaScript, HTML5, and CSS3 for building modern web applications.`
      };
    }

    if (category.includes('backend') || category.includes('server')) {
      const backendSkills = this.skillWords.filter(skill =>
        ['Node.js', 'Firebase', 'TypeScript', 'JavaScript'].includes(skill.text)
      );
      return {
        skills: backendSkills,
        explanation: `I don't have experience with ${ requestedSkill }, but I work with Node.js, Firebase, TypeScript, and JavaScript for backend development and server-side applications.`
      };
    }

    if (category.includes('styling') || category.includes('css')) {
      const stylingSkills = this.skillWords.filter(skill =>
        ['CSS3', 'SCSS', 'Material Design'].includes(skill.text)
      );
      return {
        skills: stylingSkills,
        explanation: `While I don't use ${ requestedSkill }, I have strong styling capabilities with CSS3, SCSS, and Material Design for creating modern and responsive user interfaces.`
      };
    }

    // Default fallback
    return {
      skills: [],
      explanation: `I don't have experience with ${ requestedSkill } in my current skill set. My expertise focuses on modern web development with Angular, TypeScript, JavaScript, and related technologies. Feel free to ask about any of these areas!`
    };
  }
}
