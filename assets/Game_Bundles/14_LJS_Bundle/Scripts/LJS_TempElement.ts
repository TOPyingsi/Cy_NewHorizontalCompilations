import { _decorator, Collider2D, Component, Contact2DType, EventTouch, IPhysics2DContact, Node, tween, UITransform, v3, Vec3 } from 'cc';
import { LSJ_WorkSpaceManager } from './LSJ_WorkSpaceManager';
const { ccclass, property } = _decorator;

@ccclass('LJS_TempElement')
export class LJS_TempElement extends Component {
    Collider: Collider2D = null;
    private startPos: Vec3 = new Vec3();
    private collidingTemp: Node = null;
    public static Touch = null;
    IsColllider: boolean = false;
    TempNode: Node = null;
    onLoad() {

        this.startPos = this.node.position.clone();
        this.node.on(Node.EventType.TOUCH_START, this.onDragStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onDrag, this);
        this.node.on(Node.EventType.TOUCH_END, this.onDrop, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onDrop, this);
        this.Collider = this.getComponent(Collider2D);
        if (this.Collider) {
            this.Collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
            this.Collider.on(Contact2DType.END_CONTACT, this.onEndConstact, this);
        }
        tween(this.node)
            .to(0, { scale: v3(0.2, 0.2, 1) })
            .to(0.3, { scale: v3(1, 1, 1) }, { easing: "backOut" })
            .start();//启动

    }
    // init() {
    //     this.startPos = this.node.position.clone();
    //     this.node.on(Node.EventType.TOUCH_START, this.onDragStart, this);
    //     this.node.on(Node.EventType.TOUCH_MOVE, this.onDrag, this);
    //     this.node.on(Node.EventType.TOUCH_END, this.onDrop, this);
    //     this.node.on(Node.EventType.TOUCH_CANCEL, this.onDrop, this);
    //     this.Collider = this.getComponent(Collider2D);
    //     if (this.Collider) {
    //         this.Collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
    //     }

    // } 
    onDragStart(event: EventTouch) {
        const uiTransform = this.node.getComponent(UITransform);//获取组件
        const spawnAreaWidth = uiTransform.width; // 预支体的宽度
        const spawnAreaHeight = uiTransform.height; // 预支体的高度
        const spawnAreaPos = this.node.worldPosition;
        let x = 0;
        let y = 0;
        let MaxX = spawnAreaPos.x + spawnAreaWidth / 2;
        let MinX = spawnAreaPos.x - spawnAreaWidth / 2;
        let MaxY = spawnAreaPos.y + spawnAreaHeight / 2;
        let MinY = spawnAreaPos.y - spawnAreaHeight / 2;
        if (event.getUILocation().x < MaxX && event.getUILocation().x > MinX && event.getUILocation().y < MaxY && event.getUILocation().y > MinY) {
            LJS_TempElement.Touch = true;
        }
    }
    onDrag(event: EventTouch) {
        this.Collider.enabled = false;
        if (LJS_TempElement.Touch == true) {
            const pos = event.getUILocation()
            this.node.worldPosition = v3(pos.x, pos.y, 0);
        }

    }
    private onDrop() {
        LJS_TempElement.Touch = false;
        this.Collider.enabled = true;
    }

    public onCollisionEnter(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.collidingTemp = otherCollider.node;
        if (otherCollider.node.name == "合成") {
            this.scheduleOnce(() => { this.node.destroy(); })
        }
        else if (this.collidingTemp != null) {
            //碰撞合成
            if (this.IsColllider) return;
            this.IsColllider = true;
            this.TempNode = otherCollider.node;
            const otherElement = this.collidingTemp.getComponent(LJS_TempElement);
            LSJ_WorkSpaceManager.Instance.tryCombine(this.node, otherElement.node);
            // LSJ_WorkSpaceManager.Instance.createElement(this.node, otherElement.node);
            if (LSJ_WorkSpaceManager.outputname != null) {
                this.scheduleOnce(() => { this.node.destroy(); })
            }
        }
    }

    onEndConstact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.TempNode === otherCollider.node) {
            this.IsColllider = false;
        }
    }



}


