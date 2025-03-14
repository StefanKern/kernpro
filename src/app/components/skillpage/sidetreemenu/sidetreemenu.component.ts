import { take } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, RouterModule } from '@angular/router';
import {Component, OnInit} from '@angular/core';
import {MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule} from '@angular/material/tree';
import {of as observableOf} from 'rxjs';
import {FlatTreeControl} from '@angular/cdk/tree';
import {SkillsService} from '../../../services/skills.service';
import {IWord} from '../../../../typings';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/** File node data with possible child nodes. */
export interface SkillNode {
  name: string;
  children?: SkillNode[];
}

/**
 * Flattened tree node that has been created from a FileNode through the flattener. Flattened
 * nodes include level index and whether they can be expanded or not.
 */
export interface FlatTreeNode {
  name: string;
  level: number;
  expandable: boolean;
}

@Component({
    selector: 'core-sidetreemenu',
    templateUrl: './sidetreemenu.component.html',
    styleUrls: ['./sidetreemenu.component.scss'],
    imports: [
        MatTreeModule,
        MatIconModule,
        RouterModule,
        MatButtonModule
    ]
})
export class SidetreemenuComponent implements OnInit {

  /** The TreeControl controls the expand/collapse state of tree nodes.  */
  treeControl: FlatTreeControl<FlatTreeNode>;

  /** The TreeFlattener is used to generate the flat list of items from hierarchical data. */
  treeFlattener: MatTreeFlattener<SkillNode, FlatTreeNode>;

  /** The MatTreeFlatDataSource connects the control and flattener to provide data. */
  dataSource: MatTreeFlatDataSource<SkillNode, FlatTreeNode>;

  constructor(public skillsService: SkillsService, private route: ActivatedRoute
    ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren);

    this.treeControl = new FlatTreeControl(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = [];
  }

  async ngOnInit(): Promise<void> {
    const test = await this.skillsService.getSkillGroups$();
    const routname = (await this.route.firstChild?.paramMap.pipe(take(1)).toPromise()).get('name') as string;
    let expandedGroup = '';
    const newData: SkillNode[] = [];
    for (const field of Object.keys(test)) {
      const items: IWord[] = test[field] as IWord[];
      const newSkill: SkillNode = {
        name: field,
        children: items.map(item => ({name: item.text}))
      };
      if(items.map(item => item.text).includes(routname)) {
        expandedGroup = field;
      }
      newData.push(newSkill);
    }
    this.dataSource.data = newData;
    this.treeControl.expand(this.treeControl.dataNodes.find(x => x.name === expandedGroup));
  }

  /** Transform the data to something the tree can read. */
  transformer(node: SkillNode, level: number) {
    return {
      name: node.name,
      level: level,
      expandable: !!node.children
    };
  }

  /** Get the level of the node */
  getLevel(node: FlatTreeNode) {
    return node.level;
  }

  /** Get whether the node is expanded or not. */
  isExpandable(node: FlatTreeNode) {
    return node.expandable;
  }

  /** Get whether the node has children or not. */
  hasChild(index: number, node: FlatTreeNode) {
    return node.expandable;
  }

  /** Get the children for the node. */
  getChildren(node: SkillNode) {
    return observableOf(node.children);
  }
}
