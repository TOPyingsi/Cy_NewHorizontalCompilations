import { _decorator, JsonAsset, sys } from 'cc';
import { SJNDGZ_Pickaxe } from './SJNDGZ_Pickaxe';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
const { ccclass, } = _decorator;

@ccclass('SJNDGZ_GameData')
export class SJNDGZ_GameData {
    private static _instance: SJNDGZ_GameData = null;

    public static get Instance() {
        if (!this._instance) {
            this.ReadDate();
            this.AutoSave(60);
        }
        return this._instance;
    }

    public static DateSave() {
        let json = JSON.stringify(SJNDGZ_GameData.Instance);
        sys.localStorage.setItem("SJNDGZ_GameData", json);
        console.log("游戏存档:SJNDGZ_GameData");
    }

    public static ReadDate() {
        let name = sys.localStorage.getItem("SJNDGZ_GameData");
        if (name != "" && name != null) {
            console.log("读取存档");
            SJNDGZ_GameData._instance = Object.assign(new SJNDGZ_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            SJNDGZ_GameData._instance = new SJNDGZ_GameData();
        }

        //每天更新
        const now = new Date();
        if (SJNDGZ_GameData.Instance.Date != now.getDate()) {
            SJNDGZ_GameData.Instance.Date = now.getDate();
            SJNDGZ_GameData.Instance.IsSignIn = false;
        }
    }

    public static AutoSave(time: number = 10) {
        //定时存档
        setInterval(() => {
            SJNDGZ_GameData.DateSave();
        }, time * 1000)
    }

    public Pickaxe: { [key: string]: SJNDGZ_Pickaxe } = {};

    public userData: { [key: string]: number } = {
        "奖杯": 10,
        "金币": 10000000,
        "紫水晶": 0,
        "红曜石碎片": 0,
        "蓝曜石碎片": 0,
        "只因岩碎片": 0,
        "草核心": 0,
        "水立方": 0,
        "火立方": 0,
        "金立方": 0,
        "等级": 0,
        "经验": 0,
        "使用增益": 0,
        "当日积分": 0,
        "拥有镐子最高等级": 0,
    };
    public IsSignIn: boolean = false;
    public Date: number = 0;
    public IsInit: boolean = true;
    // public Gold: number = 100;
    // public Trophy: number = 100;

    public static AddPickaxeByName(name: string) {
        if (!SJNDGZ_GameData.Instance.Pickaxe[name]) {
            BundleManager.LoadJson("12_SJNDGZ_Bundle", "PickaxeData").then((jsonAsset: JsonAsset) => {
                const json = jsonAsset.json[name];
                console.log(`添加武器：${name}`);
                SJNDGZ_GameData.Instance.Pickaxe[name] = new SJNDGZ_Pickaxe(json.Name, json.Gain);
                SJNDGZ_GameData.DateSave();
            })
        } else {
            SJNDGZ_GameData.Instance.Pickaxe[name].Num++;
            SJNDGZ_GameData.DateSave();
        }
    }

    public static LosePickaxeByName(name: string, num: number = 1) {
        if (SJNDGZ_GameData.Instance.Pickaxe[name]) {
            SJNDGZ_GameData.Instance.Pickaxe[name].Num -= num;
            if (SJNDGZ_GameData.Instance.Pickaxe[name].Num <= 0) {
                delete SJNDGZ_GameData.Instance.Pickaxe[name];
            }
            SJNDGZ_GameData.DateSave();
        }
    }
}


