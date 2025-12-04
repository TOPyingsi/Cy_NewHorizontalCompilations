import { _decorator, Component, director, instantiate, Node, Prefab } from 'cc';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import Banner from 'db://assets/Scripts/Banner';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('NQXLC_GameManager')
export class NQXLC_GameManager extends Component {
    public static Instance: NQXLC_GameManager = null;

    @property(Node)
    Canvas: Node = null;

    @property(Node)
    MoreGameBtn: Node = null;

    protected onLoad(): void {
        NQXLC_GameManager.Instance = this;
    }

    protected start(): void {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "女寝修罗场");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.MoreGameBtn);
    }

    breakStart() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "女寝修罗场");
            })
        });
    }

}


