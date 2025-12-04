import { _decorator, Component, Node } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_JianKonRen')
export class MTRNX_JianKonRen extends MTRNX_Unit {
    public Id: number = 1;//ID
    public IsEnemy: boolean = false;//是否为敌人
    public IsHitFly: boolean = true;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 14;//攻击力
    public Hp: number = 160;//当前生命值
    public maxHp: number = 160;//最大生命值
    public speedBase: number = 3;//基础速度
    start() {
        super.start();

    }

}


