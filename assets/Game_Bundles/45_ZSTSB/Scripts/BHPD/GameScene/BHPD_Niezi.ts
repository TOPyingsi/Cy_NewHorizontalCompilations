import { _decorator, Color, Component, director, EventTouch, Node, NodeEventType, Sprite, tween, v3, Vec3 } from 'cc';
import { BHPD_GameMgr } from '../BHPD_GameMgr';
import { BHPD_GameData } from '../BHPD_GameData';
import { ZSTSB_AudioManager } from '../../ZSTSB_AudioManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('BHPD_Niezi')
export class BHPD_Niezi extends Component {

    public maxFill: number = 10;
    public curFill: number = 0;

    public preColor: Color = Color.WHITE;
    public curColor: Color = new Color();

    //是否正在填充
    public isFilling: boolean = false;
    //是否正在填充位置
    public isFillPos: boolean = false;
    //是否正在放置圆圈位置
    public isTruePos: boolean = false;

    public circleNode: Node = null;
    private circleSprite: Sprite = null;
    private fillBox: Node[] = [];

    private startPos: Vec3 = v3(0, 0, 0);
    start() {
        this.fillBox = this.node.children;
        this.circleNode = this.node.getChildByName("白圈");
        this.circleSprite = this.circleNode.getComponent(Sprite);

        console.log(this.circleNode);
        console.log(this.fillBox);

        this.node.on(NodeEventType.TOUCH_START, this.touchStart, this);
        this.node.on(NodeEventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(NodeEventType.TOUCH_END, this.touchEnd, this);

        this.startPos = this.node.worldPosition.clone();
        // director.getScene().on("八花拼豆_错误位置", () => {
        //     this.isFillPos = false;
        // }, this);
    }

    couldMove: boolean = true;
    touchStart(event: EventTouch) {
        if (!this.couldMove) {
            return;
        }
        const touchPos = v3(event.getUILocation().x, event.getUILocation().y);
        this.node.worldPosition = touchPos;
        if (this.isNextStep) {
            return;
        }
    }

    isMoving: boolean = false;
    touchMove(event: EventTouch) {
        if (!this.couldMove) {
            return;
        }
        const touchPos = v3(event.getUILocation().x, event.getUILocation().y, 0);
        this.node.worldPosition = touchPos;

        if (this.isNextStep) {
            return;
        }

        this.isMoving = true;

        const fillPos = this.circleNode.worldPosition;
        if (this.curFill > 0 && !this.isFilling) {
            BHPD_GameMgr.instance.onFill(fillPos, "PixelBox");
        }
        if (this.curFill <= this.maxFill) {
            BHPD_GameMgr.instance.onFill(fillPos, "ColorBox");
        }
    }

    touchEnd(event: EventTouch) {
        if (!this.couldMove) {
            return;
        }

        this.isMoving = false;

        if (this.isNextStep) {
            this.nextStep();
            return;
        }

        const fillPos = this.circleNode.worldPosition;
        if (this.curFill <= this.maxFill) {
            BHPD_GameMgr.instance.onFill(fillPos, "ColorBox");
        }
    }

    //是否开启无限填充(测试用)
    isFillEndless: boolean = false;
    onFill() {
        if (this.isFillEndless) {
            return;
        }
        this.curFill--;
        this.fillBox[this.curFill + 1].active = false;
        if (this.curFill <= 0) {
            this.circleNode.active = false;
        }
    }
    //填充无限(测试用)
    fillText() {
        this.isFillEndless = !this.isFillEndless;
        UIManager.ShowTip("是否无限填充： " + this.isFillEndless);
    }

    //准备填充
    isFirst: boolean = true;
    startFill(color: Color) {

        if (this.isFilling) {
            return;
        }

        if (BHPD_GameData.Instance.isFirst && this.isFirst) {
            this.isFirst = false;
            director.getScene().emit("八花拼豆_新手教程");
        }

        this.isFilling = true;

        if (this.preColor != color) {
            this.Clear();
        }

        this.circleSprite.color = color;
        this.circleNode.active = true;

        this.curColor = color;
        BHPD_GameMgr.instance.curColor = color;

        for (let i = 1; i < this.fillBox.length; i++) {
            this.fillBox[i].getComponent(Sprite).color = color;
        }

        this.schedule(this.addFilling, 0.1);
    }
    //填充
    addFilling() {
        if (!this.isFillPos) {
            this.isFilling = false;
            this.preColor = this.curColor;
            this.stopFill();
            return;
        }

        this.fillBox[this.curFill + 1].active = true;
        this.curFill++;
        ZSTSB_AudioManager.instance.playSFX("吸附");
        if (this.curFill >= this.maxFill) {
            this.isFilling = false;
            BHPD_GameMgr.instance.isFilling = false;
            this.stopFill();
        }
    }

    stopFill() {
        console.log("取消填充");
        this.unschedule(this.addFilling);
    }

    nextStep() {
        this.ResetPos();
        this.HideNiezi();
        this.isNextStep = false;
        BHPD_GameMgr.instance.iron.showIron();
    }

    HideNiezi() {
        this.couldMove = false;

        tween(this.node)
            .to(0.5, { position: v3(-150, -800, 0) })
            .call(() => {
                this.couldMove = true;
            })
            .start();
    }

    Clear() {
        for (let i = 1; i < this.fillBox.length; i++) {
            this.fillBox[i].active = false;
        }
        this.curFill = 0;
        this.circleNode.active = false;
    }

    isNextStep: boolean = false;
    restart() {
        this.Clear();
        this.isNextStep = true;
        // this.node.worldPosition = this.startPos;
    }

    ResetPos() {
        this.Clear();
        this.isNextStep = false;
        this.node.worldPosition = this.startPos;
    }
}


