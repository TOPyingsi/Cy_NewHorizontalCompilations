// 导入Cocos Creator核心模块
import { _decorator, Component, JsonAsset, Node, SpriteFrame, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_LoadManager } from './XGDY_LoadManager';
import Banner from 'db://assets/Scripts/Banner';
import { XGDY_Constant } from '../Common/XGDY_Constant';
// 获取装饰器
const { ccclass, property } = _decorator;
/**
 * 物品类型枚举
 * 对应配置表中的类型标识，ID格式：类型_次级类型_编号 或 类型_编号
 */
export enum XGDY_ItemType {
    Angler = "钓友",      // 0-钓友类型
    Skill = "技能",       // 1-技能类型
    FishingRod = "钓竿",  // 2-钓竿类型
    Item = "道具",        // 3-道具类型
    Fish = "鱼",          // 4-鱼类型
    Map = "地图",         // 5-地图类型
    NPC = "NPC",          // 6-NPC类型
    PlotEvents = "事件",  // 7-事件类型
    OtherPlayer = "其他玩家" , // 8-其他玩家类型
    Coin = "金币" ,       // 9-金币类型
    Experience = "经验",   // 10-经验类型
    Level = "等级",
    Weight = "总重量",
    SpecialItem = "特殊道具",
    CelebrationCoin = "庆典币"
}


// 特殊地图ID枚举
export enum XGDY_SpecialMapId {
    何罗鱼山崖 = "地图_4",
    黑坑 = "地图_101",
    庆典 = "地图_102",
    钓鱼大赛 = "地图_103",
}


// 钓鱼大赛等级枚举
export enum XGDY_FishingCompetitionLevel {
    预赛 = 1,
    十强赛 = 2,
    决赛 = 3,
}


// 特殊道具枚举
export enum XGDY_SpecialItem {
    祖传饵料 = "祖传饵料",
    传奇饵料 = "传奇饵料",
    辣条 = "辣条",
    哈基米南北绿豆 = "哈基米南北绿豆",
    冰河巨鲲 = "冰河巨鲲",
    绝境气息 = "绝境气息",
    龙形锦鲤 = "龙形锦鲤",
    烤鲲肉 = "烤鲲肉",
    航母阻拦索 = "航母阻拦索",



    
    羁绊之力 = "羁绊之力",
    何罗鱼相助 = "何罗鱼相助",
    时间之力 = "时间之力",
    勇气之力 = "勇气之力",
}


// 特殊道具枚举
export enum XGDY_FishSkills {
    高速度 = "高速",
    拉力增强 = "拉力增强",
    切线 = "切线",
    暴怒 = "暴怒",
    钓法禁用 = "钓法禁用",
    毒 = "毒",
}


export enum XGDY_HomeType {
    公路 = 0,
    广场 = 1,
}

export enum XGDY_CarType {
    巨鲲 = "巨鲲",
    莲花台 = "莲花台",
    白鲸 = "白鲸",
}







// 钓友静态数据接口
export interface XGDY_LevelJsonData {
    体力: number,
    下一级需要的经验: number
}

// 钓友静态数据接口
export interface XGDY_AnglerJsonData {
    id: string;
    名称: string;
    描述: string;
    解锁条件: string;
    技能列表: {[skillId: string]: number}; // 技能id: 解锁等级
    等级配置: {
        等级: number;
        下一等级解锁价格: number;
        钓法加成: number; // 百分比值，如116表示116%
        拉力: number;
    }[];
}

// 技能静态数据接口
export interface XGDY_SkillJsonData {
    id: string;
    分组: string;
    名称: string;
    冷却时间: number; // 单位：秒
    持续时间: number; // 单位：秒
    钓友id: string[];
    解锁描述: string;
    解锁条件: {
        解锁物品id: string;
        条件值: number; // 物品id/事件id/金币数量
    }[];
    等级配置: {
        等级: number;
        体力消耗: number;
        拉力: number;
        总伤: number;
        下一等级解锁价格: number;
    }[];
}

// 鱼竿静态数据接口
export interface XGDY_FishingRodJsonData {
    id: string;
    分组: string;
    名称: string;
    名称颜色配置: string; // 颜色值，如十六进制#FFFFFF
    秒伤: number;
    拉力: number;
    鱼线长度: number;
    特殊效果: string;
    获取方式: string;
    解锁价格: number;
}

// 道具静态数据接口
export interface XGDY_ItemJsonData {
    id: string;
    名称: string;
    对话: string;
    选项: {
        id: string;
        描述: string;
        消耗道具类型: string;
        需要数量: number;
    }[];
    触发效果: string;
}

// 鱼静态数据接口
export interface XGDY_FishJsonData {
    id: string;
    名称: string;
    分组: string;
    斤数: number;
    单价: number;
    技能: {// 鱼的技能数组
        技能名: string;
        参数?: string[]; // 鱼的技能参数
    }[];
    力气: number;
    初始速度: number;
    血量:number;
    经验:number;
}

// 地图静态数据接口
export interface XGDY_MapJsonData {
    地图id: string;
    分组: string;
    名称: string;
    解锁等级:number;
    专属鱼: string[]; // 鱼id数组
    描述: string;
    集数: string;
    地图出鱼概率配置: {[fishId: string]: number}; // 鱼id: 概率值
    是否禁用钓法: boolean;
}

// NPC静态数据接口
export interface XGDY_NpcJsonData {
    id: string;
    名称: string;
    事件ID: string;
    对话对象: {
        [dialogId: string]: {
            内容: string;
            选项数组: {
                按钮内容: string;
                下一对话id: string;
                选项回调类型: '下一对话' | '关闭对话' | '条件判断';
                条件判断?: {
                    条件:{[key:string]:number};
                    条件达成发射剧情事件: string;
                    条件未达成显示失败对话并点击关闭: string;
                };
            }[];
        }
    };
}

// 其他玩家静态数据接口（文档中未详细定义，此处为基础结构）
export interface XGDY_OtherPlayerJsonData {
    id: string;
    // 可扩展其他基础属性
}

// 事件静态数据接口（文档中未详细定义，此处为基础结构）
export interface XGDY_EventJsonData {
    id: string;
    名称: string;
    触发条件: string;
    执行效果: string;
}

/**
 * 物品数据类型定义
 * key: 物品ID，value: 物品数量
 */
export type XGDY_ItemData = {
    [id: string]: number  // 物品ID到数量的映射
}

/**
 * 游戏存档数据接口定义
 * 根据策划文档中的DataManager保存数据结构设计
 */
export interface XGDY_SaveData {
    lastSignInTime:number;//首次登陆时间
    signInDay:number;//签到天数
    homeType:XGDY_HomeType;//0-默认黑框，1-无黑框
    carType:XGDY_CarType;//0-拖拉机，1-黄金拖拉机，2-大鲲
    lastGetIncomeTime:number;//上次获取收入时间
    //存入鱼池里的鱼数据
    poolFishes:{[id: string]: number};//存入鱼池里的鱼
    addIncome:number;//额外收入

    name:string;
    itemData: XGDY_ItemData;  // 物品列表数据
    usedSpecialItemData:  {[id: string]: number};  // 已使用特殊物品列表数据
    buiedSpecialItemData:  {[id: string]: number};  // 已购买特殊物品列表数据
    currentCompetitionLevel:number;//当前大赛进度
    map_7_Fishs:string[];//地图7出现过的鱼
    anglerData: {           // 钓友保存数据
        [id: string]: {     // 钓友ID映射到具体数据
            pullForce: number;          // 拉力值
            level: number;              // 当前等级
            isUnlocked: boolean;        // 是否解锁
            unlockedSkillIds: string[]; // 已解锁技能ID列表
            isActive: boolean;          // 是否出战
        }
    };
    fishData: {             // 鱼保存数据
        [id: string]: number;           // 鱼ID到数量的映射
    };
    skillData: {            // 技能保存数据
        [id: string]: number;           // 技能ID到等级的映射
    };
    fishingRodData: {       // 钓竿保存数据
        [id: string]: {     // 钓竿ID映射到具体数据
            isEquipped: boolean;        // 是否装备
            isUnlocked: boolean;        // 是否解锁
        }
    };
    npcData: {              // NPC保存数据
        [id: string]: boolean;          // NPCID到是否达成的映射
    };
    道具Data: {             // 道具保存数据
        [id: string]: number;           // 道具ID到数量的映射
        adTypeOptions: number;          // 广告类型选项次数
    };

    mapData: string[];
    lineTotalLength:number;
    unlockFishes: string[]; // 已解锁的鱼ID数组
    gameData: {             // 游戏保存数据
        currentAnglerIds: string[];     // 当前出战钓友ID数组（最多3个）
        linePullDamage: number;         // 拉线伤害加成（百分比）
        bigFishProbability: number;     // 当前大鱼概率
        probabilityType: 0 | 1 | 2;     // 概率类型：0-普通，1-倒计时5分钟，2-必中
        canCastSameSkill: boolean;      // 是否可施展同一技能
        isUsingCouragePower: boolean;   // 是否使用勇气之力
        skillTotalDamage: {             // 技能总伤害数据
            [id: string]: number;       // 技能ID到总伤害的映射
        }
    }
}

/**
 * 钓魂游戏数据管理器类
 * 负责管理游戏的静态配置数据、动态游戏状态和存档功能
 * 继承自Cocos Creator的Component类
 */
@ccclass('XGDY_DataManager')  // Cocos Creator组件装饰器

export class XGDY_DataManager extends Component {
    public static Instance: XGDY_DataManager;  // 单例实例，全局访问点
    private STORAGE_KEY = "XGDY_SaveData"  // 本地存储键名

    @property(JsonAsset)  // Cocos Creator属性装饰器，用于在编辑器中配置
    private jsonAsset: JsonAsset[] = [];  // 静态配置表JSON资源数组

    // 动态游戏数据对象
    public dynamicData = {
        isFirstEnterHome: true,
        isEnterHomeEnd : false,


        isEnterGame : false,
        isEnterGameEnd : false,
        isGameStart:false,
        isMove:false,
        moveDir:null as Vec3 |null,

        //相机
        cameraTarget:null as Node|null,
        cameraTargets:[] as Node[] | null, //相机目标

        //地图数据
        currentMapId: "地图_0" as string,  // 当前地图ID
        currentNpcNodes:[]  as Node[] | null, //地图npc
        currentMapFishs: [] as string[],  // 当前地图ID
        currentMapFishsProbility:[] as number[],
        allFishingSpots: [] as Vec3[] | null,  // 所有钓位点数组
        spawnPoint: null as Vec3 | null,  // 出生点位置
        hookPoint: null as Node | null,  // 上钩点位置
        fishPlaceNode: null as Node | null,  // 上钩点位置
        lengthStartPointNode: null as Node | null,  // 距离计算起点位置  
        mapWorldPos:null as Vec3 | null,  // 地图世界位置
        mapWidth: 0 as number,  // 地图宽度
        mapHeight: 0 as number,  // 地图高度
        isFishDirectionLeft:false,
        
        skillTimeData:{} as {[id:string]:number},

        //npc相关
        // npcDefaultDialogue:[] as Node[] | null,  // NPC对话容器节点
        interactionTarget: null as Node,  // 交互对象
        currentNpcId:"" as string,  // 当前NPC ID
        currentDialogId:"0" as string,  // 当前对话ID

        //移动相关
        currentFishingSpots: [] as Vec3[],  // 当前钓位点数组
        arrivedSpotCount: 0,  // 到达钓位数量
        reelEndCount:0,

        //游戏状态
        isInGame: false,  // 是否掉进水里
        isStopInteract:false,
        // isNeedIgnoreSkillAnimEnd:false,//忽略技能结束调用
        isNeedIgnoreSkillAnimEndSkills:[] as string[],

        isFallingIntoWater: false,  // 是否掉进水里
        isGoingToFishing:false,//是否正在移动到钓鱼点
        isFishingLineOpen: false ,  // 是否打开鱼线
        isFishing: false,  // 是否正在钓鱼中
        isFishHooking: false,  // 是否鱼上钩中
        isUpdateSkillEffect: false,  // 是否更新伤害
        isAutoFishing: false,  // 是否开启自动钓鱼模式

        isStartCauleLineLength:false,

        currentHealth:0,
         //游戏实时数据
        currentFishesValue : 0,
        currentAnglerNodes: [] as Node[],  // 当前出战钓友节点数组
        totalStamina: 0,  // 总体力值
        currentStamina: 0,  // 当前体力值
        currentPullForce: 0,  // 当前拉力值
        currentSpeed: 0,  // 当前速度值
        speedMin: -100,  // 最小速度值
        speedMax: 700,  // 最大速度值

        //当前钓竿相关
        currentRodData:null as XGDY_FishingRodJsonData|null,  // 当前钓竿配置数据
        currentRodPerSec: 0,  // 当前钓竿每秒伤害

        //当前钓友相关
        usingSkillAnglerIds:[] as string[],


        //鱼实时数据
        currentFishId: "" as string,  // 当前鱼的ID
        currentFishData:null as XGDY_FishJsonData|null,  // 当前鱼的配置数据
        lateDamageSpeed: 200,  // 血条更新速度
        currentFishBleed:0,
        fishMaxHp: 0,  // 当前鱼的最大生命值
        currentFishHp: 0,  // 当前鱼的生命值
        currentFishSpeed: 0,  // 当前鱼的速度
        currentFishStrength: 0,  // 当前鱼的力气

        currentSellFishs:[] as string[],//被送出的鱼

        //线实时数据
        fishMouth:null as Node | null,
        fishMouthPoints: [] as Node[] | null,  // 鱼嘴节点列表
        currentLineEndNode: null as Node | null,  // 当前线终点
        lineLength: 0,  // 线长



        rewardName:"" as string,  // 奖励名称
        rewardSpriteFrame : null as SpriteFrame,



        //特殊鱼（阴鱼）
        SpecialFishCurrentId : "",


        //特殊地图相关
        //通用倒计时
        remainingTime:0,
        mapPassTime:0,
        //黑坑
        isMapCanFishing:false,
        isMap101Challengeing:false,
        //庆典
        isMap102Challengeing:false,
        challengeTargetWeightCount:0,
        challengeWeightCount:0,
        challengeTargetShopMoney:0,
        //钓鱼大赛
        //预赛
        is_Map103_Challenge_1_Challengeing:false,
        Map103_Challenge_1_TargetFishCount:0,
        Map103_challenge_1_Count:0,
        //十强赛
        is_Map103_Challenge_2_Challengeing:false,
        //决赛
        aiNode:null as Node | null,
        is_Map103_Challenge_3_Challengeing:false,
        reversePullForce: 0,  // 反向拉力值
        addDamage:0,//额外伤害
  



        //鱼技能相关
        //切线技能
        isStopLineLengthCalc:false,//是否停止线长计算
        killLinePoints:{} as {[id:string]:Node},
        killedAnglerIds:[] as string[],//被击杀的 anglers
        //玩家到技能项映射，用于鱼计算当前血量是否够使用鱼技能
        anglerIdToSkillItemMap: {} as {[id:string]:{skillId:string,skillItem:Node}[]},











        //道具相关
        currentSpecialItemId:"" as string,  // 当前特殊道具ID
        //上鱼概率
        normalProbability: 0,  // 普通概率值
        probabilityType: 0 as 0 | 1 | 2,  // 概率类型：0-普通，1-倒计时5分钟，2-必中
        isDownCounting :false,

        isUsingDesperateBreath: false,  // 是否使用绝境气息

        canCastSameSkill: false,  // 是否可施展同一技能
        isUsingCouragePower: false,  // 是否使用勇气之力
        isUsingDragonKoi: false,  // 是否使用龙形锦鲤
        isUsingHeluoFish: false,  // 是否使用何罗鱼
    };

    // 游戏存档数据对象，初始化为默认值
    saveData: XGDY_SaveData = {
        lastSignInTime : 0,
        signInDay:0,
        homeType:XGDY_HomeType.公路,
        carType:XGDY_CarType.巨鲲,//坐骑类型
        lastGetIncomeTime:0,//上次获取收入时间
        addIncome:0,//额外收入
        poolFishes:{} as {[id: string]: number}, //存入鱼池里的鱼
        name:"你" ,
        itemData: {},  
        usedSpecialItemData: {},  
        buiedSpecialItemData: {}, 
        map_7_Fishs:[],
        anglerData: {}, 
        fishData: {},  
        skillData: {}, 
        fishingRodData: {},  
        npcData: {},  
        mapData: [], 
        currentCompetitionLevel:1, 
        道具Data: { 
            adTypeOptions: 0  
        },
        lineTotalLength:4,
        unlockFishes:[] as string[],
        gameData: { 
            currentAnglerIds: [], 
            linePullDamage: 0,  
            bigFishProbability: 0, 
            probabilityType: 0,  
            canCastSameSkill: false, 
            isUsingCouragePower: false, 
            skillTotalDamage: {}  
        }
    };


    onLoad() {
        XGDY_DataManager.Instance = this;  
        this.saveData = this.loadData(); 

        for(let i = 1;i<=90;i++){
            console.log(i+"    "+this.calcUpgradeExp(i));
        }

        this.updateSaveDataToDynamicData();
    }
    /**
     * 加载玩家数据
     * @returns 存档数据对象
     */
    private loadData(): XGDY_SaveData {
        const savedData = localStorage.getItem(this.STORAGE_KEY); 
        if (savedData) {  
            return JSON.parse(savedData);  
        }

        // 如果没有存档数据，返回默认初始化数据
        return {
            lastSignInTime:0,
            signInDay:0,
            homeType:XGDY_HomeType.广场,
            carType:XGDY_CarType.巨鲲,//坐骑类型
            lastGetIncomeTime:0,
            poolFishes:{}, //存入鱼池里的鱼
            addIncome:0,//额外收入
            name:"你",
            itemData: {
                "经验":0,
                "金币":0,
                "庆典币":0,
                "鱼竿_0_0":1,
                "等级":1,
                "总重量":0,
            }, 
            currentCompetitionLevel:1,
            map_7_Fishs:[],
            usedSpecialItemData: {},  
            buiedSpecialItemData: {}, 
            anglerData: {"钓友_0":{
                pullForce: 0,  
                level: 1,  
                isUnlocked: true, 
                unlockedSkillIds: ["技能_4_0"],  
                isActive: true,  
            },"钓友_1":{
                pullForce: 0,  
                level: 1,  
                isUnlocked: true, 
                unlockedSkillIds: ["技能_0_0"], 
                isActive: true,  
            },"钓友_2":{
                pullForce: 0, 
                level: 1,  
                isUnlocked: true, 
                unlockedSkillIds: [],  
                isActive: true,  
            }
            // ,"钓友_3":{
            //     pullForce: 0, 
            //     level: 1,  
            //     isUnlocked: true, 
            //     unlockedSkillIds: [],  
            //     isActive: false,  
            // },"钓友_4":{
            //     pullForce: 0, 
            //     level: 1,  
            //     isUnlocked: true, 
            //     unlockedSkillIds: [],  
            //     isActive: false,  
            // },"钓友_5":{
            //     pullForce: 0, 
            //     level: 1,  
            //     isUnlocked: true, 
            //     unlockedSkillIds: [],  
            //     isActive: false,  
            // },"钓友_6":{
            //     pullForce: 0, 
            //     level: 1,  
            //     isUnlocked: true, 
            //     unlockedSkillIds: [],  
            //     isActive: false,  
            // },"钓友_7":{
            //     pullForce: 0, 
            //     level: 1,  
            //     isUnlocked: true, 
            //     unlockedSkillIds: [],  
            //     isActive: false,  
            // },"钓友_8":{
            //     pullForce: 0, 
            //     level: 1,  
            //     isUnlocked: true, 
            //     unlockedSkillIds: [],  
            //     isActive: false,  
            // },"钓友_9":{
            //     pullForce: 0, 
            //     level: 1,  
            //     isUnlocked: true, 
            //     unlockedSkillIds: [],  
            //     isActive: false,  
            // },"钓友_10":{
            //     pullForce: 0, 
            //     level: 1,  
            //     isUnlocked: true, 
            //     unlockedSkillIds: [],  
            //     isActive: false,  
            // },"钓友_11":{
            //     pullForce: 0, 
            //     level: 1,  
            //     isUnlocked: true, 
            //     unlockedSkillIds: [],  
            //     isActive: false,  
            // },
            }, 
            fishData: {
            },  
            skillData: {"技能_4_0":1},  
            fishingRodData: {"钓竿_0_0":{
                isEquipped: true,  
                isUnlocked: true, 
            }
            },  
            npcData: {},  
            mapData:["地图_0"],
            道具Data: {
                adTypeOptions: 0  
            },
            lineTotalLength:4,
            unlockFishes:[],
            gameData: {
                currentAnglerIds: ["钓友_0","钓友_1","钓友_2"],  
                linePullDamage: 0, 
                bigFishProbability: 0,  
                probabilityType: 0,  
                canCastSameSkill: false,  
                isUsingCouragePower: false,  
                skillTotalDamage: {}  
            }
        };
    }

    /**
     * 保存数据到本地存储
     */
    saveToStorage() {
        // 将存档数据转换为JSON字符串并保存到本地存储
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.saveData));
    }

    clearMapData(){
        //地图数据
        this.dynamicData.currentMapId="地图_home" ; // 当前地图ID
        this.dynamicData.currentNpcNodes=[] ; //地图npc
        this.dynamicData.currentMapFishs=["鱼_0_0","鱼_0_0","鱼_0_0","鱼_0_0","鱼_0_0","鱼_0_0"] ; // 当前地图ID
        this.dynamicData.currentMapFishsProbility=[];
        this.dynamicData.allFishingSpots=[] ; // 所有钓位点数组
        this.dynamicData.spawnPoint=null ; // 出生点位置
        this.dynamicData.hookPoint= null ; // 上钩点位置
        this.dynamicData.fishPlaceNode=null ;  // 上钩点位置
        this.dynamicData.lengthStartPointNode=null ;  // 距离计算起点位置  
        this.dynamicData.mapWidth=0 ;  // 地图宽度
        this.dynamicData.mapHeight=0 ;  // 地图高度
        this.dynamicData.isFishDirectionLeft=false;
        this.dynamicData.currentAnglerNodes=[];
    }

    /**
     * 根据ID获取配置表中的物品数据
     * @param itemId 物品ID，格式：类型_次级类型_编号 或 类型_编号
     * @returns 对应的物品数据对象，若找不到则返回null
     */
    getItemDataById(itemId: string) {
        const ids = itemId.split("_");  // 将ID按下划线分割
        if (ids.length < 2) return null;  // ID格式错误，返回null

        let jsonName = ids[0];  // 配置表名称
        // 查找对应的JSON配置资源
        const jsonAsset = this.jsonAsset.find(asset => asset.name === jsonName);
        if (!jsonAsset) return null;  // 配置资源不存在，返回null

        const jsonData = jsonAsset.json;  // 获取配置表数据
        // 根据ID结构获取具体数据
        if (ids.length > 2) {
            // ID格式：类型_次级类型_编号
            return jsonData[ids[1]]?.[ids[2]] || null;
        } else {
            // ID格式：类型_编号
            return jsonData[ids[1]] || null;
        }
    }
    getSpecialItemData(){
        return this.jsonAsset.find(asset => asset.name === XGDY_ItemType.SpecialItem).json;
    }

    getAllFishRodData(){
        return this.jsonAsset.find(asset => asset.name === XGDY_ItemType.FishingRod).json;
    }
    getAllSkillData(){
        return this.jsonAsset.find(asset => asset.name === XGDY_ItemType.Skill).json;
    }
    getAllAnglersData(){
        return this.jsonAsset.find(asset => asset.name === XGDY_ItemType.Angler).json;
    }
     getAllMapsData(){
        return this.jsonAsset.find(asset => asset.name === XGDY_ItemType.Map).json;
    }
    getAllFishsData(){
          return this.jsonAsset.find(asset => asset.name === XGDY_ItemType.Fish).json;
    }

    
    updateSaveDataToDynamicData(){
       this.setCurrentRodData();
       this.setCurrentFishValue();
       let currentLevel =  XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Level];  
       let levelData= XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Level}_${currentLevel}`) as XGDY_LevelJsonData;  // 获取鱼的数量
       let maxHealth = this.calculateHealth(currentLevel);
       XGDY_DataManager.Instance.dynamicData.currentHealth = maxHealth;
        this.saveToStorage();
    }
    
    setCurrentRodData(){
        let iindRod = false;
        Object.keys(this.saveData.fishingRodData).forEach(fishingRodId => {
            if(!iindRod){
                const data = this.saveData.fishingRodData[fishingRodId];  // 获取鱼的数量
                if(data.isEquipped){
                    const fishRodData = this.getItemDataById(fishingRodId) as XGDY_FishingRodJsonData;
                    if (!fishRodData) {
                        console.error(`FishRod data not found for id: ${fishingRodId}`);
                        return;
                    }
                    this.dynamicData.currentRodData = fishRodData;
                    this.dynamicData.currentRodPerSec = fishRodData.秒伤 * XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.length;
                    iindRod = true;
                }
            }
        });
         this.saveToStorage();
    }

    setCurrentFishValue(){
        this.dynamicData.currentFishesValue = this.calculateTotalFishValue(); 
         this.saveToStorage();
    }


    checkIsMapCanFishing():boolean{
       if(!this.dynamicData.isMapCanFishing){
            if(this.dynamicData.currentMapId === XGDY_SpecialMapId.黑坑){
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"请先支付包场费");
                return false;
            }
            else if(this.dynamicData.currentMapId === XGDY_SpecialMapId.钓鱼大赛){
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"请先开启本轮比赛");
                return false;
            }
       }
       else{
            return true;
       }
    }



















  // 1. 调整阶梯分母：精准控制单级经验递增，适配目标鱼数量
    getStepDenominator(lv) {
        if (lv <= 10) return 8;     // 地图0（1-10级）：对齐原版初始节奏
        if (lv <= 20) return 13;     // 地图1（11-20级）：对齐原版第二区间
        if (lv <= 30) return 18;    // 地图2（21-30级）：对齐原版第三区间
        if (lv <= 40) return 28;    // 地图3（31-40级）：对齐原版第四区间
        if (lv <= 50) return 33;    // 地图4（41-50级）：对齐原版第五区间
        if (lv <= 60) return 38;    // 地图5（51-60级）：对齐原版第六区间
        if (lv <= 70) return 43;    // 地图6（61-70级）：按原步长+3递增分母
        if (lv <= 80) return 48;    // 地图7（71-80级）：按原步长+3递增分母
        return 53;                  // 溢出等级兜底（80级以上）
    }

    // 2. 单级升级经验计算：严格保证≥上一级
    calcUpgradeExp(lv) {
        if (lv < 1) return 0;
        const denominator = this.getStepDenominator(lv);
        // 优化n的计算逻辑：保证单级经验递增，且区间总经验匹配目标
        const baseN = Math.ceil((lv + denominator) / denominator);
        let levelGroup = Math.floor(lv / 10);
        const n = baseN + levelGroup;
       // 定义各区间专属倍率，1.0为原始值，按需修改
        const levelRate = [1.0, 0.7, 0.7, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35,       0.5, 0.5]; 
        if(levelGroup >= levelRate.length){
            levelGroup = levelRate.length - 1;
        }
        let exp = lv * 12 * n * levelRate[levelGroup]; // 应用区间倍率
        exp = Math.round(exp); // 取整保证数值整数

        // 强制保证当前级经验≥上一级（兜底逻辑）
        if (lv > 1) {
            const prevExp = this.calcUpgradeExp(lv - 1);
            return Math.max(exp, prevExp + 1); // 至少比上一级多1
        }
        return exp;
    }

    // /**
    //  * 计算指定等级区间的总升级经验
    //  * @param startLv 起始等级（包含）
    //  * @param endLv 结束等级（包含）
    //  * @returns 总经验值
    //  */
    // calcTotalExpBetweenLevels(startLv, endLv) {
    //     if (startLv < 1 || endLv < startLv) return 0;
    //     let total = 0;
    //     for (let lv = startLv; lv <= endLv; lv++) {
    //         total += this.calcUpgradeExp(lv);
    //     }
    //     return total;
    // }

    /**
     * 严格按配置返回鱼经验值：保证鱼经验≥前一级，适配目标数量
     * @param fishId 鱼等级ID（0~8，格式如"fish_0"）
     * @param mapId 地图ID（0~5，格式如"map_0"）
     * @returns 该鱼在当前地图的经验值，非法参数返回0
     */
    getFishExp(fishId, mapId) {
        // 解析参数
        let fishLevelId = Number(fishId?.split("_")[1]);
         let specialMapData:string[] = [XGDY_SpecialMapId.黑坑,XGDY_SpecialMapId.钓鱼大赛,XGDY_SpecialMapId.庆典];
        if(!specialMapData.includes(mapId)){
            mapId = Number(mapId?.split("_")[1]);
        }
        else{
           
            let normalMapIds:string[] = [];
            this.saveData.mapData.forEach(mapData=>{
                if(specialMapData.indexOf(mapData) == -1){
                    normalMapIds.push(mapData);
                }
            })
            let maxMapId = 0;
            normalMapIds.forEach(mapId=>{
                maxMapId = Math.max(maxMapId,Number(mapId.split("_")[1]));
            })
            mapId = maxMapId;
        }

        // 核心配置矩阵：精准匹配目标鱼数量，且鱼经验≥前一级
        // 中等鱼：地图0=1(150)、地图1=2(400)、地图2=3(900)、地图3=4(1500)、地图4=5(2700)、地图5=6(4500)
        const expConfig = [
            // 地图0（1-10级）：基础区间，低经验梯度
            { 0: 35, 1: 90, 2: 200, 3: 350, 4: 550, 5: 800, 6: 1100, 7: 1450, 8: 1850 },
            // 地图1（11-20级）：中等梯度，基准对齐原版400
            { 0: 80, 1: 200, 2: 400, 3: 600, 4: 850, 5: 1150, 6: 1500, 7: 1900, 8: 2350 },
            // 地图2（21-30级）：进阶梯度，基准对齐原版900
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // // 地图3（31-40级）：高阶梯度，基准对齐原版1500
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // // 地图4（41-50级）：专家梯度，基准对齐原版2700
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // // 地图5（51-60级）：大师梯度，基准对齐原版4500
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // // 地图6（61-70级）：宗师梯度，平滑递增扩展
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // // 地图7（71-80级）：传说梯度，满级最终区间
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // // 地图8（80级解锁，毕业地图）：终极梯度，最高经验
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },


            { 0: 250, 1: 500, 2: 750, 3: 1000, 4: 1500, 5: 2000, 6: 2500, 7: 3050, 8: 3650 },
            { 0: 250, 1: 500, 2: 750, 3: 1000, 4: 1500, 5: 2000, 6: 2500, 7: 3050, 8: 3650 },
            { 0: 250, 1: 500, 2: 750, 3: 1000, 4: 1500, 5: 2000, 6: 2500, 7: 3050, 8: 3650 },
            { 0: 250, 1: 500, 2: 750, 3: 1000, 4: 1500, 5: 2000, 6: 2500, 7: 3050, 8: 3650 },
            { 0: 250, 1: 500, 2: 750, 3: 1000, 4: 1500, 5: 2000, 6: 2500, 7: 3050, 8: 3650 },
            { 0: 250, 1: 500, 2: 750, 3: 1000, 4: 1500, 5: 2000, 6: 2500, 7: 3050, 8: 3650 },
            { 0: 250, 1: 500, 2: 750, 3: 1000, 4: 1500, 5: 2000, 6: 2500, 7: 3050, 8: 3650 },
            { 0: 250, 1: 500, 2: 750, 3: 1000, 4: 1500, 5: 2000, 6: 2500, 7: 3050, 8: 3650 },
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // 地图4（41-50级）：专家梯度，基准对齐原版2700
            // { 0: 400, 1: 800, 2: 1200, 3: 1500, 4: 1800, 5: 2700, 6: 3600, 7: 4550, 8: 5550 },
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // 地图5（51-60级）：大师梯度，基准对齐原版4500
            // { 0: 600, 1: 1200, 2: 1800, 3: 2400, 4: 3000, 5: 4500, 6: 6000, 7: 7550, 8: 9150 },
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // 地图6（61-70级）：宗师梯度，平滑递增扩展
            // { 0: 900, 1: 1800, 2: 2700, 3: 3600, 4: 4500, 5: 6000, 6: 7800, 7: 9700, 8: 11700 },
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // 地图7（71-80级）：传说梯度，满级最终区间
            // { 0: 1300, 1: 2600, 2: 3900, 3: 5200, 4: 6500, 5: 8500, 6: 10800, 7: 13200, 8: 15700 },
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 },
            // 地图8（80级解锁，毕业地图）：终极梯度，最高经验
            // { 0: 1800, 1: 3600, 2: 5400, 3: 7200, 4: 9000, 5: 11500, 6: 14300, 7: 17200, 8: 20200 }
            // { 0: 150, 1: 300, 2: 500, 3: 900, 4: 1300, 5: 1700, 6: 2150, 7: 2650, 8: 3200 }
        ];

          // 参数合法性校验：适配9地图（0~8）、9鱼等级（0~8）
        if (isNaN(mapId) || isNaN(fishLevelId) || mapId < 0 || mapId > 8 || fishLevelId < 0 || fishLevelId > 8) {
            console.warn('参数错误：mapId需0~8，fishLevelId需0~8');
            return 0;
        }

        // 常规场景返回配置值
        let exp = expConfig[mapId][fishLevelId] || 0;
        
        // 强制保证当前鱼经验≥同地图前一级鱼经验（兜底）
        if (fishLevelId > 0) {
            const prevFishExp = this.getFishExp(`fish_${fishLevelId - 1}`, `map_${mapId}`);
            exp = Math.max(exp, prevFishExp + 1);
        }

        // 经验值强制为5的倍数（完全保留原规则）
        const lastDigit = exp % 10;
        if ([8, 9, 0, 1, 2].includes(lastDigit)) {
            exp = Math.floor(exp / 5) * 5;
        } else if ([3, 4, 5, 6, 7].includes(lastDigit)) {
            exp = Math.ceil(exp / 5) * 5;
        }
        
        return exp;
    }

    // /**
    //  * 计算升级指定等级区间需要的中等鱼数量
    //  * @param startLv 起始等级
    //  * @param endLv 结束等级
    //  * @param mapId 地图ID（0~5）
    //  * @returns 所需中等鱼数量（向上取整）
    //  */
    // calcNeedFishCount(startLv, endLv, mapId) {
    //     // 定义各地图的中等鱼ID
    //     const middleFishIdMap = {
    //         0: 1, // 地图0中等鱼=1
    //         1: 2, // 地图1中等鱼=2
    //         2: 3, // 地图2中等鱼=3
    //         3: 4, // 地图3中等鱼=4
    //         4: 5, // 地图4中等鱼=5
    //         5: 6  // 地图5中等鱼=6
    //     };
    //     const middleFishId = middleFishIdMap[mapId];
    //     // 单条中等鱼经验
    //     const singleFishExp = this.getFishExp(`fish_${middleFishId}`, `map_${mapId}`);
    //     if (singleFishExp === 0) return 0;
    //     // 等级区间总经验
    //     const totalExp = this.calcTotalExpBetweenLevels(startLv, endLv);
    //     // 计算所需数量（向上取整）
    //     return Math.ceil(totalExp / singleFishExp);
    // }

    /**
     * 计算当前等级对应的体力值（保留原逻辑）
     * @param level 当前等级（正整数，≥1）
     * @returns 体力值，等级＜1返回0
     */
    calculateHealth(level) {
        // 非法等级校验
        if (!Number.isInteger(level) || level < 1) {
            console.warn('等级必须是≥1的整数');
            return 0;
        }

        let add = 0;
        if(this.saveData.usedSpecialItemData[XGDY_SpecialItem.冰河巨鲲] > 0){
            add = 100*this.saveData.usedSpecialItemData[XGDY_SpecialItem.冰河巨鲲];
        }
        
        // 核心公式计算
        return 50 * (level + 1) + add;
    }


    catchFish(fishId:string){
        XGDY_LoadManager.Instance.getFishIconById(fishId,(sp)=>{
            let fishData = this.getItemDataById(fishId) as XGDY_FishJsonData;  
            if (!fishData) {
                console.error(`Fish data not found for id: ${fishId}`);
                return;
            }

            //更新经验
            let experienceScale = this.dynamicData.currentMapId === XGDY_SpecialMapId.黑坑 ? 2 : 1;
            this.saveData.itemData[XGDY_ItemType.Experience] += experienceScale * this.getFishExp(fishId, this.dynamicData.currentMapId);  // 增加鱼的数量
            let currentExp = this.saveData.itemData[XGDY_ItemType.Experience];
            //更新等级
            let currentLevel =  this.saveData.itemData[XGDY_ItemType.Level];  
            let maxExp = this.calcUpgradeExp(currentLevel);
            let levelData= this.getItemDataById(`${XGDY_ItemType.Level}_${currentLevel}`) as XGDY_LevelJsonData;  // 获取鱼的数量
            // let maxExp = this.calcUpgradeExp(currentLevel);
            while(currentExp>= maxExp){
                this.saveData.itemData[XGDY_ItemType.Experience] -= maxExp;  
                this.saveData.itemData[XGDY_ItemType.Level] += 1;  
                let allMapData = this.getAllMapsData();  
                Object.keys(allMapData).forEach(mapId => {
                    let mapData = allMapData[mapId] as XGDY_MapJsonData;  
                    if(mapData.解锁等级 == this.saveData.itemData[XGDY_ItemType.Level]){
                        this.saveData.mapData.push(mapData.地图id);  
                        this.saveData.itemData[mapData.地图id] = 1;  
                    }
                });

                currentExp = this.saveData.itemData[XGDY_ItemType.Experience];
                maxExp = this.calcUpgradeExp(currentLevel);
            }
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Expression);

            // 更新总重
            this.saveData.itemData[XGDY_ItemType.Weight] += fishData.斤数; 
            //庆典更新重量计数
            if(this.dynamicData.isMap102Challengeing){
                this.dynamicData.challengeWeightCount += fishData.斤数;
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Update_Label);
                if(XGDY_DataManager.Instance.dynamicData.challengeWeightCount >= XGDY_DataManager.Instance.dynamicData.challengeTargetWeightCount){
                    
                    XGDY_DataManager.Instance.dynamicData.isMap102Challengeing = false;
                    XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] += XGDY_DataManager.Instance.dynamicData.challengeTargetShopMoney;
                    EventManager.Scene.emit(XGDY_GameEvents.UI_Update_CelebrationCoin_Money);
                    EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "恭喜你完成了挑战！");
                }
            }
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Weight);

            //更新鱼的数量
            this.saveData.itemData[fishId] = (this.saveData.itemData[fishId] || 0) + 1;  
            this.saveData.fishData[fishId] = (this.saveData.fishData[fishId] || 0) + 1;  
            //更新总价值
            this.dynamicData.currentFishesValue = this.calculateTotalFishValue();
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);

            //显示奖励面板
            if(!this.dynamicData.is_Map103_Challenge_1_Challengeing){
                //钓鱼大赛第3轮结束
                if(this.dynamicData.is_Map103_Challenge_3_Challengeing){
                    //结束挑战
                    XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_3_Challengeing = false;
                    XGDY_DataManager.Instance.dynamicData.isMapCanFishing = false;
                    XGDY_DataManager.Instance.saveData.currentCompetitionLevel = 1;
                    this.saveData.itemData[XGDY_ItemType.Coin] += 100000000;  
                    EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
                    if(!XGDY_DataManager.Instance.saveData.itemData[XGDY_SpecialItem.龙形锦鲤]){
                        XGDY_DataManager.Instance.saveData.itemData[XGDY_SpecialItem.龙形锦鲤] = 0;
                    }
                    XGDY_DataManager.Instance.saveData.itemData[XGDY_SpecialItem.龙形锦鲤]+=1;
                    EventManager.Scene.emit(XGDY_GameEvents.UI_Update_SpecialItemPanel);
                    this.saveToStorage();
                    EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "恭喜你夺得大赛冠军！获得奖金1亿");
                    this.scheduleOnce(()=>{
                        EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "恭喜你夺得大赛冠军！获得道具：龙形锦鲤！");
                    },0.3)

                    //更新挑战对话
                    EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_1_Init_String);
                    let dialogId = "0";
                    this.dynamicData.currentDialogId = dialogId.toString();
                }
                                //钓鱼大赛第3轮结束
                if(this.dynamicData.is_Map103_Challenge_2_Challengeing){
                    //结束挑战
                    XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_2_Challengeing = false;
                    XGDY_DataManager.Instance.dynamicData.isMapCanFishing = false;
                    XGDY_DataManager.Instance.saveData.currentCompetitionLevel = 3;
                    this.saveData.itemData[XGDY_ItemType.Coin] += 10000000;  // 增加鱼的数量
                    EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
                    this.saveToStorage();
                    EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "恭喜你进入决赛！获得奖金1000万");
                    //更新挑战对话
                    EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_3_Init_String);
                    let dialogId = XGDY_DataManager.Instance.saveData.currentCompetitionLevel - 1;
                    this.dynamicData.currentDialogId = dialogId.toString();
                }
                this.dynamicData.rewardName = fishData.名称;
                this.dynamicData.rewardSpriteFrame = sp;
                EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_REWARD_PANEL);
            }
            else{
                this.dynamicData.Map103_challenge_1_Count += 1;
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Update_Label);
                //钓鱼大赛第1轮结束
                if(this.dynamicData.Map103_challenge_1_Count >= this.dynamicData.Map103_Challenge_1_TargetFishCount){
                    //结束挑战
                    XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_1_Challengeing = false;
                    XGDY_DataManager.Instance.dynamicData.isMapCanFishing = false;
                    this.saveData.itemData[XGDY_ItemType.Coin] += 1000000;  // 增加鱼的数量
                    EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
                    this.saveToStorage();
                    EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "恭喜你进入十强赛！获得奖金100万");
                    //更新挑战对话
                    EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_2_Init_String);
                    let dialogId = XGDY_DataManager.Instance.saveData.currentCompetitionLevel;
                    this.dynamicData.currentDialogId = dialogId.toString();

                    //更新挑战
                    XGDY_DataManager.Instance.saveData.currentCompetitionLevel += 1;

                    //显示奖励
                    this.dynamicData.rewardName = fishData.名称;
                    this.dynamicData.rewardSpriteFrame = sp;
                    EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_REWARD_PANEL);
                }
            }

            //更新特殊地图鱼(何罗鱼山崖)
            if(this.dynamicData.currentMapId == XGDY_SpecialMapId.何罗鱼山崖){
                if(XGDY_Constant.MAP_6_SpecialFishes.indexOf(fishId) !== -1){
                    while(this.dynamicData.currentMapFishs.indexOf(fishId) !== -1){
                        this.dynamicData.currentMapFishs.splice(this.dynamicData.currentMapFishs.indexOf(fishId),1)
                        this.dynamicData.currentMapFishsProbility.splice(this.dynamicData.currentMapFishsProbility.length-1,1)
                    }
                    XGDY_DataManager.Instance.saveData.map_7_Fishs.push(fishId);
                }

                if(fishId == XGDY_Constant.MAP_6_LastFish){
                    this.dynamicData.currentMapFishs.splice(this.dynamicData.currentMapFishs.indexOf(fishId),1)
                    this.dynamicData.currentMapFishsProbility.splice(this.dynamicData.currentMapFishsProbility.length-1,1)
                    XGDY_DataManager.Instance.saveData.map_7_Fishs = [];
                }

                let isFound = false;
                XGDY_Constant.MAP_6_SpecialFishes.forEach((fishId)=>{
                   if(!isFound && XGDY_DataManager.Instance.saveData.map_7_Fishs.indexOf(fishId) == -1 ){
                    isFound = true;
                    XGDY_DataManager.Instance.dynamicData.currentMapFishs.push(fishId);
                    XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility =[] ;
                    let probility = 100/ XGDY_DataManager.Instance.dynamicData.currentMapFishs.length;
                    XGDY_DataManager.Instance.dynamicData.currentMapFishs.forEach((fishId)=>{
                        XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility.push(probility/100) ;
                    })
                   }
                })
                if(!isFound){
                    XGDY_DataManager.Instance.dynamicData.currentMapFishs.push(XGDY_Constant.MAP_6_LastFish);
                    XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility =[] ;
                    let probility = 100/ XGDY_DataManager.Instance.dynamicData.currentMapFishs.length;
                    XGDY_DataManager.Instance.dynamicData.currentMapFishs.forEach((fishId)=>{
                        XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility.push(probility/100) ;
                    })
                }
            }



            this.saveToStorage();
        });
        //阴鱼 十命全得
        if(fishId == XGDY_Constant.MAP_7_SpecialFishFirstId){
            XGDY_Constant.MAP_7_SpecialFishList.forEach((specialFishid)=>{
                if(specialFishid !== XGDY_Constant.MAP_7_SpecialFishFirstId){
                    this.catchFish(specialFishid);
                    if(!XGDY_DataManager.Instance.saveData.unlockFishes.includes(specialFishid)){
                        // if(XGDY_DataManager.Instance.dynamicData.currentMapId !== XGDY_SpecialMapId.庆典 && XGDY_DataManager.Instance.dynamicData.currentMapId !== XGDY_SpecialMapId.黑坑){
                            XGDY_DataManager.Instance.saveData.unlockFishes.push(specialFishid);
                            XGDY_DataManager.Instance.saveToStorage();
                        // }
                    }
                }   
            })
        }
    }

     sellAllFishes(isDoublePrice:boolean = false){
        let value = this.calculateTotalFishValue();
        if(value > 0){
            Object.keys(this.saveData.fishData).forEach(fishId => {
                this.saveData.fishData[fishId] = 0;  // 获取鱼的数量
                this.saveData.itemData[fishId] = 0;  // 增加鱼的数量
            });
            let valueAdd = isDoublePrice ? value*2 : value;  // 增加鱼的数量
            this.saveData.itemData[XGDY_ItemType.Coin] += valueAdd;  // 增加鱼的数量

            this.dynamicData.currentFishesValue = this.calculateTotalFishValue();
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
            EventManager.Scene.emit(XGDY_GameEvents.Sole_Fish);
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
            // EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_REWARD_PANEL);
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "获得金币：" + valueAdd);
        }
         this.saveToStorage();
    }

    sellFish(fishId:string){
        let fishData = this.getItemDataById(fishId) as XGDY_FishJsonData;  // 获取鱼的数量
        if(fishData.单价 && this.saveData.fishData[fishId] > 0){

            let value = fishData.单价 * this.saveData.fishData[fishId];
            
            this.saveData.fishData[fishId] = 0;  // 获取鱼的数量
            this.saveData.itemData[fishId] = 0;  // 增加鱼的数量

            this.dynamicData.currentFishesValue = this.calculateTotalFishValue();
            this.saveData.itemData[XGDY_ItemType.Coin] += value;  // 增加鱼的数量
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
            EventManager.Scene.emit(XGDY_GameEvents.Sole_Fish);
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "获得金币：" + value);
        }
        this.saveToStorage();
    }

    getFishRod(rodId:string){
        let rodData = this.getItemDataById(rodId) as XGDY_FishingRodJsonData;  // 获取鱼的数量

        if(rodId.split("_")[1] === "1"){
            Banner.Instance.ShowVideoAd(()=>{
                XGDY_LoadManager.Instance.getFishingRodIconById(rodId,(sp)=>{
                    if (!rodData) {
                        console.error(`Fish data not found for id: ${rodId}`);
                        return;
                    }
                    this.dynamicData.rewardName = rodData.名称;
                    this.saveData.itemData[rodId] = (this.saveData.itemData[rodId] || 0) + 1;  
                    this.saveData.fishingRodData[rodId] = {isEquipped:false,isUnlocked:true};  // 增加鱼的数量
                    this.dynamicData.rewardSpriteFrame = sp;
                    EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_REWARD_PANEL);
                    this.changeRod(rodId);
                    EventManager.Scene.emit(XGDY_GameEvents.XGDY_UpdateFishRodPanel);
                    this.saveToStorage();


                });
            })
            return;
        }
        let price = rodData.解锁价格;
        if(this.saveData.itemData[XGDY_ItemType.Coin] >= price){
            XGDY_LoadManager.Instance.getFishingRodIconById(rodId,(sp)=>{
                if (!rodData) {
                    console.error(`Fish data not found for id: ${rodId}`);
                    return;
                }
                this.saveData.itemData[XGDY_ItemType.Coin] -= price;
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
                this.dynamicData.rewardName = rodData.名称;
                this.saveData.itemData[rodId] = (this.saveData.itemData[rodId] || 0) + 1;  
                this.saveData.fishingRodData[rodId] = {isEquipped:false,isUnlocked:true};  // 增加鱼的数量
                this.dynamicData.rewardSpriteFrame = sp;
                EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_REWARD_PANEL);
                this.changeRod(rodId);
                EventManager.Scene.emit(XGDY_GameEvents.XGDY_UpdateFishRodPanel);
                this.saveToStorage();
            });
        }
        else{
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"金币不足");
        }
         
    }

    changeRod(rodId:string){
        Object.keys(this.saveData.fishingRodData).forEach(fishingRodId => {
                this.saveData.fishingRodData[fishingRodId].isEquipped = false;  // 获取鱼的数量
        });
        this.saveData.fishingRodData[rodId] = {isEquipped:true,isUnlocked:true};  // 增加鱼的数量
        EventManager.Scene.emit(XGDY_GameEvents.Change_Rod);
         this.saveToStorage();
    }


    setCurrentMap(mapId:string){
        this.dynamicData.currentMapId = mapId;
         this.saveToStorage();
    }

    setRod(fishingRodId){
         Object.keys(this.saveData.fishingRodData).forEach(fishingRodId => {
                this.saveData.fishingRodData[fishingRodId].isEquipped = false;  // 获取鱼的数量
        });
        this.saveData.fishingRodData[fishingRodId].isEquipped = true;
        this.setCurrentRodData();
        EventManager.Scene.emit(XGDY_GameEvents.Update_Rods);
        this.saveToStorage();
    }

    setAnglerIds(anglerIds:string[]){
        this.saveData.gameData.currentAnglerIds = anglerIds;
        Object.keys(this.saveData.anglerData).forEach(anglerId => {
            this.saveData.anglerData[anglerId].isActive = anglerIds.includes(anglerId);
        });
        this.setCurrentRodData();
        EventManager.Scene.emit(XGDY_GameEvents.Update_Anglers);
        this.saveToStorage();
    }

    upgradeAngler(anglerId:string){
        let anglerSaveData = this.saveData.anglerData[anglerId];
        let anglerJsonData = this.getItemDataById(anglerId) as XGDY_AnglerJsonData;
        let price =(Math.floor(anglerSaveData.level/10)+1)*anglerSaveData.level*anglerJsonData.等级配置["1"].下一等级解锁价格;
        if(this.saveData.itemData[XGDY_ItemType.Coin] < price){
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"金币不足");
            return;
        }
        if(anglerSaveData.level < 50){
          
            this.saveData.itemData[XGDY_ItemType.Coin] -= price;
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
            anglerSaveData.level++;
            this.saveData.itemData[anglerId] = anglerSaveData.level;  
            anglerSaveData.pullForce = anglerJsonData.等级配置["1"].拉力+anglerSaveData.level*2;
            Object.keys(anglerJsonData.技能列表).forEach(skillId => {
                let skillUnlockLv = anglerJsonData.技能列表[skillId];
                if(skillUnlockLv === anglerSaveData.level){
                    anglerSaveData.unlockedSkillIds.push(skillId);
                    this.saveData.itemData[skillId] = 1;  
                    this.saveData.skillData[skillId] = 1;
                }
            });
              EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"升级成功");
        }
         this.saveToStorage();
    }

    unlockAngler(anglerId:string){

        let ranglerData = this.getItemDataById(anglerId) as XGDY_AnglerJsonData;  // 获取鱼的数量
            XGDY_LoadManager.Instance.getAnglerIconById(anglerId,(sp)=>{
                if (!ranglerData) {
                    console.error(`Fish data not found for id: ${anglerId}`);
                    return;
                }
                this.dynamicData.rewardName = ranglerData.名称;
                this.saveData.itemData[anglerId] = (this.saveData.itemData[anglerId] || 0) + 1;  
                this.saveData.anglerData[anglerId] = {
                    level: 1,
                    isUnlocked: true,
                    isActive: false,
                    pullForce: 0,
                    unlockedSkillIds: [],
                  };
                this.dynamicData.rewardSpriteFrame = sp;
                EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_REWARD_PANEL);
                this.saveToStorage();
            });
    }

    upgradeSkill(skillId:string){
        let skillSaveData = this.saveData.skillData[skillId];
        let skillJsonData = this.getItemDataById(skillId) as XGDY_SkillJsonData;
        if(this.saveData.itemData[XGDY_ItemType.Coin] < skillJsonData.等级配置[skillSaveData].下一等级解锁价格){
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"金币不足");
            return;
        }
       
        if(skillSaveData< skillJsonData.等级配置.length){
            this.saveData.itemData[XGDY_ItemType.Coin] -= skillJsonData.等级配置[skillSaveData].下一等级解锁价格;
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
            this.saveData.skillData[skillId]++;
            this.saveData.itemData[skillId] = this.saveData.skillData[skillId];  
              EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"升级成功");
        }
         this.saveToStorage();
    }

    setLneLength(length:number){
        //切线中
        if(this.dynamicData.isStopLineLengthCalc){
            return;
        }
        let isFound = false;
        let rodLinLangth = 0;
        Object.keys(XGDY_DataManager.Instance.saveData.fishingRodData).forEach(key=>{
            if(!isFound){
                if(XGDY_DataManager.Instance.saveData.fishingRodData[key].isEquipped){
                    isFound = true;
                    let rodData = XGDY_DataManager.Instance.getItemDataById(key) as XGDY_FishingRodJsonData;  // 获取鱼的数量
                    rodLinLangth =  rodData.鱼线长度;
                }
            }
        })
        if(length>=rodLinLangth){
            if(this.dynamicData.is_Map103_Challenge_3_Challengeing){
                this.dynamicData.is_Map103_Challenge_3_Challengeing = false;
                XGDY_DataManager.Instance.dynamicData.isMapCanFishing = false;
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "本轮比赛挑战失败！");

                //更新挑战对话
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_3_Init_String);
                let dialogId = XGDY_DataManager.Instance.saveData.currentCompetitionLevel-1;
                this.dynamicData.currentDialogId = dialogId.toString();
            }
            if(this.dynamicData.is_Map103_Challenge_2_Challengeing){
                this.dynamicData.is_Map103_Challenge_2_Challengeing = false;
                XGDY_DataManager.Instance.dynamicData.isMapCanFishing = false;
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip, "本轮比赛挑战失败！");

                //更新挑战对话
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_2_Init_String);
                let dialogId = XGDY_DataManager.Instance.saveData.currentCompetitionLevel-1;
                this.dynamicData.currentDialogId = dialogId.toString();
            }
            XGDY_DataManager.Instance.dynamicData.isStopInteract = true;
            EventManager.Scene.emit(XGDY_GameEvents.Kill) 
            EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish,this.dynamicData.currentFishId) 
            EventManager.Scene.emit(XGDY_GameEvents.Clear_Skill);
        }
        this.dynamicData.lineLength = length;
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Line_length)
    }
        
    /**
     * 处理上鱼逻辑
     * 根据当前概率类型判断是否钓到鱼，以及钓到什么类型的鱼
     */
    setFishId() {
        this.dynamicData.currentFishId = this.dynamicData.currentMapFishs[this.determinePrize()];
        if (this.dynamicData.probabilityType === 2) {
            if(this.dynamicData.isDownCounting){
                this.dynamicData.probabilityType = 1;
            }
            else{
                // 必中大鱼类型处理
                this.dynamicData.probabilityType = 0;  // 重置为普通概率
            }
           
            EventManager.Scene.emit(XGDY_GameEvents.Hide_Special_Item_Tip,{itemName:XGDY_SpecialItem.传奇饵料});
        }
    }
    /**
     * 根据概率算法随机决定是否中奖及中哪个奖项
     */
    private determinePrize(): number | null {
        let maxPrize = this.dynamicData.currentMapFishs.length;
        // 获取对应算法的概率分布
        let probabilities = [...this.dynamicData.currentMapFishsProbility];

        if(this.dynamicData.currentMapId !== XGDY_SpecialMapId.黑坑 && this.dynamicData.probabilityType !== 0){
            let maxFishLevel = 0;
        
            this.dynamicData.currentMapFishs.forEach(fishId=>{
                maxFishLevel = Math.max(maxFishLevel,parseInt(fishId.split("_")[1]));
            })
            //LTODO: 地图鱼配置修改时需要修改
            // if(maxFishLevel > 0){
            //     maxFishLevel = maxFishLevel-1;
            // }

            let bigFishes:number[] = [];
            this.dynamicData.currentMapFishs.forEach((fishId,index)=>{
                if(parseInt(fishId.split("_")[1]) >= maxFishLevel){
                    bigFishes.push(index);
                }
            })

            let smallFishesCount = this.dynamicData.currentMapFishs.length - bigFishes.length;

            //修改概率，当前地图中最大等级和第二大等级鱼的所有鱼的概率总和为70%，其他等级鱼的概率总和为30%
            probabilities.forEach((probability,index)=>{
                if(bigFishes.includes(index)){
                    if(this.dynamicData.probabilityType === 1){
                        probabilities[index] = 0.7/bigFishes.length;
                    }
                    else if(this.dynamicData.probabilityType === 2){
                        probabilities[index] = 1/bigFishes.length;
                    }
                }
                else{
                    if(this.dynamicData.probabilityType === 1){
                        probabilities[index] = 0.3/smallFishesCount;
                    }
                    else if(this.dynamicData.probabilityType === 2){
                        probabilities[index] = 0;
                    }
                }
            })
        }




        
        // 计算总中奖概率
        const totalWinningProbability = probabilities.slice(0, maxPrize).reduce((sum, p) => sum + p, 0);
        
        // 先随机决定是否中奖
        const random = Math.random();
        if (random > totalWinningProbability) {
            return null;  // 未中奖
        }
        
        // 确定具体中哪个奖项
        let cumulativeProbability = 0;
        for (let i = 0; i < maxPrize; i++) {
            cumulativeProbability += probabilities[i];
            if (random <= cumulativeProbability) {
                return i;  // 奖项从1开始编号
            }
        }
        
        return null; 
    }

    
    


    goToFishing():boolean{
       if(this.checkNearByFishingPos()){
        this.dynamicData.arrivedSpotCount = 0;
        this.dynamicData.currentFishingSpots = [];
        this.dynamicData.currentFishingSpots[0] = this.dynamicData.allFishingSpots[0];
        for(let i = 0;i<this.saveData.gameData.currentAnglerIds.length-1;i++){
            let isFound = false;
            this.dynamicData.allFishingSpots.forEach((spot)=>{
                if(!isFound && Vec3.distance(spot,this.dynamicData.currentFishingSpots[i])>=100 && spot.y>this.dynamicData.currentFishingSpots[i].y){
                    this.dynamicData.currentFishingSpots[i+1] = spot;
                    isFound = true;
                }
            })
        }
        for(let j = 0;j<this.saveData.gameData.currentAnglerIds.length - this.dynamicData.currentFishingSpots.length;j++ ){
            this.dynamicData.currentFishingSpots[this.dynamicData.currentFishingSpots.length+j] = this.dynamicData.allFishingSpots[1+2*j]
        }
            EventManager.Scene.emit(XGDY_GameEvents.Move_To_Fishing_Pos);
            EventManager.Scene.emit(XGDY_GameEvents.UI_Hide_SettingBtn);
            EventManager.Scene.emit(XGDY_GameEvents.UI_Hide_MoveBtn);

            this.dynamicData.isGoingToFishing = true;
            return true;
       }
       else{
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"请先到岸边");
            return false;
       }
    }

    checkNearByFishingPos():boolean{
        let playerNode = this.dynamicData.currentAnglerNodes[0];
        this.dynamicData.allFishingSpots.sort((a, b) => { return Vec3.distance(a, playerNode.getWorldPosition()) - Vec3.distance(b, playerNode.getWorldPosition()); });
        if(Vec3.distance(this.dynamicData.allFishingSpots[0], playerNode.getWorldPosition())<200){
            return true;
        }else{
            return false;
        }
    }

    arrivedAtFishingSpot(){
        this.dynamicData.arrivedSpotCount++;
        if(this.dynamicData.arrivedSpotCount == this.saveData.gameData.currentAnglerIds.length){
            EventManager.Scene.emit(XGDY_GameEvents.抛竿);
            this.dynamicData.arrivedSpotCount = 0;
        }
    }

    startFishing(){
        this.dynamicData.isGoingToFishing = false;
        this.dynamicData.isFishing = true;
        //切线列表重置
        this.dynamicData.killedAnglerIds = [];
    }


    endFishing():boolean{
        if(!this.dynamicData.isFishHooking){
            EventManager.Scene.emit(XGDY_GameEvents.收杆);
            this.dynamicData.isGoingToFishing = false;
            this.dynamicData.reelEndCount = 0;
            return true;
        }else{
            EventManager.Scene.emit(XGDY_GameEvents.断线);
            this.dynamicData.isGoingToFishing = false;
            this.dynamicData.reelEndCount = 0;
            return true;
        }
    }

    reelRodEnd(){
        this.dynamicData.reelEndCount++;
        if(this.dynamicData.reelEndCount == (this.saveData.gameData.currentAnglerIds.length - this.dynamicData.killedAnglerIds.length)){
            this.dynamicData.isFishHooking = false;
            this.dynamicData.isFishing = false;
            EventManager.Scene.emit(XGDY_GameEvents.Show_CastRod_Btn);
            EventManager.Scene.emit(XGDY_GameEvents.UI_Show_SettingBtn);
            EventManager.Scene.emit(XGDY_GameEvents.UI_Show_MoveBtn);
        }
    }

    reelInFish(){
        this.dynamicData.reelEndCount = 0;
        if(XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.length){
            XGDY_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills = [...XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds];
        }
        EventManager.Scene.emit(XGDY_GameEvents.Clear_Skill_DownCound);
        EventManager.Scene.emit(XGDY_GameEvents.Play_ReelIn_Animation);
        EventManager.Scene.emit(XGDY_GameEvents.Fish_Die);
        EventManager.Scene.emit(XGDY_GameEvents.Hide_Kill_Btn);
    }



    /**
     * 计算鱼获总价
     * @returns 鱼获总价值
     */
    calculateTotalFishValue() {
        let totalValue = 0;  // 总价值初始为0
        // 遍历所有鱼获数据
        Object.keys(this.saveData.fishData).forEach(fishId => {
            const count = this.saveData.fishData[fishId];  // 获取鱼的数量
            // 根据鱼的ID获取鱼的配置数据
            const fishData = this.getItemDataById(fishId) as XGDY_FishJsonData;
            if (fishData && count > 0) {  // 如果鱼数据存在且数量大于0
                totalValue += fishData.单价 * count;  // 计算总价并累加
            }
        });
        return totalValue;  // 返回总价值
    }

   
   
    /**
     * 执行物品操作（增加或减少物品数量）
     * @param itemId 物品ID
     * @param count 变化数量（正数增加，负数减少）
     */
    saveItem(itemId: string, count: number) {
        // 更新物品数量，如果物品不存在则初始化为0再加上变化量
        this.saveData.itemData[itemId] = (this.saveData.itemData[itemId] || 0) + count;
        this.saveToStorage();  // 保存数据到本地存储
    }

    /**
     * 执行剧情事件
     * 将事件ID记录到物品数据中，表示该事件已完成
     * @param eventId 事件ID
     */
    executeEvent(eventId: string) {
        this.saveItem(eventId, 1);  // 将事件ID添加到物品数据中，数量为1表示已完成
    }

    /**
     * 判断物品条件是否达成
     * 用于检查是否满足特定物品数量要求
     * @param itemId 物品ID
     * @param condition 所需的物品数量条件
     * @returns 是否满足条件
     */
    judgeItemCondition(itemId: string, condition: number) {
        // 获取物品当前数量，不存在则为0
        const count = this.saveData.itemData[itemId] || 0;
        return count >= condition;  // 判断是否满足条件数量
    }

    /**
     * 执行道具效果
     * 根据道具ID执行对应的效果逻辑
     * @param itemId 道具ID
     */
    executeItemEffect(itemId: string) {
        let currentLevel =  this.saveData.itemData[XGDY_ItemType.Level];  
        let currentHealth =  this.dynamicData.currentHealth;
        let maxHealth = XGDY_DataManager.Instance.calculateHealth(currentLevel);
        this.saveData.itemData[itemId] = (this.saveData.itemData[itemId] || 0) - 1;
        this.saveToStorage();  // 保存数据到本地存储
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_SpecialItemPanel);
        // 根据道具ID执行不同的效果
        switch (itemId) {
            case XGDY_SpecialItem.祖传饵料:
                this.dynamicData.probabilityType = 1;  // 设置概率类型为持续5分钟
                console.log("生效了祖传饵料");
                 EventManager.Scene.emit(XGDY_GameEvents.Show_Special_Item_Tip,{itemName:XGDY_SpecialItem.祖传饵料});
                break;
            case XGDY_SpecialItem.传奇饵料:
                // 道具1：下一杆必是大鱼
                this.dynamicData.probabilityType = 2;  // 设置概率类型为必中大鱼
                 EventManager.Scene.emit(XGDY_GameEvents.Show_Special_Item_Tip,{itemName:XGDY_SpecialItem.传奇饵料});
                console.log("生效了传奇饵料");
                break;
            case XGDY_SpecialItem.辣条:
                currentHealth += 200;
                if(currentHealth>=maxHealth){
                    currentHealth = maxHealth;
                }
                this.dynamicData.currentHealth = currentHealth;
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Health);

                break;
            case XGDY_SpecialItem.哈基米南北绿豆:
                // 道具3：立即恢复500体力
                currentHealth += 500;
                if(currentHealth>=maxHealth){
                    currentHealth = maxHealth;
                }
                this.dynamicData.currentHealth = currentHealth;
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Health);
                break;
            case XGDY_SpecialItem.冰河巨鲲:
                if(!this.saveData.usedSpecialItemData[XGDY_SpecialItem.冰河巨鲲]){
                    this.saveData.usedSpecialItemData[XGDY_SpecialItem.冰河巨鲲] = 0;
                }
                this.saveData.usedSpecialItemData[XGDY_SpecialItem.冰河巨鲲] += 1;

                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Health);
                this.saveToStorage();  // 保存数据到本地存储
                break;
            case XGDY_SpecialItem.绝境气息:
                 this.dynamicData.isUsingDesperateBreath = true;  

                 EventManager.Scene.emit(XGDY_GameEvents.Show_Special_Item_Tip,{itemName:XGDY_SpecialItem.绝境气息});
                console.log("生效了绝境气息");
                break;
            case XGDY_SpecialItem.龙形锦鲤:
                if(!this.saveData.usedSpecialItemData[XGDY_SpecialItem.龙形锦鲤]){
                    this.saveData.usedSpecialItemData[XGDY_SpecialItem.龙形锦鲤] = 0;
                }
                this.saveData.usedSpecialItemData[XGDY_SpecialItem.龙形锦鲤] += 1;
                console.log("生效了龙形锦鲤,数量",this.saveData.usedSpecialItemData[XGDY_SpecialItem.龙形锦鲤]);
                this.saveToStorage();  // 保存数据到本地存储
                break;
            case XGDY_SpecialItem.烤鲲肉:
                if(!this.saveData.usedSpecialItemData[XGDY_SpecialItem.烤鲲肉]){
                    this.saveData.usedSpecialItemData[XGDY_SpecialItem.烤鲲肉] = 0;
                }
                this.saveData.usedSpecialItemData[XGDY_SpecialItem.烤鲲肉] += 1;
                console.log("生效了烤鲲肉,数量",this.saveData.usedSpecialItemData[XGDY_SpecialItem.烤鲲肉]);
                this.saveToStorage();  // 保存数据到本地存储
                break;
            case XGDY_SpecialItem.航母阻拦索:
                if(!this.saveData.usedSpecialItemData[XGDY_SpecialItem.航母阻拦索]){
                    this.saveData.usedSpecialItemData[XGDY_SpecialItem.航母阻拦索] = 0;
                }
                this.saveData.usedSpecialItemData[XGDY_SpecialItem.航母阻拦索] = 1;
                EventManager.Scene.emit(XGDY_GameEvents.Update_Special_Fish_line);
                this.saveToStorage();  // 保存数据到本地存储
                break;
            case "11":
                // 道具11：何罗鱼 - 特殊效果
                this.dynamicData.isUsingHeluoFish = true;  // 启用何罗鱼效果
                break;
            case "12":
                // 道具12：时间之力 - 开启自动钓鱼模式
                this.dynamicData.isAutoFishing = true;  // 启用自动钓鱼
                break;
            case "5":
                // 道具5：钓友们可施展同一钓法
                this.dynamicData.canCastSameSkill = true;  // 允许施展同一技能
                break;
        }
    }

    /**
     * 每帧更新逻辑
     * Cocos Creator生命周期函数
     * @param deltaTime 帧间隔时间（秒）
     */
    update(deltaTime: number) {
        // 处理概率倒计时（类型1：持续5分钟的概率提升）
        if (this.dynamicData.probabilityType === 1) {
            // 这里需要添加倒计时逻辑，时间结束后重置概率类型和概率值
            // 例如：countdownTime -= deltaTime;
            // if (countdownTime <= 0) { resetProbability(); }
        }
    }
}