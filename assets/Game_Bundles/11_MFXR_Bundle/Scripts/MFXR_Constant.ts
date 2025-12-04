import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MFXR_Constant')
export class MFXR_Constant {
    public static issue: string[] = [
        "先有鸡还是先有蛋",
        "说实话你也不想吃了吧！",
        "都说装满了,怎么还在吃？",
        "买这么多米为什么不多买两个菜！",
        "这货脑颗里是瘤子还是水"
    ];
    public static answer: string[][] = [
        ["当然是先有鸡", "再吃一次鸡蛋盖饭", "一袋米要扛几楼"],
        ["是我输了吗？", "压里马斯内", "你知道米饭为什么白吗？？？"],
        ["最后一口，没骗你", "吃都吃了，你在坚持一下", "只剩一斤了，加油干"],
        ["但买菜的钱好像又能多买些米", "勉强吃下去了", "再来一次"],
        ["问这么多干嘛，干就完事了！", "是对米饭的热爱", "免疫系统怎么说？"],
    ];
}


