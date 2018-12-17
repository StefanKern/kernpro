import { Component } from '@angular/core';
import { iWord } from './../../../libs/wordcloud/wordcloud.component';

@Component({
  selector: 'core-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
  , 
})
export class SkillsComponent {
  private COLORS = {
    SEO: '#40567B',
    HTMLCSS: '#2196f3',
    JavaScript: '#000000',
    CMS: '#00BEC1',
    BuildTools: '#6A8FCC',
    ProgrammingLanguages: '#69717F',
    BlockchainCoins: "#58bf00",
    BlockchainTechnologies: 'darkblue'
  }

  private SEOSkills: Array<iWord> = [
    {
      color: this.COLORS.SEO,
      size: 30,
      text: "Semantic Web"
    },
    {
      color: this.COLORS.SEO,
      size: 25,
      text: "Pagespeed"
    },
    {
      color: this.COLORS.SEO,
      size: 15,
      text: "Canonical Links"
    },
    {
      color: this.COLORS.SEO,
      size: 10,
      text: "robots.txt"
    }
  ];
  private HTMLCSSSkills: Array<iWord> = [
    {
      color: this.COLORS.HTMLCSS,
      size: 25,
      text: "Flexbox"
    },
    {
      color: this.COLORS.HTMLCSS,
      size:40,
      text: "Media Queries"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: 35,
      text: "Responsive Design"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: 40,
      text: "CSS"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: 35,
      text: "CSS3"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: 35,
      text: "SCSS"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: 35,
      text: "HTML"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: 20,
      text: "HTML5"
    },
    {
      color: this.COLORS.HTMLCSS,
      size: 20,
      text: "Bootstrap"
    }
  ];
  private JavaScriptSkills: Array<iWord> = [
    {
      color: this.COLORS.JavaScript,
      size: 40,
      text: "angular"
    },
    {
      color: this.COLORS.JavaScript,
      size: 25,
      text: "angularjs"
    },
    {
      color: this.COLORS.JavaScript,
      size: 15,
      text: "knockout"
    },
    {
      color: this.COLORS.JavaScript,
      size: 10,
      text: "vue.js"
    },
    {
      color: this.COLORS.JavaScript,
      size: 35,
      text: "jQuery"
    },
    {
      color: this.COLORS.JavaScript,
      size: 20,
      text: "openlayers"
    },
    {
      color: this.COLORS.JavaScript,
      size: 15,
      text: "konva"
    },
    {
      color: this.COLORS.JavaScript,
      size: 20,
      text: "ECMAScript"
    },
    {
      color: this.COLORS.JavaScript,
      size: 20,
      text: "ECMAScript 6"
    }
  ];

  private BuildToolsSkills: Array<iWord> = [
    {
      color: this.COLORS.BuildTools,
      size: 10,
      text: "Grunt"
    },
    {
      color: this.COLORS.BuildTools,
      size: 30,
      text: "Webpack"
    },
    {
      color: this.COLORS.BuildTools,
      size: 20,
      text: "Node"
    },
    {
      color: this.COLORS.BuildTools,
      size: 30,
      text: "Npm"
    },
    {
      color: this.COLORS.BuildTools,
      size: 10,
      text: "Bower"
    }
  ];

  private CMSSkills: Array<iWord> = [
    {
      color: this.COLORS.CMS,
      size: 35,
      text: "Umbraco"
    },
    {
      color: this.COLORS.CMS,
      size: 15,
      text: "Wordpress"
    },
    {
      color: this.COLORS.CMS,
      size: 10,
      text: "Typo3"
    }
  ];

  private ProgrammingLanguagesSkills: Array<iWord> = [
    {
      color: this.COLORS.ProgrammingLanguages,
      size: 35,
      text: "C#"
    },
    {
      color: this.COLORS.ProgrammingLanguages,
      size: 40,
      text: "JavaScript"
    },
    {
      color: this.COLORS.ProgrammingLanguages,
      size: 15,
      text: "C++"
    },
    {
      color: this.COLORS.ProgrammingLanguages,
      size: 15,
      text: "ASP.NET"
    },
    {
      color: this.COLORS.ProgrammingLanguages,
      size: 20,
      text: "ASP.NET Core"
    }
  ];

  private BlockchainCoinsSkills: Array<iWord> = [
    {
      color: this.COLORS.BlockchainCoins,
      size: 25,
      text: "Bitcoin"
    },
    {
      color: this.COLORS.BlockchainCoins,
      size: 20,
      text: "Litecoin"
    },
    {
      color: this.COLORS.BlockchainCoins,
      size: 25,
      text: "Ethereum"
    },
    {
      color: this.COLORS.BlockchainCoins,
      size: 30,
      text: "NEO"
    },
    {
      color: this.COLORS.BlockchainCoins,
      size: 30,
      text: "Cordano"
    }
  ];

  private BlockchainTechnologiesSkills: Array<iWord> = [
    {
      color: this.COLORS.BlockchainTechnologies,
      size: 20,
      text: "Smart Contracts"
    },
    {
      color: this.COLORS.BlockchainTechnologies,
      size: 10,
      text: "Proof of work"
    },
    {
      color: this.COLORS.BlockchainTechnologies,
      size: 10,
      text: "Proof of stake"
    }
  ];

  public showSEOSkills: boolean = true;
  public showHTMLCSSSkills: boolean = true;
  public showJavaScriptSkills: boolean = true;
  public showBuildToolsSkills: boolean = true;
  public showCMSSkills: boolean = true;
  public showProgrammingLanguagesSkills: boolean = true;
  public showBlockchainCoinsSkills: boolean = true;
  public showBlockchainTechnologiesSkills: boolean = true;

  public shownskills: Array<iWord> = [];

  constructor() {
    this.shownskills = [
      ...this.SEOSkills,
      ...this.HTMLCSSSkills,
      ...this.JavaScriptSkills,
      ...this.CMSSkills,
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
      if (this.showCMSSkills)
        _shownskills = _shownskills.concat(this.CMSSkills);
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
