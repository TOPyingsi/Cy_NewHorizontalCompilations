import { _decorator, Component, find, instantiate, Node, Prefab } from 'cc';

import { CDXX2_ScoreName, CDXX2_Score } from './CDXX2_Constant';
import { CDXX2_Tool } from './CDXX2_Tool';
import { CDXX2_ItemRankingList } from './CDXX2_ItemRankingList';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

//“排行榜”脚本在启动时直接按固定数组顺序实例化 99 个条目，把预设好的昵称和分数填进 UI，完成静态排行展示。

@ccclass('CDXX2_RankingList')
export class CDXX2_RankingList extends Component {

    Content: Node = null;

    protected onLoad(): void {
        this.Content = find("view/content", this.node);
    }

    start() {
        const name: string[] = CDXX2_Tool.Rand(CDXX2_ScoreName);
        this.loadGradeRankingList();
    }

    loadGradeRankingList() {
        for (let i = 0; i < 99; i++) {
            BundleManager.LoadPrefab("56_CDXX2", "item_排行").then((prefab: Prefab) => {
                const item: Node = instantiate(prefab);
                item.parent = this.Content;
                item.getComponent(CDXX2_ItemRankingList).show(i + 1, CDXX2_ScoreName[i], CDXX2_Score[i]);
            })
        }
    }

}


