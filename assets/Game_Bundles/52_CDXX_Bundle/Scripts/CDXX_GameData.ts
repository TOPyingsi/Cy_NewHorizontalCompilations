import { _decorator, JsonAsset, sys } from 'cc';
import { CDXX_Pickaxe } from './CDXX_Pickaxe';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX_ELIXIR, CDXX_ELIXIR_CONFIG, CDXX_NEXT_REALM, CDXX_REALM } from './CDXX_Constant';
import CDXX_PlayerController from './CDXX_PlayerController';
const { ccclass, } = _decorator;

@ccclass('CDXX_GameData')
export class CDXX_GameData {
    private static _instance: CDXX_GameData = null;

    public static get Instance() {
        if (!this._instance) {
            this.ReadDate();
            this.AutoSave(60);
        }
        return this._instance;
    }

    public static DateSave() {
        let json = JSON.stringify(CDXX_GameData.Instance);
        sys.localStorage.setItem("CDXX_UserData", json);
        console.log("游戏存档:CDXX_GameData");
    }

    public static ReadDate() {
        let name = sys.localStorage.getItem("CDXX_UserData");
        if (name != "" && name != null) {
            console.log("读取存档");
            CDXX_GameData._instance = Object.assign(new CDXX_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            CDXX_GameData._instance = new CDXX_GameData();
        }

        //每天更新
        const now = new Date();
        if (CDXX_GameData.Instance.Date != now.getDate()) {
            CDXX_GameData.Instance.Date = now.getDate();
            CDXX_GameData.Instance.IsSignIn = false;
        }
    }

    public static AutoSave(time: number = 10) {
        //定时存档
        setInterval(() => {
            CDXX_GameData.DateSave();
        }, time * 1000)
    }

    public Pickaxe: { [key: string]: CDXX_Pickaxe } = {};
    public userData: { [key: string]: number } = {
        "奖杯": 0,
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
    };
    public Elixir: { [key: string]: CDXX_ELIXIR } = {

    };
    public IsSignIn: boolean = false;
    public Date: number = 0;
    public IsInit: boolean = true;
    public CurHold: string = "";//当前持有
    public CurMap: number = 0;
    public CurEnemy: number = 0;
    public Realm: CDXX_REALM = CDXX_REALM.筑基初期;
    public CurExp: number = 0;//当前经验值
    public HP: number = 10;//玩家生命值
    public Harm: number = 1;//玩家伤害
    public ZL: number = 3;//玩家战力
    public IsMuted: boolean = false;
    /**
     *   紫水晶,
    红曜石碎片,
    蓝曜石碎片,
    只因岩碎片,
    土核心,
    草核心,
    水立方,
    火立方,
    金立方,
    使用增益,
    奖杯,
    金币,
     */
    // public Gold: number = 100;
    // public Trophy: number = 100;

    public static AddPickaxeByName(name: string) {
        if (!CDXX_GameData.Instance.Pickaxe[name]) {
            BundleManager.LoadJson("52_CDXX_Bundle", "PickaxeData").then((jsonAsset: JsonAsset) => {
                const json = jsonAsset.json[name];
                console.log(`添加武器：${name}`);
                CDXX_GameData.Instance.Pickaxe[name] = new CDXX_Pickaxe(json.Name, json.Gain);
                CDXX_GameData.DateSave();
            })
        } else {
            CDXX_GameData.Instance.Pickaxe[name].Num++;
            CDXX_GameData.DateSave();
        }
    }

    public static LosePickaxeByName(name: string, num: number = 1) {
        if (CDXX_GameData.Instance.Pickaxe[name]) {
            CDXX_GameData.Instance.Pickaxe[name].Num -= num;
            if (CDXX_GameData.Instance.Pickaxe[name].Num <= 0) {
                delete CDXX_GameData.Instance.Pickaxe[name];
            }
            CDXX_GameData.DateSave();
        }
    }

    public static AddElixirByName(name: string) {
        if (!CDXX_ELIXIR_CONFIG.has(name)) {
            console.error(`升级你的稿子没有丹药：${name}`);
            return;
        }
        if (!CDXX_GameData.Instance.Elixir[name]) {
            const elixir: CDXX_ELIXIR = CDXX_ELIXIR_CONFIG.get(name);
            CDXX_GameData.Instance.Elixir[name] = new CDXX_ELIXIR(elixir.Name, elixir.Count, elixir.Amp_JY, elixir.Amp_HP, elixir.Amp_HARM, elixir.Amp_ZL);
        } else {
            CDXX_GameData.Instance.Elixir[name].Count++;
        }
        CDXX_GameData.DateSave();
    }

    public static LoseElixirByName(name: string, num: number = 1) {
        if (CDXX_GameData.Instance.Elixir[name]) {
            CDXX_GameData.Instance.Elixir[name].Count -= num;
            if (CDXX_GameData.Instance.Elixir[name].Count <= 0) {
                delete CDXX_GameData.Instance.Elixir[name];
            }
            CDXX_GameData.DateSave();
        }
    }

    public static AddExp(count: number) {
        if (!CDXX_NEXT_REALM.has(CDXX_GameData.Instance.Realm)) return;
        CDXX_GameData.Instance.CurExp += count;
        while (CDXX_GameData.Instance.CurExp >= CDXX_GameData.Instance.Realm) {
            CDXX_GameData.Instance.CurExp -= CDXX_GameData.Instance.Realm;
            CDXX_GameData.Instance.Realm = CDXX_NEXT_REALM.get(CDXX_GameData.Instance.Realm);
            CDXX_PlayerController.Instance.ShowRealm();
        }
        CDXX_GameData.DateSave();
    }

}


