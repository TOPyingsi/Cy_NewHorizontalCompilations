import { _decorator, Component, director, EventTouch, Input, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InputManager')
export class InputManager extends Component {

    currentPosition: Vec2 = new Vec2();
    lastPosition: Vec2 = new Vec2();

    isTouching : boolean = false;

    protected onEnable(): void {
        this.node.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchStart(event: EventTouch) {
        this.lastPosition = this.currentPosition;
        this.currentPosition = event.getUILocation();
        this.isTouching = true;
    }

    private onTouchMove(event: EventTouch) {
        this.lastPosition = this.currentPosition;
        this.currentPosition = event.getUILocation();
    }

    private onTouchEnd(event: EventTouch) {
        this.lastPosition = this.currentPosition;
        this.currentPosition = event.getUILocation();
        this.isTouching = false;
    }

    protected onDisable(): void {
        this.node.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    getTouchPosition(): Vec2 {
        return this.currentPosition;
    }
}


