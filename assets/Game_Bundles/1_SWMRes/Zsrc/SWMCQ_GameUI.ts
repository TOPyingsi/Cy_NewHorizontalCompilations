import { _decorator, Node, Component, Label, director } from "cc";
import SWMCQ_AudioM from "./SWMCQ_Audio";
import SWMCQ_GameData from "./SWMCQ_GameData";
import SWMCQ_GameScene from "./SWMCQ_GameScene";
import { Panel, UIManager } from "db://assets/Scripts/Framework/Managers/UIManager";
import GameScene from "./SWMCQ_GameScene";
import { ProjectEventManager, ProjectEvent } from "db://assets/Scripts/Framework/Managers/ProjectEventManager";


const { ccclass, property } = _decorator;

@ccclass("GameUI")
export default class GameUI extends Component {

    public static get Instance(): GameUI {
        return this.instance;
    }

    private static instance: GameUI;


    public set Coins(value: number) {
        this.coins = value;
        this.coinLabel.string = this.coins.toString();
    }
    public get Coins(): number {
        return this.coins;
    }

    @property(Node)
    finishPanel: Node = null;

    @property(Node)
    pausePanel: Node = null;

    @property(Node)
    more: Node = null;

    @property(Label)
    coinLabel: Label = null;

    @property(Label)
    finishCoin: Label = null;

    @property(Label)
    allCoin: Label = null;

    @property(Label)
    finishGuest: Label = null;

    coins = 0;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        GameUI.instance = this;
        ProjectEventManager.emit(ProjectEvent.游戏开始, "沙威玛传奇");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.more);
    }

    start() {
        this.scheduleOnce(() => {
            this.pausePanel.active = false;
        });
    }

    // update (dt) {}

    Finish() {
        var datas = SWMCQ_GameData.Instance.Datas;
        datas[0] += this.coins;
        datas[1]++;
        datas[3] += 30;
        SWMCQ_GameData.Instance.Datas = datas;
        this.finishPanel.active = true;
        this.finishCoin.string = this.coins.toString();
        this.allCoin.string = datas[0].toString();
        this.finishGuest.string = SWMCQ_GameScene.Instance.guestNum.toString();
        ProjectEventManager.emit(ProjectEvent.游戏结束, "沙威玛传奇");
    }

    Back() {
        // ProjectEventManager.emit(ProjectEvent.页面转换, "沙威玛传奇");
        director.resume();
        // FadePanel.Instance.FadeIn(() => {
        // if (Banner.IsShowServerBundle) UIManager.ShowPanel(Panel.MoreGamePanel);
        // else director.loadScene(GameManager.StartScene);
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, "SWM_MainScene", () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "沙威玛传奇");
            })
        });
        // });
        SWMCQ_AudioM.Instance.ButtonAudio();
    }

    Reset() {
        director.resume();
        // FadePanel.Instance.FadeIn(() => {
        UIManager.ShowPanel(Panel.LoadingPanel, "SWM_GameScene");
        // });
        SWMCQ_AudioM.Instance.ButtonAudio();
    }
    NextDay() {
        director.resume();
        UIManager.ShowPanel(Panel.LoadingPanel, "SWM_GameScene");
        SWMCQ_AudioM.Instance.ButtonAudio();
    }
    Pause() {
        if (GameScene.Instance.tutorial.active) return;
        this.pausePanel.active = true;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "沙威玛传奇");
        director.pause();
    }

    Continue() {
        director.resume();
        this.pausePanel.active = false;
    }

    // Upgrade() {
    //     // FadePanel.Instance.FadeIn(() => {
    //     SceneLoad.GoScene("UpgradeScene");
    //     // });
    //     AudioM.Instance.ButtonAudio();
    // }
    MoreGame() {
        UIManager.ShowPanel(Panel.MoreGamePanel, false);
    }
}
