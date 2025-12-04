import { _decorator, Component, Node, Label, AudioSource, tween, Widget } from 'cc';
import GameData2 from './SWMCQ_GameData';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import SWMCQ_Audio from './SWMCQ_Audio';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('MainUI')
export default class MainUI extends Component {
    @property(Node)
    main2Bg: Node | null = null;
    @property([Label])
    dataLabels: Label[] = [];
    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        // if (GameData2.isBack) this.main2Bg.active = true;
        // GameData2.isBack = true;
        for (let i = 0; i < this.dataLabels.length; i++) {
            const element = this.dataLabels[i];
            element.string += GameData2.Instance.Datas[i];
            if (i == 2) element.string += "/17";
        }
        // if (Banner.RegionMask) Banner.Instance.ShowBannerAd();
        if (!GameData2.Instance.Tutorial) this.Game();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "沙威玛传奇");
    }
    start() {
    }
    // update (dt) {}
    Back() {
        // UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene);
        // ProjectEventManager.emit(ProjectEvent.返回主页, "沙威玛传奇");
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, "SWM_MainScene", () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "沙威玛传奇");
            })
        });
    }
    Game() {
        if (SWMCQ_Audio.Instance) SWMCQ_Audio.Instance.ButtonAudio();
        UIManager.ShowPanel(Panel.LoadingPanel, "SWM_GameScene");
    }
    Upgrade() {
        SWMCQ_Audio.Instance.ButtonAudio();
        UIManager.ShowPanel(Panel.LoadingPanel, "SWM_UpgradeScene");
    }
}