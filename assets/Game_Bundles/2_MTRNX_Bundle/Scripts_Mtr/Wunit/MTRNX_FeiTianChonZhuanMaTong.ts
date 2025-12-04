import { _decorator, Component, Node, UIOpacity, v2 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_FeiTianChonZhuanMaTong')
export class MTRNX_FeiTianChonZhuanMaTong extends MTRNX_Unit {
    public Id: number = 20;//ID
    public IsEnemy: boolean = true;//是否为敌人
    public IsHitFly: boolean = false;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 5;//攻击力
    public Hp: number = 300;//当前生命值
    public maxHp: number = 300;//最大生命值
    public speedBase: number = 8;//基础速度
    public IsSingleAtk: boolean = false;//是否为单体攻击
    start() {
        super.start();

    }
    update(deltaTime: number) {
        switch (this.State) {
            case 0://移动状态
                {
                    this.Move(deltaTime);
                }
                break;
            case 1://攻击状态
                {
                    this.Attack();
                    this.Move(deltaTime);
                }
                break;
        }

    }
    //移动
    Move(deltaTime: number) {
        if (this.State == 2 || this.IsTrapped) return;
        //线速度移动方案
        let lineY: number;
        try {
            lineY = this._rigibody2D.linearVelocity.y;
        } catch (error) {

        }
        if (this.IsTrapped) { return };
        this._rigibody2D.linearVelocity = v2(this.v2_line.x, lineY);
        //这里只是播放攻击动画
        if (!this._animation?.getState("move").isPlaying && !this._animation?.getState("attack").isPlaying) {
            this._animation?.play("move");
        }
    }
    Attackincident() {
        super.Attackincident();
    }
    ChangeUnitScale() {

    }
    //死亡
    Die() {
        MTRNX_GameManager.Instance.ShakeWhite();
        for (let i of this.TargetNodes) {
            if (i.getComponent(MTRNX_Unit) && i.getComponent(MTRNX_Unit).State != 2) {
                i.getComponent(MTRNX_Unit).Hurt(250);
            }
        }
        this.State = 2;
        this.circlecollider.enabled = false;
        this.boxcollider.enabled = false;
        this.boxcollider.enabled = true;
        if (this.IsFlyUnit) this._rigibody2D.gravityScale = 1;
        MTRNX_PoolManager.Instance.PutNode(this.node.getChildByName("BloodBar"));
        //这里只是播放攻击动画
        if (!this._animation?.getState("dead").isPlaying) {
            this._animation?.play("dead");
        }
        if (this.IsEnemy) MTRNX_AudioManager.AudioClipPlay("马桶死亡");
    }
    //死亡帧事件
    Dieincident() {
        this.node.destroy();
    }
}


