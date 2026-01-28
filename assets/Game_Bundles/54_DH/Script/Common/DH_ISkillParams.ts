// 技能ID枚举（扩展时新增技能类型）
export enum DH_SkillId {
  正常扣血 = "正常扣血",
  飞天无极钓 = "技能_0_0",    // 中毒（持续掉血）
  杆门关 = "技能_0_1",  // 电击（瞬间高伤+持续麻痹掉血）
  杆门开 = "技能_0_2",     // 流血（随时间递增掉血）
  杆门断 = "技能_0_3",     // 冰冻（减速+持续少量掉血）
  通用技能 = "通用技能"
}



// 技能参数基类（所有技能参数继承此接口）
export interface DH_SkillDamageParams {
  skillId: DH_SkillId;        // 技能ID
  level: number;           // 技能等级
  duration: number;        // 技能持续时间（秒）
  elapsedTime: number;     // 已流逝时间（用于判断结束）
  isFinished: boolean;     // 技能是否结束
  frameDamage: number;     // 每帧伤害
  [key: string]: any;      // 扩展字段（各技能自定义参数）
}

// 技能参数基类（所有技能参数继承此接口）
export interface DH_SkillPullParams {
  skillId: DH_SkillId;        // 技能ID
  level: number;           // 技能等级
  duration: number;        // 技能持续时间（秒）
  elapsedTime: number;     // 已流逝时间（用于判断结束）
  isFinished: boolean;     // 技能是否结束
  framePull: number;     // 每帧拉拔力
  [key: string]: any;      // 扩展字段（各技能自定义参数）
}



//  普通技能伤害参数
export interface DH_Skill_Normal_DamageParams extends DH_SkillDamageParams {

}

//  普通技能拉力参数
export interface DH_Skill_Normal_PullParams extends DH_SkillPullParams {

}

//  通用技能伤害参数
export interface DH_Skill_Common_DamageParams extends DH_SkillDamageParams {
  totalDamage: number;     // 总伤害
  totalTime: number;       // 总时间（秒）
  angler: string;       // 总时间（秒）
}
export interface DH_Skill_Common_PullParams extends DH_SkillPullParams {
  framePull2: number;     // 每帧拉拔力2
}

// 中毒技能参数
export interface DH_Skill_0_0_DamageParams extends DH_SkillDamageParams {
  baseDamagePerSec: number; // 每秒基础伤害
}
// 中毒技能参数
export interface DH_Skill_0_0_PullParams extends DH_SkillPullParams {
//   baseDamagePerSec: number; // 每秒基础伤害
}


// 电击技能参数
export interface DH_Skill_0_1_DamageParams extends DH_SkillDamageParams {
  instantDamage: number;    // 瞬间伤害
  tickDamage: number;       // 每0.5秒电击伤害
  tickInterval: number;     // 电击间隔（秒）
  lastTickTime: number;     // 上一次电击时间
}

// 电击技能参数
export interface DH_Skill_0_1_PullParams extends DH_SkillPullParams {
//   baseDamagePerSec: number; // 每秒基础伤害
}



// 流血技能参数
export interface DH_Skill_0_2_DamageParams extends DH_SkillDamageParams {
  initialDamage: number;    // 初始每秒伤害
  damageGrowth: number;     // 每秒伤害增长值
}

// 流血技能参数
export interface DH_Skill_0_2_PullParams extends DH_SkillPullParams {
//   initialDamage: number;    // 初始每秒伤害
//   damageGrowth: number;     // 每秒伤害增长值
}


// 冰冻技能参数
export interface DH_Skill_0_3_DamageParams extends DH_SkillDamageParams {
  damagePerSec: number;     // 每秒冰冻伤害
  slowRatio: number;        // 减速比例（0-1）
}

// 冰冻技能参数
export interface DH_Skill_0_3_PullParams extends DH_SkillPullParams {
//   damagePerSec: number;     // 每秒冰冻伤害
//   slowRatio: number;        // 减速比例（0-1）
}

// 鱼身上的伤害算法项（算法+参数）
export interface DH_SkillUpdateItem {
  updateDamage: (deltaTime: number, params: DH_SkillDamageParams) => void; // 伤害更新算法
  updatePull: (deltaTime: number, params: DH_SkillPullParams) => void; // 拉力更新算法
  damageParams: DH_SkillDamageParams;                                      // 对应技能参数
  pullParams: DH_SkillPullParams;                                      // 对应技能参数
}