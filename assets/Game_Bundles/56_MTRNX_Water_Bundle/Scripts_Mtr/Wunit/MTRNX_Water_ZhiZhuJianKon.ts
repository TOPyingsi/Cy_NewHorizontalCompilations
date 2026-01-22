import { _decorator, Component, instantiate, Node, Prefab, random, v2, v3, Vec2 } from 'cc';
import { MTRNX_Water_Unit } from '../MTRNX_Water_Unit';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
import { MTRNX_Water_PoolManager } from '../Utils/MTRNX_Water_PoolManager';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_WBullet2 } from '../MTRNX_Water_WBullet2';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_ZhiZhuJianKon')
export class MTRNX_Water_ZhiZhuJianKon extends MTRNX_Water_Unit {
    @property(Prefab)
    Bullet: Prefab = null;

    public Id: number = 3;//ID
    public IsEnemy: boolean = false;//是否为敌人
    public IsHitFly: boolean = true;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public IsSingleAtk: boolean = true;//是否为单体攻击
    private BulletSpeed: number = 20;//子弹速度
    public attack: number = 5;//攻击力
    public Hp: number = 160;//当前生命值
    public maxHp: number = 160;//最大生命值
    public speedBase: number = 2.5;//基础速度
    start() {
        super.start();

    }


    Attackincident() {
        if (this.TargetNodes.length > 0) {
            MTRNX_Water_AudioManager.AudioClipPlay("蓝色子弹发射");
            let pre: Node = MTRNX_Water_PoolManager.Instance.GetNode(this.Bullet, MTRNX_Water_GameManager.Instance.GameNode);
            pre.getComponent(MTRNX_Water_WBullet2).IsAttack = false;
            let pos = this.TargetNodes[0].getWorldPosition();
            var dir = v3(pos.x, pos.y + this.boxcollider.size.height / 3).subtract(this.node.getWorldPosition().add(v3(70, 150, 0))).normalize();
            dir.add(v3(0, Math.random() * 0.05 - 0.025, 0));
            let linearVelocity = v2(this.BulletSpeed * dir.x, this.BulletSpeed * dir.y);
            pre.getComponent(MTRNX_Water_WBullet2).init(this.TargetNodes[0], this.attack, this.BulletSpeed, this.IsEnemy, true, linearVelocity);
            pre.setWorldPosition(this.node.getWorldPosition().clone().add(v3(70, 150, 0)));
        }
    }

}


