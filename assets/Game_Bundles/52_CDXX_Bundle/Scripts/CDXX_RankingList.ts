import { _decorator, Component, find, instantiate, Node, Prefab } from 'cc';

import { CDXX_ScoreName, CDXX_Score } from './CDXX_Constant';
import { CDXX_Tool } from './CDXX_Tool';
import { CDXX_ItemRankingList } from './CDXX_ItemRankingList';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('CDXX_RankingList')
export class CDXX_RankingList extends Component {

    Content: Node = null;

    protected onLoad(): void {
        this.Content = find("view/content", this.node);
    }

    start() {
        const name: string[] = CDXX_Tool.Rand(CDXX_ScoreName);
        this.loadGradeRankingList();
    }

    loadGradeRankingList() {
        for (let i = 0; i < 99; i++) {
            BundleManager.LoadPrefab("52_CDXX_Bundle", "item_排行").then((prefab: Prefab) => {
                const item: Node = instantiate(prefab);
                item.parent = this.Content;
                item.getComponent(CDXX_ItemRankingList).show(i + 1, CDXX_ScoreName[i], CDXX_Score[i]);
            })
        }
    }

}


