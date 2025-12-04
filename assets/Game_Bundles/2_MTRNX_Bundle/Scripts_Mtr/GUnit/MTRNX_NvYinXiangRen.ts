import { _decorator, animation, Animation, BoxCollider2D, CircleCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, Prefab, tween, v2, v3, Vec3 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_Gbullet } from './MTRNX_Gbullet';
import { MTRNX_ResourceUtil } from '../Utils/MTRNX_ResourceUtil';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_NvYinXiangRen')
export class MTRNX_NvYinXiangRen extends MTRNX_Unit {
    public Id: number = 14;//ID
    public IsHitFly: boolean = true;//受击是否被击飞

    public attack: number = 100;//攻击力
    public Hp: number = 400;//当前生命值
    public maxHp: number = 400;//最大生命值
    public speedBase: number = 3.5;//基础速度


    targetPos: Vec3 = v3();
    selfpos: Vec3 = v3();
    len: number = 0;
    SkillTargets: Node[] = [];
    AttckNum: number = 0;//攻击段数

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

    Attack(): void {
        if (this.State == 2) return;
        if (this.AttckNum > 0) {
            //这里只是播放攻击动画
            if (!this._animation?.getState("attack").isPlaying) {
                this._animation?.play("attack");
                this._rigibody2D.linearVelocity = v2(0, this._rigibody2D.linearVelocity.y);
                this.ChangeUnitScale();
            }
        }
        else {
            //这里只是播放攻击动画
            if (!this._animation?.getState("attack2").isPlaying) {
                this._animation?.play("attack2");
                this._rigibody2D.linearVelocity = v2(0, this._rigibody2D.linearVelocity.y);
                this.ChangeUnitScale();
            }
        }
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
                .to(0.4, { worldPosition: v3(this.selfpos.x + this.len / 2, this.selfpos.y + 150) })
                .to(0.4, { worldPosition: v3(this.targetPos.x, this.targetPos.y) })
                .start()
        }
    }

    Attackincident() {
        this.ChangeUnitScale();
        if (this.AttckNum > 0) {
            if (this.SkillTargets.length > 0) {
                MTRNX_AudioManager.AudioClipPlay("刀攻击");
                this.SkillTargets[0].getComponent(MTRNX_Unit).Hurt(this.attack);
            }
        }
        else {
            if (this.TargetNodes.length > 0) {
                let targetPoint = v3(this.TargetNodes[0].getWorldPosition().x, this.TargetNodes[0].getWorldPosition().y + this.TargetNodes[0].getComponent(BoxCollider2D).size.height / 3);
                MTRNX_ResourceUtil.LoadPrefab("Bullet/GFlyKnife").then((prefab: Prefab) => {
                    let bullet: Node = MTRNX_PoolManager.Instance.GetNode(prefab, MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层"));
                    bullet.getComponentInChildren(Animation).play("animation");
                    bullet.setWorldPosition(v3(this.node.worldPosition.x + this.boxcollider.size.width / 4, this.node.worldPosition.y + this.boxcollider.size.height / 2));
                    bullet.getComponent(MTRNX_Gbullet).init(targetPoint, this.forward.clone(), this.attack / 2, 40, this.IsEnemy, true, 1, false, false);
                });
            }
        }
    }

    AttackOver(): void {
        super.AttackOver();
        this.AttckNum++;
        if (this.AttckNum >= 3) {
            this.AttckNum = 0;
        }
    }
}


