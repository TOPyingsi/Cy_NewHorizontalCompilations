import { _decorator, Animation, Component, director, Event, EventTouch, Label, Layout, Node, RigidBody, size, Size, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec3, view, Widget } from 'cc';
import { NJWD_GameManager } from './NJWD_GameManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import Banner from 'db://assets/Scripts/Banner';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

@ccclass('NJWD_UI')
export class NJWD_UI extends Component {

    private static instance: NJWD_UI;
    public static get Instance(): NJWD_UI {
        return this.instance;
    }

    @property(Node)
    winPanel: Node;

    @property(Node)
    failPanel: Node;

    @property(Node)
    actPanel: Node;

    @property([SpriteFrame])
    hitSfs: SpriteFrame[] = [];

    @property([Node])
    textures: Node[] = [];

    @property([Node])
    uis: Node[] = [];

    time = 5;
    ammo = 3;
    isHit = false;

    protected onLoad(): void {
        NJWD_UI.instance = this;
        ProjectEventManager.emit(ProjectEvent.游戏开始, "你狙我躲双人版");
        this.InitWidget();
    }

    InitWidget() {
        let width = view.getVisibleSize().width / 2;
        for (let i = 0; i < 2; i++) {
            NJWD_GameManager.Instance.players[i].switchBan.getComponent(UITransform).width = width;
            this.textures[i].getComponent(UITransform).width = width;
            this.uis[i].getComponent(UITransform).width = width;
            if (i == 0) {
                this.textures[i].getComponent(Widget).left = 0;
                this.uis[i].getComponent(Widget).left = 0;
            }
            else {
                this.textures[i].getComponent(Widget).right = 0;
                this.uis[i].getComponent(Widget).right = 0;
            }
        }
    }

    ReadyShoot() {
        this.time = 5;
        this.ammo = 3;
        this.isHit = false;
        EventManager.emit(NJWD_Events.ReadyShoot);
        this.schedule(() => {
            this.time--;
            if (this.time == 0) this.InShoot();
            else EventManager.emit(NJWD_Events.ReadyCount);
        }, 1, 4);
    }

    InShoot() {
        NJWD_GameManager.Instance.isReady = false;
        this.isHit = false;
        EventManager.emit(NJWD_Events.InShoot);
    }

    Shoot() {
        this.ammo--;
        EventManager.emit(NJWD_Events.Shoot);
    }

    ShootEnd() {
        EventManager.emit(NJWD_Events.ShootEnd);
    }

    Win() {
        this.winPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.游戏结束, "你狙我躲双人版");
    }

    Fail() {
        this.failPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.游戏结束, "你狙我躲双人版");
    }

    Reset() {
        UIManager.ShowPanel(Panel.LoadingPanel, "NJWD_ShootAndHide");
    }

    Back() {
        UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene);
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "你狙我躲双人版");
            })
        });
    }

    VideoFind() {
        if (NJWD_GameManager.Instance.isUfo) return UIManager.ShowTip("已经定位敌人！");
        Banner.Instance.ShowVideoAd(() => { NJWD_GameManager.Instance.UFOFind(); });
    }

    ShowActPanel() {
        this.actPanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "你狙我躲双人版");
    }

    CloseActPanel() {
        this.actPanel.active = false;
        NJWD_GameManager.Instance.ReadyShoot();
    }

    VideoAct() {
        let x = this;
        Banner.Instance.ShowVideoAd(() => {
            for (let i = 0; i < NJWD_GameManager.Instance.players.length; i++) {
                const element = NJWD_GameManager.Instance.players[i];
                element.move.children[2].active = true;
                element.move.children[4].active = true;
                element.move.children[6].active = true;
                element.move.getComponent(Layout).spacingX = 25;
            }
            x.CloseActPanel();
        });
    }

    Execute() {
        EventManager.emit(NJWD_Events.Execution);
    }

}

export enum NJWD_Events {
    ReadyShoot = "ReadyShoot",
    ReadyCount = "ReadyCount",
    InShoot = "InShoot",
    Shoot = "Shoot",
    ShowHit = "ShowHit",
    ShootEnd = "ShootEnd",
    Execution = "Execution",
    Hurt = "Hurt"
}
