import { _decorator, Component, Node, sys } from 'cc';
import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
const { ccclass, property } = _decorator;



@ccclass('XYRZZ_GameData')
export class XYRZZ_GameData {
    private static _instance: XYRZZ_GameData = null;
    public static get Instance(): XYRZZ_GameData {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }
    private _money: number = 100;//钱
    public get Money(): number {
        return this._money;
    }
    public set Money(num: number) {
        this._money = num;
        XYRZZ_EventManager.Scene.emit(XYRZZ_MyEvent.ChanggeMoney);
    }
    public GameData: number[] = [0, 0, 1, 1, 0, 0, 0];//0上场的角色ID,1携带的鱼竿,2主角等级3.连点器倍率4.新手礼包领取次数5任务进度6是否完成了新手教程
    //钓法等级(0未解锁)
    public FishingPoleDataLevel: { Name: string, Level: number }[] = [
        { Name: "老汉踩单车", Level: 1 },
        { Name: "打鱼棒法", Level: 0 },
        { Name: "乾坤大挪鱼", Level: 0 },
        { Name: "Z字抖动", Level: 0 },
        { Name: "窜天猴钓法", Level: 0 },
        { Name: "飞天无极钓", Level: 0 },
        { Name: "飞天无极钓圆满", Level: 0 },
        { Name: "回首掏", Level: 0 },
        { Name: "太极钓法", Level: 0 },
    ];
    //钓竿等级(0未解锁)
    public FishingPoleLevel: { Name: string, Level: number }[] = [
        { Name: "普通鱼竿", Level: 1 },
        { Name: "碳纤维鱼竿", Level: 0 },
        { Name: "螺纹鱼竿", Level: 0 },
        { Name: "柳枝鱼竿", Level: 0 },
        { Name: "定海神竿", Level: 0 }
    ];
    //道具数据（有升级成本的道具说明是单例道具，无升级成本的道具level代表数量）
    public PropData: { Name: string, Level: number, Isapparel: boolean }[] = [
        { Name: "珍珠贝壳", Level: 0, Isapparel: false },
        { Name: "招财橘猫", Level: 0, Isapparel: false },
        { Name: "帐篷", Level: 0, Isapparel: false },
        { Name: "钓具箱", Level: 0, Isapparel: false },
        { Name: "渔船", Level: 0, Isapparel: false },
        { Name: "深海珍珠", Level: 0, Isapparel: false },
    ]
    public FishRecord: number[] = [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];//记录钓鱼多少次

    public TimeDate: number[] = [];

    public static DateSave() {
        let json = JSON.stringify(XYRZZ_GameData.Instance);
        sys.localStorage.setItem("XYRZZ_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("XYRZZ_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            XYRZZ_GameData._instance = Object.assign(new XYRZZ_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            XYRZZ_GameData._instance = new XYRZZ_GameData();

        }
        //新一天判断
        var nowdate = new Date();
        var year = nowdate.getFullYear();           //年
        var month = nowdate.getMonth() + 1;         //月 获取当前月（注意：返回数值为0~11，需要自己+1来显示）
        var date = nowdate.getDate();               //日
        if (year != XYRZZ_GameData.Instance.TimeDate[0] || month != XYRZZ_GameData.Instance.TimeDate[1] || date != XYRZZ_GameData.Instance.TimeDate[2]) {//新的一天
            XYRZZ_GameData.Instance.TimeDate[0] = year;
            XYRZZ_GameData.Instance.TimeDate[1] = month;
            XYRZZ_GameData.Instance.TimeDate[2] = date;
            XYRZZ_GameData.Instance.TimeDate[3] = 1;

        }

    }
}


