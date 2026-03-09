import { _decorator, Component, director, EventTouch, input, Input, Node, Prefab, Vec2, Vec3 } from 'cc';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('YYB_InputSystem')
export class YYB_InputSystem extends Component {
    public static instance: YYB_InputSystem = null;


    isTouching: boolean = false;
    Pointdirctor: Vec2 = null;


    protected onLoad(): void {
        YYB_InputSystem.instance = this;
        this.schedule(() => {
            Banner.Instance.ShowCustomAd();
        }, 20);
    }

    protected onEnable(): void {
        this.node.on(Input.EventType.TOUCH_START, this.TOUCH_START, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.TOUCH_MOVE, this);
        this.node.on(Input.EventType.TOUCH_END, this.TOUCH_END, this);
    }

    TOUCH_START(event: EventTouch) {
        this.isTouching = true;
        this.Pointdirctor = event.getUILocation();
        director.getScene().emit("StartTouch")
    }

    TOUCH_MOVE(event: EventTouch) {
        this.Pointdirctor = event.getUILocation();
    }

    TOUCH_END(event: EventTouch) {
        this.isTouching = false;
        director.getScene().emit("StartJudge");
    }

    protected onDisable(): void {
        this.node.off(Input.EventType.TOUCH_START, this.TOUCH_START, this);
        this.node.off(Input.EventType.TOUCH_MOVE, this.TOUCH_MOVE, this);
        this.node.off(Input.EventType.TOUCH_END, this.TOUCH_END, this);
    }
}


