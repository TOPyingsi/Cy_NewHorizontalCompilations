import { _decorator, Component, director, EventTouch, Node, UI, UITransform, v2, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_ATKJoyStick')
export class XYMJDWY_ATKJoyStick extends Component {

    public JoyStickHandle: Node = null;
    public JoyStickBg: UITransform = null;

    private JoySrickCenter: Vec3 = null;

    private _dir: Vec3 = v3(0, 0, 0);
    start() {
        this.JoyStickBg = this.node.getChildByName("JoyStickBg").getComponent(UITransform);
        this.JoyStickHandle = this.node.getChildByName("JoyStickHandle");

        this.JoySrickCenter = this.JoyStickBg.node.worldPosition.clone();

        this.JoyStickBg.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.JoyStickBg.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.JoyStickBg.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.JoyStickBg.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    update(deltaTime: number) {

    }

    onTouchStart(event: EventTouch) {
        let touchPos = v3(event.getUILocation().x, event.getUILocation().y);

        this.JoyStickHandle.worldPosition = touchPos;

        let distance = touchPos.clone().subtract(this.JoyStickBg.node.worldPosition);

        let maxLength = this.JoyStickBg.width / 2;

        this._dir = distance.clone().normalize();

        let offset = this._dir.multiplyScalar(maxLength);

        director.getScene().emit("校园摸金_开始攻击", this._dir);

    }

    onTouchMove(event: EventTouch) {
        let touchPos = v3(event.getUILocation().x, event.getUILocation().y);

        let distance = touchPos.clone().subtract(this.JoyStickBg.node.worldPosition);

        let disLength = distance.clone().length();

        let maxLength = this.JoyStickBg.width / 2;

        this._dir = distance.clone().normalize();

        let offset = this._dir.multiplyScalar(maxLength);

        if (disLength < maxLength) {
            this.JoyStickHandle.worldPosition = touchPos;
        }
        else {
            this.JoyStickHandle.position = offset;
        }

        director.getScene().emit("校园摸金_开始攻击", this._dir);

    }

    onTouchEnd(event: EventTouch) {

        this.JoyStickHandle.worldPosition = this.JoySrickCenter;

        director.getScene().emit("校园摸金_停止攻击");
    }
}


