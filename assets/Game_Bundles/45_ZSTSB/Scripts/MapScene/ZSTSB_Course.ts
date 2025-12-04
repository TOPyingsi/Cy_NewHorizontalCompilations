import { _decorator, Component, director, Node, NodeEventType } from 'cc';
import { ZSTSB_AudioManager } from '../ZSTSB_AudioManager';
import { ZSTSB_GameData } from '../ZSTSB_GameData';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Course')
export class ZSTSB_Course extends Component {

    index: number = 0;

    onEnable() {
        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);
    }

    isFirst: boolean = true;
    onClick() {
        console.log("下一步教程");

        ZSTSB_AudioManager.instance.playSFX("按钮");

        let length = this.node.children.length;
        this.index++;
        if (this.index >= length) {
            this.index = 0;
            this.node.children[length - 1].active = false;
            this.node.children[this.index].active = true;

            this.node.active = false;
            this.node.off(NodeEventType.TOUCH_END, this.onClick, this);

            if (ZSTSB_GameData.Instance.isGameFirst) {
                ZSTSB_GameData.Instance.isGameFirst = false;
                director.getScene().emit("钻石填色本_新手教程结束");
            }
            return;
        }

        this.node.children[this.index - 1].active = false;
        this.node.children[this.index].active = true;

    }
}


