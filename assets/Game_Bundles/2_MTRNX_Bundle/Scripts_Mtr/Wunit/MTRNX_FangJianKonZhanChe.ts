import { _decorator, Component, Node, Prefab, v2, v3, Vec2 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_WBullet } from '../MTRNX_WBullet';
import { MTRNX_GameManager } from '../MTRNX_GameManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_FangJianKonZhanChe')
export class MTRNX_FangJianKonZhanChe extends MTRNX_Unit {
    @property(Prefab)
    Bullet: Prefab = null;
    public Id: number = 22;//ID
    public IsEnemy: boolean = false;//是否为敌人
    public IsHitFly: boolean = false;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public IsSingleAtk: boolean = true;//是否为单体攻击
    private BulletSpeed: number = 20;//子弹速度
    private IsBeginAttack: boolean = false;//是否开始攻击
    public attack: number = 7;//攻击力
    public Hp: number = 300;//当前生命值
    public maxHp: number = 300;//最大生命值
    public speedBase: number = 3.5;//基础速度
    start() {
        super.start();

    }
    // /攻击
    Attack() {
        if (this.State == 2) return;
        //这里只是播放攻击动画
        if (this.IsBeginAttack == false) {
            this.IsBeginAttack = true;
            this.State = 1;
            this._animation?.play("attack");
            this._rigibody2D.linearVelocity = Vec2.ZERO;
        }
    }
    update(deltaTime: number) {
        switch (this.State) {
            case 0://移动状态
                {
                    this.Move(deltaTime);
                    this.IsBeginAttack = false;
                }
                break;
            case 1://攻击状态
                {
                    this.Attack();
                }
                break;
        }

    }
    Attackincident() {
        if (this.State == 2) {
            return;
        }
        console.log(this.TargetNodes.length);
        if (this.TargetNodes.length > 0) {
            this.Biu();
        } else {
            this.State = 0;
        }
    }
    //发射激光
    Biu() {
        if (this.State == 0 || this.State == 2) {
            return;
        }
        this.scheduleOnce(() => {
            if (this.State == 2) {
                return;
            }
            if (this.IsBeginAttack && this.TargetNodes.length > 0) {
                MTRNX_AudioManager.AudioClipPlay("蓝色子弹发射", 0.3);
                let pre: Node = MTRNX_PoolManager.Instance.GetNode(this.Bullet, MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层"));
                pre.getComponent(MTRNX_WBullet).ispenetrate = true;
                var dir = this.forward;
                let linearVelocity = v2(this.BulletSpeed * dir.x, this.BulletSpeed * dir.y);
                pre.getComponent(MTRNX_WBullet).init(this.TargetNodes[0], this.attack, this.BulletSpeed, this.IsEnemy, true, linearVelocity);
                pre.setWorldPosition(this.node.getWorldPosition().clone().add(v3(230, 100, 0)));
                this.Biu();
            } else {
                this.IsBeginAttack = false;
                this.State = 0;//没有目标单位时前进
            }
        }, 0.3)
    }

}


