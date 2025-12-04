import { _decorator } from 'cc';
import { TLWLSJ_WEAPONTYPE } from './TLWLSJ_Constant';
const { ccclass } = _decorator;

@ccclass('TLWLSJ_Weapon')
export class TLWLSJ_Weapon {
    //类型 -- 近战 远程
    WeaponType: TLWLSJ_WEAPONTYPE;
    //伤害
    Harm: number;
    //冷却时间
    CoolingTime: number;
    //破甲
    ArmorPenetration: number;

    constructor(type: number, harm: number, coolingTime: number, armorPenetration: number) {
        this.WeaponType = type;
        this.Harm = harm;
        this.CoolingTime = coolingTime;
        this.ArmorPenetration = armorPenetration;
    }

}


