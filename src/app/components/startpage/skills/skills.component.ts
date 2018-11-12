import { Component } from '@angular/core';
import { iWord } from './../../../libs/wordcloud/wordcloud.component';

@Component({
  selector: 'core-skills',
  templateUrl: './skills.component.html'
})
export class SkillsComponent {
  private COLORS = {
    SEO: '#40567B',
    HTMLCSS: '#D1E2FF',
    JavaScript: '#85B2FF',
    BuildTools: '#6A8FCC',
    ProgrammingLanguages: '#69717F',
    BlockchainCoins: "#58bf00",
    BlockchainTechnologies: 'darkblue'
  }

  private SEOSkills: Array<iWord> = [
    {
      color: this.COLORS.SEO,
      size: (~~(Math.random() * 30) + 10),
      text: "Semantic Web"
    },
    {
      color: this.COLORS.SEO,
      size: (~~(Math.random() * 30) + 10),
      text: "Pagespeed"
    },
    {
      color: this.COLORS.SEO,
      size: (~~(Math.random() * 30) + 10),
      text: "Canonical Links"
    },
    {
      color: this.COLORS.SEO,
      size: (~~(Math.random() * 30) + 10),
      text: "robots.txt"
    }
  ];
  private HTMLCSSSkills: Array<iWord> = [
    {
      color: this.COLORS.HTMLCSS,
      size: (~~(Math.random() * 30) + 10),
      text: "Flexbox"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: (~~(Math.random() * 30) + 10),
      text: "Media Queries"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: (~~(Math.random() * 30) + 10),
      text: "Responsive Design"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: (~~(Math.random() * 30) + 10),
      text: "CSS"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: (~~(Math.random() * 30) + 10),
      text: "CSS3"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: (~~(Math.random() * 30) + 10),
      text: "SCSS"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: (~~(Math.random() * 30) + 10),
      text: "HTML"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: (~~(Math.random() * 30) + 10),
      text: "HTML5"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: (~~(Math.random() * 30) + 10),
      text: "Bootstrap"
    }
  ];
  private JavaScriptSkills: Array<iWord> = [
    {
      color: this.COLORS.JavaScript,
      size: (~~(Math.random() * 30) + 10),
      text: "angular"
    },
    {
      color: this.COLORS.JavaScript,
      size: (~~(Math.random() * 30) + 10),
      text: "angularjs"
    },
    {
      color: this.COLORS.JavaScript,
      size: (~~(Math.random() * 30) + 10),
      text: "knockout"
    },
    {
      color: this.COLORS.JavaScript,
      size: (~~(Math.random() * 30) + 10),
      text: "jQuery"
    },
    {
      color: this.COLORS.JavaScript,
      size: (~~(Math.random() * 30) + 10),
      text: "openlayers"
    },
    {
      color: this.COLORS.JavaScript,
      size: (~~(Math.random() * 30) + 10),
      text: "konva"
    },
    {
      color: this.COLORS.JavaScript,
      size: (~~(Math.random() * 30) + 10),
      text: "ECMAScript"
    },
    {
      color: this.COLORS.JavaScript,
      size: (~~(Math.random() * 30) + 10),
      text: "ECMAScript 6"
    }
  ];

  private BuildToolsSkills: Array<iWord> = [
    {
      color: this.COLORS.BuildTools,
      size: (~~(Math.random() * 30) + 10),
      text: "Grunt"
    },
    {
      color: this.COLORS.BuildTools,
      size: (~~(Math.random() * 30) + 10),
      text: "Webpack"
    },
    {
      color: this.COLORS.BuildTools,
      size: (~~(Math.random() * 30) + 10),
      text: "Node"
    },
    {
      color: this.COLORS.BuildTools,
      size: (~~(Math.random() * 30) + 10),
      text: "Npm"
    },
    {
      color: this.COLORS.BuildTools,
      size: (~~(Math.random() * 30) + 10),
      text: "Bower"
    }
  ];

  private ProgrammingLanguagesSkills: Array<iWord> = [
    {
      color: this.COLORS.ProgrammingLanguages,
      size: (~~(Math.random() * 30) + 10),
      text: "C#"
    },
    {
      color: this.COLORS.ProgrammingLanguages,
      size: (~~(Math.random() * 30) + 10),
      text: "JavaScript"
    },
    {
      color: this.COLORS.ProgrammingLanguages,
      size: (~~(Math.random() * 30) + 10),
      text: "C++"
    }
  ];

  private BlockchainCoinsSkills: Array<iWord> = [
    {
      color: this.COLORS.BlockchainCoins,
      size: (~~(Math.random() * 30) + 10),
      text: "Bitcoin"
    },
    {
      color: this.COLORS.BlockchainCoins,
      size: (~~(Math.random() * 30) + 10),
      text: "Litecoin"
    },
    {
      color: this.COLORS.BlockchainCoins,
      size: (~~(Math.random() * 30) + 10),
      text: "NEO"
    },
    {
      color: this.COLORS.BlockchainCoins,
      size: (~~(Math.random() * 30) + 10),
      text: "Cordano"
    }
  ];

  private BlockchainTechnologiesSkills: Array<iWord> = [
    {
      color: this.COLORS.BlockchainTechnologies,
      size: (~~(Math.random() * 30) + 10),
      text: "Smart Contracts"
    },
    {
      color: this.COLORS.BlockchainTechnologies,
      size: (~~(Math.random() * 30) + 10),
      text: "Proof of work"
    },
    {
      color: this.COLORS.BlockchainTechnologies,
      size: (~~(Math.random() * 30) + 10),
      text: "Proof of stake"
    }
  ];

  public showSEOSkills: boolean = true;
  public showHTMLCSSSkills: boolean = true;
  public showJavaScriptSkills: boolean = true;
  public showBuildToolsSkills: boolean = true;
  public showProgrammingLanguagesSkills: boolean = true;
  public showBlockchainCoinsSkills: boolean = true;
  public showBlockchainTechnologiesSkills: boolean = true;

  public shownskills: Array<iWord> = [];

  constructor() {
    this.shownskills = [
      ...this.SEOSkills,
      ...this.HTMLCSSSkills,
      ...this.JavaScriptSkills,
      ...this.BuildToolsSkills,
      ...this.ProgrammingLanguagesSkills,
      ...this.BlockchainCoinsSkills,
      ...this.BlockchainTechnologiesSkills
    ]
  };

  filterchange() {
    let _shownskills: Array<iWord> = [];
    if (this.showSEOSkills)
      _shownskills = _shownskills.concat(this.SEOSkills);
    if (this.showHTMLCSSSkills)
      _shownskills = _shownskills.concat(this.HTMLCSSSkills);
    if (this.showJavaScriptSkills)
      _shownskills = _shownskills.concat(this.JavaScriptSkills);
    if (this.showBuildToolsSkills)
      _shownskills = _shownskills.concat(this.BuildToolsSkills);
    if (this.showProgrammingLanguagesSkills)
      _shownskills = _shownskills.concat(this.ProgrammingLanguagesSkills);
    if (this.showBlockchainCoinsSkills)
      _shownskills = _shownskills.concat(this.BlockchainCoinsSkills);
    if (this.showBlockchainTechnologiesSkills)
      _shownskills = _shownskills.concat(this.BlockchainTechnologiesSkills);

    this.shownskills = _shownskills;
  }
}
