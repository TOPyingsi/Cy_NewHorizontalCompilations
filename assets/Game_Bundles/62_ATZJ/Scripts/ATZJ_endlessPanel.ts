import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { ATZJ_GameManager } from './ATZJ_GameManager';
import { ATZJ_GameData } from './ATZJ_GameData';
import { ATZJ_AudioManager } from './ATZJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_endlessPanel')
export class ATZJ_endlessPanel extends Component {
    start() {

    }
    protected onEnable(): void {
        this.node.getChildByName("最高连胜").getComponent(Label).string = `最高连胜：${ATZJ_GameData.Instance.GameData[1]}`;
    }

    OnButtomClick(btn: EventTouch) {
        ATZJ_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "开始试炼":
                ATZJ_GameManager.GameMode = "无尽试炼";
                ATZJ_GameManager.WinNum = 0;
                this.node.parent.getChildByName("角色选择").active = true;
                break;
        }
    }
}


