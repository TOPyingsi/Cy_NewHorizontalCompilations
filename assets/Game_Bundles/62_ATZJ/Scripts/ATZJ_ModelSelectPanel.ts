import { _decorator, Component, EventTouch, Node } from 'cc';
import { ATZJ_GameManager } from './ATZJ_GameManager';
import { ATZJ_AudioManager } from './ATZJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_ModelSelectPanel')
export class ATZJ_ModelSelectPanel extends Component {
    start() {

    }

    OnButtomClick(btn: EventTouch) {
        ATZJ_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "对战一对一":
                ATZJ_GameManager.GameMode = "1V1";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
            case "对战三对三":
                ATZJ_GameManager.GameMode = "3V3";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
        }
    }
}


