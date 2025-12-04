import { _decorator, Component, director, Label, Node } from 'cc';
import { XYMJDWY_GameData } from '../XYMJDWY_GameData';
import { XYMJDWY_Incident } from '../XYMJDWY_Incident';
import Banner from '../../../../Scripts/Banner';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_GoldBarPanel')
export class XYMJDWY_GoldBarPanel extends Component {
    start() {
        director.getScene().on("货币修改", this.updateGoldBar, this);
        this.updateGoldBar();
    }
    protected onEnable(): void {
        this.updateGoldBar();
    }

    //同步金钱
    updateGoldBar() {
        this.node.getChildByName("内容").getComponent(Label).string = XYMJDWY_Incident.GetMaxNum(XYMJDWY_GameData.Instance.GoldBar);
    }

    OnClick() {
        Banner.Instance.ShowVideoAd(() => {
            XYMJDWY_GameData.Instance.ChanggeGoldBar(100);
            UIManager.ShowTip("观看视频，获得100金砖！");
        })

    }
}


