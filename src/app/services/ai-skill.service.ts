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

export interface AiSkillResponse {
  skills: SkillWord[];
  explanation?: string;
  translationKey?: string;
  translationParams?: { [key: string]: string };
}

export interface TranslationResponse {
  translationKey: string;
  translationParams?: { [key: string]: string };
}

export interface SimilarSkillsResponse {
  skills: SkillWord[];
  translationKey: string;
  translationParams?: { [key: string]: string };
}

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
  async searchSkills(query: string): Promise<AiSkillResponse> {
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
                translationKey: explanation.translationKey,
                translationParams: explanation.translationParams
              };
            }
            case "findSimilarSkills": {
              const args = functionCall.args as { requestedSkill: string; skillCategory: string };
              const similarSkillsResult = this.findSimilarSkills(args.requestedSkill, args.skillCategory);
              return {
                skills: similarSkillsResult.skills,
                translationKey: similarSkillsResult.translationKey,
                translationParams: similarSkillsResult.translationParams
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
          translationKey: similarSkillsResult.translationKey,
          translationParams: similarSkillsResult.translationParams
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
  private generateNoResultsExplanation(query: string, reason: string): TranslationResponse {
    const skillsByCategory = this.skillService.getAvailableCategories()
      .map((category: SkillCategory) => `${ category }: ${ this.skillService.getSkillsByCategory(category).map((s: SkillWord) => s.text).join(', ') }`)
      .join(' | ');

    switch (reason) {
      case 'skill not in portfolio':
        return {
          translationKey: 'NO_EXPERIENCE_WITH_SKILL',
          translationParams: { skill: query, skillsByCategory }
        };

      case 'unclear query':
        return {
          translationKey: 'UNCLEAR_QUERY',
          translationParams: { query, categories: this.skillService.getAvailableCategories().join(', ') }
        };

      case 'gibberish input':
        return {
          translationKey: 'GIBBERISH_INPUT',
          translationParams: { query }
        };

      default:
        return {
          translationKey: 'NO_MATCHING_SKILLS',
          translationParams: { query, skillsByCategory }
        };
    }
  }

  /**
   * Find skills that are similar or related to the requested skill
   */
  private findSimilarSkills(requestedSkill: string, skillCategory: string): SimilarSkillsResponse {
    const requested = requestedSkill.toLowerCase();
    const category = skillCategory.toLowerCase();

    // Define skill relationships and alternatives
    const skillMappings: { [key: string]: { categories: SkillCategory[], translationKey: string, translationParams?: { [key: string]: string } } } = {
      // Programming Languages
      'java': {
        categories: ['programming'],
        translationKey: 'JAVA_ALTERNATIVE',
        translationParams: {}
      },
      'php': {
        categories: ['backend', 'programming'],
        translationKey: 'PHP_ALTERNATIVE',
        translationParams: {}
      },

      // Frontend Frameworks
      'react': {
        categories: ['frontend', 'programming'],
        translationKey: 'REACT_ALTERNATIVE',
        translationParams: {}
      },
      'vue': {
        categories: ['frontend', 'programming'],
        translationKey: 'VUE_ALTERNATIVE',
        translationParams: {}
      },
      'svelte': {
        categories: ['frontend', 'programming'],
        translationKey: 'SVELTE_ALTERNATIVE',
        translationParams: {}
      },

      // Backend Technologies
      'express': {
        categories: ['backend', 'programming'],
        translationKey: 'EXPRESS_ALTERNATIVE',
        translationParams: {}
      },
      'django': {
        categories: ['backend'],
        translationKey: 'DJANGO_ALTERNATIVE',
        translationParams: {}
      },
      'spring': {
        categories: ['backend'],
        translationKey: 'SPRING_ALTERNATIVE',
        translationParams: {}
      },

      // Databases
      'mongodb': {
        categories: ['backend'],
        translationKey: 'MONGODB_ALTERNATIVE',
        translationParams: {}
      },
      'mysql': {
        categories: ['backend'],
        translationKey: 'MYSQL_ALTERNATIVE',
        translationParams: {}
      },
      'postgresql': {
        categories: ['backend'],
        translationKey: 'POSTGRESQL_ALTERNATIVE',
        translationParams: {}
      },

      // Cloud & DevOps
      'aws': {
        categories: ['backend', 'tools'],
        translationKey: 'AWS_ALTERNATIVE',
        translationParams: {}
      },
      'azure': {
        categories: ['backend', 'tools'],
        translationKey: 'AZURE_ALTERNATIVE',
        translationParams: {}
      },
      'docker': {
        categories: ['tools'],
        translationKey: 'DOCKER_ALTERNATIVE',
        translationParams: {}
      },

      // Styling & UI
      'tailwind': {
        categories: ['styling'],
        translationKey: 'TAILWIND_ALTERNATIVE',
        translationParams: {}
      },

      // Build Tools
      'vite': {
        categories: ['tools'],
        translationKey: 'VITE_ALTERNATIVE',
        translationParams: {}
      },
      'rollup': {
        categories: ['tools'],
        translationKey: 'ROLLUP_ALTERNATIVE',
        translationParams: {}
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
        translationKey: mapping.translationKey,
        translationParams: mapping.translationParams
      };
    }

    // Category-based fallbacks
    if (category.includes('programming') || category.includes('language')) {
      const programmingSkills = this.skillService.getSkillsByCategory('programming');
      return {
        skills: programmingSkills,
        translationKey: 'PROGRAMMING_FALLBACK',
        translationParams: { skill: requestedSkill }
      };
    }

    if (category.includes('frontend') || category.includes('framework')) {
      const frontendSkills = this.skillService.getAllSkills().filter(skill =>
        ['frontend', 'programming', 'styling'].includes(skill.category)
      );
      return {
        skills: frontendSkills,
        translationKey: 'FRONTEND_FALLBACK',
        translationParams: { skill: requestedSkill }
      };
    }

    if (category.includes('backend') || category.includes('server')) {
      const backendSkills = this.skillService.getAllSkills().filter(skill =>
        ['backend', 'programming'].includes(skill.category)
      );
      return {
        skills: backendSkills,
        translationKey: 'BACKEND_FALLBACK',
        translationParams: { skill: requestedSkill }
      };
    }

    if (category.includes('styling') || category.includes('css')) {
      const stylingSkills = this.skillService.getSkillsByCategory('styling');
      return {
        skills: stylingSkills,
        translationKey: 'STYLING_FALLBACK',
        translationParams: { skill: requestedSkill }
      };
    }

    // Default fallback
    return {
      skills: [],
      translationKey: 'DEFAULT_FALLBACK',
      translationParams: { skill: requestedSkill }
    };
  }
}
