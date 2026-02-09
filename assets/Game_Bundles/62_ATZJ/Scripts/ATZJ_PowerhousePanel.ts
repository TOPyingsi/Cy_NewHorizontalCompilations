import { _decorator, Component, EventTouch, Node } from 'cc';
import { ATZJ_GameManager } from './ATZJ_GameManager';
import { ATZJ_AudioManager } from './ATZJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_PowerhousePanel')
export class ATZJ_PowerhousePanel extends Component {

    OnButtomClick(btn: EventTouch) {
        ATZJ_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "困难":
                ATZJ_GameManager.GameMode = "强者挑战";
                ATZJ_GameManager.difficulty = "困难";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
            case "极难":
                ATZJ_GameManager.GameMode = "强者挑战";
                ATZJ_GameManager.difficulty = "极难";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
        }
    }

}


