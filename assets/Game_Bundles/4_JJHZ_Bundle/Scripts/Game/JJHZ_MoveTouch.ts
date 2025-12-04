import { _decorator, BoxCollider2D, Collider, Collider2D, Component, Contact2DType, director, EventTouch, ICollisionEvent, IPhysics2DContact, Layers, Node, v2, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_MoveTouch')
export class JJHZ_MoveTouch extends Component {
    public IsOnUp: boolean = false;//选中后是否显示在最顶层
    public IsOnTouch: boolean = false;//是否正在被选中
    private _layert: number = 0;
    public Target: Node = null;//碰撞的物体
    private _target: Node[] = [];
    public StarPosition: Vec3 = v3(0, 0);
    start() {
        this._layert = this.node.layer;
        this.StarPosition = this.node.position.clone();
        this.node.on(Node.EventType.TOUCH_START, this.OnTouchStar, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
        this.node.getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            this.onCollisionEnter(selfCollider, otherCollider, contact);
        })
        this.node.getComponent(BoxCollider2D).on(Contact2DType.END_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            this.onCollisionExit(selfCollider, otherCollider, contact);
        })

    }
    //碰撞
    private onCollisionEnter(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact) {
        this.Target = otherCollider.node;
        this._target.push(this.Target);
    }
    //离开碰撞
    private onCollisionExit(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact) {
        this._target.splice(this._target.indexOf(otherCollider.node), 1);
        if (this._target.length == 0) {
            this.Target = null;
        } else {
            this.Target = this._target[this._target.length - 1];
        }

    }
    //设置初始位置
    SetStarPosition(position: Vec3) {
        this.StarPosition = position.clone();
        this.node.position = this.StarPosition.clone();
    }
    //按键按下
    OnTouchStar(TouchData: EventTouch) {
        this.IsOnTouch = true;
        if (this.IsOnUp) {
            // this.node.layer = 1 << 1;
            this.node.walk((target: Node) => {
                target.layer = 1 << 1;
            }, () => {

            })
        }
    }
    //按键移动
    OnTouchMove(TouchData: EventTouch) {
        this.node.setWorldPosition(TouchData.getUILocation().x, TouchData.getUILocation().y, 0);

    }
    //按键抬起
    OnTouchEnd(TouchData: EventTouch) {
        this.IsOnTouch = false;
        if (this.IsOnUp) {
            // this.node.layer = this._layert;
            this.node.walk((target: Node) => {
                target.layer = this._layert;
            }, () => {

            })
        }

        this.TouchEndEvent();
        this.node.position = this.StarPosition.clone();

    }
    //抬起事件
    TouchEndEvent() {

    }
}


