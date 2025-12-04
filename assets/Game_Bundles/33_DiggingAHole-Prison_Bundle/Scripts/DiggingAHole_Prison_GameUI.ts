import { _decorator, clamp, Color, Component, director, EventKeyboard, EventTouch, Input, input, KeyCode, Label, Node, SkeletalAnimation, Sprite, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { UIManager, Panel } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import Banner from 'db://assets/Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { DiggingAHole_Prison_PlayerController } from './DiggingAHole_Prison_PlayerController';
import { DataManager } from '../../../Scripts/Framework/Managers/DataManager';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHole_Prison_GameUI')
export class DiggingAHole_Prison_GameUI extends Component {

    private static instance: DiggingAHole_Prison_GameUI;

    public static get Instance(): DiggingAHole_Prison_GameUI {
        return this.instance;
    }

    @property(Node)
    touchPanel: Node;

    @property(Node)
    joyBase: Node;

    @property(Node)
    fly: Node;

    @property(Node)
    packPanel: Node;

    @property(Node)
    sellPanel: Node;

    @property(Node)
    upgradePanel: Node;

    @property(Node)
    winPanel: Node;

    @property(Node)
    fullPack: Node;

    @property(Node)
    getTrea: Node;

    @property(Node)
    needElc: Node;

    @property(Node)
    sell: Node;

    @property(Node)
    upgrade: Node;

    @property(Node)
    more: Node;

    @property(Sprite)
    elc: Sprite;

    @property(Node)
    blanket: Node;//毛毯
    public blanketState: boolean = true;//默认毯子是打开的

    public IsOnRoom: boolean = true;//默认玩家是在房间里的
    pastPos: Vec2 = null;
    delta: Vec3;
    isFinish = false;
    treaNames = ["煤炭", "绿宝石", "金块", "紫宝石", "红宝石", "钻石"];

    private InteractionBtn: Node = null;

    public GameTime: number = 0;//游戏时间，从五点开始
    private TimeLabel: Label = null;
    public GameDay: number = 1;//游戏天数
    public DayOver: boolean = false;//天结束
    protected onLoad(): void {
        DiggingAHole_Prison_GameUI.instance = this;
        ProjectEventManager.emit(ProjectEvent.游戏开始, "掘地求财方块版");
        this.TimeLabel = this.node.getChildByPath("时间/Label").getComponent(Label);
    }

    public flowdeal: boolean = false;//是否处于交易流程中  
    public flowdealTime: number = 0;//交易流程CD，到200就会触发
    TimeIncident() {
        if (this.DayOver) return;
        if (this.GameTime < 1080) {
            this.GameTime += 2;
        } else {
            //天结束
            this.DayOver = true;
            this.node.getChildByName("天结束提示").active = true;
        }
        if (!this.flowdeal) {
            this.flowdealTime += 2;
            if (this.flowdealTime >= 200) {
                this.flowdeal = true;
                this.flowdealTime = 0;
                //触发交易流程
                director.getScene().emit("掘地求财_开始交易流程");
            }
        }

        this.TimeLabel.string = this.getTimeFromMinutes(this.GameTime);
    }

    start() {
        this.touchPanel.on(Node.EventType.TOUCH_START, this.CameraTouchStart, this);
        this.touchPanel.on(Node.EventType.TOUCH_MOVE, this.CameraTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_START, this.PlayerTouchStart, this);
        this.joyBase.on(Node.EventType.TOUCH_MOVE, this.PlayerTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_END, this.PlayerTouchEnd, this);
        this.joyBase.on(Node.EventType.TOUCH_CANCEL, this.PlayerTouchEnd, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.fly.on(Node.EventType.TOUCH_START, this.FlyTouchStart, this);
        this.fly.on(Node.EventType.TOUCH_END, this.FlyTouchEnd, this);
        this.fly.on(Node.EventType.TOUCH_CANCEL, this.FlyTouchEnd, this);
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.more);
        this.InteractionBtn = this.node.getChildByName("交互");
        this.schedule(() => {
            this.TimeIncident();
        }, 1)

    }
    OnTouchKey: string[] = [];
    onKeyDown(event: EventKeyboard) {
        DiggingAHole_Prison_PlayerController.Instance.isMove = true;
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.OnTouchKey.push("A");
                break;
            case KeyCode.KEY_D:
                this.OnTouchKey.push("D");
                break;
            case KeyCode.KEY_W:
                this.OnTouchKey.push("W");
                break;
            case KeyCode.KEY_S:
                this.OnTouchKey.push("S");
                break;
        }
    }
    onKeyUp(event: EventKeyboard) {
        DiggingAHole_Prison_PlayerController.Instance.isMove = false;
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                this.OnTouchKey.splice(this.OnTouchKey.indexOf("A"), 1);
                break;
            case KeyCode.KEY_D:
                this.OnTouchKey.splice(this.OnTouchKey.indexOf("D"), 1);
                break;
            case KeyCode.KEY_W:
                this.OnTouchKey.splice(this.OnTouchKey.indexOf("W"), 1);
                break;
            case KeyCode.KEY_S:
                this.OnTouchKey.splice(this.OnTouchKey.indexOf("S"), 1);
                break;
        }
    }
    update(deltaTime: number) {
        // console.log(this.IsOnRoom);
        this.InteractionBtn.active = !(DiggingAHole_Prison_PlayerController.Instance.AimNode == null);
        if (this.OnTouchKey.length > 0) {
            this.OnTouchKey.forEach(key => {
                switch (key) {
                    case "A":
                        this.PlayerMove(v2(-100, 0)); break;
                    case "D":
                        this.PlayerMove(v2(100, 0)); break;
                    case "W":
                        this.PlayerMove(v2(0, 100)); break;
                    case "S":
                        this.PlayerMove(v2(0, -100)); break;
                }
            })
        }
    }

    PlayerMove(xy: Vec2) {
        var joy = this.joyBase.children[0];
        var delta = v3(xy.x, xy.y, 0);
        joy.setPosition(delta);
        this.delta = delta;
    }
    CameraTouchStart(event: EventTouch) {
        this.pastPos = event.getUILocation();
    }

    CameraTouchMove(event: EventTouch) {
        var delta = event.getUILocation().subtract(this.pastPos).multiplyScalar(0.1);
        var euler = v3(DiggingAHole_Prison_PlayerController.Instance.node.children[0].eulerAngles);
        euler.add3f(delta.y, -delta.x, 0);
        euler.x = clamp(euler.x, -90, 90);
        DiggingAHole_Prison_PlayerController.Instance.node.children[0].setRotationFromEuler(euler);
        this.pastPos = event.getUILocation();
    }

    PlayerTouchStart() {
        DiggingAHole_Prison_PlayerController.Instance.isMove = true;
    }

    PlayerTouchMove(event: EventTouch) {
        var joy = this.joyBase.children[0];
        var pos = event.getUILocation();
        var basePos = this.joyBase.getWorldPosition();
        var delta = v3(pos.x - basePos.x, pos.y - basePos.y, 0);
        var maxDis = this.joyBase.getComponent(UITransform).width / 2;
        if (delta.length() > maxDis) {
            delta = delta.normalize().multiplyScalar(maxDis);
            joy.setPosition(delta);
        }
        else joy.setWorldPosition(v3(pos.x, pos.y));
        this.delta = delta;
    }

    FlyTouchStart(event: EventTouch) {
        DiggingAHole_Prison_PlayerController.Instance.isFly = true;
    }

    FlyTouchEnd(event: EventTouch) {
        DiggingAHole_Prison_PlayerController.Instance.isFly = false;
    }

    PlayerTouchEnd() {
        var joy = this.joyBase.children[0];
        joy.setPosition(Vec3.ZERO);
        DiggingAHole_Prison_PlayerController.Instance.isMove = false;
    }

    Dig() {
        DiggingAHole_Prison_PlayerController.Instance.Dig();
    }

    BackPack() {
        this.packPanel.active = true;
    }

    FullPack() {
        this.fullPack.active = true;
        this.unschedule(this.CloseFull);
        this.scheduleOnce(this.CloseFull, 2);
    }

    CloseFull() {
        this.fullPack.active = false;
    }

    GetTrea(type: number) {
        this.getTrea.active = true;
        this.getTrea.children[0].getComponent(Label).string = this.treaNames[type];
        this.unschedule(this.CloseGet);
        this.scheduleOnce(this.CloseGet, 2);
    }

    CloseGet() {
        this.getTrea.active = false;
    }

    Sell() {
        this.sellPanel.active = true;
        this.sell.children[0].active = false;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "掘地求财方块版");
    }

    Upgrade(id: number) {
        this.upgradePanel.active = true;
        this.upgrade.children[0].active = false;
        this.upgradePanel.getChildByPath("背包弹板/Layout").children.forEach((child, index) => {
            child.active = index == id;
        });
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "掘地求财方块版");
    }

    ShowElc() {
        tween(this.elc)
            .to(1, { fillRange: DiggingAHole_Prison_PlayerController.Instance.elc / (10 * (parseInt(localStorage.getItem("DAHCV_Elc")) + 1)) })
            .start();
    }

    ShowNeedElc() {
        this.needElc.active = true;
        this.unschedule(this.CloseElc);
        this.scheduleOnce(this.CloseElc, 2);
    }

    CloseElc() {
        this.needElc.active = false;
    }

    Mode() {
        if (Banner.IsShowServerBundle) {
            UIManager.ShowPanel(Panel.MoreGamePanel, false);
        }
        else director.loadScene(GameManager.StartScene);
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "掘地求财方块版");
    }

    Back() {
        // director.loadScene(GameManager.StartScene);
        // ProjectEventManager.emit(ProjectEvent.返回主页, "掘地求财方块版");
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "掘地求财方块版");
            })
        });
    }
    ReGame() {
        UIManager.ShowPanel(Panel.LoadingPanel, [DataManager.GetGameData("掘地监狱"), "DiggingAHole-Prison_GameScene"]);
    }
    ShowHome() {
        this.sell.active = true;
        this.upgrade.active = true;
    }

    CloseHome() {
        this.sell.active = false;
        this.upgrade.active = false;
    }

    //游戏结束
    GameOver(IsWinner: boolean) {
        if (this.isFinish) return;
        this.isFinish = true;
        this.winPanel.getChildByName("win").active = IsWinner;
        this.winPanel.getChildByName("lose").active = !IsWinner;
        this.winPanel.active = true;
    }


    //按下交互按钮
    OnInteractionClick() {
        switch (DiggingAHole_Prison_PlayerController.Instance.AimNode.name) {
            case "升级铲子":
                this.Upgrade(0);
                break;
            case "升级背包":
                this.Upgrade(1);
                break;
            case "升级电池":
                this.Upgrade(2);
                break;
            case "升级飞行":
                this.Upgrade(3);
                break;
            case "升级能量瓶":
                this.Upgrade(4);
                break;
            case "升级手套":
                this.Upgrade(5);
                break;
            case "毯子开":
                this.blanketSet();
                break;
            case "毯子关":
                this.blanketSet();
                break;
            case "商店":
                this.Sell();
                break;
            case "主角床":
                this.NextDay();
                break;
        }

    }

    //转换时间字符串
    getTimeFromMinutes(minutes: number): string {
        // 从早上5点开始计算
        const startHour = 5;
        const totalMinutes = minutes;

        // 计算总小时数（包括起始的5小时）
        const totalHours = startHour + Math.floor(totalMinutes / 60);

        // 计算实际的小时（处理24小时制）
        const hour = totalHours % 24;

        // 计算剩余的分钟数
        const minute = totalMinutes % 60;

        // 格式化为字符串，分钟保持两位数
        return `${hour}:${minute.toString().padStart(2, '0')}`;
    }

    //打开关闭毯子
    blanketSet() {
        this.blanketState = !this.blanketState;
        this.blanket.getComponent(SkeletalAnimation).play(this.blanketState == true ? "Fang" : "Juan");
        this.blanket.getChildByName("毯子开").active = this.blanketState == true;
        this.blanket.getChildByName("毯子关").active = this.blanketState == false;
    }

    //提示
    Tip() {
        this.node.getChildByName("狱警提示").active = true;
        this.scheduleOnce(() => {
            this.node.getChildByName("狱警提示").active = false;
        }, 10)
    }
    //进入下一天
    NextDay() {
        if (!this.DayOver) {
            UIManager.ShowTip("还没到休息的时间！");
            return;
        }
        let hm = this.node.getChildByName("黑幕");
        hm.active = true;
        tween(hm.getChildByName("Bg").getComponent(Sprite))
            .to(0.8, { color: new Color(0, 0, 0, 255) })
            .delay(1)
            .to(0.8, { color: new Color(0, 0, 0, 0) })
            .call(() => {
                hm.active = false;
                this.DayOver = false;
                this.GameDay++;
                this.node.getChildByPath("日期/Label").getComponent(Label).string = `第${this.GameDay}天`;
                this.GameTime = 0;
                this.flowdealTime = 0;
                this.node.getChildByName("天结束提示").active = false;
            })
            .start();
    }
}


