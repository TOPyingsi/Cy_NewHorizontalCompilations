import { _decorator, Component } from "cc";
const { ccclass, property } = _decorator;

@ccclass("TLWLSJ_Constant")
export class TLWLSJ_Constant extends Component {
  static TLWLSJ_Group = {
    DEFAULT: 1 << 0,
    MAP: 1 << 1,
    PLAYER: 1 << 2,
    WEAPON: 1 << 3,
    ENEMY: 1 << 4,
    PLAYERBULLET: 1 << 5,
    EXPLOSION: 1 << 6,
    RANGE: 1 << 7,
    ENEMYBULLET: 1 << 8,
    SHIELD: 1 << 9,
  };

  //界面优先级
  static PRIORITY = {
    NORMAL: 10, //普通界面
    DIALOG: 100, //弹窗的Z序
    REWARD: 200, //奖励的弹窗
    LOADING: 300, //加载界面
    TIPS: 400, //提示
  };

  static Key = {
    AgreePolicy: "AgreePolicy",
    Music: "Music",
    SFX: "SFX",
    Vibration: "Vibration",
    Lv: "Lv",
    Money: "Money",
    EquipedIndexs: "EquipedIndexs",
  };
}


export enum TLWLSJ_ITEM {
  WEAPON,
  MAGAZINE,
  BULLET,
}

/**
 * 武器
 */
export enum TLWLSJ_WEAPON {
  签字笔,
  刻度尺,
  游标卡尺,
  自动手枪,
  MK18玩具枪,
  左轮手枪,
  MP43散弹枪,
  Saiga12K散弹枪,
  AK102突击步枪,
  MK18突击步枪,
  榴弹发射器,
  光束枪,
  伽马射线枪,
  电磁炮,
  阴极射线管,

  破片手雷,
  高爆手雷,
}

/**
 * 武器类型
 */
export enum TLWLSJ_WEAPONTYPE {
  MELEE,
  RANGED,
}

/**
 * 武器容量
 */
export enum TLWLSJ_CAPACITY {
  自动手枪 = 50,
  MK18玩具枪 = 200,
  Saiga12K散弹枪 = 10,
  AK102突击步枪 = 30,
  MK18突击步枪 = 30,

  左轮手枪 = 10,
  MP43散弹枪 = 15,
  榴弹发射器 = 5,

  光束枪 = 80,
  伽马射线枪 = 30,
  电磁炮 = 15,
  阴极射线管 = 120,

  破片手雷 = 999,
  高爆手雷 = 999,
}

/**
 * 子弹类型
 */
export enum TLWLSJ_BULLET {
  //自动手枪
  软铅弹头9x19mm,
  全金属被甲弹9x19mm,
  被甲空尖弹9x19mm,
  钢芯穿甲弹9x19mm,
  钢芯曳光弹9x19mm,
  破片空尖弹9x19mm,
  钨芯穿甲弹9x19mm,

  //左轮手枪
  全金属被甲弹44mag,
  被甲空尖弹44mag,
  破片空尖弹44mag,
  复合穿甲弹44mag,

  //突击步枪
  全金属被甲弹56mm,
  被甲空尖弹56mm,
  破片空尖弹56mm,
  钢芯穿甲弹56mm,
  钢芯曳光弹56mm,
  钨芯穿甲弹56mm,

  //散弹枪
  玻璃弹12GA,
  鸟弹12GA,
  独头弹12GA,
  鹿弹12GA,
  大号鹿弹12GA,
  箭形弹12GA,
  巨齿鲨12GA,
  AP20独头弹12GA,
  曳光弹12GA,
  龙息弹12GA,

  //榴弹发射器
  高爆榴弹40mm,
  动能穿甲弹40mm,

  //Mk18
  标准水弹8mm,
  加硬乳白弹8mm,
  磨砂弹8mm,
  反装甲塑料弹8mm,

  破片手雷,
  高爆手雷,

  光束枪子弹,
  电磁炮子弹,
  伽马射线枪子弹,
  阴极射线管子弹,
}

/**
 * 商店Item类型
 */
export enum TLWLSJ_SHOPITEM {
  AMMO,
  WEAPON,
  PROPS,
  NONE,
}

export enum TLWLSJ_MAXPROPERTY {
  HARM = 240,
  AP = 100,
}

export enum PROPS {
  药丸,
  参考答案,
  咖啡,
}

/**
 * 武器展示中 子弹的三种模式
 */
export enum TLWLSJ_WEAPONSHOW {
  NON,
  INSTANT,
  FILL,
}

/**
 * 武器展示中 子弹的三种模式
 */
export enum TLWLSJ_WEAPONSWITCH {
  NON,
  LAST,
  NEXT,
}

export enum TLWLSJ_BULLETNAME {
  GSQ = "光束枪子弹",
  DCP = "电磁炮子弹",
}

/**
 * 敌人名称
 */
export enum TLWLSJ_ENEMYNAME {
  反派_小怪1,
  反派_小怪2,
  反派_小怪3,
  反派_小怪4,
  反派_刻度尺,
  反派_刻度尺_盾牌,
  反派_刻度尺_重装盾牌,
  反派_游标卡尺,
  反派_游标卡尺_盾牌,
  反派_游标卡尺_重装盾牌,
  反派_M4A1,
  反派_M4A1_盾牌,
  反派_M4A1_重装盾牌,
  反派_自动手枪,
  反派_自动手枪_盾牌,
  反派_自动手枪_重装盾牌,
  反派_左轮_女,
  反派_M4A1_女,
  分割,
}

/**
 * 敌人名称
 */
export enum TLWLSJ_ENEMYHARM {
  反派_小怪1,
  反派_小怪2,
  反派_小怪3,
  反派_小怪4,
  反派_刻度尺,
  反派_刻度尺_盾牌,
  反派_刻度尺_重装盾牌,
  反派_游标卡尺,
  反派_游标卡尺_盾牌,
  反派_游标卡尺_重装盾牌,
  反派_M4A1,
  反派_M4A1_盾牌,
  反派_M4A1_重装盾牌,
  反派_自动手枪,
  反派_自动手枪_盾牌,
  反派_自动手枪_重装盾牌,
  反派_左轮_女,
  反派_M4A1_女,
  分割,
}

/**
 * 游戏进入的等待场景
 */
export enum TLWLSJ_MAP {
  MAP1,
  MAP2,
  MAP3,
  MAP4,
}

/**
 * 等待场景开始游戏对应的场景名称
 */
export const TLWLSJ_GameMapName: string[] = ["", "Game1", "Game2", "Game3"];


/**
 * 武器弹匣
 */
export const TLWLSJ_WEAPONBULLET = {
  "自动手枪": "软铅弹头9x19mm",
  "MK18玩具枪": "标准水弹8mm",
  "Saiga12K散弹枪": "独头弹12GA",
  "AK102突击步枪": "全金属被甲弹56mm",
  "MK18突击步枪": "全金属被甲弹56mm",
  "光束枪": "光束枪子弹",
  "伽马射线枪": "伽马射线枪子弹",
  "电磁炮": "电磁炮子弹",
  "阴极射线管": "阴极射线管子弹",
  "左轮手枪": "全金属被甲弹44mag",
  "MP43散弹枪": "独头弹12GA",
  "榴弹发射器": "高爆榴弹40mm",
  // 破片手雷,
  // 高爆手雷,
}

/**
 * 游戏进入的等待场景
 */
export enum TLWLSJ_UITYPE {
  商店,
  背包,
  武器,
  药物,
}

