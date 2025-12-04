import { _decorator, Component, Event, EventKeyboard, EventTouch, Input, input, KeyCode, macro, Node, Touch, UITransform, v2, Vec2, Vec3 } from 'cc';
import { SJNDGZ_EventManager, SJNDGZ_MyEvent } from './SJNDGZ_EventManager';

const { ccclass, property } = _decorator;

export enum KEYCODE {
    A,
    D,
    W,
    S,
}

export enum DIR {
    ROW,
    COL,
}


@ccclass('Joystick')
export class Joystick extends Component {
    private _joystickBase: Node = null;
    private _joystickDot: Node = null;
    private _attack: Node = null;
    private _attackDot: Node = null;
    private _movementTouch: Touch = null;
    private _attackMovementTouch: Touch = null;
    private _load: Node = null;
    private _fire: Node = null;
    private _joystickBaseNormalPos: Vec3 = Vec3.ZERO;

    protected onLoad(): void {
        let joystickArea = this.node.getChildByName(`JoystickArea`);
        joystickArea.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        joystickArea.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        joystickArea.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        joystickArea.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

        this._joystickBase = this.node.getChildByName('JoystickBase');
        this._joystickDot = this._joystickBase.getChildByName('JoystickDot');
        this._joystickBaseNormalPos = this._joystickBase.getPosition().clone();

        this._attack = this.node.getChildByName(`Attack`);
        this._attackDot = this._attack.getChildByName(`AttackDot`);

        this._attack.on(Node.EventType.TOUCH_START, this.OnAttackTouchStart, this);
        this._attack.on(Node.EventType.TOUCH_MOVE, this.OnAttackTouchMove, this);
        this._attack.on(Node.EventType.TOUCH_END, this.OnAttackTouchEnd, this);
        this._attack.on(Node.EventType.TOUCH_CANCEL, this.OnAttackTouchEnd, this);

        this._load = this.node.getChildByName("跳跃");
        this._load.on(Node.EventType.TOUCH_END, this.onReloadTouchEnd, this);

        // this._fire = this.node.getChildByName("射击");
        // this._fire.on(Node.EventType.TOUCH_START, this.onFireTouchStart, this);
        // this._fire.on(Node.EventType.TOUCH_END, this.onFireTouchEnd, this);
        // this._fire.on(Node.EventType.TOUCH_CANCEL, this.onFireTouchEnd, this);

    }

    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    offX = 0;
    offY = 0;

    onDestroy() { }

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
                SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_MOVEMENT, dirX, dirY, len / radius);
            }
        }
    }

    OnTouchEnd(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouch && touch.getID() == this._movementTouch.getID()) {
                // EventManager.Scene.emit(MyEvent.MOVEMENT_STOP);
                SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_MOVEMENT, 0, 0, 0);
                this._movementTouch = null;
                this._joystickBase.setPosition(this._joystickBaseNormalPos);
                this._joystickDot.setPosition(Vec3.ZERO);
            }
        }
    }

    OnAttackTouchStart(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            let x = touch.getUILocationX();
            let y = touch.getUILocationY();
            if (!this._attackMovementTouch) {
                // this._joystickBase.setPosition(x - this.node.width / 2, y - this.node.height / 2, 0);
                this._attackDot.setPosition(0, 0, 0);
                this._attackMovementTouch = touch;
            }
        }
    }

    OnAttackTouchMove(event: EventTouch) {
        let touches = event.getTouches();

        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._attackMovementTouch && touch.getID() == this._attackMovementTouch.getID()) {
                let x = touch.getUILocationX();
                let y = touch.getUILocationY();

                let pos = this._attack.position;
                let ox = x - this.node.getComponent(UITransform).width / 2 - pos.x;
                let oy = y - this.node.getComponent(UITransform).height / 2 - pos.y;

                let len = Math.sqrt(ox * ox + oy * oy);
                if (len <= 0) {
                    return;
                }

                let dirX = ox / len;
                let dirY = oy / len;
                let radius = this._attack.getComponent(UITransform).width / 2;
                if (len > radius) {
                    len = radius;
                    ox = dirX * radius;
                    oy = dirY * radius;
                }

                this._attackDot.setPosition(ox, oy, 0);
                SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_ATTACK_START, dirX, dirY);
            }
        }
    }

    OnAttackTouchEnd(event: EventTouch) {
        let touches = event.getTouches();
        // EventManager.Scene.emit(MyEvent.Stop_Fire);
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._attackMovementTouch && touch.getID() == this._attackMovementTouch.getID()) {
                this._attackMovementTouch = null;
                this._attackDot.setPosition(Vec3.ZERO);
                SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_ATTACK_END);
            }
        }
    }

    onReloadTouchEnd(event: EventTouch) {
        SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_JUMP);
    }

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
                SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_JUMP);
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
        this.offX = this._dir.x;
        this.offY = this._dir.y;
        SJNDGZ_EventManager.Scene.emit(SJNDGZ_MyEvent.SJNDGZ_MOVEMENT, this._dir.x, this._dir.y, 1.0);
    }
    //#endregion

}