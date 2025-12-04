import { _decorator, Component, EventTouch, Node, randomRangeInt, Sprite, tween, v3, Vec3 } from 'cc';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { JJHZ_CatalogButton } from './JJHZ_CatalogButton';
import { JJHZ_CharacterClearUI } from './JJHZ_CharacterClearUI';
import JJHZ_ClearMask from './JJHZ_ClearMask';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_CardHolder')
export class JJHZ_CardHolder extends Component {

    @property(Node)
    seal: Node;

    @property(Node)
    pack: Node;

    @property(Node)
    tutorial: Node;

    @property(Sprite)
    card: Sprite;

    @property(JJHZ_ClearMask)
    clearMask: JJHZ_ClearMask;

    cardNum = -1;
    cardName: string;

    protected onEnable(): void {
        this.seal.angle = 0;
        this.seal.setPosition(Vec3.ZERO);
        this.seal.active = true;
        this.pack.setPosition(Vec3.ZERO);
        this.card.node.setPosition(Vec3.ZERO);
        this.card.node.setScale(Vec3.ONE);
        this.node.setScale(Vec3.ZERO);
        tween(this.node)
            .to(0.25, { scale: Vec3.ONE })
            .start();
    }

    start() {

    }

    update(deltaTime: number) {

    }

    Init() {
        this.clearMask.node.active = true;
        this.clearMask.Reset();
        this.cardNum = randomRangeInt(0, JJHZ_CatalogButton.cards.length);
        this.card.spriteFrame = JJHZ_CatalogButton.cards[this.cardNum];
        this.cardName = JJHZ_CatalogButton.cards[this.cardNum].name;
    }

    Choose() {
        tween(this.node)
            .to(0.25, { position: Vec3.ZERO })
            .call(() => {
                this.Open();
            })
            .start();
    }

    Lost() {
        tween(this.node)
            .to(0.25, { scale: Vec3.ZERO })
            .call(() => { this.node.active = false; })
            .start();
    }

    Open() {
        tween(this.seal)
            .to(0.5, { angle: -60 })
            .to(0.5, { position: v3(1500, 0) })
            .call(() => {
                this.seal.active = false;
                this.Init();
                tween(this.pack)
                    .to(0.5, { position: v3(0, -1000) })
                    .call(() => {
                        this.tutorial.active = true;
                        this.card.node.on(Node.EventType.TOUCH_START, this.ToolTouchStart, this);
                        this.card.node.on(Node.EventType.TOUCH_MOVE, this.ToolTouchMove, this);
                        this.card.node.on(Node.EventType.TOUCH_END, this.ToolTouchEndOrCancel, this);
                        this.card.node.on(Node.EventType.TOUCH_CANCEL, this.ToolTouchEndOrCancel, this);
                    })
                    .start();
            })
            .start();
    }

    ToolTouchStart(event: EventTouch) {
        this.tutorial.active = false;
        var pos = v3(event.touch.getUILocationX(), event.touch.getUILocationY());
        this.clearMask.touchStartEvent(pos);
    }

    ToolTouchMove(event: EventTouch) {
        var pos = v3(event.touch.getUILocationX(), event.touch.getUILocationY());
        this.clearMask.touchMoveEvent(pos);
    }

    ToolTouchEndOrCancel(event: EventTouch) {
        this.clearMask.tempDrawPoints = [];
        if (this.clearMask.ClearRate >= 0.8) {
            this.clearMask.node.active = false;
            this.card.node.off(Node.EventType.TOUCH_START, this.ToolTouchStart, this);
            this.card.node.off(Node.EventType.TOUCH_MOVE, this.ToolTouchMove, this);
            this.card.node.off(Node.EventType.TOUCH_END, this.ToolTouchEndOrCancel, this);
            this.card.node.off(Node.EventType.TOUCH_CANCEL, this.ToolTouchEndOrCancel, this);
            this.Check();
        }
    }

    Check() {
        tween(this.card.node)
            .to(0.25, { scale: v3(1.2, 1.2, 1.2) })
            .to(0.25, { scale: Vec3.ONE })
            .call(() => {
                JJHZ_CharacterClearUI.Instance.Show(this.cardNum);
            })
            .start();
    }

    End() {
        tween(this.card.node)
            .to(0.5, { scale: Vec3.ZERO, worldPosition: JJHZ_CatalogButton.Instance.node.getWorldPosition() })
            .call(() => {
                PoolManager.PutNode(JJHZ_CharacterClearUI.Instance.node);
            })
            .start();
    }
}


