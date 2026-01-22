import { _decorator, Component, Node } from 'cc';
import { MTRNX_Water_Unit } from '../MTRNX_Water_Unit';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_BaiMuLa')
export class MTRNX_Water_BaiMuLa extends MTRNX_Water_Unit {
    public Id: number = 2;//ID
    public IsEnemy: boolean = true;//是否为敌人
    public IsHitFly: boolean = true;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 30;//攻击力
    public Hp: number = 800;//当前生命值
    public maxHp: number = 800;//最大生命值
    public speedBase: number = 3;//基础速度
    start() {
        super.start();

    }
    Attackincident() {
        MTRNX_Water_AudioManager.AudioClipPlay("捶地");
        super.Attackincident();
    }
}


