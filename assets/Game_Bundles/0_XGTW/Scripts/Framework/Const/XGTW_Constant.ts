import { _decorator } from 'cc';
export enum XGTW_ItemType {
    None,
    头盔,
    防弹衣,
    背包,
    手枪,
    突击步枪,
    冲锋枪,
    射手步枪,
    栓动步枪,
    轻机枪,
    霰弹枪,
    近战,
    弓弩,
    子弹,
    瞄具,
    枪口,
    弹匣,
    握把,
    枪托,
    投掷物,
    钥匙,
    药品,
    食物,
    战利品,
    金钱,
    神秘商店,
    热卖新品,
    抽奖礼包,
    快捷装备,
    个性化枪械,
    个性化装扮,
    碎片装扮,
    特殊道具,
}
export enum XGTW_SuppliesType {
    None,
    保险柜,
    储物盒,
    医疗用品,
    弹药箱,
    武器箱,
    电脑,
}
export enum XGTW_GoodsType {
    None,
    杂物,
    储物盒,
    医疗用品,
    弹药箱,
    武器箱,
    电脑,
}
export enum XGTW_ColorHex {
    RED = "#960000",//红色
    PURPLE = "#7B0096",//紫色
    GREEN = "#0fff00",//绿色
    GOLD = "#CFBA5E",//金色
    BROWN = "#B87942"//棕色
}
export enum XGTW_Quality {
    Common,// 普通（Common）
    Uncommon,// 优秀（Uncommon）
    Rare,// 稀有（Rare）
    Superior,// 精良（Superior）
    Epic,// 史诗（Epic）
    Legendary,// 传说（Legendary）
    Mythic,// 神话（Mythic）
}
export enum XGTW_QualityColorHex {
    Common = "#858585",// 普通（Common）：白色
    Uncommon = "#2fa170",// 优秀（Uncommon）：绿色
    Rare = "#276abf",// 稀有（Rare）：蓝色
    Superior = "#7430b9",// 精良（Superior）：紫色
    Epic = "#cd23b2",// 史诗（Epic）：粉色
    Legendary = "#e09a1a",// 传说（Legendary）：金色
    Mythic = "#f03a39",// 神话（Mythic）：红色
}

export class XGTW_Constant {
    public static Audio = {
        BG: "BG",
        BG2: "BG2",
        Equip: "Equip",
        Unequip: "Unequip",
        Fire: "Fire",
        GetMoney: "GetMoney",
        Reload: "Reload",
        ButtonClick: "ButtonClick",
    }

    public static Scene = {
        Main: "Main",
    }

    public static Path = {
        Tip: "Prefabs/UI/Tip",
        Broadcast: "Prefabs/UI/Broadcast",
        FloatingText: "Prefabs/UI/FloatingText",
    }

    public static Key = {
        Money: "Moneyyyy",
        EnergyBattery: "EnergyBattery",
        KCQB: "KCQB",
        SkinPiece: "SkinPiece",
        HuiZhangPiece: "HuiZhangPiece",
        EXP: "EXP",
        RankPoint: "RankPoint",
        Items: "Items",
        PlayerData: "PlayerData",
        AgreePolicy: "AgreePoliaacy",
        GameData: "GameData",
        UnlockSeason: "Season",
        FreeReward: "FreeReward",
        AchievementTimes: "AchievementTimes",
    }

    public static Panel = {
        CommonTipPanel: "Panel/CommonTipPanel",
        InventoryPanel: "Panel/InventoryPanel",
        GameInventoryPanel: "Panel/GameInventoryPanel",
        ShopPanel: "Panel/ShopPanel",
        SkinShopPanel: "Panel/SkinShopPanel",
        SpecialSkinShopPanel: "Panel/SpecialSkinShopPanel",
        BuyPanel: "Panel/BuyPanel",
        ItemDetailPanel: "Panel/ItemDetailPanel",
        SelectMapPanel: "Panel/SelectMapPanel",
        FailPanel: "Panel/FailPanel",
        WinPanel: "Panel/WinPanel",
        SeasonPanel: "Panel/SeasonPanel",
        RewardPanel: "Panel/RewardPanel",
        SpecialSkinDetailPanel: "Panel/SpecialSkinDetailPanel",
        FreeRewardPanel: "Panel/FreeRewardPanel",
        TreasureBox: "Panel/TreasureBox",
        XunZhangPanel: "Panel/XunZhangPanel",
        RankPanel: "Panel/RankPanel",
        HeiShiPanel: "Panel/HeiShiPanel",
        GameBackpackPanel: "Panel/GameBackpackPanel",
        SearchPanel: "Panel/SearchPanel",
        ZhuangJiaPanel: "Panel/ZhuangJiaPanel",
        KanChaShopPanel: "Panel/KanChaShopPanel",
        EnergyTipPanel: "Panel/EnergyTipPanel",
    }

    public static Group = {
        Player: 1 << 5,
        Enemy: 1 << 6,
        Bullet: 1 << 7,
        Obstacle: 1 << 9,
    }

    //    //界面优先级
    public static PRIORITY = {
        NORMAL: 10,     //普通界面
        DIALOG: 100,    //弹窗的Z序
        REWARD: 200,    //奖励的弹窗
        WAITING: 300,   //等待界面弹窗
        TIPS: 400,      //提示
    }
}