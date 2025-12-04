import { _decorator, Component, director, Node } from 'cc';
import { SJNDGZ_GameData } from './SJNDGZ_GameData';
import { SJNDGZ_Equipment } from './SJNDGZ_Equipment';
import Banner from 'db://assets/Scripts/Banner';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_GameManager')
export class SJNDGZ_GameManager extends Component {
    public static Instance: SJNDGZ_GameManager = null;
    public static IsMute: boolean = false;

    @property(Node)
    Canvas: Node = null;

    @property(Node)
    MoreGame: Node = null;

    protected onLoad(): void {
        SJNDGZ_GameManager.Instance = this;
        ProjectEventManager.emit(ProjectEvent.游戏开始, "升级你的镐子");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.MoreGame);
    }

    protected start(): void {
        if (SJNDGZ_GameData.Instance.IsInit) {
            SJNDGZ_GameData.Instance.IsInit = false;
            SJNDGZ_GameData.AddPickaxeByName("木镐");
            this.scheduleOnce(() => {
                SJNDGZ_Equipment.Instance.show();
            }, 1);
        }

        this.MoreGame.active = Banner.IsShowServerBundle;
    }

    breakStart() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "升级你的镐子");
            })
        })
    }

    moreGame() {
        UIManager.ShowPanel(Panel.MoreGamePanel);
    }
}


