import { _decorator, Component, director, EventKeyboard, EventTouch, Input, input, KeyCode, Node, UI, UITransform, v2, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_JoyStick')
export class XYMJDWY_JoyStick extends Component {

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

        // 键盘事件监听
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

    }

    update(deltaTime: number) {
        if (this.keyboardDir.length() > 0) {
            // console.log(1111);
            // 如果有键盘输入，则使用键盘方向
            this._dir = this.keyboardDir.clone().normalize();
            director.getScene().emit("校园摸金_开始移动", this._dir.multiplyScalar(80));
        }
    }

    keyboardDir: Vec3 = v3(0, 0, 0);
    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.keyboardDir.y = 1;
                break;
            case KeyCode.KEY_S:
                this.keyboardDir.y = -1;
                break;
            case KeyCode.KEY_A:
                this.keyboardDir.x = -1;
                break;
            case KeyCode.KEY_D:
                this.keyboardDir.x = 1;
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
        this.JoyStickHandle.worldPosition = this.JoySrickCenter;
        director.getScene().emit("校园摸金_停止移动");
    }

    onTouchStart(event: EventTouch) {

        this.keyboardDir.set(0, 0, 0);

        let touchPos = v3(event.getUILocation().x, event.getUILocation().y);

        this.JoyStickHandle.worldPosition = touchPos;

        let distance = touchPos.clone().subtract(this.JoyStickBg.node.worldPosition);

        let maxLength = this.JoyStickBg.width / 2;

        this._dir = distance.clone().normalize();

        let offset = this._dir.multiplyScalar(maxLength);

        director.getScene().emit("校园摸金_开始移动", this._dir);

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

        director.getScene().emit("校园摸金_开始移动", this._dir);

    }

    onTouchEnd(event: EventTouch) {

        this.JoyStickHandle.worldPosition = this.JoySrickCenter;

        director.getScene().emit("校园摸金_停止移动");
    }
}


