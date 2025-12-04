import { _decorator, Vec3 } from 'cc';
const { ccclass } = _decorator;

//使用示例：
// // 获取金币数量并显示
// const coinCount = DataManager.getInstance().getCoins();
// coinLabel.string = coinCount.toString();

// // 购买皮肤
// const buySuccess = DataManager.getInstance().buyPlaneSkin("speed_plane");
// if (buySuccess) {
//     // 刷新皮肤显示
// }

// // 更新关卡进度
// DataManager.getInstance().updateLevelProgress(2, 74.2);

// // 保存无尽模式得分
// const newScore = calculateScore(distance);
// const isNewHighScore = DataManager.getInstance().updateEndlessHighScore(newScore);


export enum GeometryVibes_GameMode {
    CLASSIC ,  // 闯关模式
    ENDLESS  // 无尽模式
}

export enum GeometryVibes_PlaneStyle{
    Default,
    Triangle2,
    Triangle3,
    Triangle4,
    Triangle5,
    Triangle6,
    Triangle7,
    Triangle8,
    Triangle9,
    Triangle10,
    Triangle11,
    Triangle12,
    Square,
    Circle,
}

export enum GeometryVibes_TailStyle{
    Tail1,
    Tail2,
    Tail3,
    Tail4,
    Tail5,
    Tail6,
    Tail7,
    Tail8,
    Tail9,
    Tail10,
}

export enum GeometryVibes_PlaneColor{
    Color1="FFFFFF",
    Color2="00FFD6",
    Color3="F1F14A",
    Color4="53FF1D",
    Color5="FFAE1D",
    Color6="F1BBEF",
    Color7="EB3880",
    Color8="882ABD",
    Color9="1528B6",
    Color10="46FF9F",
    Color11="6CF560",
    Color12="0C119E",
    Color13="9699FF",
    Color14="13570D",
}

// 物品类型枚举
export enum GeometryVibes_ItemType {
    PLANE = "plane",
    TRAIL = "trail",
    COLOR = "color"
}

// 获取方式枚举
export enum GeometryVibes_ItemSource {
    COIN = "coin",      // 金币购买
    VIDEO = "video",    // 视频获取
    DEFAULT = "default" // 默认拥有
}

// 商店物品配置接口
export interface GeometryVibes_ShopItemConfig {
    id: string;                 // 物品唯一ID
    type: GeometryVibes_ItemType; // 物品类型
    // name: string;               // 物品名称
    // description: string;        // 物品描述
    source: GeometryVibes_ItemSource; // 获取方式
    price: number;              // 价格(金币或视频次数)
    // icon: string;               // 图标资源路径
    // preview: string;            // 预览图资源路径
    // iconIndex: number; // 新增图标索引
    isSelected?: boolean;        // 是否选中使用
    isDefault?: boolean;        // 是否默认拥有
    color?:GeometryVibes_PlaneColor;
    style?:GeometryVibes_PlaneStyle;
    tail?:GeometryVibes_TailStyle;
}

// 玩家物品数据接口
export interface GeometryVibes_PlayerItemData {
    id: string;                 // 物品ID
    isOwned: boolean;           // 是否拥有
    remainingVideoTimes?: number; // 剩余视频次数(针对视频获取的物品)
    isSelected: boolean;        // 是否选中使用
}

export interface GeometryVibes_LevelInfo {
    levelNumber: number;
    difficulty: 'Easy' | 'Normal' | 'Hard' | 'ECTREME' | 'INSANE';
    progress: number;
    emojiId: number;
    // backgroundColorId: number;
    isLocked?: boolean;
    baseReward:number;
}

export interface GeometryVibes_LevelData {
    levelID: number;
    startPos: Vec3;
    endPos: Vec3;
    ceilingPosY: number;
    floorPosY: number;
    totalRevivalPoses?: Vec3[];
    length?:number;
    obstacleDatas?:{
        [key:number]:{
            pos:Vec3;
            direction:boolean;
            prefabPath:string;
            typeId:number;
            revivalPoses:Vec3[];
            length?:number;
        };
    }
}

/// 扩展玩家数据接口，包含商店物品信息
export interface GeometryVibes_PlayerData {
    coins: number; // 金币数量
    best: number; // 无尽模式最高分
    selectedPlane: string; // 选中的飞机ID
    selectedTail: string; // 选中的拖尾ID
    selectedColor: string; // 选中的颜色ID
    items: { [id: string]: GeometryVibes_PlayerItemData }; // 物品数据
    levelProgress: { [level: number]: number };  // 关卡进度
    soundEnabled: boolean; // 声音是否开启
    musicEnabled: boolean; // 音乐是否开启
    latestUnlockedLevel: number; // 最新解锁的关卡
    passedLevels: number[]; // 已通过的关卡
}

// 皮肤价格配置接口
interface GeometryVibes_SkinPriceConfig {
    planeSkins: { [key: string]: number };
    trailSkins: { [key: string]: number };
}

@ccclass('GeometryVibes_DataManager')
export class GeometryVibes_DataManager {
    private static instance: GeometryVibes_DataManager;
    private playerData: GeometryVibes_PlayerData;
    private shopItemsConfig: GeometryVibes_ShopItemConfig[]; // 商店物品配置
    private skinPriceConfig: GeometryVibes_SkinPriceConfig;
    private readonly STORAGE_KEY = "geometry_vibes_data";
    private readonly DEFAULT_PLANE_ID = "plane_01";
    private readonly DEFAULT_TAIL_ID = "tail_01";
    private readonly DEFAULT_COLOR_ID = "color_01";

    public levelsInfo : GeometryVibes_LevelInfo[] = [
        { levelNumber: 1, difficulty: 'Easy',progress:0, baseReward: 100,emojiId: 1, /* backgroundColorId: 1 */ },
        { levelNumber: 2, difficulty: 'Easy',progress:-1,baseReward: 300, emojiId: 2, /* backgroundColorId: 1*/ } ,
        { levelNumber: 3, difficulty: 'Normal',progress:-1,baseReward: 500, emojiId: 3, /* backgroundColorId: 2  */},
        { levelNumber: 4, difficulty: 'Normal',progress:-1,baseReward: 700, emojiId: 4, /* backgroundColorId: 2 */ },
        { levelNumber: 5, difficulty: 'Hard',progress:-1,baseReward: 900, emojiId: 5,/*  backgroundColorId: 3 */ },
        // { levelNumber: 6, difficulty: 'Hard',progress:-1, baseReward: 1100,emojiId: 6, /* backgroundColorId: 3 */ },
        // { levelNumber: 7, difficulty: 'ECTREME',progress:-1, baseReward: 1300,emojiId: 7, /* backgroundColorId: 4 */ },
        // { levelNumber: 8, difficulty: 'ECTREME',progress:-1,baseReward: 1500, emojiId: 8, /* backgroundColorId: 4  */},
        // { levelNumber: 9, difficulty: 'INSANE',progress:-1, baseReward: 1700,emojiId: 9, /* backgroundColorId: 5  */},
        // { levelNumber: 10, difficulty: 'INSANE',progress:-1,baseReward: 1900, emojiId: 10, /* backgroundColorId: 5 */ },
    ];

    private currentLevel: number = 1;
    private currentProgress:number = 0.3;
    private currentGameMode: GeometryVibes_GameMode = GeometryVibes_GameMode.CLASSIC;
    private currentLevelData:GeometryVibes_LevelData = null;
    private isPassLevel:boolean = false;
    private currentCollisionCount :number = 0;
    private currentTotalMeters :number = 0;
    private isTouching: boolean = false;
    private isPaused: boolean = false;
    private isInited:boolean = false;
    private isLatest:boolean = false;
    private isPausedClicked:boolean = false;
    private isDownCountEnd:boolean = true;
    private isTreasureChestEnd:boolean = false;
    private isGameStartDownCount:boolean = false;
    

    /**
     * 初始化商店物品配置
     */
    private initShopConfig(): void {
        this.shopItemsConfig = [
            // 飞机样式
            {
                id: "plane_01",
                type: GeometryVibes_ItemType.PLANE,
                source: GeometryVibes_ItemSource.DEFAULT,
                price: 0,
                style:GeometryVibes_PlaneStyle.Default,
                isDefault: true,
            },

            {
                id: "plane_02",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle2,
                source: GeometryVibes_ItemSource.COIN,
                price: 770,
            },
            {
                id: "plane_03",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle3,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 1,
            },
                      {
                id: "plane_04",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle4,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 1,
            },
                      {
                id: "plane_05",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle5,
                source: GeometryVibes_ItemSource.COIN,
                price: 1290,
            },
                      {
                id: "plane_06",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle6,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 2,
            },
                      {
                id: "plane_07",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle7,
                source: GeometryVibes_ItemSource.COIN,
                price: 1650,
            },
                                  {
                id: "plane_08",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle8,
                source: GeometryVibes_ItemSource.COIN,
                price: 1950,
            },
                      {
                id: "plane_09",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle9,
                source: GeometryVibes_ItemSource.COIN,
                price: 3350,
            },
                      {
                id: "plane_10",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle10,
                source: GeometryVibes_ItemSource.COIN,
                price: 3900,
            },
            {
                id: "plane_11",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle11,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 3,
            },
                        {
                id: "plane_12",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Triangle12,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 3,
            },
            {
                id: "plane_13",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Square,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 1,
            },
            {
                id: "plane_14",
                type: GeometryVibes_ItemType.PLANE,
                style:GeometryVibes_PlaneStyle.Circle,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 2,
            },



            // 更多飞机...
            
            // 拖尾样式
            {
                id: "tail_01",
                type: GeometryVibes_ItemType.TRAIL,
                tail:GeometryVibes_TailStyle.Tail1,
                source: GeometryVibes_ItemSource.DEFAULT,
                price: 0,
                isDefault: true
            },
            {
                id: "tail_02",
                type: GeometryVibes_ItemType.TRAIL,
                tail:GeometryVibes_TailStyle.Tail2,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 2,
            },
            {
                id: "tail_03",
                type: GeometryVibes_ItemType.TRAIL,
                tail:GeometryVibes_TailStyle.Tail3,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 2,
            },
                        {
                id: "tail_04",
                type: GeometryVibes_ItemType.TRAIL,
                tail:GeometryVibes_TailStyle.Tail4,
                source: GeometryVibes_ItemSource.COIN,
                price: 390,
            },
            {
                id: "tail_05",
                type: GeometryVibes_ItemType.TRAIL,
                tail:GeometryVibes_TailStyle.Tail5,
                source: GeometryVibes_ItemSource.COIN,
                price: 590,
            },
                        {
                id: "tail_06",
                type: GeometryVibes_ItemType.TRAIL,
                tail:GeometryVibes_TailStyle.Tail6,
                source: GeometryVibes_ItemSource.COIN,
                price: 790,
            },
            {
                id: "tail_07",
                type: GeometryVibes_ItemType.TRAIL,
                tail:GeometryVibes_TailStyle.Tail7,
                source: GeometryVibes_ItemSource.COIN,
                price: 990,
            },
                                    {
                id: "tail_08",
                type: GeometryVibes_ItemType.TRAIL,
                tail:GeometryVibes_TailStyle.Tail8,
                source: GeometryVibes_ItemSource.VIDEO,
                price: 2,
            },
            {
                id: "tail_09",
                type: GeometryVibes_ItemType.TRAIL,
                tail:GeometryVibes_TailStyle.Tail9,
                source: GeometryVibes_ItemSource.VIDEO,
                price:3,
            },
            // 更多拖尾...
            
            // 颜色
            {
                id: "color_01",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color1,
                source: GeometryVibes_ItemSource.DEFAULT,
                price: 0,
                isDefault: true
            },
            {
                id: "color_02",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color2,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_03",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color3,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_04",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color4,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_05",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color5,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_06",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color6,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_07",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color7,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_08",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color8,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_09",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color9,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
                        {
                id: "color_10",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color10,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_11",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color11,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_12",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color12,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
                        {
                id: "color_13",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color13,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            {
                id: "color_14",
                type: GeometryVibes_ItemType.COLOR,
                color: GeometryVibes_PlaneColor.Color14,
                source: GeometryVibes_ItemSource.COIN,
                price: 100,
            },
            // 更多颜色...
        ];
    }

    private constructor() {
        this.initShopConfig();
        this.playerData = this.loadData();
    }

    // 单例模式获取实例
    public static getInstance(): GeometryVibes_DataManager {
        if (!GeometryVibes_DataManager.instance) {
            GeometryVibes_DataManager.instance = new GeometryVibes_DataManager();
        }
        return GeometryVibes_DataManager.instance;
    }

    /**
     * 加载玩家数据，如果没有则初始化默认数据
     */
    private loadData(): GeometryVibes_PlayerData {
        const savedData = localStorage.getItem(this.STORAGE_KEY);
        if (savedData) {
            return JSON.parse(savedData);
        }

        // 初始化默认物品数据
        const defaultItems: { [id: string]: GeometryVibes_PlayerItemData } = {};
        this.shopItemsConfig.forEach(item => {
            const isDefault = item.isDefault || false;
            defaultItems[item.id] = {
                id: item.id,
                isOwned: isDefault,
                remainingVideoTimes: item.source === GeometryVibes_ItemSource.VIDEO ? item.price : undefined,

                isSelected: isDefault && (
                    (item.type === GeometryVibes_ItemType.PLANE && item.id === this.DEFAULT_PLANE_ID) ||
                    (item.type === GeometryVibes_ItemType.TRAIL && item.id === this.DEFAULT_TAIL_ID) ||
                    (item.type === GeometryVibes_ItemType.COLOR && item.id === this.DEFAULT_COLOR_ID)
                )
            };
        });

        // 初始化默认数据
        return {
            coins: 600,
            selectedPlane: this.DEFAULT_PLANE_ID,
            selectedTail: this.DEFAULT_TAIL_ID,
            selectedColor: this.DEFAULT_COLOR_ID,
            items: defaultItems,
            levelProgress: {},
            best: 0,
            soundEnabled: true,
            musicEnabled: true,
            latestUnlockedLevel: 0, // 最新解锁的关卡
            passedLevels: [], // 默认解锁第一关
            // latestUnlockedLevel: 5,
            // levelProgress: {1:1,2: 1,3:1,4:1,5:0.4},
            // passedLevels: [1,2,3,4,5],
        };
    }

    /**
     * 加载皮肤价格配置
     */
    private loadSkinPriceConfig(): GeometryVibes_SkinPriceConfig {
        // 实际项目中可以从配置文件加载
        return {
            planeSkins: {
                "basic_plane": 0,
                "speed_plane": 500,
                "heavy_plane": 1000,
                "light_plane": 750,
                "stealth_plane": 1500
            },
            trailSkins: {
                "basic_trail": 0,
                "fire_trail": 300,
                "ice_trail": 450,
                "sparkle_trail": 600,
                "smoke_trail": 350
            }
        };
    }

    /**
     * 保存数据到本地存储
     */
    private saveData(): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.playerData));
    }

    // 新增关卡状态方法
    public isLatestUnlockedLevel(level: number,isGetCoins:boolean): boolean {

        if(this.isLatest){
            if(isGetCoins)
            this.isLatest = false;
            return true;
        }
        else{
            return false;
        }
        // return level === this.playerData.latestUnlockedLevel;
        // return level == this.playerData.passedLevels.length;
    }


         /**
     * 获取当前关卡
     */
    public getCurrentGameMode(): GeometryVibes_GameMode {
        return this.currentGameMode;
    }

    /**
     * 设置当前关卡
     */
    public setCurrentGameMode(mode: GeometryVibes_GameMode) {
        this.currentGameMode = mode;
    }
    

    /**
     * 获取当前关卡
     */
    public getCurrentLevelData(): GeometryVibes_LevelData {
        return this.currentLevelData;
    }

    /**
     * 设置当前关卡
     */
    public setCurrentLevelData(levelData: GeometryVibes_LevelData) {
        this.currentLevelData = levelData;
    }
    /**
     * 获取当前关卡
     */
    public getIsTouching(): boolean {
        return this.isTouching;
    }

    /**
     * 设置当前关卡
     */
    public setIsTouching(isTouching:boolean) {
        this.isTouching = isTouching;
    }
    
    /**
     * 获取当前关卡
     */
    public getIsPaused(): boolean {
        return this.isPaused;
    }

    /**
     * 设置当前关卡
     */
    public setIsPaused(isPaused:boolean) {
        this.isPaused = isPaused;
    }


    public getIsPausedClicked(): boolean {
        return this.isPausedClicked ;
    }

    public setIsPausedClicked(isPausedClicked:boolean){
        this.isPausedClicked = isPausedClicked
    }

    public getIsDownCountEnd():boolean{
        return this.isDownCountEnd;
    }

    public setIsDownCountEnd(isDownCountEnd:boolean){
        this.isDownCountEnd = isDownCountEnd
    }

    public getIsTreasureChestEnd(){
        return this.isTreasureChestEnd;
    }

    public setIsTreasureChestEnd(isTreasureChestEnd:boolean){
        this.isTreasureChestEnd = isTreasureChestEnd;
    }

    public setIsGameStartDownCount(isGameStartDownCount:boolean){
        this.isGameStartDownCount = isGameStartDownCount;
    }

    public getIsGameStartDownCount():boolean{
        return this.isGameStartDownCount;
    }
    
    public getIsInit(): boolean {
        return this.isInited ;
    }

    public setInited(){
        this.isInited = true;
    }
        
    /**
     * 获取当前关卡
     */
    public getIsPassLevel(): boolean {
        return this.isPassLevel;
    }

    /**
     * 设置当前关卡
     */
    public setIsPassLevel(isPassed:boolean) {
        this.isPassLevel = isPassed;
    }

     /**
     * 获取当前关卡
     */
    public getCurrentLevel(): number {
        return this.currentLevel;
    }

    /**
     * 设置当前关卡
     */
    public setCurrentLevel(levelNum: number) {
        this.currentLevel = levelNum;
    }

    
    
    /**
     * 获取当前关卡
     */
    public getCurrentProgress(): number {
        return this.currentProgress;
    }

    /**
     * 设置当前关卡
     */
    public setCurrentProgress(progress: number) {
        this.currentProgress = progress;
    }
     /**
     * 设置当前关卡
     */
    public setCurrrentTotalMeters(totalMeters:number){
        this.currentTotalMeters = totalMeters;
    }
    /**
     * 设置当前关卡
     */
    public getCurrrentTotalMeters(){
        return this.currentTotalMeters;
    }

    // 新增获取当前关卡奖励的方法
    public getCurrentLevelReward(): number  {
        // debugger;
        const levelInfo = this.levelsInfo.find(info => info.levelNumber === this.currentLevel);
        return levelInfo ? levelInfo.baseReward : 0; // 默认值
    }

    /**
     * 获取金币数量
     */
    public getCoins(): number {
        return this.playerData.coins;
    }

    /**
     * 增加金币
     * @param amount 增加的数量
     */
    public addCoins(amount: number): void {
        this.playerData.coins += amount;
        this.saveData();
    }

    /**
     * 减少金币
     * @param amount 减少的数量
     * @returns 是否成功减少
     */
    public subtractCoins(amount: number): boolean {
        if (this.playerData.coins >= amount) {
            this.playerData.coins -= amount;
            this.saveData();
            return true;
        }
        return false;
    }

    /**
     * 获取选中的飞机皮肤
     */
    // public getSelectedPlaneStyle(): GeometryVibes_PlaneStyle {
    //     return this.playerData.selectedPlaneStyle;
    // }

    // /**
    //  * 设置选中的飞机皮肤
    //  * @param skinName 皮肤名称
    //  */
    // public setSelectedPlaneSkin(skinName: string): void {
    //     if (this.playerData.ownedPlaneSkins.indexOf(skinName) !== -1) {
    //         this.playerData.selectedPlaneSkin = skinName;
    //         this.saveData();
    //     }
    // }

    /**
     * 获取选中的拖尾皮肤
     */
    // public getSelectedTailStyle(): GeometryVibes_TailStyle{
    //     return this.playerData.selectedTailStyle;
    // }

    // /**
    //  * 设置选中的拖尾皮肤
    //  * @param skinName 皮肤名称
    //  */
    // public setSelectedTrailSkin(skinName: string): void {
    //     if (this.playerData.ownedTrailSkins.indexOf(skinName) !== -1) {
    //         this.playerData.selectedTrailSkin = skinName;
    //         this.saveData();
    //     }
    // }

    /**
     * 获取选中的飞机颜色
     */
    // public getSelectedPlaneColor(): GeometryVibes_PlaneColor{
    //     return this.playerData.selectedPlaneColor;
    // }





    // 获取指定类型的商店物品
    public getShopItemsByType(type: GeometryVibes_ItemType): GeometryVibes_ShopItemConfig[] {
        return this.shopItemsConfig.filter(item => item.type === type);
    }

    // 获取玩家拥有的物品数据
    public getPlayerItems(): { [id: string]: GeometryVibes_PlayerItemData } {
        return this.playerData.items;
    }

    // 获取玩家拥有的指定类型的物品ID列表
    public getOwnedItemsByType(type: GeometryVibes_ItemType): string[] {
        const ownedItems: string[] = [];
        this.shopItemsConfig.forEach(item => {
            if (item.type === type && this.playerData.items[item.id]?.isOwned) {
                ownedItems.push(item.id);
            }
        });
        return ownedItems;
    }

    // 购买物品(金币)
    public buyItemWithCoin(itemId: string): boolean {
        const itemConfig = this.shopItemsConfig.find(item => item.id === itemId);
        if (!itemConfig || itemConfig.source !== GeometryVibes_ItemSource.COIN) {
            return false;
        }

        // 检查是否已拥有
        if (this.playerData.items[itemId]?.isOwned) {
            return false;
        }

        // 检查金币是否足够
        if (this.playerData.coins >= itemConfig.price) {
            this.playerData.coins -= itemConfig.price;
            this.playerData.items[itemId].isOwned = true;
            this.saveData();
            return true;
        }

        return false;
    }

    // 观看视频获取物品
    public buyItemWithVideo(itemId: string): boolean {
        const itemConfig = this.shopItemsConfig.find(item => item.id === itemId);
        if (!itemConfig || itemConfig.source !== GeometryVibes_ItemSource.VIDEO) {
            return false;
        }

        // 检查是否已拥有
        if (this.playerData.items[itemId]?.isOwned) {
            return false;
        }

        // 检查是否有剩余视频次数
        const itemData = this.playerData.items[itemId];
        if (itemData.remainingVideoTimes > 0) {
            itemData.remainingVideoTimes--;
            
            // 如果视频次数用完，标记为已拥有
            if (itemData.remainingVideoTimes <= 0) {
                itemData.isOwned = true;
            }
            
            this.saveData();
            return true;
        }

        return false;
    }

    // 选择物品
    public selectItem(itemId: string): boolean {
        const itemConfig = this.shopItemsConfig.find(item => item.id === itemId);
        if (!itemConfig) {
            return false;
        }

        // 检查是否已拥有
        if (!this.playerData.items[itemId]?.isOwned) {
            return false;
        }

        // 取消同类型其他物品的选中状态
        this.shopItemsConfig.forEach(item => {
            if (item.type === itemConfig.type) {
                this.playerData.items[item.id].isSelected = false;
            }
        });

        // 设置当前物品为选中状态
        this.playerData.items[itemId].isSelected = true;

        // 更新对应类型的选中ID
        switch (itemConfig.type) {
            case GeometryVibes_ItemType.PLANE:
                this.playerData.selectedPlane = itemId;
                break;
            case GeometryVibes_ItemType.TRAIL:
                this.playerData.selectedTail = itemId;
                break;
            case GeometryVibes_ItemType.COLOR:
                this.playerData.selectedColor = itemId;
                break;
        }

        this.saveData();
        return true;
    }

    public getVideoWatchedCount(itemId: string): {watched: number, total: number} {
    const itemData = this.playerData.items[itemId];
    if (itemData && itemData.remainingVideoTimes !== undefined) {
        const itemConfig = this.shopItemsConfig.find(item => item.id === itemId);
        return {
            watched: itemConfig.price - itemData.remainingVideoTimes,
            total: itemConfig.price
        };
    }
    return {watched: 0, total: 0};
}

    // 获取当前选中的物品ID
    public getSelectedItemIdByType(type: GeometryVibes_ItemType): string {
        switch (type) {
            case GeometryVibes_ItemType.PLANE:
                return this.playerData.selectedPlane;
            case GeometryVibes_ItemType.TRAIL:
                return this.playerData.selectedTail;
            case GeometryVibes_ItemType.COLOR:
                return this.playerData.selectedColor;
            default:
                return "";
        }
    }


    // /**
    //  * 购买飞机皮肤
    //  * @param skinName 皮肤名称
    //  * @returns 是否购买成功
    //  */
    // public buyPlaneSkin(skinName: string): boolean {
    //     const price = this.skinPriceConfig.planeSkins[skinName];
    //     if (price === undefined || this.playerData.ownedPlaneSkins.indexOf(skinName) !== -1) {
    //         return false;
    //     }

    //     if (this.subtractCoins(price)) {
    //         this.playerData.ownedPlaneSkins.push(skinName);
    //         this.setSelectedPlaneSkin(skinName);
    //         this.saveData();
    //         return true;
    //     }

    //     return false;
    // }

    // /**
    //  * 购买拖尾皮肤
    //  * @param skinName 皮肤名称
    //  * @returns 是否购买成功
    //  */
    // public buyTrailSkin(skinName: string): boolean {
    //     const price = this.skinPriceConfig.trailSkins[skinName];
    //     if (price === undefined || this.playerData.ownedTrailSkins.indexOf(skinName) !== -1) {
    //         return false;
    //     }

    //     if (this.subtractCoins(price)) {
    //         this.playerData.ownedTrailSkins.push(skinName);
    //         this.setSelectedTrailSkin(skinName);
    //         this.saveData();
    //         return true;
    //     }

    //     return false;
    // }

    // /**
    //  * 获取已拥有的飞机皮肤列表
    //  */
    // public getOwnedPlaneSkins(): string[] {
    //     return [...this.playerData.ownedPlaneSkins];
    // }

    // /**
    //  * 获取已拥有的拖尾皮肤列表
    //  */
    // public getOwnedTrailSkins(): string[] {
    //     return [...this.playerData.ownedTrailSkins];
    // }

    public getLevelInfo() {
        return this.levelsInfo;
    }

    // Fetch level progress for a specific level
    public getLevelProgress(level: number): number {
        if (this.playerData.levelProgress[level] !== undefined) {
            return this.playerData.levelProgress[level];
        }
    
        const levelInfo = this.levelsInfo.find(info => info.levelNumber === level);
        return levelInfo ? levelInfo.progress : -1;
    }

    // Update level progress (only keep the highest progress)
    public updateLevelProgress(level: number, progress: number): void {
        const currentProgress = this.getLevelProgress(level);
        if (progress > currentProgress) {
            this.playerData.levelProgress[level] = progress;
            this.saveData();
        }
         // 解锁新关卡逻辑
        if (progress >= 1 && !this.playerData.passedLevels.includes(level)) {
            this.isLatest = true;
            this.playerData.passedLevels.push(level);
            this.playerData.latestUnlockedLevel = Math.max(...this.playerData.passedLevels) + 1;
            this.saveData();
        }
    }

    public isLevelUnLocked(level: number) {
        if(level == 1){
            return true;
        }
        return this.playerData.passedLevels.includes(level-1);
    }

    public passLevel(level: number) {
        if(this.playerData.passedLevels.includes(level+1)){
            return;
        }
        this.playerData.levelProgress[level+1] = 0; 
        this.saveData();
    }


    // /**
    //  * 获取关卡进度
    //  * @param level 关卡号
    //  */
    // public getLevelProgress(level: number): number {
    //     return this.playerData.levelProgress[level] || 0;
    // }

    // public getAllLevelProgress(): number[] {
    //     return this.playerData.levelProgress;
    // }


    // /**
    //  * 更新关卡进度
    //  * @param level 关卡号
    //  * @param progress 进度百分比
    //  */
    // public updateLevelProgress(level: number, progress: number): void {
    //     // 只保存最高进度
    //     const currentProgress = this.getLevelProgress(level);
    //     if (progress > currentProgress) {
    //         this.playerData.levelProgress[level] = progress;
    //         this.saveData();
    //     }
    // }

    /**
     * 获取无尽模式最高分
     */
    public getEndlessHighScore(): number {
        return this.playerData.best;
    }

    /**
     * 更新无尽模式最高分
     * @param score 分数
     */
    public updateEndlessHighScore(score: number): boolean {
        if (score > this.playerData.best) {
            this.playerData.best = score;
            this.saveData();
            return true;
        }
        return false;
    }

    /**
     * 检查声音是否开启
     */
    public isSoundEnabled(): boolean {
        return this.playerData.soundEnabled;
    }

    /**
     * 切换声音开关
     */
    public toggleSound(): boolean {
        this.playerData.soundEnabled = !this.playerData.soundEnabled;
        this.saveData();
        return this.playerData.soundEnabled;
    }

    /**
     * 检查音乐是否开启
     */
    public isMusicEnabled(): boolean {
        return this.playerData.musicEnabled;
    }

    /**
     * 切换音乐开关
     */
    public toggleMusic(): boolean {
        this.playerData.musicEnabled = !this.playerData.musicEnabled;
        this.saveData();
        return this.playerData.musicEnabled;
    }

    /**
     * 重置所有数据（用于测试）
     */
    public resetAllData(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        this.playerData = this.loadData();
    }


    // 在 GeometryVibes_DataManager 类中添加以下方法
public parseLevelData(jsonData: any): GeometryVibes_LevelData {
    return {
        levelID: jsonData.levelID,
        startPos: new Vec3(jsonData.startPos.x, jsonData.startPos.y, jsonData.startPos.z),
        endPos: new Vec3(jsonData.endPos.x, jsonData.endPos.y, jsonData.endPos.z),
        ceilingPosY: jsonData.ceilingPosY,
        length: jsonData.length,
        floorPosY: jsonData.floorPosY,
        totalRevivalPoses: jsonData.totalRevivalPoses?.map((p: any) => new Vec3(p.x, p.y, p.z)) || [],
        obstacleDatas: this.parseObstacleData(jsonData.obstacleDatas)
    };
}

private parseObstacleData(obstacleData: any): GeometryVibes_LevelData['obstacleDatas'] {
    if (!obstacleData) return undefined;
    
    return Object.keys(obstacleData).reduce((acc, key) => {
        const data = obstacleData[key];
        acc[parseInt(key)] = {
            pos: new Vec3(data.pos.x, data.pos.y, data.pos.z),
            direction: data.direction,
            prefabPath: data.prefabPath,
            typeId: data.typeId,
            revivalPoses: data.revivalPoses?.map((p: any) => new Vec3(p.x, p.y, p.z)) || [],
            length: data.length
        };
        return acc;
    }, {} as GeometryVibes_LevelData['obstacleDatas']);
}
}
