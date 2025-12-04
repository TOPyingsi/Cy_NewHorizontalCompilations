import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJDWY_GameData } from '../XYMJDWY_GameData';
import { XYMJDWY_Incident } from '../XYMJDWY_Incident';
import Banner from '../../../../Scripts/Banner';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_MoneyPanel')
export class XYMJDWY_MoneyPanel extends Component {
    start() {
        director.getScene().on("货币修改", this.updateMoney, this);
        this.updateMoney();
    }
    protected onEnable(): void {
        this.updateMoney();
    }

    //同步金钱
    updateMoney() {
        this.node.getChildByName("内容").getComponent(Label).string = XYMJDWY_Incident.GetMaxNum(XYMJDWY_GameData.Instance.Money);
    }

    OnClick() {
        Banner.Instance.ShowVideoAd(() => {
            XYMJDWY_GameData.Instance.ChanggeMoney(1000000);
            UIManager.ShowTip("观看视频，获得1000000钞票！");
        })

    }
}


