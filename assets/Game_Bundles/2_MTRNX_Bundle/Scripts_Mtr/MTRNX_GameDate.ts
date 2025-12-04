import { _decorator, Component, log, Node, sys } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_GameDate')
export class MTRNX_GameDate extends Component {
    private static _instance = null;
    public static get Instance(): MTRNX_GameDate {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }

    public TimeDate: number[] = [2023, 11, 2, 1];//0年1月2日3是否可以签到
    public Money: number = 1000;
    public Debris: number = 100;//碎片
    public PlayerDate: number[] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];//0未解锁，1以及代表等级
    public MiniGameUnLook: boolean[] = [false, false, false, false, false, false, false, false, false, false];//小游戏模式是否解锁
    public CurrentSelect: number = 0;
    public HpLevel: number = 0;//血量升级等级
    public partnerUnLook: number[] = [0, 0, 0, 0, 0, 0];//伙伴0未解锁
    public selectPartner: number = -1;//当前携带伙伴，-1表未携带


    public static DateSave() {
        let json = JSON.stringify(MTRNX_GameDate.Instance);
        sys.localStorage.setItem("DateSave", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("DateSave");
        if (name != "") {
            MTRNX_GameDate._instance = Object.assign(new MTRNX_GameDate(), JSON.parse(name));
        } else {
            MTRNX_GameDate._instance = new MTRNX_GameDate();
        }

        //新一天判断
        var nowdate = new Date();
        var year = nowdate.getFullYear();           //年
        var month = nowdate.getMonth() + 1;         //月 获取当前月（注意：返回数值为0~11，需要自己+1来显示）
        var date = nowdate.getDate();               //日
        if (year != MTRNX_GameDate._instance.TimeDate[0] || month != MTRNX_GameDate._instance.TimeDate[1] || date != MTRNX_GameDate._instance.TimeDate[2]) {//新的一天
            MTRNX_GameDate._instance.TimeDate[0] = year;
            MTRNX_GameDate._instance.TimeDate[1] = month;
            MTRNX_GameDate._instance.TimeDate[2] = date;
            MTRNX_GameDate._instance.TimeDate[3] = 1;
        }
    }



}   
