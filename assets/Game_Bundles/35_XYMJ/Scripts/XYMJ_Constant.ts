import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('XYMJ_Constant')
export class XYMJ_Constant {
    //难度
    public static level: number = 1;
    //地图
    public static mapID: string = "小学部";

    public static QualityType = [
        '白',
        '紫',
        '金',
        '红',
        '炫彩',
        '至尊',
    ]

    public static PropData: { Name: string, type: string, value: number, quality: string, describe: string }[] = [
        //回收物
        { Name: '玩具魔方', type: '回收物', value: 600, quality: '白', describe: "" },
        { Name: '一卷纸', type: '回收物', value: 460, quality: '白', describe: "" },
        { Name: '手表', type: '回收物', value: 560, quality: '白', describe: "" },
        { Name: '废弃试卷', type: '回收物', value: 200, quality: '白', describe: "" },
        { Name: '扳手', type: '回收物', value: 400, quality: '白', describe: "" },
        { Name: '牙膏', type: '回收物', value: 200, quality: '白', describe: "" },
        { Name: '破损接收电台', type: '回收物', value: 1000, quality: '白', describe: "" },
        { Name: '医用剪刀', type: '回收物', value: 600, quality: '白', describe: "" },
        { Name: '盗版耳机', type: '回收物', value: 3500, quality: '紫', describe: "" },
        { Name: '老爷机', type: '回收物', value: 5000, quality: '紫', describe: "" },
        { Name: '停表', type: '回收物', value: 1800, quality: '紫', describe: "" },
        { Name: '一个打火机', type: '回收物', value: 1800, quality: '紫', describe: "" },
        { Name: '碘伏消毒水', type: '回收物', value: 2700, quality: '紫', describe: "" },
        { Name: '不明气体采样瓶', type: '回收物', value: 6700, quality: '紫', describe: "" },
        { Name: '体温枪', type: '回收物', value: 3980, quality: '紫', describe: "" },
        { Name: '外科手套', type: '回收物', value: 4900, quality: '紫', describe: "" },
        { Name: '蓝海电池', type: '回收物', value: 50000, quality: '金', describe: "" },
        { Name: 'U盘', type: '回收物', value: 36000, quality: '金', describe: "" },
        { Name: '充电宝', type: '回收物', value: 35000, quality: '金', describe: "" },
        { Name: '充电头', type: '回收物', value: 10000, quality: '金', describe: "" },
        { Name: '研究终端', type: '回收物', value: 36600, quality: '金', describe: "" },
        { Name: '汽车发动机', type: '回收物', value: 68000, quality: '金', describe: "" },
        { Name: '高级剪刀', type: '回收物', value: 36680, quality: '金', describe: "" },
        { Name: '无菌培养仓', type: '回收物', value: 66500, quality: '金', describe: "" },
        { Name: '屏幕', type: '回收物', value: 79000, quality: '金', describe: "" },
        { Name: '收音机', type: '回收物', value: 90000, quality: '金', describe: "" },
        { Name: '手机', type: '回收物', value: 100000, quality: '红', describe: "" },
        { Name: '显卡', type: '回收物', value: 409000, quality: '红', describe: "" },
        { Name: '一箱金条', type: '回收物', value: 800000, quality: '红', describe: "" },
        { Name: '考试答案', type: '回收物', value: 1000000, quality: '红', describe: "" },
        { Name: '黄金土豆', type: '回收物', value: 815815, quality: '红', describe: "" },
        { Name: '医用显微镜', type: '回收物', value: 460000, quality: '红', describe: "" },
        { Name: '医疗机器人', type: '回收物', value: 790000, quality: '红', describe: "" },
        { Name: '高端笔记本', type: '回收物', value: 100000, quality: '红', describe: "" },
        { Name: '曙光流星', type: '回收物', value: 1000000, quality: '红', describe: "" },
        { Name: '金条', type: '回收物', value: 150000, quality: '红', describe: "" },
        { Name: '黄金战衣', type: '回收物', value: 2222222, quality: '炫彩', describe: "" },
        { Name: '黄金狗头', type: '回收物', value: 2999900, quality: '炫彩', describe: "" },
        { Name: '五星摸金上将', type: '回收物', value: 1699999, quality: '炫彩', describe: "" },
        { Name: '纯金臂力棒', type: '回收物', value: 1266666, quality: '炫彩', describe: "" },
        { Name: '金狮半身像', type: '回收物', value: 2666666, quality: '炫彩', describe: "" },
        { Name: '黄金木头人', type: '回收物', value: 2696666, quality: '炫彩', describe: "" },
        { Name: '金尊机器人', type: '回收物', value: 2899999, quality: '炫彩', describe: "" },
        { Name: '呼吸机', type: '回收物', value: 4000000, quality: '炫彩', describe: "" },
        { Name: '黄金背带裤', type: '回收物', value: 2888888, quality: '炫彩', describe: "" },
        { Name: '盘龙圣玺', type: '回收物', value: 2300000, quality: '炫彩', describe: "" },
        { Name: '收藏家绿宝石', type: '回收物', value: 2200000, quality: '炫彩', describe: "" },
        { Name: '收藏家蓝宝石', type: '回收物', value: 2400000, quality: '炫彩', describe: "" },
        { Name: '收藏家橙宝石', type: '回收物', value: 2600000, quality: '炫彩', describe: "" },
        { Name: '收藏家红宝石', type: '回收物', value: 2800000, quality: '炫彩', describe: "" },
        { Name: '收藏家紫宝石', type: '回收物', value: 3000000, quality: '炫彩', describe: "" },
        { Name: '学生许愿币', type: '回收物', value: 2000000, quality: '炫彩', describe: "" },
        { Name: '熊猫许愿币', type: '回收物', value: 2000000, quality: '炫彩', describe: "" },
        { Name: '冰晶玉龙', type: '回收物', value: 20000000, quality: '至尊', describe: "" },
        { Name: '校长的金牙', type: '回收物', value: 20000000, quality: '至尊', describe: "" },
        { Name: '生化头盔', type: '回收物', value: 20000000, quality: '至尊', describe: "" },
        { Name: '尾巴', type: '回收物', value: 99999, quality: '红', describe: "活动道具，可以用于兑换皮肤" },
        { Name: '机器人核心', type: '回收物', value: 99999, quality: '红', describe: "活动道具，可以用于兑换皮肤" },
        { Name: '龙蛋', type: '回收物', value: 99999, quality: '红', describe: "活动道具，可以用于兑换皮肤" },
        { Name: '兔子', type: '回收物', value: 99999, quality: '红', describe: "活动道具，可以用于兑换皮肤" },
        { Name: '校长的眼镜', type: '回收物', value: 15000000, quality: '至尊', describe: "" },
        { Name: '哈基米的猫粮', type: '回收物', value: 18000000, quality: '至尊', describe: "" },
        { Name: '超级手柄', type: '回收物', value: 22000000, quality: '至尊', describe: "" },
        { Name: '超级卡片', type: '回收物', value: 25000000, quality: '至尊', describe: "" },
        { Name: '黄金气球', type: '回收物', value: 1999999, quality: '炫彩', describe: "" },
        { Name: '黄金戒指', type: '回收物', value: 2999999, quality: '炫彩', describe: "" },
        { Name: '勋章', type: '回收物', value: 3999999, quality: '炫彩', describe: "" },
        { Name: '人鱼族珍珠', type: '回收物', value: 4999999, quality: '炫彩', describe: "" },
        { Name: '哈基米的围巾', type: '回收物', value: 5999999, quality: '炫彩', describe: "" },
        { Name: '黄金蝴蝶发夹', type: '回收物', value: 6999999, quality: '炫彩', describe: "" },
        //消耗品
        { Name: '柑橘辣片', type: '消耗品', value: 1680000, quality: '金', describe: "回复血量100" },
        { Name: '香喷喷烤鸡', type: '消耗品', value: 6480000, quality: '红', describe: "回复血量300" },
        // { Name: '牢大冰红茶', type: '消耗品', value: 26800000, quality: '炫彩', describe: "回复血量1200" },


        //武器
        { Name: '拳头', type: '武器', value: 150000, quality: '白', describe: "秒伤:45\n伤害:15\n攻速3" },
        { Name: '尺子', type: '武器', value: 150000, quality: '紫', describe: "秒伤:40\n伤害:20\n攻速2" },
        { Name: '棒球棍', type: '武器', value: 850000, quality: '金', describe: "秒伤:80\n伤害:40\n攻速2" },
        { Name: '斧头', type: '武器', value: 1250000, quality: '金', describe: "秒伤:120\n伤害:60\n攻速2" },
        { Name: '太刀', type: '武器', value: 2880000, quality: '红', describe: "秒伤:160\n伤害:80\n攻速2" },
        { Name: '神辉匕首', type: '武器', value: 18880000, quality: '红', describe: "秒伤:240\n伤害:120\n攻速2" },
        // { Name: '纸团', type: '武器', value: 2760000, quality: '金', describe: "秒伤:40\n伤害:20\n攻速2" },
        // { Name: '臭水', type: '武器', value: 6000000, quality: '红', describe: "秒伤:80\n伤害:40\n攻速2" },
        { Name: '汤勺', type: '武器', value: 10000000, quality: '炫彩', describe: "秒伤:120\n伤害:60\n攻速2" },
        { Name: '金块', type: '武器', value: 20000000, quality: '炫彩', describe: "秒伤:200\n伤害:100\n攻速2" },
        // { Name: '怒火', type: '武器', value: 30000000, quality: '炫彩', describe: "秒伤:500\n伤害:250\n攻速2" },
        { Name: '极简武力', type: '武器', value: 50000000, quality: '炫彩', describe: "秒伤:320\n伤害:40\n攻速8" },
        { Name: '怒火手枪', type: '武器', value: 100000000, quality: '炫彩', describe: "秒伤:400\n伤害:100\n攻速4" },
        { Name: '蝴蝶刀', type: '武器', value: 200000000, quality: '炫彩', describe: "秒伤:800\n伤害:400\n攻速2" },
        { Name: '冲锋枪', type: '武器', value: 300000000, quality: '炫彩', describe: "秒伤:600\n伤害:50\n攻速12" },
        { Name: '冰霜神话', type: '武器', value: 500000000, quality: '炫彩', describe: "秒伤:800\n伤害:100\n攻速8" },
        { Name: 'x手枪', type: '武器', value: 500000000, quality: '炫彩', describe: "秒伤:800\n伤害:200\n攻速4" },
        { Name: '感染核心', type: '武器', value: 1500000000, quality: '炫彩', describe: "秒伤:1200\n伤害:300\n攻速4" },
        { Name: '北极星长矛', type: '武器', value: 250000000, quality: '炫彩', describe: "秒伤:1200\n伤害:600\n攻速2" },
        { Name: '白之意志', type: '武器', value: 500000000, quality: '炫彩', describe: "秒伤:1600\n伤害:800\n攻速2" },
        { Name: '敢死队', type: '武器', value: 2500000000, quality: '炫彩', describe: "秒伤:1600\n伤害:200\n攻速8" },
        { Name: '特战英豪', type: '武器', value: 5000000000, quality: '炫彩', describe: "秒伤:2400\n伤害:200\n攻速12" },
        { Name: '巨龙传说', type: '武器', value: 10000000000, quality: '至尊', describe: "秒伤:3000\n伤害:300\n攻速10" },
        { Name: '至尊天极武士', type: '武器', value: 15000000000, quality: '至尊', describe: "秒伤:4000\n伤害:400\n攻速10" },
        //钥匙
        { Name: '102教室钥匙', type: '钥匙', value: 199600, quality: '金', describe: "用作打开特定房间门\n适用场景:小学，初中，高中" },
        { Name: '杂物间钥匙', type: '钥匙', value: 360060, quality: '金', describe: "用作打开特定房间门\n适用场景:初中，高中" },
        { Name: '校长收藏室', type: '钥匙', value: 560000, quality: '红', describe: "用作打开特定房间门\n适用场景:初中，高中" },
        { Name: '一级校园权限卡', type: '钥匙', value: 613300, quality: '红', describe: "适用作打开特定房间门\n用场景:初中，高中" },
        { Name: '校长室权限卡', type: '钥匙', value: 769900, quality: '红', describe: "用作打开特定房间门\n适用场景:初中，高中" },
        { Name: '设备领用室', type: '钥匙', value: 97800, quality: '紫', describe: "用作打开特定房间门\n适用场景:体育馆" },
        { Name: '电力控制室', type: '钥匙', value: 166680, quality: '紫', describe: "用作打开特定房间门\n适用场景:体育馆" },
        { Name: '体育馆衣帽间', type: '钥匙', value: 466680, quality: '金', describe: "用作打开特定房间门\n适用场景:体育馆" },
        { Name: '体育馆主教室', type: '钥匙', value: 721150, quality: '红', describe: "用作打开特定房间门\n适用场景:体育馆" },
        { Name: '体育馆权限卡', type: '钥匙', value: 836660, quality: '红', describe: "用作打开特定房间门\n适用场景:体育馆" },
        { Name: '医务室', type: '钥匙', value: 199600, quality: '紫', describe: "用作打开特定房间门\n适用场景:高中" },
        { Name: '教师办公室钥匙', type: '钥匙', value: 315000, quality: '红', describe: "用作打开特定房间门\n适用场景:高中" },
        { Name: '二级校园权限卡', type: '钥匙', value: 966600, quality: '红', describe: "用作打开特定房间门\n适用场景:高中" },
        { Name: '天文台管理室', type: '钥匙', value: 416660, quality: '金', describe: "用作打开特定房间门\n适用场景:天文台" },
        { Name: '天文台储备室', type: '钥匙', value: 516609, quality: '金', describe: "用作打开特定房间门\n适用场景:天文台" },
        { Name: '天文台奖章室', type: '钥匙', value: 966620, quality: '红', describe: "用作打开特定房间门\n适用场景:天文台" },
        { Name: '宿管室', type: '钥匙', value: 399960, quality: '金', describe: "用作打开特定房间门\n适用场景:休闲区" },
        { Name: '宿舍典藏室', type: '钥匙', value: 799600, quality: '金', describe: "用作打开特定房间门\n适用场景:休闲区" },
        { Name: '实验楼典藏室', type: '钥匙', value: 511900, quality: '金', describe: "用作打开特定房间门\n适用场景:实验楼" },
        { Name: '实验楼主任室', type: '钥匙', value: 2880000, quality: '金', describe: "用作打开特定房间门\n适用场景:实验楼" },
    ];
    //根据名字获得属性
    public static GetDataByName(Name: string): { Name: string, type: string, value: number, quality: string, describe: string } {
        for (let i = 0; i < XYMJ_Constant.PropData.length; i++) {
            if (XYMJ_Constant.PropData[i].Name == Name) {
                return XYMJ_Constant.PropData[i];
            }
        }
        console.log("名字错误，没有找到对应属性");
        return null;
    }



    //AttackSpeed表示射速，即每秒可以攻击的次数
    public static WeaponData: { Name: string, Attack: number, AttackSpeed: number }[] = [
        { Name: '拳头', Attack: 15, AttackSpeed: 3 },
        { Name: '尺子', Attack: 25, AttackSpeed: 2 },
        { Name: '棒球棍', Attack: 40, AttackSpeed: 2 },
        { Name: '斧头', Attack: 60, AttackSpeed: 2 },
        { Name: '太刀', Attack: 80, AttackSpeed: 2 },
        { Name: '神辉匕首', Attack: 120, AttackSpeed: 2 },
        { Name: '纸团', Attack: 20, AttackSpeed: 2 },
        { Name: '臭水', Attack: 40, AttackSpeed: 2 },
        { Name: '汤勺', Attack: 60, AttackSpeed: 2 },
        { Name: '金块', Attack: 100, AttackSpeed: 2 },
        { Name: '怒火', Attack: 250, AttackSpeed: 2 },
        { Name: '极简武力', Attack: 40, AttackSpeed: 8 },
        { Name: '怒火手枪', Attack: 100, AttackSpeed: 4 },
        { Name: '蝴蝶刀', Attack: 400, AttackSpeed: 2 },
        { Name: '冲锋枪', Attack: 50, AttackSpeed: 12 },
        { Name: '冰霜神话', Attack: 100, AttackSpeed: 8 },
        { Name: 'x手枪', Attack: 200, AttackSpeed: 4 },
        { Name: '感染核心', Attack: 300, AttackSpeed: 4 },
        { Name: '北极星长矛', Attack: 600, AttackSpeed: 2 },
        { Name: '白之意志', Attack: 800, AttackSpeed: 2 },
        { Name: '敢死队', Attack: 200, AttackSpeed: 8 },
        { Name: '特战英豪', Attack: 200, AttackSpeed: 12 },
        { Name: '巨龙传说', Attack: 300, AttackSpeed: 10 },
        { Name: '至尊天极武士', Attack: 400, AttackSpeed: 10 },
    ];


    //根据名字获得装备属性
    public static GetWeaponDataByName(Name: string): { Name: string, Attack: number, AttackSpeed: number } {
        for (let i = 0; i < XYMJ_Constant.WeaponData.length; i++) {
            if (XYMJ_Constant.WeaponData[i].Name == Name) {
                return XYMJ_Constant.WeaponData[i];
            }
        }
        console.log("名字错误，没有找到对应属性");
        return null;
    }
}


