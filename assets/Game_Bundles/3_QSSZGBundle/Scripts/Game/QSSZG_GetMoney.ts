import { _decorator, Component, EventTouch, Label, Node, tween, v3 } from 'cc';

import { QSSZG_GameManager } from './QSSZG_GameManager';
import { QSSZG_GameData } from '../QSSZG_GameData';
import { QSSZG_AudioManager } from '../QSSZG_AudioManager';
import { QSSZG_Panel, QSSZG_ShowPanel } from './QSSZG_ShowPanel';
import Banner from '../../../../Scripts/Banner';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_GetMoney')
export class QSSZG_GetMoney extends Component {

    public earnings = 0;
    Show() {
        this.earnings = QSSZG_GameManager.Instance.earnings * 600;
        if (this.earnings < 100) this.earnings = 100;
        this.node.getChildByName("Label").getComponent(Label).string = "金钱不足!是否观看视屏获得600秒的收益？(约" + this.earnings.toFixed(2) + "$)";
        this.Windows_InorOut(true);
    }


    OnButtonClick(btn: EventTouch) {
        QSSZG_AudioManager.AudioPlay("点击", 0);
        switch (btn.target.name) {
            case "取消":
                this.Windows_InorOut(false);
                break;
            case "观看":
                Banner.Instance.ShowVideoAd(() => {
                    QSSZG_GameData.Instance.Money += this.earnings;
                    this.Windows_InorOut(false);
                    UIManager.ShowTip("获得$*" + this.earnings.toFixed(2));
                })
                break;
        }
    }



    //窗口滑出
    Windows_InorOut(isIn: boolean) {
        if (isIn) {
            this.node.setPosition(0, -1200, 0);
            tween(this.node)
                .to(0.4, { position: v3(0, 0, 0) }, { easing: "backOut" })
                .start();
        } else {
            tween(this.node)
                .to(0.4, { position: v3(0, -1200, 0) }, { easing: "backIn" })
                .call(() => {
                    QSSZG_ShowPanel.Instance.HidePanel(QSSZG_Panel.广告界面);
                })
                .start();
        }
    }
}


