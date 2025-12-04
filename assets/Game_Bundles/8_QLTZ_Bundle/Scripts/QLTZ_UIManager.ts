import { _decorator, Component, director, Event, find, Label, Node, Sprite, Tween, tween, UIOpacity, v3, Vec3 } from 'cc';
import { QLTZ_Player } from './QLTZ_Player';
import { GameManager } from '../../../Scripts/GameManager';
import { Tools } from '../../../Scripts/Framework/Utils/Tools';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

export enum QLTZ_GameMode {
    SingleMode,
    TwoMode,
}

@ccclass('QLTZ_UIManager')
export class QLTZ_UIManager extends Component {

    private static _instance: QLTZ_UIManager = null;
    public static get Instance(): QLTZ_UIManager {
        if (this._instance == null) {
            this._instance = new QLTZ_UIManager();
        }
        return this._instance;
    }

    @property(Node)
    Camera: Node = null;
    @property(Node)
    CameraPoint: Node = null;
    @property(Node)
    CountDown: Node = null;
    @property(Node)
    GameScene: Node = null;
    @property(Node)
    GameUI: Node = null;
    @property(Node)
    Cup: Node = null;
    @property(Node)
    BellCenter: Node = null;
    @property(Node)
    Arrow: Node = null;

    @property(QLTZ_Player)
    Boy: QLTZ_Player = null;
    @property(QLTZ_Player)
    Girl: QLTZ_Player = null;

    GirlRound: boolean = true;//女生回合
    CountDownLabels = ["3", "2", "1", "抢铃挑战开始！"];
    IsTakeCup: boolean = false;//是否有人拿起杯子
    CupInitPos: Vec3 = v3();//杯子初始位置
    static gameMode: QLTZ_GameMode = QLTZ_GameMode.SingleMode;

    GirlMood: number = 0;
    BoyMood: number = 0;
    IsFinish: boolean = false;

    protected onLoad(): void {
        QLTZ_UIManager._instance = this;
        this.GameUI.active = false;
        this.CupInitPos = this.Cup.getPosition();
        tween(this.Camera)
            .to(2, { position: this.CameraPoint.position, eulerAngles: this.CameraPoint.eulerAngles })
            .call(() => {
                this.GameUI.active = true;
                QLTZ_UIManager.Instance.ShowPanel(QLTZ_UIManager.Instance.GameUI.getChildByName("GuidePanel"));
            })
            .start();
    }

    protected start(): void {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "抢铃挑战")
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, find("Canvas/GameUI/更多模式"));
        if (QLTZ_UIManager.gameMode == QLTZ_GameMode.TwoMode) {
            console.log("双人模式")
            this.GameUI.getChildByName("BoyNoTakeBtn").active = true;
            this.GameUI.getChildByName("BoyTakeBtn").active = true;
        }
        tween(this.Arrow)
            .to(0.5, { position: v3(0, 0, -0.05) })
            .to(0.5, { position: Vec3.ZERO })
            .union()
            .repeatForever()
            .start();
    }

    ShowPanel(panel: Node) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "抢铃挑战")
        panel.setScale(Vec3.ONE);
        panel.active = true;
        tween(panel)
            .to(0.15, { scale: v3(1.1, 1.1, 1) })
            .to(0.1, { scale: Vec3.ONE })
            .start();
    }

    ShowCountDown() {
        let times = 0;
        this.schedule(() => {
            this.CountDown.scale = v3(5, 5, 5);
            this.CountDown.getComponent(UIOpacity).opacity = 0;
            this.CountDown.getComponent(Label).string = this.CountDownLabels[times];
            times++;
            this.CountDown.active = true;
            tween(this.CountDown)
                .to(1, { scale: Vec3.ONE }, { easing: "circOut" })
                .start()
            tween(this.CountDown.getComponent(UIOpacity))
                .to(1, { opacity: 255 })
                .call(() => {
                    if (times > this.CountDownLabels.length) {
                        this.CountDown.active = false;
                        this.GameUI.active = true;
                        this.Arrow.active = true;
                    }
                })
                .start()
        }, 1, this.CountDownLabels.length)
    }

    ShowTime() {
        if (this.IsFinish) return;
        this.StopTime();
        tween(this.GameUI.getChildByName("Time").getComponent(UIOpacity))
            .to(0.2, { opacity: 255 })
            .start()
        tween(this.GameUI.getChildByPath("Time/bar").getComponent(Sprite))
            .to(1, { fillRange: 1 })
            .call(() => {
                if (this.GirlRound) {
                    this.Boy.Anim.crossFade("打脸");
                }
                else {
                    this.Girl.Anim.crossFade("打脸");
                }
                this.StopTime();
            })
            .start()
    }

    StopTime() {
        Tween.stopAllByTarget(this.GameUI.getChildByName("Time").getComponent(UIOpacity));
        Tween.stopAllByTarget(this.GameUI.getChildByPath("Time/bar").getComponent(Sprite));
        this.GameUI.getChildByName("Time").getComponent(UIOpacity).opacity = 0;
        this.GameUI.getChildByPath("Time/bar").getComponent(Sprite).fillRange = 0;
    }

    //单人模式下轮到男生行动
    TurnBoyAction() {
        if (this.IsFinish) return;
        if (QLTZ_UIManager.gameMode == QLTZ_GameMode.SingleMode) {
            // console.log("轮到AI回合:" + this.Boy.CanAction);
            if (Tools.GetRandom(0, 100) < 50) {
                this.Boy.NoTake(true);
            }
            else {
                this.Boy.Take(true);
            }
        }
    }

    ButtonClick(event: Event) {
        switch (event.target.name) {
            case "GirlNoTakeBtn":
                {
                    if (this.GirlRound) this.Girl.NoTake();
                }
                break;
            case "GirlTakeBtn":
                {
                    if (this.GirlRound) this.Girl.Take();
                }
                break;
            case "BoyNoTakeBtn":
                {
                    if (!this.GirlRound) this.Boy.NoTake();
                }
                break;
            case "BoyTakeBtn":
                {
                    if (!this.GirlRound) this.Boy.Take();
                }
                break;
            case "BackBtn":
                {
                    ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                        director.loadScene(GameManager.StartScene);
                    })
                }
                break;
        }
    }
}


