import { _decorator, Component, director, Node, sys } from 'cc';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
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


    private money: number = 100;//钱
    public get Money() {
        return this.money;
    }
    public set Money(num: number) {
        this.money = num;
        director.getScene().emit(XSHY_EasyControllerEvent.ChanggeMoney, num);
    }

    public GameData: number[] = [0, 0, 0];//0经验1最高连胜2是否完成新手引导




    public UnLook: string[] = ["鼬", "四代目", "佐助", "纲手",];//解锁的角色


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


