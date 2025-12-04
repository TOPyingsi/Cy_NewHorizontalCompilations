import { _decorator } from 'cc';
import { TLWLSJ_Weapon } from './TLWLSJ_Weapon';
import { TLWLSJ_Magazine } from './TLWLSJ_Magazine';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Gun')
export class TLWLSJ_Gun extends TLWLSJ_Weapon {

    Capacity: number = 1; // 最大容量
    HaveMagazine: TLWLSJ_Magazine[] = [];
    CurMagazine: TLWLSJ_Magazine = null;

    constructor(type: number, harm: number, coolingTime: number, armorPenetration: number, capacity: number) {
        super(type, harm, coolingTime, armorPenetration);
        this.Capacity = capacity;
    }



}


