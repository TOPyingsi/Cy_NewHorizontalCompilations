import { _decorator, Component, EventTouch, Node } from 'cc';
import { XSHZ_GameManager } from './XSHZ_GameManager';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_PowerhousePanel')
export class XSHZ_PowerhousePanel extends Component {

    OnButtomClick(btn: EventTouch) {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "困难":
                XSHZ_GameManager.GameMode = "强者挑战";
                XSHZ_GameManager.difficulty = "困难";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
            case "极难":
                XSHZ_GameManager.GameMode = "强者挑战";
                XSHZ_GameManager.difficulty = "极难";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
        }
    }

}


