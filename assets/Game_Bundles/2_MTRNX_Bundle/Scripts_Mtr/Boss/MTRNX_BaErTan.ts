import { _decorator, Component, Node } from 'cc';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_Unit } from '../MTRNX_Unit';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_BaErTan')
export class MTRNX_BaErTan extends MTRNX_Unit {
    public Id: number = 1;//ID
    public IsEnemy: boolean = true;//是否为敌人
    public IsHitFly: boolean = true;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 12;//攻击力
    public Hp: number = 300;//当前生命值
    public maxHp: number = 300;//最大生命值
    public speedBase: number = 3;//基础速度
    start() {
        super.start();
    }
    Attackincident() {
        MTRNX_AudioManager.AudioClipPlay("攻击");
        super.Attackincident();
    }
}


