import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, v2, v3 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_WuShuangZhanShen2')
export class MTRNX_WuShuangZhanShen2 extends MTRNX_Unit {
    public Id: number = 24;//ID
    public IsEnemy: boolean = false;//是否为敌人
    public IsHitFly: boolean = false;//受击是否被击飞
    public IsFlyUnit: boolean = true;//是否为飞行单位
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 50;//攻击力
    public Hp: number = 500;//当前生命值
    public maxHp: number = 500;//最大生命值
    public speedBase: number = 6;//基础速度
    start() {
        this.node.getChildByName("攻击区域").getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            if (otherCollider.node.getComponent(MTRNX_Unit) && this.IsEnemy != otherCollider.node.getComponent(MTRNX_Unit).IsEnemy
                && otherCollider.node.getComponent(MTRNX_Unit).State != 2) {//检测单位是否为敌方且检测单位为非死亡状态
                otherCollider.node.getComponent(MTRNX_Unit).Hurt(this.attack);
            }
        })

        super.start();
        this.node.setPosition(this.node.position.clone().add(v3(0, 100, 0)));
    }
    Move(deltaTime: number) {
        this.forward = v2(1, 0);
        this.SpeedScale = 1;
        super.Move(deltaTime);
    }
    Attackincident() {
        MTRNX_AudioManager.AudioClipPlay("普通监控召唤");
        this.SpeedScale = 15;
        this.node.getChildByName("攻击区域").setPosition(260, -80, 0);
        this.node.getChildByName("攻击区域").active = true;
        this.scheduleOnce(() => {
            this.node.getChildByName("攻击区域").active = false;
        }, 0.1)
        if (this.TargetNodes.length > 0) {
            if (this.TargetNodes[0].getWorldPosition().x > this.node.getWorldPosition().x) {
                this._rigibody2D.linearVelocity = v2(70, 0);
            } else {
                this._rigibody2D.linearVelocity = v2(-70, 0);
            }
        }
        this.ChangeUnitScale();
    }
    AttackOver() {
        this.Move(0);
        super.AttackOver();
    }
}


