import { _decorator } from 'cc';
import ZWDZJS_GameManager from './ZWDZJS_GameManager';
const { ccclass, property } = _decorator;

@ccclass('ZWDZJS_GameDate')
export default class ZWDZJS_GameDate {
    //    //植物0豌豆射手1向日葵2樱桃炸弹3坚果墙4电视机5高坚果
    static ZhiWu_price: number[] = [100, 50, 150, 50, 175, 150];//植物的价格
    static ZhiWu_Cd: number[] = [7.5, 7.5, 45, 30, 10, 60];//植物种植Cd
    static JieSuo: number[] = [1, 1, 0, 0, 0, 0];//解锁植物
    static IsTiphint: number[] = [0, 0, 0, 0, 0, 0];//植物首次提示
    static TipPool: number[] = [];//提示池
    static ZhiWu_Name: string[][] = [
        ["木星", "地球", "双子星", "土星", "天王星", "火星"],
        ["香蕉射手_Q版", "向日葵_Q版", "樱桃炸弹_Q版", "坚果墙_Q版", "卷心菜_Q版", "高坚果_Q版"],
        [""]
    ];
    static ZhiWu_MiaoShu: string[][] = [
        ["木星可以远程发射流星，对敌人造成伤害",
            "地球可以吸收宇宙能量，产生能量点",
            "双子星可以一次性对附近敌人造成巨量伤害，但是也会消耗自身",
            "土星不具备攻击能力，但是可以承受巨额的伤害",
            "天王星视可以对前方短距离造成范围伤害",
            "火星可以对前方短距离的敌人造成单体伤害，而且可以承受比土星更多的伤害"
        ],
        ["香蕉射手可以远程发射香蕉，对敌人造成伤害",
            "向日葵可以吸收太阳能量，产生阳光",
            "樱桃炸弹可以一次性对附近敌人造成巨量伤害，但是也会消耗自身",
            "坚果墙不具备攻击能力，但是可以承受巨额的伤害",
            "卷心菜可以对前方短距离造成范围伤害",
            "高坚果可以对前方短距离的敌人造成单体伤害，而且可以承受比土星更多的伤害"
        ]];
    static Jiangshi_Name: string[][] = [
        ["普通僵尸_星空版", "暴走僵尸_星空版", "铁桶僵尸_星空版", "僵尸王_星空版"],
        ["普通僵尸_Q版", "暴走僵尸_Q版", "铁桶僵尸_Q版", "僵尸王_Q版"],
        [""]
    ];
    //倒计时文本
    static TimeText: { Mode: string, Text: string }[] = [
        { Mode: "星空版", Text: "星球" },
        { Mode: "Q版", Text: "僵尸" }, ,
    ];
    //通过ID获取僵尸名字
    public static GetZombieNameById(Id: number): string {
        if (ZWDZJS_GameManager.GameMode == "星空版") return ZWDZJS_GameDate.Jiangshi_Name[0][Id];
        if (ZWDZJS_GameManager.GameMode == "Q版") return ZWDZJS_GameDate.Jiangshi_Name[1][Id];
        return "数据错误"
    }
    //通过ID获取名字
    public static GetNameById(Id: number): string {
        if (ZWDZJS_GameManager.GameMode == "星空版") return ZWDZJS_GameDate.ZhiWu_Name[0][Id];
        if (ZWDZJS_GameManager.GameMode == "Q版") return ZWDZJS_GameDate.ZhiWu_Name[1][Id];
        return "数据错误"
    }
    //通过ID获取描述
    public static GetTextById(Id: number): string {
        if (ZWDZJS_GameManager.GameMode == "星空版") return ZWDZJS_GameDate.ZhiWu_MiaoShu[0][Id];
        if (ZWDZJS_GameManager.GameMode == "Q版") return ZWDZJS_GameDate.ZhiWu_MiaoShu[1][Id];
        return "数据错误"
    }
    //通过版本获取是否有技能模式
    public static GetIsCanSkii(): boolean {
        if (ZWDZJS_GameManager.GameMode == "星空版") return false;
        if (ZWDZJS_GameManager.GameMode == "Q版") return true;
        return false;
    }

    static GuanQia_JieSuo: number[] = [2, 3, 4, 5, -999];//对应关卡胜利解锁的植物-999表示最后一关
    static GuanQia_Date: number[][][][] = [
        [//关卡1[id,数量,随机起始Y，随机末尾Y]
            [//第一波
                [0, 1, 800, 800], [0, 2, 800, 1100]
            ],
            [//第二波
                [0, 2, 400, 600], [0, 4, 500, 800], [0, 6, 700, 1200]
            ],
            [//第三波
                [0, 4, 400, 700], [0, 8, 600, 1100], [0, 12, 800, 1300]
            ]
        ],
        [//关卡2[id,数量,随机起始Y，随机末尾Y]
            [//第一波
                [0, 1, 800, 800], [0, 2, 800, 1200]
            ],
            [//第二波
                [0, 4, 400, 600], [1, 2, 400, 800], [0, 6, 600, 1400]
            ],
            [//第三波
                [1, 4, 400, 700], [0, 10, 600, 1000], [1, 10, 800, 1500]
            ]
        ],
        [//关卡3[id,数量,随机起始Y，随机末尾Y]
            [//第一波
                [0, 1, 800, 800], [0, 4, 800, 1000]
            ],
            [//第二波
                [1, 4, 400, 600], [0, 6, 600, 1200], [2, 2, 800, 1500]
            ],
            [//第三波
                [1, 4, 400, 700], [2, 4, 800, 1300], [0, 12, 900, 1500]
            ],
            [//第四波
                [1, 4, 400, 700], [2, 8, 800, 1300], [0, 12, 900, 1500]
            ]
        ],
        [//关卡4[id,数量,随机起始Y，随机末尾Y]
            [//第一波
                [0, 1, 800, 800], [0, 8, 800, 1200]
            ],
            [//第二波
                [0, 10, 400, 600], [1, 8, 600, 1000], [2, 4, 600, 1200]
            ],
            [//第三波
                [0, 12, 400, 700], [1, 12, 600, 1200], [2, 6, 800, 1400]
            ],
            [//第四波
                [1, 10, 400, 700], [2, 6, 600, 1200], [3, 2, 1200, 1800]
            ]
        ],
        [//关卡5[id,数量,随机起始Y，随机末尾Y]
            [//第一波
                [0, 1, 800, 800], [2, 2, 800, 1200]
            ],
            [//第二波
                [0, 18, 400, 600], [1, 10, 600, 1000], [2, 4, 1000, 1800]
            ],
            [//第三波
                [0, 20, 400, 700], [1, 12, 600, 1200], [2, 6, 1000, 1450]
            ],
            [//第四波
                [2, 10, 400, 600], [3, 4, 600, 1000]
            ],
            [//第五波
                [2, 15, 400, 800], [3, 12, 600, 1300]
            ]
        ]
    ];
}


