import { _decorator, Component, EventTouch, Node } from 'cc';
import { XSHY_GameManager } from './XSHY_GameManager';
import { XSHY_AudioManager } from './XSHY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_ModelSelectPanel')
export class XSHY_ModelSelectPanel extends Component {
    start() {

    }

    OnButtomClick(btn: EventTouch) {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "对战一对一":
                XSHY_GameManager.GameMode = "1V1";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
            case "对战三对三":
                XSHY_GameManager.GameMode = "3V3";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
        }
    }
}


