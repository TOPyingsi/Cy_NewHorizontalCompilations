import { _decorator, Component, Node, RigidBody2D, tween, v2, v3, Vec2 } from 'cc';
import { XSHZ_EasyController, XSHZ_EasyControllerEvent } from './XSHZ_EasyController';
import { XSHZ_Unit } from './XSHZ_Unit';
import { XSHZ_GameManager } from './XSHZ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_PlayerControl')
export class XSHZ_PlayerControl extends Component {
    private Unit: XSHZ_Unit = null;
    start() {
        this.Unit = this.node.getComponent(XSHZ_Unit);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.MOVEMENT, this.onMovement, this);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.MOVEMENT_STOP, this.onMovementRelease, this);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.ATTACK, this.ONAttack, this);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.SKILL, this.Skill, this);
        XSHZ_EasyController.on(XSHZ_EasyControllerEvent.TongLing, this.TongLing, this);
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
    //按下技能键
    Skill(num: number) {
        this.Unit.SkillClick(num);
    }
    //按下通灵键
    TongLing() {
        this.Unit.TongLing(XSHZ_GameManager.SkillData[XSHZ_GameManager.PlayerID]);
    }
    //位移
    displacement(pos: Vec2, time: number) {
        tween(this.node)
            .by(time, { position: v3(pos.x, pos.y) })
            .start();
    }
}


