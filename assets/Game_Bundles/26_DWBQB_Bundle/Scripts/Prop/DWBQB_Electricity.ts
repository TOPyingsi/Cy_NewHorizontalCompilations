import { _decorator, Animation, Component, director, EventTouch, Node, Sprite, UITransform, Vec3 } from 'cc';
import { DWBQB_UIDisplay} from '../DWBQB_UIDisplay';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_Electricity')
export class DWBQB_Electricity extends Component {
    private offset: Vec3 = new Vec3();
    private _isTouching: boolean = false;
    private originalPos: Vec3 = new Vec3(); 
    
    protected onLoad(): void {
          this.originalPos.set(this.node.position);
          this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
          this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
          this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);  
        }
        protected start(): void {
            
        }
    private onTouchStart(event:EventTouch) {
        this.node.setScale(0.7,0.7,1);
        const touchPos = event.getUILocation();
        const uiTransform = this.node.getComponent(UITransform);
        const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        if (Math.abs(localPos.x) <= uiTransform.contentSize.width / 2 && 
            Math.abs(localPos.y) <= uiTransform.contentSize.height / 2) {
            this._isTouching = true;
            this.node.parent.parent.getComponent(DWBQB_UIDisplay).onUIDisplay();
            const nodePos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            this.offset.set(this.node.position.x - nodePos.x, this.node.position.y - nodePos.y, 0);
        }
    }
    private onTouchMove(event:EventTouch) {
        if(this._isTouching == false)return;
            const touchPos = event.getUILocation();
            const worldPos = this.node.parent!.getComponent(UITransform)!.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            this.node.setPosition(worldPos.x + this.offset.x, worldPos.y + this.offset.y);
            this.node.getChildByName("电").getComponent(Animation).play(); 
            director.emit("useProp",1);
    }
    private onTouchEnd(event:EventTouch) {
        this.node.setScale(0.35,0.35,1);
        this.node.setPosition(this.originalPos);
        this.node.getChildByName("电").getComponent(Animation).stop();
        this.node.getChildByName("电").getComponent(Sprite).spriteFrame = null;
        this._isTouching = false;
        director.emit("useProp",9);
    }

    update(deltaTime: number) {
        
    }
}


