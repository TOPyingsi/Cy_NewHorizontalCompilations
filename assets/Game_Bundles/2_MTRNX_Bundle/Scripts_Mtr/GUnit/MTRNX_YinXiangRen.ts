import { _decorator, Component, Node, Vec3 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_YinXiangRen')
export class MTRNX_YinXiangRen extends MTRNX_Unit {
    public Id: number = 9;//ID
    public IsHitFly: boolean = true;//受击是否被击飞

    public attack: number = 9;//攻击力
    public Hp: number = 150;//当前生命值
    public maxHp: number = 150;//最大生命值
    public speedBase: number = 3;//基础速度

    start(): void {
        super.start();
    }

    Attackincident(): void {
        super.Attackincident();
        MTRNX_AudioManager.AudioClipPlay("攻击");
    }

}


