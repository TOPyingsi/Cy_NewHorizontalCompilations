import { _decorator, Component, director, EventKeyboard, EventTouch, Input, input, KeyCode, Node, Touch, UITransform, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TCS3D_JoyStick')
export class TCS3D_JoyStick extends Component {

    private _cameraArea: UITransform = null;
    private _movementTouch: Touch = null;

    private _joyCenter: Vec3 = new Vec3();
    private joyBg: UITransform = null;
    private joyHandle: Node = null;

    start(): void {

        this.joyBg = this.node.getChildByName("JoyStickBg").getComponent(UITransform);

        this.joyHandle = this.node.getChildByName("JoyStickHandle");

        this._cameraArea = this.node.getChildByName("CameraArea").getComponent(UITransform);

        this._joyCenter = this.joyBg.node.worldPosition.clone();

        this.joyBg.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);

        this.joyBg.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        this.joyBg.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        this.joyBg.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    _dir: Vec3 = v3(0, 0, 0);
    update(deltaTime: number) {
        if (this.keyboardDir.length() > 0) {
            // 如果有键盘输入，则使用键盘方向
            this._dir = this.keyboardDir.clone().normalize();
            director.getScene().emit("贪吃蛇3D_开始移动", this._dir.multiplyScalar(80));
        }
    }

    keyboardDir: Vec3 = v3(0, 0, 0);
    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.keyboardDir.y = 1;
                break;
            case KeyCode.KEY_A:
                this.keyboardDir.x = -1;
                break;
            case KeyCode.KEY_S:
                this.keyboardDir.y = -1;
                break;
            case KeyCode.KEY_D:
                this.keyboardDir.x = 1;
                break;
            case KeyCode.SPACE:
                director.getScene().emit("贪吃蛇3D_开始跳跃");
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.KEY_S:
                this.keyboardDir.y = 0;
                break;
            case KeyCode.KEY_A:
            case KeyCode.KEY_D:
                this.keyboardDir.x = 0;
                break;
        }

        // 如果没有按键按下，停止移动
        if (this.keyboardDir.length() === 0) {
            this.onKeyboardStop();
        }
    }

    onKeyboardStop() {
        // 键盘停止时重置摇杆位置
        this.joyHandle.worldPosition = this._joyCenter;
        director.getScene().emit("贪吃蛇3D_停止移动");
    }

    onTouchStart(event: EventTouch) {
        let touchPos = v3(event.getUILocation().x, event.getUILocation().y);

        this.joyHandle.worldPosition = touchPos;

    }

    onTouchMove(event: EventTouch) {

        let touchPos = v3(event.getUILocation().x, event.getUILocation().y);
        let radius: number = this.joyBg.width / 2;

        let distance = touchPos.subtract(this._joyCenter.clone());

        let length = distance.clone().length();

        let dir = distance.clone().normalize();

        if (length < radius) {
            this.joyHandle.position = touchPos;
        }
        else {
            this.joyHandle.position = dir.multiplyScalar(radius);
        }

        director.getScene().emit("贪吃蛇3D_开始移动", dir);
    }

    onTouchEnd(event: EventTouch) {
        this.joyHandle.worldPosition = this._joyCenter;
        director.getScene().emit("贪吃蛇3D_停止移动");
    }

    // protected onDestroy(): void {
    //     this.joyBg.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);

    //     this.joyBg.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

    //     this.joyBg.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);

    //     this.joyBg.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    // }
}


