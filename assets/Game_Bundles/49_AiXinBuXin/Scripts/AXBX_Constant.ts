import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AXBX_Constant')
export class AXBX_Constant {
    public static AXBX_PropType: string[] = ["苹果", "饮料", "三明治", "魔方", "鼠标", "笔记本", "水杯"];

    public static AXBX_AudioData: { 音效名字: string, 音效类型: string, 属于: string }[] = [
        { 音效名字: "苹果砸", 音效类型: "砸", 属于: "苹果" },
        { 音效名字: "苹果吃", 音效类型: "吃", 属于: "苹果" },
        { 音效名字: "饮料砸", 音效类型: "砸", 属于: "饮料" },
        { 音效名字: "饮料喝", 音效类型: "喝", 属于: "饮料" },
        { 音效名字: "饮料摇", 音效类型: "摇", 属于: "饮料" },
        { 音效名字: "三明治砸", 音效类型: "砸", 属于: "三明治" },
        { 音效名字: "三明治吃", 音效类型: "吃", 属于: "三明治" },
        { 音效名字: "魔方砸", 音效类型: "砸", 属于: "魔方" },
        { 音效名字: "魔方玩", 音效类型: "玩", 属于: "魔方" },
        { 音效名字: "鼠标砸", 音效类型: "砸", 属于: "鼠标" },
        { 音效名字: "鼠标玩", 音效类型: "玩", 属于: "鼠标" },
        { 音效名字: "笔记本砸", 音效类型: "砸", 属于: "笔记本" },
        { 音效名字: "笔记本翻页", 音效类型: "翻页", 属于: "笔记本" },
        { 音效名字: "水杯砸", 音效类型: "砸", 属于: "水杯" },
        { 音效名字: "水杯倒水", 音效类型: "倒水", 属于: "水杯" },
        { 音效名字: "水杯喝", 音效类型: "喝", 属于: "水杯" },
    ]
    //获取数据
    public static getAudioDataByPropType(propType: string): { 音效名字: string, 音效类型: string, 属于: string }[] {
        return this.AXBX_AudioData.filter(audio => audio.属于 === propType);
    }


}


