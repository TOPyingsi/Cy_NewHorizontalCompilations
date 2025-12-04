import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XYMJDWY_AudioManager } from './XYMJDWY_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XYMJDWY_lotteryPanel } from './Panel/XYMJDWY_lotteryPanel';
import { XYMJDWY_conversionPanel } from './Panel/XYMJDWY_conversionPanel';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_Start')
export class XYMJDWY_Start extends Component {
    @property(Node)
    public Canvas: Node = null;

    start() {
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.Canvas.getChildByName("UI").getChildByName("更多模式"));
    }
    OnbuttomClick(btn: EventTouch) {
        XYMJDWY_AudioManager.globalAudioPlay("点击");
        switch (btn.target.name) {
            case "仓库":
                this.Canvas.getChildByName("仓库界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "出售":
                this.Canvas.getChildByName("出售界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "黑市":
                this.Canvas.getChildByName("黑市界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "钥匙":
                this.Canvas.getChildByName("钥匙界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "皮肤":
                this.Canvas.getChildByName("皮肤界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "校长的金牙":
                this.Canvas.getChildByName("金牙兑换界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "开始摸金":
                this.Canvas.getChildByName("地图选择界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "学位升级":
                this.Canvas.getChildByName("学位升级界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "皮肤抽奖1":
                XYMJDWY_lotteryPanel.lotteryPanelIndex = 0;
                this.Canvas.getChildByName("抽奖界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "皮肤抽奖2":
                XYMJDWY_lotteryPanel.lotteryPanelIndex = 1;
                this.Canvas.getChildByName("抽奖界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "战令":
                this.Canvas.getChildByName("战令界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "兑换1":
                XYMJDWY_conversionPanel.conversionPanelIndex = 0;
                this.Canvas.getChildByName("兑换界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "兑换2":
                XYMJDWY_conversionPanel.conversionPanelIndex = 1;
                this.Canvas.getChildByName("兑换界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "兑换3":
                XYMJDWY_conversionPanel.conversionPanelIndex = 2;
                this.Canvas.getChildByName("兑换界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "兑换4":
                XYMJDWY_conversionPanel.conversionPanelIndex = 3;
                this.Canvas.getChildByName("兑换界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "挂机模式":
                this.Canvas.getChildByName("挂机模式界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "锻造":
                this.Canvas.getChildByName("锻造界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break;
            case "返回":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "校园摸金");
                    });
                });
                // director.loadScene("Start");
                break;
            case "校外地图":
                this.Canvas.getChildByName("特殊地图界面").active = true;
                ProjectEventManager.emit(ProjectEvent.弹出窗口);
                break

        }


    }

}


