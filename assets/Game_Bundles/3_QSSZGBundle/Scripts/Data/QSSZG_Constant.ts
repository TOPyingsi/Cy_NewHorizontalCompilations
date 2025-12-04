export { QSSZG_Constant as QSSZG_Constant }

import { _decorator, Component, Enum, Node, v3 } from 'cc';
import { FishData } from '../QSSZG_GameData';
const { ccclass, property } = _decorator;

export enum QSSZG_FishType {
    淡水鱼 = "淡水鱼",
    深海鱼 = "深海鱼",
}



@ccclass('QSSZG_Constant')
class QSSZG_Constant extends Component {
    public static PrefabPath = {
        Fish: "Prefabs/FishGame/Fish",
        鱼包: "Prefabs/FishGame/鱼包",
        装饰: "Prefabs/FishGame/装饰",
        图鉴框: "Prefabs/FishGame/图鉴框",
        鱼数据框: "Prefabs/FishGame/FishBox"
    }



    public static FishData: { id: number, Name: string, Type: QSSZG_FishType, MinPrice: number, MaxPrice: number, production_value: number, MaxExp: number }[] = [
        { id: 0, Name: "金鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 0.25, MaxPrice: 5, production_value: 0.01, MaxExp: 100 },
        { id: 1, Name: "心斑刺尾鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 0.45, MaxPrice: 10, production_value: 0.02, MaxExp: 125 },
        { id: 2, Name: "稀有·心斑刺尾鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 5, MaxPrice: 100, production_value: 0.2, MaxExp: 500 },
        { id: 3, Name: "非洲蝴蝶鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 0.6, MaxPrice: 12, production_value: 0.03, MaxExp: 170 },
        { id: 4, Name: "稀有·心斑刺尾鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 7, MaxPrice: 145, production_value: 0.3, MaxExp: 600 },
        { id: 5, Name: "扁鲈", Type: QSSZG_FishType.淡水鱼, MinPrice: 0.8, MaxPrice: 16, production_value: 0.04, MaxExp: 200 },
        { id: 6, Name: "稀有·扁鲈", Type: QSSZG_FishType.淡水鱼, MinPrice: 10, MaxPrice: 200, production_value: 0.4, MaxExp: 750 },
        { id: 7, Name: "枯叶鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 1, MaxPrice: 20, production_value: 0.05, MaxExp: 250 },
        { id: 8, Name: "稀有·枯叶鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 15, MaxPrice: 300, production_value: 0.6, MaxExp: 850 },
        { id: 9, Name: "神仙鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 1.3, MaxPrice: 26, production_value: 0.07, MaxExp: 300 },
        { id: 10, Name: "稀有·神仙鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 20, MaxPrice: 400, production_value: 0.8, MaxExp: 1000 },
        { id: 11, Name: "海象鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 1.6, MaxPrice: 32, production_value: 0.1, MaxExp: 300 },
        { id: 12, Name: "龙鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 2, MaxPrice: 40, production_value: 0.13, MaxExp: 450 },
        { id: 13, Name: "稀有·龙鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 30, MaxPrice: 600, production_value: 1, MaxExp: 1500 },
        { id: 14, Name: "大西洋鲑鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 3, MaxPrice: 60, production_value: 0.18, MaxExp: 550 },
        { id: 15, Name: "稀有·大西洋鲑鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 40, MaxPrice: 800, production_value: 1.5, MaxExp: 1500 },
        { id: 16, Name: "黑鳍袋唇鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 4, MaxPrice: 80, production_value: 0.25, MaxExp: 500 },
        { id: 17, Name: "稀有·黑鳍袋唇鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 50, MaxPrice: 1000, production_value: 2, MaxExp: 1900 },
        { id: 18, Name: "带状珊瑚虾", Type: QSSZG_FishType.淡水鱼, MinPrice: 5, MaxPrice: 100, production_value: 0.35, MaxExp: 650 },
        { id: 19, Name: "天竺鲷", Type: QSSZG_FishType.淡水鱼, MinPrice: 7, MaxPrice: 140, production_value: 0.6, MaxExp: 700 },
        { id: 20, Name: "稀有·天竺鲷", Type: QSSZG_FishType.淡水鱼, MinPrice: 70, MaxPrice: 1400, production_value: 3.5, MaxExp: 2000 },
        { id: 21, Name: "梭鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 9, MaxPrice: 180, production_value: 0.8, MaxExp: 900 },
        { id: 22, Name: "条石鲷", Type: QSSZG_FishType.淡水鱼, MinPrice: 12, MaxPrice: 240, production_value: 1, MaxExp: 900 },
        { id: 23, Name: "稀有·条石鲷", Type: QSSZG_FishType.淡水鱼, MinPrice: 100, MaxPrice: 2000, production_value: 5, MaxExp: 2200 },
        { id: 24, Name: "鲤鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 14, MaxPrice: 280, production_value: 1.2, MaxExp: 1000 },
        { id: 25, Name: "稀有·鲤鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 120, MaxPrice: 2400, production_value: 5.5, MaxExp: 2400 },
        { id: 26, Name: "樱花虾", Type: QSSZG_FishType.淡水鱼, MinPrice: 18, MaxPrice: 360, production_value: 1.4, MaxExp: 1200 },
        { id: 27, Name: "中华管口鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 20, MaxPrice: 400, production_value: 1.5, MaxExp: 1300 },
        { id: 28, Name: "稀有·中华管口鱼", Type: QSSZG_FishType.淡水鱼, MinPrice: 140, MaxPrice: 2800, production_value: 7, MaxExp: 2600 },

        { id: 1000, Name: "日光鲨", Type: QSSZG_FishType.深海鱼, MinPrice: 40, MaxPrice: 800, production_value: 4, MaxExp: 2200 },
        { id: 1001, Name: "稀有·日光鲨", Type: QSSZG_FishType.深海鱼, MinPrice: 150, MaxPrice: 3000, production_value: 12, MaxExp: 5500 },
        { id: 1002, Name: "印度尼西亚搏鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 50, MaxPrice: 1000, production_value: 5, MaxExp: 2500 },
        { id: 1003, Name: "黑三角吊", Type: QSSZG_FishType.深海鱼, MinPrice: 70, MaxPrice: 1400, production_value: 7, MaxExp: 3000 },
        { id: 1004, Name: "黄麻鲈", Type: QSSZG_FishType.深海鱼, MinPrice: 90, MaxPrice: 1800, production_value: 9, MaxExp: 3300 },
        { id: 1005, Name: "稀有·黄麻鲈", Type: QSSZG_FishType.深海鱼, MinPrice: 250, MaxPrice: 5000, production_value: 25, MaxExp: 6000 },
        { id: 1006, Name: "蓝草孔雀鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 110, MaxPrice: 2300, production_value: 12, MaxExp: 2600 },
        { id: 1007, Name: "稀有·蓝草孔雀鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 350, MaxPrice: 7000, production_value: 30, MaxExp: 6800 },
        { id: 1008, Name: "蓝枪鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 130, MaxPrice: 2800, production_value: 13, MaxExp: 3600 },
        { id: 1009, Name: "稀有·蓝枪鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 450, MaxPrice: 9000, production_value: 35, MaxExp: 7000 },
        { id: 1010, Name: "蓝刺尾鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 150, MaxPrice: 3000, production_value: 14, MaxExp: 3600 },
        { id: 1011, Name: "鲹鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 180, MaxPrice: 3600, production_value: 15, MaxExp: 4800 },
        { id: 1012, Name: "单角鼻鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 200, MaxPrice: 4000, production_value: 16, MaxExp: 5400 },
        { id: 1013, Name: "稀有·单角鼻鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 500, MaxPrice: 10000, production_value: 40, MaxExp: 7000 },
        { id: 1014, Name: "美丽突额隆头鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 220, MaxPrice: 4400, production_value: 17, MaxExp: 4700 },
        { id: 1015, Name: "腔棘鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 230, MaxPrice: 4600, production_value: 17.5, MaxExp: 4600 },
        { id: 1016, Name: "稀有·腔棘鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 600, MaxPrice: 12000, production_value: 42, MaxExp: 7200 },
        { id: 1017, Name: "钻嘴鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 240, MaxPrice: 4800, production_value: 19, MaxExp: 5000 },
        { id: 1018, Name: "鬼尖嘴鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 260, MaxPrice: 5200, production_value: 20, MaxExp: 5000 },
        { id: 1019, Name: "稀有·鬼尖嘴鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 700, MaxPrice: 14000, production_value: 44, MaxExp: 7200 },
        { id: 1020, Name: "牛港鲹", Type: QSSZG_FishType.深海鱼, MinPrice: 280, MaxPrice: 7000, production_value: 20, MaxExp: 5000 },
        { id: 1021, Name: "猪鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 300, MaxPrice: 6000, production_value: 22, MaxExp: 5000 },
        { id: 1022, Name: "稀有·猪鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 800, MaxPrice: 16000, production_value: 60, MaxExp: 8000 },
        { id: 1023, Name: "魔鬼鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 330, MaxPrice: 6000, production_value: 25, MaxExp: 4400 },
        { id: 1024, Name: "稀有·魔鬼鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 10, MaxPrice: 200, production_value: 40, MaxExp: 3000 },
        { id: 1025, Name: "翻车鱼", Type: QSSZG_FishType.深海鱼, MinPrice: 400, MaxPrice: 12000, production_value: 10, MaxExp: 10000 },
        { id: 1026, Name: "大白鲨", Type: QSSZG_FishType.深海鱼, MinPrice: 500, MaxPrice: 10000, production_value: 44, MaxExp: 7000 },
        { id: 1027, Name: "鲸鲨", Type: QSSZG_FishType.深海鱼, MinPrice: 1200, MaxPrice: 24000, production_value: 100, MaxExp: 12000 },
    ];
    //通过名字获取数据
    public static GetDataFromName(Name: string): { id: number, Name: string, Type: QSSZG_FishType, MinPrice: number, MaxPrice: number, production_value: number, MaxExp: number } {
        let a;
        QSSZG_Constant.FishData.forEach((cd, index) => {
            if (cd.Name == Name) {
                a = QSSZG_Constant.FishData[index];
            }
        })
        return a;
    }
    //通过id获取数据
    public static GetDataFromID(ID: number): { id: number, Name: string, Type: QSSZG_FishType, MinPrice: number, MaxPrice: number, production_value: number, MaxExp: number } {
        let a;
        QSSZG_Constant.FishData.forEach((cd, index) => {
            if (cd.id == ID) {
                a = QSSZG_Constant.FishData[index];
            }
        })
        return a;
    }
    //通过鱼数据判断是否满级
    public static GetLevelFromData(fishdata: FishData) {
        if (fishdata.Exp >= QSSZG_Constant.GetDataFromID(fishdata.id).MaxExp) {
            return true;
        } else {
            return false;
        }
    }
    //通过鱼数据计算当前价值
    public static GetPriceFromData(fishdata: FishData): number {
        let data = QSSZG_Constant.GetDataFromID(fishdata.id);
        let price = (data.MaxPrice - data.MinPrice);
        let proportion = fishdata.Exp / data.MaxExp;
        price = price * proportion;
        return Number((data.MinPrice + price).toFixed(2));
    }
    //通过鱼数据获得每秒收益
    public static GetearningsFromData(fishdata: FishData): number {
        let earnings = 0;
        if (QSSZG_Constant.GetLevelFromData(fishdata)) {
            return QSSZG_Constant.GetDataFromID(fishdata.id).production_value;
        } else {
            return 0;
        }
    }
    //商店价格
    public static ShoppingPrice: number[][] = [
        [10, 150, 1000, 8000, 50000],//鱼苗
        [0, 20, 100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000],//背景
        [100, 2000, 10000, 30000, 200000, 0],//饲料价格
        [500, 2000, 5000, 12000, 30000, 100000],//鱼缸价格(升级价格为解锁价格的1倍3倍，10倍，30倍)
        [100, 200, 500, 1500, 3000, 10000, 30000, 100000],//装饰价格
    ]
    public static Shoppingpricescale: number[] = [1, 3, 10, 30, 0];//鱼缸升级的数值倍数
    //商店物品
    public static ShoppingName: string[][] = [
        ["淡水小可爱", "河塘鱼鱼", "珊瑚伙伴", "深海住民", "巨型憨憨"],//鱼苗
        ["海底", "冬季", "薰衣草", "苔藓牧场", "草莓田", "海水泡沫", "冰淇淋圣代", "闹鬼墓地", "核辐射", "岩浆", "黄金", "彩虹"],//背景
        ["绿藻球", "迷你舰艇", "盆栽艺术", "金字塔", "城堡", "火山", "神龛", "宝藏箱"],//装饰
    ]
    //通过商品名字获取价格
    public static NameToPrice(Name: string): number {
        for (let i = 0; i < QSSZG_Constant.ShoppingName.length; i++) {
            for (let j = 0; j < QSSZG_Constant.ShoppingName[i].length; j++) {
                if (QSSZG_Constant.ShoppingName[i][j] == Name) {
                    return QSSZG_Constant.ShoppingPrice[i][j];
                }
            }
        }
        console.log("没有找到该商品的价格!");
        return 0;
    }


    //鱼包数据
    public static FishbagData: number[][] = [
        [0, 0, 0, 1, 1, 1, 2, 3, 3, 3, 4, 5, 5, 5, 6, 7, 7, 7, 8, 9, 9, 9, 10, 11, 11, 11, 12, 12, 12, 13, 14, 14, 14],
        [15, 16, 16, 16, 17, 18, 18, 18, 19, 19, 19, 20, 21, 21, 21, 22, 22, 22, 23, 24, 24, 24, 25, 26, 26, 26, 27, 27, 27, 28],
        [1000, 1000, 1000, 1001, 1002, 1002, 1002, 1003, 1003, 1003, 1004, 1004, 1004, 1005, 1006, 1006, 1006, 1007, 1008, 1008, 1008],
        [1009, 1010, 1010, 1010, 1011, 1011, 1011, 1012, 1012, 1012, 1013, 1014, 1014, 1014, 1015, 1015, 1015, 1016, 1017, 1017, 1017],
        [1018, 1018, 1018, 1019, 1020, 1020, 1020, 1021, 1021, 1021, 1022, 1023, 1023, 1023, 1024, 1025, 1025, 1025, 1026, 1026, 1027],
    ]
    //图鉴数据
    public static Handbook: number[][] = [
        [0, 1, 3, 5, 7, 9, 11, 12, 14, 16, 18, 19, 21, 22, 24, 26, 27, 1000, 1002, 1003, 1004, 1006, 1008, 1010, 1011, 1012, 1014, 1015,
            1017, 1018, 1020, 1021, 1023, 1025, 1026, 1027
        ],//第一页普通
        [
            2, 4, 6, 8, 10, 13, 15, 17, 20, 23, 25, 28, 1001, 1005, 1007, 1009, 1013, 1016, 1019, 1022, 1024
        ]//第二页稀有
    ]
}