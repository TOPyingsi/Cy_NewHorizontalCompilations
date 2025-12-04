import { _decorator, Component, Node } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_RenXinGe')
export class MTRNX_RenXinGe extends MTRNX_Unit {
    public Id: number = 4;//ID
    public IsEnemy: boolean = true;//是否为敌人
    public IsHitFly: boolean = true;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 20;//攻击力
    public Hp: number = 350;//当前生命值
    public maxHp: number = 350;//最大生命值
    public speedBase: number = 2.5;//基础速度
    start() {
        super.start();

    }
    Attackincident() {
        MTRNX_AudioManager.AudioClipPlay("捶地");
        super.Attackincident();
    }
}


