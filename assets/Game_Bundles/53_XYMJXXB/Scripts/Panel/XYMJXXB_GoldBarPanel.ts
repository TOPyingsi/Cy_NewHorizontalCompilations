import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJXXB_GameData } from '../XYMJXXB_GameData';
import { XYMJXXB_Incident } from '../XYMJXXB_Incident';
import Banner from '../../../../Scripts/Banner';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_GoldBarPanel')
export class XYMJXXB_GoldBarPanel extends Component {
    start() {
        director.getScene().on("货币修改", this.updateGoldBar, this);
        this.updateGoldBar();
    }
    protected onEnable(): void {
        this.updateGoldBar();
    }

    //同步金钱
    updateGoldBar() {
        this.node.getChildByName("内容").getComponent(Label).string = XYMJXXB_Incident.GetMaxNum(XYMJXXB_GameData.Instance.GoldBar);
    }

    OnClick() {
        Banner.Instance.ShowVideoAd(() => {
            XYMJXXB_GameData.Instance.ChanggeGoldBar(100);
            UIManager.ShowTip("观看视频，获得100金砖！");
        })

    }
}


