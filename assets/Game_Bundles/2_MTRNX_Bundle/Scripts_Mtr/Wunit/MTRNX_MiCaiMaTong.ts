import { _decorator, Component, Node, Prefab, UIOpacity, v2, v3 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_WBullet3 } from '../MTRNX_WBullet3';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_MiCaiMaTong')
export class MTRNX_MiCaiMaTong extends MTRNX_Unit {
    @property(Prefab)
    Bullet: Prefab = null;
    public Id: number = 15;//ID
    public IsEnemy: boolean = true;//是否为敌人
    public IsHitFly: boolean = false;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 20;//攻击力
    public Hp: number = 400;//当前生命值
    public maxHp: number = 400;//最大生命值
    public speedBase: number = 3;//基础速度
    private BulletSpeed: number = 20;//子弹速度
    private barrel: Node = null;//枪管
    public Angle: number = 0;//当前角度
    start() {
        this.barrel = this.node.getChildByName("炮管");
        super.start();
    }
    update(deltaTime: number) {
        super.update(deltaTime);
        if (this.barrel && this.TargetNodes.length > 0) {
            let dir = this.TargetNodes[0].getWorldPosition().subtract(this.barrel.getWorldPosition());
            this.Angle = -(180 / Math.PI * Math.atan2(dir.y, dir.x)) - 180;
            this.barrel.angle = this.Angle;
        }
    }
    Move(deltaTime: number) {
        super.Move(deltaTime);
        this.Angle = 0;
        this.barrel.angle = this.Angle;
    }
    Attackincident() {
        if (this.TargetNodes.length > 0) {
            MTRNX_AudioManager.AudioClipPlay("蓝色子弹发射");
            let pre: Node = MTRNX_PoolManager.Instance.GetNode(this.Bullet, MTRNX_GameManager.Instance.GameNode);
            pre.getComponent(MTRNX_WBullet3).IsAttack = false;
            var dir = this.TargetNodes[0].getWorldPosition().subtract(this.node.getWorldPosition()).normalize();
            let linearVelocity = v2(this.BulletSpeed * dir.x, this.BulletSpeed * dir.y);
            pre.getComponent(MTRNX_WBullet3).init(this.TargetNodes[0], this.attack, this.BulletSpeed, this.IsEnemy, false, linearVelocity);
            pre.setWorldPosition(this.barrel.getChildByName("发射点").getWorldPosition());
        }
        this.ChangeUnitScale();
    }
}


