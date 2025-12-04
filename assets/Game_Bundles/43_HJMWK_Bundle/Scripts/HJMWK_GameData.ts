import { _decorator, JsonAsset, sys } from 'cc';

export class HJMWK_Prop {
    Name: string = "";
    Num: number = 1;
    Gain: number = 1;//增益

    constructor(name: string, num: number, gain: number) {
        this.Name = name;
        this.Num = num;
        this.Gain = gain;
    }
}

export class HJMWK_Skin {
    Name: string = "";
    Have: boolean;
    CurUse: boolean;//增益

    constructor(name: string, have: boolean, use: boolean) {
        this.Name = name;
        this.Have = have;
        this.CurUse = use;
    }
}

export class HJMWK_GameData {


    private static _instance: HJMWK_GameData = null;

    public static get Instance() {
        if (!this._instance) {
            this.ReadDate();
            this.AutoSave(60);
        }
        return this._instance;
    }

    public static DateSave() {
        let json = JSON.stringify(HJMWK_GameData.Instance);
        sys.localStorage.setItem("HJMWK_GameData", json);
        // console.log("游戏存档:HJMWK_GameData");
    }

    public static ReadDate() {
        let name = sys.localStorage.getItem("HJMWK_GameData");
        if (name != "" && name != null) {
            console.log("读取存档");
            HJMWK_GameData._instance = Object.assign(new HJMWK_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            HJMWK_GameData._instance = new HJMWK_GameData();
        }

        // //每天更新
        // const now = new Date();
        // if (HJMWK_GameData.Instance.Date != now.getDate()) {
        //     HJMWK_GameData.Instance.Date = now.getDate();
        //     HJMWK_GameData.Instance.IsSignIn = false;
        // }
    }

    public static AutoSave(time: number = 10) {
        //定时存档
        setInterval(() => {
            HJMWK_GameData.DateSave();
        }, time * 1000)
    }

    public Prop: { [key: string]: HJMWK_Prop } = {
        "木镐": new HJMWK_Prop("木镐", 1, 1),
    };

    public CurProp: string = "木镐";

    public Skins: string[] = ["哈基米"];

    public CurSkin: string = "哈基米";

    public Permits: string[] = [];

    public userData: { [key: string]: number } = {
        "红宝石": 0,
        "绿宝石": 0,
        "金币": 0,
        "钻石": 0,
        "挖矿伤害": 0,
        "挖矿速度": 0,
        "移动速度": 0,
    };

    public IsSignIn: boolean = false;
    public Date: number = 0;
    public IsInit: boolean = true;


    public AddPropByName(name: string, num: number = 1) {
        if (!HJMWK_GameData.Instance.Prop[name]) {
            HJMWK_GameData.Instance.Prop[name] = new HJMWK_Prop(name, 1, 0);
        } else {
            HJMWK_GameData.Instance.Prop[name].Num += num;
        }
        HJMWK_GameData.DateSave();
    }

    // public AddPropByName(name: string, num: number = 1) {
    //     if (!HJMWK_GameData.Instance.Prop[name]) {
    //         BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "PickaxeData").then((jsonAsset: JsonAsset) => {
    //             const json = jsonAsset.json[name];
    //             console.log(`添加武器：${name}`);
    //             HJMWK_GameData.Instance.Prop[name] = new HJMWK_Prop(json.Name, num, json.Gain);
    //             HJMWK_GameData.DateSave();
    //         })
    //     } else {
    //         HJMWK_GameData.Instance.Prop[name].Num += num;
    //         HJMWK_GameData.DateSave();
    //     }
    // }

    // public LosePickaxeByName(name: string, num: number = 1) {
    //     if (HJMWK_GameData.Instance.Prop[name]) {
    //         HJMWK_GameData.Instance.Prop[name].Num -= num;
    //         if (HJMWK_GameData.Instance.Prop[name].Num <= 0) {
    //             delete HJMWK_GameData.Instance.Prop[name];
    //         }
    //         HJMWK_GameData.DateSave();
    //     }
    // }
}


