import { Component } from '@angular/core';
import { WordcloudComponent } from '../../../components/wordcloud/wordcloud.component';
import { IWord } from '../../../typings';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'core-skills',
    template: `
        <div id="Skills" class="container">
            <h2 class="headline-section">
                <a href="#Skills" i18n>
                    Skills
                    <mat-icon>link</mat-icon>
                </a>
            </h2>
            <core-word-cloud [words]="skillWords"></core-word-cloud>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            margin: 2rem 0;
        }
    `],
    standalone: true,
    imports: [WordcloudComponent, MatIcon]
})
export class SkillsComponent {
    skillWords: IWord[] = [
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
}