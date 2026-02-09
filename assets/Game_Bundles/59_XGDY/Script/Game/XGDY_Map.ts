// 导入Cocos Creator核心模块
import { _decorator, Component, Node, PolygonCollider2D, find, Vec3, UITransform, instantiate, v3, tween } from 'cc';
import { XGDY_DataManager, XGDY_ItemType, XGDY_MapJsonData, XGDY_NpcJsonData, XGDY_SpecialMapId } from '../Manager/XGDY_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_AIEntity } from './XGDY_AIEntity';
import { XGDY_Constant } from '../Common/XGDY_Constant';
// 导入数据管理器

// 获取装饰器
const { ccclass, property } = _decorator;
/**
 * 地图组件类
 * 负责地图初始化、钓位点管理、NPC事件处理等地图相关逻辑
 */
@ccclass('XGDY_Map')
export class XGDY_Map extends Component {

    @property(Boolean)
    public isFishDirectionRight: boolean = false;  // 地图ID，与配置表对应

    @property(String)
    public mapId: string = "";  // 地图ID，与配置表对应

    @property(Node)
    public spawnPoint: Node = null;  // 出生点节点

    @property(PolygonCollider2D)
    public fishingSpotPoints: PolygonCollider2D = null;  // 钓位点碰撞体

    // @property(PolygonCollider2D)
    // public fishingSpotCollider: PolygonCollider2D = null;  // 钓位点碰撞体

    @property(Node)
    public npcContainer: Node = null;  // NPC容器节点

    
    @property(Node)
    public posNode:Node = null;  // 事件NPC数组

    // npcDefaultDialogue: Node[] = [];  // NPC对话容器节点

    isAddListener: boolean = false;

    /**
     * 组件加载时调用
     * Cocos Creator生命周期函数
     */
    onLoad() {
        // 初始化地图数据
        this.initMapData();
    }

    /**
     * 初始化地图
     * 设置出生点、钓位点，处理NPC事件状态
     */
    public init() {
        if(!this.isAddListener){
            this.addListener();
        }
        // 设置出生点到数据管理器
        if (this.spawnPoint) {
            XGDY_DataManager.Instance.dynamicData.spawnPoint = this.spawnPoint.worldPosition;
        }
        let transform = this.node.getChildByName("bg").getComponent(UITransform)
        XGDY_DataManager.Instance.dynamicData.mapWorldPos = transform.node.worldPosition;
        XGDY_DataManager.Instance.dynamicData.mapWidth = transform.width;
        XGDY_DataManager.Instance.dynamicData.mapHeight = transform.height;
        XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft = this.isFishDirectionRight;

        let mapData = XGDY_DataManager.Instance.getItemDataById(this.mapId) as XGDY_MapJsonData;
        XGDY_DataManager.Instance.dynamicData.currentMapFishs = Object.keys(mapData.地图出鱼概率配置) ;

        XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility =[] ;
        let probility = 100/ XGDY_DataManager.Instance.dynamicData.currentMapFishs.length;
        XGDY_DataManager.Instance.dynamicData.currentMapFishs.forEach((fishId)=>{
        XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility.push(probility/100) ;
        })

        //特殊地图相关
        //河罗鱼山崖，调整概率
        if(this.mapId == XGDY_SpecialMapId.何罗鱼山崖){
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
   

        XGDY_DataManager.Instance.dynamicData.isMapCanFishing = this.mapId !== XGDY_SpecialMapId.黑坑 && this.mapId !== XGDY_SpecialMapId.钓鱼大赛;//黑坑、钓鱼大赛不能钓鱼
        XGDY_DataManager.Instance.dynamicData.isMap102Challengeing = false;//庆典
        if(this.mapId == XGDY_SpecialMapId.钓鱼大赛){
            let aiNode = this.node.getChildByName("AI")
            aiNode.getComponentInChildren(XGDY_AIEntity).init(XGDY_Constant.MAP_103_Challenge3_Data.anglerId);
            XGDY_DataManager.Instance.dynamicData.aiNode = aiNode;
        }

        // 初始化钓位点数据
        this.initFishingSpots();

        // 处理事件NPC显示状态
        this.handleEventNpcs();

        // 初始化钓位点数据
        this.handleCar();

        // if(this.mapId == "地图_home"){
        //    this.startRandomMoveNpc();
        // }

        // 处理AI实体
        this.handleAILayer();
    }



    // npcPosMap:Map<Node,{pos:Vec3,dir:Vec3,stopTime:number,isStoping:boolean}> = new Map();
    // npcMoveSpeed:number = 500;
    // startRandomMoveNpc(){
    //     this.node.getChildByName("randomNpc").children.forEach(child => {
    //         // 从碰撞体获取顶点作为钓位点
    //         let npcPoses = this.node.getChildByName("npcPoses").getComponent(PolygonCollider2D);
    //         const points = npcPoses.points;
    //         let worldX =  npcPoses.node.worldPosition.x;
    //         let worldY =  npcPoses.node.worldPosition.y;
    //         let randomIdx = Math.floor(Math.random()*points.length);
    //         let randomPos = new Vec3(points[randomIdx].x+worldX,points[randomIdx].y+worldY);
    //         let dir = randomPos.subtract(child.worldPosition).normalize();
    //         this.npcPosMap.set(child,{pos:randomPos,dir:dir.clone(),stopTime:0,isStoping:false});
    //     });
    // }

    // //每帧更改随机移动npc
    // noScaleNpc:boolean = false;
    // stopTime:number = 3;
    // update(dt: number) {
    //    if(this.mapId !== "地图_home") return;
    //     this.npcPosMap.forEach(({pos,dir,stopTime,isStoping},child)=>{
    //         let currentPos = child.worldPosition;
    //         let movePos = currentPos.add(pos.subtract(currentPos).normalize().multiplyScalar(this.npcMoveSpeed*dt));
    //         if(!isStoping){
    //             child.setWorldPosition(movePos);
    //             child.setScale(v3(dir.x,child.scale.y,1));
    //         }

            
    //         // 到达目标位置，停留随机秒，重新选择目标移动
    //         if(movePos.subtract(pos).length() < 30){
    //             if(!isStoping){
    //                 isStoping = true;
    //             }
             
    //             if(Math.random()*5 >= this.stopTime){
    //                 // 从碰撞体获取顶点作为钓位点
    //                 let npcPoses = this.node.getChildByName("npcPoses").getComponent(PolygonCollider2D);
    //                 const points = npcPoses.points;
    //                 let worldX =  npcPoses.node.worldPosition.x;
    //                 let worldY =  npcPoses.node.worldPosition.y;
    //                 let randomIdx = Math.floor(Math.random()*points.length);
    //                 let randomPos = new Vec3(points[randomIdx].x+worldX,points[randomIdx].y+worldY);
    //                 let dir = randomPos.subtract(currentPos).normalize();
    //                 this.npcPosMap.set(child,{pos:randomPos,dir:dir.clone(),stopTime:0,isStoping:false});
    //             }
    //         }
          
    //     })
    // }

    /**
     * 初始化地图数据
     * 从配置表加载地图静态数据
     */
    private initMapData() {
        if (!this.mapId) {
            console.error("Map ID is not set!");
            return;
        }

        // 从数据管理器获取地图配置数据
        const mapData = XGDY_DataManager.Instance.getItemDataById(this.mapId);
        if (!mapData) {
            console.error(`Map data not found for ID: ${this.mapId}`);
            return;
        }

        // 可以在这里根据地图配置数据进行额外初始化
        console.log(`Map ${this.mapId} initialized with data:`, mapData);
    }

    /**
     * 初始化钓位点
     * 从碰撞体获取钓位点并存储到数据管理器
     */
    private initFishingSpots() {
        if (!this.fishingSpotPoints) {
            console.warn("Fishing spot collider is not set!");
            return;
        }

        // 清空现有钓位点数据
        XGDY_DataManager.Instance.dynamicData.allFishingSpots = [];
        XGDY_DataManager.Instance.dynamicData.currentFishingSpots = [];

        // 从碰撞体获取顶点作为钓位点
        const points = this.fishingSpotPoints.points;
        let worldX =  this.fishingSpotPoints.node.worldPosition.x;
        let worldY =  this.fishingSpotPoints.node.worldPosition.y;
        if (points && points.length > 0) {
            // 转换本地坐标到世界坐标并添加到钓位点数组
            points.forEach(point => {
                // const worldPos = this.node.convertToWorldSpaceAR(point);
                let pos = new Vec3(point.x+worldX,point.y+worldY)
                XGDY_DataManager.Instance.dynamicData.allFishingSpots.push(pos);
                let posNode = instantiate(this.posNode);
                posNode.parent = this.node;
                posNode.setWorldPosition(pos);
            });
        }

        // 销毁碰撞体，避免运行时继续检测
        this.fishingSpotPoints.destroy();
        console.log(`Initialized ${XGDY_DataManager.Instance.dynamicData.allFishingSpots.length} fishing spots`);
    }

     
    /**
     * 处理事件NPC显示状态
     * 根据事件完成情况显示或隐藏对应的NPC
     */
    private handleEventNpcs() {
        if (!this.npcContainer ) {
            return;
        }
        // XGDY_DataManager.Instance.dynamicData.npcDefaultDialogue = [];

        XGDY_DataManager.Instance.dynamicData.currentNpcNodes = []

        // 遍历所有事件NPC配置
        this.npcContainer.children.forEach(npcNode => {

             // 从数据管理器获取地图配置数据
            const npcData = XGDY_DataManager.Instance.getItemDataById(npcNode.name) as XGDY_NpcJsonData;
            let eventId = npcData.事件ID || "";
            // 检查事件是否已完成
            const isEventCompleted = XGDY_DataManager.Instance.judgeItemCondition(eventId, 1);
            // 如果事件已完成，隐藏NPC；否则显示NPC
            npcNode.active = !isEventCompleted;
            if(npcNode.active){
                XGDY_DataManager.Instance.dynamicData.currentNpcNodes.push(npcNode);
            }
            // XGDY_DataManager.Instance.dynamicData.npcDefaultDialogue.push(npcNode.getChildByName("对话"));
            npcNode.getChildByName("对话").scale = v3(0,0,0);

            
        });
    }

    handleCar(){
        let carType = XGDY_DataManager.Instance.saveData.carType;
        let carNode = this.node.getChildByName("tractor_");
        carNode.children.forEach(child => {
            child.active = child.name == carType;
        });
    }

    handleAILayer(){

    }

    /**
     * 获取地图专属鱼列表
     * @returns 专属鱼ID数组
     */
    public getExclusiveFishIds(): string[] {
        const mapData = XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Map}_${this.mapId}`);
        return mapData?.专属鱼 || [];
    }

    /**
     * 检查地图是否禁用特定钓法
     * @param fishingMethod 钓法ID
     * @returns 是否禁用
     */
    public isFishingMethodDisabled(fishingMethod: string): boolean {
        const mapData = XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Map}_${this.mapId}`);
        return mapData?.是否禁用钓法?.includes(fishingMethod) || false;
    }

    /**
     * 获取地图出鱼概率配置
     * @returns 鱼ID到概率的映射
     */
    public getFishSpawnProbabilities() {
        const mapData = XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Map}_${this.mapId}`);
        return mapData?.地图出鱼概率配置 || {};
    }


    private showNPCDefultDiagloue(){
         XGDY_DataManager.Instance.dynamicData.currentNpcNodes.forEach((npcNode,idx) => {
            tween(npcNode.getChildByName("对话"))
                .delay(idx * 0.7)
                .to(0.5, { scale: v3(1,1,1) })
                .start();
        });
    }

    Hide_Npc(npcId:string){
        XGDY_DataManager.Instance.dynamicData.currentNpcNodes.forEach((npcNode,idx) => {
           if(npcNode.name == npcId){
            npcNode.active = false;
           }
        });
    }

    addListener(){
        this.isAddListener = true;
        EventManager.on(XGDY_GameEvents.Show_NPC_Default_Dialouge,this.showNPCDefultDiagloue,this)
        EventManager.on(XGDY_GameEvents.Hide_Npc,this.Hide_Npc,this)
        EventManager.on(XGDY_GameEvents.UI_Update_CarType,this.handleCar,this);
    }

    removeListener(){
        EventManager.off(XGDY_GameEvents.Show_NPC_Default_Dialouge,this.showNPCDefultDiagloue,this)
        EventManager.off(XGDY_GameEvents.Hide_Npc,this.Hide_Npc,this)
        EventManager.off(XGDY_GameEvents.UI_Update_CarType,this.handleCar,this);
    }

    protected onDestroy(): void {
        this.removeListener();
    }


}