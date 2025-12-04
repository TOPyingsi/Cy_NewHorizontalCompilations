import { _decorator, Component, director, EventTouch, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_AnimalEarControl')
export class DWBQB_AnimalEarControl extends Component {

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    start() {

    }
    private onTouchStart(event: EventTouch): void {
        director.emit("TouchStart",1);
        const touchPos = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        if (Math.abs(localPos.x) <= uiTransform.contentSize.width / 2 && 
            Math.abs(localPos.y) <= uiTransform.contentSize.height / 2) {
            this.node.parent.getChildByName("腮红").active = true;
        }
    }
    private onTouchMove(event: EventTouch): void {
        
    }
    private onTouchEnd(): void {
        director.emit("TouchEnd",1);
        this.node.parent.getChildByName("腮红").active = false;
    }

    update(deltaTime: number) {
        
    }
}


