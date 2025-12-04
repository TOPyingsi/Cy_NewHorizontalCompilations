import { _decorator, Component, Node, tween, v3 } from 'cc';
import ZWDZJS_GameManager from './ZWDZJS_GameManager';
const { ccclass, property } = _decorator;


@ccclass('ZWDZJS_ShengLiZiTiao')
export default class ZWDZJS_ShengLiZiTiao extends Component {
    start() {
        this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnMouseDown(even); });
    }
    OnMouseDown(even) {
        this.node.off(Node.EventType.TOUCH_START);
        ZWDZJS_GameManager.Instance.UI.getChildByName("通关界面").active = true;
    }
    Look() {
        tween(this.node)
            .by(0.1, { position: v3(-25, 0, 0) })
            .delay(0.8)
            .by(0.1, { position: v3(-25, 0, 0) })
            .delay(0.5)
            .by(0.5, { position: v3(-50, 0, 0) })
            .call(() => {
                this.node.getChildByName("箭头").active = true;
                tween(this.node.getChildByName("箭头"))
                    .by(0.8, { position: v3(-45, 0, 0) })
                    .by(0.8, { position: v3(40, 0, 0) })
                    .union()
                    .repeatForever()
                    .start();
            })
            .start();
    }
}

