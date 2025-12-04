import { _decorator, Color, Component, director, EventTouch, Label, Node, NodeEventType, Sprite } from 'cc';
import { ZSTSB_GameMgr } from '../ZSTSB_GameMgr';
import { ZSTSB_AudioManager } from '../ZSTSB_AudioManager';
import { ZSTSB_UIGame } from '../ZSTSB_UIGame';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_FillColor')
export class ZSTSB_FillColor extends Component {

    private colorIndex: number = 0;
    private colorIndexLabel: Label = null;
    private colorValue: Color = new Color();
    private colorValueSprite: Sprite = null;

    initData(colorValue: Color, colorIndex: number) {
        this.colorIndexLabel = this.node.getChildByName("Label").getComponent(Label);
        this.colorValueSprite = this.node.children[0].getComponent(Sprite);

        this.colorIndex = colorIndex;
        this.colorValue = colorValue;

        this.colorIndexLabel.string = colorIndex.toString();
        this.colorValueSprite.color = colorValue;

        if (this.colorIndex === 1) {
            ZSTSB_GameMgr.instance.selectNode.worldPosition = this.node.worldPosition;
        }

        this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);

        director.getScene().on("钻石填色本_颜色填充完毕", (colorIndex: number) => {
            this.onColorFilled(colorIndex);
        }, this);
    }

    onTouchEnd(event: EventTouch) {
        ZSTSB_GameMgr.instance.SelectColor();
        ZSTSB_GameMgr.instance.SwitchColorNodes(this.colorValue);
        ZSTSB_GameMgr.instance.selectNodeRoot = this.node;
        ZSTSB_AudioManager.instance.playSFX("按钮");
    }

    onDestroy() {
        // 清理事件监听器
        this.node.off(NodeEventType.TOUCH_END, this.onTouchEnd, this);
        director.getScene().off("钻石填色本_颜色填充完毕", this.onColorFilled, this);
    }

    private onColorFilled(colorIndex: number) {
        if (this.colorIndex == colorIndex) {
            this.colorIndexLabel.string = "";
            this.node.getChildByName("完成").active = true;
            this.node.off(NodeEventType.TOUCH_END, this.onTouchEnd, this);
        }
    }
}