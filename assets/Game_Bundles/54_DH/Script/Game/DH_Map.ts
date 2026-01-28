// 导入Cocos Creator核心模块
import { _decorator, Component, Node, PolygonCollider2D, find, Vec3, UITransform, instantiate, v3, tween } from 'cc';
import { DH_DataManager, DH_ItemType, DH_MapJsonData, DH_NpcJsonData } from '../Manager/DH_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
// 导入数据管理器

// 获取装饰器
const { ccclass, property } = _decorator;
/**
 * 地图组件类
 * 负责地图初始化、钓位点管理、NPC事件处理等地图相关逻辑
 */
@ccclass('DH_Map')
export class DH_Map extends Component {

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
            DH_DataManager.Instance.dynamicData.spawnPoint = this.spawnPoint.worldPosition;
        }
        let transform = this.node.getChildByName("bg").getComponent(UITransform)
        DH_DataManager.Instance.dynamicData.mapWidth = transform.width;
        DH_DataManager.Instance.dynamicData.mapHeight = transform.height;
        DH_DataManager.Instance.dynamicData.isFishDirectionLeft = this.isFishDirectionRight;

        let mapData = DH_DataManager.Instance.getItemDataById(this.mapId) as DH_MapJsonData;
        DH_DataManager.Instance.dynamicData.currentMapFishs = Object.keys(mapData.地图出鱼概率配置) ;

        DH_DataManager.Instance.dynamicData.currentMapFishsProbility =[] ;
        DH_DataManager.Instance.dynamicData.currentMapFishs.forEach((fishId)=>{
            DH_DataManager.Instance.dynamicData.currentMapFishsProbility.push(mapData.地图出鱼概率配置[fishId]/100) ;
        })

        // 初始化钓位点数据
        this.initFishingSpots();

        // 处理事件NPC显示状态
        this.handleEventNpcs();
    }

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
        const mapData = DH_DataManager.Instance.getItemDataById(this.mapId);
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
        DH_DataManager.Instance.dynamicData.allFishingSpots = [];
        DH_DataManager.Instance.dynamicData.currentFishingSpots = [];

        // 从碰撞体获取顶点作为钓位点
        const points = this.fishingSpotPoints.points;
        let worldX =  this.fishingSpotPoints.node.worldPosition.x;
        let worldY =  this.fishingSpotPoints.node.worldPosition.y;
        if (points && points.length > 0) {
            // 转换本地坐标到世界坐标并添加到钓位点数组
            points.forEach(point => {
                // const worldPos = this.node.convertToWorldSpaceAR(point);
                let pos = new Vec3(point.x+worldX,point.y+worldY)
                DH_DataManager.Instance.dynamicData.allFishingSpots.push(pos);
                let posNode = instantiate(this.posNode);
                posNode.parent = this.node;
                posNode.setWorldPosition(pos);
            });
        }

        // 销毁碰撞体，避免运行时继续检测
        this.fishingSpotPoints.destroy();
        console.log(`Initialized ${DH_DataManager.Instance.dynamicData.allFishingSpots.length} fishing spots`);
    }

     
    /**
     * 处理事件NPC显示状态
     * 根据事件完成情况显示或隐藏对应的NPC
     */
    private handleEventNpcs() {
        if (!this.npcContainer ) {
            return;
        }
        // DH_DataManager.Instance.dynamicData.npcDefaultDialogue = [];

        DH_DataManager.Instance.dynamicData.currentNpcNodes = []

        // 遍历所有事件NPC配置
        this.npcContainer.children.forEach(npcNode => {

             // 从数据管理器获取地图配置数据
            const npcData = DH_DataManager.Instance.getItemDataById(npcNode.name) as DH_NpcJsonData;
            let eventId = npcData.事件ID || "";
            // 检查事件是否已完成
            const isEventCompleted = DH_DataManager.Instance.judgeItemCondition(eventId, 1);
            // 如果事件已完成，隐藏NPC；否则显示NPC
            npcNode.active = !isEventCompleted;
            if(npcNode.active){
                DH_DataManager.Instance.dynamicData.currentNpcNodes.push(npcNode);
            }
            // DH_DataManager.Instance.dynamicData.npcDefaultDialogue.push(npcNode.getChildByName("对话"));
            npcNode.getChildByName("对话").scale = v3(0,0,0);

            
        });
    }

    /**
     * 获取地图专属鱼列表
     * @returns 专属鱼ID数组
     */
    public getExclusiveFishIds(): string[] {
        const mapData = DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Map}_${this.mapId}`);
        return mapData?.专属鱼 || [];
    }

    /**
     * 检查地图是否禁用特定钓法
     * @param fishingMethod 钓法ID
     * @returns 是否禁用
     */
    public isFishingMethodDisabled(fishingMethod: string): boolean {
        const mapData = DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Map}_${this.mapId}`);
        return mapData?.是否禁用钓法?.includes(fishingMethod) || false;
    }

    /**
     * 获取地图出鱼概率配置
     * @returns 鱼ID到概率的映射
     */
    public getFishSpawnProbabilities() {
        const mapData = DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Map}_${this.mapId}`);
        return mapData?.地图出鱼概率配置 || {};
    }


    private showNPCDefultDiagloue(){
         DH_DataManager.Instance.dynamicData.currentNpcNodes.forEach((npcNode,idx) => {
            tween(npcNode.getChildByName("对话"))
                .delay(idx * 0.7)
                .to(0.5, { scale: v3(1,1,1) })
                .start();
        });
    }

    Hide_Npc(npcId:string){
        DH_DataManager.Instance.dynamicData.currentNpcNodes.forEach((npcNode,idx) => {
           if(npcNode.name == npcId){
            npcNode.active = false;
           }
        });
    }

    addListener(){
        this.isAddListener = true;
        EventManager.on(DH_GameEvents.Show_NPC_Default_Dialouge,this.showNPCDefultDiagloue,this)
        EventManager.on(DH_GameEvents.Hide_Npc,this.Hide_Npc,this)
    }

    removeListener(){
        EventManager.off(DH_GameEvents.Show_NPC_Default_Dialouge,this.showNPCDefultDiagloue,this)
        EventManager.off(DH_GameEvents.Hide_Npc,this.Hide_Npc,this)
    }

    protected onDestroy(): void {
        this.removeListener();
    }


}