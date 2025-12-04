import { _decorator, Component, Node, v2 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_WuShuangZhanShen')
export class MTRNX_WuShuangZhanShen extends MTRNX_Unit {
    public Id: number = 23;//ID
    public IsEnemy: boolean = false;//是否为敌人
    public IsHitFly: boolean = false;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 50;//攻击力
    public Hp: number = 600;//当前生命值
    public maxHp: number = 600;//最大生命值
    public speedBase: number = 6;//基础速度
    start() {
        super.start();

    }
    Attackincident() {
        MTRNX_AudioManager.AudioClipPlay("捶地");
        super.Attackincident();
    }
    roll() {
        try {
            this._rigibody2D.linearVelocity = v2(20, 0);
        } catch (error) {
        }
    }
}


