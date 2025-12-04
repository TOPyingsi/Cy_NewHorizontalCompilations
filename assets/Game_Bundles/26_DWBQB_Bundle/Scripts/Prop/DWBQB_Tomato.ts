import { _decorator, Animation, Component, director, EventTouch, Node, tween, UITransform, Vec3 } from 'cc';
import { DWBQB_UIDisplay } from '../DWBQB_UIDisplay';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_Tomato')
export class DWBQB_Tomato extends Component {
    private offset: Vec3 = new Vec3();
    private _isTouching: boolean = false;
    private originalPos: Vec3 = new Vec3();
    private _isMoveing: boolean = false;
    protected onLoad(): void {
        this.originalPos.set(this.node.position);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    start() {

    }

    private onTouchStart(event: EventTouch) {
        if (this._isMoveing) return;
        const touchPos = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        if (Math.abs(localPos.x) <= uiTransform.contentSize.width / 2 &&
            Math.abs(localPos.y) <= uiTransform.contentSize.height / 2) {
            this.node.parent.parent.getComponent(DWBQB_UIDisplay).onUIDisplay();
            this._isTouching = true;
            const nodePos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            this.offset.set(this.node.position.x - nodePos.x, this.node.position.y - nodePos.y, 0);
        }
    }
    private onTouchMove(event: EventTouch) {
        if (this._isTouching == false || this._isMoveing) return;
        const touchPos = event.getUILocation();
        const worldPos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        this.node.setPosition(worldPos.x + this.offset.x, worldPos.y + this.offset.y);
    }
    private onTouchEnd(event: EventTouch) {
        this._isMoveing = true;
        director.emit("useProp", 1);
        this.node.parent.parent.getChildByName("触摸限制").active = true;
        director.emit("useProp", 9);
        this.node.setPosition(this.originalPos);
        let EffectNode = this.node.getChildByName("番茄特效");
        EffectNode.active = true;
        tween(EffectNode)
            .to(0.5, { scale: new Vec3(1.5, 1.5, 1) })
            .start()
        this.scheduleOnce(() => {
            this.node.parent.parent.getChildByName("触摸限制").active = false;
            EffectNode.setScale(0.5, 0.5, 1);
            EffectNode.active = false;
            this._isMoveing = false;
        }, 1);
    }

    update(deltaTime: number) {

    }
}


