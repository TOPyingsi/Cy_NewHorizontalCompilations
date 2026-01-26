import { _decorator, Component, director, Node, sys } from 'cc';
import { XSHZ_EasyControllerEvent } from './XSHZ_EasyController';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_GameData')
export class XSHZ_GameData extends Component {
    private static _instance: XSHZ_GameData = null;
    public static get Instance(): XSHZ_GameData {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }


    private money: number = 100;//钱
    public get Money() {
        return this.money;
    }
    public set Money(num: number) {
        this.money = num;
        director.getScene().emit(XSHZ_EasyControllerEvent.ChanggeMoney, num);
    }

    public GameData: number[] = [0, 0, 0];//0经验1最高连胜2是否完成新手引导




    public UnLook: string[] = ["鼬", "山治", "艾斯", "纲手",];//解锁的角色


    public TimeDate: number[] = [];
    public static DateSave() {
        let json = JSON.stringify(XSHZ_GameData.Instance);
        sys.localStorage.setItem("XSHZ_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("XSHZ_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            XSHZ_GameData._instance = Object.assign(new XSHZ_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            XSHZ_GameData._instance = new XSHZ_GameData();

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


