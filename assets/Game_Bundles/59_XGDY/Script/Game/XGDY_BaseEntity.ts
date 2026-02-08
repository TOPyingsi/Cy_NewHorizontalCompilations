// 导入Cocos Creator核心模块
import { _decorator, Component, Node, Vec3, tween, Quat, sp, Label, instantiate, v3, RigidBody2D, v2, Collider2D, Contact2DType, Texture2D, Animation, UIOpacity, Sprite, Color } from 'cc';
import { XGDY_DataManager, XGDY_SkillJsonData, XGDY_SpecialItem } from '../Manager/XGDY_DataManager';
import { XGDY_GameManager } from '../Manager/XGDY_GameManager';
import { XGDY_FishLine } from './XGDY_FishLine';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_AngleCommonAnimation, XGDY_AnglerSkin, XGDY_AnimationName } from '../Common/XGDY_Animation';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
// 导入数据管理器和游戏管理器


// 获取装饰器
const { ccclass, property } = _decorator;

/**
 * 基础实体组件类
 * 实现钓友和玩家的共同行为，包括移动、抛竿、收竿等核心功能
 */
@ccclass('XGDY_BaseEntity')
export class XGDY_BaseEntity extends Component {
    @property(Node)
    public nameNode: Node = null;   // 鱼饵点节点引用

    @property(XGDY_FishLine)
    public fishLine: XGDY_FishLine = null;  // 鱼线节点引用

    @property(Node)
    public lengthStartPointNode: Node = null;   // 上钩点节点引用

    @property(Node)
    public hookPointNode: Node = null;   // 上钩点节点引用

    @property(Node)
    public lineStartPoint: Node = null;         // 鱼竿节点引用

    @property(Node)
    public baitPointNode: Node = null;   // 鱼饵点节点引用

    @property(Node)
    public shuihuaPointNode: Node = null;   // 鱼饵点节点引用

    @property(Node)
    public fishPlaceNode: Node = null;   

    @property({ type: [Texture2D] })
    FishingRod: Texture2D[] = [];  
    
    @property(Node)
    fallWaterNode: Node= null;  

    @property(Node)
    dangerSignNode: Node= null;  //危险标志

    @property(Node)
    dodgeSignNode: Node= null;  //闪避标志

    @property(Node)
    defenseSignNode:Node = null;  //防御标志

    @property(Node)
    fearSignNode: Node= null;  //闪避标志
    
    

    
    splashEffect:Node = null;
    

    isAddListener:boolean = false;

    spine:sp.Skeleton  = null;
    rigidbody: RigidBody2D | null = null;
    collider:Collider2D|null = null;


    public id: string = "";              // 实体ID
    public isPlayer: boolean = false;    // 是否为玩家控制的实体
    public playerSpeed: number = 0.1;            // 移动速度
    public otherSpeed: number = 0.08;            // 移动速度
    private followDistance: number = 200;        // 跟随距离
    public isTangled: boolean = false;   // 是否切线
    public isCastingSkill: boolean = false;  // 是否正在释放技能

    private isNeedChangeLineEnd:boolean = false;
    private changeTime:number = 0.3;

    // private targetPosition: Vec3 = null;  // 目标移动位置
    // private moveCallback: Function = null;  // 移动完成回调
    private isKill: boolean = false;  // 是否被击杀

    /**
     * 组件加载时的初始化方法
     * Cocos Creator生命周期函数
     */
    onLoad() {

    }

    /**
     * 初始化实体
     * @param anglerId 实体ID
     */
    init(anglerId: string) {
        // 获取Spine动画组件
        this.spine = this.node.getComponent(sp.Skeleton);
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);
        this.splashEffect= this.node.getChildByName("splashEffect");

        // 注册事件监听
        if(!this.isAddListener){
            this.addListener();
        }
        
        this.id = anglerId;
        this.node.name = anglerId;
        this.spine.setSkin(XGDY_AnglerSkin[anglerId]);
        this.Change_Rod();
        this.spine.loop = true;
        this.spine.animation = XGDY_AngleCommonAnimation.待机;
        this.rigidbody.linearVelocity = v2(0,0);

        this.splashEffect.active = false;

        // 判断是否为玩家控制的实体（第一个出战钓友）
        this.isPlayer = XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds[0] === this.id;
        this.otherSpeed = Math.random()*0.03-0.03+0.09;
        this.followDistance = XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(this.id)*50+100;
        //设置线起点
        this.handleSpecialLine();
        this.fishLine.setStartNode(this.lineStartPoint);

        XGDY_DataManager.Instance.dynamicData.killLinePoints[this.id] = this.lineStartPoint;
        
        // 如果是玩家，设置上钩点
        if (this.isPlayer && this.hookPointNode) {
            this.nameNode.getComponent(Label).string = XGDY_DataManager.Instance.saveData.name;
            XGDY_DataManager.Instance.dynamicData.hookPoint = this.hookPointNode;
            XGDY_DataManager.Instance.dynamicData.lengthStartPointNode = this.lengthStartPointNode;
            XGDY_DataManager.Instance.dynamicData.fishPlaceNode = this.fishPlaceNode;

            let skillData = XGDY_DataManager.Instance.getAllSkillData();

            let skillTimeData:{[key:string]:number} = {};
            let skillIds:string[] = [];

            Object.keys(skillData).forEach((key)=>{
                let skillData2 = skillData[key] ;
                Object.keys(skillData2).forEach((key2)=>{
                    let skillData3 = skillData2[key2] as XGDY_SkillJsonData;
                    skillIds.push(skillData3.id);
                })
            })
            
            skillIds.forEach((skillId)=>{
                skillTimeData[skillId] = this.spine.findAnimation(XGDY_AngleCommonAnimation[skillId]).duration;
            })
            
            XGDY_DataManager.Instance.dynamicData.skillTimeData = skillTimeData;
        }

        
        this.nameNode.active = this.isPlayer;
        this.dangerSignNode.active = false;
        this.dodgeSignNode.active = false;
        this.defenseSignNode.active = false;
        this.fearSignNode.active = false;
    }


    handleSpecialLine(){
        if(XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.航母阻拦索] && XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.航母阻拦索]>=1){
            this.fishLine.node.getComponent(Sprite).color = Color.GRAY;
        }
        else{
            this.fishLine.node.getComponent(Sprite).color = Color.WHITE;
        }

    }

    

    /**
     * 移动到钓位
     */
    moveToFishingSpot() {
        // // 获取目标钓位
        // const targetSpot = XGDY_DataManager.Instance.getMainFishingSpot();
        // if (!targetSpot) return;
        let idx = XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(this.id);

        // 移动到目标钓位
        this.moveToPosition(XGDY_DataManager.Instance.dynamicData.currentFishingSpots[idx], () => {
            if(this.spine.animation !==  XGDY_AngleCommonAnimation.待机){
                this.spine.loop = true;
                this.spine.animation = XGDY_AngleCommonAnimation.待机;
            }
            // 通知数据管理器已到达钓位
            XGDY_DataManager.Instance.arrivedAtFishingSpot();
        });
    }

    /**
     * 移动到指定位置
     * @param position 目标位置
     * @param callback 移动完成回调
     */
    moveToPosition(position: Vec3, callback: Function) {

        if(this.spine.animation !==  XGDY_AngleCommonAnimation.走路){
            this.spine.loop = true;
            this.spine.animation = XGDY_AngleCommonAnimation.走路;
        }
        let distance = Vec3.distance(position,this.node.worldPosition);
        tween(this.node)
        .to(distance/(this.playerSpeed*6000),{worldPosition:position})
        .call(()=>{
            callback();
        })
        .start();
    }

    /**
     * 抛竿操作
     */
    castRod() {

        if(this.isPlayer){
            // 设置鱼线起始点和结束点
            XGDY_DataManager.Instance.dynamicData.currentLineEndNode = this.baitPointNode;
            XGDY_DataManager.Instance.dynamicData.isFishingLineOpen = true;
        }

        this.scheduleOnce(()=>{
            this.fishLine.setStartAndEndNode(this.lineStartPoint,this.baitPointNode);
            
        },0.6)
        this.scheduleOnce(()=>{
            XGDY_DataManager.Instance.dynamicData.isStopInteract = false;
        },0.7);
        this.fishLine.startUpdateLine = true;
        let normalX = Math.abs(this.node.scale.x);
        let scaleX = XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft?-Math.abs(normalX):normalX;
        let normalNameX =  Math.abs(this.nameNode.scale.x);
        let scaleNameX = XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft?-Math.abs(normalNameX):normalNameX;
        let normalLineX =  Math.abs(this.fishLine.node.scale.x);
        let scaleLineX = XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft?-Math.abs(normalLineX):normalLineX;
       
        this.node.setScale(v3(scaleX,this.node.scale.y,this.node.scale.z));
        this.nameNode.setScale(v3(scaleNameX,this.nameNode.scale.y,this.nameNode.scale.z))
        this.dangerSignNode.setScale(v3(scaleNameX,this.dangerSignNode.scale.y,this.dangerSignNode.scale.z))
        this.dodgeSignNode.setScale(v3(scaleNameX,this.dodgeSignNode.scale.y,this.dodgeSignNode.scale.z))
        this.defenseSignNode.setScale(v3(scaleNameX,this.defenseSignNode.scale.y,this.defenseSignNode.scale.z))
        this.fishLine.node.setScale(v3(scaleLineX,this.fishLine.node.scale.y,this.fishLine.node.scale.z))
        this.fearSignNode.setScale(v3(scaleNameX,this.fearSignNode.scale.y,this.fearSignNode.scale.z))
        // let idx = XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(this.id);
        // XGDY_DataManager.Instance.dynamicData.fishLines[idx] = this.fishLine.node;
        
        let idx = this.id;
        // 播放抛竿动画（假设使用Spine动画组件）
        if (this.spine) {
            this.spine.loop = false;
            this.spine.animation = XGDY_AngleCommonAnimation.抛竿;
            this.scheduleOnce(()=>{
                if(this.spine.animation ==  XGDY_AngleCommonAnimation.抛竿){
                    this.fishLine.setStartAndEndNode(this.lineStartPoint,this.shuihuaPointNode);
                    if(this.isPlayer){
                        XGDY_DataManager.Instance.dynamicData.currentLineEndNode = this.shuihuaPointNode;
                    }
                    this.spine.loop = true;
                    this.spine.animation = XGDY_AngleCommonAnimation.钓鱼;
                    if(this.isPlayer){
                        XGDY_DataManager.Instance.startFishing();
                    }
                }
            },this.spine.findAnimation(this.spine.animation).duration)

            if(this.isPlayer){
                this.scheduleOnce(()=>{
                    XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.hookPoint;
                    EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,4.5);
                },0.6)
            }
        }
        
    }

    // /**
    //  * 设置鱼线连接点
    //  * @param startNode 起始节点
    //  * @param endNode 结束节点
    //  */
    // setFishingLinePoints(startPos: Vec3, endPos: Vec3) {
    //     if (!this.fishLine) return;

    //     // 计算鱼线长度
    //     const length = Vec3.distance(startPos, endPos);
    //     // 设置鱼线位置（中点）
    //     const midPos = new Vec3();
    //     Vec3.lerp(midPos, startPos, endPos, 0.5);
    //     this.fishLine.worldPosition = midPos;

    //     // 计算鱼线角度
    //     const direction = new Vec3();
    //     Vec3.subtract(direction, endPos, startPos);
    //     const angle = Math.atan2(direction.z, direction.x) * 180 / Math.PI;
    //     this.fishLine.eulerAngles = new Vec3(0, angle, 0);

    //     // 缩放鱼线以匹配长度
    //     this.fishLine.setScale(length / 100, 1, 1); // 假设原始长度为100
    // }

    /**
     * 收竿操作
     */
    reelRod() {
        this.isNeedChangeLineEnd = false;

        if(this.isPlayer){
            XGDY_DataManager.Instance.dynamicData.currentLineEndNode = null;
        }
        this.fishLine.reelLine();


        // 播放收竿动画
        if (this.spine) {
            this.spine.loop = false;
            this.spine.animation = XGDY_AngleCommonAnimation.收竿;
        }
        if(this.isPlayer){
            this.scheduleOnce(()=>{
                XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,4.5);
            },0.1)

            this.scheduleOnce(()=>{
                XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,2);
            },1)
        }

        this.scheduleOnce(()=>{
            XGDY_DataManager.Instance.dynamicData.isFishingLineOpen = false;
            XGDY_DataManager.Instance.setLneLength(0);
            if(this.spine.animation ==  XGDY_AngleCommonAnimation.收竿){
                this.scheduleOnce(()=>{
                    XGDY_DataManager.Instance.dynamicData.isStopInteract = false;
                },0.2)
                XGDY_DataManager.Instance.reelRodEnd();
                this.spine.loop = true;
                this.spine.animation = XGDY_AngleCommonAnimation.待机;
            }
        },this.spine.findAnimation(this.spine.animation).duration)



        // 发送收竿结束事件
        this.node.emit('reel_finished');
    }

    pullRod(){
        let fishType = XGDY_DataManager.Instance.dynamicData.currentFishId.split("_")[1];
        switch(fishType){
            //LTODO  增加鱼
            case "0":
            case "1":
            case "2":
                if(this.spine.animation !==  XGDY_AngleCommonAnimation.钓小鱼){
                    this.spine.loop = true;
                    this.spine.animation = XGDY_AngleCommonAnimation.钓小鱼;
                }
                break;
            case "3":
            case "4":
            case "5":
                if(this.spine.animation !==  XGDY_AngleCommonAnimation.钓大鱼){
                    this.spine.loop = true;
                    this.spine.animation = XGDY_AngleCommonAnimation.钓大鱼;
                }
                break;
            case "6":
            case "7":
            case "8":
            case "102":
                if(this.spine.animation !==  XGDY_AngleCommonAnimation.钓巨物){
                    this.spine.loop = true;
                    this.spine.animation = XGDY_AngleCommonAnimation.钓巨物;
                }
                break;
        }

        let idx = XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(this.id);
        this.fishLine.setStartAndEndNode(this.lineStartPoint,XGDY_DataManager.Instance.dynamicData.fishMouthPoints[idx]);
        if(this.isPlayer){
            XGDY_DataManager.Instance.dynamicData.currentLineEndNode = XGDY_DataManager.Instance.dynamicData.fishMouth;
        }
        if(idx == 1){
            this.isNeedChangeLineEnd = true;
        }
    }

    kill(){
        if(XGDY_DataManager.Instance.dynamicData.killedAnglerIds.includes(this.id)) return;
        this.isNeedChangeLineEnd = false;

        if(this.isPlayer){
            XGDY_DataManager.Instance.dynamicData.currentLineEndNode = null;
        }
        this.fishLine.reelLine();


        // 播放收竿动画
        if (this.spine) {
            this.spine.loop = false;
            this.spine.animation = XGDY_AngleCommonAnimation.切线;
        }
        if(this.isPlayer){
            this.scheduleOnce(()=>{
                XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,4.5);
            },0.1)

            this.scheduleOnce(()=>{
                XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,2);
            },1)
        }

        this.scheduleOnce(()=>{
            XGDY_DataManager.Instance.dynamicData.isFishingLineOpen = false;
            XGDY_DataManager.Instance.setLneLength(0);
            if(this.spine.animation ==  XGDY_AngleCommonAnimation.切线){
                XGDY_DataManager.Instance.reelRodEnd();
                this.scheduleOnce(()=>{
                    XGDY_DataManager.Instance.dynamicData.isStopInteract = false;
                },0.2)
                this.spine.loop = true;
                this.spine.animation = XGDY_AngleCommonAnimation.待机;
            }
        },this.spine.findAnimation(this.spine.animation).duration)



        // 发送收竿结束事件
        this.node.emit('reel_finished');
    }

    reelIn(){
        //被切线的不反应
        if(XGDY_DataManager.Instance.dynamicData.killedAnglerIds.includes(this.id)) return;
        this.isNeedChangeLineEnd = false;
        if(this.spine.animation !==  XGDY_AngleCommonAnimation.钓起){
            this.spine.loop = true;
            this.spine.animation = XGDY_AngleCommonAnimation.钓起;
        }

        if(this.isPlayer){
            this.scheduleOnce(()=>{
                XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,4.5);
            },0.1)

            this.scheduleOnce(()=>{
                XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,2);
            },1)
        }


        this.scheduleOnce(()=>{
            XGDY_DataManager.Instance.dynamicData.isFishingLineOpen = false;
            XGDY_DataManager.Instance.setLneLength(0);
            if(this.spine.animation ==  XGDY_AngleCommonAnimation.钓起){
                XGDY_DataManager.Instance.reelRodEnd();
                this.scheduleOnce(()=>{
                    XGDY_DataManager.Instance.dynamicData.isStopInteract = false;
                },0.2)

                this.spine.loop = true;
                this.spine.animation = XGDY_AngleCommonAnimation.待机;
                if(this.isPlayer){
                    XGDY_DataManager.Instance.dynamicData.currentLineEndNode = null;
                }
            }
        },this.spine.findAnimation(this.spine.animation).duration)
    }

    clearLine(){
        XGDY_DataManager.Instance.dynamicData.isFishingLineOpen = false;
        this.fishLine.reelLine();
    }
 

    /**
     * 碰撞检测处理
     * @param other 碰撞到的节点
     */
    onCollisionEnter(selfcollider: Collider2D, other: Collider2D) {
      
        if(!this.isPlayer)return;
        // 检测是否碰撞到水池
        if (other.node.name.split("_")[0] == 'water') {
            if(this.isPlayer && ! XGDY_DataManager.Instance.dynamicData.isFallingIntoWater){
                this.handleFallingIntoWater();
            }
        }
        // 检测是否碰撞到NPC
        else if (other.node.name.split("_")[0] ==  'NPC') {
            this.handleNpcInteraction(other.node);
        }
        // 检测是否碰撞到拖拉机
        else if (other.node.name.split("_")[0] == 'tractor') {
            this.handleTractorInteraction(other.node);
        }
    }

    onCollisionExit(selfcollider: Collider2D, other: Collider2D){
        if(!this.isPlayer)return;

       // 检测是否碰撞到水池
        if (other.node.name.split("_")[0] == 'water') {
            if(this.isPlayer && ! XGDY_DataManager.Instance.dynamicData.isFallingIntoWater){
                this.handleFallingIntoWaterEnd();
            }
        }
        // 检测是否碰撞到NPC
        else if (other.node.name.split("_")[0] ==  'NPC') {
            this.handleNpcInteractionEnd();
        }
        // 检测是否碰撞到拖拉机
        else if (other.node.name.split("_")[0] == 'tractor') {
            this.handleTractorInteractionEnd();
        }
    }

    /**
     * 处理落水逻辑
     */
    handleFallingIntoWater() {
        XGDY_DataManager.Instance.dynamicData.isFallingIntoWater = true;
        this.rigidbody.linearVelocity = v2(0,0);
          if(XGDY_DataManager.Instance.dynamicData.isStopInteract){
            XGDY_DataManager.Instance.dynamicData.isFallingIntoWater = false;
            return;
          }
        // 触发水花效果（假设存在水花节点）
        const splashEffect = this.splashEffect;
        if (splashEffect) {
            let sp = instantiate(splashEffect);
            let worldPosition = this.fallWaterNode.worldPosition;
            sp.parent = this.node.parent;
            sp.setWorldPosition(worldPosition);
            sp.active = true;
              sp.setScale(v3(1,1,1));
            sp.getChildByName("sp").getComponent(Animation).play();
            // 2秒后隐藏水花效果
            setTimeout(() => {
                if (sp) sp.active = false;
            }, 400);
        }

        this.node.setWorldPosition(v3(this.node.worldPosition.x,this.node.worldPosition.y-100,this.node.worldPosition.z))

        // 神隐2次后返回出生点
        let vanishCount = 0;
        const vanishInterval = setInterval(() => {
            this.node.active = !this.node.active; // 切换显隐状态实现闪烁效果
            if(vanishCount == 1){
                // this.node.setWorldPosition(v3(this.node.worldPosition.x,this.node.worldPosition.y+5,this.node.worldPosition.z))
            }
            vanishCount++;
            
            if (vanishCount >= 4) { // 2次闪烁（4次切换）
     
                clearInterval(vanishInterval);
                this.node.active = true;
                // 返回出生点
                if (XGDY_DataManager.Instance.dynamicData.spawnPoint) {
                    this.node.worldPosition = XGDY_DataManager.Instance.dynamicData.spawnPoint;
                    XGDY_DataManager.Instance.dynamicData.isFallingIntoWater = false;
                }
            }
        }, 100);
    }

    handleFallingIntoWaterEnd(){

    }

    /**
     * 处理NPC交互
     * @param npcNode NPC节点
     */
    handleNpcInteraction(npcNode: Node) {
        // 设置交互对象
        XGDY_DataManager.Instance.dynamicData.interactionTarget = npcNode;
        XGDY_DataManager.Instance.dynamicData.currentNpcId = npcNode.name;
        EventManager.Scene.emit(XGDY_GameEvents.UI_Show_Btn_Interact);
    }

    handleNpcInteractionEnd(){
        XGDY_DataManager.Instance.dynamicData.interactionTarget = null;
        XGDY_DataManager.Instance.dynamicData.currentNpcId = "";
        EventManager.Scene.emit(XGDY_GameEvents.UI_Hide_Btn_Interact);
    }

    /**
     * 处理拖拉机交互（回家提示）
     */
    handleTractorInteraction(npcNode: Node) {
        // 设置交互对象
        XGDY_DataManager.Instance.dynamicData.interactionTarget = npcNode;
        EventManager.Scene.emit(XGDY_GameEvents.UI_Show_Btn_Interact);
        // 触发回家提示
    }

    handleTractorInteractionEnd(){
        XGDY_DataManager.Instance.dynamicData.interactionTarget = null;
        XGDY_DataManager.Instance.dynamicData.currentNpcId = "";
        EventManager.Scene.emit(XGDY_GameEvents.UI_Hide_Btn_Interact);
    }



    /**
     * 每帧更新逻辑
     * Cocos Creator生命周期函数
     * @param deltaTime 帧间隔时间（秒）
     */
    update(deltaTime: number) {
        // 非玩家实体跟随玩家
        this.followPlayer(deltaTime);
        
        this.handleChangeLineEnd(deltaTime);
    }

    private changePassTime = 0;
    handleChangeLineEnd(dt){
        if(!this.isNeedChangeLineEnd ||!XGDY_DataManager.Instance.dynamicData.isFishHooking) return;
        this.changePassTime +=dt
        if(this.changePassTime >= this.changeTime){
            this.changeTime = Math.random()*0.1;
            this.changePassTime = 0;
            let randomIdx = Math.floor(Math.random()*XGDY_DataManager.Instance.dynamicData.fishMouthPoints.length)
            this.fishLine.setStartAndEndNode(this.lineStartPoint,XGDY_DataManager.Instance.dynamicData.fishMouthPoints[randomIdx]);
        }
    }

    private forwardDir: number = 1;
    private _dir: Vec3 = v3(0, 0, 0);
    /**
     * 处理摇杆输入
     */
    onMove() {
        if(!this.isPlayer || 
            XGDY_DataManager.Instance.dynamicData.isFallingIntoWater ||
             XGDY_DataManager.Instance.dynamicData.isGoingToFishing||
             XGDY_DataManager.Instance.dynamicData.isFishing){
            return;
        }
        let Dir = XGDY_DataManager.Instance.dynamicData.moveDir
        this._dir = v3(Dir.x, Dir.y, 0);

        if (this._dir.x > 0 && this.node.scale.x < 0) {
            let scale = this.node.scale.y;
            this.node.setScale(scale,scale,this.node.scale.z);
            this.nameNode.setScale(1,1,1);

        }

        if (this._dir.x < 0 &&  this.node.scale.x > 0) {
            let scale = this.node.scale.y
            this.node.setScale(-scale,scale,this.node.scale.z);
            this.nameNode.setScale(-1,1,1);
        }
        if (this.rigidbody.enabled) {
            let newLinearVelocity = v2(this._dir.x * this.playerSpeed, this._dir.y * this.playerSpeed);
            if(this.rigidbody.linearVelocity.x !== newLinearVelocity.x || this.rigidbody.linearVelocity.y !== newLinearVelocity.y ){
                this.rigidbody.linearVelocity = newLinearVelocity.clone();
            }
        }

        if(this.spine.animation !==  XGDY_AngleCommonAnimation.走路){
            this.spine.loop = true;
            this.spine.animation = XGDY_AngleCommonAnimation.走路;
        }
    }

    // preDir: Vec3 = v3(-1, 0, 0);
    onStopMove() {
        if(!this.isPlayer){
            return;
        }
        // this.preDir = this._dir.clone();
        this._dir = v3(0, 0, 0);
        if (this.rigidbody.enabled) {
            this.rigidbody.linearVelocity = v2(this._dir.x, this._dir.y);
        }
        if(this.spine.animation !==  XGDY_AngleCommonAnimation.走路){
            this.spine.loop = true;
            this.spine.animation = XGDY_AngleCommonAnimation.走路;
        }
        if(this.spine.animation !==  XGDY_AngleCommonAnimation.待机){
            this.spine.loop = true;
            this.spine.animation = XGDY_AngleCommonAnimation.待机;
        }
    }


    private followPlayer(deltaTime: number) {
        if(this.isPlayer||
            !XGDY_DataManager.Instance.dynamicData.isGameStart || 
            XGDY_DataManager.Instance.dynamicData.isGoingToFishing ||
            XGDY_DataManager.Instance.dynamicData.isFishing) return;
        // 获取玩家节点
        const playerNode = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0];
        if (!playerNode) return;

        // 计算与玩家的距离
        const distance = Vec3.distance(this.node.worldPosition, playerNode.worldPosition);

        // 方向
        let x = playerNode.worldPosition.x - this.node.worldPosition.x;
        if (x > 0) {
            let scale = this.node.scale.y;
            this.node.setScale(scale,scale,this.node.scale.z);
        }

        if (x < 0) {
            let scale = this.node.scale.y
            this.node.setScale(-scale,scale,this.node.scale.z);
        }

        
        // 如果距离超过200，向玩家移动
        if (distance > this.followDistance) {
            const direction = new Vec3();
            Vec3.subtract(direction, playerNode.worldPosition, this.node.worldPosition);
            direction.normalize();
            
            // 移动
            const moveVec = direction.multiplyScalar(this.otherSpeed*60); // 跟随速度稍慢于玩家
            this.node.worldPosition = this.node.worldPosition.add(moveVec);

            if(this.spine.animation !==  XGDY_AngleCommonAnimation.走路){
                this.spine.loop = true;
                this.spine.animation = XGDY_AngleCommonAnimation.走路;
            }
        }
        else{
            if(XGDY_DataManager.Instance.dynamicData.isMove && distance <195){
                if(this.spine.animation !==  XGDY_AngleCommonAnimation.待机){
                    this.spine.loop = true;
                    this.spine.animation = XGDY_AngleCommonAnimation.待机;
                }
            }
            if(!XGDY_DataManager.Instance.dynamicData.isMove){
                if(this.spine.animation !==  XGDY_AngleCommonAnimation.待机){
                    this.spine.loop = true;
                    this.spine.animation = XGDY_AngleCommonAnimation.待机;
                }
            }
        }
    }

    Use_Skill(data:{anglerId:string,skillId:string}){
        if(this.id == data.anglerId){
            let skillId = data.skillId;
            if(this.spine.animation !==  XGDY_AngleCommonAnimation[skillId]){
                this.spine.loop = false;
                this.spine.animation = XGDY_AngleCommonAnimation[skillId];
            }
            let duration = this.spine.findAnimation(this.spine.animation).duration;

            this.scheduleOnce(()=>{
                if(XGDY_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills.indexOf(this.id)!==-1){
                    XGDY_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills.splice(XGDY_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills.indexOf(this.id),1);
                    return;
                }
                if(!XGDY_DataManager.Instance.dynamicData.isStopInteract){

                    if(XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.indexOf(this.id)!==-1){
                        XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.splice(XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.indexOf(this.id),1);
                    }
                    if(this.spine.animation ==  XGDY_AngleCommonAnimation[skillId] && XGDY_DataManager.Instance.dynamicData.isFishHooking ){
                        this.pullRod();
                    }
                    else if(this.spine.animation == XGDY_AngleCommonAnimation[skillId] && XGDY_DataManager.Instance.dynamicData.isFishing){
                        this.spine.loop = true;
                        this.spine.animation = XGDY_AngleCommonAnimation.钓鱼;
                    }
                    else{
                        this.spine.loop = true;
                        this.spine.animation = XGDY_AngleCommonAnimation.待机;
                    }
                }
               
            },duration)
        }
    }

    Change_Rod(){
        let isFound = false;
        let index = 0;
        Object.keys(XGDY_DataManager.Instance.saveData.fishingRodData).forEach(key=>{
            if(!isFound){
                if(XGDY_DataManager.Instance.saveData.fishingRodData[key].isEquipped){
                    isFound = true;
                    //LTODO 增加鱼竿
                    index =key.split("_")[1]=="0"?parseInt(key.split("_")[2]):parseInt(key.split("_")[2])+13;
                }
            }
        })
        this.spine.setSlotTexture("yugan", this.FishingRod[index]);
    }


    showDangerSign(anglerId:string){
        if(anglerId == this.id){
           this.dangerSignNode.active = true;
           this.dangerSignNode.getComponent(UIOpacity).opacity = 255;
           tween(this.dangerSignNode.getComponent(UIOpacity))
            .delay(0.5)
            .to(0.2, { opacity: 0 })
            .call(()=>{
                this.dangerSignNode.active = false;
            })
            .start();
            this.dangerSignNode.scale = v3(1, 1, 1);
            tween(this.dangerSignNode)
            .to(0.2, { scale: v3(1.3, 1.3, 1.3) })
            .to(0.3, { scale: v3(1, 1, 1) })
            .start();

        }
    }


    //显示闪避标志
    showDodgeSign(anglerId:string){
        if(anglerId == this.id){
            this.dodgeSignNode.active = true;
            this.dodgeSignNode.getComponent(UIOpacity).opacity = 255;
            let pos = this.dodgeSignNode.position.clone();
            tween(this.dodgeSignNode.getComponent(UIOpacity))
            .delay(1)
            .to(0.2, { opacity: 0 })
            .start();
            tween(this.dodgeSignNode)
            .delay(1)
            .to(0.2, { position: v3(pos.x,pos.y+100,pos.z) })
            .call(()=>{
                this.dodgeSignNode.position = pos;
                this.dodgeSignNode.active = false;
            })
            .start();
        }
    }

    
    //显示闪避标志
    showDefenseSign(anglerId:string){
        if(anglerId == this.id){
            this.defenseSignNode.active = true;
            this.defenseSignNode.getComponent(UIOpacity).opacity = 255;
            let pos = this.defenseSignNode.position.clone();
            tween(this.defenseSignNode.getComponent(UIOpacity))
            .delay(1)
            .to(0.2, { opacity: 0 })
            .start();
            tween(this.defenseSignNode)
            .delay(1)
            .to(0.2, { position: v3(pos.x,pos.y+100,pos.z) })
            .call(()=>{
                this.defenseSignNode.position = pos;
                this.defenseSignNode.active = false;
            })
            .start();
        }
    }

    


    fishKillLine(anglerId:string){
        this.isNeedChangeLineEnd = false;
        if(this.id == anglerId){
            console.log(this.node.name);
            this.fishLine.reelLine();
              // 播放收竿动画
            if (this.spine) {
                this.spine.loop = false;
                this.spine.animation = XGDY_AngleCommonAnimation.切线;
                this.scheduleOnce(()=>{
                    if(this.spine.animation ==  XGDY_AngleCommonAnimation.切线){
                        // XGDY_DataManager.Instance.reelRodEnd();
                        this.spine.loop = true;
                        this.spine.animation = XGDY_AngleCommonAnimation.待机;
                    }
                },this.spine.findAnimation(this.spine.animation).duration)
            }
            EventManager.Scene.emit(XGDY_GameEvents.UI_Delete_Angler_Skill_Item, this.id);
        }
    }


    //显示恐惧标志
    showFearSign(){
        // if(anglerId == this.id){
           this.fearSignNode.active = true;
           this.fearSignNode.getComponent(UIOpacity).opacity = 255;
           tween(this.fearSignNode.getComponent(UIOpacity))
            .delay(0.5)
            .to(0.2, { opacity: 0 })
            .call(()=>{
                this.fearSignNode.active = false;
            })
            .start();
            this.fearSignNode.scale = v3(1, 1, 1);
            tween(this.fearSignNode)
            .to(0.2, { scale: v3(1.3, 1.3, 1.3) })
            .to(0.3, { scale: v3(1, 1, 1) })
            .start();

        // }
    }


    fishBanSkills(){
        if(XGDY_DataManager.Instance.dynamicData.killedAnglerIds.indexOf(this.id)!==-1){
            return; 
        }
        // this.isNeedChangeLineEnd = false;
        // if(this.id == anglerId){
            console.log(this.node.name);
            this.pullRod();
            EventManager.Scene.emit(XGDY_GameEvents.UI_Ban_Angler_Skill_Item, this.id);
        // }
    }

    /**
     * 注册事件监听
     */
    private addListener() {
        this.isAddListener = true;
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onCollisionExit, this);
        // 监听移动
        EventManager.on(XGDY_GameEvents.Player_Move, this.onMove, this);
        EventManager.on(XGDY_GameEvents.Player_Stop, this.onStopMove, this);
        // 监听移动到钓位事件
        EventManager.on(XGDY_GameEvents.Move_To_Fishing_Pos, this.moveToFishingSpot, this);
        // 监听抛竿事件
        EventManager.on(XGDY_GameEvents.抛竿, this.castRod, this);
        // 监听收竿事件
        EventManager.on(XGDY_GameEvents.收杆, this.reelRod, this);
        EventManager.on(XGDY_GameEvents.断线, this.kill, this);
        //鱼上钩
        EventManager.on(XGDY_GameEvents.FishHooking, this.pullRod, this);
        EventManager.on(XGDY_GameEvents.Play_ReelIn_Animation, this.reelIn, this);
        EventManager.on(XGDY_GameEvents.Clear_Lines, this.clearLine, this);

        EventManager.on(XGDY_GameEvents.Use_Skill, this.Use_Skill, this);
        EventManager.on(XGDY_GameEvents.Change_Rod, this.Change_Rod, this);

        EventManager.on(XGDY_GameEvents.Show_Danger_Sign, this.showDangerSign, this);
        EventManager.on(XGDY_GameEvents.Show_Dodge_Sign, this.showDodgeSign, this);
        EventManager.on(XGDY_GameEvents.Show_Defense_Sign, this.showDefenseSign, this);
        //鱼切线
        EventManager.on(XGDY_GameEvents.FishKillLine, this.fishKillLine, this);

        EventManager.on(XGDY_GameEvents.Show_Fear_Sign, this.showFearSign, this);
        EventManager.on(XGDY_GameEvents.Start_Ban_Skill, this.fishBanSkills, this);

        EventManager.on(XGDY_GameEvents.Update_Special_Fish_line, this.handleSpecialLine, this);
    }



        
    /**
     * 组件销毁时的清理
     * Cocos Creator生命周期函数
     */
    onDestroy() {
        // 移除事件监听
        EventManager.off(XGDY_GameEvents.Player_Move, this.onMove, this);
        EventManager.off(XGDY_GameEvents.Player_Stop, this.onStopMove, this);
        // 移除事件监听
        EventManager.off(XGDY_GameEvents.Move_To_Fishing_Pos, this.moveToFishingSpot, this);
        EventManager.off(XGDY_GameEvents.抛竿, this.castRod, this);
        EventManager.off(XGDY_GameEvents.收杆, this.reelRod, this);
        EventManager.off(XGDY_GameEvents.断线, this.kill, this);
        EventManager.off(XGDY_GameEvents.FishHooking, this.pullRod, this);
        EventManager.off(XGDY_GameEvents.Play_ReelIn_Animation, this.reelIn, this);
        EventManager.off(XGDY_GameEvents.Clear_Lines, this.clearLine, this);
        EventManager.off(XGDY_GameEvents.Use_Skill, this.Use_Skill, this);
        EventManager.off(XGDY_GameEvents.Change_Rod, this.Change_Rod, this);
        EventManager.off(XGDY_GameEvents.Show_Danger_Sign, this.showDangerSign, this);  
        EventManager.off(XGDY_GameEvents.Show_Dodge_Sign, this.showDodgeSign, this);  
        EventManager.off(XGDY_GameEvents.Show_Defense_Sign, this.showDefenseSign, this);  
        EventManager.off(XGDY_GameEvents.FishKillLine, this.fishKillLine, this);  
        EventManager.off(XGDY_GameEvents.Show_Fear_Sign, this.showFearSign, this);
        EventManager.off(XGDY_GameEvents.Update_Special_Fish_line, this.handleSpecialLine, this);



    }
}