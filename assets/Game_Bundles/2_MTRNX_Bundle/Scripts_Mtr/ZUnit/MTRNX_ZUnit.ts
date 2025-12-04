import { _decorator, Animation, BoxCollider2D, CircleCollider2D, Collider2D, Component, Contact2DType, director, Graphics, IPhysics2DContact, Label, Mask, Node, Prefab, resources, RigidBody2D, Sprite, tween, UITransform, v2, v3, Vec2 } from 'cc';

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_BloodBar_Mtr } from '../UI/MTRNX_BloodBar_Mtr';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_Constant, MTRNX_GameMode } from '../Data/MTRNX_Constant';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_SkillCD } from './MTRNX_SkillCD';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_ZUnit')
export class MTRNX_ZUnit extends MTRNX_Unit {

    @property(Animation)
    ani: Animation;
    @property(RigidBody2D)
    rig: RigidBody2D;
    @property(Prefab)
    boom: Prefab;
    @property([Prefab])
    bullets: Prefab[] = [];
    @property
    maxHp: number = 1000;
    @property
    maxSkillCD = 10;
    @property
    Id = 10;
    @property
    IsEnemy = false;
    @property
    needHalfHp = false;

    collider: Collider2D;
    attackTrigger: Collider2D;
    shootTrigger: Collider2D;
    skillTrigger: Collider2D;
    boomTrigger: CircleCollider2D;

    public State: number = 1;
    speed = 0;
    antiSpeed = 0;
    skillCD = 0;
    public IsHitFly: boolean = false;
    isGround = false;
    isStop = false;

    attackList: MTRNX_Unit[] = [];
    shootList: MTRNX_Unit[] = [];
    skillList: MTRNX_Unit[] = [];
    suckList: MTRNX_Unit[] = [];
    boomList: MTRNX_Unit[] = [];

    onEnable() {
        this.skillCD = this.maxSkillCD;
        this.Hp = this.maxHp;
        var colliders = this.node.getComponents(Collider2D);
        this.collider = colliders[0];
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        this.attackTrigger = colliders[1];
        this.attackTrigger &&
            (this.attackTrigger.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this),
                this.attackTrigger.on(Contact2DType.END_CONTACT, this.onEndContact, this));
        this.shootTrigger = colliders[2];
        this.shootTrigger &&
            (this.shootTrigger.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this),
                this.shootTrigger.on(Contact2DType.END_CONTACT, this.onEndContact, this));
        this.skillTrigger = colliders[3];
        this.skillTrigger &&
            (this.skillTrigger.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this),
                this.skillTrigger.on(Contact2DType.END_CONTACT, this.onEndContact, this));
        this.boom && (this.boomTrigger = this.node.getComponent(CircleCollider2D)) &&
            (this.boomTrigger.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this),
                this.boomTrigger.on(Contact2DType.END_CONTACT, this.onEndContact, this));;
        this.schedule(() => { this.skillCD++; }, 1);
    }

    start() {
        this._rigibody2D = this.rig;
        this._animation = this.ani;
        if (this.IsEnemy) {
            this.forward = v2(-1, 0);
        }
        this.SpeedScale = 1;
        BundleManager.GetBundle("2_MTRNX_Bundle").load("Prefabs/UI/BloodBar", Prefab, (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            let blood = MTRNX_PoolManager.Instance.GetNode(res, this.node) as Node;
            var scale = v3(this.node.getComponent(UITransform).width / blood.getComponent(UITransform).width, this.node.getComponent(UITransform).width / blood.getComponent(UITransform).width, 1);
            blood.getComponent(MTRNX_BloodBar_Mtr).Init(scale);
            blood.setPosition(0, blood.parent.getComponent(BoxCollider2D).size.height / 2 + 10);
            if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre) {
                blood.getChildByName("BlueBar").active = true;
            }
        })
        this.schedule(() => { this.skillCD++ }, 1);
        this.schedule(() => { if (this.node.name == "Gman" && this.Hp > 0) MTRNX_AudioManager.AudioClipPlay("Gman小曲") }, 5);

        if (this.IsMassacreUnit) this.State = 0;

        this.schedule(() => {//秒事件
            this.secondupdate();
        }, 1)
    }

    update(dt: number): void {
        // console.log(this.attackTrigger.node.position)
        // return;
        if (this.isGround) {
            try {
                if (this.State == 1) {
                    if (!this.isStop) console.log("stop"), this.isStop = true, this.rig.linearVelocity = v2(0, this.rig.linearVelocity.y);
                }
                else if (this.State == 0) this.isStop && (this.isStop = false), this.Move(dt);
            } catch (error) {
                // console.log(this.node.name, error);
            }
        }
    }

    /**释放技能 */
    ReleaseSkill(data: string) {
        if (this.canAttack) {
            this.canAttack = false;
            this.CleanTarget();
            this.ResetCollider();
            this.State = 1;
            this.scheduleOnce(() => {
                if (this.State == 1) this.State = 0;
            }, 3)
            if (this.ani.getState("attack")) ((this.needHalfHp ? this.Hp <= this.maxHp / 2 : true) && this.ani.getState("attack2")) ? this.ani.play("attack2") : this.ani.getState("attack") && this.ani.play("attack");
        }
        if (this.canShoot && data == "技能一") {
            this.canShoot = false;
            this.EnterSKillCD(2);
            if (this.ani.getState("shoot")) ((this.needHalfHp ? this.Hp <= this.maxHp / 2 : true) && this.ani.getState("shoot2")) ? this.ani.play("shoot2") : this.ani.getState("shoot") && this.ani.play("shoot");
        }
        if (this.canSkill && data == "技能二") {
            this.canSkill = false;
            this.EnterSKillCD(3);
            this.ani.play("skill");
        }
        if (this.canSkill2 && data == "技能三") {
            this.canSkill = false;
            this.EnterSKillCD(4);
            this.ani.play("skill2");
        }
        if (this.canSkill3 && data == "技能四") {
            this.canSkill = false;
            this.EnterSKillCD(5);
            this.ani.play("skill3");
        }
    }

    //进入技能冷却
    EnterSKillCD(skillIndex: number) {
        this.CleanTarget();
        this.State = 1;
        MTRNX_GameManager.Instance.UI.getChildByPath(this.Btns[skillIndex] + "/Mask").getComponent(MTRNX_SkillCD).Init(skillIndex);
    }

    ZunitState(): number {
        return this.State;
    }

    //攻击或技能使用结束后
    SkillAniEnd() {
        if (this.IsMassacreUnit) {
            this.State = 0;
            if (this._direction == 0) {
                this.ani.play("idle");
            }
            else {
                ((this.needHalfHp ? this.Hp <= this.maxHp / 2 : true) && this.ani.getState("move2")) ? (this.ani.play("move2")) : (this.ani.play("move"));
            }
        }
    }

    directioned: number = 0;
    Move(deltaTime: number): void {
        if (this.IsTrapped) return;
        if (this.IsMassacreUnit) {
            //杀戮模式移动
            this.rig.linearVelocity = v2(this._direction * this.v2_line.x, this.rig.linearVelocity.y);
            if (this._direction != 0 && this.directioned != this._direction) {
                ((this.needHalfHp ? this.Hp <= this.maxHp / 2 : true) && this.ani.getState("move2")) ? (this.ani.play("move2")) : (this.ani.play("move"));
            }
            this.directioned = this._direction;
        }
        else {
            //非杀戮模式移动
            this.rig.linearVelocity = v2(this.v2_line.x, this.rig.linearVelocity.y);
        }
    }

    CheckSkill(): boolean {
        // console.log(this.Hp, this.skillCD, this.skillList.length, this.Hp <= this.maxHp / 2 && this.skillCD >= this.maxSkillCD && this.skillList.length > 0)
        if ((this.needHalfHp ? this.Hp <= this.maxHp / 2 : true) && this.skillCD >= this.maxSkillCD && this.skillList.length > 0) return true;
        return false;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        // console.log('onBeginContact');
        var other = otherCollider.node;
        if (other.name == "地面" || other.name == "黑色") {
            this.isGround = true;
            this.IsInTheAir = false;
        }
        if (other.getComponent(MTRNX_Unit)) {
            var otherUnit = other.getComponent(MTRNX_Unit);
            if (otherUnit.IsEnemy == this.IsEnemy || otherCollider.tag != 0 || otherUnit.Hp <= 0) return;
            var num = this.attackList.indexOf(otherUnit);
            if (selfCollider == this.attackTrigger && num == -1) this.attackList.push(otherUnit);

            var num = this.shootList.indexOf(otherUnit);
            if (selfCollider == this.shootTrigger && num == -1) this.shootList.push(otherUnit);
            var num = this.skillList.indexOf(otherUnit);
            if (selfCollider == this.skillTrigger && num == -1) this.skillList.push(otherUnit);
            var num = this.boomList.indexOf(otherUnit);
            if (selfCollider == this.boomTrigger && num == -1) this.boomList.push(otherUnit);
            this.CheckTarget();
            this.BContactEnd(otherUnit);
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
    }

    BContactEnd(otherUnit: MTRNX_Unit) { }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
        // console.log('onEndContact');
        var other = otherCollider.node;
        if (other.name == "地面" || other.name == "黑色") this.isGround = false;
        if (other.getComponent(MTRNX_Unit)) {
            var otherUnit = other.getComponent(MTRNX_Unit);
            if (otherUnit.IsEnemy == this.IsEnemy) return;
            var num = this.attackList.indexOf(otherUnit);
            if (selfCollider == this.attackTrigger && num != -1) this.attackList.splice(num, 1);
            var num = this.shootList.indexOf(otherUnit);
            if (selfCollider == this.shootTrigger && num != -1) this.shootList.splice(num, 1);
            var num = this.skillList.indexOf(otherUnit);
            if (selfCollider == this.skillTrigger && num != -1) this.skillList.splice(num, 1);
            var num = this.boomList.indexOf(otherUnit);
            if (selfCollider == this.boomTrigger && num != -1) this.boomList.splice(num, 1);
            this.canSkill = this.CheckSkill();
            this.BContactEnd(otherUnit);
        }
    }

    EContactEnd(otherUnit: MTRNX_Unit) { }

    Hurt(atk: number): void {
        if (this.Hp <= 0) return;
        var hp1 = this.Hp;
        super.Hurt(atk);
        if (this.Hp <= 0) return;
        if (!(MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre)) {
            if ((this.needHalfHp ? hp1 > this.maxHp / 2 && this.Hp <= this.maxHp / 2 : true) && this.node.getChildByName("brokenAni")) this.ani.play("idle"), this.node.getChildByName("brokenAni").active = true, this.speedBase = 5, this.SpeedScale = this.SpeedScale;
            else if ((this.needHalfHp ? hp1 > this.maxHp / 2 && this.Hp <= this.maxHp / 2 : true) && this.ani.getState("change")) this.ani.play("change"), this.State = 1;
        }
        this.CheckSkill();
    }

    Die(): void {
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless && this.IsEnemy == true) {
            MTRNX_GameManager.Instance.Score += Math.floor(MTRNX_Constant.MTTypePointCost[this.Id] / 5);
        }
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre && this.IsEnemy == true) {
            MTRNX_GameManager.Instance.Score += Math.floor(MTRNX_Constant.MTTypePointCost[this.Id] / 5);
        }
        if (this.ani.getState("suck")?.isPlaying)
            for (let i = 0; i < this.suckList.length; i++) {
                const element = this.suckList[i];
                element.SpeedScale -= 5;
            }
        if (this.IsEnemy) MTRNX_GameManager.Instance.haveHero = false;
        this.State = 2;
        MTRNX_PoolManager.Instance.PutNode(this.node.getChildByName("BloodBar"));
        this.collider.enabled = false;
        this.collider.enabled = true;
        //这里只是播放攻击动画
        if (!this._animation?.getState("dead").isPlaying) {
            this._animation?.play("dead");
        }
        if (this.IsMassacreUnit) {
            MTRNX_GameManager.Instance.GameFail();
        }
    }

    CheckTarget() {
        if (this.IsMassacreUnit) return;//如果是杀戮模式主角，不进行攻击判定
        if (this.attackList.length == 0) this.canAttack = false;
        else this.canAttack = true;
        if (this.shootList.length == 0) this.canShoot = false;
        else this.canShoot = true;
        this.canSkill = this.CheckSkill();
    }

    CleanTarget() {
        // var num = this.attackList.indexOf(target);
        // num != -1 ? this.attackList.splice(num, 1) : num = this.shootList.indexOf(target), num != -1 ? this.shootList.splice(num, 1) : num = this.skillList.indexOf(target), num != -1 && this.skillList.splice(num, 1);
        for (let i = 0; i < this.attackList.length; i++) {
            const element = this.attackList[i];
            if (element.Hp <= 0) this.attackList.splice(i, 1);
        }
        for (let i = 0; i < this.shootList.length; i++) {
            const element = this.shootList[i];
            if (element.Hp <= 0) this.shootList.splice(i, 1);
        }
        for (let i = 0; i < this.skillList.length; i++) {
            const element = this.skillList[i];
            if (element.Hp <= 0) this.skillList.splice(i, 1);
        }
        this.CheckTarget();
    }


    //向前冲刺一段距离
    speed_up(distance: number) {
        this._rigibody2D.linearVelocity = v2(distance);
    }

}


