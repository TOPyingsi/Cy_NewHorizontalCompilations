import { _decorator, Component, find, instantiate, Node, Prefab } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { SJNDGZ_ScoreName, SJNDGZ_Score } from './SJNDGZ_Constant';
import { SJNDGZ_Tool } from './SJNDGZ_Tool';
import { SJNDGZ_ItemRankingList } from './SJNDGZ_ItemRankingList';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_RankingList')
export class SJNDGZ_RankingList extends Component {

    Content: Node = null;

    protected onLoad(): void {
        this.Content = find("view/content", this.node);
    }

    start() {
        const name: string[] = SJNDGZ_Tool.Rand(SJNDGZ_ScoreName);
        this.loadGradeRankingList();
    }

    loadGradeRankingList() {
        for (let i = 0; i < 99; i++) {
            BundleManager.LoadPrefab("12_SJNDGZ_Bundle", "item_排行").then((prefab: Prefab) => {
                const item: Node = instantiate(prefab);
                item.parent = this.Content;
                item.getComponent(SJNDGZ_ItemRankingList).show(i + 1, SJNDGZ_ScoreName[i], SJNDGZ_Score[i]);
            })
        }
    }

}


