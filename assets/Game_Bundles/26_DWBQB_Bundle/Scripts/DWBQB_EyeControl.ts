import { _decorator, Component, director, EventTouch, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_EyeControl')
export class DWBQB_EyeControl extends Component {

    private _originalScale: Vec3 = new Vec3();
    private _isTouching: boolean = false;
    private _touchStartPosY: number = 0;

    protected onLoad(): void {
        this.node.getScale(this._originalScale);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    start() {

    }

    update(deltaTime: number) {
        
    }
 
     private onTouchStart(event: EventTouch): void {
        director.emit("TouchStart",1);
        const touchPos = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        if (Math.abs(localPos.x) <= uiTransform.contentSize.width / 2 && 
            Math.abs(localPos.y) <= uiTransform.contentSize.height / 2) {
            this._isTouching = true;
            this._touchStartPosY = touchPos.y;
        }
    }
    private onTouchMove(event: EventTouch): void {
        if (!this._isTouching) return;

        const currentPos = event.getUILocation();
        const deltaY = currentPos.y - this._touchStartPosY;
        const newScaleY = Math.max(0.5, Math.min(1, 1 - Math.abs(deltaY) * 0.005));
        const newScaleX = Math.max(1.2, Math.min(1, 1 + Math.abs(deltaY) * 0.005)); 
        
        this.node.setScale(newScaleX, newScaleY, 1);
    }
    private onTouchEnd(): void {
        director.emit("TouchEnd",1);
        if (this._isTouching) {
            this._isTouching = false;
            this.node.setScale(this._originalScale); 
        }
    }
}


