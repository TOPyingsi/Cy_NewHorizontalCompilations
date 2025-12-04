import { _decorator, Component, Enum, Node } from 'cc';
import { TLWLSJ_WEAPON } from './TLWLSJ_Constant';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Bullet')
export class TLWLSJ_Bullet {
    Name: string = "";
    BelongTo: TLWLSJ_WEAPON[] = [];
    Harm: number = 1;
    ArmorPenetration: number = 1;
    Count: number = 1;

    constructor(name: string, belongTo: TLWLSJ_WEAPON[], harm: number, AP: number, count: number) {
        this.Name = name;
        this.BelongTo = belongTo;
        this.Harm = harm;
        this.ArmorPenetration = AP;
        this.Count = count;
    }
}


