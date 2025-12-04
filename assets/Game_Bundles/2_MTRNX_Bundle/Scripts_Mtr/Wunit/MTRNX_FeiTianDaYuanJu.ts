import { _decorator, Component, Node, v2 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_FeiTianDaYuanJu')
export class MTRNX_FeiTianDaYuanJu extends MTRNX_Unit {
    public Id: number = 11;//ID
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
        this.schedule(() => {
            MTRNX_AudioManager.AudioClipPlay("电锯类", 0.3);
        }, 0.8)
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
}


