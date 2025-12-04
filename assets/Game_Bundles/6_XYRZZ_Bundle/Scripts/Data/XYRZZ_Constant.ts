export { XYRZZ_Constant as XYRZZ_Constant }

import { _decorator, Component, debug, Enum, Node, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_Constant')
class XYRZZ_Constant extends Component {


    public static FishData: { Name: string, price: number, weight: number, restrain: string, variation: string, place: string, describe: string }[] = [
        {
            Name: "红鳞鱼", price: 5, weight: 300, restrain: "普通鱼竿", variation: "变异红鳞鱼", place: "荒废水库",
            describe: "红鳞鱼出没于荒废水库中，最喜欢吃水草，很胆小，肉质鲜美\n(惧怕钓法：老汉踩单车)"
        },
        {
            Name: "变异红鳞鱼", price: 10, weight: 400, restrain: "普通鱼竿", variation: "红鳞鱼王", place: "荒废水库",
            describe: "变异红鳞鱼出没于荒废水库中，最喜欢吃水草，很胆小，肉质鲜美\n(惧怕钓法：老汉踩单车)"
        },
        {
            Name: "红鳞鱼王", price: 15, weight: 600, restrain: "普通鱼竿", variation: "", place: "荒废水库",
            describe: "红鳞鱼王出没于荒废水库中，喜欢吃水草，统治这一片区域\n(惧怕钓法：老汉踩单车)"
        },
        {
            Name: "牛头青", price: 100, weight: 5000, restrain: "碳纤维鱼竿", variation: "变异牛头青", place: "海峡大坝",
            describe: "牛头青是一种很适合制作治疗痔疮的药材鱼\n(惧怕钓法：打鱼棒法)"
        },
        {
            Name: "变异牛头青", price: 150, weight: 10000, restrain: "碳纤维鱼竿", variation: "狂暴牛头青", place: "海峡大坝",
            describe: "变异牛头青是一种很适合制作治疗痔疮的药材鱼\n(惧怕钓法：打鱼棒法)"
        },
        {
            Name: "狂暴牛头青", price: 300, weight: 30000, restrain: "碳纤维鱼竿", variation: "牛头青鱼王", place: "海峡大坝",
            describe: "狂暴牛头青是一种很适合制作治疗各种顽疾的药材鱼\n(惧怕钓法：打鱼棒法)"
        },
        {
            Name: "青皮鱼", price: 500, weight: 50000, restrain: "螺纹鱼竿", variation: "红皮鱼", place: "东海水域",
            describe: "青皮鱼是一种整体青色的食人鲨，凶鱼种\n(惧怕钓法：乾坤大挪鱼)"
        },
        {
            Name: "红皮鱼", price: 1000, weight: 150000, restrain: "螺纹鱼竿", variation: "锯齿红皮鱼", place: "东海水域",
            describe: "红皮鱼是一种整体红色的食人鲨，凶鱼种\n(惧怕钓法：乾坤大挪鱼)"
        },
        {
            Name: "锯齿红皮鱼", price: 3000, weight: 400000, restrain: "螺纹鱼竿", variation: "", place: "东海水域",
            describe: "锯齿红皮鱼是一种整体红色的食人鲨，头上长了一个锯齿\n(惧怕钓法：乾坤大挪鱼)"
        },
        {
            Name: "长条鲨", price: 5000, weight: 800000, restrain: "柳枝鱼竿", variation: "变异长条鲨", place: "无极西湖",
            describe: "受到环境影响发生变异的凶兽鱼，力量强大\n(惧怕钓法：Z字抖动)"
        },
        {
            Name: "变异长条鲨", price: 10000, weight: 1500000, restrain: "柳枝鱼竿", variation: "", place: "无极西湖",
            describe: "受到环境影响发生变异的凶兽鱼，力量强大\n(惧怕钓法：Z字抖动)"
        },
        {
            Name: "牛头青鱼王", price: 25000, weight: 4000000, restrain: "柳枝鱼竿", variation: "", place: "无极西湖",
            describe: "来到无极西湖的狂暴牛头青获得了更强大的力量\n(惧怕钓法：Z字抖动)"
        },
        {
            Name: "巨齿象鱼", price: 60000, weight: 10000000, restrain: "定海神竿", variation: "变异巨齿象鱼", place: "贺强渔场",
            describe: "拥有者巨大牙齿体型肥大的凶兽鱼\n(惧怕钓法：窜天猴钓法)"
        },
        {
            Name: "变异巨齿象鱼", price: 120000, weight: 20000000, restrain: "定海神竿", variation: "巨齿象鱼王", place: "贺强渔场",
            describe: "拥有者巨大牙齿体型肥大的凶兽鱼变异之后更加强大\n(惧怕钓法：窜天猴钓法)"
        },
        {
            Name: "巨齿象鱼王", price: 300000, weight: 50000000, restrain: "定海神竿", variation: "", place: "贺强渔场",
            describe: "贺强渔场的统治者\n(惧怕钓法：窜天猴钓法)"
        },
        {
            Name: "泰坦凶鱼", price: 500000, weight: 100000000, restrain: "柳枝鱼竿", variation: "变异泰坦凶鱼", place: "蓬莱海域",
            describe: "该海域的强者，泰坦族，充满无尽的爆发力\n(惧怕钓法：飞天无极钓)"
        },
        {
            Name: "变异泰坦凶鱼", price: 1000000, weight: 250000000, restrain: "柳枝鱼竿", variation: "泰坦凶鱼王", place: "蓬莱海域",
            describe: "变异的泰坦凶鱼，泰坦族，比变异之前更加可怕\n(惧怕钓法：飞天无极钓)"
        },
        {
            Name: "泰坦凶鱼王", price: 2000000, weight: 400000000, restrain: "柳枝鱼竿", variation: "", place: "蓬莱海域",
            describe: "泰坦族的王者，拥有无可匹敌的力量\n(惧怕钓法：飞天无极钓圆满)"
        },
        {
            Name: "哥斯鱼", price: 5000000, weight: 800000000, restrain: "定海神竿", variation: "变异哥斯鱼", place: "昆仑仙海",
            describe: "远古泰坦族的精锐，在海域中属于鱼王级别的鱼种类\n(惧怕钓法：飞天无极钓圆满)"
        },
        {
            Name: "变异哥斯鱼", price: 10000000, weight: 2000000000, restrain: "定海神竿", variation: "哥斯鱼王", place: "昆仑仙海",
            describe: "远古泰坦族的精锐，精锐中的精锐\n(惧怕钓法：回首掏)"
        },
        {
            Name: "哥斯鱼王", price: 30000000, weight: 4000000000, restrain: "定海神竿", variation: "蜥蜴哥斯鱼", place: "昆仑仙海",
            describe: "远古泰坦族的王者，在昆仑仙海有统治地位\n(惧怕钓法：回首掏)"
        },
        {
            Name: "蜥蜴哥斯鱼", price: 50000000, weight: 8000000000, restrain: "定海神竿", variation: "", place: "混沌海域",
            describe: "在混沌空间存活的哥斯鱼，据说是每任的哥斯鱼王来到混沌海域发生了变异\n(惧怕钓法：太极钓法)"
        },
        {
            Name: "残暴猛鱼", price: 100000000, weight: 20000000000, restrain: "定海神竿", variation: "", place: "混沌海域",
            describe: "一直生活在混沌海域的奇特生物，没有人见过他们\n(惧怕钓法：太极钓法)"
        },
        {
            Name: "残暴猛鱼王", price: 200000000, weight: 50000000000, restrain: "定海神竿", variation: "", place: "混沌海域",
            describe: "一直生活在混沌海域的奇特生物的领袖，没有人见过他\n(惧怕钓法：太极钓法)"
        }

    ]
    //钓法数据
    //升级规则(等级的三次方*LevelUpMoney)
    //钓法规则(等级的二次方*Power)
    //对于克制的鱼，增加的拉力是单次点击拉力*等级*Power开三次方根，不克制只有拉力*等级的开三次方根
    public static FishingPoleData: { Name: string, Data: string, Power: number, upLevelMomey: number, describe: string, restrain: string[] }[] = [
        {
            Name: "老汉踩单车", Data: "A上A下", Power: 1000, upLevelMomey: 1500,
            describe: "本钓法是降鱼十八钓中的第六钓\n该钓法对红鳞鱼有着克制",
            restrain: ["红鳞鱼", "变异红鳞鱼", "红鳞鱼王"]
        },
        {
            Name: "打鱼棒法", Data: "ABAB下", Power: 5000, upLevelMomey: 15000,
            describe: "本钓法是降鱼十八钓中的第十四钓\n该钓法对牛头青等鱼类有着很强的克制",
            restrain: ["牛头青", "变异牛头青", "狂暴牛头青"]
        },
        {
            Name: "乾坤大挪鱼", Data: "左右AB上上", Power: 7000, upLevelMomey: 150000,
            describe: "本钓法是失传已久的乾坤钓法\n该钓法对青皮鱼有着很强的克制",
            restrain: ["青皮鱼", "红皮鱼", "锯齿红皮鱼"]
        },
        {
            Name: "Z字抖动", Data: "BBBBBB", Power: 10000, upLevelMomey: 500000,
            describe: "自创钓法中的强力钓法\n该钓法属于降鱼十八钓的第十八钓",
            restrain: ["长条鲨", "变异长条鲨", "牛头青鱼王"]
        },
        {
            Name: "窜天猴钓法", Data: "上上下下B", Power: 1500, upLevelMomey: 3000,
            describe: "本钓法是降鱼十八钓的第十三钓\n该钓法对巨齿象鱼有着很强的克制",
            restrain: ["巨齿象鱼", "变异巨齿象鱼", "巨齿象鱼王"]
        },
        {
            Name: "飞天无极钓", Data: "左右左右BA", Power: 9000, upLevelMomey: 250000,
            describe: "本钓法是降鱼十八钓的第七钓\n该钓法对泰坦凶鱼有着很强的克制",
            restrain: ["泰坦凶鱼", "变异泰坦凶鱼"]
        },
        {
            Name: "飞天无极钓圆满", Data: "上下左右AB", Power: 20000, upLevelMomey: 2000000,
            describe: "将飞天无极钓修炼到圆满的钓法\n该钓法对哥斯鱼拥有超高的克制",
            restrain: ["泰坦凶鱼王", "哥斯鱼"]
        },
        {
            Name: "回首掏", Data: "上A下B", Power: 40000, upLevelMomey: 30000000,
            describe: "本钓法是降鱼十八钓的第五钓\n该钓法对哥斯鱼王有着很强的克制",
            restrain: ["变异哥斯鱼", "哥斯鱼王"]
        },
        {
            Name: "太极钓法", Data: "上左下右AB", Power: 120000, upLevelMomey: 2500000000,
            describe: "传说中太极钓法的招式\n该钓法只打鱼王局",
            restrain: ["蜥蜴哥斯鱼", "残暴猛鱼", "残暴猛鱼王"]
        },
    ]
    //钓竿数据
    //升级规则(等级的三次方*LevelUpMoney)
    //钓法规则(等级的二次方*Power)
    public static FishingPole: { Name: string, describe: string, Power: number, upLevelMomey: number }[] = [
        { Name: "普通鱼竿", describe: "这是一把新手鱼竿\n\n一把好的鱼竿能够在钓鱼的时候节省很多力气", Power: 100, upLevelMomey: 10000 },
        { Name: "碳纤维鱼竿", describe: "这是一把碳纤维鱼竿\n\n十分适合用来钓大体型鱼类", Power: 4000, upLevelMomey: 1000000 },
        { Name: "螺纹鱼竿", describe: "这是一把带有螺纹的鱼竿\n\n可以拿来钓高级的鱼类", Power: 10000, upLevelMomey: 5000000 },
        { Name: "柳枝鱼竿", describe: "这是一把柳条做成的鱼竿\n\n传说中姜太公钓鱼用过的鱼竿", Power: 50000, upLevelMomey: 100000000 },
        { Name: "定海神竿", describe: "孙大圣当年的武器\n\n用这个作为鱼竿钓鱼怕不是要惊动龙王", Power: 200000, upLevelMomey: 2000000000 },
    ]
    //角色数据
    public static PlayerData: { Name: string, FishingPoleName: string }[] = [
        { Name: "表弟", FishingPoleName: "老汉踩单车" },
        { Name: "阿杆", FishingPoleName: "打鱼棒法" },
        { Name: "姜老", FishingPoleName: "乾坤大挪鱼" },
        { Name: "阿新", FishingPoleName: "Z字抖动" },
    ]

    //道具数据
    //升级规则(等级的四次方*LevelUpMoney)
    public static PropData: { Name: string, MoneyBuff: number, LevelUpMoney: number, describe: string }[] = [
        { Name: "珍珠贝壳", MoneyBuff: 1, LevelUpMoney: 100, describe: "其他效果：装备之后每隔1秒回自动产出巨额钱币(等于一次点击的钱币)" },
        { Name: "招财橘猫", MoneyBuff: 10, LevelUpMoney: 500, describe: "可爱的小橘可以为你提供巨大的点击收益" },
        { Name: "帐篷", MoneyBuff: 30, LevelUpMoney: 10000, describe: "野钓夜钓的必被帐篷，你值得拥有！" },
        { Name: "钓具箱", MoneyBuff: 70, LevelUpMoney: 150000, describe: "高级钓鱼佬就应该有好的钓具箱" },
        { Name: "渔船", MoneyBuff: 150, LevelUpMoney: 3000000, describe: "作为一名钓鱼佬，你需要一艘属于自己的船" },
        { Name: "深海珍珠", MoneyBuff: 0, LevelUpMoney: 0, describe: "传说中深海龙宫中的一种珍珠，夜间也会发光" },
    ]
    //等级称号数据
    public static TitleData: { Name: string, Level: number }[] = [
        { Name: "钓鱼菜鸟", Level: 0 },
        { Name: "钓鱼萌新", Level: 20 },
        { Name: "钓鱼新手", Level: 50 },
        { Name: "钓鱼热爱者", Level: 100 },
        { Name: "钓鱼常客", Level: 150 },
        { Name: "钓鱼老手", Level: 200 },
        { Name: "钓鱼高手", Level: 300 },
        { Name: "钓鱼强者", Level: 500 },
        { Name: "超级高手", Level: 700 },
        { Name: "绝世强者", Level: 900 },
        { Name: "垂钓之王", Level: 1300 },
        { Name: "垂钓至尊", Level: 1600 },
        { Name: "钓半仙", Level: 2000 },
        { Name: "钓仙", Level: 3000 },
        { Name: "沌钓仙", Level: 4000 },
        { Name: "蓬莱钓仙", Level: 5000 },
        { Name: "绝世钓仙", Level: 6000 },
        { Name: "混沌钓仙", Level: 7000 },
        { Name: "三界钓仙", Level: 8000 },
        { Name: "鸿蒙钓仙", Level: 9000 },
        { Name: "极·蓬莱钓仙", Level: 10000 },
        { Name: "极·绝世钓仙", Level: 12000 },
        { Name: "极·混沌钓仙", Level: 14000 },
        { Name: "极·三界钓仙", Level: 16000 },
        { Name: "极·鸿蒙钓仙", Level: 20000 },
    ]
    //通过等级来获取称号
    public static GetTitleOfLevel(Level: number): string {
        let Name: string = '';
        XYRZZ_Constant.TitleData.forEach((data, index) => {
            if (Level >= data.Level) {
                Name = data.Name;
            }
        })
        return Name;
    }

    //通过KeyName和Key，获取数据表的数据
    public static GetTableData(Table: any, KeyName: string, Key: string): any {
        for (let index = 0; index < Table.length; index++) {
            if (Table[index].hasOwnProperty(KeyName) == true) {
                if (Table[index][KeyName] == Key) {
                    return Table[index];
                }
            } else {
                console.log("查找错误，该数据中没有这个属性：" + KeyName);
            }
        }
    }



}