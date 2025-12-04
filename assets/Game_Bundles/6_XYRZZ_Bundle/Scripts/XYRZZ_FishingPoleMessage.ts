import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_FishingPoleMessage')
export class XYRZZ_FishingPoleMessage extends Component {
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
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_FishingPoleMessage);
                break;
            case "升级":
                this.UpLevel();
                break;
        }

    }
    //升级钓法
    UpLevel() {
        if (XYRZZ_GameData.Instance.Money >= this.UpMoney) {
            XYRZZ_GameData.Instance.FishingPoleDataLevel[this.Id].Level += 1;
            XYRZZ_GameData.Instance.Money -= this.UpMoney;
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.钓法升级, this.Id);
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.改变战力);
            this.ShowUI();
        } else {
            XYRZZ_UIManager.HopHint("升级失败，所需金钱不足！");
        }

    }

    //刷新界面
    ShowUI() {
        let data = XYRZZ_Constant.FishingPoleData[this.Id];
        let Level = XYRZZ_GameData.Instance.FishingPoleDataLevel[this.Id].Level;
        this.UpMoney = Math.pow(Level, 3) * data.upLevelMomey;
        this.node.getChildByPath("框/钓法名").getComponent(Label).string = data.Name;
        this.node.getChildByPath("框/描述").getComponent(Label).string = data.describe;
        this.node.getChildByPath("框/等级").getComponent(Label).string = `LV.${Level}`;
        this.node.getChildByPath("框/战力").getComponent(Label).string = `拉力：${XYRZZ_Incident.GetMaxNum(data.Power * Level * Level)}`;
        this.node.getChildByPath("框/克制倍数").getComponent(Label).string = `克制倍数：${Level * 2}`;
        this.node.getChildByPath("框/钞票数量").getComponent(Label).string = `X${XYRZZ_Incident.GetMaxNum(this.UpMoney)}`;
        let str = ``;
        data.restrain.forEach((dt) => {
            str += "\n" + dt;
        })
        this.node.getChildByPath("克制鱼种").getComponent(Label).string = `克制鱼种：` + str;
    }
}


