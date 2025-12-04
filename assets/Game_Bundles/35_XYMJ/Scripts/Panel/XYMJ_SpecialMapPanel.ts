import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XYMJ_GameData } from '../XYMJ_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJ_Constant } from '../XYMJ_Constant';
import { XYMJ_AudioManager } from '../XYMJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_SpecialMapPanel')
export class XYMJ_SpecialMapPanel extends Component {
    start() {

    }
    OnbuttomClick(btn: EventTouch) {
        XYMJ_AudioManager.globalAudioPlay("点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "南山校长办公室":
                this.node.getChildByPath("Content/南山办公室").active = true;
                break;
            case "南山办公室返回":
                this.node.getChildByPath("Content/南山办公室").active = false;
                break;
            case "南山办公室前往行动":
                this.GoScene("南山办公室");
                break;
        }
    }

    //前往场景
    GoScene(Name: string) {
        let money: number = 0;
        switch (Name) {
            case "南山办公室":
                money = 20000000;
                break;
        }
        if (XYMJ_GameData.Instance.Money >= money) {
            XYMJ_GameData.Instance.ChanggeMoney(-money);
            XYMJ_Constant.mapID = Name;
            XYMJ_Constant.level = 5;
            director.loadScene("XYMJ_Game");
        } else {
            UIManager.ShowTip("钞票不足！无法入场！");
        }

    }
}


