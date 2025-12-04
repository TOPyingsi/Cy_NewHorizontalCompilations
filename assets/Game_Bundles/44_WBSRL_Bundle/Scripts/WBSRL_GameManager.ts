import { _decorator, Component, EventTouch, find, Label, Material, Node, Prefab, RenderTexture, Animation, tween, instantiate, UIOpacity, TERRAIN_MAX_LAYER_COUNT, Tween, director } from 'cc';
import { WBSRL_Monologue } from './WBSRL_Monologue';
import { WBSRL_WindowPanel } from './WBSRL_WindowPanel';
import { WBSRL_Joystick } from './WBSRL_Joystick';
import { WBSRL_Monologues_Window, WBSRL_ROOM } from './WBSRL_Constant';
import { WBSRL_Room } from './WBSRL_Room';
import { WBSRL_TVController } from './WBSRL_TVController';
import { WBSRL_GunController } from './WBSRL_GunController';
import { WBSRL_PlotInRoom } from './WBSRL_PlotInRoom';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import Banner from 'db://assets/Scripts/Banner';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

enum WBSRL_MONOLOGUE {
    NON,
    PLAYING,
    NEXT,
    OVER,
}

@ccclass('WBSRL_GameManager')
export class WBSRL_GameManager extends Component {

    @property(Node)
    Light: Node = null;

    @property(Node)
    Canvas: Node = null;

    @property(Material)
    TransparentMaterial: Material = null;

    @property(Material)
    WindowMaterial: Material = null;

    @property(Material)
    WindowGlassMaterial: Material = null;

    @property(Node)
    Players: Node = null;

    @property(RenderTexture)
    RenderTexture: RenderTexture = null;

    @property(Node)
    HouseMain: Node = null;

    @property(WBSRL_Monologue)
    Monologue: WBSRL_Monologue = null;

    @property(WBSRL_WindowPanel)
    Window1: WBSRL_WindowPanel = null;

    @property(WBSRL_WindowPanel)
    Window2: WBSRL_WindowPanel = null;

    @property(WBSRL_WindowPanel)
    Window3: WBSRL_WindowPanel = null;

    @property(Node)
    Tips: Node = null;

    @property(Label)
    TipsLabel: Label = null;

    @property(Animation)
    DrinkAnimation: Animation = null;

    @property(Node)
    PowerParent: Node = null;

    @property(Prefab)
    PowerPrefab: Prefab = null;

    @property(Prefab)
    VideoPrefab: Prefab = null;

    @property(UIOpacity)
    Mask: UIOpacity = null;

    @property(WBSRL_TVController)
    TVController: WBSRL_TVController = null;

    @property(WBSRL_GunController)
    GunController: WBSRL_GunController = null;

    @property(WBSRL_Monologue)
    Over1: WBSRL_Monologue = null;

    GateRoom: WBSRL_Room = null;
    BathRoom: WBSRL_Room = null;
    UtilityRoom: WBSRL_Room = null;
    KitchenRoom: WBSRL_Room = null;
    Livin1Room: WBSRL_Room = null;
    Livin2Room: WBSRL_Room = null;
    BedRoom: WBSRL_Room = null;

    MapPlot: Map<string, Node> = new Map();
    Plots: Prefab[] = [];
    ArrRemoveName: string[] = [];

    CurDay: number = 0;
    Power: number = 3;
    IsNight: boolean = true;

    TargetWindowPanel: WBSRL_WindowPanel = null;
    TargetRoom: WBSRL_Room = null;

    NextPower: number = 3;

    IsClickBX: boolean = false;

    CurCorpse: Node = null;

    private sleeping: boolean = false;
    public static Instance: WBSRL_GameManager = null;
    protected onLoad(): void {
        WBSRL_GameManager.Instance = this;

        ProjectEventManager.emit(ProjectEvent.游戏开始, "我不是人类");

        this.GateRoom = find("门口", this.Canvas).getComponent(WBSRL_Room);
        this.BathRoom = find("浴室", this.Canvas).getComponent(WBSRL_Room);
        this.UtilityRoom = find("储物间", this.Canvas).getComponent(WBSRL_Room);
        this.KitchenRoom = find("厨房", this.Canvas).getComponent(WBSRL_Room);
        this.Livin1Room = find("客厅1", this.Canvas).getComponent(WBSRL_Room);
        this.Livin2Room = find("客厅2", this.Canvas).getComponent(WBSRL_Room);
        this.BedRoom = find("卧室", this.Canvas).getComponent(WBSRL_Room);
    }

    protected start(): void {
        this.InitWindowMonologue();
        this.InitGate();
    }

    GetPlayerByName(name: string) {
        return this.Players.getChildByName(name);
    }

    //#region  窗户
    //显示开窗独白
    ShowMonologue(text: string) {
        if (!this.Monologue.node.active) this.Monologue.node.active = true;
        this.Monologue.playText(text);
    }

    //初始化独白
    InitWindowMonologue() {
        this.Window1.Monologues = WBSRL_Monologues_Window[this.CurDay][0];
        this.Window2.Monologues = WBSRL_Monologues_Window[this.CurDay][1];
        this.Window3.Monologues = WBSRL_Monologues_Window[this.CurDay][2];
    }

    ShowWindowPanel(name: string) {
        switch (name) {
            case "窗户1":
                this.TargetWindowPanel = this.Window1;
                break;
            case "窗户2":
                this.TargetWindowPanel = this.Window2;
                break;
            case "窗户3":
                this.TargetWindowPanel = this.Window3;
                break;
        }
        if (!this.TargetWindowPanel) return;
        this.TargetWindowPanel.OpenWindow();
        this.scheduleOnce(() => {
            this.ClickMonologue();
        }, 1);
    }

    CloseWindowPanel() {
        if (!this.TargetWindowPanel) return;
        this.TargetWindowPanel.CloseWindow();
        this.TargetWindowPanel = null;
    }

    Check(): WBSRL_MONOLOGUE {
        if (!this.TargetWindowPanel) return WBSRL_MONOLOGUE.NON;
        if (this.Monologue.IsPlaying) return WBSRL_MONOLOGUE.PLAYING;
        return this.TargetWindowPanel.Monologues.length > 0 ? WBSRL_MONOLOGUE.NEXT : WBSRL_MONOLOGUE.OVER;
    }

    ClickMonologue() {
        switch (this.Check()) {
            case WBSRL_MONOLOGUE.NON:
                this.Monologue.node.active = false;
                WBSRL_Joystick.Instance.ShowExitButton(true);
                break;
            case WBSRL_MONOLOGUE.PLAYING:
                break;
            case WBSRL_MONOLOGUE.NEXT:
                this.ShowMonologue(this.TargetWindowPanel.Monologues.shift());
                break;
            case WBSRL_MONOLOGUE.OVER:
                this.Monologue.node.active = false;
                WBSRL_Joystick.Instance.ShowExitButton(true);
                break;
        }
    }

    //#region  房间

    InitGate() {
        this.GateRoom.Init();
    }

    OpenRoomByName(name: string) {

        switch (name) {
            case "门1":
                this.TargetRoom = this.GateRoom;
                break;
            case "门2":
                this.TargetRoom = this.BathRoom;
                break;
            case "门3":
                this.TargetRoom = this.UtilityRoom;
                break;
            case "门4":
                this.TargetRoom = this.KitchenRoom;
                break;
            case "门5":
                this.TargetRoom = this.Livin2Room;
                break;
            case "门6":
                this.TargetRoom = this.Livin1Room;
                break;
            case "门7":
                this.TargetRoom = this.BedRoom;
                break;
        }

        if (!this.TargetRoom) return;
        this.TargetRoom.OpenRoom();
    }

    CloseRoom() {
        if (!this.TargetRoom) return;
        this.TargetRoom.CloseRoom();
        this.TargetRoom = null;
    }


    ShowTips(tips: string) {
        this.Tips.active = true;
        this.TipsLabel.string = tips;
        this.scheduleOnce(() => {
            this.Tips.active = false;
        }, 2);
    }

    AddGuest(room: WBSRL_ROOM, prefab: Prefab) {
        let targetRoom: WBSRL_Room = null;
        switch (room) {
            case WBSRL_ROOM.浴室:
                targetRoom = this.BathRoom;
                break;
            case WBSRL_ROOM.储物间:
                targetRoom = this.UtilityRoom;
                break;
            case WBSRL_ROOM.厨房:
                targetRoom = this.KitchenRoom;
                break;
            case WBSRL_ROOM.客厅1:
                targetRoom = this.Livin1Room;
                break;
            case WBSRL_ROOM.客厅2:
                targetRoom = this.Livin2Room;
                break;
        }
        if (targetRoom && prefab) targetRoom.AddItemByPrefab(prefab);
    }

    OnButtonClick(event: EventTouch) {
        switch (event.getCurrentTarget().name) {
            case "床":
                if (this.sleeping) return;
                if (!this.IsNight && this.Power > 0) {
                    this.ShowTips("还有体力，现在还不困！");
                    return;
                } else if (this.IsNight && this.Plots.length > 0) {
                    this.ShowTips("我还不能睡！还有客人需要帮助怎们办。");
                    return;
                } else {
                    this.Sleep();
                }
                break;
            case "冰箱":
                if (!this.IsClickBX) return;
                this.DrinkAnimation.node.active = true;
                WBSRL_Joystick.Instance.node.active = false;
                this.DrinkAnimation.play();
                break;
            case "返回首页":
                director.loadScene("Start");
                // ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                //     UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                //         ProjectEventManager.emit(ProjectEvent.返回主页, "我不是人类");
                //     });
                // });
                break;
        }
    }

    ShowPower(isShow: boolean = true) {
        if (!isShow) this.PowerParent.active = false;
        this.PowerParent.active = true;
        this.PowerParent.removeAllChildren();
        if (this.Power > 0) {
            for (let index = 0; index < this.Power; index++) {
                const node: Node = instantiate(this.PowerPrefab);
                node.parent = this.PowerParent;
            }
        }
        const node: Node = instantiate(this.VideoPrefab);
        node.parent = this.PowerParent;
        node.on(Node.EventType.TOUCH_END, () => {
            Banner.Instance.ShowVideoAd(() => {
                this.Power++;
                this.ShowPower();
            })
        }, this);
    }

    AddPower() {

    }

    Sleep(cb?: Function) {
        this.sleeping = true;
        tween(this.Mask)
            .to(0.3, { opacity: 100 }, { easing: `smooth` })
            .to(0.1, { opacity: 80 }, { easing: `smooth` })
            .to(0.3, { opacity: 130 }, { easing: `smooth` })
            .to(0.1, { opacity: 100 }, { easing: `smooth` })
            .to(0.5, { opacity: 250 }, { easing: `smooth` })
            .delay(1)
            .call(() => {
                this.IsNight = !this.IsNight;
                if (this.CurCorpse) {
                    this.CurCorpse.active = false;
                    this.CurCorpse = null;
                }
                if (!this.IsNight) {
                    if (this.CurDay > 3) {
                        this.GameOver3();
                        return;
                    } else if (this.GetHumanCount() > 0 && this.GetNoHumanCount() > 0 && this.CurDay > 1) {
                        this.RandRemoveHuman();
                        this.CurCorpse.active = true;
                        this.ShowTips("今天晚上有人消失了，家里似乎进入了不干净的客人！")
                    } else if (this.GetHumanCount() == 0 && this.GetNoHumanCount() > 0) {
                        this.GameOver2();
                        return;
                    }
                    this.TVController.ShowTV();
                    this.Power = this.NextPower;
                    this.ShowPower();
                }
                this.RemovePlot();
            })
            .to(0.5, { opacity: 100 }, { easing: `smooth` })
            .to(0.2, { opacity: 130 }, { easing: `smooth` })
            .to(0.2, { opacity: 100 }, { easing: `smooth` })
            .to(0.2, { opacity: 130 }, { easing: `smooth` })
            .to(0.5, { opacity: 0 }, { easing: `smooth` })
            .call(() => {
                cb && cb();
                this.sleeping = false;
                this.PowerParent.active = !this.IsNight;
                this.Light.active = !this.IsNight;
                if (!this.IsNight) {

                } else {
                    this.CurDay++;
                    this.InitGate();
                    this.InitWindowMonologue();
                }
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "我不是人类");
            })
            .start();
    }

    RemovePlot() {
        while (this.ArrRemoveName.length > 0) {
            const name: string = this.ArrRemoveName.shift();
            if (this.MapPlot.has(name)) {
                this.MapPlot.get(name).destroy();
                this.MapPlot.delete(name);
            }
        }
    }

    GetHumanCount(): number {
        let count = 0;
        this.MapPlot.forEach(e => {
            if (e.getComponent(WBSRL_PlotInRoom).IsHuman) count++;
        })
        return count;
    }

    GetNoHumanCount(): number {
        let count = 0;
        this.MapPlot.forEach(e => {
            if (!e.getComponent(WBSRL_PlotInRoom).IsHuman) count++;
        })
        return count;
    }

    RandRemoveHuman() {
        this.MapPlot.forEach(e => {
            if (e.getComponent(WBSRL_PlotInRoom).IsHuman) {
                this.ArrRemoveName.push(e.name);
                this.CurCorpse = e.parent.parent.getComponent(WBSRL_Room).Corpse;
            }
        })
    }

    //#region  结局
    GameOver1() {
        tween(this.Mask)
            .to(2, { opacity: 250 }, { easing: `smooth` })
            .call(() => {
                this.Mask.opacity = 0;
                this.Over1.node.active = true
                this.Over1.playText("你被杀了，请重新开始解锁不一样的结局吧！");
                ProjectEventManager.emit(ProjectEvent.游戏结束, "我不是人类");
            })
            .start();
    }

    GameOver2() {
        Tween.stopAllByTarget(this.Mask);
        tween(this.Mask)
            .to(2, { opacity: 250 }, { easing: `smooth` })
            .call(() => {
                this.Mask.opacity = 0;
                this.Over1.node.active = true
                this.Over1.playText("家里只有伪人,你被杀了，请重新开始解锁不一样的结局吧！");
                ProjectEventManager.emit(ProjectEvent.游戏结束, "我不是人类");
            })
            .start();
    }

    GameOver3() {
        Tween.stopAllByTarget(this.Mask);
        tween(this.Mask)
            .to(2, { opacity: 250 }, { easing: `smooth` })
            .call(() => {
                this.Mask.opacity = 0;
                this.Over1.node.active = true
                this.Over1.playText("你成功坚持到了最后！请重新开始解锁不一样的结局吧！");
                ProjectEventManager.emit(ProjectEvent.游戏结束, "我不是人类");
            })
            .start();
    }


    protected onEnable(): void {
        // 监听完成
        this.DrinkAnimation.on(Animation.EventType.FINISHED, () => {
            this.Power = 0;
            this.ShowTips("啊，啤酒让我感到昏昏欲睡。现在最应该做的就是去睡觉。");
            WBSRL_Joystick.Instance.node.active = true;
            this.DrinkAnimation.node.active = false;
            this.ShowPower();
        });
    }
}


