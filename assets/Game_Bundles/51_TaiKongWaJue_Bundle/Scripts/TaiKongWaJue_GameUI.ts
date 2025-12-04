import { _decorator, Animation, clamp, Component, director, EventTouch, Label, Node, Sprite, UIOpacity, UITransform, v3, Vec2, Vec3 } from 'cc';
import { TaiKongWaJue_PlayerController } from './TaiKongWaJue_PlayerController';
import { UIManager, Panel } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import Banner from 'db://assets/Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('TaiKongWaJue_GameUI')
export class TaiKongWaJue_GameUI extends Component {

    private static instance: TaiKongWaJue_GameUI;

    public static get Instance(): TaiKongWaJue_GameUI {
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
    diePanel: Node;

    @property(Node)
    fullPack: Node;

    @property(Node)
    getTrea: Node;

    @property(Node)
    needElc: Node;

    @property(Node)
    needO2: Node;

    @property(Node)
    sell: Node;

    @property(Node)
    upgrade: Node;

    @property(Node)
    more: Node;

    @property(Node)
    home: Node;

    @property(Sprite)
    elc: Sprite;

    @property(Sprite)
    o2: Sprite;

    pastPos: Vec2 = null;
    delta: Vec3;
    treaNames = ["煤炭", "绿宝石", "金块", "紫宝石", "红宝石", "钻石"];

    protected onLoad(): void {
        TaiKongWaJue_GameUI.instance = this;
        ProjectEventManager.emit(ProjectEvent.游戏开始, "太空挖掘");
    }

    start() {
        this.touchPanel.on(Node.EventType.TOUCH_START, this.CameraTouchStart, this);
        this.touchPanel.on(Node.EventType.TOUCH_MOVE, this.CameraTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_START, this.PlayerTouchStart, this);
        this.joyBase.on(Node.EventType.TOUCH_MOVE, this.PlayerTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_END, this.PlayerTouchEnd, this);
        this.joyBase.on(Node.EventType.TOUCH_CANCEL, this.PlayerTouchEnd, this);
        this.fly.on(Node.EventType.TOUCH_START, this.FlyTouchStart, this);
        this.fly.on(Node.EventType.TOUCH_END, this.FlyTouchEnd, this);
        this.fly.on(Node.EventType.TOUCH_CANCEL, this.FlyTouchEnd, this);
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.more);
    }

    update(deltaTime: number) {

    }

    CameraTouchStart(event: EventTouch) {
        this.pastPos = event.getUILocation();
    }

    CameraTouchMove(event: EventTouch) {
        var delta = event.getUILocation().subtract(this.pastPos).multiplyScalar(0.1);
        var euler = v3(TaiKongWaJue_PlayerController.Instance.node.children[0].eulerAngles);
        euler.add3f(delta.y, -delta.x, 0);
        euler.x = clamp(euler.x, -90, 90);
        TaiKongWaJue_PlayerController.Instance.node.children[0].setRotationFromEuler(euler);
        this.pastPos = event.getUILocation();
    }

    PlayerTouchStart() {
        TaiKongWaJue_PlayerController.Instance.isMove = true;
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
        TaiKongWaJue_PlayerController.Instance.isFly = true;
    }

    FlyTouchEnd(event: EventTouch) {
        TaiKongWaJue_PlayerController.Instance.isFly = false;
    }

    PlayerTouchEnd() {
        var joy = this.joyBase.children[0];
        joy.setPosition(Vec3.ZERO);
        TaiKongWaJue_PlayerController.Instance.isMove = false;
    }

    Dig() {
        TaiKongWaJue_PlayerController.Instance.Dig();
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
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "太空挖掘");
    }

    Upgrade() {
        this.upgradePanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "太空挖掘");
    }

    ShowElc() {
        this.elc.fillRange = TaiKongWaJue_PlayerController.Instance.elc / (10 * (parseInt(localStorage.getItem("DAHCV_Elc")) + 1));
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
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "太空挖掘");
    }

    Back() {
        // director.loadScene(GameManager.StartScene);
        // ProjectEventManager.emit(ProjectEvent.返回主页, "太空挖掘");
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "太空挖掘");
            })
        });
    }

    ShowHome() {
        this.sell.active = true;
        this.upgrade.active = true;
    }

    CloseHome() {
        this.sell.active = false;
        this.upgrade.active = false;
    }

    Die() {
        this.CloseFull();
        TaiKongWaJue_PlayerController.Instance.Treasures = [0, 0, 0, 0, 0, 0];
        this.diePanel.children[1].getComponent(UIOpacity).opacity = 0;
        this.diePanel.children[2].getComponent(UIOpacity).opacity = 0;
        this.diePanel.active = true;
        this.diePanel.getComponent(Animation).play();
        TaiKongWaJue_PlayerController.Instance.node.setWorldPosition(this.home.getWorldPosition());
    }

    CloseDie() {
        this.diePanel.active = false;
    }

    ShowO2() {
        this.o2.fillRange = TaiKongWaJue_PlayerController.Instance.o2 / 60;
    }

    ShowNeedO2() {
        this.needO2.active = true;
        this.scheduleOnce(this.CloseO2, 0.8);
    }

    CloseO2() {
        this.needO2.active = false;
    }

}