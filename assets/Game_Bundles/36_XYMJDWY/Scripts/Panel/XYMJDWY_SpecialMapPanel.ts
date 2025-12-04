import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XYMJDWY_GameData } from '../XYMJDWY_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJDWY_Constant } from '../XYMJDWY_Constant';
import { XYMJDWY_AudioManager } from '../XYMJDWY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_SpecialMapPanel')
export class XYMJDWY_SpecialMapPanel extends Component {
    start() {

    }
    OnbuttomClick(btn: EventTouch) {
        XYMJDWY_AudioManager.globalAudioPlay("点击");
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
        if (XYMJDWY_GameData.Instance.Money >= money) {
            XYMJDWY_GameData.Instance.ChanggeMoney(-money);
            XYMJDWY_Constant.mapID = Name;
            XYMJDWY_Constant.level = 5;
            director.loadScene("XYMJDWY_Game");
        } else {
            UIManager.ShowTip("钞票不足！无法入场！");
        }

    }
}


