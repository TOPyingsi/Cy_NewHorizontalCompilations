import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;



@ccclass('KKDKF_GameData')
export class KKDKF_GameData {
    private static _instance: KKDKF_GameData = null;
    public static get Instance(): KKDKF_GameData {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }


    public Money: number = 100;//钱
    public GameData: number[] = [1, 0, 1, 0];//0.等级1.经验2当前天数3是否看过教程
    public CoffeeLevel: number[] = [0, 0, 0, 0, 0, 0, 0, 0];


    public UnLook: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0];//0-3:墙纸解锁~~4-7灯8-11高脚凳12-13椅子14-15收银台
    public UnLookPrice: number[] = [0, 500, 1000, 1500, 0, 200, 400, 800, 0, 500, 1000, 2000, 0, 400, 0, 2000];//价格

    public BGState: number[] = [0, 4, 8, 12, 14];//0:墙纸id，1.灯，2.高脚凳id，3.椅子4.收银台id
    public TimeDate: number[] = [];
    public static DateSave() {
        let json = JSON.stringify(KKDKF_GameData.Instance);
        sys.localStorage.setItem("KKDKF_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("KKDKF_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            KKDKF_GameData._instance = Object.assign(new KKDKF_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            KKDKF_GameData._instance = new KKDKF_GameData();

        }
        //新一天判断
        // var nowdate = new Date();
        // var year = nowdate.getFullYear();           //年
        // var month = nowdate.getMonth() + 1;         //月 获取当前月（注意：返回数值为0~11，需要自己+1来显示）
        // var date = nowdate.getDate();               //日
        // if (year != GameData.Instance.TimeDate[0] || month != GameData.Instance.TimeDate[1] || date != GameData.Instance.TimeDate[2]) {//新的一天
        //     GameData.Instance.TimeDate[0] = year;
        //     GameData.Instance.TimeDate[1] = month;
        //     GameData.Instance.TimeDate[2] = date;
        //     GameData.Instance.TimeDate[3] = 1;

        // }

    }
}


