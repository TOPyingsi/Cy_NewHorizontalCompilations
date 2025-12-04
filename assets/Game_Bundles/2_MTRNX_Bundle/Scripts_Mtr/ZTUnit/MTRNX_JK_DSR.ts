import { _decorator, Animation, BoxCollider2D, CircleCollider2D, Collider2D, color, Contact2DType, IPhysics2DContact, Prefab, resources, RigidBody2D, Sprite, tween, v2, Vec2 } from 'cc';

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_Constant, MTRNX_GameMode } from '../Data/MTRNX_Constant';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_BloodLabel_Mtr } from '../UI/MTRNX_BloodLabel_Mtr';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_BloodBar_Mtr } from '../UI/MTRNX_BloodBar_Mtr';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_JK_DSR')
export class MTRNX_JK_DSR extends MTRNX_Unit {
    @property
    public Id: number = 17;//ID
    @property
    public IsHitFly: boolean = true;//受击是否被击飞
    @property
    public attack: number = 7;//攻击力
    @property
    public Hp: number = 100;//当前生命值
    @property
    public maxHp: number = 100;//最大生命值  
    @property
    public speedBase: number = 3;//基础速度
    @property
    skillCD: number = 2;
    skillCDTimer: number = 0;

    attackList: MTRNX_Unit[] = [];
    skillList: MTRNX_Unit[] = [];

    collider: Collider2D;
    attackTrigger: Collider2D;
    skillTrigger: Collider2D;//攻击范围触发器 

    canSkill = true;

    protected onLoad(): void {
        this._rigibody2D = this.node.getComponent(RigidBody2D);
        this._animation = this.node.getComponent(Animation);
        this.collider = this.node.getComponents(BoxCollider2D)[0];
        this.attackTrigger = this.node.getComponent(CircleCollider2D);
        this.skillTrigger = this.node.getComponents(BoxCollider2D)[1];

        this.collider.on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            var other = otherCollider.node;
            if (other.name == "地面" || other.name == "黑色") {
                if (this.attackList.length <= 0 && this.skillList.length <= 0 && this.State != 2) {
                    this.State = 0;//没有目标单位时前进
                }
            }

            if (this.IsEnemy) {
                //敌方单位进入我方单位基地
                if (otherCollider.node.name == "我方单位") {
                    MTRNX_GameManager.Instance.RedHP -= Math.ceil((MTRNX_Constant.MTTypePointCost[this.Id] / 100));
                    this.scheduleOnce(() => { this.node.destroy(); });
                    MTRNX_GameManager.Instance.ShakeWhite();
                }
            }
            else {
                //我方单位进入敌方单位基地
                if (otherCollider.node.name == "敌方单位") {
                    if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless) {
                        MTRNX_GameManager.Instance.Score += Math.floor(MTRNX_Constant.JKTypePointCost[this.Id] / 5);
                    } else {
                        MTRNX_GameManager.Instance.BlueHP -= Math.ceil((MTRNX_Constant.JKTypePointCost[this.Id] / 100));
                    }
                    this.scheduleOnce(() => { this.node.destroy(); });
                    MTRNX_GameManager.Instance.ShakeWhite();
                }
            }
        }, this);
        this.collider.on(Contact2DType.END_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
        }, this);


        this.attackTrigger.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.attackTrigger.on(Contact2DType.END_CONTACT, this.onEndContact, this);

        this.skillTrigger.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.skillTrigger.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    start(): void {
        if (this.IsEnemy) {
            this.forward = v2(-1, 0);
        }
        this.SpeedScale = 1;
        BundleManager.GetBundle("2_MTRNX_Bundle").load("Prefabs/UI/BloodBar", Prefab, (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            let blood = MTRNX_PoolManager.Instance.GetNode(res, this.node);
            blood.getComponent(MTRNX_BloodBar_Mtr).Init();
        })
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.State == 2) return;

        var other = otherCollider.node;

        if (other.getComponent(MTRNX_Unit)) {
            var otherUnit = other.getComponent(MTRNX_Unit);

            if (otherUnit.IsEnemy == this.IsEnemy || otherCollider.tag != 0) return;

            var num = this.skillList.indexOf(otherUnit);
            if (selfCollider == this.skillTrigger && num == -1) this.skillList.push(otherUnit);

            var num = this.attackList.indexOf(otherUnit);
            if (selfCollider == this.attackTrigger && num == -1) this.attackList.push(otherUnit);

            this.Attack();
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.State == 2) return;

        var other = otherCollider.node;
        if (other.getComponent(MTRNX_Unit)) {
            var otherUnit = other.getComponent(MTRNX_Unit);
            if (otherUnit.IsEnemy == this.IsEnemy) return;

            var num = this.attackList.indexOf(otherUnit);
            if (selfCollider == this.skillTrigger && num != -1) this.skillList.splice(num, 1);

            var num = this.attackList.indexOf(otherUnit);
            if (selfCollider == this.attackTrigger && num != -1) this.attackList.splice(num, 1);
        }
    }

    Attack(): void {
        if (this.State == 2) return;

        if (this._animation.getState("skill").isPlaying || this._animation.getState("attack").isPlaying) return;

        this.CleanTarget();

        if (this.attackList.length == 0 && this.skillList.length > 0 && this.canSkill) {
            this.canSkill = false;
            this.skillCDTimer = this.skillCD;
            this.State = 1;
            this._animation.play("skill");
            return;
        }

        if (this.attackList.length > 0) {
            this.State = 1;
            this._animation.play("attack");
            return;
        }

        this.State = 0;
    }

    SkillCD() {
        this.skillCDTimer -= 1;
        if (this.skillCDTimer <= 0) {
            this.unschedule(this.SkillCD);
            this.skillCDTimer = 0;
            this.State = 1;
        }
    }

    Die(): void {
        this.State = 2;
        if (this.IsEnemy) MTRNX_GameManager.Instance.haveHero = false;
        MTRNX_PoolManager.Instance.PutNode(this.node.getChildByName("BloodBar"));
        this.collider.enabled = false;
        this.collider.enabled = true;
        //这里只是播放攻击动画
        if (!this._animation?.getState("dead").isPlaying) {
            this._animation?.play("dead");
        }
        if (this.IsEnemy) MTRNX_AudioManager.AudioClipPlay("马桶死亡");
    }

    CleanTarget() {
        this.attackList = this.attackList.filter(e => e && e.Hp > 0);
        this.skillList = this.skillList.filter(e => e && e.Hp > 0);

        if (!this.canSkill && this.skillCDTimer <= 0 && this.attackList.length == 0 && this.skillList.length > 0) {
            this.canSkill = true;
        }
    }

    // #region  动画帧事件

    AttackEnd() {
        if (this.State == 2) return;
        this.State = 1;
    }

    SkillStart() {
        if (this.State == 2) return;
        this.State == 1;
        var light = this.node.getChildByName("光");
        light.active = true;
        var _animation = light.getComponent(Animation);
        _animation.stop();
        _animation.play();
    }

    SkillEnd() {
        if (this.State == 2) return;
        this.schedule(this.SkillCD, 1);
        this.State = 1;
    }

    Hit(num1: number) {
        if (this._animation.getState("attack")?.isPlaying || this._animation.getState("move")?.isPlaying) {
            if (this.attackList.length > 0) {
                this.attackList[0].Hurt(num1);
            }
        }
        else if (this._animation.getState("skill")?.isPlaying || this.node.getChildByName("光").active) {
            for (let i = 0; i < this.skillList.length; i++) {
                this.skillList[i].Trapped(0.075);
                this.skillList[i].Hurt(num1);
            }
        }
        // AudioManager.AudioClipPlay("刺啦");
    }

    //#endregion

}