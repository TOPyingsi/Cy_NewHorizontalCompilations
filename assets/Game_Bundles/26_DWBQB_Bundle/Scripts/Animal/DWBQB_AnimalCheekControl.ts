import { _decorator, Component, director, EventTouch, Node, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
import { DWBQB_AudioControl } from '../DWBQB_AudioControl';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_AnimalCheekControl')
export class DWBQB_AnimalCheekControl extends Component {
    private _originalScale: Vec3 = new Vec3();
    private _isTouching: boolean = false;
    private _touchStartPosY: number = 0;
    private _touchStartPosX:number=0;

    @property([SpriteFrame])
    private cheek: SpriteFrame[] = [];

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
        director.emit("TouchStart",2);
        const touchPos = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        if (Math.abs(localPos.x) <= uiTransform.contentSize.width / 2 && 
            Math.abs(localPos.y) <= uiTransform.contentSize.height / 2) {
            this._isTouching = true;
            this._touchStartPosY = touchPos.y;
            this._touchStartPosX=touchPos.x;
        }
    }
    private onTouchMove(event: EventTouch): void {
    if (!this._isTouching) return;
    const currentPos = event.getUILocation();
    const deltaY = currentPos.y - this._touchStartPosY;
    const deltaX = currentPos.x - this._touchStartPosX;
    const absDelta = Math.abs(deltaY);
    // console.log(absDelta);
    this.node.parent.getChildByName("愤怒表情").active=true;
    switch(true) {
        case (absDelta >= 200):
            this.node.getComponent(Sprite).spriteFrame = this.cheek[6];
            this.node.parent.getChildByName("声音").getComponent(DWBQB_AudioControl).playAudio();
            break;
        case (absDelta >= 170):
            this.node.getComponent(Sprite).spriteFrame = this.cheek[5];
            break;
        case (absDelta >= 140):
            this.node.getComponent(Sprite).spriteFrame = this.cheek[4];
            break;
        case (absDelta >= 110):
            this.node.getComponent(Sprite).spriteFrame = this.cheek[3];
            break;
        case (absDelta >= 80):
            this.node.getComponent(Sprite).spriteFrame = this.cheek[2];
            break;
        case (absDelta >= 50):
            this.node.getComponent(Sprite).spriteFrame = this.cheek[1];
            break;
        case (absDelta >= 20):
            this.node.getComponent(Sprite).spriteFrame = this.cheek[0];
            break;
        default:
            this.node.getComponent(Sprite).spriteFrame = null;
    }
    const directionScale = deltaX > 0 ? 1 : -1;
    this.node.setScale(
        directionScale,
        this._originalScale.y, 
        1
    );
        
    }
    private onTouchEnd(): void {
        this.node.parent.getChildByName("愤怒表情").active=false;
        director.emit("TouchEnd");
        if (this._isTouching) {
            this._isTouching = false;
            this.node.setScale(this._originalScale);
            this.node.getComponent(Sprite).spriteFrame = null; 
        }
    }
}


