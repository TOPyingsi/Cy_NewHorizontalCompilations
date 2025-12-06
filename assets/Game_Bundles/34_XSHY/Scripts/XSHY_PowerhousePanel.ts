import { _decorator, Component, EventTouch, Node } from 'cc';
import { XSHY_GameManager } from './XSHY_GameManager';
import { XSHY_AudioManager } from './XSHY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_PowerhousePanel')
export class XSHY_PowerhousePanel extends Component {

    OnButtomClick(btn: EventTouch) {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "困难":
                XSHY_GameManager.GameMode = "强者挑战";
                XSHY_GameManager.difficulty = "困难";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
            case "极难":
                XSHY_GameManager.GameMode = "强者挑战";
                XSHY_GameManager.difficulty = "极难";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
        }
    }

}


