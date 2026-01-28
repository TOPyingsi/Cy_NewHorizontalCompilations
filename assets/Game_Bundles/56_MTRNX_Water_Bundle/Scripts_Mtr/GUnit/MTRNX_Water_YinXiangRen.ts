import { _decorator, Component, Node, Vec3 } from 'cc';
import { MTRNX_Water_Unit } from '../MTRNX_Water_Unit';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_YinXiangRen')
export class MTRNX_Water_YinXiangRen extends MTRNX_Water_Unit {
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
        MTRNX_Water_AudioManager.AudioClipPlay("攻击");
    }

}


