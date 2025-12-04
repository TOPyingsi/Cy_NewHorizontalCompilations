import { _decorator, Component, director, Node, sys } from 'cc';
import { HJMSJ_Constant } from './HJMSJ_Constant';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_GameData')
export class HJMSJ_GameData {

    public level: number = 0;
    public levelReward: boolean[] = [false, false, false, false, false, false, false, false, false, false];

    public hp: number = 10;
    public hunger: number = 10;
    public armor: number = 0;
    public curExp: number = 0;
    public maxExp: number = 10;

    public curBagID: number = 0;

    private static instance: HJMSJ_GameData = null;

    public static get Instance(): HJMSJ_GameData {
        if (!HJMSJ_GameData.instance) {
            this.ReadDate();
        }
        return HJMSJ_GameData.instance;
    }
    public curSkin: string = "哈基米";
    SkinData: { Name: string, SkinValue: number, SkinState: string, WearState: string, SkinType: string }[] = [
        { Name: "哈基米", SkinValue: 0, SkinState: "已获得", WearState: "已穿戴", SkinType: "普通" },
        { Name: "娃娃丢", SkinValue: 10, SkinState: "未获得", WearState: "未穿戴", SkinType: "普通" },
        { Name: "漂亮家的番茄狗", SkinValue: 15, SkinState: "未获得", WearState: "未穿戴", SkinType: "普通" },
        { Name: "Popcat", SkinValue: 15, SkinState: "未获得", WearState: "未穿戴", SkinType: "普通" },
        { Name: "屑猫", SkinValue: 20, SkinState: "未获得", WearState: "未穿戴", SkinType: "普通" },
        { Name: "疑惑猫", SkinValue: 25, SkinState: "未获得", WearState: "未穿戴", SkinType: "普通" },
        { Name: "秦皇小猫", SkinValue: 999, SkinState: "未获得", WearState: "未穿戴", SkinType: "金色" },
        { Name: "？？？", SkinValue: 1888, SkinState: "未获得", WearState: "未穿戴", SkinType: "红色" },
    ]

    changeSkin(Name: string) {
        for (let data of this.SkinData) {
            if (data.Name === this.curSkin) {
                data.WearState = "未穿戴";
            }
        }
        for (let skin of this.SkinData) {
            if (skin.Name === Name) {
                skin.WearState = "已穿戴";
                this.curSkin = Name;
                director.getScene().emit("哈基米世界_更换皮肤", Name);
                return true;
            }
        }
        console.log("未找到该皮肤");
        return false;
    }

    buySkin(Name: string) {
        for (let i = 0; i < this.SkinData.length; i++) {
            if (this.SkinData[i].Name === Name) {
                this.SkinData[i].SkinState = "已获得";
                return true;
            }
        }
        console.log("未找到该皮肤数据");
        return false;
    }

    getSkinData(Name: string): { Name: string, SkinValue: number, SkinState: string, WearState: string, SkinType: string } {
        for (let i = 0; i < this.SkinData.length; i++) {
            if (this.SkinData[i].Name == Name) {
                return this.SkinData[i];
            }
        }
        console.log("未找到该皮肤数据");
        return null;
    }

    //防具数据
    ArmorData: { Name: string; Part: string; Defend: number; }[] = [
        { Name: "", Part: "护甲", Defend: 0 },
        { Name: "", Part: "头盔", Defend: 0 },
        { Name: "", Part: "裤子", Defend: 0 },
        { Name: "", Part: "靴子", Defend: 0 },
    ]

    //刷新防具数据
    public refreshArmorData(partName: string, armorName: string) {
        this.armor = 0;
        for (let i = 0; i < this.ArmorData.length; i++) {
            if (this.ArmorData[i].Part === partName) {
                if (armorName === "") {
                    this.ArmorData[i] = { Name: "", Part: partName, Defend: 0 };
                    continue;
                }
                this.ArmorData[i] = HJMSJ_Constant.GetArmorDataByName(armorName);
            }

            this.armor += this.ArmorData[i].Defend;
        }

        director.getScene().emit("哈基米世界_改变护甲值");

    }

    //获取护甲值
    public getArmorNum(): number {
        let num = 0;
        for (let i = 0; i < this.ArmorData.length; i++) {
            if (this.ArmorData[i].Name !== "") {
                num += this.ArmorData[i].Defend;
            }
        }
        return num;
    }

    //获取防具数据
    getArmorDataByPart(Part: string): { Name: string, Part: string, Defend: number } {
        for (let i = 0; i < this.ArmorData.length; i++) {
            if (this.ArmorData[i].Part == Part) {
                return this.ArmorData[i];
            }
        }
        console.log("未找到该装备数据");
        return null;
    }

    //背包数据
    KnapsackData: { Name: string, Num: number, BagID: number }[] = [
        { Name: "木剑", Num: 1, BagID: 0 },
        { Name: "工作台", Num: 1, BagID: 1 },
    ];//背包数据，最大36个

    // //破解版
    // //背包数据
    // KnapsackData: { Name: string, Num: number, BagID: number }[] = [
    //     { Name: "铁剑", Num: 1, BagID: 0 },
    //     { Name: "工作台", Num: 1, BagID: 1 },
    //     { Name: "铁甲", Num: 1, BagID: 2 },
    //     { Name: "铁头盔", Num: 1, BagID: 3 },
    //     { Name: "铁裤子", Num: 1, BagID: 4 },
    //     { Name: "铁靴子", Num: 1, BagID: 5 },
    //     { Name: "铁镐", Num: 1, BagID: 6 },
    //     { Name: "钻石镐", Num: 1, BagID: 7 },
    //     { Name: "铁锭", Num: 20, BagID: 8 },
    //     { Name: "金块", Num: 20, BagID: 9 },
    //     { Name: "钻石", Num: 20, BagID: 10 },
    //     { Name: "木棍", Num: 20, BagID: 11 },
    //     { Name: "金苹果", Num: 1, BagID: 12 },
    //     { Name: "附魔金苹果", Num: 1, BagID: 13 },
    //     { Name: "不死图腾", Num: 1, BagID: 14 },
    //     { Name: "腐肉", Num: 1, BagID: 15 },
    //     { Name: "钻石头盔", Num: 1, BagID: 16 },
    //     { Name: "钻石甲", Num: 1, BagID: 17 },
    //     { Name: "钻石裤子", Num: 1, BagID: 18 },
    //     { Name: "钻石靴子", Num: 1, BagID: 19 },
    //     { Name: "金甲", Num: 1, BagID: 20 },
    //     { Name: "金头盔", Num: 1, BagID: 21 },
    //     { Name: "金裤子", Num: 1, BagID: 22 },
    //     { Name: "金靴子", Num: 1, BagID: 23 },
    //     { Name: "金剑", Num: 1, BagID: 24 },
    //     { Name: "金镐", Num: 1, BagID: 25 },
    //     { Name: "虞美人", Num: 1, BagID: 26 },
    //     { Name: "金裤子", Num: 1, BagID: 27 },
    //     { Name: "金裤子", Num: 1, BagID: 28 },
    //     { Name: "金裤子", Num: 1, BagID: 29 },
    //     { Name: "金裤子", Num: 1, BagID: 30 },
    //     { Name: "金裤子", Num: 1, BagID: 31 },
    //     { Name: "金裤子", Num: 1, BagID: 32 },
    //     { Name: "金裤子", Num: 1, BagID: 33 },
    //     { Name: "金裤子", Num: 1, BagID: 34 },
    //     { Name: "金裤子", Num: 1, BagID: 35 },
    // ];//背包数据，最大36个
    /**
     * 往背包中添加道具，成功返回true，失败返回false
     * @param Name 道具名字
     * @param Num  道具数量
     * @returns 
     */
    public pushKnapsackData(Name: string, Num: number, BagID: number): boolean {
        for (let i = 0; i < this.KnapsackData.length; i++) {
            let type = HJMSJ_Constant.getTypeByName(Name);

            if (this.KnapsackData[i].Name == Name) {
                if (type === "武器" || type === "防具") {
                    break;
                }
                this.KnapsackData[i].Num += Num;
                console.log("放入" + Name + Num + "个");
                console.log(this.KnapsackData);
                return true;
            }
        }
        let len = 0;
        for (let j = 0; j < this.KnapsackData.length; j++) {
            if (this.KnapsackData[j].Num > 0) {
                len += 1;
            }
        }
        console.log("当前背包长度" + len);

        if (len >= 36) {
            UIManager.ShowTip("背包已满!");
            return false;
        } else {
            this.KnapsackData.push({ Name: Name, Num: Num, BagID: BagID });
            console.log("放入" + Name + Num + "个");
            console.log(this.KnapsackData);
            return true;
        }
    }

    public pushKnapsackDataByBagID(Name: string, Num: number, BagID: number): boolean {
        for (let i = 0; i < this.KnapsackData.length; i++) {

            if (this.KnapsackData[i].BagID == BagID) {
                if (this.KnapsackData[i].Num <= 0) {
                    this.KnapsackData[i] = { Name: Name, Num: Num, BagID: BagID };
                    return true;
                }
                return false;
            }
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
                    console.log("扣除" + Name + Num + "个");
                    console.log(this.KnapsackData);
                    return true;
                } else {
                    console.log(this.KnapsackData);
                    return false;
                }
            }
        }
        return false;
    }

    public SubKnapsackDataByBagID(bagID: number, Num: number): boolean {
        for (let i = 0; i < this.KnapsackData.length; i++) {
            if (this.KnapsackData[i].BagID == bagID) {
                if (this.KnapsackData[i].Num >= Num) {
                    this.KnapsackData[i].Num -= Num;
                    console.log("扣除" + this.KnapsackData[i].Name + Num + "个");
                    console.log(this.KnapsackData);
                    return true;
                }
                else {
                    return false;
                }
            }
        }

        return false;

    }

    // public GetDataByName(propName: string): { Name: string, Num: number, BagID: number } {
    //     for (let data of this.KnapsackData) {
    //         if (data.Name === propName) {
    //             return data;
    //         }
    //     }

    //     return null;
    // }

    public getDataByBagID(bagID: Number): { Name: string, Num: number, BagID: number } {
        for (let data of this.KnapsackData) {
            if (data.BagID === bagID) {
                return data;
            }
        }

        return null;
    }

    public getKnapsackLength(): number {
        let len = 0;
        for (let i = 0; i < this.KnapsackData.length; i++) {
            let type = HJMSJ_Constant.getTypeByName(this.KnapsackData[i].Name);
            if (type === "武器" || type === "防具") {
                len += this.KnapsackData[i].Num;
                continue;
            }
            if (this.KnapsackData[i].Num > 0) {
                len += 1;
            }
        }
        return len;
    }

    //返回背包中物品数量
    public GetPropNum(Name: string): number {
        let num: number = 0;
        for (let i = 0; i < this.KnapsackData.length; i++) {
            if (this.KnapsackData[i].Name === Name) {
                num += this.KnapsackData[i].Num;
            }
        }
        return num;
    }


    public TimeDate: number[] = [];
    public static DateSave() {
        let json = JSON.stringify(HJMSJ_GameData.Instance);
        sys.localStorage.setItem("HJMSJ_DATA", json);
        console.log("游戏存档");
    }
    public static ReadDate() {
        let name = sys.localStorage.getItem("HJMSJ_DATA");
        if (name != "" && name != null) {
            console.log("读取存档");
            HJMSJ_GameData.instance = Object.assign(new HJMSJ_GameData(), JSON.parse(name));
        } else {
            console.log("新建存档");
            HJMSJ_GameData.instance = new HJMSJ_GameData();

        }


    }
}