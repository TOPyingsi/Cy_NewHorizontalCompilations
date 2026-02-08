import { _decorator, Component, Node } from 'cc';
import { XGDY_ItemType, XGDY_SpecialItem } from '../Manager/XGDY_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_Constant')
export class XGDY_Constant extends Component {


    public static readonly dayReward :{[day:string]:{itemName:string;count:number}} = {
        "0":{itemName:XGDY_ItemType.Coin,count:10000},
        "1":{itemName:XGDY_ItemType.Coin,count:300000},
        "2":{itemName:XGDY_SpecialItem.传奇饵料,count:10},
        "3":{itemName:XGDY_ItemType.Coin,count:1000000},
        "4":{itemName:XGDY_SpecialItem.哈基米南北绿豆,count:5},
        "5":{itemName:XGDY_ItemType.Coin,count:5000000},
        "6":{itemName:XGDY_SpecialItem.航母阻拦索,count:1},
    }

    public static readonly addMoney :{[mapLevel:number]:{money:number;string:string}} = {
            0:{
                money:10000,
                string:"1万"
            },
            1:{
                money:30000,
                string:"3万"
            },
            2:{
                money:50000,
                string:"5万"
            },
            3:{
                money:100000,
                string:"10万"
            },
            4:{
                money:500000,
                string:"50万"
            },5:{
                money:1000000,
                string:"100万"
            },
            6:{
                money:3000000,
                string:"300万"
            },
            7:{
                money:5000000,
                string:"500万"
            },
            8:{
                money:8000000,
                string:"800万"
            }
        }

     public static readonly fishLevelIncomePerMinute = {
        0:1,
        1:3,
        2:5,
        3:10,
        4:20,
        5:60,
        6:100,
        7:150,
        8:250,
        9:300,
    }



    public static readonly skillCdTime = 7;


    public static readonly MAP_6_SpecialFishes =[//何罗鱼分身
        "鱼_4_1",
        "鱼_4_2",
        "鱼_4_3",
        "鱼_4_4",
        "鱼_4_5",
        "鱼_4_6",
        "鱼_4_7",
        "鱼_4_8",
        "鱼_4_9",
        "鱼_4_10"
    ]

    public static readonly MAP_6_LastFish = "鱼_5_0"//何罗鱼一首十身

    public static readonly MAP_7_SpecialFishFirstId = "鱼_6_0"//十命阴鱼
    public static readonly MAP_7_SpecialFishList = [
        "鱼_6_0",
        "鱼_6_1",
        "鱼_6_2",
        "鱼_6_3",
        "鱼_6_4",
        "鱼_6_5",
        "鱼_6_6",
        "鱼_6_7",
        "鱼_6_8",
        "鱼_6_9"
    ]

    public static readonly MAP_101_Challenge = {
        "0": {price: 10000},
        "1": {price: 100000},
        "2": {price: 400000},
        "3": {price: 1000000},
        "4": {price: 1500000},
        "5": {price: 3000000},
        "6": {price: 7000000},
        "7": {price: 20000000},
        "8": {price: 300000000},
    }

    public static readonly MAP_102_TartgetFishLevels = {
        "1":[3],
        "2":[4,5],
        "3":[6,7]
    }
    public static readonly MAP_102_TartgetWeight = {
        "1":80000,
        "2":800000,
        "3":50000000,
    }
    public static readonly MAP_102_RewardShopMoney = {
        "1":1000,
        "2":2000,
        "3":4000,
    }


    public static readonly MAP_103_Challenge1_Data:{targetFishId:string;targetFishName:string;targetCount:number,targetTime:number} = {
        targetFishId:"鱼_2_0",
        targetFishName:"黑鱼",
        targetCount:100,
        targetTime:60,
    }
    

    public static readonly MAP_103_Challenge2_Data:{targetFishId:string;targetFishName:string;targetCount:number,targetTime:number} = {
        targetFishId:"鱼_7_0",
        targetFishName:"流云仙鱼",
        targetCount:100,
        targetTime:60,
    }
    
    public static readonly MAP_103_Challenge3_Data:{anglerId:string;anglerLevel:number;skillLevel:number;targetFishId:string;fishRodId:string;skillIds:string[],minTime:number} = {
        anglerId:"钓友_9",
        anglerLevel:1,
        skillLevel:3,
        targetFishId:"鱼_6_10",
        fishRodId:"鱼竿_0_0",
        skillIds:["技能_0_0"],
        minTime:4,
    }


    public static readonly SpecialItemData:{[key:string]:{name:string;limit:number;price:number;count:number;desc:string;isCanVideo:boolean}} = {
        "祖传饵料":{ name:"祖传饵料",limit:1000000000, price:200,count:10,desc:"钓大鱼概率大幅提升，道具效果持续5分钟",isCanVideo:true },
        "传奇饵料":{ name:"传奇饵料",limit:1000000000, price:200,count:3,desc:"下一杆必中大鱼",isCanVideo:true   },
        "辣条":{ name:"辣条",limit:1000000000, price:200,count:5,desc:"立即恢复200体力",isCanVideo:true   },
        "哈基米南北绿豆":{ name:"哈基米南北绿豆",limit:1000000000, price:200,count:2,desc:"立即恢复500体力",isCanVideo:true   },
        "冰河巨鲲":{ name:"冰河巨鲲",limit:1000000000, price:1000,count:2,desc:"体力永久增长100",isCanVideo:false },
        "绝境气息":{ name:"绝境气息",limit:1000000000, price:2000,count:5,desc:"本次钓鱼全伤害增幅30%,道具效果不可叠加",isCanVideo:false  },
        "龙形锦鲤":{ name:"龙形锦鲤",limit:1000000000, price:1000,count:5,desc:"50%永久钓法伤害加成（上限100%）",isCanVideo:false  },
        "航母阻拦索":{ name:"航母阻拦索",limit:1000000000, price:2000,count:1,desc:"航母级别鱼线，禁止鱼咬断线",isCanVideo:false  },
        "烤鲲肉":{ name:"烤鲲肉",limit:1000000000, price:1500,count:5,desc:"钓竿秒伤 +2%（上限100%）",isCanVideo:false  },
    }

    s = {
        
    }


    public static readonly SpecialFishId = [
        "鱼_6_1",
        "鱼_6_2",
        "鱼_6_3",
        "鱼_6_4",
        "鱼_6_5",
        "鱼_6_6",
        "鱼_6_7",
        "鱼_6_8",
        "鱼_6_9",
        "鱼_6_11",
        "鱼_6_10"]

}


