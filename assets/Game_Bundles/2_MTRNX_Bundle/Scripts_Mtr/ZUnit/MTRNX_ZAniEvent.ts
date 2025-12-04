import { _decorator, Animation, Color, color, Component, Node, Sprite, tween, v3 } from 'cc';
import { MTRNX_ZUnit } from './MTRNX_ZUnit';
import { MTRNX_CameraShaking } from '../MTRNX_CameraShaking';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_GameMode } from '../Data/MTRNX_Constant';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_Gbullet } from '../GUnit/MTRNX_Gbullet';
import { MTRNX_ZBullet } from './MTRNX_ZBullet';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_ZAniEvent')
export class MTRNX_ZAniEvent extends Component {

    self: MTRNX_ZUnit;
    start() {
        this.self = this.node.parent.getComponent(MTRNX_ZUnit);
    }

    update(deltaTime: number) {

    }

    IdleEnd() {
        if (!this.self.isGround || this.self.IsMassacreUnit) return;
        this.self.CleanTarget();
        this.self.State = 1;
        if (this.self.canSkill) this.self.ani.play("skill");
        else if (this.self.canAttack && this.self.ani.getState("attack")) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("attack2")) ? this.self.ani.play("attack2") : this.self.ani.getState("attack") && this.self.ani.play("attack");
        else if (this.self.canShoot && this.self.ani.getState("shoot")) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("shoot2")) ? this.self.ani.play("shoot2") : this.self.ani.getState("shoot") && this.self.ani.play("shoot");
        else this.self.State = 0, ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("move2")) ? (this.self.ani.play("move2")) : (this.self.ani.play("move"));
    }

    MoveEnd() {
        MTRNX_CameraShaking.Instance.Shaking();
        if (!this.self.isGround || this.self.IsMassacreUnit) return;
        this.self.CleanTarget();
        this.self.State = 1;
        // console.log(this.self.SpeedScale, this.self.v2_line.x)
        if (this.self.canSkill) this.self.ani.play("skill");
        else if (this.self.canAttack && this.self.ani.getState("attack")) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("attack2")) ? this.self.ani.play("attack2") : this.self.ani.getState("attack") && this.self.ani.play("attack");
        else if (this.self.canShoot && this.self.ani.getState("shoot")) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("shoot2")) ? this.self.ani.play("shoot2") : this.self.ani.getState("shoot") && this.self.ani.play("shoot");
        else this.self.State = 0;
    }

    Hit(num1: number) {
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre && this.node.parent.getComponent(MTRNX_Unit).IsEnemy == false) {
            let attack = MTRNX_GameManager.Instance.MassacreUnit.getComponent(MTRNX_Unit).attack;
            num1 = Number((num1 * (attack / 50)).toFixed(0));
        }
        if (this.self.ani.getState("attack")?.isPlaying || this.self.ani.getState("attack2")?.isPlaying || this.self.ani.getState("move")?.isPlaying) {
            for (let i = 0; i < this.self.attackList.length; i++) {
                const element = this.self.attackList[i];
                element.Hurt(num1);
            }
        }
        else if (this.self.ani.getState("suck")?.isPlaying)
            for (let i = 0; i < this.self.shootList.length; i++) {
                const element = this.self.shootList[i];
                if (element.IsHitFly && this.self.suckList.indexOf(element) == -1) this.self.suckList.push(element), element.SpeedScale += 5;
                element.Hurt(num1);
            }
        else if (this.self.ani.getState("skill")?.isPlaying || this.self.node.getChildByName("光")?.active || this.self.node.children[0].children[0]?.getComponent(Sprite).color.a != 0) {
            var trap = false;
            if (this.self.node.name == "泰坦监控人" || this.self.node.name == "泰坦电视人" || this.self.node.name == "泰坦电视人2" || this.self.node.name == "马桶博士") trap = true;
            if (this.node.parent.name != "马桶博士" || this.self.node.name == "泰坦音响人")
                for (let i = 0; i < this.self.skillList.length; i++) {
                    const element = this.self.skillList[i];
                    if (element.Hp <= 0) continue;
                    if (trap) element.Trapped(0.075);
                    element.Hurt(num1);
                }
            else {
                for (let i = 0; i < this.self.shootList.length; i++) {
                    const element = this.self.shootList[i];
                    if (element.Hp <= 0) continue;
                    if (trap) element.Trapped(0.075);
                    element.Hurt(num1);
                }
            }
        }
    }

    AttackCheck() {
        if (this.self.IsMassacreUnit) return;
        this.self.CleanTarget();
        if (this.self.canSkill) this.self.ani.play("skill");
        else if (this.self.canShoot) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("shoot2")) ? this.self.ani.play("shoot2") : this.self.ani.getState("shoot") && this.self.ani.play("shoot");
        else if (!this.self.canAttack) this.self.State = 0, ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("move2")) ? (this.self.ani.play("move2")) : (this.self.ani.play("move"));
    }

    AttackEnd() {
        this.self.SkillAniEnd();

        if (!this.self.isGround || this.self.IsMassacreUnit) return;
        this.self.CleanTarget();
        if (this.self.canSkill) this.self.ani.play("skill");
        else if (this.self.canShoot && this.self.ani.getState("shoot") && this.self.node.name != "泰坦监控人2" && this.self.node.name != "泰坦音响人") ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("shoot2")) ? this.self.ani.play("shoot2") : this.self.ani.getState("shoot") && this.self.ani.play("shoot");
        else if (this.self.canAttack) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("attack2")) ? this.self.ani.play("attack2") : this.self.ani.getState("attack") && this.self.ani.play("attack");
        else this.self.State = 0, ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("move2")) ? (this.self.ani.play("move2")) : (this.self.ani.play("move"));

    }

    Shoot(num: number, damage: number, speed: number, traceLevel: number, dispersion: number) {
        if (!this.self.ani.getState("skill")?.isPlaying) var target = this.self.shootList[0];
        else var target = this.self.skillList[0];
        var bullet = MTRNX_PoolManager.Instance.GetNode(this.self.bullets[num], MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层")) as Node;
        bullet.setWorldPosition(this.self.node.getChildByName("ShootPoint").children[num].getWorldPosition());
        var src = bullet.getComponent(MTRNX_ZBullet);
        let attack = 50;
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre) {
            attack = MTRNX_GameManager.Instance.MassacreUnit.getComponent(MTRNX_Unit).attack;
        }
        damage = Number((damage * (attack / 50)).toFixed(0));
        if (src) {
            src.self = this.self;
            src.init(target ? target.node : null, damage, speed, this.self.IsEnemy, traceLevel, dispersion);
        }
        else {
            bullet.getComponent(MTRNX_Gbullet).init(this.self.node.getChildByName("ShootPoint").getWorldPosition().add(v3(1, 0, 0).multiplyScalar(this.self.IsEnemy ? -1 : 1)), this.self.forward.clone(), damage, speed, this.self.IsEnemy, true, 1, true, false);
        }
    }

    ShootEnd() {
        this.self.SkillAniEnd();

        if (!this.self.isGround || this.self.IsMassacreUnit) return;
        this.self.CleanTarget();
        if (this.self.canSkill) this.self.ani.play("skill");
        else if (this.self.canAttack && this.self.ani.getState("attack")) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("attack2")) ? this.self.ani.play("attack2") : this.self.ani.getState("attack") && this.self.ani.play("attack");
        else if (this.self.canShoot) this.self.ani.clips.some((value, index, array) => { return value.name == "suck" }) ? this.self.ani.play("suck") : (this.self.canShoot) && ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("shoot2")) ? this.self.ani.play("shoot2") : this.self.ani.getState("shoot") && this.self.ani.play("shoot");
        else this.self.State = 0, ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("move2")) ? (this.self.ani.play("move2")) : (this.self.ani.play("move"));

    }

    SuckEnd() {
        this.self.SkillAniEnd();

        if (!this.self.isGround || this.self.IsMassacreUnit) return;
        for (let i = 0; i < this.self.suckList.length; i++) {
            const element = this.self.suckList[i];
            if (element && element.Hp > 0) element.SpeedScale -= 5;
        }
        this.self.suckList = [];
        this.self.CleanTarget();
        if (this.self.canSkill) this.self.ani.play("skill");
        else if (this.self.canAttack) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("attack2")) ? this.self.ani.play("attack2") : this.self.ani.getState("attack") && this.self.ani.play("attack");
        // else if (this.self.canShoot) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("shoot2")) ? this.self.ani.play("shoot2") : this.self.ani.getState("shoot") && this.self.ani.play("shoot");
        else this.self.State = 0, ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("move2")) ? (this.self.ani.play("move2")) : (this.self.ani.play("move"));

    }

    SkillEnd() {
        this.self.SkillAniEnd();

        if (!this.self.isGround || this.self.IsMassacreUnit) return;
        this.self.CleanTarget();
        this.self.skillCD = 0;
        if (this.self.canAttack) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("attack2")) ? this.self.ani.play("attack2") : this.self.ani.getState("attack") && this.self.ani.play("attack");
        else if (this.self.canShoot) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("shoot2")) ? this.self.ani.play("shoot2") : this.self.ani.getState("shoot") && this.self.ani.play("shoot");
        else this.self.State = 0, ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("move2")) ? (this.self.ani.play("move2")) : (this.self.ani.play("move"));

    }

    BreakEnd() {
        tween(this.node.getComponent(Sprite))
            .to(3, { color: color(255, 255, 255, 0) })
            .call(() => { this.node.active = false; })
            .start();
    }

    DieEnd() {
        if (!this.self.boom)
            tween(this.node.getComponent(Sprite))
                .to(3, { color: color(255, 255, 255, 0) })
                .call(() => {
                    // PoolManager.Instance.PutNode(this.node); 
                    this.self.node.destroy();
                })
                .start();
        else {
            var boom = MTRNX_PoolManager.Instance.GetNode(this.self.boom, MTRNX_GameManager.Instance.GameNode);
            boom.setWorldPosition(this.self.node.worldPosition);
            for (let i = 0; i < this.self.boomList.length; i++) {
                const element = this.self.boomList[i];
                element.Hurt(this.self.maxHp / 2);
            }
            this.self.node.destroy();
        }
    }

    BulletEnd() {
        this.node.destroy();
    }

    LightStart() {
        var light = this.self.node.getChildByName("光");
        light.active = true;
        var ani = light.getComponent(Animation);
        ani.stop();
        ani.play();
    }

    LightEnd() {
        // this.node.getComponent(Sprite).color = Color.RED;
        this.SkillEnd();
        this.node.active = false;
    }

    AudioPlay(name: string) {
        MTRNX_AudioManager.AudioClipPlay(name);
    }
    //向前冲刺一段距离
    speed_up(distance: number) {
        this.self.speed_up(distance);
    }

}


