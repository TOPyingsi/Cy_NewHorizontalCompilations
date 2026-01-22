import { _decorator, Component, find, Label, Node } from 'cc';
import { CDXX2_Tool } from './CDXX2_Tool';
const { ccclass, property } = _decorator;

//“排行榜条目”把排名、昵称、分数三个字段一次性填到对应 Label，并用公共方法格式化分数。

@ccclass('CDXX2_ItemRankingList')
export class CDXX2_ItemRankingList extends Component {

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
        this.Score.string = CDXX2_Tool.formatNumber(score);
    }
}


