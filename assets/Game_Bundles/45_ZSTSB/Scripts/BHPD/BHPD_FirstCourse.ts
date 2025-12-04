import { _decorator, Component, director, Node, NodeEventType } from 'cc';
import { BHPD_GameMgr } from './BHPD_GameMgr';
import { BHPD_GameData } from './BHPD_GameData';
const { ccclass, property } = _decorator;

@ccclass('BHPD_FirstCourse')
export class BHPD_FirstCourse extends Component {
    @property({ type: [Node] })
    public courseNodes: Node[] = [];

    @property(Node)
    reward: Node = null;

    index: number = 0;
    airWall: Node = null;
    start() {
        // if (!ZSTSB_GameData.Instance.isGameFirst) {
        //     this.node.destroy();
        //     return;
        // }

        this.airWall = BHPD_GameMgr.instance.AirWall;

        for (let i = 0; i < this.courseNodes.length; i++) {
            this.courseNodes[i].once(NodeEventType.TOUCH_END, this.onClick, this);
        }

        director.getScene().on("八花拼豆_新手教程", this.onClick, this);
        director.getScene().once("八花拼豆_新手教程结束", this.FinishCourse, this);
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
        BHPD_GameData.Instance.isFirst = false;
        console.error(2222);
    }

}


