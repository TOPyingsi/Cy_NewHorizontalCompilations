import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Constant } from './Data/XYRZZ_Constant';
import { XYRZZ_GameManager } from './Game/XYRZZ_GameManager';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_UpLevelPanel')
export class XYRZZ_UpLevelPanel extends Component {
    public UpLevelMoney: number = 0;//升级需要的Monmey；
    Show() {
        this.ShowUI();
    }
    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "叉号":
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_UpLevelPanel);
                break;
            case "升级":
                this.UpLevel();
                break;
        }

    }

    //刷新界面
    ShowUI() {
        this.node.getChildByPath("框/等级").getComponent(Label).string = `LV.${XYRZZ_GameData.Instance.GameData[2]}`;
        this.node.getChildByPath("框/称号").getComponent(Label).string = XYRZZ_Constant.GetTitleOfLevel(XYRZZ_GameData.Instance.GameData[2]);
        this.UpLevelMoney = Math.pow(XYRZZ_GameData.Instance.GameData[2], 3) * 10;
        this.node.getChildByPath("框/升级需求").getComponent(Label).string = `${XYRZZ_Incident.GetMaxNum(this.UpLevelMoney)}`;
        this.node.getChildByPath("框/点击收益").getComponent(Label).string = `${XYRZZ_Incident.GetMaxNum(XYRZZ_GameManager.Instance.GetOncePrice(XYRZZ_GameData.Instance.GameData[2]))}`;
        this.node.getChildByPath("框/装备加成文本").getComponent(Label).string = `${XYRZZ_GameManager.Instance.GetBUFFadd()}%`;
        this.node.getChildByPath("框/点击收益2").getComponent(Label).string = `${XYRZZ_Incident.GetMaxNum(XYRZZ_GameManager.Instance.GetOncePrice(XYRZZ_GameData.Instance.GameData[2] + 1))}`
    }
    //点击升级
    UpLevel() {
        if (XYRZZ_GameData.Instance.Money >= this.UpLevelMoney) {
            XYRZZ_GameData.Instance.GameData[2] += 1;
            XYRZZ_GameData.Instance.Money -= this.UpLevelMoney;
            this.ShowUI();
            XYRZZ_UIManager.HopHint("升级成功！");
            XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.角色升级);
        } else {
            XYRZZ_UIManager.HopHint("升级失败，所需金钱不足！");
        }
    }
}


