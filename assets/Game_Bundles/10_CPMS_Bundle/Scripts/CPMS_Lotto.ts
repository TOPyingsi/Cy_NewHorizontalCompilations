import { _decorator, CCInteger, Component, EventTouch, Label, Node, randomRangeInt, v3 } from 'cc';
import CPMS_ClearMask from './CPMS_ClearMask';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_Lotto')
export class CPMS_Lotto extends Component {

    @property
    costMoney: number = 0;
    @property
    numX: number = 0;
    @property
    numY: number = 0;
    @property(Node)
    randomNumbers: Node;
    @property(Node)
    moneyNumbers: Node;
    @property(CPMS_ClearMask)
    clearMask: CPMS_ClearMask;

    numbers = [];
    moneyNumber: number[] = [];

    trueMoneyNumber: number[] = [];

    clearLimit = 0.9;

    protected onEnable(): void {
        this.clearMask.node.active = true;
        this.clearMask.Reset();
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Init() {
        this.numbers = [];
        this.trueMoneyNumber = [];
        for (let i = 0; i < this.moneyNumber.length; i++) {
            let element = this.moneyNumber[i];
            this.trueMoneyNumber.push(CPMS_GameUI.Instance.isVideo ? element * 100 : element);
        }
        for (let i = 0; i < this.numX; i++) {
            var num: number[] = [];
            this.numbers.push(num);
            for (let j = 0; j < this.numY; j++) {
                var num2 = randomRangeInt(0, 10);
                num.push(num2);
            }
        }
        for (let i = 0; i < this.randomNumbers.children.length; i++) {
            const element = this.randomNumbers.children[i];
            var x = Math.floor(i / this.numY);
            var y = i % this.numY;
            element.getComponent(Label).string = this.numbers[x][y];
        }
        for (let i = 0; i < this.moneyNumbers.children.length; i++) {
            const element = this.moneyNumbers.children[i];
            element.getComponent(Label).string = this.trueMoneyNumber[i] + "币";
            element.children[0].active = false;
        }
        this.takeOnTouch();
    }

    takeOnTouch() {
        this.node.on(Node.EventType.TOUCH_START, this.ToolTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.ToolTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.ToolTouchEndOrCancel, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.ToolTouchEndOrCancel, this);
    }

    takeOffTouch() {
        this.node.off(Node.EventType.TOUCH_START, this.ToolTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.ToolTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.ToolTouchEndOrCancel, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.ToolTouchEndOrCancel, this);
    }

    ToolTouchStart(event: EventTouch) {
        var pos = v3(event.touch.getUILocationX(), event.touch.getUILocationY());
        this.clearMask.touchStartEvent(pos);
    }

    ToolTouchMove(event: EventTouch) {
        var pos = v3(event.touch.getUILocationX(), event.touch.getUILocationY());
        this.clearMask.touchMoveEvent(pos);
    }

    ToolTouchEndOrCancel(event: EventTouch) {
        this.clearMask.tempDrawPoints = [];
        if (this.clearMask.ClearRate >= this.clearLimit) {
            this.clearMask.node.active = false;
            this.takeOffTouch();
            this.Check();
        }
    }

    Check() {

    }
}


