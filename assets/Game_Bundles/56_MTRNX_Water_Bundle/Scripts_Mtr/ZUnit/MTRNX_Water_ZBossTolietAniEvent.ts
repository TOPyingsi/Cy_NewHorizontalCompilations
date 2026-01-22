import { _decorator, v3, Node } from 'cc';
import { MTRNX_Water_ZAniEvent } from './MTRNX_Water_ZAniEvent';
import { MTRNX_Water_ZBossToliet } from './MTRNX_Water_ZBossToliet';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_PoolManager } from '../Utils/MTRNX_Water_PoolManager';
import { MTRNX_Water_ZBullet } from './MTRNX_Water_ZBullet';
import { MTRNX_Water_Gbullet } from '../GUnit/MTRNX_Water_Gbullet';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_ZBossTolietAniEvent')
export class MTRNX_Water_ZBossTolietAniEvent extends MTRNX_Water_ZAniEvent {

    self: MTRNX_Water_ZBossToliet;

    start() {
        this.self = this.node.parent.getComponent(MTRNX_Water_ZBossToliet);
    }

    ShootEnd() {
        this.self.CleanTarget();
        if (this.self.canAttack) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("attack2")) ? this.self.ani.play("attack2") : this.self.ani.play("attack");
        else this.self.State = 0, ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("move2")) ? (this.self.ani.play("move2")) : (this.self.ani.play("move"));
    }

    Shoot1() {
        var bullet = MTRNX_Water_PoolManager.Instance.GetNode(this.self.bullets[0], MTRNX_Water_GameManager.Instance.GameNode) as Node;
        bullet.setWorldPosition(this.self.node.getChildByName("ShootPoint").children[0].getWorldPosition());
        bullet.setScale(this.self.IsEnemy ? -1 : 1, 1);
        var src = bullet.getComponent(MTRNX_Water_Gbullet);
        src.init(this.self.node.getChildByName("ShootPoint").children[0].getWorldPosition().add(v3(1, 0, 0).multiplyScalar(this.self.IsEnemy ? -1 : 1)), this.self.forward.clone(), 10, 40, this.self.IsEnemy, true, 1, true, false);
        // AudioManager.AudioClipPlay("特大号音响音效");
    }

    Shoot2() {
        var target = this.self.shootList[0];
        var bullet = MTRNX_Water_PoolManager.Instance.GetNode(this.self.bullets[1], MTRNX_Water_GameManager.Instance.GameNode) as Node;
        bullet.setWorldPosition(this.self.node.getChildByName("ShootPoint").children[1].getWorldPosition());
        var src = bullet.getComponent(MTRNX_Water_ZBullet);
        src.self = this.self;
        src.init(target?.node, 20, 40, this.self.IsEnemy, 1);
        MTRNX_Water_AudioManager.AudioClipPlay("蓝色子弹发射");
    }

    Shoot3() {
        var target = this.self.shootList[0];
        var bullet = MTRNX_Water_PoolManager.Instance.GetNode(this.self.bullets[2], MTRNX_Water_GameManager.Instance.GameNode) as Node;
        bullet.setWorldPosition(this.self.node.getChildByName("ShootPoint").children[2].getWorldPosition());
        var src = bullet.getComponent(MTRNX_Water_ZBullet);
        src.self = this.self;
        src.init(target?.node, 50, 40, this.self.IsEnemy, 1);
        MTRNX_Water_AudioManager.AudioClipPlay("蓝色子弹发射");
    }

    ShootCheck() {
        this.self.CleanTarget();
        if (!this.self.canShoot) this.self.State = 0, ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("move2")) ? (this.self.ani.play("move2")) : (this.self.ani.play("move"));
    }

    ChangeEnd() {
        if (this.self.canAttack) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("attack2")) ? this.self.ani.play("attack2") : this.self.ani.play("attack");
        else if (this.self.canShoot) ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("shoot2")) ? this.self.ani.play("shoot2") : this.self.ani.play("shoot");
        else this.self.State = 0, ((this.self.needHalfHp ? this.self.Hp <= this.self.maxHp / 2 : true) && this.self.ani.getState("move2")) ? (this.self.ani.play("move2")) : (this.self.ani.play("move"));
    }
}


