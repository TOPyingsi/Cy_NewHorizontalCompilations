import { _decorator, Component, director, EventTouch, Node, Sprite, SpriteFrame } from 'cc';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_Equipment } from './CDXX_Equipment';
import Banner from 'db://assets/Scripts/Banner';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { CDXX_Loading } from './CDXX_Loading';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import { CDXX_BG } from './CDXX_Constant';
import { CDXX_TipsPanel } from './CDXX_TipsPanel';
import { CDXX_EnemyManager } from './CDXX_EnemyManager';
import CDXX_PlayerController from './CDXX_PlayerController';
import { CDXX_CSPanel } from './CDXX_CSPanel';
const { ccclass, property } = _decorator;

@ccclass('CDXX_GameManager')
export class CDXX_GameManager extends Component {
    public static Instance: CDXX_GameManager = null;
    public static IsMute: boolean = false;

    @property(Node)
    Canvas: Node = null;

    @property(Node)
    MorGame: Node = null;

    @property(CDXX_Loading)
    LoadingPanel: CDXX_Loading = null;

    @property(CDXX_TipsPanel)
    TipsPanel: CDXX_TipsPanel = null;

    @property(Node)
    ResurgencePanel: Node = null;

    @property(Node)
    BattlePanel: Node = null;

    @property(Node)
    ShowBattleHide: Node[] = [];

    @property(CDXX_CSPanel)
    CSPanel: CDXX_CSPanel = null;

    IsBattle: boolean = false;
    protected onLoad(): void {
        CDXX_GameManager.Instance = this;
    }

    protected start(): void {
        if (CDXX_GameData.Instance.IsInit) {
            CDXX_GameData.Instance.IsInit = false;
            CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_TIPS_SHOW);
            this.scheduleOnce(() => {
                CDXX_Equipment.Instance.addPickaxe("鎏金执法者");
            });
            // CDXX_GameData.AddPickaxeByName("鎏金执法者");
        }
        this.MorGame.active = Banner.IsShowServerBundle;

        CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_BG_SHOW, CDXX_GameData.Instance.CurMap);
        CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_STATE_SHOW);

        ProjectEventManager.emit(ProjectEvent.游戏开始, "吃丹修仙");
    }

    breakStart() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "米吃丹修仙饭仙人");
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
                    CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_RESUME);
                    this.ResurgencePanel.active = false;
                    CDXX_PlayerController.Instance.Injured = 0;
                    CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_STATE_SHOW);
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
        CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_PAUSE);
        this.ResurgencePanel.active = true;
    }

    ShowBattlePanel() {
        this.ShowLoadingPanel(3, () => {
            this.IsBattle = true;
            this.ShowBattleHide.forEach(e => e.active = false);
            this.BattlePanel.active = true;
            CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_BG_SHOW, CDXX_GameData.Instance.CurMap);
        })
    }

    ShowCSPanel(map: CDXX_BG) {
        this.CSPanel.Show(map);
    }

    CloseBattlePanel() {
        CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_PAUSE);
        CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_ENEMY_REMOVE);
        this.ShowLoadingPanel(3, () => {
            this.IsBattle = false;
            this.ShowBattleHide.forEach(e => e.active = true);
            this.BattlePanel.active = false;
            CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_BG_SHOW, CDXX_GameData.Instance.CurMap);

            CDXX_PlayerController.Instance.Injured = 0;
            CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_STATE_SHOW);
        })
    }
}


