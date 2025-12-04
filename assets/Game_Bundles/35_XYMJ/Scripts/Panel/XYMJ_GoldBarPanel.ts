import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJ_GameData } from '../XYMJ_GameData';
import { XYMJ_Incident } from '../XYMJ_Incident';
import Banner from '../../../../Scripts/Banner';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_GoldBarPanel')
export class XYMJ_GoldBarPanel extends Component {
    start() {
        director.getScene().on("货币修改", this.updateGoldBar, this);
        this.updateGoldBar();
    }
    protected onEnable(): void {
        this.updateGoldBar();
    }

    //同步金钱
    updateGoldBar() {
        this.node.getChildByName("内容").getComponent(Label).string = XYMJ_Incident.GetMaxNum(XYMJ_GameData.Instance.GoldBar);
    }

    OnClick() {
        Banner.Instance.ShowVideoAd(() => {
            XYMJ_GameData.Instance.ChanggeGoldBar(100);
            UIManager.ShowTip("观看视频，获得100金砖！");
        })

    }
}


