import { _decorator, Button, Component, director, easing, EventTouch, Node, tween, UIOpacity, v3 } from 'cc';
import { ZSTSB_AudioManager } from './ZSTSB_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ZSTSB_GameMgr } from './ZSTSB_GameMgr';
import { BHPD_GameData } from './BHPD/BHPD_GameData';
import { ZSTSB_GameData } from './ZSTSB_GameData';
import { BHPD_GameMgr } from './BHPD/BHPD_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_UIGame')
export class ZSTSB_UIGame extends Component {

    curScene: string = "选图界面";

    @property(Node)
    mapBtn: Node = null;

    @property(Node)
    ColorBox: Node = null;

    startBtn: Button = null;
    closeBtn: Button = null;

    //填色教程
    public fillCourse: Node = null;

    //地图填色进度
    public fillProgress: Node = null;

    public gameType: string = "DIY豆豆";

    public static instance: ZSTSB_UIGame = null;

    start() {
        ZSTSB_UIGame.instance = this;
        BHPD_GameData.ReadDate();
        ZSTSB_GameData.ReadDate();
    }

    update(deltaTime: number) {

    }

    onBtnClick(event: EventTouch) {
        ZSTSB_AudioManager.instance.playSFX("按钮");

        switch (event.target.name) {
            case "返回主页":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "钻石填色本");
                    });
                });
                break;
            case "钻石填色":
                this.gameType = "钻石填色";
                if (ZSTSB_GameMgr.instance?.isPoolInit) {
                    this.scheduleOnce(() => {
                        director.getScene().emit("钻石填色本_加载进度", 1);
                    }, 0.2);
                }
                this.startMode();
                break;
            case "DIY豆豆":
                this.gameType = "DIY豆豆";
                if (BHPD_GameMgr.instance?.isPoolInit) {
                    this.scheduleOnce(() => {
                        director.getScene().emit("钻石填色本_加载进度", 1);
                    }, 0.2);
                }
                this.startMode();
                break;
        }
    }

    startMode() {
        director.getScene().emit("钻石填色本_开始切换场景");

        this.scheduleOnce(() => {
            this.node.getChildByName("选择模式").active = false;
            this.node.getChildByName(this.gameType).active = true;
            this.init();

            // switch (this.curScene) {
            //     case "钻石填色":
            //         ZSTSB_GameMgr.instance.PixelPoolCtrl.CreatePixels(25)
            // }
        }, 0.25);
    }

    restartGame() {
        this.node.getChildByName("钻石填色").active = false;
        this.node.getChildByName("DIY豆豆").active = false;
        this.node.getChildByName("选择模式").active = true;
    }

    changeMenu(nextName: string) {
        director.getScene().emit("钻石填色本_开始切换场景");

        let curOp = this.node.getChildByPath(this.gameType + "/" + this.curScene).getComponent(UIOpacity);

        tween(curOp)
            .to(0.2, { opacity: 0 }, { easing: "backIn" })
            .call(() => {
                if (this.curScene !== "游戏界面") {
                    this.node.getChildByPath(this.gameType + "/" + this.curScene).active = false;
                }
                this.node.getChildByPath(this.gameType + "/" + nextName).active = true;

            })
            .start();

        let nextOp = this.node.getChildByPath(this.gameType + "/" + nextName).getComponent(UIOpacity);
        tween(nextOp)
            .to(0.8, { opacity: 255 }, { easing: "backOut" })
            .call(() => {
                this.curScene = nextName;
            })
            .start();

        // this.scheduleOnce(() => {
        //     if (nextName !== "游戏界面") {
        //         director.getScene().emit("钻石填色本_切换场景结束");
        //     }
        // }, 1.3);
    }

    showColorBox() {
        this.ColorBox.active = true;
        this.ColorBox.parent.active = true;
        this.startBtn.enabled = false;
        this.closeBtn.enabled = false;

        this.ColorBox.scale = v3(0, 0, 0);

        tween(this.ColorBox)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backOut" })
            .call(() => {
                this.startBtn.enabled = true;
                this.closeBtn.enabled = true;
            })
            .start();
    }

    hideColorBox() {
        this.startBtn.enabled = false;
        this.closeBtn.enabled = false;

        this.ColorBox.scale = v3(1, 1, 1);

        tween(this.ColorBox)
            .to(0.5, { scale: v3(0, 0, 0) }, { easing: "backIn" })
            .call(() => {
                this.ColorBox.active = false;
                this.ColorBox.parent.active = false;
                this.startBtn.enabled = true;
                this.closeBtn.enabled = true;
            })
            .start();
    }

    init() {
        this.ColorBox = this.node.getChildByPath("/" + this.gameType + "/选图界面/填色框/面板");
        this.startBtn = this.ColorBox.getChildByName("填色按钮").getComponent(Button);
        this.closeBtn = this.ColorBox.getChildByName("关闭填色").getComponent(Button);
    }
}


