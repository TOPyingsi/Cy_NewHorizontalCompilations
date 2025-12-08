import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XYMJXXB_GameData } from '../XYMJXXB_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJXXB_Constant } from '../XYMJXXB_Constant';
import { XYMJXXB_AudioManager } from '../XYMJXXB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_SpecialMapPanel')
export class XYMJXXB_SpecialMapPanel extends Component {
    start() {

    }
    OnbuttomClick(btn: EventTouch) {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
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
        if (XYMJXXB_GameData.Instance.Money >= money) {
            XYMJXXB_GameData.Instance.ChanggeMoney(-money);
            XYMJXXB_Constant.mapID = Name;
            XYMJXXB_Constant.level = 5;
            director.loadScene("XYMJXXB_Game");
        } else {
            UIManager.ShowTip("钞票不足！无法入场！");
        }

    }
}


