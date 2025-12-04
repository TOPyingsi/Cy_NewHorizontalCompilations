import { _decorator, Component, Node, sys } from 'cc';
import { QSSZG_EventManager, QSSZG_MyEvent } from './QSSZG_EventManager';
const { ccclass, property } = _decorator;



@ccclass('QSSZG_GameData')
export class QSSZG_GameData {
    private static _instance: QSSZG_GameData = null;
    public static get Instance(): QSSZG_GameData {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }
    public aquariumDate: FishData[][] = [//鱼塘鱼数据
        [],
        [],
        [],
        [],
        [],
        []
    ]
    public accessoriesData: accessoriesData[][] = [//鱼塘装饰数据
        [],
        [],
        [],
        [],
        [],
        []
    ]
    public LevelData = {
        "鱼饵等级": 0,
    }
    public aquariumLevel: number[] = [0, -1, -1, -1, -1, -1];//各个鱼塘的等级-1未解锁
    public BgData: number[] = [0, 0, 0, 0, 0, 0];//各个鱼塘的背景选择
    public ShopData: number[] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];//0-11背景是否解锁
    public UnLookFishId: number[] = [];//已经解锁的鱼的id
    private _money: number = 100;//钱
    public get Money() {
        return this._money;
    }
    public set Money(number: number) {
        this._money = number;
        QSSZG_EventManager.Scene.emit(QSSZG_MyEvent.ChanggeMoney);
    }
    public Data: number[] = [];
    public TimeDate: number[] = [];

    public static DateSave() {
        let json = JSON.stringify(QSSZG_GameData.Instance);
        sys.localStorage.setItem("QSSZG_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("QSSZG_DATA");
        if (name != "") {
            QSSZG_GameData._instance = Object.assign(new QSSZG_GameData(), JSON.parse(name));
        } else {
            QSSZG_GameData._instance = new QSSZG_GameData();
        }
        //新一天判断
        var nowdate = new Date();
        var year = nowdate.getFullYear();           //年
        var month = nowdate.getMonth() + 1;         //月 获取当前月（注意：返回数值为0~11，需要自己+1来显示）
        var date = nowdate.getDate();               //日
        if (year != QSSZG_GameData.Instance.TimeDate[0] || month != QSSZG_GameData.Instance.TimeDate[1] || date != QSSZG_GameData.Instance.TimeDate[2]) {//新的一天
            QSSZG_GameData.Instance.TimeDate[0] = year;
            QSSZG_GameData.Instance.TimeDate[1] = month;
            QSSZG_GameData.Instance.TimeDate[2] = date;
            QSSZG_GameData.Instance.TimeDate[3] = 1;

        }

    }
}
@ccclass('FishData')
export class FishData {
    public id: number;
    public Exp: number;
    public aquariumID: number;//所在鱼塘
    constructor(id: number, Exp: number, aquariumID: number) {
        this.id = id;
        this.Exp = Exp;
        this.aquariumID = aquariumID;
    }
}
@ccclass('accessoriesData')
export class accessoriesData {
    public id: number;
    public aquariumID: number;//所在鱼塘
    public Isleft: boolean;//方向
    public X: number;
    public Y: number;
    constructor(id: number, aquariumID: number, Isleft: boolean, X: number, Y: number) {
        this.id = id;
        this.aquariumID = aquariumID;
        this.Isleft = Isleft;
        this.X = X;
        this.Y = Y;
    }
}

