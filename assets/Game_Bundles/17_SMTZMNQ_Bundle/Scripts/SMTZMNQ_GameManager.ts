import { _decorator, Component, director, Node } from 'cc';
import Banner from '../../../Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from '../../../Scripts/GameManager';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { DataManager } from '../../../Scripts/Framework/Managers/DataManager';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_GameManager')
export class SMTZMNQ_GameManager extends Component {
    public static Instance: SMTZMNQ_GameManager = null;

    @property(Node)
    MoreGame: Node = null;

    Age: string = "20 岁";
    Gender = "女性";
    Weight = "45 千克";
    Blood = "A";

    protected onLoad(): void {
        SMTZMNQ_GameManager.Instance = this;
    }

    protected start(): void {
        this.MoreGame.active = Banner.IsShowServerBundle;
        ProjectEventManager.emit(ProjectEvent.游戏开始, "生命体征模拟器");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.MoreGame);
    }

    breakStart() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "生命体征模拟器");
            })
        });

    }

}


