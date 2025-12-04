import { _decorator, Component, director, EventKeyboard, EventTouch, Input, input, KeyCode, Node, NodeEventType } from 'cc';
import { HJMSJ_Player } from './HJMSJ_Player';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Shift')
export class HJMSJ_Shift extends Component {
    public playerTs: HJMSJ_Player = null;
    start() {
        this.playerTs = HJMSJ_GameMgr.instance.playerNode.getComponent(HJMSJ_Player);
        this.node.on(NodeEventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(NodeEventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(NodeEventType.TOUCH_CANCEL, this.onTouchCancel, this);

        // 键盘事件监听
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

    }

    update(deltaTime: number) {

    }

    onKeyDown(event: EventKeyboard) {

    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.SHIFT_LEFT:
                director.getScene().emit("哈基米世界_闪避");
                break;
        }

    }

    onTouchStart(event: EventTouch) {

    }

    onTouchEnd(event: EventTouch) {
        director.getScene().emit("哈基米世界_闪避");
    }

    onTouchCancel(event: EventTouch) {

    }

}


