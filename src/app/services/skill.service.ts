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
    { text: 'Git', size: 35, color: '#F05032' },
    { text: 'RxJS', size: 35, color: '#B7178C' },
    { text: 'Firebase', size: 35, color: '#FFCA28' },
    { text: 'Material Design', size: 30, color: '#757575' },
    { text: 'SCSS', size: 30, color: '#CC6699' },
    { text: 'REST API', size: 30, color: '#61DAFB' },
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
    
    When users ask about skill categories, interpret their intent and map to the appropriate skills. Be helpful and understand variations like:
    - "web technologies" → HTML5, CSS3, SCSS, Angular, etc.
    - "programming skills" → TypeScript, JavaScript
    - "development tools" → Git, VS Code, Webpack, npm
    - "frontend" → Angular, HTML5, CSS3, SCSS, Material Design
    - "backend" → Node.js, Firebase
    - "project management skills" → Git (version control), npm (package management)`;

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
  async searchSkills(query: string): Promise<SkillWord[]> {
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
          }
        }
      }

      // Parse the AI response to extract skills
      const responseText = result.response.text();

      // The AI should have identified relevant skills, but as a fallback,
      // we'll return all skills if the response suggests it
      if (responseText.toLowerCase().includes('all') ||
        responseText.toLowerCase().includes('every')) {
        return this.getAllSkills();
      }

      // Try to extract skill names from the response
      const mentionedSkills = this.skillWords.filter(skill =>
        responseText.toLowerCase().includes(skill.text.toLowerCase())
      );

      return mentionedSkills.length > 0 ? mentionedSkills : this.getAllSkills();

    } catch (error) {
      console.error('AI search failed, falling back to simple search:', error);
      // Fallback to simple text search
      return this.searchSkillsByText(query);
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
      "What backend technologies do I know?"
    ];
  }
}
