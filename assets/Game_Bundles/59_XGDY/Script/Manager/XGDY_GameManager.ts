// 导入Cocos Creator核心模块
import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, Layout, v3, PhysicsSystem2D, EPhysics2DDrawFlags } from 'cc';
// 导入其他管理器
import { XGDY_DataManager, XGDY_HomeType, XGDY_LevelJsonData, XGDY_SpecialItem, XGDY_SpecialMapId } from './XGDY_DataManager';
import { XGDY_LoadManager } from './XGDY_LoadManager';
import { XGDY_ItemType } from './XGDY_DataManager';
import { XGDY_Map } from '../Game/XGDY_Map';
import { XGDY_BaseEntity } from '../Game/XGDY_BaseEntity';
import { XGDY_Camera } from '../Game/XGDY_Camera';
import { XGDY_Fish } from '../Game/XGDY_Fish';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_AudioManager } from './XGDY_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XGDY_Constant } from '../Common/XGDY_Constant';

// 获取装饰器
const { ccclass, property } = _decorator;

/**
 * 交互类型枚举
 * 定义游戏中可能的交互对象类型
 */
export enum XGDY_InteractionType {
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
@ccclass('XGDY_GameManager')
export class XGDY_GameManager extends Component {
    public static Instance: XGDY_GameManager;  // 单例实例，全局访问点

    @property(Node)
    private fishPlaceConter: Node = null;  // 地图容器节点，用于挂载地图预制体

    @property(Node)
    private mapContainer: Node = null;  // 地图容器节点，用于挂载地图预制体

    @property(Node)
    private anglerContainer: Node = null;  // 钓友容器节点，用于挂载钓友角色节点

    @property(Node)
    private fishContainer: Node = null;  // 鱼容器节点，用于挂载鱼节点

    
    @property(Node)
    private aiContainer: Node = null;  // 鱼容器节点，用于挂载鱼节点

    @property(Node)
    private bleedNodeContainer: Node = null;  // 鱼流血节点容器

    @property(Node)
    private gameCamera: Node = null;  // 主相机节点，用于控制镜头跟随

    private probabilityCountdown: number = 0;  // 概率倒计时(秒)
    private probabilityPassTime: number = 0;  // 概率生效时间(秒)

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
        XGDY_GameManager.Instance = this;

        this.addListener(); 
        XGDY_DataManager.Instance.dynamicData.isInGame = false;
        XGDY_DataManager.Instance.dynamicData.isFirstEnterHome = true;
        EventManager.Scene.emit(XGDY_GameEvents.UI_INIT_UI);
        //如果是广场主界面，就加载广场地图
        // if(XGDY_DataManager.Instance.saveData.homeType == XGDY_HomeType.广场){
        //     // XGDY_DataManager.Instance.dynamicData.currentMapId = "地图_home";
        //     // this.loadMap();
            
        // }
        //如果是广场主界面，就加载广场地图
        if(XGDY_DataManager.Instance.saveData.homeType == XGDY_HomeType.广场){
            // XGDY_DataManager.Instance.dynamicData.currentMapId = "地图_home";
            // this.loadMap();
            XGDY_DataManager.Instance.dynamicData.isEnterHomeEnd = true;
            EventManager.Scene.emit(XGDY_GameEvents.Enter_Home_End);
        }
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

    enterHomeMap(){
        //初始时常驻黑屏
        //显示loadingPanel2
        //隐藏游戏UI
        //摧毁地图
        //加载home地图
        //创建玩家
        //隐藏loadingPanel2
        
    }

    enterGame(){ 
        XGDY_DataManager.Instance.dynamicData.isInGame = true;        
        // 初始化游戏状态
        this.initGameState();
        this.loadMap();
        XGDY_AudioManager.getInstance().playMusic("bgm");
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_GAMEUI);
        EventManager.Scene.emit(XGDY_GameEvents.UI_Show_UIItem_Fishing);
        ProjectEventManager.emit(ProjectEvent.游戏开始, "修勾钓鱼")
    }

    exitGame(){
        XGDY_DataManager.Instance.dynamicData.isInGame = false;
        EventManager.on(XGDY_GameEvents.Loading_Show_Completed,this.clearGame,this);
        EventManager.Scene.emit(XGDY_GameEvents.UI_INIT_UI);
    }

    clearGame(){
        EventManager.off(XGDY_GameEvents.Loading_Show_Completed,this.clearGame,this);
        

        this.initGameState();

        this.gameCamera.getComponent(XGDY_Camera).setOrignPos();

        XGDY_DataManager.Instance.dynamicData.isGameStart = false;
        XGDY_DataManager.Instance.clearMapData();  

        //如果是广场主界面，就加载广场地图
        if(XGDY_DataManager.Instance.saveData.homeType == XGDY_HomeType.广场){
            // XGDY_DataManager.Instance.dynamicData.currentMapId = "地图_home";
            // this.loadMap();
            XGDY_DataManager.Instance.dynamicData.isEnterHomeEnd = true;
            EventManager.Scene.emit(XGDY_GameEvents.Enter_Home_End);
        }

        // 清理鱼
        EventManager.Scene.emit(XGDY_GameEvents.Sole_Fish);
        XGDY_AudioManager.getInstance().playMusic("bgm");

        //清除特殊地图数据
        XGDY_DataManager.Instance.dynamicData.remainingTime = 0;
        XGDY_DataManager.Instance.dynamicData.mapPassTime = 0;

        //清除黑坑数据
        XGDY_DataManager.Instance.dynamicData.isMapCanFishing = false;
        XGDY_DataManager.Instance.dynamicData.isMap101Challengeing = false;
        //清除庆典数据
        XGDY_DataManager.Instance.dynamicData.isMap102Challengeing = false;

        //清除钓鱼大赛数据
        XGDY_DataManager.Instance.dynamicData.currentDialogId = "0";
        //预赛
        XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_1_Challengeing = false;
        XGDY_DataManager.Instance.dynamicData.Map103_challenge_1_Count = 0;
        XGDY_DataManager.Instance.dynamicData.Map103_Challenge_1_TargetFishCount = 0;
        //十强赛
        XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_2_Challengeing = false;

        //决赛
        this.aiContainer.removeAllChildren();
        if(XGDY_DataManager.Instance.dynamicData.aiNode){
            XGDY_DataManager.Instance.dynamicData.aiNode.destroy();
        }
        XGDY_DataManager.Instance.dynamicData.aiNode = null;
        XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_3_Challengeing = false;
        ProjectEventManager.emit(ProjectEvent.游戏结束, "修勾钓鱼")

    }

    /**
     * 加载指定地图
     * @param mapId 要加载的地图ID
     */
    loadMap() {
        // 从加载管理器获取地图预制体
        XGDY_LoadManager.Instance.getMapPrefabById(XGDY_DataManager.Instance.dynamicData.currentMapId, (prefab: Prefab) => {
            if (!prefab) {
                console.error(`Failed to load map prefab with id: ${XGDY_DataManager.Instance.dynamicData.currentMapId}`);
                return;
            }

            // 实例化地图预制体并添加到容器
            const mapNode = instantiate(prefab);
            mapNode.setParent(this.mapContainer);
            mapNode.setPosition(Vec3.ZERO);
            
            // 初始化地图(假设地图节点上有Map组件)
            const mapComponent = mapNode.getComponent(XGDY_Map);
            if (mapComponent) {
                mapComponent.init();
            }

            // XGDY_DataManager.Instance.dynamicData.npcDefaultDialogue.forEach((npcNode)=>{
            //     let worldPos = npcNode.worldPosition;
            //     npcNode.setParent(this.anglerContainer);
            //     npcNode.setWorldPosition(worldPos);
            // })

            XGDY_DataManager.Instance.dynamicData.currentNpcNodes.forEach((npcNode)=>{
                let worldPos = npcNode.worldPosition;
                npcNode.setParent(this.anglerContainer);
                npcNode.setWorldPosition(worldPos);
            })

            if(XGDY_DataManager.Instance.dynamicData.aiNode){
                console.log("aiNode",XGDY_DataManager.Instance.dynamicData.aiNode);
                let worldPos = XGDY_DataManager.Instance.dynamicData.aiNode.worldPosition.clone();
                XGDY_DataManager.Instance.dynamicData.aiNode.setParent(this.aiContainer);
                XGDY_DataManager.Instance.dynamicData.aiNode.setWorldPosition(worldPos);
            }

            XGDY_DataManager.Instance.dynamicData.currentAnglerNodes = [];
            // 更新钓友位置
            this.updateAnglerNodes();

            
            // 开启相机跟随
            // this.startCameraFollow();
            XGDY_DataManager.Instance.dynamicData.isGameStart = true;
        });
    }

    /**
     * 更新钓友节点
     * 根据当前出战钓友列表创建或更新钓友角色节点
     */
    updateAnglerNodes() {
        if(!XGDY_DataManager.Instance.dynamicData.isInGame) {
            return;
        }
        // 暂停相机跟随
        this.stopCameraFollow();
        
        // 获取当前出战钓友ID列表
        const currentAnglerIds = XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds;
        let spawnPoint = XGDY_DataManager.Instance.dynamicData.spawnPoint;
        if (XGDY_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
            // 如果没有出战钓友，将位置设置到出生点
            spawnPoint = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0].worldPosition;
        }

        // if (spawnPoint && XGDY_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
        //     XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0].setPosition(spawnPoint);
        // }

        // 销毁现有钓友节点
        this.anglerContainer.children.forEach((child) => {
            if(child.name.split("_")[0] == "钓友") {
                child.destroy();
            }
        })
        XGDY_DataManager.Instance.dynamicData.currentAnglerNodes = [];
        //重置击杀点
        XGDY_DataManager.Instance.dynamicData.killLinePoints = {};

        // let anglerPrefabs = [];
        let playerNodeOutters :Node[]= [];

        // // 创建布局节点用于排列钓友
        // const layoutNode = new Node('AnglerLayout');
        // layoutNode.setParent(this.anglerContainer);
        
        // 遍历出战钓友ID，创建对应的角色节点
        currentAnglerIds.forEach((anglerId, index) => {
            XGDY_LoadManager.Instance.getAnglerPrefabById(anglerId, (prefab: Prefab) => {
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
                            const spawnPoint = XGDY_DataManager.Instance.dynamicData.spawnPoint;
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

                        const baseEntity = playerNode.getComponent(XGDY_BaseEntity);
                        if (baseEntity) {
                            baseEntity.init(currentAnglerIds[idx]);
                        }
                        playerNodes.push(playerNode);
                        playerNodeOutter.destroy();
                    })

                    playerNode.setWorldPosition(spawnPoint);




                    XGDY_DataManager.Instance.dynamicData.currentAnglerNodes = playerNodes;
                     // 假设相机组件有followTarget方法
                    const cameraComponent = this.gameCamera.getComponent(XGDY_Camera);
                    if (cameraComponent && XGDY_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
                        cameraComponent.setCameraPosition(XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0].worldPosition.clone());
                    }
                    // 重新开启相机跟随
                    this.startCameraFollow();

                    XGDY_DataManager.Instance.dynamicData.isEnterGameEnd = true;
                    EventManager.Scene.emit(XGDY_GameEvents.Enter_Map_End);


                    // XGDY_DataManager.Instance.dynamicData.isEnterHomeEnd = true;
                    // EventManager.Scene.emit(XGDY_GameEvents.Enter_Home_End);
                }

                // // 添加到动态数据中的钓友节点数组
                // XGDY_DataManager.Instance.dynamicData.currentAnglerNodes.push(anglerNode);

                // // 如果是第一个钓友，设置到初始位置
                // if (index === 0) {
                //     const spawnPoint = XGDY_DataManager.Instance.dynamicData.spawnPoint;
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
    //     const spawnPoint = XGDY_DataManager.Instance.dynamicData.spawnPoint;
    //     if (spawnPoint && XGDY_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
    //         XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0].setPosition(spawnPoint);
    //     }
    // }

    /**
     * 开始相机跟随
     * 跟随第一个出战钓友
     */
    private startCameraFollow() {
        // 假设相机组件有followTarget方法
        const cameraComponent = this.gameCamera.getComponent(XGDY_Camera);
        if (cameraComponent && XGDY_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
            cameraComponent.setFollowTarget(XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0]);
        }
    }

    /**
     * 停止相机跟随
     */
    private stopCameraFollow() {
        const cameraComponent = this.gameCamera.getComponent(XGDY_Camera);
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
            if (!XGDY_DataManager.Instance.dynamicData.isUsingCouragePower) {
                console.log('Fishing method is disabled, cannot cast skill');
                return;
            } else {
                // 消耗勇气之力
                XGDY_DataManager.Instance.dynamicData.isUsingCouragePower = false;
            }
        }

        // 应用龙形锦鲤的伤害加成
        let damageMultiplier = 1;
        if (XGDY_DataManager.Instance.dynamicData.isUsingDragonKoi) {
            damageMultiplier = 1.05; // 5%伤害加成
            // 保存加成状态
            XGDY_DataManager.Instance.saveToStorage();
        }

        // 检查是否所有钓友可施展同一技能
        if (XGDY_DataManager.Instance.dynamicData.canCastSameSkill) {
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
        const mapData = XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Map}_${currentMapId}`);
        return mapData?.isFishingMethodDisabled || false;
    }

    /**
     * 所有钓友施展技能
     * @param skillId 技能ID
     * @param damageMultiplier 伤害乘数
     */
    private castSkillForAllAnglers(skillId: string, damageMultiplier: number) {
        XGDY_DataManager.Instance.dynamicData.currentAnglerNodes.forEach(anglerNode => {
            this.executeSkill(anglerNode, skillId, damageMultiplier);
        });
    }

    /**
     * 当前钓友施展技能
     * @param skillId 技能ID
     * @param damageMultiplier 伤害乘数
     */
    private castSkillForCurrentAngler(skillId: string, damageMultiplier: number) {
        if (XGDY_DataManager.Instance.dynamicData.currentAnglerNodes.length > 0) {
            const currentAngler = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0];
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
        const skillData = XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Skill}_${skillId}`);
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
        const skillLevel = XGDY_DataManager.Instance.saveData.skillData[skillId] || 1;
        const baseDamage = skillData.等级配置[skillLevel]?.总伤 || 0;
        const finalDamage = baseDamage * damageMultiplier;

        // 记录技能总伤害
        XGDY_DataManager.Instance.saveData.gameData.skillTotalDamage[skillId] = 
            (XGDY_DataManager.Instance.saveData.gameData.skillTotalDamage[skillId] || 0) + finalDamage;
        
        // 保存数据
        XGDY_DataManager.Instance.saveToStorage();
    }

    /**
     * 创建鱼节点
     * @param fishId 鱼的ID
     */
    createFish(fishId: string) {
        XGDY_LoadManager.Instance.getFishPrefabById(fishId, (prefab: Prefab) => {
            if (!prefab) {
                console.error(`Failed to load fish prefab with id: ${fishId}`);
                return;
            }

            if(!XGDY_DataManager.Instance.saveData.unlockFishes.includes(fishId)){
                // if(XGDY_DataManager.Instance.dynamicData.currentMapId !== XGDY_SpecialMapId.庆典 && XGDY_DataManager.Instance.dynamicData.currentMapId !== XGDY_SpecialMapId.黑坑){
                    XGDY_DataManager.Instance.saveData.unlockFishes.push(fishId);
                    XGDY_DataManager.Instance.saveToStorage();
                // }
            }

            // 实例化鱼节点
            const fishNode = instantiate(prefab);
            fishNode.setParent(this.fishContainer);
            fishNode.setWorldPosition(XGDY_DataManager.Instance.dynamicData.hookPoint.worldPosition.clone());
            
            // 初始化鱼(假设鱼节点上有FishComponent组件)
            const fishComponent = fishNode.getComponent(XGDY_Fish);
            if (fishComponent) {
                fishComponent.init(fishId,this.fishPlaceConter,this.bleedNodeContainer);
            }

            // 设置当前鱼节点到动态数据
            XGDY_DataManager.Instance.dynamicData.isFishHooking = true;
            EventManager.Scene.emit(XGDY_GameEvents.FishHooking);
            
            // XGDY_DataManager.Instance.dynamicData.currentFishId = fishId;
        });
    }


    /**
     * 开启自动钓鱼模式
     */
    startAutoFishing() {
        XGDY_DataManager.Instance.dynamicData.isAutoFishing = true;
        console.log('Auto fishing started');
        // 可以在这里添加自动钓鱼的初始逻辑
    }

    /**
     * 关闭自动钓鱼模式
     */
    stopAutoFishing() {
        XGDY_DataManager.Instance.dynamicData.isAutoFishing = false;
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

        // 更新地图倒计时
        this.updateMapCountdown(deltaTime);
        
        // 更新概率倒计时
        this.updateProbabilityCountdown(deltaTime);
        
        // 处理鱼线长度计算
        this.calculateFishingLineLength();
        
        // 处理随机上鱼逻辑
        this.handleRandomFishBite(deltaTime);

        //处理鱼池收益
        this.updatePoolMoney(deltaTime);
    }


    updatePoolMoney(dt){
        const currentTime = Date.now();
        if(!XGDY_DataManager.Instance.saveData.lastGetIncomeTime){
            XGDY_DataManager.Instance.saveData.lastGetIncomeTime = currentTime;
            return;
        }
        const lastGetIncomeTime = XGDY_DataManager.Instance.saveData.lastGetIncomeTime;
        //当两次时间间隔大于等于1分钟时
        if(currentTime - lastGetIncomeTime >= 60000){
            //获取两次时间间隔的分钟数
            const intervalMinutes = Math.floor((currentTime - lastGetIncomeTime) / 60000);
            //每分钟收益
            let perMinuteAddMoney = 0;
            Object.keys(XGDY_DataManager.Instance.saveData.poolFishes).forEach((fishId)=>{
                const fishCount = XGDY_DataManager.Instance.saveData.poolFishes[fishId];
                let fishLevel = Number(fishId.split("_")[1]);
                perMinuteAddMoney += XGDY_Constant.fishLevelIncomePerMinute[fishLevel] * fishCount;
            })
            XGDY_DataManager.Instance.saveData.addIncome += perMinuteAddMoney * intervalMinutes;
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Income);
            XGDY_DataManager.Instance.saveData.lastGetIncomeTime = currentTime;
            XGDY_DataManager.Instance.saveToStorage();
        }

    }

    /**
     * 处理自动排序逻辑
     * 确保钓友节点按正确顺序显示
     */
    private handleAutoSorting() {
        // 根据Y轴位置调整节点层级，实现2D深度排序
        XGDY_DataManager.Instance.dynamicData.currentAnglerNodes.forEach((node, index) => {
            node.setSiblingIndex(index);
        });
    }

    /**
     * 更新地图倒计时
     * @param deltaTime 帧间隔时间(秒)
     */
    private updateMapCountdown(deltaTime: number) {

         switch (XGDY_DataManager.Instance.dynamicData.currentMapId) {
                case XGDY_SpecialMapId.黑坑:
                    this.handleMap101Countdown(deltaTime);
                    break;
                case XGDY_SpecialMapId.庆典:
                    this.handleMap102Countdown(deltaTime);
                    break;
                case XGDY_SpecialMapId.钓鱼大赛:
                    this.handleMap103Countdown(deltaTime);
                    break;
                default:
                    break;
            }

    }


    /**
     * 处理地图倒计时
     * @param deltaTime 帧间隔时间(秒)
     */
    private handleMap101Countdown(deltaTime: number) {
        if(!XGDY_DataManager.Instance.dynamicData.isMapCanFishing){
            return;
        }
        if(!XGDY_DataManager.Instance.dynamicData.isMap101Challengeing){
            return;
        }

        XGDY_DataManager.Instance.dynamicData.mapPassTime+=deltaTime;   

        if(XGDY_DataManager.Instance.dynamicData.mapPassTime >= 1){
            XGDY_DataManager.Instance.dynamicData.mapPassTime -= 1;
            EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Update_Label);
        }

        // 减少倒计时
        XGDY_DataManager.Instance.dynamicData.remainingTime -= deltaTime;
        //每减少1s，关闭npc
        if (XGDY_DataManager.Instance.dynamicData.remainingTime <= 0) {
            XGDY_DataManager.Instance.dynamicData.remainingTime = 0;  
            XGDY_DataManager.Instance.dynamicData.mapPassTime = 0;
            //禁止钓鱼
            XGDY_DataManager.Instance.dynamicData.isMapCanFishing = false;
            XGDY_DataManager.Instance.dynamicData.isMap101Challengeing = false;
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"包场时间到！"); 

            EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Init);
            //关闭npc
        }
    }
      /**
     * 处理地图倒计时
     * @param deltaTime 帧间隔时间(秒)
     */
    private handleMap102Countdown(deltaTime: number) {
        if(!XGDY_DataManager.Instance.dynamicData.isMap102Challengeing){
            return;
        }

        XGDY_DataManager.Instance.dynamicData.mapPassTime+=deltaTime;   

        if(XGDY_DataManager.Instance.dynamicData.mapPassTime >= 1){
            XGDY_DataManager.Instance.dynamicData.mapPassTime -= 1;
            EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Update_Label);
        }

        // 减少倒计时
        XGDY_DataManager.Instance.dynamicData.remainingTime -= deltaTime;
        //每减少1s，关闭npc
        if (XGDY_DataManager.Instance.dynamicData.remainingTime <= 0) {
            XGDY_DataManager.Instance.dynamicData.remainingTime = 0;  
            XGDY_DataManager.Instance.dynamicData.mapPassTime = 0;
     
            //重置挑战数据
            XGDY_DataManager.Instance.dynamicData.isMap102Challengeing = false;
            XGDY_DataManager.Instance.dynamicData.challengeWeightCount = 0;
            XGDY_DataManager.Instance.dynamicData.isMap102Challengeing = false;
            //挑战失败
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"时间到，挑战失败！"); 
         
            EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Init);
            //关闭npc
        }
    }
      /**
     * 处理地图倒计时
     * @param deltaTime 帧间隔时间(秒)
     */
    private handleMap103Countdown(deltaTime: number) {
        if(!XGDY_DataManager.Instance.dynamicData.isMapCanFishing || !XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_1_Challengeing){
            return;
        }

        XGDY_DataManager.Instance.dynamicData.mapPassTime+=deltaTime;   

        if(XGDY_DataManager.Instance.dynamicData.mapPassTime >= 1){
            XGDY_DataManager.Instance.dynamicData.mapPassTime -= 1;
            EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Update_Label);
        }

        // 减少倒计时
        XGDY_DataManager.Instance.dynamicData.remainingTime -= deltaTime;
        //每减少1s，关闭npc
        if (XGDY_DataManager.Instance.dynamicData.remainingTime <= 0) {
            XGDY_DataManager.Instance.dynamicData.remainingTime = 0;  
            XGDY_DataManager.Instance.dynamicData.mapPassTime = 0;
          
            //重置挑战数据
            XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_1_Challengeing = false;
            XGDY_DataManager.Instance.dynamicData.Map103_challenge_1_Count = 0;
            XGDY_DataManager.Instance.dynamicData.isMapCanFishing = false;
            //挑战失败
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"时间到，挑战失败！"); 
            //更新挑战对话
            EventManager.Scene.emit(XGDY_GameEvents.SpecialNpc_MAP103_Challenge_1_Init_String);
            let dialogId = XGDY_DataManager.Instance.saveData.currentCompetitionLevel-1;
            XGDY_DataManager.Instance.dynamicData.currentDialogId = dialogId.toString();
            //关闭npc
        }
    }

    
    /**
     * 更新概率倒计时
     * @param deltaTime 帧间隔时间(秒)
     */
    
    private updateProbabilityCountdown(deltaTime: number) {
        // 类型1: 倒计时5分钟(300秒)
        if (XGDY_DataManager.Instance.dynamicData.probabilityType === 1 ||XGDY_DataManager.Instance.dynamicData.isDownCounting) {
            if (this.probabilityCountdown === 0) {
                this.probabilityCountdown = 120; // 初始化1分钟倒计时
                this.probabilityPassTime = 0; // 初始化生效时间
                XGDY_DataManager.Instance.dynamicData.isDownCounting = true;
            }
            

            // 增加生效时间
            this.probabilityCountdown -= deltaTime;
            this.probabilityPassTime += deltaTime;
            if(this.probabilityPassTime >= 1){
                this.probabilityPassTime -= 1;
                EventManager.Scene.emit(XGDY_GameEvents.Update_Special_Item_Tip,{itemName:XGDY_SpecialItem.祖传饵料,remainTime:this.probabilityCountdown});
            }
            

            if (this.probabilityCountdown <= 0) {
                XGDY_DataManager.Instance.dynamicData.isDownCounting = false;
                // 倒计时结束，重置概率类型
                if(XGDY_DataManager.Instance.dynamicData.probabilityType == 1){
                    XGDY_DataManager.Instance.dynamicData.probabilityType = 0;
                }
                
                this.probabilityCountdown = 0;
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Special_Item_Tip,{itemName:XGDY_SpecialItem.祖传饵料});
            }
        }
    }

    /**
     * 计算鱼线长度
     */
    private calculateFishingLineLength() {
        // 如果不在钓鱼中，不计算鱼线长度
        if (!XGDY_DataManager.Instance.dynamicData.isFishingLineOpen ||!XGDY_DataManager.Instance.dynamicData.lengthStartPointNode || !XGDY_DataManager.Instance.dynamicData.currentLineEndNode) {
            return;
        }
       
        const lineLength = Math.abs(XGDY_DataManager.Instance.dynamicData.lengthStartPointNode.worldPosition.x - 
            XGDY_DataManager.Instance.dynamicData.currentLineEndNode.worldPosition.x
        )/200;
         //保留1位小数
        XGDY_DataManager.Instance.setLneLength(Math.floor(lineLength * 10) / 10);
        
    }

    /**
     * 处理随机上鱼逻辑
     * @param deltaTime 帧间隔时间(秒)
     */
    private  fishBiteTimer = 0;
    private handleRandomFishBite(deltaTime: number) {
        if(XGDY_DataManager.Instance.dynamicData.isStopInteract)return;
        // 如果正在钓鱼且鱼未上钩，随机时间上鱼
        if (XGDY_DataManager.Instance.dynamicData.isFishing && 
            !XGDY_DataManager.Instance.dynamicData.isFishHooking) {
            
            // 简单的随机上鱼逻辑: 5-10秒内随机上鱼
            const randomTime = Math.random() * 4 + 3; // 5-10秒
            
            //LTODO
            this.fishBiteTimer += deltaTime;
            if (this.fishBiteTimer >= randomTime) {
                this.fishBiteTimer = 0;
                // 触发上鱼逻辑
                XGDY_DataManager.Instance.setFishId();

                const a = {
                    "地图_0":[2],
                    "地图_1":[2],
                    "地图_2":[3],
                    "地图_3":[3,4],
                    "地图_4":[4,5],
                    "地图_5":[5],
                    "地图_6":[6],
                    "地图_7":[7],
                    "地图_8":[8],
                    "地图_102":[6,7,8],
                    "地图_103":[0],
                }

                if(XGDY_DataManager.Instance.dynamicData.currentMapId == XGDY_SpecialMapId.黑坑){
                    let maxFishLevel = 0;
                    const unlockFishesData = XGDY_DataManager.Instance.saveData.unlockFishes;
                    unlockFishesData.forEach(fishId=>{
                        maxFishLevel = Math.max(maxFishLevel,parseInt(fishId.split("_")[1]));
                    })
                    // //LTODO: 地图鱼配置修改时需要修改
                    // if(maxFishLevel > 0){
                    //     maxFishLevel--;
                    // }
                    a["地图_101"] = [maxFishLevel];
                }

                let mapId = XGDY_DataManager.Instance.dynamicData.currentMapId;
                let fishIds = a[mapId];
                let fishLevel = XGDY_DataManager.Instance.dynamicData.currentFishId.split("_")[1];
                // 假设相机组件有followTarget方法
                const cameraComponent = this.gameCamera.getComponent(XGDY_Camera);
                if (cameraComponent && fishIds.includes(Number(fishLevel))) {
                    cameraComponent.shake();
                    XGDY_AudioManager.getInstance().playMusic("big");
                }

                // // 这里可以添加具体的上鱼逻辑，例如随机选择鱼的种类
                // const randomFishId = this.getRandomFishId();
                // if (randomFishId) {
                this.createFish(XGDY_DataManager.Instance.dynamicData.currentFishId);
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
    //     const mapData = XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Map}_${currentMapId}`);
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
        let deleteedFishes = [];
        XGDY_DataManager.Instance.dynamicData.currentSellFishs.forEach((fishId)=>{
            let isFound = false;
            this.fishPlaceConter.children.forEach((node)=>{
                if(!isFound && node.isValid && node.name == fishId && deleteedFishes.indexOf(node) ==-1 ){
                    deleteedFishes.push(node)
                    node.destroy();
                    isFound = true;
                }
            })
        })
        XGDY_DataManager.Instance.dynamicData.currentSellFishs = [];
    }
    addListener(){
        EventManager.on(XGDY_GameEvents.Update_Anglers, this.updateAnglerNodes, this);
        EventManager.on(XGDY_GameEvents.Sole_Fish, this.soleFish, this);
        EventManager.on(XGDY_GameEvents.Destory_Fish_Stole, this.destoryStoleFishs, this);

    }

    removeListener(){
        EventManager.off(XGDY_GameEvents.Update_Anglers, this.updateAnglerNodes, this);
        EventManager.off(XGDY_GameEvents.Sole_Fish, this.soleFish, this);
        EventManager.off(XGDY_GameEvents.Destory_Fish_Stole, this.destoryStoleFishs, this);
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