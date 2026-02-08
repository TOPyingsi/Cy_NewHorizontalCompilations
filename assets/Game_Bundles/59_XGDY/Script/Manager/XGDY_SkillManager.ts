import { _decorator, Component, Node } from 'cc';
import { XGDY_SkillUpdateItem, XGDY_Skill_0_0_DamageParams, XGDY_Skill_0_1_DamageParams, XGDY_Skill_0_2_DamageParams, XGDY_Skill_0_3_DamageParams, XGDY_Skill_Normal_DamageParams, XGDY_Skill_Normal_PullParams, XGDY_SkillDamageParams, XGDY_SkillId, XGDY_SkillPullParams, XGDY_Skill_Common_PullParams, XGDY_Skill_Common_DamageParams } from '../Common/XGDY_ISkillParams';
import { XGDY_AnglerJsonData, XGDY_DataManager, XGDY_SpecialItem } from './XGDY_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_AudioManager } from './XGDY_AudioManager';
import { XGDY_Constant } from '../Common/XGDY_Constant';
const { ccclass} = _decorator;

/**
 * 技能算法管理器（单例）：管理所有技能的伤害计算逻辑
 */
@ccclass('XGDY_SkillManager')
export class XGDY_SkillManager extends Component {
public static Instance: XGDY_SkillManager;  // 单例实例，全局访问点

  private skillAlgorithms: XGDY_SkillUpdateItem[] = []; // 生效中的伤害算法列表


    onLoad() {
        XGDY_SkillManager.Instance = this;
        this.addListener();
    }

    startPullLine(){
     // 技能参数基类（所有技能参数继承此接口）
        let params: XGDY_SkillDamageParams = {
            skillId: XGDY_SkillId.正常扣血,       // 技能ID
            level: 1,           // 技能等级
            duration: 0,        // 技能持续时间（秒）
            elapsedTime: 0,     // 已流逝时间（用于判断结束）
            isFinished: false,    // 技能是否结束
            frameDamage: 0,     // 每帧伤害
        }
        let pullParams: XGDY_SkillPullParams = {
            skillId: XGDY_SkillId.正常扣血,       // 技能ID
            level: 1,           // 技能等级
            duration: 0,        // 技能持续时间（秒）
            elapsedTime: 0,     // 已流逝时间（用于判断结束）
            isFinished: false,    // 技能是否结束
            framePull: 0,     // 每帧拉拔力
        }
        this.applySkill(params, pullParams)
    }

    startAIPullLine(){
     // 技能参数基类（所有技能参数继承此接口）
        let params: XGDY_SkillDamageParams = {
            skillId: XGDY_SkillId.AI正常扣血,       // 技能ID
            level: 1,           // 技能等级
            duration: 0,        // 技能持续时间（秒）
            elapsedTime: 0,     // 已流逝时间（用于判断结束）
            isFinished: false,    // 技能是否结束
            frameDamage: 0,     // 每帧伤害
        }
        let pullParams: XGDY_SkillPullParams = {
            skillId: XGDY_SkillId.AI正常扣血,       // 技能ID
            level: 1,           // 技能等级
            duration: 0,        // 技能持续时间（秒）
            elapsedTime: 0,     // 已流逝时间（用于判断结束）
            isFinished: false,    // 技能是否结束
            framePull: 0,     // 每帧拉拔力
        }
        this.applySkill(params, pullParams)
    }





    stopPullLine(){
        // this.skillAlgorithms = [];
        XGDY_SkillManager.Instance.removeSkill(XGDY_SkillId.正常扣血)
        this.pullLine(0);
    }

    clearSkill(){
        this.skillAlgorithms = [];
    }

    banSkill(){
      let needDeleteSkills = []
      this.skillAlgorithms.forEach((skillAlgorithm)=>{
        if(skillAlgorithm.damageParams.skillId !== XGDY_SkillId.正常扣血){
          needDeleteSkills.push(skillAlgorithm);
        }
      })
      needDeleteSkills.forEach((skillAlgorithm)=>{
        this.skillAlgorithms.splice(this.skillAlgorithms.indexOf(skillAlgorithm),1)
      })

  }


    createSkill(  skillData:{
      技能id:string,
      技能等级:number,
      冷却时间: number; // 单位：秒
      持续时间: number; // 单位：秒
      体力消耗: number;
      拉力: number;
      总伤: number;
      angler:string,
  }){
      let params: XGDY_SkillDamageParams = {
          skillId: XGDY_SkillId.通用技能,       // 技能ID
          level: skillData.技能等级,           // 技能等级
          duration: skillData.持续时间,        // 技能持续时间（秒）
          totalTime: skillData.持续时间,        // 技能持续时间（秒）
          elapsedTime: 0,     // 已流逝时间（用于判断结束）
          isFinished: false,    // 技能是否结束
          frameDamage: 0,     // 每帧伤害
          totalDamage: skillData.总伤,     // 每帧伤害
          angler: skillData.angler,     // 每帧伤害
      }
      let pullParams: XGDY_SkillPullParams = {
          skillId: XGDY_SkillId.通用技能,       // 技能ID
          level: skillData.技能等级,           // 技能等级
          duration: skillData.持续时间,        // 技能持续时间（秒）
          elapsedTime: 0,     // 已流逝时间（用于判断结束）
          isFinished: false,    // 技能是否结束
          framePull: 0,
          framePull2: skillData.拉力,     // 每帧拉拔力
      }
      this.applySkill(params, pullParams)

    }

    
    createAISkill(  skillData:{
      技能id:string,
      技能等级:number,
      冷却时间: number; // 单位：秒
      持续时间: number; // 单位：秒
      体力消耗: number;
      拉力: number;
      总伤: number;
      angler:string,
  }){
      let params: XGDY_SkillDamageParams = {
          skillId: XGDY_SkillId.AI通用技能,       // 技能ID
          level: skillData.技能等级,           // 技能等级
          duration: skillData.持续时间,        // 技能持续时间（秒）
          totalTime: skillData.持续时间,        // 技能持续时间（秒）
          elapsedTime: 0,     // 已流逝时间（用于判断结束）
          isFinished: false,    // 技能是否结束
          frameDamage: 0,     // 每帧伤害
          totalDamage: skillData.总伤,     // 每帧伤害
          angler: skillData.angler,     // 每帧伤害
      }
      let pullParams: XGDY_SkillPullParams = {
          skillId: XGDY_SkillId.AI通用技能,       // 技能ID
          level: skillData.技能等级,           // 技能等级
          duration: skillData.持续时间,        // 技能持续时间（秒）
          elapsedTime: 0,     // 已流逝时间（用于判断结束）
          isFinished: false,    // 技能是否结束
          framePull: 0,
          framePull2: skillData.拉力,     // 每帧拉拔力
      }
      this.applySkill(params, pullParams)

    }



  
  /**
   * 给鱼施加技能（外部调用，如玩家释放技能时）
   * @param skillDamageParams 技能参数（包含等级、持续时间等）
   */
  public applySkill(skillDamageParams: XGDY_SkillDamageParams, skillPullParams: XGDY_SkillPullParams) {
    XGDY_DataManager.Instance.dynamicData.isUpdateSkillEffect = true;
    // 1. 获取该技能对应的更新算法
    const updateDamage = this.getSkillUpdateDamage(skillDamageParams.skillId);
    if (!updateDamage) return;

    const updatePull = this.getSkillUpdatePull(skillDamageParams.skillId);
    if (!updatePull) return;

    // 2. 初始化参数（确保基础字段正确）
    skillDamageParams.elapsedTime = 0;
    skillDamageParams.isFinished = false;
    skillDamageParams.frameDamage = 0;

    // 3. 将算法和参数加入列表
    this.skillAlgorithms.push({
      updateDamage: updateDamage,
      updatePull: updatePull,
      damageParams: skillDamageParams,
      pullParams: skillPullParams
    });

    console.log(`技能${skillDamageParams.skillId}（等级${skillDamageParams.level}）已施加到鱼身上`);
  }

  removeSkill(skillId: XGDY_SkillId){
    this.skillAlgorithms = this.skillAlgorithms.filter(item => item.damageParams.skillId !== skillId);
  }

  /**
   * 鱼的扣血逻辑
   * @param damage 当帧扣血量
   */
  private damage(damage: number) {

    //绝境气息生效
    if(XGDY_DataManager.Instance.dynamicData.isUsingDesperateBreath){
      console.log(`绝境气息生效，伤害增加30%`);
        damage = damage * 1.3;
    }

    XGDY_DataManager.Instance.dynamicData.currentFishHp  = Math.max(0, XGDY_DataManager.Instance.dynamicData.currentFishHp - damage);
    console.log(`鱼扣血${damage}，当前血量：${XGDY_DataManager.Instance.dynamicData.currentFishHp}/${XGDY_DataManager.Instance.dynamicData.fishMaxHp}`);

    XGDY_DataManager.Instance.dynamicData.currentFishBleed = damage;
    EventManager.Scene.emit(XGDY_GameEvents.Fish_Bleeding);
    EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Hp);
    
    // 血量为0的逻辑（如鱼死亡、钓鱼成功等）
    if (XGDY_DataManager.Instance.dynamicData.currentFishHp <= 0) {
        // this.stopPullLine();
        this.onFishDie();
    }
  }

  private pullLine(pull: number) {
    XGDY_DataManager.Instance.dynamicData.currentPullForce = pull;
    let newFishPull = XGDY_DataManager.Instance.dynamicData.currentFishData.力气 + XGDY_DataManager.Instance.dynamicData.reversePullForce;
    console.log(`鱼拉线${pull}，当前拉力：${XGDY_DataManager.Instance.dynamicData.currentPullForce},鱼拉力：${newFishPull}`);
  }

  /**
   * 鱼死亡逻辑
   */
  private onFishDie() {
    console.log("鱼已死亡，钓鱼成功！");

    //阴鱼
    if(XGDY_DataManager.Instance.dynamicData.currentFishId == XGDY_Constant.MAP_7_SpecialFishFirstId &&
       XGDY_DataManager.Instance.dynamicData.SpecialFishCurrentId !==XGDY_Constant.MAP_7_SpecialFishList[XGDY_Constant.MAP_7_SpecialFishList.length-1]  ){
      EventManager.Scene.emit(XGDY_GameEvents.Checkout_Next_FishId);
      return;
    }

    if(XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_1_Challengeing && 
      XGDY_DataManager.Instance.dynamicData.Map103_challenge_1_Count < (XGDY_DataManager.Instance.dynamicData.Map103_Challenge_1_TargetFishCount-1)){
      XGDY_DataManager.Instance.catchFish( XGDY_DataManager.Instance.dynamicData.currentFishId);
      EventManager.Scene.emit(XGDY_GameEvents.Reset_Fish);
      return;
    }
    XGDY_DataManager.Instance.dynamicData.isStopInteract = true;
    XGDY_AudioManager.getInstance().playMusic("bgm");

    // 清空所有技能算法
    this.skillAlgorithms = [];
    XGDY_DataManager.Instance.dynamicData.currentSpeed = 0;
    XGDY_DataManager.Instance.reelInFish();

    // 后续逻辑：播放死亡动画、结算奖励等
  }

  /**
   * 获取鱼当前血量（供外部查询）
   */
  public getCurrentHp() {
    return XGDY_DataManager.Instance.dynamicData.currentFishHp;
  }

  

  update(deltaTime: number) {
    if(!XGDY_DataManager.Instance.dynamicData.isUpdateSkillEffect)return;
    // 遍历伤害算法列表，计算并结算伤害
    this.calculateAllSkillDamage(deltaTime);
    // 遍历拉力算法列表，计算并结算拉力
    this.calculateAllSkillPull(deltaTime);

    // 移除已结束的技能算法
    this.removeFinishedAlgorithms();
  }

   

  /**
   * 遍历所有生效技能，计算当帧伤害并扣血
   */
  private calculateAllSkillDamage(deltaTime: number) {
    let totalFrameDamage = 0;
    // 遍历副本（避免遍历中修改原数组）
    const algorithmsCopy = [...this.skillAlgorithms];
    
    for (const item of algorithmsCopy) {
      // 调用技能的update算法，更新参数
      item.updateDamage(deltaTime, item.damageParams);
      // 累加当帧伤害（兼容所有技能参数的frameDamage字段）
      totalFrameDamage += (item.damageParams.frameDamage || 0);
    }

    // 统一扣血（避免多次调用damage）
    if (totalFrameDamage > 0) {
      this.damage(totalFrameDamage);
    }
  }

  /**
   * 遍历所有生效技能，计算当帧拉力并更新
   */
  private calculateAllSkillPull(deltaTime: number) {
    let totalFramePull = 0;
    // 遍历副本（避免遍历中修改原数组）
    const algorithmsCopy = [...this.skillAlgorithms];
    
    if(algorithmsCopy.length === 0){
       this.pullLine(0);
       return;
    }
    for (const item of algorithmsCopy) {
      // 调用技能的update算法，更新参数
      item.updatePull(deltaTime, item.pullParams);
      // 累加当帧拉力（兼容所有技能参数的framePull字段）
      totalFramePull += (item.pullParams.framePull || 0);
    }

    // 统一更新拉力（避免多次调用updatePull）
    if (totalFramePull !== 0) {
      this.pullLine(totalFramePull);
    }
  }

  /**
   * 移除已结束的技能算法
   */
  private removeFinishedAlgorithms() {
    this.skillAlgorithms = this.skillAlgorithms.filter(item => {
      const isFinished = item.damageParams.isFinished;
      if (isFinished) {
        console.log(`技能${item.damageParams.skillId}已结束，从鱼的伤害列表中移除`);
      }
      return !isFinished;
    });
    if(this.skillAlgorithms.length === 0){
       this.pullLine(0);
       XGDY_DataManager.Instance.dynamicData.isUpdateSkillEffect = false;
    }
  }

  /**
   * 根据技能ID获取对应的更新算法
   */
  getSkillUpdateDamage(skillId: XGDY_SkillId) {
    switch (skillId) {
        case XGDY_SkillId.正常扣血:
            return this.getSkill_Normal_UpdateDamage();
        case XGDY_SkillId.通用技能:
              return this.getSkill_Common_UpdateDamage();
        case XGDY_SkillId.AI正常扣血:
            return this.getSkill_AI_Normal_UpdateDamage();
        case XGDY_SkillId.AI通用技能:
              return this.getSkill_Common_UpdateDamage();
        default:
            console.error(`未找到技能${skillId}的更新算法`);
            return () => {};
    }
  }

    /**
   * 根据技能ID获取对应的更新算法
   */
  getSkillUpdatePull(skillId: XGDY_SkillId) {
    switch (skillId) {
        case XGDY_SkillId.正常扣血:
            return this.getSkill_Normal_UpdatePull();
        case XGDY_SkillId.通用技能:
            return this.getSkill_Common_UpdatePull();
        case XGDY_SkillId.AI正常扣血:
            return this.getSkill_AI_Normal_UpdatePull();
        case XGDY_SkillId.AI通用技能:
            return this.getSkill_AI_Common_UpdatePull();
        default:
            console.error(`未找到技能${skillId}的更新算法`);
            return () => {};
    }
  }
  

  getSkill_Normal_UpdateDamage(){
        return (deltaTime: number, params: XGDY_Skill_Normal_DamageParams) => {
            // 1. 更新已流逝时间
            params.elapsedTime += deltaTime;
            
            // 2. 判断是否结束
            if (params.elapsedTime >= 0.25) {
                params.elapsedTime = params.elapsedTime -0.25; 
                XGDY_DataManager.Instance.setCurrentRodData();
                let specialItemAddCount = 0;
                if(XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.烤鲲肉]){
                    specialItemAddCount = XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.烤鲲肉]*0.02;
                }
               
                params.frameDamage = (XGDY_DataManager.Instance.dynamicData.currentRodPerSec /4) * (1 + specialItemAddCount);
                //  console.log("秒伤增幅",specialItemAddCount,"  原秒伤：",XGDY_DataManager.Instance.dynamicData.currentRodPerSec/4,"  现秒伤：",params.frameDamage);
            }
            else{
                params.frameDamage = 0;
            }
        };
  }

  getSkill_Normal_UpdatePull(){
        return (deltaTime: number, params: XGDY_Skill_Normal_PullParams) => {
            // 1. 更新已流逝时间
            // params.elapsedTime += deltaTime;
            // params.framePull = XGDY_DataManager.Instance.dynamicData.currentRodPerSec/4;
            
            // 2. 判断是否结束
            // if (params.elapsedTime >= 0.25) {
            //     params.elapsedTime = params.elapsedTime -0.25; 
                // params.framePull = XGDY_DataManager.Instance.dynamicData.currentRodPerSec/4;
                let angleTotalForce = 0;
                XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.forEach(anglerId => {
                  const level = XGDY_DataManager.Instance.saveData.anglerData[anglerId].level;
                  const anglerJsonData = XGDY_DataManager.Instance.getItemDataById(anglerId) as XGDY_AnglerJsonData;
                  const pullForce = anglerJsonData.等级配置["1"].拉力+level*2;
                  angleTotalForce += pullForce;
                })
                
                const fishRodJsonData = XGDY_DataManager.Instance.dynamicData.currentRodData;
                const fishRodPullForce = fishRodJsonData.拉力 * XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.length;

                params.framePull = angleTotalForce + fishRodPullForce;

                // let 
            // }
            // else{
            //     params.framePull = 0;
            // }
        };
  }

  getSkill_Common_UpdateDamage(){
      return (deltaTime: number, params: XGDY_Skill_Common_DamageParams) => {
          // 1. 更新已流逝时间
          params.elapsedTime += deltaTime;
          if(params.duration <= 0){
            params.isFinished = true;
            
            params.angler
            return;
          }
          
          // 2. 判断是否结束
          if (params.elapsedTime >= 0.25) {
              params.elapsedTime = params.elapsedTime -0.25; 
              params.duration = params.duration -0.25;
              params.frameDamage = params.totalDamage/4/params.totalTime;

          }
          else{
              params.frameDamage = 0;
          }
      };
  }

  getSkill_Common_UpdatePull(){
      return (deltaTime: number, params: XGDY_Skill_Common_PullParams) => {
         let angleTotalForce = 0;
                XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.forEach(anglerId => {
                  const level = XGDY_DataManager.Instance.saveData.anglerData[anglerId].level;
                  const anglerJsonData = XGDY_DataManager.Instance.getItemDataById(anglerId) as XGDY_AnglerJsonData;
                  const pullForce = anglerJsonData.等级配置["1"].拉力+level*2;
                  angleTotalForce += pullForce;
                })
                
                const fishRodJsonData = XGDY_DataManager.Instance.dynamicData.currentRodData;
                const fishRodPullForce = fishRodJsonData.拉力 * XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.length;
            params.framePull = params.framePull2 +150;
    };
  }



  getSkill_AI_Normal_UpdateDamage(){
        return (deltaTime: number, params: XGDY_Skill_Normal_DamageParams) => {
            // 1. 更新已流逝时间
            params.elapsedTime += deltaTime;
            
            // 2. 判断是否结束
            if (params.elapsedTime >= 0.25) {
                params.elapsedTime = params.elapsedTime -0.25; 
                XGDY_DataManager.Instance.setCurrentRodData();
                let specialItemAddCount = 0;
                if(XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.烤鲲肉]){
                    specialItemAddCount = XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.烤鲲肉]*0.02;
                }
               
                params.frameDamage = (XGDY_DataManager.Instance.dynamicData.currentRodPerSec /4) * (1 + specialItemAddCount);
            }
            else{
                params.frameDamage = 0;
            }
        };
  }

  
  getSkill_AI_Normal_UpdatePull(){
      return (deltaTime: number, params: XGDY_Skill_Normal_PullParams) => {
        let angleTotalForce = 0;
        XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.forEach(anglerId => {
          const level = XGDY_DataManager.Instance.saveData.anglerData[anglerId].level;
          const anglerJsonData = XGDY_DataManager.Instance.getItemDataById(anglerId) as XGDY_AnglerJsonData;
          const pullForce = anglerJsonData.等级配置["1"].拉力+level*2;
          angleTotalForce += pullForce;
        })
        
        const fishRodJsonData = XGDY_DataManager.Instance.dynamicData.currentRodData;
        const fishRodPullForce = fishRodJsonData.拉力 * XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.length;

        params.framePull = -(angleTotalForce + fishRodPullForce);
      };
  }

   getSkill_AICommon_UpdateDamage(){
      return (deltaTime: number, params: XGDY_Skill_Common_DamageParams) => {
          // 1. 更新已流逝时间
          params.elapsedTime += deltaTime;
          if(params.duration <= 0){
            params.isFinished = true;
            
            params.angler
            return;
          }
          
          // 2. 判断是否结束
          if (params.elapsedTime >= 0.25) {
              params.elapsedTime = params.elapsedTime -0.25; 
              params.duration = params.duration -0.25;
              params.frameDamage = params.totalDamage/4/params.totalTime;

          }
          else{
              params.frameDamage = 0;
          }
      };
  }


  
  getSkill_AI_Common_UpdatePull(){
      return (deltaTime: number, params: XGDY_Skill_Common_PullParams) => {
         let angleTotalForce = 0;
                XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.forEach(anglerId => {
                  const level = XGDY_DataManager.Instance.saveData.anglerData[anglerId].level;
                  const anglerJsonData = XGDY_DataManager.Instance.getItemDataById(anglerId) as XGDY_AnglerJsonData;
                  const pullForce = anglerJsonData.等级配置["1"].拉力+level*2;
                  angleTotalForce += pullForce;
                })
                
                const fishRodJsonData = XGDY_DataManager.Instance.dynamicData.currentRodData;
                const fishRodPullForce = fishRodJsonData.拉力 * XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.length;
            params.framePull = -(params.framePull2 +150);
    };
  }



    /**
   * 获取中毒技能的更新算法
   */
  getSkill_0_0_UpdateDamage() {
    return (deltaTime: number, params: XGDY_Skill_0_0_DamageParams) => {
      // 1. 更新已流逝时间
      params.elapsedTime += deltaTime;
      
      // 2. 判断是否结束
      if (params.elapsedTime >= params.duration) {
        params.isFinished = true;
        return;
      }

      // 3. 计算当帧伤害（每秒伤害 * 帧时间）
      const frameDamage = params.baseDamagePerSec * deltaTime;
      // 4. 标记参数（供鱼的逻辑调用扣血）
      params.frameDamage = frameDamage;
    };
  }
  
  
  getSkill_0_0_UpdatePull(){
        return (deltaTime: number, params: XGDY_Skill_Normal_PullParams) => {
            // 1. 更新已流逝时间
            // 2. 更新已流逝时间
                params.elapsedTime += deltaTime;
                
                // 3. 判断是否结束
                if (params.elapsedTime >= params.duration) {
                  params.isFinished = true;
                  params.frameDamage = 0;
                  return;
                }
        };
  }


  /**
   * 获取电击技能的更新算法
   */
  getSkill_0_1_UpdateDamage() {
    return (deltaTime: number, params: XGDY_Skill_0_1_DamageParams) => {
      // 1. 首次触发先结算瞬间伤害（仅触发一次）
      if (params.elapsedTime === 0) {
        params.frameDamage = params.instantDamage;
        params.lastTickTime = 0;
        params.elapsedTime += deltaTime;
        return;
      }

      // 2. 更新已流逝时间
      params.elapsedTime += deltaTime;
      
      // 3. 判断是否结束
      if (params.elapsedTime >= params.duration) {
        params.isFinished = true;
        params.frameDamage = 0;
        return;
      }

      // 4. 按间隔结算电击伤害
      params.lastTickTime += deltaTime;
      if (params.lastTickTime >= params.tickInterval) {
        params.frameDamage = params.tickDamage;
        params.lastTickTime -= params.tickInterval; // 重置间隔计时
      } else {
        params.frameDamage = 0; // 非间隔期无伤害
      }
    };
  }

    
  getSkill_0_1_UpdatePull(){
        return (deltaTime: number, params: XGDY_Skill_Normal_PullParams) => {
            // // 1. 更新已流逝时间
            // params.elapsedTime += deltaTime;
            
            // // 2. 判断是否结束
            // if (params.elapsedTime >= 0.25) {
            //     params.elapsedTime = params.elapsedTime -0.25; 
            //     params.frameDamage = XGDY_DataManager.Instance.dynamicData.currentRodPerSec/4;
            // }
            // else{
            //     params.frameDamage = 0;
            // }
             params.framePull = 10000;
        };
  }

  /**
   * 获取流血技能的更新算法
   */
  getSkill_0_2_UpdateDamage() {
    return (deltaTime: number, params: XGDY_Skill_0_2_DamageParams) => {
      // 1. 更新已流逝时间
      params.elapsedTime += deltaTime;
      
      // 2. 判断是否结束
      if (params.elapsedTime >= params.duration) {
        params.isFinished = true;
        params.frameDamage = 0;
        return;
      }

      // 3. 计算递增伤害（初始伤害 + 增长值 * 已流逝时间）
      const currentPerSecDamage = params.initialDamage + params.damageGrowth * params.elapsedTime;
      params.frameDamage = currentPerSecDamage * deltaTime;
    };
  }

  getSkill_0_2_UpdatePull(){
        return (deltaTime: number, params: XGDY_Skill_Normal_PullParams) => {
            // 1. 更新已流逝时间
            params.elapsedTime += deltaTime;
            
            // 2. 判断是否结束
            if (params.elapsedTime >= 0.25) {
                params.elapsedTime = params.elapsedTime -0.25; 
                params.frameDamage = XGDY_DataManager.Instance.dynamicData.currentRodPerSec/4;
            }
            else{
                params.frameDamage = 0;
            }
        };
  }

  /**
   * 获取冰冻技能的更新算法
   */
  getSkill_0_3_UpdateDamage() {
    return (deltaTime: number, params: XGDY_Skill_0_3_DamageParams) => {
      // 1. 更新已流逝时间
      params.elapsedTime += deltaTime;
      
      // 2. 判断是否结束
      if (params.elapsedTime >= params.duration) {
        params.isFinished = true;
        params.frameDamage = 0;
        return;
      }

      // 3. 结算持续伤害
      params.frameDamage = params.damagePerSec * deltaTime;
    };
  }

  getSkill_0_3_UpdatePull(){
        return (deltaTime: number, params: XGDY_Skill_Normal_PullParams) => {
            // 1. 更新已流逝时间
            params.elapsedTime += deltaTime;
            
            // 2. 判断是否结束
            if (params.elapsedTime >= 0.25) {
                params.elapsedTime = params.elapsedTime -0.25; 
                params.frameDamage = XGDY_DataManager.Instance.dynamicData.currentRodPerSec/4;
            }
            else{
                params.frameDamage = 0;
            }
        };
  }


  addListener(){
    EventManager.on(XGDY_GameEvents.StopPullLine, this.stopPullLine, this);
      EventManager.on(XGDY_GameEvents.Clear_Skill, this.clearSkill, this);
      EventManager.on(XGDY_GameEvents.Ban_Skill, this.banSkill, this);
  }

  removeListener(){
    EventManager.off(XGDY_GameEvents.StopPullLine, this.stopPullLine, this);
      EventManager.off(XGDY_GameEvents.Clear_Skill, this.clearSkill, this);
      EventManager.off(XGDY_GameEvents.Ban_Skill, this.banSkill, this);

  }

  protected onDestroy(): void {
      this.removeListener();
  }


}