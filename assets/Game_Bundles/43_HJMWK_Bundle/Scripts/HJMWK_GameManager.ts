import { _decorator, Component, director, EventTouch, JsonAsset, Node, tween, UIOpacity, Vec3 } from 'cc';
import { HJMWK_Tips } from './HJMWK_Tips';
import { HJMWK_DialogueDisplay } from './HJMWK_DialogueDisplay';
import { HJMWK_CountdownTimer } from './HJMWK_CountdownTimer';
import Banner from 'db://assets/Scripts/Banner';
import HJMWK_PlayerController from './HJMWK_PlayerController';
import { HJMWK_GameData } from './HJMWK_GameData';
import { HJMWK_Panel } from './HJMWK_Panel';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { DataManager } from 'db://assets/Scripts/Framework/Managers/DataManager';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_GameManager')
export class HJMWK_GameManager extends Component {

    public static Instance: HJMWK_GameManager = null;

    @property(Node)
    Canvas: Node = null;

    @property(HJMWK_Tips)
    Tips: HJMWK_Tips = null;

    @property
    RecoveryTime: number = 300;

    @property(HJMWK_DialogueDisplay)
    Chat: HJMWK_DialogueDisplay = null;

    @property(Node)
    KQPanel: Node = null;

    @property
    VideoTimer: number = 180;

    @property(JsonAsset)
    CubeData: JsonAsset = null;

    @property(JsonAsset)
    PropData: JsonAsset = null;

    @property(UIOpacity)
    Mask: UIOpacity = null;

    CurDiggings: number = 1;

    HarmMultiplying: number = 1;
    YieldMultiplying: number = 1;
    AutoAttack: boolean = false;

    InitPos: Vec3 = new Vec3();

    protected onLoad(): void {
        HJMWK_GameManager.Instance = this;
        HJMWK_GameData.Instance;

        ProjectEventManager.emit(ProjectEvent.游戏开始, "哈基米挖矿");

    }

    protected start(): void {
        this.InitPos = HJMWK_PlayerController.Instance.node.getWorldPosition().clone();
    }

    showTips(tips: string) {
        this.Tips.show(tips);
    }

    OnButtonClick(target: EventTouch) {
        switch (target.getCurrentTarget().name) {
            case "双倍伤害":
                if (target.getCurrentTarget().getComponent(HJMWK_CountdownTimer).IsRunning) return;
                Banner.Instance.ShowVideoAd(() => {
                    this.HarmMultiplying = 2;
                    target.getCurrentTarget().getComponent(HJMWK_CountdownTimer).startCountdown(this.VideoTimer, () => {
                        this.HarmMultiplying = 1;
                    })
                })
                break;
            case "双倍收益":
                if (target.getCurrentTarget().getComponent(HJMWK_CountdownTimer).IsRunning) return;
                Banner.Instance.ShowVideoAd(() => {
                    this.YieldMultiplying = 2;
                    target.getCurrentTarget().getComponent(HJMWK_CountdownTimer).startCountdown(this.VideoTimer, () => {
                        this.YieldMultiplying = 1;
                    })
                })
                break;
            case "自动挖矿":
                if (target.getCurrentTarget().getComponent(HJMWK_CountdownTimer).IsRunning) return;
                Banner.Instance.ShowVideoAd(() => {
                    this.AutoAttack = true;
                    HJMWK_PlayerController.Instance.attackStart(0, 0);
                    target.getCurrentTarget().getComponent(HJMWK_CountdownTimer).startCountdown(this.VideoTimer, () => {
                        this.AutoAttack = false;
                        HJMWK_PlayerController.Instance.attackEnd();
                    })
                })
                break;
            case "一键回矿区":
                this.KQPanel.active = true;
                break;
            case "1号矿区":
                this.switch();
                break;
            case "2号矿区":
                if (!HJMWK_GameData.Instance.Permits.find(e => e === "2号通行证")) {
                    this.Chat.showDialogue("请先获取2号矿区通行证！");
                    return;
                }
                this.CurDiggings = 2;
                this.switch();
                break;
            case "3号矿区":
                if (!HJMWK_GameData.Instance.Permits.find(e => e === "3号通行证")) {
                    this.Chat.showDialogue("请先获取3号矿区通行证！");
                    return;
                }
                this.CurDiggings = 3;
                this.switch();
                break;
            case "2号通行证":
                if (HJMWK_GameData.Instance.Permits.find(e => e === "2号通行证")) {
                    // this.Chat.showDialogue("已经拥有2号通行证！");
                    HJMWK_GameManager.Instance.showTips("已经拥有2号通行证！");
                    return;
                }
                Banner.Instance.ShowVideoAd(() => {
                    HJMWK_GameData.Instance.Permits.push("2号通行证");
                    HJMWK_GameData.DateSave();
                });
                break;
            case "3号通行证":
                if (HJMWK_GameData.Instance.Permits.find(e => e === "3号通行证")) {
                    HJMWK_GameManager.Instance.showTips("已经拥有3号通行证！");
                    return;
                }
                Banner.Instance.ShowVideoAd(() => {
                    HJMWK_GameData.Instance.Permits.push("3号通行证");
                    HJMWK_GameData.DateSave();
                });
                break;
            case "返回":
                UIManager.ShowPanel(Panel.LoadingPanel, [DataManager.GetGameDataByName("校园摸金"), "XYMJ_Start"]);
                break;
        }
    }

    switch() {
        this.KQPanel.getComponent(HJMWK_Panel).close();
        tween(this.Mask)
            .to(0.5, { opacity: 255 }, { easing: `sineOut` })
            .call(() => {
                HJMWK_PlayerController.Instance.node.setWorldPosition(this.InitPos);
                director.getScene().emit("HJMWK_CubeRefresh");
            })
            .to(0.2, { opacity: 0 }, { easing: `sineOut` })
            .start();
    }
}


