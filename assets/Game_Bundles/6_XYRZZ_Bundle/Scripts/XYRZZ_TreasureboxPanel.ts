import { _decorator, Component, Label, Node } from 'cc';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Incident } from './XYRZZ_Incident';

import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_TreasureboxPanel')
export class XYRZZ_TreasureboxPanel extends Component {
    public Money: number = 0;
    Show() {
        this.Money = Math.pow(XYRZZ_GameData.Instance.GameData[2], 3) * 100;
        this.node.getChildByPath("框/数量文本").getComponent(Label).string = `X${XYRZZ_Incident.GetMaxNum(this.Money)}`;
    }
    //关闭
    OnExitClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_TreasureboxPanel);
    }
    //观看视频
    OnVideoClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        Banner.Instance.ShowVideoAd(() => {
            XYRZZ_GameData.Instance.Money += this.Money;
            XYRZZ_UIManager.HopHint("获得钱X" + XYRZZ_Incident.GetMaxNum(this.Money));
            XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_TreasureboxPanel);
        })
    }
}


