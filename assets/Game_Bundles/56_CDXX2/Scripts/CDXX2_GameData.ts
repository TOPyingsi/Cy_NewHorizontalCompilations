import { _decorator, JsonAsset, sys } from 'cc';
import { CDXX2_Pickaxe } from './CDXX2_Pickaxe';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX2_ELIXIR, CDXX2_ELIXIR_CONFIG, CDXX2_NEXT_REALM, CDXX2_REALM } from './CDXX2_Constant';
import CDXX2_PlayerController from './CDXX2_PlayerController';
const { ccclass, } = _decorator;

//全局单例存档中心——第一次访问时自动读档/补档并每 60 秒定时存盘，
//集中管理玩家镐子、丹药、资源、战力、境界、关卡进度，同时提供静态工具函数：加减镐子、丹药、经验，自动突破境界并即时存盘

@ccclass('CDXX2_GameData')
export class CDXX2_GameData {
    private static _instance: CDXX2_GameData = null;

    public static get Instance() {
        if (!this._instance) {
            this.ReadDate();
            this.AutoSave(60);
        }
        return this._instance;
    }

    public static DateSave() {
        let json = JSON.stringify(CDXX2_GameData.Instance);
        sys.localStorage.setItem("CDXX2_UserData", json);
        console.log("游戏存档:CDXX2_GameData");
    }

    public static ReadDate() {
        let name = sys.localStorage.getItem("CDXX2_UserData");
        if (name != "" && name != null) {
            console.log("读取存档");
            const savedData = JSON.parse(name);
            // 删除旧存档中的 ZL 属性（因为 ZL 现在是只读的 getter）
            delete savedData.ZL;
            CDXX2_GameData._instance = Object.assign(new CDXX2_GameData(), savedData);
            
            // 补充缺少的userData属性（防止旧存档丢失新属性）
            const defaultUserData = new CDXX2_GameData().userData;
            for (let key in defaultUserData) {
                if (CDXX2_GameData._instance.userData[key] === undefined) {
                    CDXX2_GameData._instance.userData[key] = defaultUserData[key];
                }
            }
        } else {
            console.log("新建存档");
            CDXX2_GameData._instance = new CDXX2_GameData();
        }

        //每天更新
        const now = new Date();
        if (CDXX2_GameData.Instance.Date != now.getDate()) {
            CDXX2_GameData.Instance.Date = now.getDate();
            CDXX2_GameData.Instance.IsSignIn = false;
        }
    }

    public static AutoSave(time: number = 10) {
        //定时存档
        setInterval(() => {
            CDXX2_GameData.DateSave();
        }, time * 1000)
    }

    public Pickaxe: { [key: string]: CDXX2_Pickaxe } = {};
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
        // 新增道具
        "倍率丹": 0,
        "碎片": 0,
        "灵石": 0,
        "仙石": 0,
        "速度面包": 0,
        "灵兽boss属性丹": 0,
        "兽王boss属性丹": 0,
        "仙兽boss属性丹": 0,
        "内丹": 0,
        "哈基米南北绿豆": 0,
        // 倍率丹效果（当前倍率，默认1）
        "丹药倍率": 1,
        // 速度面包效果（额外速度加成）
        "速度加成": 0,
        // 怪物塔进度
        "怪物塔层数": 1,
        // 轮回相关
        "轮回次数": 0,
        // 属性加成（吃特殊丹药累计的百分比，如1.05表示+5%）
        "生命加成": 1,
        "攻击加成": 1,
        // 皮肤
        "当前皮肤": 0,
        // 皮肤解锁状态（默认第一个皮肤已解锁）
        "皮肤1已解锁": 1,
        "皮肤2已解锁": 0,
        "皮肤3已解锁": 0,
        "皮肤4已解锁": 0,
        "皮肤5已解锁": 0,
        "皮肤6已解锁": 0,
        "皮肤7已解锁": 0,
        "皮肤8已解锁": 0,
        // 签到系统
        "在线时长": 0,
        "签到奖励1已领取": 0,
        "签到奖励2已领取": 0,
        "签到奖励3已领取": 0,
        "签到奖励4已领取": 0,
        "签到奖励5已领取": 0,
        "签到奖励6已领取": 0,
        "上次登录日期": 0,  // 存储为时间戳的日期部分
    };
    public Elixir: { [key: string]: CDXX2_ELIXIR } = {

    };
    public IsSignIn: boolean = false;
    public Date: number = 0;
    public IsInit: boolean = true;
    public CurHold: string = "";//当前持有
    public CurMap: number = 0;
    public CurEnemy: number = 0;
    public Realm: CDXX2_REALM = CDXX2_REALM.筑基初期;
    public CurExp: number = 0;//当前经验值
    public HP: number = 10;//玩家生命值
    public Harm: number = 1;//玩家伤害
    public get ZL(): number {
        return Math.floor(this.HP * 0.5 + this.Harm * 0.5);
    }
    public IsMuted: boolean = false;
    
    // 轮回相关数据
    public ReincarnationCount: number = 0;  // 轮回次数
    public ElixirBonus: number = 1;         // 吃丹收益倍率（每次轮回+1）
    public HPBonus: number = 1;             // 生命加成倍率（每次轮回+1，即+100%）
    public HarmBonus: number = 1;           // 伤害加成倍率（每次轮回+1，即+100%）
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
        if (!CDXX2_GameData.Instance.Pickaxe[name]) {
            // 不再加载JSON，直接创建武器对象
            CDXX2_GameData.Instance.Pickaxe[name] = new CDXX2_Pickaxe(name, 1);
            console.log(`添加武器：${name}`);
            CDXX2_GameData.DateSave();
        } else {
            CDXX2_GameData.Instance.Pickaxe[name].Num++;
            CDXX2_GameData.DateSave();
        }
    }

    public static LosePickaxeByName(name: string, num: number = 1) {
        if (CDXX2_GameData.Instance.Pickaxe[name]) {
            CDXX2_GameData.Instance.Pickaxe[name].Num -= num;
            if (CDXX2_GameData.Instance.Pickaxe[name].Num <= 0) {
                delete CDXX2_GameData.Instance.Pickaxe[name];
            }
            CDXX2_GameData.DateSave();
        }
    }

    public static AddElixirByName(name: string) {
        if (!CDXX2_ELIXIR_CONFIG.has(name)) {
            console.error(`升级你的稿子没有丹药：${name}`);
            return;
        }
        if (!CDXX2_GameData.Instance.Elixir[name]) {
            const elixir: CDXX2_ELIXIR = CDXX2_ELIXIR_CONFIG.get(name);
            CDXX2_GameData.Instance.Elixir[name] = new CDXX2_ELIXIR(elixir.Name, elixir.Count, elixir.Amp_JY, elixir.Amp_HP, elixir.Amp_HARM, elixir.Amp_ZL);
        } else {
            CDXX2_GameData.Instance.Elixir[name].Count++;
        }
        CDXX2_GameData.DateSave();
    }

    public static LoseElixirByName(name: string, num: number = 1) {
        if (CDXX2_GameData.Instance.Elixir[name]) {
            CDXX2_GameData.Instance.Elixir[name].Count -= num;
            if (CDXX2_GameData.Instance.Elixir[name].Count <= 0) {
                delete CDXX2_GameData.Instance.Elixir[name];
            }
            CDXX2_GameData.DateSave();
        }
    }

    public static AddExp(count: number) {
        if (!CDXX2_NEXT_REALM.has(CDXX2_GameData.Instance.Realm)) return;
        CDXX2_GameData.Instance.CurExp += count;
        while (CDXX2_GameData.Instance.CurExp >= CDXX2_GameData.Instance.Realm) {
            CDXX2_GameData.Instance.CurExp -= CDXX2_GameData.Instance.Realm;
            CDXX2_GameData.Instance.Realm = CDXX2_NEXT_REALM.get(CDXX2_GameData.Instance.Realm);
            CDXX2_PlayerController.Instance.ShowRealm();
        }
        CDXX2_GameData.DateSave();
    }

    // 添加碎片
    public static AddFragment(count: number) {
        CDXX2_GameData.Instance.userData["碎片"] += count;
        CDXX2_GameData.DateSave();
    }

    // 使用倍率丹（丹药掉落数量+1）
    public static UseBeiLvDan() {
        if (CDXX2_GameData.Instance.userData["倍率丹"] <= 0) return false;
        CDXX2_GameData.Instance.userData["倍率丹"]--;
        CDXX2_GameData.Instance.userData["丹药倍率"]++;  // 每使用一个倍率丹，掉落+1
        CDXX2_GameData.DateSave();
        return true;
    }

    // 获取当前丹药额外掉落数量
    public static GetElixirMultiplier(): number {
        return CDXX2_GameData.Instance.userData["丹药倍率"] || 1;
    }

    // 使用速度面包
    public static UseSpeedBread(speedBonus: number = 0.5) {
        if (CDXX2_GameData.Instance.userData["速度面包"] <= 0) return false;
        CDXX2_GameData.Instance.userData["速度面包"]--;
        CDXX2_GameData.Instance.userData["速度加成"] += speedBonus;
        CDXX2_GameData.DateSave();
        return true;
    }

    // 使用灵兽boss属性丹（生命值和攻击力+1%）
    public static UseLingShouBossDan() {
        if (CDXX2_GameData.Instance.userData["灵兽boss属性丹"] <= 0) return false;
        CDXX2_GameData.Instance.userData["灵兽boss属性丹"]--;
        CDXX2_GameData.Instance.HP = Math.floor(CDXX2_GameData.Instance.HP * 1.01);
        CDXX2_GameData.Instance.Harm = Math.floor(CDXX2_GameData.Instance.Harm * 1.01);
        CDXX2_GameData.DateSave();
        return true;
    }

    // 使用仙兽boss属性丹（生命值和攻击力+3%）
    public static UseXianShouBossDan() {
        if (CDXX2_GameData.Instance.userData["仙兽boss属性丹"] <= 0) return false;
        CDXX2_GameData.Instance.userData["仙兽boss属性丹"]--;
        CDXX2_GameData.Instance.HP = Math.floor(CDXX2_GameData.Instance.HP * 1.03);
        CDXX2_GameData.Instance.Harm = Math.floor(CDXX2_GameData.Instance.Harm * 1.03);
        CDXX2_GameData.DateSave();
        return true;
    }

    // 碎片换灵石
    public static ExchangeFragmentToLingShi(fragmentCount: number) {
        const rate = 100; // 100碎片换1灵石
        if (CDXX2_GameData.Instance.userData["碎片"] < fragmentCount) return false;
        const lingShiCount = Math.floor(fragmentCount / rate);
        if (lingShiCount <= 0) return false;
        CDXX2_GameData.Instance.userData["碎片"] -= lingShiCount * rate;
        CDXX2_GameData.Instance.userData["灵石"] += lingShiCount;
        CDXX2_GameData.DateSave();
        return true;
    }

    // 灵石换仙石
    public static ExchangeLingShiToXianShi(lingShiCount: number) {
        const rate = 100; // 100灵石换1仙石
        if (CDXX2_GameData.Instance.userData["灵石"] < lingShiCount) return false;
        const xianShiCount = Math.floor(lingShiCount / rate);
        if (xianShiCount <= 0) return false;
        CDXX2_GameData.Instance.userData["灵石"] -= xianShiCount * rate;
        CDXX2_GameData.Instance.userData["仙石"] += xianShiCount;
        CDXX2_GameData.DateSave();
        return true;
    }

    // 添加特殊道具
    public static AddSpecialProp(name: string, count: number = 1) {
        if (CDXX2_GameData.Instance.userData[name] !== undefined) {
            CDXX2_GameData.Instance.userData[name] += count;
            CDXX2_GameData.DateSave();
            return true;
        }
        return false;
    }
    

}


