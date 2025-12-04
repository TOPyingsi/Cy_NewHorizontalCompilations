import { _decorator, Component, Node, v3, Vec3 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_ShuangYeMaTong')
export class MTRNX_ShuangYeMaTong extends MTRNX_Unit {
    public Id: number = 10;//ID
    public IsEnemy: boolean = true;//是否为敌人
    public IsHitFly: boolean = false;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 50;//攻击力
    public Hp: number = 700;//当前生命值
    public maxHp: number = 700;//最大生命值
    public speedBase: number = 3;//基础速度
    public IsSingleAtk: boolean = false;//是否为单体攻击
    public bloodBarScale: Vec3 = v3(2, 2, 2);//血条默认大小
    start() {
        super.start();
        // this.node.getChildByName("BloodBar").getComponent(BloodBar).Init(v3(3, 3, 3));
    }
    Attackincident() {
        MTRNX_AudioManager.AudioClipPlay("喷气");
        super.Attackincident();
    }

}


