import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;



@ccclass('GameData')
export class JJHZ_GameData {
    private static _instance: JJHZ_GameData = null;
    public static get Instance(): JJHZ_GameData {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }



    public Unlook: boolean[] = [true, false, false, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true];
    public TimeDate: number[] = [];

    public static DateSave() {
        let json = JSON.stringify(JJHZ_GameData.Instance);
        sys.localStorage.setItem("FJDC_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("FJDC_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            JJHZ_GameData._instance = Object.assign(new JJHZ_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            JJHZ_GameData._instance = new JJHZ_GameData();

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


