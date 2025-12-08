import { _decorator, Component, director, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XGTS_GameData')
export class XGTS_GameData extends Component {
    private static _instance: XGTS_GameData = null;
    public static get Instance(): XGTS_GameData {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }

    public elixirData: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


    public AddHp: number = 0;
    public AddAtk: number = 0;
    public AddSpeed: number = 0;

    public static DateSave() {
        let json = JSON.stringify(XGTS_GameData.Instance);
        sys.localStorage.setItem("XGTS_GameData", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("XGTS_GameData");
        if (name != "" && name != null) {
            console.log("读取存档");
            XGTS_GameData._instance = Object.assign(new XGTS_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            XGTS_GameData._instance = new XGTS_GameData();

        }
        this.Instance.schedule(() => {
            this.DateSave();
        }, 5)

    }
}


