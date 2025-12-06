import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { XSHY_GameManager } from './XSHY_GameManager';
import { XSHY_GameData } from './XSHY_GameData';
import { XSHY_AudioManager } from './XSHY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_endlessPanel')
export class XSHY_endlessPanel extends Component {
    start() {

    }
    protected onEnable(): void {
        this.node.getChildByName("最高连胜").getComponent(Label).string = `最高连胜：${XSHY_GameData.Instance.GameData[1]}`;
    }

    OnButtomClick(btn: EventTouch) {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "开始试炼":
                XSHY_GameManager.GameMode = "无尽试炼";
                XSHY_GameManager.WinNum = 0;
                this.node.parent.getChildByName("角色选择").active = true;
                break;
        }
    }
}


