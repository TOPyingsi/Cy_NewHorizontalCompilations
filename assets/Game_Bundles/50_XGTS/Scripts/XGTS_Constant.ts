import { _decorator } from 'cc';

export enum XGTS_Quality {
    None,// 没有品质
    Common,// 普通（Common）
    Uncommon,// 优秀（Uncommon）
    Rare,// 稀有（Rare）
    Superior,// 精良（Superior）
    Legendary,// 传说（Legendary）
    Mythic,// 神话（Mythic）
}

export enum XGTS_QualityColorHex {
    None = "#FFFFFF00",// 透明
    Common = "#FFFFFF3C",// 普通（Common）：白色
    Uncommon = "#2FA1703C",// 优秀（Uncommon）：绿色
    Rare = "#276ABF3C",// 稀有（Rare）：蓝色
    Superior = "#7430B93C",// 精良（Superior）：紫色
    Epic = "#cd23b2",// 史诗（Epic）：粉色
    Legendary = "#E09A1A3C",// 传说（Legendary）：金色
    Mythic = "#F03A393C",// 神话（Mythic）：红色
}

export class XGTS_Constant {
    /**物品的搜索时间 */
    public static SearchTime: number[] = [0, 0.2, 0.5, 1, 1.5, 2, 2.5];

    public static itemSize = 100;

    public static MapInfo = {
        零号大坝: {
            Name: "零号大坝",
            EntryCosts: [0, 112500],
            LevelRequirements: [0, 12],
            TimeLimit: "25:00",
            MapName: "XGTS_Lv_1"
        },
        长弓溪谷: {
            Name: "长弓溪谷",
            EntryCosts: [0, 112500],
            LevelRequirements: [0, 12],
            TimeLimit: "25:00",
            MapName: "XGTS_Lv_2"
        },
        烽火荣都: {
            Name: "烽火荣都",
            EntryCosts: [0, 212500],
            LevelRequirements: [0, 12],
            TimeLimit: "30:00",
            MapName: "XGTS_Lv_3"
        },
        校长办公室: {
            Name: "校长办公室",
            EntryCosts: [0, 350000],
            LevelRequirements: [0, 12],
            TimeLimit: "30:00",
            MapName: "XGTS_Lv_4"
        },
        宿舍: {
            Name: "宿舍",
            EntryCosts: [0, 180000],
            LevelRequirements: [0, 12],
            TimeLimit: "30:00",
            MapName: "XGTS_Lv_5"
        },
        体育场: {
            Name: "体育场",
            EntryCosts: [0, 120000],
            LevelRequirements: [0, 12],
            TimeLimit: "30:00",
            MapName: "XGTS_Lv_6"
        },
        电脑室: {
            Name: "电脑室",
            EntryCosts: [0, 450000],
            LevelRequirements: [0, 12],
            TimeLimit: "30:00",
            MapName: "XGTS_Lv_7"
        }
    }

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

    public static WorkbenchName = ["", "武器台", "护甲台", "子弹台", "药品台"]

    public static Scene = {
        Main: "Main",
    }

    public static Path = {
        Tip: "Prefabs/UI/Tip",
        Broadcast: "Prefabs/UI/Broadcast",
        FloatingText: "Prefabs/UI/FloatingText",
    }

    public static Panel = {
        InventoryPanel: "Panel/InventoryPanel",
        InventoryPanel_Double: "Panel/InventoryPanel_Double",
        InventoryPanel_Left: "Panel/InventoryPanel_Left",
        InventoryPanel_Right: "Panel/InventoryPanel_Right",
        ItemInfoPanel: "Panel/ItemInfoPanel",
        ShopPanel: "Panel/ShopPanel",
        SelectSafeBoxPanel: "Panel/SelectSafeBoxPanel",
        SelectMapPanel: "Panel/SelectMapPanel",
        SafeBoxPanel: "Panel/SafeBoxPanel",
        GameOverPanel: "Panel/GameOverPanel",
        UpgradePanel: "Panel/UpgradePanel",
        OutputPanel: "Panel/OutputPanel",
        SellPanel: "Panel/SellPanel",
        WorkbenchPanel: "Panel/WorkbenchPanel",
        RewardPanel: "Panel/RewardPanel",
        SkinShopPanel: "Panel/SkinShopPanel",
        AccessoriesPanel: "Panel/AccessoriesPanel",
        TutorialPanel: "Panel/TutorialPanel",
        ExitPanel: "Panel/ExitPanel",
    }

    public static Prefab = {
        Item: "Item",
        CommonItem: "CommonItem",
        SkinItem: "SkinItem",
        GridCell: "GridCell",
        Bullet: "Bullet",
        BulletBlank: "BulletBlank",
        Missile: "Missile",
        MissileExplosion: "MissileExplosion",
        Explosion: "Explosion",
        GunFire: "GunFire",
        HPBar: "HPBar",
        Supplies: "Supplies",
        OutputItem: "OutputItem",
        FloatingText: "FloatingText",
    }

    public static Key = {
        FirstInGame: "FirstInGame",
        isHavePassTutorial: "isHavePassTutorial",
        Money: "Money",
        EnergyBattery: "EnergyBattery",
        KCQB: "KCQB",
        SkinPiece: "SkinPiece",
        HuiZhangPiece: "HuiZhangPiece",
        EXP: "EXP",
        RankPoint: "RankPoint",
        Items: "Items",
        PlayerData: "PlayerData",
        PlayerDatas: "PlayerDatas",
        AgreePolicy: "AgreePoliaacy",
        GameData: "GameData",
        UnlockSeason: "Season",
        FreeReward: "FreeReward",
        AchievementTimes: "AchievementTimes",
        FirstOpenSafeBox: "FirstOpenSafeBox",//第一次打开保险必出大红
        FirstPutInventory: "FirstPutInventory",//第一次把大红放到仓库里
    }

    public static Event = {
        REFRESH_MONEY: "REFRESH_MONEY",
        REFRESH_INVENTORY_ITEMS: "REFRESH_INVENTORY_ITEMS",//刷新仓库
        REFRESH_BACKPACK_ITEMS: "REFRESH_BACKPACK_ITEMS",//刷新背包
        REFRESH_CONTENT_SIZE: "REFRESH_CONTENT_SIZE",//用于装备背包或者弹挂时刷新内容高度
        REFRESH_EUIP: "REFRESH_EUIP",//刷新装备
        REFRESH_EUIP_ITEMS: "REFRESH_INVENTORY_ITEMS",//刷新装备列表
        REFRESH_GAME_ITEM_UI: "REFRESH_GAME_ITEM_UI",//刷新游戏界面强械
        REFRESH_WEAON_CONTENT: "REFRESH_WEAON_CONTENT",//刷新游戏描述文本

        MOVEMENT: "MOVEMENT",
        MOVEMENT_STOP: "MOVEMENT_STOP",
        SET_ATTACK_DIR: "SET_ATTACK_DIR",
        FIRE_START: "FIRE_START",
        FIRE_STOP: "FIRE_STOP",
        SHOW_INTERACT_BUTTON: "SHOW_INTERACT_BUTTON",
        SHOW_EVACUATION: "SHOW_EVACUATION",//显示撤离
        HIDE_EVACUATION: "HIDE_EVACUATION",//关闭撤离
        SHOW_TUTORIAL: "SHOW_TUTORIAL",//显示引导
        HIDE_TUTORIAL: "HIDE_TUTORIAL",//关闭引导

        ON_ITEM_DRAGSTART: "ON_ITEM_DRAGSTART",
        ON_ITEM_DRAGGING: "ON_ITEM_DRAGGING",
        ON_ITEM_DRAGEND: "ON_ITEM_DRAGEND",

        CHANGE_DOUBLE_MODE: "CHANGE_DOUBLE_MODE",
        CHANGE_SINGLE_MODE: "CHANGE_SINGLE_MODE",
        MOVEMENT_1: "MOVEMENT_1",
        MOVEMENT_2: "MOVEMENT_2",
        MOVEMENT_STOP_1: "MOVEMENT_STOP_1",
        MOVEMENT_STOP_2: "MOVEMENT_STOP_2",
        RESTRICT_PLAYER_MOVEMENT: "RESTRICT_PLAYER_MOVEMENT",
        SHOW_INTERACT_BUTTON_1: "SHOW_INTERACT_BUTTON_1",
        SHOW_INTERACT_BUTTON_2: "SHOW_INTERACT_BUTTON_2",
        REFRESH_EUIP_1: "REFRESH_EUIP_1",//刷新装备
        REFRESH_EUIP_2: "REFRESH_EUIP_2",//刷新装备

        RESET_CAMERA: "RESET_CAMERA",
    }

    public static Group = {
        Player: 1 << 1,
        Enemy: 1 << 2,
        Bullet: 1 << 3,
        Obstacle: 1 << 4,
        Interact: 1 << 5,
    }

    public static FirstOpenSafeBox = ["勋章", "摄影机"];
    public static FirstOpenWeaponBox = ["沙漠之鹰", "稳定型芯片A"];

    //展示柜展示的物品
    public static Showcases = [
        "摄影机",
        "显卡",
        "军用无人机",
        "军用电台",
        "笔记本电脑",
        "刀片服务器",
        "高速磁盘阵列",
        "G.T.I卫星通信天线",
        "飞行记录仪",
        "军用控制终端",
        "曼德尔超算单元",
        "便携军用雷达",
        "军用信息终端",
        "绝密服务器",
        "云存储阵列",
        "呼吸机",
        "自动体外除颤器",
        "复苏呼吸机",
        "医疗机械人",
        "强化碳纤维板",
        "军用炮弹",
        "奥莉薇娅香槟",
        "名贵机械表",
        "扫拖一体机器人",
        "强力吸尘器",
        "高级咖啡豆",
        "黄金瞪羚",
        "克劳迪乌斯半身像",
        "棘龙爪化石",
        "滑膛枪展品",
        "万足金条",
        "赛伊德的怀表",
        "主战坦克模型",
        "步战车模型",
        "万金泪冠",
        "“天圆地方”",
        "“纵横”",
        "雷斯的留声机",
        "实验数据",
        "量子存储",
        "火箭燃料",
        "非洲之心",
        "装甲车电池",
        "动力电池组"
    ];
}