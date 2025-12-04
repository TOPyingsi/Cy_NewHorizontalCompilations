import { _decorator, Component, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XSHY_GameData')
export class XSHY_GameData extends Component {
    private static _instance: XSHY_GameData = null;
    public static get Instance(): XSHY_GameData {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }


    public Money: number = 100;//钱
    public GameData: number[] = [];



    public UnLook: number[] = [];


    public TimeDate: number[] = [];
    public static DateSave() {
        let json = JSON.stringify(XSHY_GameData.Instance);
        sys.localStorage.setItem("XSHY_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("XSHY_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            XSHY_GameData._instance = Object.assign(new XSHY_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            XSHY_GameData._instance = new XSHY_GameData();

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


