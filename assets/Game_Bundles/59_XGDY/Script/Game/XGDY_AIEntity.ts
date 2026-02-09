// 导入Cocos Creator核心模块
import { _decorator, Component, Node, Vec3, tween, Quat, sp, Label, instantiate, v3, RigidBody2D, v2, Collider2D, Contact2DType, Texture2D, Animation } from 'cc';
import { XGDY_AnglerJsonData, XGDY_DataManager, XGDY_SkillJsonData } from '../Manager/XGDY_DataManager';
import { XGDY_GameManager } from '../Manager/XGDY_GameManager';
import { XGDY_FishLine } from './XGDY_FishLine';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_AngleCommonAnimation, XGDY_AnglerSkin, XGDY_AnimationName } from '../Common/XGDY_Animation';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_Constant } from '../Common/XGDY_Constant';
import { XGDY_SkillId } from '../Common/XGDY_ISkillParams';
import { XGDY_AiSkillManager } from '../Manager/XGDY_AiSkillManager';
import { XGDY_SkillManager } from '../Manager/XGDY_SkillManager';
// 导入数据管理器和游戏管理器


// 获取装饰器
const { ccclass, property } = _decorator;

/**
 * 基础实体组件类
 * 实现钓友和玩家的共同行为，包括移动、抛竿、收竿等核心功能
 */
@ccclass('XGDY_AIEntity')
export class XGDY_AIEntity extends Component {

    @property(XGDY_FishLine)
    public fishLine: XGDY_FishLine = null;  // 鱼线节点引用

    @property(Node)
    public lineStartPoint: Node = null;         // 鱼竿节点引用
 
    @property({ type: [Texture2D] })
    FishingRod: Texture2D[] = [];  
    
    

    
    splashEffect:Node = null;
    

    isAddListener:boolean = false;

    spine:sp.Skeleton  = null;




    public id: string = "";              // 实体ID

    public isTangled: boolean = false;   // 是否切线
    public isCastingSkill: boolean = false;  // 是否正在释放技能

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
        // 水花动画
        this.spine = this.node.getComponent(sp.Skeleton);

        // 注册事件监听
        if(!this.isAddListener){
            this.addListener();
        }
        
        this.id = anglerId;
        this.spine.setSkin(XGDY_AnglerSkin[anglerId]);
        this.Change_Rod();
        this.spine.loop = true;
        this.spine.animation = XGDY_AngleCommonAnimation.待机;


        // 判断是否为玩家控制的实体（第一个出战钓友）

        //设置线起点
        this.fishLine.setStartNode(this.lineStartPoint);

    }

    isPulling:boolean = false;
    passTime = 0;
    timeInterval = 3;
    //自动钓鱼
    update(dt: number) {
        if(!this.isPulling)return;
        this.passTime += dt;
        if(this.passTime >= this.timeInterval){
            this.timeInterval = Math.random() * 2 + XGDY_Constant.MAP_103_Challenge3_Data.minTime;
            this.useRandomSkill();
            this.passTime = 0;
        }
    }

 useRandomSkill(){
        let skillIds = [];
        let anglerData = XGDY_DataManager.Instance.getItemDataById(this.id) as XGDY_AnglerJsonData;
        Object.keys(anglerData.技能列表).forEach((key)=>{
            skillIds.push(key);
        })

        let randomIdx = Math.floor(Math.random() * skillIds.length);

        let skillId = skillIds[randomIdx];
            let skillData = XGDY_DataManager.Instance.getItemDataById(skillId) as XGDY_SkillJsonData;
            let skillLevel =  XGDY_Constant.MAP_103_Challenge3_Data.skillLevel;
            let levelData = skillData.等级配置[skillLevel];

            let angrlLevel  = XGDY_Constant.MAP_103_Challenge3_Data.anglerLevel;
            let anglerAdd = anglerData.等级配置["1"].钓法加成+angrlLevel*5;

            let skillInfo:{
                技能id:string,
                技能等级:number,
                冷却时间: number; // 单位：秒
                持续时间: number; // 单位：秒
                体力消耗: number;
                拉力: number;
                总伤: number;
                angler:string,
            } = {
                技能id:skillId,
                技能等级:skillLevel,
                冷却时间:skillData.冷却时间,
                持续时间:XGDY_DataManager.Instance.dynamicData.skillTimeData[skillId],
                体力消耗:levelData.体力消耗,
                拉力:levelData.拉力 * anglerAdd/100,
                总伤:levelData.总伤 * (anglerAdd/100),
                angler:skillId,
            }
            this.onSkillClick(
                skillInfo,
                skillId,
            );
    }
    
    onSkillClick( 
        skillData:{
            技能id:string,
            技能等级:number,
            冷却时间: number; // 单位：秒
            持续时间: number; // 单位：秒
            体力消耗: number;
            拉力: number;
            总伤: number;
            angler:string,
        },
        skillId:XGDY_SkillId,
    ){

        console.log("ai使用技能",skillId);

        //创建技能
        XGDY_SkillManager.Instance.createAISkill(skillData);

        //播放玩家动画
        this.Use_Skill(skillId);
        
        //相机操作
        XGDY_DataManager.Instance.dynamicData.cameraTarget = this.node;
        EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,15,false);
        XGDY_DataManager.Instance.dynamicData.cameraTargets.push(this.node);
        this.scheduleOnce(()=>{
            XGDY_DataManager.Instance.dynamicData.cameraTargets.splice(XGDY_DataManager.Instance.dynamicData.cameraTargets.indexOf(this.node),1);
            if(XGDY_DataManager.Instance.dynamicData.cameraTargets.length == 0 && XGDY_DataManager.Instance.dynamicData.isFishHooking){
                XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.hookPoint;
                EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,15);
            }
        },1)
    }











    pullRod(){
        if(!XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_3_Challengeing){
            return;
        }
        this.isPulling = true;
        if(this.spine.animation !==  XGDY_AngleCommonAnimation.钓大鱼){
            this.spine.loop = true;
            this.spine.animation = XGDY_AngleCommonAnimation.钓大鱼;
        }


        this.fishLine.setStartAndEndNode(this.lineStartPoint,XGDY_DataManager.Instance.dynamicData.fishMouthPoints[0],-1);

        this.fishLine.startUpdateLine = true;
        let normalX = Math.abs(this.node.scale.x);
        let scaleX = XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft?-Math.abs(normalX):normalX;

   
        let normalLineX =  Math.abs(this.fishLine.node.scale.x);
        let scaleLineX = XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft?-Math.abs(normalLineX):normalLineX;
       
        this.node.setScale(v3(scaleX,this.node.scale.y,this.node.scale.z));
        this.fishLine.node.setScale(v3(scaleLineX,this.fishLine.node.scale.y,this.fishLine.node.scale.z))
    
        //施加拉力
        XGDY_SkillManager.Instance.startAIPullLine();
    }

    onPlayerKill(){
        this.fishLine.reelLine();

        this.isPulling = false;
        // 播放收竿动画
        if (this.spine) {
            this.spine.loop = false;
            this.spine.animation = XGDY_AngleCommonAnimation.切线;
        }

        this.scheduleOnce(()=>{
            if(this.spine.animation ==  XGDY_AngleCommonAnimation.切线){
                this.spine.loop = true;
                this.spine.animation = XGDY_AngleCommonAnimation.待机;
            }
        },this.spine.findAnimation(this.spine.animation).duration)

        // 发送收竿结束事件
        this.node.emit('reel_finished');
    }


    
    onPlayerReelIn(){
        this.onPlayerKill();
    }


   
    Use_Skill(skillId:string){
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

    
    Change_Rod(){
        // let fishRodId = XGDY_Constant.MAP_103_Challenge3_Data.fishRodId;
        // let index =fishRodId.split("_")[1]=="0"?parseInt(fishRodId.split("_")[2]):parseInt(fishRodId.split("_")[2])+13;
        this.spine.setSlotTexture("yugan", this.FishingRod[0]);
    }

    /**
     * 注册事件监听
     */
    private addListener() {
        this.isAddListener = true;
        EventManager.on(XGDY_GameEvents.断线, this.onPlayerKill, this);
        //鱼上钩
        EventManager.on(XGDY_GameEvents.FishHooking, this.pullRod, this);
        //玩家收竿
        EventManager.on(XGDY_GameEvents.Play_ReelIn_Animation, this.onPlayerReelIn, this);
    }



        
    /**
     * 组件销毁时的清理
     * Cocos Creator生命周期函数
     */
    onDestroy() {
        // 移除事件监听
   
        EventManager.off(XGDY_GameEvents.断线, this.onPlayerKill, this);
        EventManager.off(XGDY_GameEvents.FishHooking, this.pullRod, this);
        EventManager.off(XGDY_GameEvents.Play_ReelIn_Animation, this.onPlayerReelIn, this);
    }
}