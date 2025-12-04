import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJ_GameData } from '../XYMJ_GameData';
import { XYMJ_Incident } from '../XYMJ_Incident';
import Banner from '../../../../Scripts/Banner';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_MoneyPanel')
export class XYMJ_MoneyPanel extends Component {
    start() {
        director.getScene().on("货币修改", this.updateMoney, this);
        this.updateMoney();
    }
    protected onEnable(): void {
        this.updateMoney();
    }

    //同步金钱
    updateMoney() {
        this.node.getChildByName("内容").getComponent(Label).string = XYMJ_Incident.GetMaxNum(XYMJ_GameData.Instance.Money);
    }

    OnClick() {
        Banner.Instance.ShowVideoAd(() => {
            XYMJ_GameData.Instance.ChanggeMoney(1000000);
            UIManager.ShowTip("观看视频，获得1000000钞票！");
        })

    }
}


