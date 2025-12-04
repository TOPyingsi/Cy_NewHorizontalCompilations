import { _decorator, Component, director, Node, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_GameData')
export class XYMJ_GameData extends Component {
    private static _instance: XYMJ_GameData = null;
    public static get Instance(): XYMJ_GameData {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }


    public Money: number = 100;//钱
    public GoldBar: number = 0;//金条
    public Skin: string = "哈基米0";//当前选择皮肤
    public SkinData: string[] = ["哈基米0", "微笑"];//已经解锁的皮肤
    public ChanggeMoney(num: number) {
        this.Money += num;
        director.getScene().emit("货币修改");
    }
    public ChanggeGoldBar(num: number) {
        this.GoldBar += num;
        director.getScene().emit("货币修改");
    }
    public GameData: number[] = [1, 0, 0, 0];//0.等级1.赛季经验2巨龙传说锻造进度3至尊天极武士锻造进度
    public SportsCompetitionSeasonData: number[] = [0, 0, 0, 0, 0, 0, 0, 0];//0未领取1领取
    //背包数据
    KnapsackData: { Name: string, Num: number }[] = [{ Name: "尺子", Num: 1 }];//背包数据，最大20个

    /**
     * 往背包中添加道具，成功返回true，失败返回false
     * @param Name 道具名字
     * @param Num  道具数量
     * @returns 
     */
    public pushKnapsackData(Name: string, Num: number): boolean {
        for (let i = 0; i < this.KnapsackData.length; i++) {
            if (this.KnapsackData[i].Name == Name) {
                this.KnapsackData[i].Num += Num;
                director.getScene().emit("刷新仓库背包", this.KnapsackData[i].Name, this.KnapsackData[i].Num);
                return true;
            }
        }
        let len = 0;
        for (let j = 0; j < this.KnapsackData.length; j++) {
            if (this.KnapsackData[j].Num > 0) {
                len += 1;
            }
        }
        if (len >= 20) {
            return false;
        } else {
            this.KnapsackData.push({ Name: Name, Num: Num });
            director.getScene().emit("刷新仓库背包", Name, Num);
            return true;
        }
    }
    /**
        * 往背包中扣除道具，成功返回true，失败返回false
        * @param Name 道具名字
        * @param Num  道具数量
        * @returns 
        */
    public SubKnapsackData(Name: string, Num: number): boolean {
        for (let i = 0; i < this.KnapsackData.length; i++) {
            if (this.KnapsackData[i].Name == Name) {
                if (this.KnapsackData[i].Num >= Num) {
                    this.KnapsackData[i].Num -= Num;
                    director.getScene().emit("刷新仓库背包", this.KnapsackData[i].Name, this.KnapsackData[i].Num);
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;
    }
    //返回背包中物品数量
    public GetPropNum(Name: string): number {
        let num: number = 0;
        num = this.KnapsackData.find(x => x.Name == Name)?.Num;
        return num;
    }

    //仓库数据
    WarehouseData: { Name: string, Num: number }[] = [];//仓库数据，最大40个


    /**
        * 往仓库中扣除道具，成功返回true，失败返回false
        * @param Name 道具名字
        * @param Num  道具数量
        * @returns 
        */
    public SubWarehouseData(pos: number, Num: number): boolean {
        if (this.WarehouseData[pos]?.Num >= Num) {
            this.WarehouseData[pos].Num -= Num;
            if (this.WarehouseData[pos].Num == 0) {
                this.WarehouseData[pos] = null;
            }
            return true;
        }
        return false;
    }

    public TimeDate: number[] = [];
    public static DateSave() {
        let json = JSON.stringify(XYMJ_GameData.Instance);
        sys.localStorage.setItem("XYMJ_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("XYMJ_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            XYMJ_GameData._instance = Object.assign(new XYMJ_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            XYMJ_GameData._instance = new XYMJ_GameData();

        }


    }
}


