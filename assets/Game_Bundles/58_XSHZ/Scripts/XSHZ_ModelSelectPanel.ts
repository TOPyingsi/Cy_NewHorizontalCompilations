import { _decorator, Component, EventTouch, Node } from 'cc';
import { XSHZ_GameManager } from './XSHZ_GameManager';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_ModelSelectPanel')
export class XSHZ_ModelSelectPanel extends Component {
    start() {

    }

    OnButtomClick(btn: EventTouch) {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "对战一对一":
                XSHZ_GameManager.GameMode = "1V1";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
            case "对战三对三":
                XSHZ_GameManager.GameMode = "3V3";
                this.node.parent.getChildByName("角色选择").active = true;
                break;
        }
    }
}


