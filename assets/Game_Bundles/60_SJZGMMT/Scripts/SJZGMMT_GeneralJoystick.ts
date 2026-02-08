import { _decorator, Component, EventTouch, Input, input, Node, Touch, UITransform, v3, Vec3 } from 'cc';
import { EventManager } from '../../../Scripts/Framework/Managers/EventManager';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_GeneralJoystick')
export class SJZGMMT_GeneralJoystick extends Component {
    @property()
    Name: string = "";//摇杆唯一标识符
    private _joystickBase: Node | null = null;
    private _joystickDot: Node | null = null;

    private _movementTouch: Touch = null;
    private _joystickBasePos: Vec3 = v3();
    protected onLoad(): void {
        let joystickArea = this.node.getChildByName(`JoystickArea`);
        joystickArea.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        joystickArea.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        joystickArea.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        joystickArea.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

        this._joystickBase = this.node.getChildByName('JoystickBase');
        this._joystickDot = this._joystickBase.getChildByName('JoystickDot');
        this._joystickBasePos = this._joystickBase.position.clone();

    }
    private _UItransform: UITransform = null;
    start() {
        this._UItransform = this.node.getComponent(UITransform);
    }

    OnTouchStart(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            let x = touch.getUILocationX();
            let y = touch.getUILocationY();
            if (!this._movementTouch) {
                this._joystickBase.setPosition(x - this._UItransform.width / 2, y - this._UItransform.height / 2, 0);
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
                let ox = x - this._UItransform.width / 2 - pos.x;
                let oy = y - this._UItransform.height / 2 - pos.y;

                EventManager.Scene.emit(SJZGMMT_EventManager.通用摇杆移动未归一化, this.Name, v3(ox, oy, 0));
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

                // // degree 0 ~ 360 based on x axis.
                // let degree = Math.atan(dirY / dirX) / Math.PI * 180;
                // if (dirX < 0) {
                //     degree += 180;
                // }
                // else {
                //     degree += 360;
                // }

                EventManager.Scene.emit(SJZGMMT_EventManager.通用摇杆移动, this.Name, v3(dirX, dirY, len / radius));
            }
        }
    }

    OnTouchEnd(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouch && touch.getID() == this._movementTouch.getID()) {
                EventManager.Scene.emit(SJZGMMT_EventManager.通用摇杆停止, this.Name);
                this._movementTouch = null;
                this._joystickDot.setPosition(Vec3.ZERO);
                this._joystickBase.setPosition(this._joystickBasePos.clone());
            }
        }
    }





}


