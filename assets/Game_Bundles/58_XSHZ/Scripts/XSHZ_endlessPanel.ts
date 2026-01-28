import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { XSHZ_GameManager } from './XSHZ_GameManager';
import { XSHZ_GameData } from './XSHZ_GameData';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_endlessPanel')
export class XSHZ_endlessPanel extends Component {
    start() {

    }
    protected onEnable(): void {
        this.node.getChildByName("最高连胜").getComponent(Label).string = `最高连胜：${XSHZ_GameData.Instance.GameData[1]}`;
    }

    OnButtomClick(btn: EventTouch) {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        switch (btn.target.name) {
            case "返回":
                this.node.active = false;
                break;
            case "开始试炼":
                XSHZ_GameManager.GameMode = "无尽试炼";
                XSHZ_GameManager.WinNum = 0;
                this.node.parent.getChildByName("角色选择").active = true;
                break;
        }
    }
}


