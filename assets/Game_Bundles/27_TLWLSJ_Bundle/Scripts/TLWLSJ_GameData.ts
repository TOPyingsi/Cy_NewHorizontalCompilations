import { _decorator, JsonAsset, sys } from 'cc';
import { TLWLSJ_Weapon } from './TLWLSJ_Weapon';
import { TLWLSJ_BULLET, TLWLSJ_CAPACITY, PROPS, TLWLSJ_WEAPON, TLWLSJ_WEAPONTYPE } from './TLWLSJ_Constant';
import { TLWLSJ_Gun } from './TLWLSJ_Gun';
import { TLWLSJ_Bullet } from './TLWLSJ_Bullet';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_GameData')
export class TLWLSJ_GameData {
    private static _instance: TLWLSJ_GameData = null;
    public static get Instance(): TLWLSJ_GameData {
        if (!this._instance) {
            this.ReadDate();
            this.autoSave();
        }
        return this._instance;
    }
    public GunData: { [key: string]: TLWLSJ_Weapon | null } = {
    }

    public BulletData: { [key: string]: TLWLSJ_Bullet } = {
    }

    public PropsData: { [key: string]: number } = {
        "药丸": 0,
        "参考答案": 0,
        "咖啡": 0,
    }
    public static DateSave() {
        let json = JSON.stringify(TLWLSJ_GameData.Instance);
        sys.localStorage.setItem("TLWLSJ_GAMEDATA", json);
        console.log("游戏存档");
    }

    public static ReadDate() {
        let name = sys.localStorage.getItem("TLWLSJ_GAMEDATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            TLWLSJ_GameData._instance = Object.assign(new TLWLSJ_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            TLWLSJ_GameData._instance = new TLWLSJ_GameData();
        }
    }

    public static getWeaponByName(WeaponName: string): TLWLSJ_Weapon | null {
        // const name: string = ZTool.GetEnumKeyByValue(WEAPON, weapon);
        if (!TLWLSJ_GameData.Instance.GunData[WeaponName]) {
            return null;
        }
        return TLWLSJ_GameData.Instance.GunData[WeaponName]
    }

    public static addWeaponByType(type: TLWLSJ_WEAPON) {
        const name: string = TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, type);
        TLWLSJ_GameData.addWeaponByName(name);
    }

    public static addWeaponByName(name: string) {
        if (!TLWLSJ_GameData.Instance.GunData[name]) {
            BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "WeaponData").then((jsonAsset: JsonAsset) => {
                const json = jsonAsset.json[name];
                if (json.type == TLWLSJ_WEAPONTYPE.MELEE) {
                    console.log(`添加近战武器：${name}`);
                    TLWLSJ_GameData.Instance.GunData[name] = new TLWLSJ_Weapon(json.type, json.harm, json.coolingTime, json.armorPenetration);
                } else if (json.type == TLWLSJ_WEAPONTYPE.RANGED) {
                    console.log(`添加远程武器：${name}`);
                    const capacity: number = TLWLSJ_CAPACITY[name];
                    TLWLSJ_GameData.Instance.GunData[name] = new TLWLSJ_Gun(json.type, json.harm, json.coolingTime, json.armorPenetration, capacity);
                }
                if (name === "破片手雷") {
                    TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.push(TLWLSJ_WEAPON.破片手雷);
                } else if (name === "高爆手雷") {
                    TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.push(TLWLSJ_WEAPON.高爆手雷);
                }
                TLWLSJ_GameData.DateSave();
                TLWLSJ_PrefsManager.Instance.saveData();
            })
        }
    }

    public static loseWeaponByName(name: string) {
        if (TLWLSJ_GameData.Instance.GunData[name]) {
            delete TLWLSJ_GameData.Instance.GunData[name];
            TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.splice(TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.indexOf(TLWLSJ_WEAPON[name]), 1);
            TLWLSJ_PrefsManager.Instance.saveData();
            TLWLSJ_GameData.DateSave();
        }
    }

    public static addBulletByType(type: TLWLSJ_BULLET, num: number = 1) {
        const name: string = TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_BULLET, type);
        TLWLSJ_GameData.addBulletByName(name, num);
    }

    public static addBulletByName(name: string, num: number = 1) {
        if (!TLWLSJ_GameData.Instance.BulletData[name]) {
            //创建子弹
            BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "AmmoData").then((jsonAsset: JsonAsset) => {
                const json = jsonAsset.json[name];
                let belongTo: TLWLSJ_WEAPON[] = [];
                const keys: string[] = json.belongTo;
                for (let index = 0; index < keys.length; index++) {
                    const key = keys[index];
                    belongTo.push(TLWLSJ_WEAPON[key]);
                }
                TLWLSJ_GameData.Instance.BulletData[name] = new TLWLSJ_Bullet(name, belongTo, json.harm, json.armorPenetration, num);
                TLWLSJ_GameData.DateSave();
            })
            if (name === "破片手雷" || name === "高爆手雷") {
                TLWLSJ_GameData.addWeaponByName(name);
            }
        } else {
            TLWLSJ_GameData.Instance.BulletData[name].Count += num;
        }
        TLWLSJ_GameData.DateSave();
    }

    /**
     * 使用子弹
     * @param name 子弹名称
     * @param num 使用子弹数量
     * @returns 使用子弹之后子弹数量是否大于0
     */
    public static subBulletByName(name: string, num: number = 1): boolean {
        if (TLWLSJ_GameData.Instance.BulletData[name]) {
            TLWLSJ_GameData.Instance.BulletData[name].Count -= num;
            if (TLWLSJ_GameData.Instance.BulletData[name].Count <= 0) {
                delete TLWLSJ_GameData.Instance.BulletData[name];
                // if (name === "破片手雷" || name === "高爆手雷") {
                //     GameData.loseWeaponByName(name);
                // }
                return false;
            }
        }
        TLWLSJ_GameData.DateSave();
        return true;
    }


    public static getBulletNumByName(name: string) {
        if (!TLWLSJ_GameData.Instance.BulletData[name]) {
            return 0;
        } else {
            return TLWLSJ_GameData.Instance.BulletData[name].Count;
        }
    }

    public static getBulletByWeapon(weapon: TLWLSJ_WEAPON): TLWLSJ_Bullet[] {
        const result: TLWLSJ_Bullet[] = [];
        for (const name in TLWLSJ_GameData.Instance.BulletData) {
            if (TLWLSJ_GameData.Instance.BulletData[name].BelongTo.findIndex(e => e == weapon) != -1) {
                result.push(TLWLSJ_GameData.Instance.BulletData[name]);
            }
        }
        return result;
    }

    public static addPropByType(type: PROPS, num: number = 1) {
        const name: string = TLWLSJ_Tool.GetEnumKeyByValue(PROPS, type);
        if (TLWLSJ_GameData.Instance.PropsData[name] == undefined) {
            console.error(`没有该道具！`);
        } else {
            TLWLSJ_GameData.Instance.PropsData[name] += num;
        }
        TLWLSJ_GameData.DateSave();
    }

    public static getPropByType(type: PROPS): number {
        const name: string = TLWLSJ_Tool.GetEnumKeyByValue(PROPS, type);
        if (!TLWLSJ_GameData.Instance.PropsData[name]) {
            console.error(`没有该道具！`);
            return 0;
        } else {
            return TLWLSJ_GameData.Instance.PropsData[name];
        }
    }

    public static userPropByType(type: PROPS) {
        const name: string = TLWLSJ_Tool.GetEnumKeyByValue(PROPS, type);

        if (!TLWLSJ_GameData.Instance.PropsData[name]) {
            // console.error(`没有该道具！请前往商店购买`);
            return;
        } else {
            TLWLSJ_GameData.Instance.PropsData[name]--;
        }
    }


    public static autoSave(time: number = 30) {
        //定时存档
        setInterval(() => {
            TLWLSJ_GameData.DateSave();
        }, time * 1000)
    }

}