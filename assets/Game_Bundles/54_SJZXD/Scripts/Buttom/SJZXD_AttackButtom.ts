import { _decorator, Component, EventTouch, Node } from 'cc';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_AttackButtom')
export class SJZXD_AttackButtom extends Component {
    start() {
        this.node.on(Node.EventType.TOUCH_START, this.OnAttackTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.OnAttackTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.OnAttackTouchEnd, this);
    }
    OnAttackTouchStart(event: EventTouch) {
        EventManager.Scene.emit(SJZXD_EventManager.FIRE_START, false);
    }


    OnAttackTouchEnd(event: EventTouch) {
        EventManager.Scene.emit(SJZXD_EventManager.FIRE_STOP);
    }

}


