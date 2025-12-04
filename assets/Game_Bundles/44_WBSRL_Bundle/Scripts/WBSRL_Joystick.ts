import { _decorator, Component, director, Event, EventKeyboard, EventTouch, Input, input, KeyCode, macro, Node, Touch, UITransform, v2, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum KEYCODE {
    A,
    D,
    W,
    S,
}

@ccclass('WBSRL_Joystick')
export class WBSRL_Joystick extends Component {
    public static Instance: WBSRL_Joystick = null;

    private _joystickBase: Node = null;
    private _joystickDot: Node = null;
    private _attack: Node = null;
    private _attackDot: Node = null;
    private _movementTouch: Touch = null;
    private _cameraMovementTouch: Touch = null;
    private _load: Node = null;
    private _fire: Node = null;
    private _joystickBaseNormalPos: Vec3 = Vec3.ZERO;

    private _cameraPrePos: Vec2 = new Vec2();

    private _interact: Node = null;
    private _exit: Node = null;
    private _cbStart: Function = null;
    private _cbEnd: Function = null;

    private joystickArea: Node = null;
    private cameraArea: Node = null;

    protected onLoad(): void {
        WBSRL_Joystick.Instance = this;

        this.joystickArea = this.node.getChildByName(`JoystickArea`);
        this.joystickArea.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.joystickArea.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.joystickArea.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.joystickArea.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

        this._joystickBase = this.node.getChildByName('JoystickBase');
        this._joystickDot = this._joystickBase.getChildByName('JoystickDot');
        this._joystickBaseNormalPos = this._joystickBase.getPosition().clone();

        this.cameraArea = this.node.getChildByName(`CameraArea`);
        this.cameraArea.on(Node.EventType.TOUCH_START, this.OnCameraTouchStart, this);
        this.cameraArea.on(Node.EventType.TOUCH_MOVE, this.OnCameraTouchMove, this);

        this._interact = this.node.getChildByName("交互按钮");
        this._interact.on(Node.EventType.TOUCH_END, this.OnInteractTouchEnd, this);

        this._exit = this.node.getChildByName("退出");
        this._exit.on(Node.EventType.TOUCH_END, this.OnExitTouchEnd, this);

        // this._attack = this.node.getChildByName(`Attack`);
        // this._attackDot = this._attack.getChildByName(`AttackDot`);

        // this._attack.on(Node.EventType.TOUCH_START, this.OnAttackTouchStart, this);
        // this._attack.on(Node.EventType.TOUCH_MOVE, this.OnAttackTouchMove, this);
        // this._attack.on(Node.EventType.TOUCH_END, this.OnAttackTouchEnd, this);
        // this._attack.on(Node.EventType.TOUCH_CANCEL, this.OnAttackTouchEnd, this);

        // this._load = this.node.getChildByName("跳跃");
        // this._load.on(Node.EventType.TOUCH_END, this.onReloadTouchEnd, this);
    }

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }


    OnTouchStart(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            let x = touch.getUILocationX();
            let y = touch.getUILocationY();


            if (!this._movementTouch) {
                this._joystickBase.setPosition(x - this.node.getComponent(UITransform).width / 2, y - this.node.getComponent(UITransform).height / 2, 0);
                this._joystickDot.setPosition(0, 0, 0);
                this._movementTouch = touch;
            }
        }
    }

    OnTouchMove(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouch && touch.getID() == this._movementTouch.getID()) {
                let x = touch.getUILocationX();
                let y = touch.getUILocationY();

                let pos = this._joystickBase.position;

                let ox = x - this.node.getComponent(UITransform).width / 2 - pos.x;
                let oy = y - this.node.getComponent(UITransform).height / 2 - pos.y;

                let len = Math.sqrt(ox * ox + oy * oy);
                if (len <= 0) {
                    return;
                }

                let dirX = ox / len;
                let dirY = oy / len;
                let radius = this._joystickBase.getComponent(UITransform).width / 2;
                if (len > radius) {
                    len = radius;
                    ox = dirX * radius;
                    oy = dirY * radius;
                }
                this._joystickDot.setPosition(ox, oy, 0);
                // SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_MOVEMENT, dirX, dirY, len / radius);
                director.getScene().emit("WBHRL_Move", dirX, dirY, len / radius);
            }
        }
    }

    OnTouchEnd(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouch && touch.getID() == this._movementTouch.getID()) {
                // EventManager.Scene.emit(MyEvent.MOVEMENT_STOP);
                director.getScene().emit("WBHRL_Move", 0, 0, 0);
                // SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_MOVEMENT, 0, 0, 0);
                this._movementTouch = null;
                this._joystickBase.setPosition(this._joystickBaseNormalPos);
                this._joystickDot.setPosition(Vec3.ZERO);
            }
        }
    }


    private lastLocation: Vec2 = v2(0, 0);
    private CameraTouchID: number = 0;
    OnCameraTouchStart(event: EventTouch) {
        this.lastLocation.set(event.getLocation());
        this.CameraTouchID = event.getID();
        // let touches = event.getTouches();
        // for (let i = 0; i < touches.length; ++i) {
        //     let touch = touches[i];
        //     let x = touch.getUILocationX();
        //     let y = touch.getUILocationY();
        //     if (!this._cameraMovementTouch) {
        //         this._cameraMovementTouch = touch;
        //         this._cameraPrePos = touch.getUILocation();
        //     }
        // }
    }
    private dis: Vec2 = v2(0, 0);
    OnCameraTouchMove(event: EventTouch) {
        if (event.getID() != this.CameraTouchID) return;
        Vec2.subtract(this.dis, event.getLocation(), this.lastLocation);
        let rx = this.dis.y * 0.025;
        let ry = -this.dis.x * 0.025;

        director.getScene().emit("WBSRL_CameraPlayer", rx, ry);//相机旋转

        this.lastLocation.set(event.getLocation());
        // let touches = event.getTouches();

        // for (let i = 0; i < touches.length; ++i) {
        //     let touch = touches[i];
        //     if (this._cameraMovementTouch && touch.getID() == this._cameraMovementTouch.getID()) {
        //         let x = touch.getUILocationX();
        //         let y = touch.getUILocationY();

        //         let ox = x - this._cameraPrePos.x;
        //         let oy = y - this._cameraPrePos.y;

        //         let len = Math.sqrt(ox * ox + oy * oy);
        //         if (len <= 0) {
        //             return;
        //         }
        //         let dirX = ox / len;
        //         let dirY = oy / len;
        //         director.getScene().emit("WBSRL_CameraPlayer", dirX, dirY);
        //         this._cameraPrePos = touch.getUILocation();
        //     }
        // }
    }

    onReloadTouchEnd(event: EventTouch) {
        // SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_JUMP);
        // director.getScene().emit("HJMWK_Jump");
    }



    // OnCameraTouchStart(event: EventTouch) {
    //     let touches = event.getTouches();
    //     for (let i = 0; i < touches.length; ++i) {
    //         let touch = touches[i];
    //         let x = touch.getUILocationX();
    //         let y = touch.getUILocationY();
    //         if (!this._cameraMovementTouch) {
    //             this._cameraMovementTouch = touch;
    //             this._cameraPrePos = touch.getUILocation();
    //         }
    //     }
    // }

    // OnCameraTouchMove(event: EventTouch) {
    //     let touches = event.getTouches();

    //     for (let i = 0; i < touches.length; ++i) {
    //         let touch = touches[i];
    //         if (this._cameraMovementTouch && touch.getID() == this._cameraMovementTouch.getID()) {
    //             let x = touch.getUILocationX();
    //             let y = touch.getUILocationY();

    //             let ox = x - this._cameraPrePos.x;
    //             let oy = y - this._cameraPrePos.y;

    //             let len = Math.sqrt(ox * ox + oy * oy);
    //             if (len <= 0) {
    //                 return;
    //             }
    //             let dirX = ox / len;
    //             let dirY = oy / len;
    //             director.getScene().emit("WBSRL_CameraPlayer", dirX, dirY);
    //             this._cameraPrePos = touch.getUILocation();
    //         }
    //     }
    // }

    // onReloadTouchEnd(event: EventTouch) {
    //     // SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_JUMP);
    //     // director.getScene().emit("HJMWK_Jump");
    // }

    // onFireTouchStart(event: EventTouch) {
    //     // EventManager.Scene.emit(MyEvent.ATTACKSTART);
    // }

    // onFireTouchEnd(event: EventTouch) {
    //     EventManager.Scene.emit(MyEvent.ATTACKEND);
    // }

    //#region 键盘控制

    private _dir: Vec2 = new Vec2(0, 0);

    ArrRowKeyCode: KEYCODE[] = [];
    ArrCloKeyCode: KEYCODE[] = [];

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.pushKeyCode(this.ArrRowKeyCode, KEYCODE.A);
                break;
            case KeyCode.KEY_D:
                this.pushKeyCode(this.ArrRowKeyCode, KEYCODE.D);
                break;
            case KeyCode.KEY_W:
                this.pushKeyCode(this.ArrCloKeyCode, KEYCODE.W);
                break;
            case KeyCode.KEY_S:
                this.pushKeyCode(this.ArrCloKeyCode, KEYCODE.S);
                break;
            case KeyCode.SPACE:
                // SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_JUMP);
                return;
        }
        this.updateDir();
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.removeKeyCode(this.ArrRowKeyCode, KEYCODE.A);
                break;
            case KeyCode.KEY_D:
                this.removeKeyCode(this.ArrRowKeyCode, KEYCODE.D);
                break;
            case KeyCode.KEY_W:
                this.removeKeyCode(this.ArrCloKeyCode, KEYCODE.W);
                break;
            case KeyCode.KEY_S:
                this.removeKeyCode(this.ArrCloKeyCode, KEYCODE.S);
                break;
            case KeyCode.SPACE:
                // director.getScene().emit("HJMWK_Jump");
                return
        }
        this.updateDir();
    }

    pushKeyCode(arrKeyCode: KEYCODE[], keyCode: KEYCODE) {
        if (arrKeyCode.findIndex(e => e == keyCode) == -1) {
            arrKeyCode.push(keyCode);
        }
    }

    removeKeyCode(arrKeyCode: KEYCODE[], keyCode: KEYCODE) {
        const index: number = arrKeyCode.findIndex(e => e == keyCode);
        if (index != -1) {
            arrKeyCode.splice(index, 1);
        }
    }

    getKeyCode(arrKeyCode: KEYCODE[]) {
        if (arrKeyCode.length == 0) return -1;
        return arrKeyCode[arrKeyCode.length - 1];
    }

    updateDir() {
        const row = this.getKeyCode(this.ArrRowKeyCode);
        if (row == KEYCODE.A) {
            this._dir.x = -1;
        } else if (row == KEYCODE.D) {
            this._dir.x = 1;
        } else {
            this._dir.x = 0;
        }
        const col = this.getKeyCode(this.ArrCloKeyCode);
        if (col == KEYCODE.S) {
            this._dir.y = -1;
        } else if (col == KEYCODE.W) {
            this._dir.y = 1;
        } else {
            this._dir.y = 0;
        }
        director.getScene().emit("WBHRL_Move", this._dir.x, this._dir.y, 1);
        // director.getScene().emit("HJMWK_Move", this._dir.x, 1);
        // SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_MOVEMENT, this._dir.x, this._dir.y, 1.0);
    }
    //#endregion

    //#region 交互

    OnInteractTouchEnd(event: EventTouch) {
        this.ShowInteractButton(false);
        this._cbStart && this._cbStart();
    }

    addInteract(cb1: Function = null, cb2: Function = null) {
        this._interact.active = true;
        this._cbStart = cb1;
        this._cbEnd = cb2;
    }

    reomveInteract() {
        this._interact.active = false;
        this.Close();
        this._cbStart = null;
    }

    OnExitTouchEnd(event: EventTouch) {
        this.ShowExitButton(false);
        this._cbEnd && this._cbEnd();
    }

    ShowInteractButton(isShow: boolean) {
        this._interact.active = isShow;
        this._joystickBase.active = isShow;
    }

    ShowExitButton(isShow: boolean) {
        this._exit.active = isShow;
    }

    OpenDoor() {
        this.cameraArea.active = false;
        this.joystickArea.active = false;
    }

    CloseDoor() {
        this.cameraArea.active = true;
        this.joystickArea.active = true;
    }

    Close() {
        director.getScene().emit("WBHRL_Move", 0, 0, 0);
        this._movementTouch = null;
        this._joystickBase.setPosition(this._joystickBaseNormalPos);
        this._joystickDot.setPosition(Vec3.ZERO);
        // this._joystickBase.active = false;
    }
}