import { _decorator, Component, Node, v2 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_RenXinChonFengGe')
export class MTRNX_RenXinChonFengGe extends MTRNX_Unit {
    public Id: number = 14;//ID
    public IsEnemy: boolean = true;//是否为敌人
    public IsHitFly: boolean = true;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 35;//攻击力
    public Hp: number = 300;//当前生命值
    public maxHp: number = 300;//最大生命值
    public speedBase: number = 8;//基础速度
    public IsStop: boolean = false; //是否停止冲锋
    start() {
        super.start();

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
        if (this.IsStop == false) {
            if (!this._animation?.getState("move").isPlaying) {
                this.ChangeUnitScale();
                this._animation?.play("move");
            }
        }
        if (this.IsStop == true) {
            if (!this._animation?.getState("move2").isPlaying) {
                this.ChangeUnitScale();
                this._animation?.play("move2");
            }
        }
    }
    //攻击
    Attack() {
        if (this.State == 2) return;
        if (this.IsStop == false) {
            this.IsStop = true;
            if (this.TargetNodes.length > 0) {
                this.TargetNodes[0].getComponent(MTRNX_Unit).Hurt(200);
            }
            this.speedBase = 4;
        }
        //这里只是播放攻击动画
        if (!this._animation?.getState("attack").isPlaying) {
            this._animation?.play("attack");
            this._rigibody2D.linearVelocity = v2(0, this._rigibody2D.linearVelocity.y);
            this.ChangeUnitScale();
        }
    }
    Attackincident() {
        MTRNX_AudioManager.AudioClipPlay("捶地");
        super.Attackincident();
    }
}


