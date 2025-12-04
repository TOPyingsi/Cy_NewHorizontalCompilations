

import { _decorator, Component, Enum, Node, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_Constant')
export class KKDKF_Constant extends Component {
    //描述
    public static Drink: { id: number, name: string, Price: number, describe: string, angryword: string }[] = [
        { id: 0, name: "意式浓缩咖啡", Price: 5, describe: "我想要一杯意式浓缩咖啡！", angryword: "这是什么东西！" },
        { id: 1, name: "冰美式", Price: 7, describe: "能麻烦你帮我做一杯冰美式吗？", angryword: "做的真难喝" },
        { id: 2, name: "冰拿铁", Price: 8, describe: "你好，我想要一杯冰拿铁！", angryword: "这根本不是我想要的！" },
        { id: 3, name: "冰草莓拿铁", Price: 10, describe: "你好，我想要一份冰草莓拿铁。", angryword: "货不对板，差评" },
        { id: 4, name: "美式咖啡", Price: 8, describe: "你好，能帮我调一份美式咖啡吗？", angryword: "你这美式咖啡放错材料了吧！" },
        { id: 5, name: "拿铁", Price: 10, describe: "我想要一杯最简单的拿铁", angryword: "这根本不是拿铁！！！" },
        { id: 6, name: "草莓拿铁", Price: 12, describe: "我想要一份拿铁，草莓味的！", angryword: "你做错了，我不会为此买单的！" },
        { id: 7, name: "冰草莓果汁", Price: 14, describe: "我想要一份果汁，草莓味的，最好加点冰块！", angryword: "这是科技果汁吗，怎么这个味道！" },
    ];

    //饮料数据
    public static Coffeedata: number[][] = [
        [0],
        [0, 2, 6],
        [6, 3, 0],
        [6, 5, 3, 0],
        [0, 1],
        [0, 4],
        [0, 5, 4],
        [7, 5, 2, 6],
    ]
}