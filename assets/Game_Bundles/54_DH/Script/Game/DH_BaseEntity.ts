// 导入Cocos Creator核心模块
import { _decorator, Component, Node, Vec3, tween, Quat, sp, Label, instantiate, v3, RigidBody2D, v2, Collider2D, Contact2DType, Texture2D, Animation } from 'cc';
import { DH_DataManager, DH_SkillJsonData } from '../Manager/DH_DataManager';
import { DH_GameManager } from '../Manager/DH_GameManager';
import { DH_FishLine } from './DH_FishLine';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_AngleCommonAnimation, DH_AnglerSkin, DH_AnimationName } from '../Common/DH_Animation';
import { DH_GameEvents } from '../Common/DH_GameEvents';
// 导入数据管理器和游戏管理器


// 获取装饰器
const { ccclass, property } = _decorator;

/**
 * 基础实体组件类
 * 实现钓友和玩家的共同行为，包括移动、抛竿、收竿等核心功能
 */
@ccclass('DH_BaseEntity')
export class DH_BaseEntity extends Component {
    @property(Node)
    public nameNode: Node = null;   // 鱼饵点节点引用

    @property(DH_FishLine)
    public fishLine: DH_FishLine = null;  // 鱼线节点引用

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
        this.spine.setSkin(DH_AnglerSkin[anglerId]);
        this.Change_Rod();
        this.spine.loop = true;
        this.spine.animation = DH_AngleCommonAnimation.待机;
        this.rigidbody.linearVelocity = v2(0,0);

        this.splashEffect.active = false;

        // 判断是否为玩家控制的实体（第一个出战钓友）
        this.isPlayer = DH_DataManager.Instance.saveData.gameData.currentAnglerIds[0] === this.id;
        this.otherSpeed = Math.random()*0.03-0.03+0.09;
        this.followDistance = DH_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(this.id)*50+100;
        //设置线起点
        this.fishLine.setStartNode(this.lineStartPoint);
        
        // 如果是玩家，设置上钩点
        if (this.isPlayer && this.hookPointNode) {
            this.nameNode.getComponent(Label).string = DH_DataManager.Instance.saveData.name;
            DH_DataManager.Instance.dynamicData.hookPoint = this.hookPointNode;
            DH_DataManager.Instance.dynamicData.lengthStartPointNode = this.lengthStartPointNode;
            DH_DataManager.Instance.dynamicData.fishPlaceNode = this.fishPlaceNode;

            let skillData = DH_DataManager.Instance.getAllSkillData();

            let skillTimeData:{[key:string]:number} = {};
            let skillIds:string[] = [];

            Object.keys(skillData).forEach((key)=>{
                let skillData2 = skillData[key] ;
                Object.keys(skillData2).forEach((key2)=>{
                    let skillData3 = skillData2[key2] as DH_SkillJsonData;
                    skillIds.push(skillData3.id);
                })
            })
            
            skillIds.forEach((skillId)=>{
                skillTimeData[skillId] = this.spine.findAnimation(DH_AngleCommonAnimation[skillId]).duration;
            })
            
            DH_DataManager.Instance.dynamicData.skillTimeData = skillTimeData;
        }

        
        this.nameNode.active = this.isPlayer;
    }


    /**
     * 移动到钓位
     */
    moveToFishingSpot() {
        // // 获取目标钓位
        // const targetSpot = DH_DataManager.Instance.getMainFishingSpot();
        // if (!targetSpot) return;
        let idx = DH_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(this.id);

        // 移动到目标钓位
        this.moveToPosition(DH_DataManager.Instance.dynamicData.currentFishingSpots[idx], () => {
            if(this.spine.animation !==  DH_AngleCommonAnimation.待机){
                this.spine.loop = true;
                this.spine.animation = DH_AngleCommonAnimation.待机;
            }
            // 通知数据管理器已到达钓位
            DH_DataManager.Instance.arrivedAtFishingSpot();
        });
    }

    /**
     * 移动到指定位置
     * @param position 目标位置
     * @param callback 移动完成回调
     */
    moveToPosition(position: Vec3, callback: Function) {

        if(this.spine.animation !==  DH_AngleCommonAnimation.走路){
            this.spine.loop = true;
            this.spine.animation = DH_AngleCommonAnimation.走路;
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
            DH_DataManager.Instance.dynamicData.currentLineEndNode = this.baitPointNode;
            DH_DataManager.Instance.dynamicData.isFishingLineOpen = true;
        }

        this.scheduleOnce(()=>{
            this.fishLine.setStartAndEndNode(this.lineStartPoint,this.baitPointNode);
            
        },0.6)
        this.scheduleOnce(()=>{
            DH_DataManager.Instance.dynamicData.isStopInteract = false;
        },0.7);
        this.fishLine.startUpdateLine = true;
        let normalX = Math.abs(this.node.scale.x);
        let scaleX = DH_DataManager.Instance.dynamicData.isFishDirectionLeft?-Math.abs(normalX):normalX;
        let normalNameX =  Math.abs(this.nameNode.scale.x);
        let scaleNameX = DH_DataManager.Instance.dynamicData.isFishDirectionLeft?-Math.abs(normalNameX):normalNameX;
        let normalLineX =  Math.abs(this.fishLine.node.scale.x);
        let scaleLineX = DH_DataManager.Instance.dynamicData.isFishDirectionLeft?-Math.abs(normalLineX):normalLineX;
       
        this.node.setScale(v3(scaleX,this.node.scale.y,this.node.scale.z));
        this.nameNode.setScale(v3(scaleNameX,this.nameNode.scale.y,this.nameNode.scale.z))
        this.fishLine.node.setScale(v3(scaleLineX,this.fishLine.node.scale.y,this.fishLine.node.scale.z))
        
        // let idx = DH_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(this.id);
        // DH_DataManager.Instance.dynamicData.fishLines[idx] = this.fishLine.node;
        
        let idx = this.id;
        // 播放抛竿动画（假设使用Spine动画组件）
        if (this.spine) {
            this.spine.loop = false;
            this.spine.animation = DH_AngleCommonAnimation.抛竿;
            this.scheduleOnce(()=>{
                if(this.spine.animation ==  DH_AngleCommonAnimation.抛竿){
                    this.fishLine.setStartAndEndNode(this.lineStartPoint,this.shuihuaPointNode);
                    if(this.isPlayer){
                        DH_DataManager.Instance.dynamicData.currentLineEndNode = this.shuihuaPointNode;
                    }
                    this.spine.loop = true;
                    this.spine.animation = DH_AngleCommonAnimation.钓鱼;
                    if(this.isPlayer){
                        DH_DataManager.Instance.startFishing();
                    }
                }
            },this.spine.findAnimation(this.spine.animation).duration)

            if(this.isPlayer){
                this.scheduleOnce(()=>{
                    DH_DataManager.Instance.dynamicData.cameraTarget = DH_DataManager.Instance.dynamicData.hookPoint;
                    EventManager.Scene.emit(DH_GameEvents.Update_Camera_Tartget,4.5);
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
            DH_DataManager.Instance.dynamicData.currentLineEndNode = null;
        }
        this.fishLine.reelLine();


        // 播放收竿动画
        if (this.spine) {
            this.spine.loop = false;
            this.spine.animation = DH_AngleCommonAnimation.收竿;
        }
        if(this.isPlayer){
            this.scheduleOnce(()=>{
                DH_DataManager.Instance.dynamicData.cameraTarget = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(DH_GameEvents.Update_Camera_Tartget,4.5);
            },0.1)

            this.scheduleOnce(()=>{
                DH_DataManager.Instance.dynamicData.cameraTarget = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(DH_GameEvents.Update_Camera_Tartget,2);
            },1)
        }

        this.scheduleOnce(()=>{
            DH_DataManager.Instance.dynamicData.isFishingLineOpen = false;
            DH_DataManager.Instance.setLneLength(0);
            if(this.spine.animation ==  DH_AngleCommonAnimation.收竿){
                this.scheduleOnce(()=>{
                    DH_DataManager.Instance.dynamicData.isStopInteract = false;
                },0.2)
                DH_DataManager.Instance.reelRodEnd();
                this.spine.loop = true;
                this.spine.animation = DH_AngleCommonAnimation.待机;
            }
        },this.spine.findAnimation(this.spine.animation).duration)



        // 发送收竿结束事件
        this.node.emit('reel_finished');
    }

    pullRod(){
        let fishType = DH_DataManager.Instance.dynamicData.currentFishId.split("_")[1];
        switch(fishType){
            case "0":
            case "1":
            case "2":
                if(this.spine.animation !==  DH_AngleCommonAnimation.钓小鱼){
                    this.spine.loop = true;
                    this.spine.animation = DH_AngleCommonAnimation.钓小鱼;
                }
                break;
            case "3":
            case "4":
            case "5":
                if(this.spine.animation !==  DH_AngleCommonAnimation.钓大鱼){
                    this.spine.loop = true;
                    this.spine.animation = DH_AngleCommonAnimation.钓大鱼;
                }
                break;
            case "6":
            case "7":
            case "8":
                if(this.spine.animation !==  DH_AngleCommonAnimation.钓巨物){
                    this.spine.loop = true;
                    this.spine.animation = DH_AngleCommonAnimation.钓巨物;
                }
                break;
        }

        let idx = DH_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(this.id);
        this.fishLine.setStartAndEndNode(this.lineStartPoint,DH_DataManager.Instance.dynamicData.fishMouthPoints[idx]);
        if(this.isPlayer){
            DH_DataManager.Instance.dynamicData.currentLineEndNode = DH_DataManager.Instance.dynamicData.fishMouth;
        }
        if(idx == 1){
            this.isNeedChangeLineEnd = true;
        }
    }

    kill(){
        this.isNeedChangeLineEnd = false;

        if(this.isPlayer){
            DH_DataManager.Instance.dynamicData.currentLineEndNode = null;
        }
        this.fishLine.reelLine();


        // 播放收竿动画
        if (this.spine) {
            this.spine.loop = false;
            this.spine.animation = DH_AngleCommonAnimation.切线;
        }
        if(this.isPlayer){
            this.scheduleOnce(()=>{
                DH_DataManager.Instance.dynamicData.cameraTarget = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(DH_GameEvents.Update_Camera_Tartget,4.5);
            },0.1)

            this.scheduleOnce(()=>{
                DH_DataManager.Instance.dynamicData.cameraTarget = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(DH_GameEvents.Update_Camera_Tartget,2);
            },1)
        }

        this.scheduleOnce(()=>{
            DH_DataManager.Instance.dynamicData.isFishingLineOpen = false;
            DH_DataManager.Instance.setLneLength(0);
            if(this.spine.animation ==  DH_AngleCommonAnimation.切线){
                DH_DataManager.Instance.reelRodEnd();
                this.scheduleOnce(()=>{
                    DH_DataManager.Instance.dynamicData.isStopInteract = false;
                },0.2)
                this.spine.loop = true;
                this.spine.animation = DH_AngleCommonAnimation.待机;
            }
        },this.spine.findAnimation(this.spine.animation).duration)



        // 发送收竿结束事件
        this.node.emit('reel_finished');
    }

    reelIn(){
        this.isNeedChangeLineEnd = false;
        if(this.spine.animation !==  DH_AngleCommonAnimation.钓起){
            this.spine.loop = true;
            this.spine.animation = DH_AngleCommonAnimation.钓起;
        }

        if(this.isPlayer){
            this.scheduleOnce(()=>{
                DH_DataManager.Instance.dynamicData.cameraTarget = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(DH_GameEvents.Update_Camera_Tartget,4.5);
            },0.1)

            this.scheduleOnce(()=>{
                DH_DataManager.Instance.dynamicData.cameraTarget = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0];
                EventManager.Scene.emit(DH_GameEvents.Update_Camera_Tartget,2);
            },1)
        }


        this.scheduleOnce(()=>{
            DH_DataManager.Instance.dynamicData.isFishingLineOpen = false;
            DH_DataManager.Instance.setLneLength(0);
            if(this.spine.animation ==  DH_AngleCommonAnimation.钓起){
                DH_DataManager.Instance.reelRodEnd();
                this.scheduleOnce(()=>{
                    DH_DataManager.Instance.dynamicData.isStopInteract = false;
                },0.2)

                this.spine.loop = true;
                this.spine.animation = DH_AngleCommonAnimation.待机;
                if(this.isPlayer){
                    DH_DataManager.Instance.dynamicData.currentLineEndNode = null;
                }
            }
        },this.spine.findAnimation(this.spine.animation).duration)
    }

    clearLine(){
        DH_DataManager.Instance.dynamicData.isFishingLineOpen = false;
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
            if(this.isPlayer && ! DH_DataManager.Instance.dynamicData.isFallingIntoWater){
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
            if(this.isPlayer && ! DH_DataManager.Instance.dynamicData.isFallingIntoWater){
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
        DH_DataManager.Instance.dynamicData.isFallingIntoWater = true;
        this.rigidbody.linearVelocity = v2(0,0);
          if(DH_DataManager.Instance.dynamicData.isStopInteract){
            DH_DataManager.Instance.dynamicData.isFallingIntoWater = false;
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
                if (DH_DataManager.Instance.dynamicData.spawnPoint) {
                    this.node.worldPosition = DH_DataManager.Instance.dynamicData.spawnPoint;
                    DH_DataManager.Instance.dynamicData.isFallingIntoWater = false;
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
        DH_DataManager.Instance.dynamicData.interactionTarget = npcNode;
        DH_DataManager.Instance.dynamicData.currentNpcId = npcNode.name;
        EventManager.Scene.emit(DH_GameEvents.UI_Show_Btn_Interact);
    }

    handleNpcInteractionEnd(){
        DH_DataManager.Instance.dynamicData.interactionTarget = null;
        DH_DataManager.Instance.dynamicData.currentNpcId = "";
        EventManager.Scene.emit(DH_GameEvents.UI_Hide_Btn_Interact);
    }

    /**
     * 处理拖拉机交互（回家提示）
     */
    handleTractorInteraction(npcNode: Node) {
        // 设置交互对象
        DH_DataManager.Instance.dynamicData.interactionTarget = npcNode;
        EventManager.Scene.emit(DH_GameEvents.UI_Show_Btn_Interact);
        // 触发回家提示
    }

    handleTractorInteractionEnd(){
        DH_DataManager.Instance.dynamicData.interactionTarget = null;
        DH_DataManager.Instance.dynamicData.currentNpcId = "";
        EventManager.Scene.emit(DH_GameEvents.UI_Hide_Btn_Interact);
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
        if(!this.isNeedChangeLineEnd ||
            !DH_DataManager.Instance.dynamicData.isFishHooking
        ) return;
        this.changePassTime +=dt
        if(this.changePassTime >= this.changeTime){
            this.changeTime = Math.random()*0.1;
            this.changePassTime = 0;
            let randomIdx = Math.floor(Math.random()*DH_DataManager.Instance.dynamicData.fishMouthPoints.length)
            this.fishLine.setStartAndEndNode(this.lineStartPoint,DH_DataManager.Instance.dynamicData.fishMouthPoints[randomIdx]);
        }
    }

    private forwardDir: number = 1;
    private _dir: Vec3 = v3(0, 0, 0);
    /**
     * 处理摇杆输入
     */
    onMove() {
        if(!this.isPlayer || 
            DH_DataManager.Instance.dynamicData.isFallingIntoWater ||
             DH_DataManager.Instance.dynamicData.isGoingToFishing||
             DH_DataManager.Instance.dynamicData.isFishing){
            return;
        }
        let Dir = DH_DataManager.Instance.dynamicData.moveDir
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

        if(this.spine.animation !==  DH_AngleCommonAnimation.走路){
            this.spine.loop = true;
            this.spine.animation = DH_AngleCommonAnimation.走路;
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
        if(this.spine.animation !==  DH_AngleCommonAnimation.走路){
            this.spine.loop = true;
            this.spine.animation = DH_AngleCommonAnimation.走路;
        }
        if(this.spine.animation !==  DH_AngleCommonAnimation.待机){
            this.spine.loop = true;
            this.spine.animation = DH_AngleCommonAnimation.待机;
        }
    }


    private followPlayer(deltaTime: number) {
        if(this.isPlayer||
            !DH_DataManager.Instance.dynamicData.isGameStart || 
            DH_DataManager.Instance.dynamicData.isGoingToFishing ||
            DH_DataManager.Instance.dynamicData.isFishing) return;
        // 获取玩家节点
        const playerNode = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0];
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

            if(this.spine.animation !==  DH_AngleCommonAnimation.走路){
                this.spine.loop = true;
                this.spine.animation = DH_AngleCommonAnimation.走路;
            }
        }
        else{
            if(DH_DataManager.Instance.dynamicData.isMove && distance <195){
                if(this.spine.animation !==  DH_AngleCommonAnimation.待机){
                    this.spine.loop = true;
                    this.spine.animation = DH_AngleCommonAnimation.待机;
                }
            }
            if(!DH_DataManager.Instance.dynamicData.isMove){
                if(this.spine.animation !==  DH_AngleCommonAnimation.待机){
                    this.spine.loop = true;
                    this.spine.animation = DH_AngleCommonAnimation.待机;
                }
            }
        }
    }

    Use_Skill(data:{anglerId:string,skillId:string}){
        if(this.id == data.anglerId){
            let skillId = data.skillId;
            if(this.spine.animation !==  DH_AngleCommonAnimation[skillId]){
                this.spine.loop = false;
                this.spine.animation = DH_AngleCommonAnimation[skillId];
            }
            let duration = this.spine.findAnimation(this.spine.animation).duration;

            this.scheduleOnce(()=>{
                if(DH_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills.indexOf(this.id)!==-1){
                    DH_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills.splice(DH_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills.indexOf(this.id),1);
                    return;
                }
                if(!DH_DataManager.Instance.dynamicData.isStopInteract){

                    if(DH_DataManager.Instance.dynamicData.usingSkillAnglerIds.indexOf(this.id)!==-1){
                        DH_DataManager.Instance.dynamicData.usingSkillAnglerIds.splice(DH_DataManager.Instance.dynamicData.usingSkillAnglerIds.indexOf(this.id),1);
                    }
                    if(this.spine.animation ==  DH_AngleCommonAnimation[skillId] && DH_DataManager.Instance.dynamicData.isFishHooking ){
                        this.pullRod();
                    }
                    else if(this.spine.animation == DH_AngleCommonAnimation[skillId] && DH_DataManager.Instance.dynamicData.isFishing){
                        this.spine.loop = true;
                        this.spine.animation = DH_AngleCommonAnimation.钓鱼;
                    }
                    else{
                        this.spine.loop = true;
                        this.spine.animation = DH_AngleCommonAnimation.待机;
                    }
                }
               
            },duration)
        }
    }

    Change_Rod(){
        let isFound = false;
        let index = 0;
        Object.keys(DH_DataManager.Instance.saveData.fishingRodData).forEach(key=>{
            if(!isFound){
                if(DH_DataManager.Instance.saveData.fishingRodData[key].isEquipped){
                    isFound = true;
                    index =key.split("_")[1]=="0"?parseInt(key.split("_")[2]):parseInt(key.split("_")[2])+13;
                }
            }
        })
        this.spine.setSlotTexture("yugan", this.FishingRod[index]);
    }

    /**
     * 注册事件监听
     */
    private addListener() {
        this.isAddListener = true;
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onCollisionExit, this);
        // 监听移动
        EventManager.on(DH_GameEvents.Player_Move, this.onMove, this);
        EventManager.on(DH_GameEvents.Player_Stop, this.onStopMove, this);
        // 监听移动到钓位事件
        EventManager.on(DH_GameEvents.Move_To_Fishing_Pos, this.moveToFishingSpot, this);
        // 监听抛竿事件
        EventManager.on(DH_GameEvents.抛竿, this.castRod, this);
        // 监听收竿事件
        EventManager.on(DH_GameEvents.收杆, this.reelRod, this);
        EventManager.on(DH_GameEvents.断线, this.kill, this);
        //鱼上钩
        EventManager.on(DH_GameEvents.FishHooking, this.pullRod, this);
        EventManager.on(DH_GameEvents.Play_ReelIn_Animation, this.reelIn, this);
        EventManager.on(DH_GameEvents.Clear_Lines, this.clearLine, this);

        EventManager.on(DH_GameEvents.Use_Skill, this.Use_Skill, this);
        EventManager.on(DH_GameEvents.Change_Rod, this.Change_Rod, this);
    }



        
    /**
     * 组件销毁时的清理
     * Cocos Creator生命周期函数
     */
    onDestroy() {
        // 移除事件监听
        EventManager.off(DH_GameEvents.Player_Move, this.onMove, this);
        EventManager.off(DH_GameEvents.Player_Stop, this.onStopMove, this);
        // 移除事件监听
        EventManager.off(DH_GameEvents.Move_To_Fishing_Pos, this.moveToFishingSpot, this);
        EventManager.off(DH_GameEvents.抛竿, this.castRod, this);
        EventManager.off(DH_GameEvents.收杆, this.reelRod, this);
        EventManager.off(DH_GameEvents.断线, this.kill, this);
        EventManager.off(DH_GameEvents.FishHooking, this.pullRod, this);
        EventManager.off(DH_GameEvents.Play_ReelIn_Animation, this.reelIn, this);
        EventManager.off(DH_GameEvents.Clear_Lines, this.clearLine, this);
        EventManager.off(DH_GameEvents.Use_Skill, this.Use_Skill, this);
        EventManager.off(DH_GameEvents.Change_Rod, this.Change_Rod, this);


    }
}