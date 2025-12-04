import { _decorator, Component, Node, sys } from 'cc';
import { TLWLSJ_MAP, TLWLSJ_WEAPON } from './TLWLSJ_Constant';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_PrefsManager')
export class TLWLSJ_PrefsManager {

    private static _instance: TLWLSJ_PrefsManager = null;
    public static get Instance(): TLWLSJ_PrefsManager {
        if (!TLWLSJ_PrefsManager._instance) {
            TLWLSJ_PrefsManager._instance = new TLWLSJ_PrefsManager();
        }
        return TLWLSJ_PrefsManager._instance;
    }

    public userData = {
        "Gold": 2000,
        "CurMap": TLWLSJ_MAP.MAP1,
        "YW": 0,
        "KF": 0,
        "AllWeapon": [TLWLSJ_WEAPON.签字笔, TLWLSJ_WEAPON.刻度尺, TLWLSJ_WEAPON.游标卡尺, TLWLSJ_WEAPON.自动手枪, TLWLSJ_WEAPON.MK18玩具枪, TLWLSJ_WEAPON.左轮手枪, TLWLSJ_WEAPON.AK102突击步枪, TLWLSJ_WEAPON.MK18突击步枪,
        TLWLSJ_WEAPON.MP43散弹枪, TLWLSJ_WEAPON.Saiga12K散弹枪, TLWLSJ_WEAPON.榴弹发射器, TLWLSJ_WEAPON.光束枪, TLWLSJ_WEAPON.伽马射线枪, TLWLSJ_WEAPON.电磁炮, TLWLSJ_WEAPON.阴极射线管, TLWLSJ_WEAPON.高爆手雷, TLWLSJ_WEAPON.破片手雷
        ],
        "HaveWeapon": [TLWLSJ_WEAPON.签字笔],
        // "HaveWeapon": [WEAPON.AK102突击步枪, WEAPON.MK18玩具枪, WEAPON.MK18突击步枪, WEAPON.MP43散弹枪, WEAPON.Saiga12K散弹枪, WEAPON.伽马射线枪, WEAPON.光束枪,
        // WEAPON.刻度尺, WEAPON.左轮手枪, WEAPON.榴弹发射器, WEAPON.游标卡尺, WEAPON.电磁炮, WEAPON.签字笔, WEAPON.自动手枪, WEAPON.阴极射线管,
        // ],
        "CurWeapon": TLWLSJ_WEAPON.签字笔,
    }

    private constructor() {
        // sys.localStorage.setItem('userData', JSON.stringify(this.userData));
        const value = sys.localStorage.getItem('TLWLSJ_USERData');
        if (value) {
            //有记录就读取  --- 没记录就存入数据
            this.userData = JSON.parse(value);
        } else {
            console.log(`userData is not exist`);
            sys.localStorage.setItem('TLWLSJ_USERData', JSON.stringify(this.userData));
        }
    }

    public saveData() {
        sys.localStorage.setItem('TLWLSJ_USERData', JSON.stringify(this.userData));
    }
}


