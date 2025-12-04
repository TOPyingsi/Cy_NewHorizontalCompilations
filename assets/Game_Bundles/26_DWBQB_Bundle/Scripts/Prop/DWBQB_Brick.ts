import { _decorator, Component, director, EventTouch, Node, tween, UITransform, Vec3 } from 'cc';
import { DWBQB_UIDisplay } from '../DWBQB_UIDisplay';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_Brick')
export class DWBQB_Brick extends Component {
    private offset: Vec3 = new Vec3();
    private _isTouching: boolean = false;
    private originalPos: Vec3 = new Vec3();

    @property(Node)
    private EffectNode: Node = null;

    private finalPos: Vec3 = new Vec3();
    protected onLoad(): void {
        this.finalPos.set(this.EffectNode.position);
        this.originalPos.set(this.node.position);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    protected start(): void {

    }
    private onTouchStart(event: EventTouch) {
        const touchPos = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        if (Math.abs(localPos.x) <= uiTransform.contentSize.width / 2 &&
            Math.abs(localPos.y) <= uiTransform.contentSize.height / 2) {
            this.node.parent.parent.getComponent(DWBQB_UIDisplay).onUIDisplay();
            this._isTouching = true;
            const nodePos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            this.offset.set(this.node.position.x - nodePos.x, this.node.position.y - nodePos.y, 0);
            // console.log("onTouchStart");
        }
    }
    private onTouchMove(event: EventTouch) {
        if (this._isTouching == false) return;
        this.node.setScale(0.7, 0.7, 1);
        const touchPos = event.getUILocation();
        const worldPos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        this.node.setPosition(worldPos.x + this.offset.x, worldPos.y + this.offset.y);
        // console.log("onTouchMove"); 
    }
    private onTouchEnd(event: EventTouch) {
        if (this.node.parent.getChildByName("触摸限制")) {
            this.node.parent.getChildByName("触摸限制").active = true;
        }
        const startPos = this.node.position.clone();
        const controlPoint = new Vec3(
            (startPos.x + this.finalPos.x) / 2,
            Math.max(startPos.y, this.finalPos.y) + 200, // 抛物线顶点高度
            0
        );
        tween(this.node)
            .to(0.8,
                {},
                {
                    onUpdate: (target: Node, ratio: number) => {
                        // 贝塞尔曲线计算
                        const x = (1 - ratio) * (1 - ratio) * startPos.x +
                            2 * ratio * (1 - ratio) * controlPoint.x +
                            ratio * ratio * this.finalPos.x;

                        const y = (1 - ratio) * (1 - ratio) * startPos.y +
                            2 * ratio * (1 - ratio) * controlPoint.y +
                            ratio * ratio * this.finalPos.y;

                        target.setPosition(x, y);

                        const newAngle = target.eulerAngles.z + 720 * 0.016;
                        target.setRotationFromEuler(0, 0, newAngle);
                    },
                    easing: "sineOut"
                }
            )
            .start();
        this.scheduleOnce(() => {
            director.emit("useProp", 1);
            this.node.setScale(0.35, 0.35, 1);
            this.node.setPosition(this.originalPos);
            director.emit("useProp", 9);
            this.node.setRotationFromEuler(0, 0, 0);
            tween(this.EffectNode)
                .to(0.5,
                    { scale: new Vec3(0.8, 0.8, 1) },
                    { easing: "sineOut" }
                )
                .start();
        }, 0.9);
        this.scheduleOnce(() => {
            this.EffectNode.setScale(0, 0, 1);
            this._isTouching = false;
            if (this.node.parent.getChildByName("触摸限制")) {
                this.node.parent.getChildByName("触摸限制").active = false;
            }
        }, 2.5);


    }
    update(deltaTime: number) {

    }
}


