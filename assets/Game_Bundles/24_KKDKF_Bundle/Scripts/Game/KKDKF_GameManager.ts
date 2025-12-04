import { _decorator, AudioSource, Component, director, EventTouch, find, Game, instantiate, Label, Node, PhysicsSystem, PhysicsSystem2D, Prefab, random, resources, Size, Sprite, SpriteFrame, Tween, tween, UIOpacity, UITransform, v3, Vec2, Vec3 } from 'cc';
import { KKDKF_AudioManager } from '../KKDKF_AudioManager';
import Banner from '../../../../Scripts/Banner';
import { KKDKF_Course } from './KKDKF_Course';
import { KKDKF_GameData } from '../KKDKF_GameData';
import { KKDKF_Guest } from './KKDKF_Guest';
import { KKDKF_Constant } from '../Data/KKDKF_Constant';
import { KKDKF_BeginnerGuidance } from './KKDKF_BeginnerGuidance';
import { KKDKF_ShopBeginnerGuidance } from './KKDKF_ShopBeginnerGuidance';
import { ProjectEvent, ProjectEventManager } from '../../../../Scripts/Framework/Managers/ProjectEventManager';
import { KKDKF_Incident } from '../KKDKF_Incident';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../../Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('KKDKF_GameManager')
export class KKDKF_GameManager extends Component {
    @property(Node)
    JieKeQU: Node = null;
    @property(Node)
    MainCanvase: Node = null;
    @property(Node)
    UI: Node = null;
    @property(Node)
    MakeBG: Node = null;
    public GameStart: boolean = false;
    public residueGuest: number = 3;//剩余客人数量
    public ThisDayMoney: number = 0;//今日赚得钱
    public ThisDayExp: number = 0;//今日赚得经验
    public IsOnShop: boolean = true;//是在店里还是厨房true在店里


    private static _instance: KKDKF_GameManager = null;
    public static get Instance(): KKDKF_GameManager {
        if (this._instance == null) {
            this._instance = new KKDKF_GameManager();
        }
        return this._instance;
    }
    protected onLoad(): void {
        KKDKF_GameManager._instance = this;
        // PhysicsSystem2D.instance.debugDrawFlags = 1;
    }
    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "可口的咖啡")
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UI.getChildByName("更多模式"))
        this.ChanggeMoney(0);
        this.AddExp(0);
        this.Show_Decorate();
        // this.UI.getChildByName("教程界面").getComponent(Course).Show();图片版教学
        KKDKF_AudioManager.AudioSource = find("BGM").getComponent(AudioSource);
    }

    public Beginnerschedule: number = 0;//新手教程进度

    update(deltaTime: number) {

    }

    //外观刷新
    Show_Decorate() {
        KKDKF_Incident.LoadSprite("Sprite/主页装饰/" + KKDKF_GameData.Instance.BGState[0]).then((sp: SpriteFrame) => {
            this.JieKeQU.getChildByPath("后台装饰/墙壁").getComponent(Sprite).spriteFrame = sp;
        })
        KKDKF_Incident.LoadSprite("Sprite/主页装饰/" + KKDKF_GameData.Instance.BGState[1]).then((sp: SpriteFrame) => {
            this.JieKeQU.getChildByPath("后台装饰/灯").children.forEach((cd) => { cd.getComponent(Sprite).spriteFrame = sp; })
        })
        KKDKF_Incident.LoadSprite("Sprite/主页装饰/" + KKDKF_GameData.Instance.BGState[2]).then((sp: SpriteFrame) => {
            this.JieKeQU.getChildByPath("后台装饰/高脚凳").children.forEach((cd) => { cd.getComponent(Sprite).spriteFrame = sp; })
        })
        KKDKF_Incident.LoadSprite("Sprite/主页装饰/" + KKDKF_GameData.Instance.BGState[3]).then((sp: SpriteFrame) => {
            this.JieKeQU.getChildByPath("后台装饰/椅子").children.forEach((cd) => { cd.getComponent(Sprite).spriteFrame = sp; })
        })
        KKDKF_Incident.LoadSprite("Sprite/主页装饰/" + KKDKF_GameData.Instance.BGState[4]).then((sp: SpriteFrame) => {
            this.JieKeQU.getChildByPath("前台装饰/收银台").getComponent(Sprite).spriteFrame = sp;
        })
    }
    //按钮事件
    OnbuttonClick(btn: EventTouch) {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "开始游戏":
                this.NewDay();
                this.MainCanvase.getChildByPath("接客区/开始游戏").active = false;
                break;
            case "便条":
                this.UI.getChildByPath("大便条").active = true;
                break;
            case "大便条":
                this.UI.getChildByPath("大便条").active = false;
                break;
            case "结账账单继续":
                this.NewDay();
                break;
            case "菜单":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "可口的咖啡")
                this.OpenStopPanel();
                break;
            case "暂停界面返回主页":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "可口的咖啡");
                    });
                })
                break;
            case "暂停界面继续游戏":
                this.ExitStopPanel();
                break;
            case "钱":
                Banner.Instance.ShowVideoAd(() => {
                    this.ChanggeMoney(100);
                })
                break;
            case "教程":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "可口的咖啡")
                this.UI.getChildByName("教程界面").getComponent(KKDKF_Course).Show();
                break;
            case "商店":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "可口的咖啡")
                this.UI.getChildByName("商店界面").active = true;
                break;

        }


    }
    //结算
    DayOver() {
        ProjectEventManager.emit(ProjectEvent.游戏结束, "可口的咖啡")
        let pre = this.UI.getChildByName("结账账单");
        pre.getChildByName("天数").getComponent(Label).string = "第" + KKDKF_GameData.Instance.GameData[2] + "天";
        pre.getChildByName("钱收益").getComponent(Label).string = "今日收入：" + this.ThisDayMoney;
        pre.getChildByName("经验收益").getComponent(Label).string = "经验获得：" + this.ThisDayExp;
        pre.active = true;
        KKDKF_GameData.DateSave();
    }

    //开始新的一天
    NewDay() {
        this.UI.getChildByName("结账账单").active = false;
        this.ThisDayExp = 0;
        this.ThisDayMoney = 0;
        this.residueGuest = 3;
        this.ShowGuest();
    }

    //黑屏
    public BlackView(callback?: Function, EndCallback?: Function) {
        let nd = this.MainCanvase.getChildByName("黑屏");
        nd.active = true;
        nd.getComponent(UIOpacity).opacity = 0;
        tween(nd.getComponent(UIOpacity))
            .to(1, { opacity: 255 })
            .call(() => {
                if (callback) callback();
            })
            .to(1, { opacity: 0 })
            .call(() => {
                nd.active = false;
                if (EndCallback) EndCallback();
            })
            .start();
    }

    //修改金钱
    public ChanggeMoney(num: number) {
        if (num > 0) {
            this.ThisDayMoney += num;
        }
        KKDKF_GameData.Instance.Money += num;
        KKDKF_GameData.DateSave();
        this.UI.getChildByPath("钱/数量").getComponent(Label).string = KKDKF_GameData.Instance.Money + "";
    }
    //增加经验
    public AddExp(num: number) {
        if (num > 0) {
            this.ThisDayExp += num;
        }
        let UpLvExp: number = KKDKF_GameData.Instance.GameData[0] * 20;
        KKDKF_GameData.Instance.GameData[1] += num;
        if (KKDKF_GameData.Instance.GameData[1] > UpLvExp) {
            KKDKF_GameData.Instance.GameData[1] -= UpLvExp;
            KKDKF_GameData.Instance.GameData[0]++;
        }
        this.UI.getChildByPath("头像/等级/等级数字").getComponent(Label).string = KKDKF_GameData.Instance.GameData[0] + "";
        this.UI.getChildByPath("头像/经验条").getComponent(Sprite).fillRange = KKDKF_GameData.Instance.GameData[1] / UpLvExp;
        KKDKF_GameData.DateSave();
    }

    //打开制作界面
    OpenMakePanel() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        this.UI.getChildByName("制作界面").active = true;
    }


    //召唤客人
    ShowGuest() {
        if (this.residueGuest > 0) {
            this.residueGuest--;
            let num = Math.floor(Math.random() * 8);
            this.MainCanvase.getChildByPath("接客区/客人").getComponent(KKDKF_Guest).Show(num);
        } else {
            this.DayOver();
        }
    }
    //客人离开
    ExitGuest() {
        this.MainCanvase.getChildByPath("接客区/客人").getComponent(KKDKF_Guest).Exit();
        this.scheduleOnce(() => {
            this.ShowGuest();
        }, 1)
    }
    //获取节点
    public static FindOfBG(path: string): Node {
        return find(path, KKDKF_GameManager.Instance.MakeBG);
    }


    //弹出对话框
    public OpenText(id: number) {
        this.MainCanvase.getChildByPath("接客区/对话框").active = true;
        this.MainCanvase.getChildByPath("接客区/对话框/内容").getComponent(Label).string = KKDKF_Constant.Drink[id].describe;
        this.UI.getChildByPath("大便条/Label").getComponent(Label).string = KKDKF_Constant.Drink[id].describe;
    }
    //弹出骂人框
    public OpenaBusiveText(id: number) {
        this.MainCanvase.getChildByPath("接客区/骂人框").active = true;
        this.MainCanvase.getChildByPath("接客区/骂人框/内容").getComponent(Label).string = KKDKF_Constant.Drink[id].angryword;
    }

    //进入制作
    GoMake() {
        this.IsOnShop = false;
        this.BlackView(() => {
            this.MainCanvase.getChildByName("接客区").active = false;
            this.MainCanvase.getChildByName("制作区").active = true;
        }, () => {
            if (KKDKF_GameData.Instance.GameData[3] == 0) {
                this.MakeBG.getChildByName("新手指引").active = true;
                this.MakeBG.getChildByName("新手指引").getComponent(KKDKF_BeginnerGuidance).Include(0);
            }
        });
    }
    //返回接客区
    ReShop() {
        this.IsOnShop = true;
        this.BlackView(() => {
            this.MainCanvase.getChildByName("接客区").active = true;
            this.MainCanvase.getChildByName("制作区").active = false;
            if (KKDKF_GameData.Instance.GameData[3] == 0 && KKDKF_GameManager.Instance.Beginnerschedule == 11) {
                this.Open_ShopBeginners();
            }
        });
    }
    //弹出商店的教程
    Open_ShopBeginners() {
        this.MainCanvase.getChildByPath("接客区/接客区教程").getComponent(KKDKF_ShopBeginnerGuidance).Show();
    }

    //点击确定
    public OnYesClick() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        this.MainCanvase.getChildByPath("接客区/对话框").active = false;
        this.GoMake();
    }
    //点击骂人框确定确定
    public OnBusiveYesClick() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        this.MainCanvase.getChildByPath("接客区/骂人框").active = false;
        this.ExitGuest();
    }

    //打开暂停界面
    OpenStopPanel() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        let pre = this.UI.getChildByName("暂停界面");
        pre.getChildByName("菜单弹板").position = v3(0, 1400, 0);
        pre.active = true;
        tween(pre.getChildByName("菜单弹板"))
            .to(0.5, { position: v3(0, 0, 0) }, { easing: "backOut" })
            .start();
    }
    //关闭暂停界面
    ExitStopPanel() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        let pre = this.UI.getChildByName("暂停界面");
        tween(pre.getChildByName("菜单弹板"))
            .to(0.5, { position: v3(0, 1400, 0) }, { easing: "backIn" })
            .call(() => {
                pre.active = false;
            })
            .start();
    }


    //返回主页
    ReMain() {
        KKDKF_AudioManager.globalAudioPlay("鼠标嘟");
        director.loadScene("Start");
    }

}


