import { _decorator, Component, Node, RigidBody2D, tween, v2, v3, Vec2 } from 'cc';
import { ATZJ_EasyController, ATZJ_EasyControllerEvent } from './ATZJ_EasyController';
import { ATZJ_Unit } from './ATZJ_Unit';
import { ATZJ_GameManager } from './ATZJ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_PlayerControl')
export class ATZJ_PlayerControl extends Component {
    private Unit: ATZJ_Unit = null;
    start() {
        this.Unit = this.node.getComponent(ATZJ_Unit);
        ATZJ_EasyController.on(ATZJ_EasyControllerEvent.MOVEMENT, this.onMovement, this);
        ATZJ_EasyController.on(ATZJ_EasyControllerEvent.MOVEMENT_STOP, this.onMovementRelease, this);
        ATZJ_EasyController.on(ATZJ_EasyControllerEvent.ATTACK, this.ONAttack, this);
        ATZJ_EasyController.on(ATZJ_EasyControllerEvent.SKILL, this.Skill, this);
        ATZJ_EasyController.on(ATZJ_EasyControllerEvent.TongLing, this.TongLing, this);
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
        this.Unit.TongLing(ATZJ_GameManager.SkillData[ATZJ_GameManager.PlayerID]);
    }
    //位移
    displacement(pos: Vec2, time: number) {
        tween(this.node)
            .by(time, { position: v3(pos.x, pos.y) })
            .start();
    }
}


