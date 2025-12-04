import { _decorator, Component, Node, Event, Vec2, SystemEvent, systemEvent, Touch, Vec3, v2, macro, UITransform, KeyCode, EventTarget, EventTouch, input, Input } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_Constant } from '../XGTS_Constant';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
const { ccclass, property } = _decorator;

@ccclass('XGTS_Joystick_double')
export class XGTS_Joystick_double extends Component {
    private _joystickBases: Node[] | null = [];
    private _joystickDots: Node[] | null = [];
    private _attack: Node | null = null;
    private _attackDot: Node | null = null;
    private _movementTouch: Touch = null;
    private _attackMovementTouch: Touch = null;

    private _movementTouches: (Touch | null)[] = [null, null]; // 分别存储玩家1和玩家2的触摸引用


    protected onLoad(): void {
        let joystickArea = NodeUtil.GetNode("JoystickArea_1", this.node);
        joystickArea.on(Node.EventType.TOUCH_START, this.OnTouchStart.bind(this, 1), this);
        joystickArea.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove.bind(this, 1), this);
        joystickArea.on(Node.EventType.TOUCH_END, this.OnTouchEnd.bind(this, 1), this);
        joystickArea.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd.bind(this, 1), this);


        let joystickArea2 = NodeUtil.GetNode("JoystickArea_2", this.node);
        joystickArea2.on(Node.EventType.TOUCH_START, this.OnTouchStart.bind(this, 2), this);
        joystickArea2.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove.bind(this, 2), this);
        joystickArea2.on(Node.EventType.TOUCH_END, this.OnTouchEnd.bind(this, 2), this);
        joystickArea2.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd.bind(this, 2), this);


        this._joystickBases = [NodeUtil.GetNode("JoystickBase_1", this.node),NodeUtil.GetNode("JoystickBase_2", this.node)];
        this._joystickDots = [this._joystickBases[0].getChildByName('JoystickDot'), this._joystickBases[1].getChildByName('JoystickDot')];

        this._attack = this.node.getChildByName(`Attack`);
        this._attackDot = this._attack.getChildByName(`AttackDot`);

        this._attack.on(Node.EventType.TOUCH_START, this.OnAttackTouchStart, this);
        this._attack.on(Node.EventType.TOUCH_MOVE, this.OnAttackTouchMove, this);
        this._attack.on(Node.EventType.TOUCH_END, this.OnAttackTouchEnd, this);
        this._attack.on(Node.EventType.TOUCH_CANCEL, this.OnAttackTouchEnd, this);

    }
    start() { }

    OnTouchStart( joystickNum: number,event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            let x = touch.getUILocationX();
            let y = touch.getUILocationY();
            if (!this._movementTouches[joystickNum - 1]) {
                // this._joystickBase.setPosition(x - this.node.width / 2, y - this.node.height / 2, 0);
                this._joystickDots[joystickNum - 1].setPosition(0, 0, 0);
                this._movementTouches[joystickNum - 1]  = touch;
            }
        }
    }
    OnTouchMove( joystickNum: number,event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouches[joystickNum - 1] && touch.getID() == this._movementTouches[joystickNum - 1].getID()) {
                let x = touch.getUILocationX();
                let y = touch.getUILocationY();

                let pos = this._joystickBases[joystickNum - 1].position;
                let ox = x - this.node.getComponent(UITransform).width / 2 - pos.x;
                let oy = y - this.node.getComponent(UITransform).height / 2 - pos.y;

                let len = Math.sqrt(ox * ox + oy * oy);
                if (len <= 0) {
                    return;
                }

                let dirX = ox / len;
                let dirY = oy / len;
                let radius = this._joystickBases[joystickNum - 1].getComponent(UITransform).width / 2;
                if (len > radius) {
                    len = radius;
                    ox = dirX * radius;
                    oy = dirY * radius;
                }

                this._joystickDots[joystickNum - 1].setPosition(ox, oy, 0);

                // // degree 0 ~ 360 based on x axis.
                // let degree = Math.atan(dirY / dirX) / Math.PI * 180;
                // if (dirX < 0) {
                //     degree += 180;
                // }
                // else {
                //     degree += 360;
                // }

                EventManager.Scene.emit(XGTS_Constant.Event.MOVEMENT + "_" + joystickNum, dirX, dirY, len / radius);
            }
        }
    }

    OnTouchEnd( joystickNum: number,event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouches[joystickNum - 1] && touch.getID() == this._movementTouches[joystickNum - 1].getID()) {
                EventManager.Scene.emit(XGTS_Constant.Event.MOVEMENT_STOP + "_" +  joystickNum);
                this._movementTouches[joystickNum - 1] = null;
                this._joystickDots[joystickNum - 1].setPosition(Vec3.ZERO);
            }
        }
    }

    OnAttackTouchStart(event: EventTouch) {
        let touches = event.getTouches();
        EventManager.Scene.emit(XGTS_Constant.Event.FIRE_START);

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
                EventManager.Scene.emit(XGTS_Constant.Event.SET_ATTACK_DIR, v2(dirX, dirY));
            }
        }
    }
    OnAttackTouchEnd(event: EventTouch) {
        let touches = event.getTouches();
        EventManager.Scene.emit(XGTS_Constant.Event.FIRE_STOP);

        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._attackMovementTouch && touch.getID() == this._attackMovementTouch.getID()) {
                this._attackMovementTouch = null;
                this._attackDot.setPosition(Vec3.ZERO);
            }
        }
    }

    protected onEnable(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    //#region 键盘控制
    private _keys = [];
    private _dir: Vec2 = new Vec2(0, 0);
    private _dir1: Vec2 = new Vec2(0, 0);
    private _dir2: Vec2 = new Vec2(0, 0);
    onKeyDown(event) {
        let keyCode = event.keyCode;
        if (keyCode == KeyCode.KEY_A || keyCode == KeyCode.KEY_S || keyCode == KeyCode.KEY_D || keyCode == KeyCode.KEY_W
            || keyCode == KeyCode.ARROW_LEFT || keyCode == KeyCode.ARROW_RIGHT || keyCode == KeyCode.ARROW_UP || keyCode == KeyCode.ARROW_DOWN
        ) {
            if (this._keys.indexOf(keyCode) == -1) {
                this._keys.push(keyCode);
                this.updateDirection();
            }
        }

        if (keyCode == keyCode.SPACE) {
            // EventManager.Scene.emit(MyEvent.JUMP);
        }
    }
    onKeyUp(event) {
        let keyCode = event.keyCode;
        if (keyCode == KeyCode.KEY_A || keyCode == KeyCode.KEY_S || keyCode == KeyCode.KEY_D || keyCode == KeyCode.KEY_W
            || keyCode == KeyCode.ARROW_LEFT || keyCode == KeyCode.ARROW_RIGHT || keyCode == KeyCode.ARROW_UP || keyCode == KeyCode.ARROW_DOWN
        ) {
            let index = this._keys.indexOf(keyCode);
            if (index != -1) {
                this._keys.splice(index, 1);
                switch (keyCode) {
                    case KeyCode.KEY_A:
                    case KeyCode.KEY_D: this._dir1.x = 0; break;
                    case KeyCode.KEY_W:
                    case KeyCode.KEY_S: this._dir1.y = 0; break;
                    case KeyCode.ARROW_LEFT:
                    case KeyCode.ARROW_RIGHT: this._dir2.x = 0; break;
                    case KeyCode.ARROW_UP:
                    case KeyCode.ARROW_DOWN: this._dir2.y = 0; break;
                }
                this.updateDirection();
            }
        }
    }
    updateDirection() {
        if (this._keys.some(e => e == KeyCode.KEY_A)) this._dir1.x = -1;
        if (this._keys.some(e => e == KeyCode.KEY_D)) this._dir1.x = 1;
        if (this._keys.some(e => e == KeyCode.KEY_W)) this._dir1.y = 1;
        if (this._keys.some(e => e == KeyCode.KEY_S)) this._dir1.y = -1;
        if (this._keys.some(e => e == KeyCode.ARROW_LEFT)) this._dir2.x = -1;
        if (this._keys.some(e => e == KeyCode.ARROW_RIGHT)) this._dir2.x = 1;
        if (this._keys.some(e => e == KeyCode.ARROW_UP)) this._dir2.y = 1;
        if (this._keys.some(e => e == KeyCode.ARROW_DOWN)) this._dir2.y = -1;

        EventManager.Scene.emit(XGTS_Constant.Event.MOVEMENT_1, this._dir1.x, this._dir1.y, 1.0);
        EventManager.Scene.emit(XGTS_Constant.Event.MOVEMENT_2, this._dir2.x, this._dir2.y, 1.0);
        
    }
    //#endregion
}