import { _decorator, BoxCollider2D, CircleCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, Prefab, tween, v3, Vec3 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_CiKeYinXiangRen')
export class MTRNX_CiKeYinXiangRen extends MTRNX_Unit {
    public Id: number = 13;//ID
    public IsHitFly: boolean = true;//受击是否被击飞

    public attack: number = 150;//攻击力
    public Hp: number = 600;//当前生命值
    public maxHp: number = 600;//最大生命值
    public speedBase: number = 4;//基础速度


    targetPos: Vec3 = v3();
    selfpos: Vec3 = v3();
    len: number = 0;
    SkillTargets: Node[] = [];
    start(): void {
        super.start();
        this.node.getComponents(CircleCollider2D)[1].on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            if (otherCollider.node.getComponent(MTRNX_Unit) && this.IsEnemy != otherCollider.node.getComponent(MTRNX_Unit).IsEnemy
                && otherCollider.node.getComponent(MTRNX_Unit).State != 2 && this.SkillTargets.indexOf(otherCollider.node) == -1) {//检测单位是否为敌方且检测单位为非死亡状态
                this.SkillTargets.push(otherCollider.node);
            }
        })
        this.node.getComponents(CircleCollider2D)[1].on(Contact2DType.END_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            if (otherCollider.node.getComponent(MTRNX_Unit) && this.IsEnemy != otherCollider.node.getComponent(MTRNX_Unit).IsEnemy && this.SkillTargets.indexOf(otherCollider.node) != -1) {
                this.SkillTargets.splice(this.SkillTargets.indexOf(otherCollider.node), 1);
            }
        })
    }

    ToFaceAttack() {//突脸进攻
        if (this.TargetNodes.length > 0) {
            this.targetPos = this.TargetNodes[0].getWorldPosition();
            this.selfpos = this.node.getWorldPosition();
            this.len = this.TargetNodes[0].getWorldPosition().subtract(this.node.getWorldPosition()).length();
            if (this.targetPos.x - this.selfpos.x < 0) {
                this.len = -this.len;
            }
            tween(this.node)
                .to(0.2, { worldPosition: v3(this.selfpos.x + this.len / 2, this.selfpos.y + 150) })
                .to(0.2, { worldPosition: v3(this.targetPos.x, this.targetPos.y) })
                .start()
        }
    }

    Attackincident() {
        if (this.SkillTargets.length > 0) {
            MTRNX_AudioManager.AudioClipPlay("刀攻击");
            this.SkillTargets[0].getComponent(MTRNX_Unit).Hurt(this.attack);
        }
        this.ChangeUnitScale();
    }
}


