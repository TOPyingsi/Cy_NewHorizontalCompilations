import { _decorator, Component, director, Mask, Node } from 'cc';
import Banner, { BannerMode } from '../../Banner';
import { GameManager } from '../../GameManager';
import { Panel, UIManager } from './UIManager';
import { Tools } from '../Utils/Tools';
import { ProjectEventManager } from './ProjectEventManager';
const { ccclass, property } = _decorator;
export enum Strategy {//所有策略
    王勇VR = "王勇VR",
    王勇OR = "王勇OR",
    深圳VR = "深圳VR",
    深圳OR = "深圳OR",
    深圳快手 = "深圳快手",
    孙波 = "孙波",
    万总HW = "万总HW"
}

export enum BannerType {//广告类型
    Banner = "Banner",
    原生 = "原生",
    视屏 = "视屏",
    宝箱 = "宝箱",
    二次原 = "二次原",
    三十秒自弹原生 = "三十秒自弹原生",//此类广告加在其他策略中，否则重复执行会导致广告异常
    三十秒自弹Banner = "三十秒自弹Banner",//此类广告加在其他策略中，否则重复执行会导致广告异常
    四十秒自弹原生 = "四十秒自弹原生",//此类广告加在其他策略中，否则重复执行会导致广告异常
    延迟二十秒四十秒自弹原生 = "延迟二十秒四十秒自弹原生",//此类广告加在其他策略中，否则重复执行会导致广告异常
    五分钟自弹宝箱 = "五分钟自弹宝箱",//此类广告加在其他策略中，否则重复执行会导致广告异常
    三分钟自弹视屏 = "三分钟自弹视屏",//此类广告加在其他策略中，否则重复执行会导致广告异常
    三十五秒自弹添加桌面 = "三十五秒自弹添加桌面",//此类广告加在其他策略中，否则重复执行会导致广告异常
}

export enum MaskType {//屏蔽类型
    时间屏蔽 = "时间屏蔽",
    地区屏蔽 = "地区屏蔽",
    工作日屏蔽 = "工作日屏蔽",
    主页屏蔽 = "主页屏蔽",
}

@ccclass('BannerManager')
export class BannerManager extends Component {
    private static _instance: BannerManager = null;
    public static get Instance(): BannerManager {
        if (this._instance == null) {
            this._instance = new BannerManager();
        }
        return this._instance;
    }
    protected onLoad(): void {
        BannerManager._instance = this;

    }


    //整体策略(可以自行添加)(一般情况仅需修改此处)
    public static Strategy: Strategy = Strategy.王勇VR;



    //当前游戏策略
    public CurrentStrategy = null;
    //初始化(在黑白包判断完毕或者GG1GG2判断完毕之后执行)
    Init() {
        console.log("初始化广告脚本...");
        if (BannerManager.Strategy == Strategy.王勇VR) {
            if (Banner.RegionMask) {
                this.CurrentStrategy = this.StrategyMode2;//黑包
            } else {
                this.CurrentStrategy = this.StrategyMode1;//白包
            }
        }
        if (BannerManager.Strategy == Strategy.王勇OR) {//工作日屏蔽
            if (Banner.WorkdayMask) {
                this.CurrentStrategy = this.StrategyMode2;//黑包
            } else {
                this.CurrentStrategy = this.StrategyMode1;//白包
            }
        }
        if (BannerManager.Strategy == Strategy.深圳VR) {
            if (window['htn'].getGGType == 0) {
                this.CurrentStrategy = this.StrategyMode3;//深圳策略GG0
            }
            if (window['htn'].getGGType == 1) {
                this.CurrentStrategy = this.StrategyMode4;//深圳VR策略GG1
            }
            if (window['htn'].getGGType == 2) {
                this.CurrentStrategy = this.StrategyMode5;//深圳VR策略GG2
            }
        }
        if (BannerManager.Strategy == Strategy.深圳OR) {
            if (window['htn'].getGGType == 0) {
                this.CurrentStrategy = this.StrategyMode3;//深圳策略GG0
            }
            if (window['htn'].getGGType == 1) {
                this.CurrentStrategy = this.StrategyMode6;//深圳OR策略GG1
            }
            if (window['htn'].getGGType == 2) {
                this.CurrentStrategy = this.StrategyMode7;//深圳OR策略GG2
            }
        }
        if (BannerManager.Strategy == Strategy.深圳快手) {
            this.CurrentStrategy = this.StrategyMode8;//深圳快手策略
        }
        if (BannerManager.Strategy == Strategy.孙波) {
            this.CurrentStrategy = this.StrategyMode9;//孙波策略
        }
        if (BannerManager.Strategy == Strategy.万总HW) {
            this.CurrentStrategy = this.StrategyMode10;//孙波策略
        }
        if (!this.CurrentStrategy) {
            console.log("广告未初始化！");
        } else {//处理其他策略
            this.ExecuteBanner(this.CurrentStrategy.首次主场景策略);
            this.ExecuteBanner(this.CurrentStrategy.其他策略);
            this.CurrentStrategy.游戏开始策略.forEach((element) => {
                if (element[0] == BannerType.宝箱 && this.GetBannerIsShow(element)) {
                    ProjectEventManager.GameStartIsShowTreasureBox = true;
                    console.log("游戏开始的时候有宝箱");
                }
            })
        }
    }


    //#region 策略
    //规范: [广告类型, 屏蔽规则1, 屏蔽规则2.....]
    //策略1(王勇VR白包)可以自行增加或修改当前策略,
    public StrategyMode1 = {
        首次主场景策略: [],
        游戏开始策略: [],
        游戏结束策略: [[BannerType.原生], [BannerType.Banner]],
        弹出窗口策略: [],
        页面转换策略: [],
        返回主页策略: [[BannerType.Banner]],
        其他策略: []//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件（不要将这些事件填入其他策略中反复调用）
    }
    //策略2(王勇VR黑包)
    public StrategyMode2 = {
            首次主场景策略: [[BannerType.二次原], [BannerType.宝箱, MaskType.时间屏蔽]],
            游戏开始策略: [[BannerType.宝箱, MaskType.时间屏蔽], [BannerType.原生], [BannerType.Banner]],
            游戏结束策略: [[BannerType.宝箱, MaskType.时间屏蔽], [BannerType.原生], [BannerType.Banner]],
            弹出窗口策略: [[BannerType.原生]],
            页面转换策略: [],
            返回主页策略: [[BannerType.原生]],
            其他策略: [[BannerType.三十秒自弹原生], [BannerType.三十五秒自弹添加桌面]]//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件
        }
    //策略3(深圳正常包)
    public StrategyMode3 = {
        首次主场景策略: [],
        游戏开始策略: [],
        游戏结束策略: [[BannerType.原生], [BannerType.Banner]],
        弹出窗口策略: [],
        页面转换策略: [],
        返回主页策略: [[BannerType.Banner]],
        其他策略: [],//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件
    }
    //策略4(深圳VRGG1)
    public StrategyMode4 = {
        首次主场景策略: [],
        游戏开始策略: [],
        游戏结束策略: [[BannerType.原生], [BannerType.Banner]],
        弹出窗口策略: [],
        页面转换策略: [],
        返回主页策略: [],
        其他策略: [[BannerType.五分钟自弹宝箱]]//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件
    }
    //策略5(深圳VRGG2)
    public StrategyMode5 = {
        首次主场景策略: [[BannerType.二次原], [BannerType.宝箱]],
        游戏开始策略: [[BannerType.宝箱]],
        游戏结束策略: [[BannerType.宝箱, MaskType.地区屏蔽]],
        弹出窗口策略: [],
        页面转换策略: [],
        返回主页策略: [[BannerType.宝箱, MaskType.地区屏蔽]],
        其他策略: [[BannerType.四十秒自弹原生], [BannerType.延迟二十秒四十秒自弹原生], [BannerType.三十五秒自弹添加桌面]],//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件
    }
    //策略4(深圳ORGG1)
    public StrategyMode6 = {
        首次主场景策略: [],
        游戏开始策略: [],
        游戏结束策略: [[BannerType.原生], [BannerType.Banner]],
        弹出窗口策略: [[BannerType.原生]],
        页面转换策略: [[BannerType.原生]],
        返回主页策略: [],
        其他策略: []//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件
    }
    //策略5(深圳ORGG2)
    public StrategyMode7 = {
        首次主场景策略: [[BannerType.二次原]],
        游戏开始策略: [],
        游戏结束策略: [[BannerType.原生], [BannerType.Banner]],
        弹出窗口策略: [[BannerType.原生]],
        页面转换策略: [[BannerType.原生]],
        返回主页策略: [],
        其他策略: [[BannerType.四十秒自弹原生], [BannerType.延迟二十秒四十秒自弹原生], [BannerType.三十五秒自弹添加桌面]]//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件
    }
    //策略6(深圳快手)
    public StrategyMode8 = {
        首次主场景策略: [],
        游戏开始策略: [[BannerType.视屏, MaskType.时间屏蔽]],
        游戏结束策略: [[BannerType.视屏, MaskType.时间屏蔽], [BannerType.原生]],
        弹出窗口策略: [],
        页面转换策略: [[BannerType.原生]],
        返回主页策略: [[BannerType.宝箱, MaskType.地区屏蔽, MaskType.时间屏蔽]],
        其他策略: [[BannerType.三十秒自弹原生, MaskType.时间屏蔽], [BannerType.三分钟自弹视屏, MaskType.时间屏蔽]]//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件
    }
    //策略7(孙波快手)
    public StrategyMode9 = {
        首次主场景策略: [[BannerType.二次原]],
        游戏开始策略: [[BannerType.原生], [BannerType.Banner]],
        游戏结束策略: [[BannerType.原生], [BannerType.Banner]],
        弹出窗口策略: [[BannerType.原生]],
        页面转换策略: [],
        返回主页策略: [[BannerType.原生]],
        其他策略: [[BannerType.三十秒自弹原生], [BannerType.三十五秒自弹添加桌面]]//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件
    }
    //策略8(万总HW)
    public StrategyMode10 = {
        首次主场景策略: [],
        游戏开始策略: [[BannerType.原生]],
        游戏结束策略: [[BannerType.原生]],
        弹出窗口策略: [[BannerType.原生]],
        页面转换策略: [[BannerType.原生]],
        返回主页策略: [],
        其他策略: [[BannerType.三十秒自弹原生, MaskType.地区屏蔽], [BannerType.三十秒自弹Banner, MaskType.地区屏蔽], [BannerType.三十五秒自弹添加桌面]]//其他策略是指30s自弹，20s自弹，5分钟自弹宝箱等事件
    }
    //#endregion



    //游戏开始
    GameStart(GameName: string) {
        if (!this.CurrentStrategy) {
            console.log("广告未初始化！");
            return;
        }
        this.ExecuteBanner(this.CurrentStrategy.游戏开始策略);
    }
    //游戏结束
    GameOver(GameName: string) {
        if (!this.CurrentStrategy) {
            console.log("广告未初始化！");
            return;
        }
        this.ExecuteBanner(this.CurrentStrategy.游戏结束策略);
    }
    //弹出窗口
    OpenWindow(GameName: string) {
        if (!this.CurrentStrategy) {
            console.log("广告未初始化！");
            return;
        }
        this.ExecuteBanner(this.CurrentStrategy.弹出窗口策略);
    }
    //页面转换
    Changgepage(GameName: string) {
        if (!this.CurrentStrategy) {
            console.log("广告未初始化！");
            return;
        }
        this.ExecuteBanner(this.CurrentStrategy.页面转换策略);
    }
    //返回主页
    ReturnHomepage(GameName: string) {
        if (!this.CurrentStrategy) {
            console.log("广告未初始化！");
            return;
        }
        this.ExecuteBanner(this.CurrentStrategy.返回主页策略);
    }

    private CDData: string[][] = [];//CD池
    //传入策略执行
    ExecuteBanner(data: string[][]) {
        for (let i = 0; i < data.length; i++) {
            if (this.GetBannerIsShow(data[i])) {
                if (this.CDData.indexOf(data[i]) != -1) {
                    console.log("此广告在CD池中，不展示！");
                    return;
                }
                let BannerID: string = "";
                if (this.ReturnAdvertising(data[i], "ID:") != "") {
                    BannerID = this.ReturnAdvertising(data[i], "ID:");
                }
                let Top: number = -999;
                if (this.ReturnAdvertising(data[i], "Top:") != "") {
                    Top = Number(this.ReturnAdvertising(data[i], "Top:"));
                }
                let Left: number = -999;
                if (this.ReturnAdvertising(data[i], "Left:") != "") {
                    Left = Number(this.ReturnAdvertising(data[i], "Left:"));
                }
                let Cd: number = -999;
                if (this.ReturnAdvertising(data[i], "Cd:") != "") {
                    Cd = Number(this.ReturnAdvertising(data[i], "Cd:"));
                    if (Cd > 0) {
                        this.CDData.push(data[i]);
                        this.scheduleOnce(() => {
                            this.CDData.splice(this.CDData.indexOf(data[i]), 1);
                        }, Cd)
                    }
                }
                if (data[i][0] == BannerType.Banner) {
                    Banner.Instance.ShowBannerAd(BannerID == "" ? null : BannerID);
                }
                if (data[i][0] == BannerType.原生) {
                    Banner.Instance.ShowCustomAd(BannerID == "" ? null : BannerID, Top == -999 ? null : Top, Left == -999 ? null : Left);
                }
                if (data[i][0] == BannerType.视屏) {
                    Banner.Instance.ShowVideoAd(() => { });
                }
                if (data[i][0] == BannerType.宝箱) {
                    if (Banner.Mode == BannerMode.测试包) return;
                    UIManager.ShowPanel(Panel.TreasureBoxPanel);
                }
                if (data[i][0] == BannerType.二次原) {
                    Banner.repeatedly = 1;
                    Banner.Instance.ShowCustomAd(BannerID == "" ? null : BannerID);
                }
                if (data[i][0] == BannerType.四十秒自弹原生) {
                    Banner.Instance.StartPopupAd(40, BannerID == "" ? null : BannerID);
                }
                if (data[i][0] == BannerType.三十秒自弹原生) {
                    Banner.Instance.StartPopupAd(30);
                }
                if (data[i][0] == BannerType.三十秒自弹Banner) {
                    Banner.Instance.StartBannerAd(30);
                }
                if (data[i][0] == BannerType.五分钟自弹宝箱) {
                    BannerManager.Instance.schedule(() => {
                        UIManager.ShowPanel(Panel.TreasureBoxPanel);
                    }, 300)
                }
                if (data[i][0] == BannerType.三分钟自弹视屏) {
                    Banner.Instance.StartVidoePopupAd(180);
                }
                if (data[i][0] == BannerType.三十五秒自弹添加桌面) {
                    Banner.Instance.StartPopupAddShortcut(35);
                }
                if (data[i][0] == BannerType.延迟二十秒四十秒自弹原生) {
                    this.scheduleOnce(() => {
                        Banner.Instance.StartPopupAd(40, BannerID == "" ? null : BannerID);
                    }, 20)
                }
            }
        }
    }

    //返回数组中的字符数据
    ReturnAdvertising(data: string[], _type: string): string {
        data = data.slice();
        data.splice(0, 1);
        let _TypeLeng = _type.length;
        for (let index = 0; index < data.length; index++) {
            if (Tools.GetEnumValues(MaskType).indexOf(data[index]) == -1 && data[index].slice(0, _TypeLeng) == _type) {
                return data[index].slice(_TypeLeng, data[index].length);
            }
        }
        return "";
    }

    //判断广告屏蔽条件是否满足
    GetBannerIsShow(data: string[]): boolean {
        let isCanShow: boolean = true;
        for (let i = 1; i < data.length; i++) {
            if (data[i] == MaskType.地区屏蔽) {
                if (Banner.RegionMask == false) isCanShow = false;
            }
            if (data[i] == MaskType.时间屏蔽) {
                if (Banner.TimeMask == false) isCanShow = false;
            }
            if (data[i] == MaskType.工作日屏蔽) {
                if (Banner.WorkdayMask == false) isCanShow = false;
            }
            if (data[i] == MaskType.主页屏蔽) {
                if (director.getScene().name == GameManager.StartScene) isCanShow = false;
            }
        }
        return isCanShow;
    }












    /**
            * @zh 微信专项广告(请勿在master分支的脚本中调用，只有在模板无法提供的特殊广告规则情况下调用)。
            * 
            * @example
            * Type是广告类型，left和top填0-1,例如left为0在最左边，left为1在最右边(需要适当减去广告宽度)
            */

    public ShowWxAdvertising(Type: WXBannerType, left: number = 0, top: number = 0) {
        switch (Type) {
            case WXBannerType.Banner:
                Banner.Instance.CreateWXBanner();
                break;
            case WXBannerType.插屏:
                Banner.Instance.CreateWXCustomAd();
                break;
            case WXBannerType.视屏:
                Banner.Instance.CreateWXVideo(() => { });
                break;
            case WXBannerType.原生左单格子:
                Banner.Instance.ShowLeftGridAds(left, top);
                break;
            case WXBannerType.原生右单格子:
                Banner.Instance.ShowRightGridAds(left, top);
                break;
            case WXBannerType.原生矩阵格子:
                Banner.Instance.ShowGridAds();
                break;
            case WXBannerType.垂直单列格子左:
                Banner.Instance.ShowLeftColumnGridAds(left, top);
                break;
            case WXBannerType.垂直单列格子右:
                Banner.Instance.ShowRightColumnGridAds(left, top);
                break;
            case WXBannerType.平行单行格子:
                Banner.Instance.ShowLineGridAds(left, top);
                break;
        }

    }


}


export enum WXBannerType {//微信广告类型
    Banner = "Banner",
    插屏 = "插屏",//原生
    视屏 = "视屏",
    原生左单格子 = "原生左单格子",
    原生右单格子 = "原生右单格子",
    原生矩阵格子 = "原生矩阵格子",
    垂直单列格子左 = "垂直单列格子左",
    垂直单列格子右 = "垂直单列格子右",
    平行单行格子 = "平行单行格子"
}