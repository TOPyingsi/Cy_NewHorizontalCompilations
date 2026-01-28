import { _decorator, Component, director, Node, sys } from 'cc';
import { SJZXD_Constant, SJZXD_PropType } from './SJZXD_Constant';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_EventManager } from './SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_GameData')
export class SJZXD_GameData extends Component {
    private static _instance: SJZXD_GameData = null;
    public static get Instance(): SJZXD_GameData {
        if (!this._instance) {
            this.ReadDate();
        }
        return this._instance;
    }


    public Money: number = 100000;//钱

    public Skin: string = "修勾";//当前选择皮肤
    public SkinData: string[] = ["修勾", "杰峰", "贤勾", "炼狱犬", "不死勾"];//已经解锁的皮肤


    public ChanggeMoney(num: number) {
        this.Money += num;
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.货币变动, this.Money);
    }

    public GameData: number[] = [0, 1, 1, 1, 0, 0];//、0上局撤离是否成功(0成功1失败)1,上局撤离是否结算(0未结算1结算)2遗失是否拾取(0没拾取1拾取)
    //3.是否强制显示装备(0表示否)4是否第一次进入游戏0为是5.新手引导是否走完
    public AgentSelect: string = "修勾";//干员选择
    public AgentData: { Name: string, Level: number }[] = [//0级别表示未解锁
        { Name: "修勾", Level: 1 },
        { Name: "杰峰", Level: 0 },
        { Name: "贤勾", Level: 0 },
        { Name: "炼狱犬", Level: 0 },
        { Name: "不死勾", Level: 0 },
    ]

    public PlayerData: string[] = ["迷彩MP7", "无", "无"];//0武器1头盔2防弹衣
    public UnlockScene: string[] = ["荒野营地"];//已解锁关卡
    public LaboratoryLevel: number[] = [0, 0, 0, 0];//实验室等级(基因(加血)，武器(伤害)，情报(爆率)，仓储(储存))
    public Enhance: string = "无";//增强针使用
    //背包数据
    KnapsackData: string[] = [
    ];//背包数据

    //收藏馆数据
    BoxroomData: { Name: string, Level: number }[] = [
    ];

    //遗失数据
    LoseData: string[] = [
    ];

    /**
     * 往背包中添加道具，成功返回true，失败返回false
     * @param Name 道具名字
     * @param Num  道具数量
     * @returns 
     */
    public pushKnapsackData(Name: string): boolean {
        this.KnapsackData.push(Name);
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.背包添加物品, Name);
        return true;

    }
    /**
        * 往背包中扣除道具，成功返回true，失败返回false
        * @param Name 道具名字
        * @param Num  道具数量
        * @returns 
        */
    public SubKnapsackData(Name: string, Num: number): boolean {
        for (let i = 0; i < this.KnapsackData.length; i++) {
            if (this.KnapsackData[i] == Name) {
                this.KnapsackData.splice(i, 1);
                SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.背包删除物品, Name);
            }
        }
        return false;
    }

    //计算当前背包中所有物体的负重
    public GetKnapsackWeight(): number {
        let weight: number = 0;
        for (let i = 0; i < this.KnapsackData.length; i++) {
            weight += SJZXD_Constant.getPropDataByName(this.KnapsackData[i])?.weight;
        }
        return weight;
    }


    //仓库数据
    WarehouseData: { Name: string, Num: number }[] = [{ Name: "CPU", Num: 1 }];//仓库数据

    //返回仓库中物品数量
    public getWarehouseNum(Name: string): number {
        let num: number = 0;
        num = this.WarehouseData.find(x => x.Name == Name)?.Num;
        if (!num) num = 0;
        return num;
    }
    /**
        * 往仓库中扣除道具，成功返回true，失败返回false
        * @param Name 道具名字
        * @param Num  道具数量
        * @returns 
        */
    public SubWarehouseData(Name: string, Num: number): boolean {
        for (let i = 0; i < this.WarehouseData.length; i++) {
            if (this.WarehouseData[i].Name == Name) {
                if (this.WarehouseData[i].Num >= Num) {
                    this.WarehouseData[i].Num -= Num;
                    SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.仓库物品变动, this.WarehouseData[i].Name, this.WarehouseData[i].Num);
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;
    }
    /**
         * 往仓库中添加道具，成功返回true，失败返回false
         * @param Name 道具名字
         * @param Num  道具数量
         * @returns 
         */
    public pushWarehouseData(Name: string, Num: number): boolean {
        for (let i = 0; i < this.WarehouseData.length; i++) {
            if (this.WarehouseData[i].Name == Name) {
                this.WarehouseData[i].Num += Num;
                SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.仓库物品变动, Name, this.WarehouseData[i].Num);
                return true;
            }
        }

        this.WarehouseData.push({ Name: Name, Num: Num });
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.仓库物品变动, Name, Num);
        return true;
    }

    //切换装备（直接创建新的装备，如果需要扣除需要手动写）
    public ChanggeEquip(Name: string) {
        let EquipType = SJZXD_Constant.getPropDataByName(Name).type;
        if (EquipType == SJZXD_PropType.武器) {
            if (this.PlayerData[0] != "无") {
                this.pushWarehouseData(this.PlayerData[0], 1);
            }
            this.PlayerData[0] = Name;
        }
        if (EquipType == SJZXD_PropType.防具) {
            if (this.PlayerData[2] != "无") {
                this.pushWarehouseData(this.PlayerData[2], 1);
            }
            this.PlayerData[2] = Name;
        }
        if (EquipType == SJZXD_PropType.头盔) {
            if (this.PlayerData[1] != "无") {
                this.pushWarehouseData(this.PlayerData[1], 1);
            }
            this.PlayerData[1] = Name;
        }
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.装备切换);
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.龙骨_主角刷新);
    }
    //清空主角装备
    public ClearEquip() {
        this.PlayerData[0] = "科技之刃";
        this.PlayerData[1] = "无";
        this.PlayerData[2] = "无";
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.装备切换);
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.龙骨_主角刷新);
    }
    //将背包物质全部挪到仓库
    public MoveAllKnapsackToWarehouse() {
        for (let i = 0; i < this.KnapsackData.length; i++) {
            this.pushWarehouseData(this.KnapsackData[i], 1);
        }
        this.ClearKnapsack();
    }
    //清空背包所有道具
    public ClearKnapsack() {
        this.KnapsackData = [];
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.背包删除所有物品);
    }

    //通过干员名字获得等级
    public GetAgentLevelByName(Name: string): number {
        for (let i = 0; i < this.AgentData.length; i++) {
            if (this.AgentData[i].Name == Name) {
                return this.AgentData[i].Level;
            }
        }
        console.log("Error:没有找到对应干员等级！");
        return 0;
    }

    //给干员升级
    public UpAgentLevel(Name: string) {
        for (let i = 0; i < this.AgentData.length; i++) {
            if (this.AgentData[i].Name == Name) {
                this.AgentData[i].Level++;
                return;
            }
        }
        console.log("Error:没有找到对应干员！");
    }

    //通过名字获得收藏馆等级
    public GetBoxroomLevelByName(Name: string): number {
        for (let i = 0; i < this.BoxroomData.length; i++) {
            if (this.BoxroomData[i].Name == Name) {
                return this.BoxroomData[i].Level;
            }
        }
        return 0;
    }
    //通过名字收藏馆取出
    public BoxroomLevelToZero(Name: string) {
        for (let i = 0; i < this.BoxroomData.length; i++) {
            if (this.BoxroomData[i].Name == Name) {
                this.BoxroomData[i].Level = 0;
            }
        }
    }

    //通过名字升级馆藏数据(升一级)
    public UpBoxroomLevel(Name: string) {
        for (let i = 0; i < this.BoxroomData.length; i++) {
            if (this.BoxroomData[i].Name == Name) {
                this.BoxroomData[i].Level++;
                return;
            }
        }
        this.BoxroomData.push({ Name: Name, Level: 1 });
    }

    public TimeDate: number[] = [];
    public static DateSave() {
        let json = JSON.stringify(SJZXD_GameData.Instance);
        sys.localStorage.setItem("SJZXD_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("SJZXD_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            SJZXD_GameData._instance = Object.assign(new SJZXD_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            SJZXD_GameData._instance = new SJZXD_GameData();

        }


    }

    //获得遗失数据的道具
    public GetLostDataProp() {
        this.GameData[2] = 1;
        let data: { Name: string, Num: number }[] = [];
        for (let i = 0; i < this.LoseData.length; i++) {
            this.pushWarehouseData(this.LoseData[i], 1);
            data.push({ Name: this.LoseData[i], Num: 1 });
        }
        SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.ReceiveAwardPanel, [data]);
        director.getScene().emit(SJZXD_EventManager.找回遗失);
    }

    //解锁下一关
    public UnlockNextScene(SceneName: string) {
        let nextName: string = ""
        switch (SceneName) {
            case "荒野营地": nextName = "沙漠遗迹"; break;
            case "沙漠遗迹": nextName = "修狗小镇"; break;
            case "修狗小镇": nextName = "军事基地"; break;
            case "军事基地": nextName = "实验室"; break;
        }
        if (nextName != "") {
            if (this.UnlockScene.indexOf(nextName) == -1) {
                this.UnlockScene.push(nextName);
            }
        }
    }
}


