import { _decorator, Component, Node, tween } from 'cc';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { UIManager, Panel } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { WGYQ_UI } from './WGYQ_UI';
import { WGYQ_GameData } from './WGYQ_GameData';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { WGYQ_Camera } from './WGYQ_Camera';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_HomeUI')
export class WGYQ_HomeUI extends WGYQ_UI {

    private static instance: WGYQ_HomeUI;
    public static get Instance(): WGYQ_HomeUI {
        return this.instance;
    }

    @property(Node)
    hospitalPanel: Node;

    @property(Node)
    carPanel: Node;

    @property(Node)
    gachaPanel: Node;

    @property(Node)
    shopPanel: Node;

    @property(Node)
    mygoPanel: Node;

    @property(Node)
    backPanel: Node;

    @property(Node)
    more: Node;

    @property(Node)
    viewButton: Node;

    tutorialTexts = [
        "欢迎来到玩狗园区",
        "你可以在当前大地图中探索不同建筑的功能，也可以立刻前往小院进行新手教程"
    ]

    protected onLoad(): void {
        super.onLoad();
        WGYQ_HomeUI.instance = this;
        let data = WGYQ_GameData.Instance.getNumberData("HomeTutorial");
        if (data == 0) this.Talk();
        ProjectEventManager.emit(ProjectEvent.游戏开始, "玩狗园区");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.more);
        this.viewButton.on(Node.EventType.TOUCH_START, this.BigView, this);
        this.viewButton.on(Node.EventType.TOUCH_END, this.NormalView, this);
        this.viewButton.on(Node.EventType.TOUCH_CANCEL, this.NormalView, this);
    }

    BigView() {
        tween(WGYQ_Camera.Instance.camera)
            .to(1, { orthoHeight: 2000 })
            .start();
    }

    NormalView() {
        tween(WGYQ_Camera.Instance.camera)
            .to(1, { orthoHeight: 500 })
            .start();
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Talk(): void {
        if (this.talkNum < this.tutorialTexts.length) super.Talk();
        else {
            this.talkPanel.active = false;
            WGYQ_GameData.Instance.setNumberData("HomeTutorial", 1);
        }
    }

    Hospital() {
        this.hospitalPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "玩狗园区");
    }

    Car() {
        this.carPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "玩狗园区");
    }

    Yard() {
        UIManager.ShowPanel(Panel.LoadingPanel, "WGYQ_Yard");
    }

    Gacha() {
        this.gachaPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "玩狗园区");
    }

    Shop() {
        this.shopPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "玩狗园区");
    }

    Sell() {
        this.mygoPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "玩狗园区");
    }

    BackStage() {
        this.backPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "玩狗园区");
    }

    Back() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "玩狗园区");
            });
        });
    }

}


