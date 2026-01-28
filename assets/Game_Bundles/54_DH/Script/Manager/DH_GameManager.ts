// 导入Cocos Creator核心模块
import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, Layout, v3, PhysicsSystem2D, EPhysics2DDrawFlags } from 'cc';
// 导入其他管理器
import { DH_DataManager, DH_LevelJsonData } from './DH_DataManager';
import { DH_LoadManager } from './DH_LoadManager';
import { DH_ItemType } from './DH_DataManager';
import { DH_Map } from '../Game/DH_Map';
import { DH_BaseEntity } from '../Game/DH_BaseEntity';
import { DH_Camera } from '../Game/DH_Camera';
import { DH_Fish } from '../Game/DH_Fish';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { DH_AudioManager } from './DH_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

// 获取装饰器
const { ccclass, property } = _decorator;

/**
 * 交互类型枚举
 * 定义游戏中可能的交互对象类型
 */
export enum DH_InteractionType {
    Home,       // 0-返回主页
    NPC,        // 1-NPC交互
    Tractor     // 2-拖拉机(回家)
}

/**
 * 钓鱼游戏管理器类
 * 负责统筹游戏主逻辑，包括地图加载、角色管理、钓鱼流程控制等
 * 实现单例模式，确保全局游戏逻辑的一致性
 * 继承自Cocos Creator的Component类
 */
@ccclass('DH_GameManager')
export class DH_GameManager extends Component {
    public static Instance: DH_GameManager;  // 单例实例，全局访问点

    @property(Node)
    private fishPlaceConter: Node = null;  // 地图容器节点，用于挂载地图预制体

    @property(Node)
    private mapContainer: Node = null;  // 地图容器节点，用于挂载地图预制体

    @property(Node)
    private anglerContainer: Node = null;  // 钓友容器节点，用于挂载钓友角色节点

    @property(Node)
    private fishContainer: Node = null;  // 鱼容器节点，用于挂载鱼节点

    @property(Node)
    private bleedNodeContainer: Node = null;  // 鱼流血节点容器

    @property(Node)
    private gameCamera: Node = null;  // 主相机节点，用于控制镜头跟随

    private probabilityCountdown: number = 0;  // 概率倒计时(秒)

    /**
     * 组件加载时的初始化方法
     * Cocos Creator生命周期函数
     */
    onLoad() {
    //     PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
    // EPhysics2DDrawFlags.Pair |
    // EPhysics2DDrawFlags.CenterOfMass |
    // EPhysics2DDrawFlags.Joint |
    // EPhysics2DDrawFlags.Shape;
        // 设置单例实例，确保全局唯一
        DH_GameManager.Instance = this;

        this.addListener(); 
        DH_DataManager.Instance.dynamicData.isInGame = false;
        EventManager.Scene.emit(DH_GameEvents.UI_INIT_UI);

    }

    /**
     * 初始化游戏状态
     * 重置所有游戏运行时状态变量
     */
    private initGameState() {
        this.probabilityCountdown = 0;
        // 清空容器节点
        // this.mapContainer.removeAllChildren();
        this.mapContainer.children.forEach((child)=>{
            child.destroy();
        })
        // this.anglerContainer.removeAllChildren();
        this.anglerContainer.children.forEach((child)=>{
            child.destroy();
        });
        // this.fishContainer.removeAllChildren();
        this.fishContainer.children.forEach((child)=>{
            child.destroy();
        });
    }

    enterGame(){ 
        DH_DataManager.Instance.dynamicData.isInGame = true;        
        // 初始化游戏状态
        this.initGameState();
        this.loadMap();
        DH_AudioManager.getInstance().playMusic("bgm");
          
        EventManager.Scene.emit(DH_GameEvents.UI_SHOW_GAMEUI);
        ProjectEventManager.emit(ProjectEvent.游戏开始, "钓魂")
    }

    exitGame(){
        DH_DataManager.Instance.dynamicData.isInGame = false;
        this.initGameState();
        EventManager.Scene.emit(DH_GameEvents.UI_INIT_UI);
        this.gameCamera.getComponent(DH_Camera).setOrignPos();
        DH_DataManager.Instance.dynamicData.isGameStart = false;
        DH_DataManager.Instance.clearMapData();  
        EventManager.Scene.emit(DH_GameEvents.Sole_Fish);
        DH_AudioManager.getInstance().playMusic("bgm");
        ProjectEventManager.emit(ProjectEvent.游戏结束, "钓魂")
    }

    /**
     * 加载指定地图
     * @param mapId 要加载的地图ID
     */
    loadMap() {
        // 从加载管理器获取地图预制体
        DH_LoadManager.Instance.getMapPrefabById(DH_DataManager.Instance.dynamicData.currentMapId, (prefab: Prefab) => {
            if (!prefab) {
                console.error(`Failed to load map prefab with id: ${DH_DataManager.Instance.dynamicData.currentMapId}`);
                return;
            }

            // 实例化地图预制体并添加到容器
            const mapNode = instantiate(prefab);
            mapNode.setParent(this.mapContainer);
            mapNode.setPosition(Vec3.ZERO);
            
            // 初始化地图(假设地图节点上有Map组件)
            const mapComponent = mapNode.getComponent(DH_Map);
            if (mapComponent) {
                mapComponent.init();
            }

            // DH_DataManager.Instance.dynamicData.npcDefaultDialogue.forEach((npcNode)=>{
            //     let worldPos = npcNode.worldPosition;
            //     npcNode.setParent(this.anglerContainer);
            //     npcNode.setWorldPosition(worldPos);
            // })

            DH_DataManager.Instance.dynamicData.currentNpcNodes.forEach((npcNode)=>{
                let worldPos = npcNode.worldPosition;
                npcNode.setParent(this.anglerContainer);
                npcNode.setWorldPosition(worldPos);
            })

            DH_DataManager.Instance.dynamicData.currentAnglerNodes = [];
            // 更新钓友位置
            this.updateAnglerNodes();

            
            // 开启相机跟随
            // this.startCameraFollow();
            DH_DataManager.Instance.dynamicData.isGameStart = true;
        });
    }

    /**
     * 更新钓友节点
     * 根据当前出战钓友列表创建或更新钓友角色节点
     */
    updateAnglerNodes() {
        if(!DH_DataManager.Instance.dynamicData.isInGame) {
            return;
        }
        // 暂停相机跟随
        this.stopCameraFollow();
        
        // 获取当前出战钓友ID列表
        const currentAnglerIds = DH_DataManager.Instance.saveData.gameData.currentAnglerIds;
        let spawnPoint = DH_DataManager.Instance.dynamicData.spawnPoint;
        if (DH_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
            // 如果没有出战钓友，将位置设置到出生点
            spawnPoint = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0].worldPosition;
        }

        // if (spawnPoint && DH_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
        //     DH_DataManager.Instance.dynamicData.currentAnglerNodes[0].setPosition(spawnPoint);
        // }

        // 销毁现有钓友节点
        this.anglerContainer.children.forEach((child) => {
            if(child.name.split("_")[0] == "钓友") {
                child.destroy();
            }
        })
        DH_DataManager.Instance.dynamicData.currentAnglerNodes = [];

        // let anglerPrefabs = [];
        let playerNodeOutters :Node[]= [];

        // // 创建布局节点用于排列钓友
        // const layoutNode = new Node('AnglerLayout');
        // layoutNode.setParent(this.anglerContainer);
        
        // 遍历出战钓友ID，创建对应的角色节点
        currentAnglerIds.forEach((anglerId, index) => {
            DH_LoadManager.Instance.getAnglerPrefabById(anglerId, (prefab: Prefab) => {
                if (!prefab) {
                    console.error(`Failed to load angler prefab with id: ${anglerId}`);
                    return;
                }

                // 实例化钓友节点
                const anglerNodeOutter = instantiate(prefab);
                // anglerNodeOutter.active = false;
                anglerNodeOutter.setParent(this.anglerContainer);
                anglerNodeOutter.name = anglerId;

                playerNodeOutters.push(anglerNodeOutter);

                if(playerNodeOutters.length == currentAnglerIds.length) {
                    let node = new Node;
                    node.setParent(this.anglerContainer);
                    node.setWorldPosition(spawnPoint);
                    const layout = node.addComponent(Layout);
                    layout.type = Layout.Type.HORIZONTAL;
                    layout.resizeMode = Layout.ResizeMode.CONTAINER;
                    // layout.spacingX = -1100;
                    playerNodeOutters.forEach((playerNode) => {
                        playerNode.setParent(node);
                    })
                    layout.updateLayout();
                    layout.enabled = false;

                    playerNodeOutters.forEach((playerNodeOutter) => {
                        let worldPosition = playerNodeOutter.worldPosition;
                        playerNodeOutter.setParent(this.anglerContainer);
                        playerNodeOutter.setWorldPosition(worldPosition);
                        // playerNodeOutter.active = true;
                    })
                    node.destroy();

                    // 如果是第一个钓友，设置到初始位置
                    let playerNode = null;

                    playerNodeOutters.forEach((anglerNodeOutter)=>{
                        if (anglerNodeOutter.name === currentAnglerIds[0]) {
                            const spawnPoint = DH_DataManager.Instance.dynamicData.spawnPoint;
                            if (spawnPoint) {
                                anglerNodeOutter.setWorldPosition(spawnPoint);
                                playerNode = anglerNodeOutter.children[0];
                            }
                        }
                    })



                    let playerNodes :Node[]=[];
                    playerNodeOutters.forEach((playerNodeOutter,idx) => {
                        let playerNode = playerNodeOutter.children[0];
                        let worldPosition = playerNode.worldPosition;
                        playerNode.setParent(this.anglerContainer);
                        // if(idx!==0){
                            let neworldPosition  = v3(worldPosition.x+Math.random()*20-50,worldPosition.y+Math.random()*20-50,worldPosition.z)
                            playerNode.setWorldPosition(neworldPosition);
                        // }
                        // else{
                        //     playerNode.setWorldPosition(worldPosition);
                        // }

                        const baseEntity = playerNode.getComponent(DH_BaseEntity);
                        if (baseEntity) {
                            baseEntity.init(currentAnglerIds[idx]);
                        }
                        playerNodes.push(playerNode);
                        playerNodeOutter.destroy();
                    })

                    playerNode.setWorldPosition(spawnPoint);




                    DH_DataManager.Instance.dynamicData.currentAnglerNodes = playerNodes;
                     // 假设相机组件有followTarget方法
                    const cameraComponent = this.gameCamera.getComponent(DH_Camera);
                    if (cameraComponent && DH_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
                        cameraComponent.setCameraPosition(DH_DataManager.Instance.dynamicData.currentAnglerNodes[0].worldPosition.clone());
                    }
                    // 重新开启相机跟随
                    this.startCameraFollow();

                    DH_DataManager.Instance.dynamicData.isEnterGameEnd = true;
                    EventManager.Scene.emit(DH_GameEvents.Enter_Map_End);
                }

                // // 添加到动态数据中的钓友节点数组
                // DH_DataManager.Instance.dynamicData.currentAnglerNodes.push(anglerNode);

                // // 如果是第一个钓友，设置到初始位置
                // if (index === 0) {
                //     const spawnPoint = DH_DataManager.Instance.dynamicData.spawnPoint;
                //     if (spawnPoint) {
                //         anglerNode.setPosition(spawnPoint);
                //     }
                // }
            });
        });

        // // 关闭布局节点(后续可根据需要删除)
        // layoutNode.destroy();
    
    }

    // /**
    //  * 将钓友设置到出生点
    //  */
    // private setAnglersToSpawnPoint() {
    //     const spawnPoint = DH_DataManager.Instance.dynamicData.spawnPoint;
    //     if (spawnPoint && DH_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
    //         DH_DataManager.Instance.dynamicData.currentAnglerNodes[0].setPosition(spawnPoint);
    //     }
    // }

    /**
     * 开始相机跟随
     * 跟随第一个出战钓友
     */
    private startCameraFollow() {
        // 假设相机组件有followTarget方法
        const cameraComponent = this.gameCamera.getComponent(DH_Camera);
        if (cameraComponent && DH_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
            cameraComponent.setFollowTarget(DH_DataManager.Instance.dynamicData.currentAnglerNodes[0]);
        }
    }

    /**
     * 停止相机跟随
     */
    private stopCameraFollow() {
        const cameraComponent = this.gameCamera.getComponent(DH_Camera);
        if (cameraComponent) {
            cameraComponent.stopFollow();
        }
    }

    /**
     * 触发回家提示
     */
    private triggerReturnHomePrompt() {
        // 显示回家提示UI
        console.log('Show return home prompt');
        // 实际项目中这里应该显示确认对话框
    }

    /**
     * 施展技能
     * @param skillId 技能ID
     */
    castSkill(skillId: string) {
        // 检查是否禁用钓法
        const isFishingMethodDisabled = this.checkFishingMethodDisabled();
        if (isFishingMethodDisabled) {
            // 检查是否使用勇气之力
            if (!DH_DataManager.Instance.dynamicData.isUsingCouragePower) {
                console.log('Fishing method is disabled, cannot cast skill');
                return;
            } else {
                // 消耗勇气之力
                DH_DataManager.Instance.dynamicData.isUsingCouragePower = false;
            }
        }

        // 应用龙形锦鲤的伤害加成
        let damageMultiplier = 1;
        if (DH_DataManager.Instance.dynamicData.isUsingDragonKoi) {
            damageMultiplier = 1.05; // 5%伤害加成
            // 保存加成状态
            DH_DataManager.Instance.saveToStorage();
        }

        // 检查是否所有钓友可施展同一技能
        if (DH_DataManager.Instance.dynamicData.canCastSameSkill) {
            // 所有角色都施展该技能
            this.castSkillForAllAnglers(skillId, damageMultiplier);
        } else {
            // 只有当前选中的钓友施展技能
            this.castSkillForCurrentAngler(skillId, damageMultiplier);
        }
    }

    /**
     * 检查钓法是否被禁用
     * @returns 是否禁用
     */
    private checkFishingMethodDisabled(): boolean {
        // 获取当前地图数据，检查是否禁用钓法
        const currentMapId = ''; // 实际项目中需要获取当前地图ID
        const mapData = DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Map}_${currentMapId}`);
        return mapData?.isFishingMethodDisabled || false;
    }

    /**
     * 所有钓友施展技能
     * @param skillId 技能ID
     * @param damageMultiplier 伤害乘数
     */
    private castSkillForAllAnglers(skillId: string, damageMultiplier: number) {
        DH_DataManager.Instance.dynamicData.currentAnglerNodes.forEach(anglerNode => {
            this.executeSkill(anglerNode, skillId, damageMultiplier);
        });
    }

    /**
     * 当前钓友施展技能
     * @param skillId 技能ID
     * @param damageMultiplier 伤害乘数
     */
    private castSkillForCurrentAngler(skillId: string, damageMultiplier: number) {
        if (DH_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
            const currentAngler = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0];
            this.executeSkill(currentAngler, skillId, damageMultiplier);
        }
    }

    /**
     * 执行技能效果
     * @param anglerNode 钓友节点
     * @param skillId 技能ID
     * @param damageMultiplier 伤害乘数
     */
    private executeSkill(anglerNode: Node, skillId: string, damageMultiplier: number) {
        // 获取技能数据
        const skillData = DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Skill}_${skillId}`);
        if (!skillData) {
            console.error(`Skill data not found for id: ${skillId}`);
            return;
        }

        // 播放技能动画(假设钓友节点有SkillComponent组件)
        const skillComponent = anglerNode.getComponent('SkillComponent');
        // if (skillComponent) {
        //     skillComponent.playSkillAnimation(skillId);
        // }

        // 计算技能伤害并应用乘数
        const skillLevel = DH_DataManager.Instance.saveData.skillData[skillId] || 1;
        const baseDamage = skillData.等级配置[skillLevel]?.总伤 || 0;
        const finalDamage = baseDamage * damageMultiplier;

        // 记录技能总伤害
        DH_DataManager.Instance.saveData.gameData.skillTotalDamage[skillId] = 
            (DH_DataManager.Instance.saveData.gameData.skillTotalDamage[skillId] || 0) + finalDamage;
        
        // 保存数据
        DH_DataManager.Instance.saveToStorage();
    }

    /**
     * 创建鱼节点
     * @param fishId 鱼的ID
     */
    createFish(fishId: string) {
        DH_LoadManager.Instance.getFishPrefabById(fishId, (prefab: Prefab) => {
            if (!prefab) {
                console.error(`Failed to load fish prefab with id: ${fishId}`);
                return;
            }

            if(!DH_DataManager.Instance.saveData.lockFishes.includes(fishId)){
                DH_DataManager.Instance.saveData.lockFishes.push(fishId);
                DH_DataManager.Instance.saveToStorage();
            }

            // 实例化鱼节点
            const fishNode = instantiate(prefab);
            fishNode.setParent(this.fishContainer);
            fishNode.setWorldPosition(DH_DataManager.Instance.dynamicData.hookPoint.worldPosition.clone());
            
            // 初始化鱼(假设鱼节点上有FishComponent组件)
            const fishComponent = fishNode.getComponent(DH_Fish);
            if (fishComponent) {
                fishComponent.init(fishId,this.fishPlaceConter,this.bleedNodeContainer);
            }

            // 设置当前鱼节点到动态数据
            DH_DataManager.Instance.dynamicData.isFishHooking = true;
            EventManager.Scene.emit(DH_GameEvents.FishHooking);
            
            // DH_DataManager.Instance.dynamicData.currentFishId = fishId;
        });
    }


    /**
     * 开启自动钓鱼模式
     */
    startAutoFishing() {
        DH_DataManager.Instance.dynamicData.isAutoFishing = true;
        console.log('Auto fishing started');
        // 可以在这里添加自动钓鱼的初始逻辑
    }

    /**
     * 关闭自动钓鱼模式
     */
    stopAutoFishing() {
        DH_DataManager.Instance.dynamicData.isAutoFishing = false;
        console.log('Auto fishing stopped');
    }

    /**
     * 每帧更新逻辑
     * Cocos Creator生命周期函数
     * @param deltaTime 帧间隔时间(秒)
     */
    update(deltaTime: number) {
        // 处理自动排序逻辑
        this.handleAutoSorting();
        
        // 更新概率倒计时
        this.updateProbabilityCountdown(deltaTime);
        
        // 处理鱼线长度计算
        this.calculateFishingLineLength();
        
        // 处理随机上鱼逻辑
        this.handleRandomFishBite(deltaTime);
    }

    /**
     * 处理自动排序逻辑
     * 确保钓友节点按正确顺序显示
     */
    private handleAutoSorting() {
        // 根据Y轴位置调整节点层级，实现2D深度排序
        DH_DataManager.Instance.dynamicData.currentAnglerNodes.forEach((node, index) => {
            node.setSiblingIndex(index);
            // 可以根据Y坐标进一步调整排序
            // node.zIndex = Math.floor(node.position.y * -100);
        });
    }

    /**
     * 更新概率倒计时
     * @param deltaTime 帧间隔时间(秒)
     */
    private updateProbabilityCountdown(deltaTime: number) {
        // 类型1: 倒计时5分钟(300秒)
        if (DH_DataManager.Instance.dynamicData.probabilityType === 1) {
            if (this.probabilityCountdown === 0) {
                this.probabilityCountdown = 300; // 初始化5分钟倒计时
            }
            
            this.probabilityCountdown -= deltaTime;
            if (this.probabilityCountdown <= 0) {
                // 倒计时结束，重置概率类型
                DH_DataManager.Instance.dynamicData.probabilityType = 0;
                DH_DataManager.Instance.dynamicData.currentBigFishProbability -= 20;
                this.probabilityCountdown = 0;
            }
        }
    }

    /**
     * 计算鱼线长度
     */
    private calculateFishingLineLength() {
        // 如果不在钓鱼中，不计算鱼线长度
        if (!DH_DataManager.Instance.dynamicData.isFishingLineOpen ||!DH_DataManager.Instance.dynamicData.lengthStartPointNode || !DH_DataManager.Instance.dynamicData.currentLineEndNode) {
            return;
        }
       
        const lineLength = Math.abs(DH_DataManager.Instance.dynamicData.lengthStartPointNode.worldPosition.x - 
            DH_DataManager.Instance.dynamicData.currentLineEndNode.worldPosition.x
        )/200;
         //保留1位小数
        DH_DataManager.Instance.setLneLength(Math.floor(lineLength * 10) / 10);
        
    }

    /**
     * 处理随机上鱼逻辑
     * @param deltaTime 帧间隔时间(秒)
     */
    private  fishBiteTimer = 0;
    private handleRandomFishBite(deltaTime: number) {
        if(DH_DataManager.Instance.dynamicData.isStopInteract)return;
        // 如果正在钓鱼且鱼未上钩，随机时间上鱼
        if (DH_DataManager.Instance.dynamicData.isFishing && 
            !DH_DataManager.Instance.dynamicData.isFishHooking) {
            
            // 简单的随机上鱼逻辑: 5-10秒内随机上鱼
            const randomTime = Math.random() * 4 + 3; // 5-10秒
            
            
            this.fishBiteTimer += deltaTime;
            if (this.fishBiteTimer >= randomTime) {
                this.fishBiteTimer = 0;
                // 触发上鱼逻辑
                DH_DataManager.Instance.setFishId();
                const a = {
                    "地图_0":[2,3],
                    "地图_1":[3,4],
                    "地图_2":[4,5],
                    "地图_3":[5,6],
                    "地图_4":[6,7],
                    "地图_5":[7,8],
                }
                let mapId = DH_DataManager.Instance.dynamicData.currentMapId;
                let fishIds = a[mapId];
                let fishLevel = DH_DataManager.Instance.dynamicData.currentFishId.split("_")[1];
                // 假设相机组件有followTarget方法
                const cameraComponent = this.gameCamera.getComponent(DH_Camera);
                if (cameraComponent && fishIds.includes(Number(fishLevel))) {
                    cameraComponent.shake();
                    DH_AudioManager.getInstance().playMusic("big");
                }

                // // 这里可以添加具体的上鱼逻辑，例如随机选择鱼的种类
                // const randomFishId = this.getRandomFishId();
                // if (randomFishId) {
                this.createFish(DH_DataManager.Instance.dynamicData.currentFishId);
                // }
            }
        }
    }

    // /**
    //  * 获取随机鱼的ID
    //  * @returns 随机鱼ID
    //  */
    // private getRandomFishId(): string {
    //     // 获取当前地图的出鱼概率配置
    //     const currentMapId = ''; // 实际项目中需要获取当前地图ID
    //     const mapData = DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Map}_${currentMapId}`);
    //     if (!mapData || !mapData.地图出鱼概率配置) {
    //         return '';
    //     }

    //     // 根据概率随机选择鱼ID(简化实现)
    //     const fishIds = Object.keys(mapData.地图出鱼概率配置);
    //     if (fishIds.length === 0) {
    //         return '';
    //     }

    //     // 简单随机选择第一个鱼ID，实际项目中应根据概率权重选择
    //     return fishIds[Math.floor(Math.random() * fishIds.length)];
    // }


    soleFish(){
        this.fishPlaceConter.children.forEach((fish)=>{
            fish.destroy();
        })
    }



    /**
     * 销毁被送出的鱼
     */
    destoryStoleFishs(){
        DH_DataManager.Instance.dynamicData.currentSellFishs.forEach((fishId)=>{
            let fishNode = this.fishPlaceConter.children.find((node)=>node.name === fishId);
            if(fishNode){
                fishNode.destroy();
            }
        })
        DH_DataManager.Instance.dynamicData.currentSellFishs = [];
    }
    addListener(){
        EventManager.on(DH_GameEvents.Update_Anglers, this.updateAnglerNodes, this);
        EventManager.on(DH_GameEvents.Sole_Fish, this.soleFish, this);
        EventManager.on(DH_GameEvents.Destory_Fish_Stole, this.destoryStoleFishs, this);

    }

    removeListener(){
        EventManager.off(DH_GameEvents.Update_Anglers, this.updateAnglerNodes, this);
        EventManager.off(DH_GameEvents.Sole_Fish, this.soleFish, this);
        EventManager.off(DH_GameEvents.Destory_Fish_Stole, this.soleFish, this);
    }
    /**
     * 组件销毁时的清理方法
     * Cocos Creator生命周期函数
     * 
     * 
     */
    onDestroy() {
        this.removeListener();

    }
}