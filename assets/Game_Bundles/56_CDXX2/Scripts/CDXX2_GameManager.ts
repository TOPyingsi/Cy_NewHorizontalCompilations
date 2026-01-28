import { _decorator, Component, director, EventTouch, Node, Sprite, SpriteFrame } from 'cc';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_Equipment } from './CDXX2_Equipment';
import Banner from 'db://assets/Scripts/Banner';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { CDXX2_Loading } from './CDXX2_Loading';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_BG } from './CDXX2_Constant';
import { CDXX2_TipsPanel } from './CDXX2_TipsPanel';
import { CDXX2_EnemyManager } from './CDXX2_EnemyManager';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_CSPanel } from './CDXX2_CSPanel';
const { ccclass, property } = _decorator;

/* 
全局单例调度站：
管理 Loading、复活、战斗、切图等所有核心面板的显隐与流程；
控制战斗与非战斗状态切换（暂停/恢复、清空敌人、显示/隐藏 UI）；
开局自动发新手枪、触发引导提示，并统一提供按钮事件（复活看广告、返回主页等）。
*/

@ccclass('CDXX2_GameManager')
export class CDXX2_GameManager extends Component {
    public static Instance: CDXX2_GameManager = null;
    public static IsMute: boolean = false;

    @property(Node)
    Canvas: Node = null;

    @property(Node)
    MorGame: Node = null;

    @property(CDXX2_Loading)
    LoadingPanel: CDXX2_Loading = null;

    @property(CDXX2_TipsPanel)
    TipsPanel: CDXX2_TipsPanel = null;

    @property(Node)
    ResurgencePanel: Node = null;

    @property(Node)
    BattlePanel: Node = null;

    @property(Node)
    ShowBattleHide: Node[] = [];

    @property(CDXX2_CSPanel)
    CSPanel: CDXX2_CSPanel = null;

    IsBattle: boolean = false;
    protected onLoad(): void {
        CDXX2_GameManager.Instance = this;
    }

    protected start(): void {
        if (CDXX2_GameData.Instance.IsInit) {
            CDXX2_GameData.Instance.IsInit = false;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_TIPS_SHOW);
            this.scheduleOnce(() => {
                CDXX2_Equipment.Instance.addPickaxe("凡品光辉");
            });
            CDXX2_GameData.Instance.HP = 500;   // 初始血量
            CDXX2_GameData.Instance.Harm = 100;  // 初始攻击
            // CDXX2_GameData.AddPickaxeByName("凡品光辉");
        }
        this.MorGame.active = Banner.IsShowServerBundle;

        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, CDXX2_GameData.Instance.CurMap);
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_BG_SHOW, this.onBgShow, this);

        ProjectEventManager.emit(ProjectEvent.游戏开始, "吃丹修仙");
    }

    breakStart() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "吃丹修仙2");
            });
        });
    }

    moreGame() {
        UIManager.ShowPanel(Panel.MoreGamePanel);
    }

    OnButtonClick(event: EventTouch) {
        switch (event.target.name) {
            case "复活":
                Banner.Instance.ShowVideoAd(() => {
                    CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_RESUME);
                    this.ResurgencePanel.active = false;
                    CDXX2_PlayerController.Instance.Injured = 0;
                    // 复活后给予5秒无敌时间
                    CDXX2_PlayerController.Instance.SetInvincible(5);
                    CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
                })
                break;
            case "不复活":
                this.ResurgencePanel.active = false;
                this.CloseBattlePanel();
                break;
            case "CloseBattlePanel":
                this.CloseBattlePanel();
                break;
        }
    }

    ShowLoadingPanel(duration: number = 3, cb: Function = null) {
        this.LoadingPanel.Show(duration, cb);
    }

    ShowTipsPanel(enemyIcon: SpriteFrame, dyIcon: SpriteFrame) {
        this.TipsPanel.Show(enemyIcon, dyIcon);
    }

    ShowResurgencePanel() {
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_PAUSE);
        this.ResurgencePanel.active = true;
    }

    ShowBattlePanel() {
        this.ShowLoadingPanel(3, () => {
            this.IsBattle = true;
            this.ShowBattleHide.forEach(e => e.active = false);
            this.BattlePanel.active = true;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, CDXX2_GameData.Instance.CurMap);
        })
    }

    ShowCSPanel(map: CDXX2_BG) {
        this.CSPanel.Show(map);
    }

    CloseBattlePanel() {
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_PAUSE);
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE);
        this.ShowLoadingPanel(3, () => {
            this.IsBattle = false;
            this.ShowBattleHide.forEach(e => {
                if (e) e.active = true;
            });
            this.BattlePanel.active = false;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, CDXX2_GameData.Instance.CurMap);

            CDXX2_PlayerController.Instance.Injured = 0;
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
        })
    }

    private onBgShow(map: CDXX2_BG): void {
        // 统一清空旧敌人
        CDXX2_EnemyManager.Instance.Clear();
        // 可选：把战斗状态、子弹等一起清
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE);
    }
}


