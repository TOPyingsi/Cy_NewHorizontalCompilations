import { _decorator, Component, director, easing, EventTouch, Node, tween, UIOpacity, v3 } from 'cc';
import { ZSTSB_AudioManager } from './ZSTSB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_UIGame')
export class ZSTSB_UIGame extends Component {

    curScene: string = "选图界面";

    @property(Node)
    mapBtn: Node = null;

    @property(Node)
    ColorBox: Node = null;

    //填色弹出框
    public fillBoard: Node = null;

    //填色教程
    public fillCourse: Node = null;

    //地图填色进度
    public fillProgress: Node = null;

    public static instance: ZSTSB_UIGame = null;

    start() {
        ZSTSB_UIGame.instance = this;
        this.init();
    }

    update(deltaTime: number) {

    }

    onBtnClick(event: EventTouch) {
        ZSTSB_AudioManager.instance.playSFX("按钮");

        switch (event.target.name) {
            case "开始游戏":
                this.changeMenu("选图界面");
                break;
        }
    }

    changeMenu(nextName: string) {
        director.getScene().emit("钻石填色本_开始切换场景");

        let curOp = this.node.getChildByName(this.curScene).getComponent(UIOpacity);

        tween(curOp)
            .to(0.2, { opacity: 0 }, { easing: "backIn" })
            .call(() => {
                if (this.curScene !== "游戏界面") {
                    this.node.getChildByName(this.curScene).active = false;
                }
                this.node.getChildByName(nextName).active = true;

            })
            .start();

        let nextOp = this.node.getChildByName(nextName).getComponent(UIOpacity);
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

        tween(this.ColorBox)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backOut" })
            .call(() => {

            })
            .start();
    }

    hideColorBox() {

        tween(this.ColorBox)
            .to(0.5, { scale: v3(0, 0, 0) }, { easing: "backIn" })
            .call(() => {
                this.ColorBox.active = false;
            })
            .start();
    }

    init() {

    }
}


