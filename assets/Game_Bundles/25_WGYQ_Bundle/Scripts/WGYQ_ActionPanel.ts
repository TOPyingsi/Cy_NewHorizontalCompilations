import { _decorator, Component, EventTouch, Node, UITransform, v3, Vec3 } from 'cc';
import { WGYQ_LockDog } from './WGYQ_LockDog';
import { WGYQ_BowDog } from './WGYQ_BowDog';
import { WGYQ_Dog } from './WGYQ_Dog';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_ActionPanel')
export class WGYQ_ActionPanel extends Component {

    private static instance: WGYQ_ActionPanel;
    public static get Instance(): WGYQ_ActionPanel {
        return this.instance;
    }

    @property(Node)
    joystick: Node;

    @property(Node)
    joystick2: Node;

    @property(Node)
    useButton: Node;

    isStop = false;

    private target: Node = null;
    public get Target(): Node {
        return this.target;
    }
    public set Target(value: Node) {
        this.target = value;
        this.scheduleOnce(() => { this.useButton.active = this.target != null; });
    }

    protected onLoad(): void {
        WGYQ_ActionPanel.instance = this;
        this.TouchInit();
    }

    start() {

    }

    update(deltaTime: number) {

    }

    TouchInit() {
        this.joystick.on(Node.EventType.TOUCH_START, this.TouchStart, this);
        this.joystick.on(Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.joystick.on(Node.EventType.TOUCH_END, this.TouchEnd, this);
        this.joystick.on(Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
        this.joystick2?.on(Node.EventType.TOUCH_START, this.TouchStart, this);
        this.joystick2?.on(Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.joystick2?.on(Node.EventType.TOUCH_END, this.TouchEnd, this);
        this.joystick2?.on(Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
    }

    TouchStart(event: EventTouch) {
        this.isStop = false;
        let pos = event.getUILocation();
        this.joystick.children[0].setWorldPosition(v3(pos.x, pos.y));
    }

    TouchMove(event: EventTouch) {
        if (this.isStop) return;
        let pos = event.getUILocation();
        var joy = this.joystick.children[0];
        var basePos = this.joystick.getWorldPosition();
        var delta = v3(pos.x - basePos.x, pos.y - basePos.y, 0);
        var maxDis = this.joystick.getComponent(UITransform).width / 2;
        if (delta.length() > maxDis) {
            delta = delta.normalize().multiplyScalar(maxDis);
            joy.setPosition(delta);
        }
        else joy.setWorldPosition(v3(pos.x, pos.y));
    }

    TouchEnd() {
        this.joystick.children[0].setPosition(Vec3.ZERO);
    }

    Stop() {
        this.isStop = true;
        this.TouchEnd();
    }

    Use() {
        if (this.target) {
            let lock = this.target.getComponent(WGYQ_LockDog);
            if (lock) lock.Battle();
            let bow = this.target.getComponent(WGYQ_BowDog);
            if (bow) bow.GetDog();
            let dog = this.target.getComponent(WGYQ_Dog);
            if (dog) {
                if (dog.coinTime == 0) dog.GetCoin();
                else dog.Feed();
            }
        }
    }

}


