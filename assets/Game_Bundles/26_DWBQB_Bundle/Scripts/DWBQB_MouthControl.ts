import { _decorator, Component, director, EventTouch, Node, Sprite, SpriteFrame, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_MouthControl')
export class DWBQB_MouthControl extends Component {
    @property([SpriteFrame])
    private mouth: SpriteFrame[] = [];
    private _currMouth:SpriteFrame=null;
    private _originalScale: Vec3 = new Vec3();
    private _isTouching: boolean = false;
    private _touchStartPosY: number = 0;
    private _isShaking: boolean = false;
    private _shakeTimer: number = 0;
    private _originalPos: Vec3 = new Vec3(0,-170,0);

    @property([SpriteFrame])
    private otherMouth: SpriteFrame[] = [];
    protected onLoad(): void {
        this.node.getScale(this._originalScale);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    start() {
        this.node.setPosition(this._originalPos);
    }

    update(deltaTime: number) {
        
    }

    private onTouchStart(event: EventTouch): void {
        director.emit("TouchStart",0);
        const touchPos = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        if (Math.abs(localPos.x) <= uiTransform.width / 2 && 
            Math.abs(localPos.y) <= uiTransform.height / 2) {
            this._isTouching = true;
            this._touchStartPosY = touchPos.y;
            this._currMouth=this.node.getComponent(Sprite).spriteFrame;
            let index = Math.floor(Math.random() * (this.mouth.length));
            this.node.getComponent(Sprite).spriteFrame=this.mouth[index];
        }
    }
    private onTouchMove(event: EventTouch): void {
        if (!this._isTouching) return;
        
        const currentPos = event.getUILocation();
        const deltaY = currentPos.y - this._touchStartPosY;
        const absDelta = Math.abs(deltaY);
        const newScaleY = Math.max(3, Math.min(0.5, 1 - Math.abs(deltaY*0.2) * 0.0002));
        const newScaleX = Math.max(1.8, Math.min(0.5, 1 + Math.abs(deltaY*0.2) * 0.0002));
        if (absDelta > 100 && !this._isShaking) {
            this._isShaking = true;
            this.schedule(this.shakeEffect, 0.02);
        } else if (absDelta <= 100 && this._isShaking) {
            this._isShaking = false;
            this.unschedule(this.shakeEffect);
            this.node.setPosition(this._originalPos); 
        }
        
        this.node.setScale(newScaleX, newScaleY, 1);
    }
    private shakeEffect(): void {
        this._shakeTimer += 0.1;
        const offsetX = Math.sin(this._shakeTimer * 10) * 5;
        const offsetY = Math.cos(this._shakeTimer * 8) * 5;
        this.node.setPosition(
            this._originalPos.x + offsetX,
            this._originalPos.y + offsetY,
            this._originalPos.z
        );
    }
    private onTouchEnd(): void {
        director.emit("TouchEnd");
        if (this._isTouching) {
            this._isTouching = false;
            this.node.setScale(this._originalScale);
            this.node.getComponent(Sprite).spriteFrame=this._currMouth;
            this._isShaking = false;
            this.unschedule(this.shakeEffect);
            this.node.setPosition(this._originalPos); 
        }
    }
    firstMouthChange(){
        for(let i=0;i<this.mouth.length;i++){
            this.mouth[i]=this.otherMouth[i];
            this.mouth[i]=this.otherMouth[i];
         }
    }
    MouthChange(){
        for(let i=0;i<this.mouth.length;i++){
            this.mouth[i]=this.otherMouth[i+3];
            this.mouth[i]=this.otherMouth[i+3];
         }
    }
}


