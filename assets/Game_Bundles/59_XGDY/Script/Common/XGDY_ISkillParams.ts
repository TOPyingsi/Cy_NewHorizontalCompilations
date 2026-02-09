// 技能ID枚举（扩展时新增技能类型）
export enum XGDY_SkillId {
  正常扣血 = "正常扣血",
  通用技能 = "通用技能",
  AI正常扣血 = "AI正常扣血",
  AI通用技能 = "AI通用技能"
}



// 技能参数基类（所有技能参数继承此接口）
export interface XGDY_SkillDamageParams {
  skillId: XGDY_SkillId;        // 技能ID
  level: number;           // 技能等级
  duration: number;        // 技能持续时间（秒）
  elapsedTime: number;     // 已流逝时间（用于判断结束）
  isFinished: boolean;     // 技能是否结束
  frameDamage: number;     // 每帧伤害
  [key: string]: any;      // 扩展字段（各技能自定义参数）
}

// 技能参数基类（所有技能参数继承此接口）
export interface XGDY_SkillPullParams {
  skillId: XGDY_SkillId;        // 技能ID
  level: number;           // 技能等级
  duration: number;        // 技能持续时间（秒）
  elapsedTime: number;     // 已流逝时间（用于判断结束）
  isFinished: boolean;     // 技能是否结束
  framePull: number;     // 每帧拉拔力
  [key: string]: any;      // 扩展字段（各技能自定义参数）
}



//  普通技能伤害参数
export interface XGDY_Skill_Normal_DamageParams extends XGDY_SkillDamageParams {

}

//  普通技能拉力参数
export interface XGDY_Skill_Normal_PullParams extends XGDY_SkillPullParams {

}

//  通用技能伤害参数
export interface XGDY_Skill_Common_DamageParams extends XGDY_SkillDamageParams {
  totalDamage: number;     // 总伤害
  totalTime: number;       // 总时间（秒）
  angler: string;       // 总时间（秒）
}
export interface XGDY_Skill_Common_PullParams extends XGDY_SkillPullParams {
  framePull2: number;     // 每帧拉拔力2
}

// 中毒技能参数
export interface XGDY_Skill_0_0_DamageParams extends XGDY_SkillDamageParams {
  baseDamagePerSec: number; // 每秒基础伤害
}
// 中毒技能参数
export interface XGDY_Skill_0_0_PullParams extends XGDY_SkillPullParams {
//   baseDamagePerSec: number; // 每秒基础伤害
}


// 电击技能参数
export interface XGDY_Skill_0_1_DamageParams extends XGDY_SkillDamageParams {
  instantDamage: number;    // 瞬间伤害
  tickDamage: number;       // 每0.5秒电击伤害
  tickInterval: number;     // 电击间隔（秒）
  lastTickTime: number;     // 上一次电击时间
}

// 电击技能参数
export interface XGDY_Skill_0_1_PullParams extends XGDY_SkillPullParams {
//   baseDamagePerSec: number; // 每秒基础伤害
}



// 流血技能参数
export interface XGDY_Skill_0_2_DamageParams extends XGDY_SkillDamageParams {
  initialDamage: number;    // 初始每秒伤害
  damageGrowth: number;     // 每秒伤害增长值
}

// 流血技能参数
export interface XGDY_Skill_0_2_PullParams extends XGDY_SkillPullParams {
//   initialDamage: number;    // 初始每秒伤害
//   damageGrowth: number;     // 每秒伤害增长值
}


// 冰冻技能参数
export interface XGDY_Skill_0_3_DamageParams extends XGDY_SkillDamageParams {
  damagePerSec: number;     // 每秒冰冻伤害
  slowRatio: number;        // 减速比例（0-1）
}

// 冰冻技能参数
export interface XGDY_Skill_0_3_PullParams extends XGDY_SkillPullParams {
//   damagePerSec: number;     // 每秒冰冻伤害
//   slowRatio: number;        // 减速比例（0-1）
}

// 鱼身上的伤害算法项（算法+参数）
export interface XGDY_SkillUpdateItem {
  updateDamage: (deltaTime: number, params: XGDY_SkillDamageParams) => void; // 伤害更新算法
  updatePull: (deltaTime: number, params: XGDY_SkillPullParams) => void; // 拉力更新算法
  damageParams: XGDY_SkillDamageParams;                                      // 对应技能参数
  pullParams: XGDY_SkillPullParams;                                      // 对应技能参数
}