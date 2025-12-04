import { _decorator, Component, Node, RigidBody2D, tween, v2, v3, Vec2 } from 'cc';
import { XSHY_EasyController, XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_Unit } from './XSHY_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHY_PlayerControl')
export class XSHY_PlayerControl extends Component {


    private Unit: XSHY_Unit = null;
    start() {
        this.Unit = this.node.getComponent(XSHY_Unit);
        XSHY_EasyController.on(XSHY_EasyControllerEvent.MOVEMENT, this.onMovement, this);
        XSHY_EasyController.on(XSHY_EasyControllerEvent.MOVEMENT_STOP, this.onMovementRelease, this);
        XSHY_EasyController.on(XSHY_EasyControllerEvent.ATTACK, this.ONAttack, this);
    }
    //拖动摇杆
    onMovement(degree: number, offset: number) {
        const radians = degree * Math.PI / 180;
        const direction = new Vec2(
            Math.sin(radians),  // y 分量
            Math.cos(radians)  // x 分量
        );
        direction.x = -direction.x;
        this.Unit.Move(direction);
    }
    //抬起摇杆
    onMovementRelease() {
        this.Unit.StopMove();

    }

    //按下攻击按键
    ONAttack() {
        this.Unit.AttackClick();
    }



    //位移
    displacement(pos: Vec2, time: number) {
        tween(this.node)
            .by(time, { position: v3(pos.x, pos.y) })
            .start();
    }
}


