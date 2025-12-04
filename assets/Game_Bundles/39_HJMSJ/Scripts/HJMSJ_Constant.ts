import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Constant')
export class HJMSJ_Constant {
    public static PropData: { Name: string, type: string, describe: string }[] = [
        //武器
        { Name: '木剑', type: '武器', describe: '木剑\n锋利V' },
        { Name: '铁剑', type: '武器', describe: '铁剑\n锋利V' },
        { Name: '金剑', type: '武器', describe: '铁剑\n锋利V' },
        { Name: '钻石剑', type: '武器', describe: '钻石剑\n锋利V' },
        { Name: '铁镐', type: '武器', describe: '钻石镐\n+攻击伤害' },
        { Name: '金镐', type: '武器', describe: '钻石镐\n+攻击伤害' },
        { Name: '钻石镐', type: '武器', describe: '钻石镐\n+攻击伤害' },

        //防具
        { Name: '铁甲', type: '防具', describe: '铁甲' },
        { Name: '铁头盔', type: '防具', describe: '铁头盔' },
        { Name: '铁裤子', type: '防具', describe: '铁裤子' },
        { Name: '铁靴子', type: '防具', describe: '铁靴子' },
        { Name: '金头盔', type: '防具', describe: '金头盔' },
        { Name: '金甲', type: '防具', describe: '金甲' },
        { Name: '金裤子', type: '防具', describe: '金裤子' },
        { Name: '金靴子', type: '防具', describe: '金靴子' },
        { Name: '钻石甲', type: '防具', describe: '钻石甲' },
        { Name: '钻石头盔', type: '防具', describe: '钻石头盔' },
        { Name: '钻石裤子', type: '防具', describe: '钻石裤子' },
        { Name: '钻石靴子', type: '防具', describe: '钻石靴子' },


        //方块
        { Name: '钻石矿', type: '方块', describe: '钻石矿' },
        { Name: '橡木原木', type: '方块', describe: '橡木原木' },
        { Name: '橡木木板', type: '方块', describe: '橡木木板' },
        { Name: '橡木木板-块', type: '方块', describe: '橡木木板-块' },
        { Name: '圆石', type: '方块', describe: '圆石' },
        { Name: '虞美人', type: '方块', describe: '虞美人' },
        { Name: '玫瑰丛', type: '方块', describe: '玫瑰丛' },
        { Name: '工作台', type: '方块', describe: '工作台' },

        //道具
        { Name: '腐肉', type: '道具', describe: '腐肉' },
        { Name: '破损的盾牌(下)', type: '道具', describe: '破损的盾牌(下)' },
        { Name: '钻石', type: '道具', describe: '钻石' },
        { Name: '金块', type: '道具', describe: '金块' },
        { Name: '铁锭', type: '道具', describe: '铁锭' },
        { Name: '绿宝石', type: '道具', describe: '绿宝石' },
        { Name: '木棍', type: '道具', describe: '木棍' },

        //消耗品
        { Name: '金苹果', type: '消耗品', describe: '金苹果' },
        { Name: '不死图腾', type: '消耗品', describe: '不死图腾' },
        { Name: '附魔金苹果', type: '消耗品', describe: '附魔金苹果' },

    ]

    public static StoreData: { buyProp: string, needNum: number }[] = [
        { buyProp: '铁锭', needNum: 5 },
        { buyProp: '金块', needNum: 8 },
        { buyProp: '钻石', needNum: 20 },

        { buyProp: '铁头盔', needNum: 20 },
        { buyProp: '铁甲', needNum: 36 },
        { buyProp: '铁裤子', needNum: 30 },
        { buyProp: '铁靴子', needNum: 18 },

        { buyProp: '金头盔', needNum: 35 },
        { buyProp: '金甲', needNum: 60 },
        { buyProp: '金裤子', needNum: 50 },
        { buyProp: '金靴子', needNum: 30 },

        { buyProp: '钻石头盔', needNum: 85 },
        { buyProp: '钻石甲', needNum: 70 },
        { buyProp: '钻石裤子', needNum: 125 },
        { buyProp: '钻石靴子', needNum: 75 },

        { buyProp: '铁剑', needNum: 10 },
        { buyProp: '金剑', needNum: 16 },
        { buyProp: '钻石剑', needNum: 40 },
    ]

    // public static CreatMethod: Map<string, any[][]> = new Map();
    public static CreatMethod: { Name: string, type: any[], pos: number[], resNum: number }[] = [
        { Name: '木剑', type: ['橡木木板-块', 2, '木棍', 1], pos: [1, 4, 7], resNum: 1 },
        { Name: '木棍', type: ['橡木木板-块', 2], pos: [0, 1], resNum: 4 },
        { Name: '橡木木板-块', type: ['橡木原木', 1], pos: [0], resNum: 4 },

        { Name: '铁镐', type: ['铁锭', 3, '木棍', 2], pos: [0, 1, 2, 4, 7], resNum: 1 },
        { Name: '金镐', type: ['金块', 3, '木棍', 2], pos: [0, 1, 2, 4, 7], resNum: 1 },
        { Name: '钻石镐', type: ['钻石', 3, '木棍', 2], pos: [0, 1, 2, 4, 7], resNum: 1 },

        { Name: '铁剑', type: ['铁锭', 2, '木棍', 1], pos: [1, 4, 7], resNum: 1 },
        { Name: '金剑', type: ['金块', 2, '木棍', 1], pos: [1, 4, 7], resNum: 1 },
        { Name: '钻石剑', type: ['钻石', 2, '木棍', 1], pos: [1, 4, 7], resNum: 1 },

        { Name: '铁甲', type: ['铁锭', 8], pos: [0, 2, 3, 4, 5, 6, 7, 8], resNum: 1 },
        { Name: '金甲', type: ['金块', 8], pos: [0, 2, 3, 4, 5, 6, 7, 8], resNum: 1 },
        { Name: '钻石甲', type: ['钻石', 8], pos: [0, 2, 3, 4, 5, 6, 7, 8], resNum: 1 },

        { Name: '铁头盔', type: ['铁锭', 5], pos: [3, 4, 5, 6, 8], resNum: 1 },
        { Name: '金头盔', type: ['铁锭', 5], pos: [3, 4, 5, 6, 8], resNum: 1 },
        { Name: '钻石头盔', type: ['铁锭', 5], pos: [3, 4, 5, 6, 8], resNum: 1 },

        { Name: '铁裤子', type: ['铁锭', 7], pos: [0, 1, 2, 3, 5, 6, 8], resNum: 1 },
        { Name: '金裤子', type: ['金块', 7], pos: [0, 1, 2, 3, 5, 6, 8], resNum: 1 },
        { Name: '钻石裤子', type: ['钻石', 7], pos: [0, 1, 2, 3, 5, 6, 8], resNum: 1 },

        { Name: '铁靴子', type: ['铁锭', 4], pos: [3, 5, 8, 6], resNum: 1 },
        { Name: '金靴子', type: ['金块', 4], pos: [3, 5, 8, 6], resNum: 1 },
        { Name: '钻石靴子', type: ['钻石', 4], pos: [3, 5, 8, 6], resNum: 1 },

    ]

    public static getMethodByName(Name: string): { Name: string, type: any[], pos: number[], resNum: number } {
        for (let i = 0; i < this.CreatMethod.length; i++) {
            if (this.CreatMethod[i].Name == Name) {
                return this.CreatMethod[i];
            }
        }
        console.error("名字错误，没有找到" + Name + "对应制作方法");
        return null;
    }

    public static getTypeByName(Name: string): string {
        for (let i = 0; i < HJMSJ_Constant.PropData.length; i++) {
            if (HJMSJ_Constant.PropData[i].Name == Name) {
                return HJMSJ_Constant.PropData[i].type;
            }
        }
        console.log("名字错误，没有找到" + Name + "对应类型");
        return null;
    }

    //根据名字获得属性
    public static GetDataByName(Name: string): { Name: string, type: string, describe: string } {
        for (let i = 0; i < HJMSJ_Constant.PropData.length; i++) {
            if (HJMSJ_Constant.PropData[i].Name == Name) {
                return HJMSJ_Constant.PropData[i];
            }
        }
        console.log("名字错误，没有找到对应武器属性");
        return null;
    }

    public static WeaponData: { Name: string, Attack: number }[] = [
        { Name: '木剑', Attack: 10 },
        { Name: '铁剑', Attack: 30 },
        { Name: '金剑', Attack: 40 },
        { Name: '钻石剑', Attack: 60 },
        { Name: '铁镐', Attack: 10 },
        { Name: '金镐', Attack: 15 },
        { Name: '钻石镐', Attack: 20 },
    ];

    //根据名字获得装备属性
    public static GetWeaponDataByName(Name: string): { Name: string, Attack: number } {
        for (let i = 0; i < HJMSJ_Constant.WeaponData.length; i++) {
            if (HJMSJ_Constant.WeaponData[i].Name == Name) {
                return HJMSJ_Constant.WeaponData[i];
            }
        }
        console.log("名字错误，没有找到对应属性");
        return null;
    }

    public static ArmorData: { Name: string, Part: string, Defend: number }[] = [
        { Name: '铁甲', Part: "护甲", Defend: 2 },
        { Name: '铁头盔', Part: "头盔", Defend: 1 },
        { Name: '铁裤子', Part: "裤子", Defend: 0.5 },
        { Name: '铁靴子', Part: "靴子", Defend: 0.5 },

        { Name: '金甲', Part: "护甲", Defend: 3 },
        { Name: '金头盔', Part: "头盔", Defend: 2 },
        { Name: '金裤子', Part: "裤子", Defend: 1 },
        { Name: '金靴子', Part: "靴子", Defend: 1 },

        { Name: '钻石甲', Part: "护甲", Defend: 4 },
        { Name: '钻石头盔', Part: "头盔", Defend: 3 },
        { Name: '钻石裤子', Part: "裤子", Defend: 2 },
        { Name: '钻石靴子', Part: "靴子", Defend: 1 },
    ];

    //根据名字获得装备属性
    public static GetArmorDataByName(Name: string): { Name: string, Part: string, Defend: number } {
        for (let i = 0; i < HJMSJ_Constant.ArmorData.length; i++) {
            if (HJMSJ_Constant.ArmorData[i].Name == Name) {
                return HJMSJ_Constant.ArmorData[i];
            }
        }
        console.log("名字错误，没有找到对应属性");
        return null;
    }

    public static GetArmorDataByPart(Part: string): { Name: string, Part: string, Defend: number } {
        for (let i = 0; i < HJMSJ_Constant.ArmorData.length; i++) {
            if (HJMSJ_Constant.ArmorData[i].Part == Part) {
                return HJMSJ_Constant.ArmorData[i];
            }
        }
        console.log("名字错误，没有找到对应属性");
        return null;
    }
}


