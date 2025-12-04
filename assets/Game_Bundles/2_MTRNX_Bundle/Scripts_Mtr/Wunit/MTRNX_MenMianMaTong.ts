import { _decorator, Component, Node } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_MenMianMaTong')
export class MTRNX_MenMianMaTong extends MTRNX_Unit {
    public Id: number = 12;//ID
    public IsEnemy: boolean = true;//是否为敌人
    public IsHitFly: boolean = false;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 100;//攻击力
    public Hp: number = 400;//当前生命值
    public maxHp: number = 400;//最大生命值
    public speedBase: number = 3;//基础速度
    start() {
        super.start();

    }
    Attackincident() {
        MTRNX_AudioManager.AudioClipPlay("捶地");
        super.Attackincident();
    }
}


