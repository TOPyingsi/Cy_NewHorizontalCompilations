import { _decorator, Component, director, EventTouch, Node, screen, Sprite, SpriteFrame, UITransform, Vec3,} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_Bone')
export class DWBQB_Bone extends Component {
    private offset: Vec3 = new Vec3();
    private _isTouching: boolean = false;
    private originalPos: Vec3 = new Vec3();
    private isPlay: boolean = false;
    @property([SpriteFrame])
    private bone: SpriteFrame[] = [];

    private isEat:boolean=false;
    protected onLoad(): void {
        this.originalPos.set(this.node.position);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
    start() {

    }

    private onTouchStart(event: EventTouch) {
        const touchPos = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        if (Math.abs(localPos.x) <= uiTransform.contentSize.width / 2 &&
            Math.abs(localPos.y) <= uiTransform.contentSize.height / 2) {
            this._isTouching = true;
            const nodePos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            this.offset.set(this.node.position.x - nodePos.x, this.node.position.y - nodePos.y, 0);
        }
    }
    private onTouchMove(event: EventTouch) {
        this.node.setScale(1.3,1.3,1);
        if (this._isTouching == false) return;
        const touchPos = event.getUILocation();
        const worldPos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        this.node.setPosition(worldPos.x + this.offset.x, worldPos.y + this.offset.y);
        const mouthControls = director.getScene()!.getComponentsInChildren('DWBQB_AnimalMouthControl');
        const lemonWorldPos = this.node.getWorldPosition();
        let isInMouthArea = false;
        mouthControls.forEach(control => {
            const mouthNode = control.node;
            const mouthTrans = mouthNode.getComponent(UITransform);
            const localPos = mouthTrans.convertToNodeSpaceAR(lemonWorldPos);
            if (Math.abs(localPos.x) <= mouthTrans.width / 2 &&
                Math.abs(localPos.y) <= mouthTrans.height / 2) {
                isInMouthArea = true;

                this.scheduleOnce(() => {
                    if(this.isEat)return;
                    this.node.getComponent(Sprite).spriteFrame = this.bone[1];
                    this.scheduleOnce(() => {
                        this.node.getComponent(Sprite).spriteFrame = null;
                        this.isEat=true;
                    }, 0.5);
                }, 0.7);
                if (isInMouthArea) {
                    if (this.isPlay) return;
                    this.isPlay = true;
                    director.emit("useProp", 5);
                }
            }
        });
    }
    private onTouchEnd(event: EventTouch) {
        this.node.setScale(0.5,0.6,1);
        this.isPlay = false;
        this.node.setPosition(this.originalPos);
        this.scheduleOnce(()=>{
            this.node.getComponent(Sprite).spriteFrame = this.bone[0];
            this.isEat=false;
        },1.5);
        
    }
    update(deltaTime: number) {

    }
}


