import { _decorator, Button, Component, director, Node, NodeEventType, tween, v3 } from 'cc';
import { ZSTSB_GameData } from './ZSTSB_GameData';
import { ZSTSB_AudioManager } from './ZSTSB_AudioManager';
import { ZSTSB_GameMgr } from './ZSTSB_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_FirstCourse')
export class ZSTSB_FirstCourse extends Component {

    @property({ type: [Node] })
    public courseNodes: Node[] = [];

    @property(Node)
    reward: Node = null;

    index: number = 0;
    airWall: Node = null;
    start() {
        if (!ZSTSB_GameData.Instance.isGameFirst) {
            this.node.destroy();
            return;
        }

        this.airWall = ZSTSB_GameMgr.instance.AirWall;

        for (let i = 0; i < this.courseNodes.length; i++) {
            this.courseNodes[i].once(NodeEventType.TOUCH_END, this.onClick, this);
        }

        director.getScene().on("钻石填色本_新手教程", this.onClick, this);
        director.getScene().once("钻石填色本_新手教程结束", this.FinishCourse, this);
    }

    onClick() {

        this.index++;


        this.airWall.active = true;

        console.log("点击了", this.index);

        this.node.children[this.index - 1].active = false;

        if (this.index >= this.node.children.length) {
            this.airWall.active = false;
            return;
        }

        this.scheduleOnce(() => {
            if (this.node.children[this.index]) {
                this.node.children[this.index].active = true;
            }

            this.airWall.active = false;
        }, 0.3);
    }

    FinishCourse() {

        this.reward.active = true;

        tween(this.reward)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backOut" })
            .start();
    }

    getReward() {

        director.getScene().off("钻石填色本_新手教程");

        ZSTSB_AudioManager.instance.playSFX("按钮");

        let btn = this.reward.getChildByName("领取").getComponent(Button);
        btn.enabled = false;

        tween(this.reward)
            .to(0.5, { scale: v3(0, 0, 0) }, { easing: "backOut" })
            .call(() => {
                this.reward.active = false;
            })
            .start();

        director.getScene().emit("钻石填色本_获得道具", "消除当前数字索引", 10);
        ZSTSB_GameData.Instance.isGameFirst = false;
    }
}


