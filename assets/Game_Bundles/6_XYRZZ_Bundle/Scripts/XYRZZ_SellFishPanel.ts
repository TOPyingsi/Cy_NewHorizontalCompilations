import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';

import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_SellFishPanel')
export class XYRZZ_SellFishPanel extends Component {

    public Money: number = 0;

    Show(FishId: number) {
        let Data = XYRZZ_Constant.FishData[FishId];
        this.Money = Data.price * Data.weight;
        this.node.getChildByPath("框/价格文本").getComponent(Label).string = `X${XYRZZ_Incident.GetMaxNum(this.Money)}`;
        this.node.getChildByPath("框/五十倍出售价格文本").getComponent(Label).string = `X${XYRZZ_Incident.GetMaxNum(this.Money * 50)}`;
    }



    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "出售":
                this.SellFish(false);
                break;
            case "五十倍出售":
                this.SellFish(true);
                break;
        }

    }

    //出售鱼
    SellFish(Isdouble: boolean) {
        if (!Isdouble) {
            XYRZZ_GameData.Instance.Money += this.Money;
            XYRZZ_UIManager.HopHint("出售成功！");
            XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_SellFishPanel);
        } else {//加50倍
            Banner.Instance.ShowVideoAd(() => {
                XYRZZ_GameData.Instance.Money += (this.Money * 50);
                XYRZZ_UIManager.HopHint("出售成功！");
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_SellFishPanel);
            })
        }
    }
}


