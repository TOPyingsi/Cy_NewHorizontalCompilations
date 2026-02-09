// 导入Cocos Creator核心模块
import { _decorator, Component, JsonAsset, Node, SpriteFrame, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { DH_LoadManager } from './DH_LoadManager';
import Banner from 'db://assets/Scripts/Banner';
// 获取装饰器
const { ccclass, property } = _decorator;
/**
 * 物品类型枚举
 * 对应配置表中的类型标识，ID格式：类型_次级类型_编号 或 类型_编号
 */
export enum DH_ItemType {
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
    Weight = "总重量"
}


// 钓友静态数据接口
export interface DH_LevelJsonData {
    体力: number,
    下一级需要的经验: number
}

// 钓友静态数据接口
export interface DH_AnglerJsonData {
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
export interface DH_SkillJsonData {
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
export interface DH_FishingRodJsonData {
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
export interface DH_ItemJsonData {
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
export interface DH_FishJsonData {
    id: string;
    名称: string;
    分组: string;
    斤数: number;
    单价: number;
    力气: number;
    初始速度: number;
    血量:number;
    经验:number;
}

// 地图静态数据接口
export interface DH_MapJsonData {
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
export interface DH_NpcJsonData {
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
export interface DH_OtherPlayerJsonData {
    id: string;
    // 可扩展其他基础属性
}

// 事件静态数据接口（文档中未详细定义，此处为基础结构）
export interface DH_EventJsonData {
    id: string;
    名称: string;
    触发条件: string;
    执行效果: string;
}

/**
 * 物品数据类型定义
 * key: 物品ID，value: 物品数量
 */
export type DH_ItemData = {
    [id: string]: number  // 物品ID到数量的映射
}

/**
 * 游戏存档数据接口定义
 * 根据策划文档中的DataManager保存数据结构设计
 */
export interface DH_SaveData {
    name:string;
    itemData: DH_ItemData;  // 物品列表数据
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
    lockFishes: string[]; // 已解锁的鱼ID数组
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
@ccclass('DH_DataManager')  // Cocos Creator组件装饰器

export class DH_DataManager extends Component {
    public static Instance: DH_DataManager;  // 单例实例，全局访问点
    private STORAGE_KEY = "DH_SaveData"  // 本地存储键名

    @property(JsonAsset)  // Cocos Creator属性装饰器，用于在编辑器中配置
    private jsonAsset: JsonAsset[] = [];  // 静态配置表JSON资源数组

    // 动态游戏数据对象
    public dynamicData = {
        isEnterGame : false,
        isEnterGameEnd : false,
        isGameStart:false,
        isMove:false,
        moveDir:null as Vec3 |null,

        //相机
        cameraTarget:null as Node|null,

        //地图数据
        currentMapId: "地图_0" as string,  // 当前地图ID
        currentNpcNodes:[]  as Node[] | null, //地图npc
        currentMapFishs: ["鱼_0_0","鱼_0_0","鱼_0_0","鱼_0_0","鱼_0_0","鱼_0_0"] as string[],  // 当前地图ID
        currentMapFishsProbility:[],
        allFishingSpots: [] as Vec3[] | null,  // 所有钓位点数组
        spawnPoint: null as Vec3 | null,  // 出生点位置
        hookPoint: null as Node | null,  // 上钩点位置
        fishPlaceNode: null as Node | null,  // 上钩点位置
        lengthStartPointNode: null as Node | null,  // 距离计算起点位置  
        mapWidth: 0 as number,  // 地图宽度
        mapHeight: 0 as number,  // 地图高度
        isFishDirectionLeft:false,
        
        skillTimeData:{} as {[id:string]:number},

        //npc相关
        // npcDefaultDialogue:[] as Node[] | null,  // NPC对话容器节点
        interactionTarget: null as Node,  // 交互对象
        currentNpcId:"" as string,  // 当前NPC ID

        //上鱼概率
        normalProbability: 0,  // 普通概率值
        currentBigFishProbability: 0,  // 当前大鱼概率
        probabilityType: 0 as 0 | 1 | 2,  // 概率类型：0-普通，1-倒计时5分钟，2-必中

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
        currentRodData:null as DH_FishingRodJsonData|null,  // 当前钓竿配置数据
        currentRodPerSec: 0,  // 当前钓竿每秒伤害

        //当前钓友相关
        usingSkillAnglerIds:[] as string[],


        //鱼实时数据
        currentFishId: "" as string,  // 当前鱼的ID
        currentFishData:null as DH_FishJsonData|null,  // 当前鱼的配置数据
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


        //道具相关
        canCastSameSkill: false,  // 是否可施展同一技能
        isUsingCouragePower: false,  // 是否使用勇气之力
        isUsingDragonKoi: false,  // 是否使用龙形锦鲤
        isUsingHeluoFish: false,  // 是否使用何罗鱼
    };

    // 游戏存档数据对象，初始化为默认值
    saveData: DH_SaveData = {
        name:"你" ,
        itemData: {},  
        anglerData: {}, 
        fishData: {},  
        skillData: {}, 
        fishingRodData: {},  
        npcData: {},  
        mapData: [],  
        道具Data: { 
            adTypeOptions: 0  
        },
        lineTotalLength:4,
        lockFishes:[] as string[],
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
        DH_DataManager.Instance = this;  
        this.saveData = this.loadData(); 

        this.updateSaveDataToDynamicData();
    }
    /**
     * 加载玩家数据
     * @returns 存档数据对象
     */
    private loadData(): DH_SaveData {
        const savedData = localStorage.getItem(this.STORAGE_KEY); 
        if (savedData) {  
            return JSON.parse(savedData);  
        }

        // 如果没有存档数据，返回默认初始化数据
        return {
            name:"你",
            itemData: {
                "经验":0,
                "金币":0,
                "鱼竿_0_0":1,
                "等级":1,
                "总重量":0,
            },  
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
            lockFishes:[],
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
        this.dynamicData.currentMapId="地图_0" ; // 当前地图ID
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
        // 根据ID的第一个部分（类型）确定配置表名称
        // switch (parseInt(ids[0])) {
        //     case DH_ItemType.Angler:
        //         jsonName = "钓友";
        //         break;
        //     case DH_ItemType.Skill:
        //         jsonName = "技能";
        //         break;
        //     case DH_ItemType.FishingRod:
        //         jsonName = "钓竿";
        //         break;
        //     case DH_ItemType.Item:
        //         jsonName = "道具";
        //         break;
        //     case DH_ItemType.Fish:
        //         jsonName = "鱼";
        //         break;
        //     case DH_ItemType.Map:
        //         jsonName = "地图";
        //         break;
        //     case DH_ItemType.NPC:
        //         jsonName = "NPC";
        //         break;
        //     case DH_ItemType.PlotEvents:
        //         jsonName = "事件";
        //         break;
        //     case DH_ItemType.OtherPlayer:
        //         jsonName = "其他玩家";
        //         break;
        //     default:
        //         return null;  // 未知类型，返回null
        // }

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

    getAllFishRodData(){
        return this.jsonAsset.find(asset => asset.name === DH_ItemType.FishingRod).json;
    }
    getAllSkillData(){
        return this.jsonAsset.find(asset => asset.name === DH_ItemType.Skill).json;
    }
    getAllAnglersData(){
        return this.jsonAsset.find(asset => asset.name === DH_ItemType.Angler).json;
    }
     getAllMapsData(){
        return this.jsonAsset.find(asset => asset.name === DH_ItemType.Map).json;
    }
    getAllFishsData(){
          return this.jsonAsset.find(asset => asset.name === DH_ItemType.Fish).json;
    }

    
    updateSaveDataToDynamicData(){
       this.setCurrentRodData();
       this.setCurrentFishValue();
       let currentLevel =  DH_DataManager.Instance.saveData.itemData[DH_ItemType.Level];  
       let levelData= DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Level}_${currentLevel}`) as DH_LevelJsonData;  // 获取鱼的数量
       let maxHealth = this.calculateHealth(currentLevel);
       DH_DataManager.Instance.dynamicData.currentHealth = maxHealth;
        this.saveToStorage();
    }
    
    setCurrentRodData(){
        let iindRod = false;
        Object.keys(this.saveData.fishingRodData).forEach(fishingRodId => {
            if(!iindRod){
                const data = this.saveData.fishingRodData[fishingRodId];  // 获取鱼的数量
                if(data.isEquipped){
                    const fishRodData = this.getItemDataById(fishingRodId) as DH_FishingRodJsonData;
                    if (!fishRodData) {
                        console.error(`FishRod data not found for id: ${fishingRodId}`);
                        return;
                    }
                    this.dynamicData.currentRodData = fishRodData;
                    this.dynamicData.currentRodPerSec = fishRodData.秒伤 * DH_DataManager.Instance.saveData.gameData.currentAnglerIds.length;
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
  // 1. 调整阶梯分母：精准控制单级经验递增，适配目标鱼数量
    getStepDenominator(lv) {
        if (lv <= 10) return 5;     // 地图0（1-10）：控总经验≈24×150=3600
        if (lv <= 20) return 8;     // 地图1（11-20）：控总经验≈16×400=6400
        if (lv <= 30) return 11;    // 地图2（21-30）：控总经验≈11×900=9900
        if (lv <= 40) return 14;    // 地图3（31-40）：控总经验≈8×1500=12000
        if (lv <= 50) return 17;    // 地图4（41-50）：控总经验≈5×2700=13500
        return 20;                  // 地图5（51-60）：总经验递增，鱼数量≈6条
    }

    // 2. 单级升级经验计算：严格保证≥上一级
    calcUpgradeExp(lv) {
        if (lv < 1) return 0;
        const denominator = this.getStepDenominator(lv);
        // 优化n的计算逻辑：保证单级经验递增，且区间总经验匹配目标
        const baseN = Math.ceil((lv + denominator) / denominator);
        const levelGroup = Math.floor(lv / 10);
        const n = baseN + levelGroup;
        const exp = lv * 15 * n; // 调整基础系数为15，精准控总经验
        
        // 强制保证当前级经验≥上一级（兜底逻辑）
        if (lv > 1) {
            const prevExp = this.calcUpgradeExp(lv - 1);
            return Math.max(exp, prevExp + 1); // 至少比上一级多1
        }
        return exp;
    }

    /**
     * 计算指定等级区间的总升级经验
     * @param startLv 起始等级（包含）
     * @param endLv 结束等级（包含）
     * @returns 总经验值
     */
    calcTotalExpBetweenLevels(startLv, endLv) {
        if (startLv < 1 || endLv < startLv) return 0;
        let total = 0;
        for (let lv = startLv; lv <= endLv; lv++) {
            total += this.calcUpgradeExp(lv);
        }
        return total;
    }

    /**
     * 严格按配置返回鱼经验值：保证鱼经验≥前一级，适配目标数量
     * @param fishId 鱼等级ID（0~8，格式如"fish_0"）
     * @param mapId 地图ID（0~5，格式如"map_0"）
     * @returns 该鱼在当前地图的经验值，非法参数返回0
     */
    getFishExp(fishId, mapId) {
        // 解析参数
        let fishLevelId = Number(fishId?.split("_")[1]);
        mapId = Number(mapId?.split("_")[1]);

        // 核心配置矩阵：精准匹配目标鱼数量，且鱼经验≥前一级
        // 中等鱼：地图0=1(150)、地图1=2(400)、地图2=3(900)、地图3=4(1500)、地图4=5(2700)、地图5=6(4500)
        const expConfig = [
            // 地图0（1-10）：中等鱼1=150 → 3600/150=24条
            {0:35, 1:90, 2:200, 3:350},
            // 地图1（11-20）：中等鱼2=400 → 6400/400=16条（400≥150）
            {1:200, 2:400, 3:600, 4:800},
            // 地图2（21-30）：中等鱼3=900 → 9900/900=11条（900≥400）
            {2:500, 3:900, 4:1300, 5:1700},
            // 地图3（31-40）：中等鱼4=1500 → 12000/1500=8条（1500≥900）
            {3:1000, 4:1500, 5:2000, 6:2500},
            // 地图4（41-50）：中等鱼5=2700 → 13500/2700=5条（2700≥1500）
            {4:1800, 5:2700, 6:3600, 7:4500},
            // 地图5（51-60）：中等鱼6=4500 → 27000/4500=6条（4500≥2700）
            {5:3000, 6:4500, 7:6000, 8:7500}
        ];

        // 参数合法性校验
        if (isNaN(mapId) || isNaN(fishLevelId) || mapId < 0 || mapId > 5 || fishLevelId < 0 || fishLevelId > 8) {
            console.warn('参数错误：mapId需0~5，fishLevelId需0~8');
            return 0;
        }

        // 常规场景返回配置值
        let exp = expConfig[mapId][fishLevelId] || 0;
        
        // 强制保证当前鱼经验≥同地图前一级鱼经验（兜底）
        if (fishLevelId > 0) {
            const prevFishExp = this.getFishExp(`fish_${fishLevelId - 1}`, `map_${mapId}`);
            exp = Math.max(exp, prevFishExp + 1);
        }

        // 经验值强制为5的倍数（保留原规则）
        const lastDigit = exp % 10;
        if ([8, 9, 0, 1, 2].includes(lastDigit)) {
            exp = Math.floor(exp / 5) * 5;
        } else if ([3, 4, 5, 6, 7].includes(lastDigit)) {
            exp = Math.ceil(exp / 5) * 5;
        }
        
        return exp;
    }

    /**
     * 计算升级指定等级区间需要的中等鱼数量
     * @param startLv 起始等级
     * @param endLv 结束等级
     * @param mapId 地图ID（0~5）
     * @returns 所需中等鱼数量（向上取整）
     */
    calcNeedFishCount(startLv, endLv, mapId) {
        // 定义各地图的中等鱼ID
        const middleFishIdMap = {
            0: 1, // 地图0中等鱼=1
            1: 2, // 地图1中等鱼=2
            2: 3, // 地图2中等鱼=3
            3: 4, // 地图3中等鱼=4
            4: 5, // 地图4中等鱼=5
            5: 6  // 地图5中等鱼=6
        };
        const middleFishId = middleFishIdMap[mapId];
        // 单条中等鱼经验
        const singleFishExp = this.getFishExp(`fish_${middleFishId}`, `map_${mapId}`);
        if (singleFishExp === 0) return 0;
        // 等级区间总经验
        const totalExp = this.calcTotalExpBetweenLevels(startLv, endLv);
        // 计算所需数量（向上取整）
        return Math.ceil(totalExp / singleFishExp);
    }

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
        // 核心公式计算
        return 50 * (level + 1);
    }


    catchFish(fishId:string){
        DH_LoadManager.Instance.getFishIconById(fishId,(sp)=>{
            let fishData = this.getItemDataById(fishId) as DH_FishJsonData;  // 获取鱼的数量
            if (!fishData) {
                console.error(`Fish data not found for id: ${fishId}`);
                return;
            }
            this.dynamicData.rewardName = fishData.名称;
            this.saveData.itemData[DH_ItemType.Experience] += this.getFishExp(fishId, this.dynamicData.currentMapId);  // 增加鱼的数量
            let currentExp = this.saveData.itemData[DH_ItemType.Experience];
            let currentLevel =  this.saveData.itemData[DH_ItemType.Level];  
            let maxExp = this.calcUpgradeExp(currentLevel);
            let levelData= this.getItemDataById(`${DH_ItemType.Level}_${currentLevel}`) as DH_LevelJsonData;  // 获取鱼的数量
            // let maxExp = this.calcUpgradeExp(currentLevel);
            while(currentExp>= maxExp){
                this.saveData.itemData[DH_ItemType.Experience] -= maxExp;  
                this.saveData.itemData[DH_ItemType.Level] += 1;  
                let allMapData = this.getAllMapsData();  
                Object.keys(allMapData).forEach(mapId => {
                    let mapData = allMapData[mapId] as DH_MapJsonData;  
                    if(mapData.解锁等级 == this.saveData.itemData[DH_ItemType.Level]){
                        this.saveData.mapData.push(mapData.地图id);  
                        this.saveData.itemData[mapData.地图id] = 1;  
                    }
                });

                currentExp = this.saveData.itemData[DH_ItemType.Experience];
                maxExp = this.calcUpgradeExp(currentLevel);
            }
           
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Expression);
            this.saveData.itemData[DH_ItemType.Weight] += fishData.斤数;  // 增加鱼的数量
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Weight);

            this.saveData.itemData[fishId] = (this.saveData.itemData[fishId] || 0) + 1;  // 增加鱼的数量
            this.saveData.fishData[fishId] = (this.saveData.fishData[fishId] || 0) + 1;  // 增加鱼的数量
            this.dynamicData.rewardSpriteFrame = sp;
            this.dynamicData.currentFishesValue = this.calculateTotalFishValue();
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Value);

            EventManager.Scene.emit(DH_GameEvents.UI_SHOW_REWARD_PANEL);
            this.saveToStorage();
        });
    }

    sellAllFishes(){
        let value = this.calculateTotalFishValue();
        if(value > 0){
            Object.keys(this.saveData.fishData).forEach(fishId => {
                this.saveData.fishData[fishId] = 0;  // 获取鱼的数量
                this.saveData.itemData[fishId] = 0;  // 增加鱼的数量
            });
            this.saveData.itemData[DH_ItemType.Coin] += value;  // 增加鱼的数量

            this.dynamicData.currentFishesValue = this.calculateTotalFishValue();
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Value);
            EventManager.Scene.emit(DH_GameEvents.Sole_Fish);
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Money);
            // EventManager.Scene.emit(DH_GameEvents.UI_SHOW_REWARD_PANEL);
            EventManager.Scene.emit(DH_GameEvents.Show_Tip, "获得金币：" + value);
        }
         this.saveToStorage();
    }

    sellFish(fishId:string){
        let fishData = this.getItemDataById(fishId) as DH_FishJsonData;  // 获取鱼的数量
        if(fishData.单价 && this.saveData.fishData[fishId] > 0){

            let value = fishData.单价 * this.saveData.fishData[fishId];
            
            this.saveData.fishData[fishId] = 0;  // 获取鱼的数量
            this.saveData.itemData[fishId] = 0;  // 增加鱼的数量

            this.dynamicData.currentFishesValue = this.calculateTotalFishValue();
            this.saveData.itemData[DH_ItemType.Coin] += value;  // 增加鱼的数量
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Value);
            EventManager.Scene.emit(DH_GameEvents.Sole_Fish);
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Money);
            EventManager.Scene.emit(DH_GameEvents.Show_Tip, "获得金币：" + value);
        }
        
    }

    getFishRod(rodId:string){
        let rodData = this.getItemDataById(rodId) as DH_FishingRodJsonData;  // 获取鱼的数量

        if(rodId.split("_")[1] === "1"){
            Banner.Instance.ShowVideoAd(()=>{
                DH_LoadManager.Instance.getFishingRodIconById(rodId,(sp)=>{
                    if (!rodData) {
                        console.error(`Fish data not found for id: ${rodId}`);
                        return;
                    }
                    this.dynamicData.rewardName = rodData.名称;
                    this.saveData.itemData[rodId] = (this.saveData.itemData[rodId] || 0) + 1;  
                    this.saveData.fishingRodData[rodId] = {isEquipped:false,isUnlocked:true};  // 增加鱼的数量
                    this.dynamicData.rewardSpriteFrame = sp;
                    EventManager.Scene.emit(DH_GameEvents.UI_SHOW_REWARD_PANEL);
                    this.changeRod(rodId);
                    EventManager.Scene.emit(DH_GameEvents.DH_UpdateFishRodPanel);
                    this.saveToStorage();


                });
            })
            return;
        }
        let price = rodData.解锁价格;
        if(this.saveData.itemData[DH_ItemType.Coin] >= price){
            DH_LoadManager.Instance.getFishingRodIconById(rodId,(sp)=>{
                if (!rodData) {
                    console.error(`Fish data not found for id: ${rodId}`);
                    return;
                }
                this.saveData.itemData[DH_ItemType.Coin] -= price;
                EventManager.Scene.emit(DH_GameEvents.UI_Update_Money);
                this.dynamicData.rewardName = rodData.名称;
                this.saveData.itemData[rodId] = (this.saveData.itemData[rodId] || 0) + 1;  
                this.saveData.fishingRodData[rodId] = {isEquipped:false,isUnlocked:true};  // 增加鱼的数量
                this.dynamicData.rewardSpriteFrame = sp;
                EventManager.Scene.emit(DH_GameEvents.UI_SHOW_REWARD_PANEL);
                this.changeRod(rodId);
                EventManager.Scene.emit(DH_GameEvents.DH_UpdateFishRodPanel);
                this.saveToStorage();
            });
        }
        else{
            EventManager.Scene.emit(DH_GameEvents.Show_Tip,"金币不足");
        }
         
    }

    changeRod(rodId:string){
        Object.keys(this.saveData.fishingRodData).forEach(fishingRodId => {
                this.saveData.fishingRodData[fishingRodId].isEquipped = false;  // 获取鱼的数量
        });
        this.saveData.fishingRodData[rodId] = {isEquipped:true,isUnlocked:true};  // 增加鱼的数量
        EventManager.Scene.emit(DH_GameEvents.Change_Rod);
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
        EventManager.Scene.emit(DH_GameEvents.Update_Rods);
        this.saveToStorage();
    }

    setAnglerIds(anglerIds:string[]){
        this.saveData.gameData.currentAnglerIds = anglerIds;
        Object.keys(this.saveData.anglerData).forEach(anglerId => {
            this.saveData.anglerData[anglerId].isActive = anglerIds.includes(anglerId);
        });
        this.setCurrentRodData();
        EventManager.Scene.emit(DH_GameEvents.Update_Anglers);
        this.saveToStorage();
    }

    upgradeAngler(anglerId:string){
        let anglerSaveData = this.saveData.anglerData[anglerId];
        let anglerJsonData = this.getItemDataById(anglerId) as DH_AnglerJsonData;
        let price =(Math.floor(anglerSaveData.level/10)+1)*anglerSaveData.level*anglerJsonData.等级配置["1"].下一等级解锁价格;
        if(this.saveData.itemData[DH_ItemType.Coin] < price){
            EventManager.Scene.emit(DH_GameEvents.Show_Tip,"金币不足");
            EventManager.Scene.emit(DH_GameEvents.UI_SHOW_GET_MORE_MONEY_PANEL);
            return;
        }
        if(anglerSaveData.level < 50){
          
            this.saveData.itemData[DH_ItemType.Coin] -= price;
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Money);
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
              EventManager.Scene.emit(DH_GameEvents.Show_Tip,"升级成功");
        }
         this.saveToStorage();
    }

    unlockAngler(anglerId:string){

        let ranglerData = this.getItemDataById(anglerId) as DH_AnglerJsonData;  // 获取鱼的数量
            DH_LoadManager.Instance.getAnglerIconById(anglerId,(sp)=>{
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
                EventManager.Scene.emit(DH_GameEvents.UI_SHOW_REWARD_PANEL);
                this.saveToStorage();
            });
    }

    upgradeSkill(skillId:string){
        let skillSaveData = this.saveData.skillData[skillId];
        let skillJsonData = this.getItemDataById(skillId) as DH_SkillJsonData;
        if(this.saveData.itemData[DH_ItemType.Coin] < skillJsonData.等级配置[skillSaveData].下一等级解锁价格){
            EventManager.Scene.emit(DH_GameEvents.Show_Tip,"金币不足");
            EventManager.Scene.emit(DH_GameEvents.UI_SHOW_GET_MORE_MONEY_PANEL);
            return;
        }
       
        if(skillSaveData< skillJsonData.等级配置.length){
            this.saveData.itemData[DH_ItemType.Coin] -= skillJsonData.等级配置[skillSaveData].下一等级解锁价格;
            EventManager.Scene.emit(DH_GameEvents.UI_Update_Money);
            this.saveData.skillData[skillId]++;
            this.saveData.itemData[skillId] = this.saveData.skillData[skillId];  
              EventManager.Scene.emit(DH_GameEvents.Show_Tip,"升级成功");
        }
         this.saveToStorage();
    }

    setLneLength(length:number){
        let isFound = false;
        let rodLinLangth = 0;
        Object.keys(DH_DataManager.Instance.saveData.fishingRodData).forEach(key=>{
            if(!isFound){
                if(DH_DataManager.Instance.saveData.fishingRodData[key].isEquipped){
                    isFound = true;
                    let rodData = DH_DataManager.Instance.getItemDataById(key) as DH_FishingRodJsonData;  // 获取鱼的数量
                    rodLinLangth =  rodData.鱼线长度;
                }
            }
        })
        if(length>=rodLinLangth){
            DH_DataManager.Instance.dynamicData.isStopInteract = true;
            EventManager.Scene.emit(DH_GameEvents.Kill) 
            EventManager.Scene.emit(DH_GameEvents.Destory_Fish,this.dynamicData.currentFishId) 
            EventManager.Scene.emit(DH_GameEvents.Clear_Skill);
        }
        this.dynamicData.lineLength = length;
        EventManager.Scene.emit(DH_GameEvents.UI_Update_Line_length)
    }
        
    /**
     * 处理上鱼逻辑
     * 根据当前概率类型判断是否钓到鱼，以及钓到什么类型的鱼
     */
    setFishId() {
        // 根据当前概率类型处理上鱼逻辑
        if (this.dynamicData.probabilityType === 2) {
            // 必中大鱼类型处理
            this.dynamicData.probabilityType = 0;  // 重置为普通概率
        }
        this.dynamicData.currentFishId = this.dynamicData.currentMapFishs[this.determinePrize()];
    }
    /**
     * 根据概率算法随机决定是否中奖及中哪个奖项
     */
    private determinePrize(): number | null {
        let maxPrize = this.dynamicData.currentMapFishs.length;
        // 获取对应算法的概率分布
        const probabilities = this.dynamicData.currentMapFishsProbility;
        
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
            EventManager.Scene.emit(DH_GameEvents.Move_To_Fishing_Pos);
            EventManager.Scene.emit(DH_GameEvents.UI_Hide_SettingBtn);
            EventManager.Scene.emit(DH_GameEvents.UI_Hide_MoveBtn);

            this.dynamicData.isGoingToFishing = true;
            return true;
       }
       else{
            EventManager.Scene.emit(DH_GameEvents.Show_Tip,"请先到岸边");
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
            EventManager.Scene.emit(DH_GameEvents.抛竿);
            this.dynamicData.arrivedSpotCount = 0;
        }
    }

    startFishing(){
        this.dynamicData.isGoingToFishing = false;
        this.dynamicData.isFishing = true;
    }


    endFishing():boolean{
        if(!this.dynamicData.isFishHooking){
            EventManager.Scene.emit(DH_GameEvents.收杆);
            this.dynamicData.isGoingToFishing = false;
            this.dynamicData.reelEndCount = 0;
            return true;
        }else{
            EventManager.Scene.emit(DH_GameEvents.断线);
            this.dynamicData.isGoingToFishing = false;
            this.dynamicData.reelEndCount = 0;
            return true;
        }
    }

    reelRodEnd(){
        this.dynamicData.reelEndCount++;
        if(this.dynamicData.reelEndCount == this.saveData.gameData.currentAnglerIds.length){
            this.dynamicData.isFishHooking = false;
            this.dynamicData.isFishing = false;
            EventManager.Scene.emit(DH_GameEvents.Show_CastRod_Btn);
            EventManager.Scene.emit(DH_GameEvents.UI_Show_SettingBtn);
            EventManager.Scene.emit(DH_GameEvents.UI_Show_MoveBtn);
        }
    }

    reelInFish(){
        this.dynamicData.reelEndCount = 0;
        if(DH_DataManager.Instance.dynamicData.usingSkillAnglerIds.length){
            DH_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills = [...DH_DataManager.Instance.dynamicData.usingSkillAnglerIds];
        }
        EventManager.Scene.emit(DH_GameEvents.Clear_Skill_DownCound);
        EventManager.Scene.emit(DH_GameEvents.Play_ReelIn_Animation);
        EventManager.Scene.emit(DH_GameEvents.Hide_Kill_Btn);
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
            const fishData = this.getItemDataById(fishId) as DH_FishJsonData;
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
        // 根据道具ID执行不同的效果
        switch (itemId) {
            case "0":
                // 道具0：钓大鱼概率提升20%，持续5分钟
                this.dynamicData.currentBigFishProbability += 20;  // 增加当前大鱼概率
                this.dynamicData.probabilityType = 1;  // 设置概率类型为持续5分钟
                break;
            case "1":
                // 道具1：下一杆必是大鱼
                this.dynamicData.probabilityType = 2;  // 设置概率类型为必中大鱼
                break;
            case "2":
                // 道具2：立即恢复200体力
                this.dynamicData.currentStamina += 200;  // 增加当前体力
                break;
            case "3":
                // 道具3：立即恢复500体力
                this.dynamicData.currentStamina += 500;  // 增加当前体力
                break;
            case "6":
                // 道具6：勇气之力 - 免疫钓法禁用
                this.dynamicData.isUsingCouragePower = true;  // 启用勇气之力
                break;
            case "7":
                // 道具7：龙形锦鲤 - 5%永久钓法伤害加成（上限100%）
                this.dynamicData.isUsingDragonKoi = true;  // 启用龙形锦鲤效果
                break;
            case "9":
                // 道具9：烤鲲肉 - 拉线伤害+2%（上限100%）
                this.saveData.gameData.linePullDamage += 2;  // 增加拉线伤害加成
                // 确保拉线伤害加成不超过100%
                if (this.saveData.gameData.linePullDamage > 100) {
                    this.saveData.gameData.linePullDamage = 100;
                }
                this.saveToStorage();  // 保存数据到本地存储
                break;
            case "10":
                // 道具10：冰河巨鲲 - 额外体力+50
                this.dynamicData.totalStamina += 50;  // 增加总体力上限
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