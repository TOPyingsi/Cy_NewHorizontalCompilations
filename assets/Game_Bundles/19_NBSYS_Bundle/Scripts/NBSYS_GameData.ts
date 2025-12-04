import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_GameData')
export class NBSYS_GameData {
    public static Data: { Name: string, CNName: string, vessel: string }[] = [
        { Name: "碘", CNName: "L2", vessel: "勺子" },
        { Name: "镁粉", CNName: "Mg", vessel: "勺子" },
        { Name: "铝粉", CNName: "Al", vessel: "勺子" },
        { Name: "蒸馏水", CNName: "H2o", vessel: "滴管" },
        { Name: "空气", CNName: "O2N2", vessel: "气囊" },
        { Name: "铜片", CNName: "铜片", vessel: "夹子" },
        { Name: "烧过的铜片", CNName: "铜片", vessel: "夹子" },
        { Name: "硫酸", CNName: "H2So4", vessel: "滴管" },
        { Name: "生石灰", CNName: "Cao", vessel: "勺子" }
    ]


    //通过物质名字获取其他属性
    public static GetData(name: string): { Name: string, CNName: string, vessel: string } {
        return NBSYS_GameData.Data.find((data) => { return data.Name == name });
    }

    public static Chemical_reaction: { 反应: string, 所需材料: string[], 所需环境: string[] }[] = [
        { 反应: "碘水铝反应", 所需材料: ["碘", "铝粉", "蒸馏水"], 所需环境: [] },
        { 反应: "碘水镁反应", 所需材料: ["碘", "镁粉", "蒸馏水"], 所需环境: [] },
        { 反应: "粉尘爆炸", 所需材料: ["空气"], 所需环境: ["高温"] },
        { 反应: "硫酸铜反应", 所需材料: ["硫酸", "烧过的铜片"], 所需环境: [] },
        { 反应: "生石灰与水反应", 所需材料: ["生石灰", "蒸馏水"], 所需环境: [] },
    ]


    public static QiCaiData: { Name: string, Layer: string }[] = [
        { Name: "碘", Layer: "中层" },
        { Name: "镁粉", Layer: "中层" },
        { Name: "铝粉", Layer: "中层" },
        { Name: "蒸馏水", Layer: "中层" },
        { Name: "试剂管", Layer: "中层" },
        { Name: "勺子", Layer: "顶层" },
        { Name: "滴管", Layer: "顶层" },
        { Name: "气囊", Layer: "中层" },
        { Name: "蜡烛", Layer: "中层" },
        { Name: "火柴盒", Layer: "中层" },
        { Name: "夹子", Layer: "顶层" },
        { Name: "铜片", Layer: "中层" },
        { Name: "硫酸", Layer: "中层" },
        { Name: "酒精灯", Layer: "中层" },
        { Name: "生石灰", Layer: "中层" },
    ]


    public static Template: { Name: string, QiCai: { Name: string, posX: number, posY: number }[], Text: string, Winner: string[] }[] = [
        {
            Name: "滴水生烟",
            QiCai: [
                { Name: "碘", posX: 500, posY: 700 },
                { Name: "镁粉", posX: 700, posY: 700 },
                { Name: "铝粉", posX: 900, posY: 700 },
                { Name: "蒸馏水", posX: 1100, posY: 700 },
                { Name: "勺子", posX: 600, posY: 500 },
                { Name: "勺子", posX: 600, posY: 400 },
                { Name: "滴管", posX: 1300, posY: 600 },
                { Name: "试剂管", posX: 1500, posY: 600 },
            ],
            Text: "1、在试管中加入少量镁粉(或铝粉)和少量固体碘，振荡混合均匀.(也可将药品放置在玻璃片上)\n2、滴加3-5个滴蒸馏水，观察现象。",
            Winner: ["碘水铝反应", "碘水镁反应"]
        },
        {
            Name: "粉尘爆炸",
            QiCai: [
                { Name: "气囊", posX: 500, posY: 300 },
                { Name: "蜡烛", posX: 1600, posY: 600 },
                { Name: "火柴盒", posX: 1600, posY: 300 },
            ],
            Text: "点燃蜡烛，放到粉尘爆炸装置中，打开空气气囊的阀门，观察实验现象。",
            Winner: ["粉尘爆炸"]
        },
        {
            Name: "铜与硫酸",
            QiCai: [
                { Name: "火柴盒", posX: 1500, posY: 280 },
                { Name: "酒精灯", posX: 900, posY: 300 },
                { Name: "铜片", posX: 1300, posY: 300 },
                { Name: "试剂管", posX: 500, posY: 350 },
                { Name: "硫酸", posX: 700, posY: 300 },
                { Name: "滴管", posX: 1500, posY: 600 },
                { Name: "夹子", posX: 1100, posY: 300 },
            ],
            Text: "1、点燃蜡烛，用坩埚钳夹住铜片，在酒精灯火焰上方对铜片进行烟熏，观察现象。\n2、取在酒精灯火焰上灼烧后的铜片，在试管中倒入适量稀硫酸溶液，将灼烧后的铜片放入试管中，观察现象。",
            Winner: ["硫酸铜反应"]
        },
        {
            Name: "生石灰与水",
            QiCai: [
                { Name: "蒸馏水", posX: 500, posY: 350 },
                { Name: "勺子", posX: 500, posY: 600 },
                { Name: "试剂管", posX: 1100, posY: 350 },
                { Name: "生石灰", posX: 700, posY: 350 },
                { Name: "滴管", posX: 900, posY: 350 },
            ],
            Text: "1、使用勺子取出一勺生石灰，放在试管中。\n2、使用滴管将水倒入试管中，观察现象。",
            Winner: ["生石灰与水反应"]
        },
    ]
}


