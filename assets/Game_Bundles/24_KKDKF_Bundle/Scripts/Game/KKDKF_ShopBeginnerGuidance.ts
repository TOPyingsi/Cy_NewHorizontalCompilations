import { _decorator, Component, Node, tween, v3 } from 'cc';
import { KKDKF_EventManager, KKDKF_MyEvent } from '../KKDKF_EventManager';
import { KKDKF_GameData } from '../KKDKF_GameData';

const { ccclass, property } = _decorator;

@ccclass('KKDKF_ShopBeginnerGuidance')
export class KKDKF_ShopBeginnerGuidance extends Component {

    start() {
        KKDKF_EventManager.on(KKDKF_MyEvent.饮料给客人, () => { this.Exit(); }, this);
    }
    Show() {
        this.node.active = true;
        this.node.getChildByName("对话框").active = true;
        this.node.getChildByName("小手").active = true;
        tween(this.node.getChildByName("小手"))
            .to(1, { position: this.node.parent.getChildByName("饮料位置").position })
            .to(1, { position: this.node.parent.getChildByName("客人").position.clone().add(v3(0, 200, 0)) })
            .union()
            .repeatForever()
            .start();
    }
    Exit() {
        KKDKF_GameData.Instance.GameData[3] = 1;
        KKDKF_GameData.DateSave();
        this.node.active = false;
    }
}


