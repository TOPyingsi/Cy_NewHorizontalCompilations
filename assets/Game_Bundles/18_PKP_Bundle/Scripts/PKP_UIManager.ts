import { _decorator, Component, Node, director } from 'cc';
import { PKP_ScoreManager } from './PKP_ScoreManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { UIManager, Panel } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('PKP_UIManager')
export class PKP_UIManager extends Component {

    private static _instance: PKP_UIManager = null;

    public static get instance(): PKP_UIManager {
        return this._instance;
    }

    @property(Node)
    public opponentUI: Node = null;
    @property(Node)
    public turnYouUI: Node = null;
    @property(Node)
    public turnOpponentUI: Node = null;
    @property(Node)
    public succeedUI: Node = null;
    @property(Node)
    public failedUI: Node = null;
    @property(Node)
    public drawUI: Node = null;
    @property(Node)
    public more: Node = null;

    onLoad() {
        PKP_UIManager._instance = this;
        ProjectEventManager.emit(ProjectEvent.游戏开始, "拍卡");
        // ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.more);
    }

    // 显示对手UI
    public showOpponentUI() {
        this.opponentUI.active = true;
    }
    // 隐藏对手UI
    public hideOpponentUI() {
        this.opponentUI.active = false;
    }

    // 显示你的回合UI
    public showTurnYouUI() {
        this.turnYouUI.active = true;
    }
    // 隐藏你的回合UI
    public hideTurnYouUI() {
        this.turnYouUI.active = false;
    }

    // 显示对手回合UI
    public showTurnOpponentUI() {
        this.turnOpponentUI.active = true;
    }
    // 隐藏对手回合UI
    public hideTurnOpponentUI() {
        this.turnOpponentUI.active = false;
    }

    // 成功结算界面显示
    public showSucceedUI() {
        this.succeedUI.active = true;
    }
    // 成功结算界面隐藏
    public hideSucceedUI() {
        this.succeedUI.active = false;
    }

    // 失败结算界面显示
    public showFailedUI() {
        this.failedUI.active = true;
    }
    // 失败结算界面隐藏
    public hideFailedUI() {
        this.failedUI.active = false;
    }

    // 平局结算界面显示
    public showDrawUI() {
        this.drawUI.active = true;
    }
    // 平局结算界面隐藏
    public hideDrawUI() {
        this.drawUI.active = false;
    }

    protected onDisable(): void {
        this.hideOpponentUI();
        this.hideTurnYouUI();
        this.hideTurnOpponentUI();
        this.hideSucceedUI();
        this.hideFailedUI();
        this.hideDrawUI();
    }

    // 返回主菜单
    public onCameBackHome() {
        // director.loadScene("PKP_MenuScene");
        // ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
        //     UIManager.ShowPanel(Panel.LoadingPanel, "PKP_MenuScene", () => {
        //         ProjectEventManager.emit(ProjectEvent.返回主页, "拍卡片");
        //     })
        // });
        UIManager.ShowPanel(Panel.LoadingPanel, "PKP_MenuScene");
    }

    // 下一关
    public onNextLevel() {
        switch (director.getScene().name) {
            case "PKP_GameScene01":
                director.loadScene("PKP_GameScene02");
                break;
            case "PKP_GameScene02":
                director.loadScene("PKP_GameScene03");
                break;
            case "PKP_GameScene03":
                director.loadScene("PKP_GameScene04");
                break;
            case "PKP_GameScene04":
                director.loadScene("PKP_GameScene05");
                break;
            case "PKP_GameScene05":
                director.loadScene("PKP_GameScene06");
                break;
            case "PKP_GameScene06":
                director.loadScene("PKP_GameScene01");
                break;
        }
    }

    // 再来一次
    public onTryAgain() {
        //var scene = director.getScene();
        //console.log("onTryAgain" + director.getScene().name);

        // 重新加载当前场景
        director.loadScene(director.getScene().name);
    }
}
