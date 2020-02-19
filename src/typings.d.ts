/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

export interface ISkillGroups {
  SEO: IWord[];
  HtmlCss: IWord[];
  JavaScript: IWord[];
  CMS: IWord[];
  BuildTools: IWord[];
  ProgrammingLanguages: IWord[];
  BlockchainCoins: IWord[];
  BlockchainTechnologies: IWord[];
}

export interface IWikiArticle {
  extract?: string;
  image?: string;
}

export interface IWord {
  text: string;
  size: number;
  color: string;
  font?: string;
  style?: string;
  weight?: string;
  rotate?: number;
  padding?: number;
}

export interface ISkillFirebase {
  category: string;
  level: number;
  title: string;
}
