import { _decorator, Component, find, Label, Node } from 'cc';
import { CDXX_Tool } from './CDXX_Tool';
const { ccclass, property } = _decorator;

@ccclass('CDXX_ItemRankingList')
export class CDXX_ItemRankingList extends Component {

    RankingList: Label = null;
    Name: Label = null;
    Score: Label = null;

    protected onLoad(): void {
        this.RankingList = find("排行", this.node).getComponent(Label);
        this.Name = find("姓名", this.node).getComponent(Label);
        this.Score = find("分数", this.node).getComponent(Label);
    }

    show(rankingList: number, name: string, score: number) {
        this.RankingList.string = rankingList.toString();
        this.Name.string = name;
        this.Score.string = CDXX_Tool.formatNumber(score);
    }
}


