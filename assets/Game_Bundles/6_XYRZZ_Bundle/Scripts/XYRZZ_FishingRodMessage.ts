import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_FishingRodMessage')
export class XYRZZ_FishingRodMessage extends Component {
    Id: number = 0;
    UpMoney: number = 0;
    Show(Id: number) {
        this.Id = Id;
        this.ShowUI();
    }

    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "叉号":
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_FishingRodMessage);
                break;
            case "升级":
                this.UpLevel();
                break;
        }

    }

    //升级鱼竿
    UpLevel() {
        if (XYRZZ_GameData.Instance.FishingPoleLevel[this.Id].Level > 99) {
            XYRZZ_UIManager.HopHint("鱼竿等级已满,无法升级！");
            return;
        }
        if (XYRZZ_GameData.Instance.Money >= this.UpMoney) {
            XYRZZ_GameData.Instance.FishingPoleLevel[this.Id].Level += 1;
            XYRZZ_GameData.Instance.Money -= this.UpMoney;
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.改变战力);
            this.ShowUI();
        } else {
            XYRZZ_UIManager.HopHint("升级失败，所需金钱不足！");
        }

    }
    //刷新界面
    ShowUI() {
        this.node.getChildByPath("框/鱼竿底").children.forEach((cd, index) => {
            cd.active = index == this.Id;
        });
        this.node.getChildByPath("框/鱼竿名").getComponent(Label).string = XYRZZ_Constant.FishingPole[this.Id].Name;
        this.node.getChildByPath("框/描述").getComponent(Label).string = XYRZZ_Constant.FishingPole[this.Id].describe;
        let LV: number = XYRZZ_GameData.Instance.FishingPoleLevel[this.Id].Level;
        this.node.getChildByPath("框/等级").getComponent(Label).string = `LV.${LV}`;
        let Power: number = XYRZZ_Constant.FishingPole[this.Id].Power * Math.pow(LV, 2);
        this.node.getChildByPath("框/战力").getComponent(Label).string = `拉力：${XYRZZ_Incident.GetMaxNum(Power)}`;
        this.UpMoney = XYRZZ_Constant.FishingPole[this.Id].upLevelMomey * Math.pow(LV, 3);
        this.node.getChildByPath("框/钞票数量").getComponent(Label).string = `X${XYRZZ_Incident.GetMaxNum(this.UpMoney)}`;
    }
}


