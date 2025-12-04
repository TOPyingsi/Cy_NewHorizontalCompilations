import { _decorator, BoxCollider2D, Collider2D, Color, Component, Contact2DType, Enum, EventTouch, find, Graphics, IPhysics2DContact, Node, v2, v3, Vec2, Vec3 } from 'cc';
import { NBSYS_GameManager } from './NBSYS_GameManager';

const { ccclass, property } = _decorator;
export enum NBSYS_Touch_ObjectType {
    单击按下触发 = 0,
    物理拖拽式 = 1,
    方向拖拽抬起触发 = 2,

}
@ccclass('NBSYS_TouchMonitor')
export class NBSYS_TouchMonitor extends Component {
    @property
    ID: number = 0;
    @property({ type: Enum(NBSYS_Touch_ObjectType) })
    ObjectType: NBSYS_Touch_ObjectType = NBSYS_Touch_ObjectType.单击按下触发;
    @property(Node)
    TargetNode: Node = null;//目标对象
    public InitPoint: Vec3 = v3(0, 0, 0);
    public upliftDistance: number = 200;// 类型1和4的触发_拖拽距离位置的触发范围
    public DragDistance: number = 30;// 类型2的触发_方向拖拽距离
    public drawingOffset: Vec2 = v2(0, 0);// 画笔绘制偏移坐标
    public Offset: Vec2 = v2(0, 0);// 触发偏移
    //---------------------------------
    //拖动的时候会自动旋转
    public IsAngel: boolean = false;
    public AngelNumber: number = 30;
    //-----------------------------------------
    public boxcollider: Collider2D = null;
    public targets: Node[] = [];//碰撞节点数组
    public Lasttarget: Node = null;//最后碰到的一个物体

    //偏移位置
    PianYi: Vec3 = v3(0, 0);

    start() {
        switch (this.ObjectType) {
            case 0: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); }); break;
            case 1: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); });
                this.node.on(Node.EventType.TOUCH_MOVE, (even) => { this.OnTouchMove(even); });
                this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnTouchUp(even); });
                this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnTouchUp(even); });
                this.boxcollider = this.node.getComponent(Collider2D);
                this.boxcollider.on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
                    this.OnCollider(selfCollider, otherCollider, contact);
                });
                this.boxcollider.on(Contact2DType.END_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
                    this.OnColliderEnd(selfCollider, otherCollider, contact);
                });
                break;
            case 2: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); });
                this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnDirectionTouchUp(even); });
                this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnDirectionTouchUp(even); }); break;

        }

    }
    //进入碰撞
    OnCollider(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.targets.push(otherCollider.node);
        this.Lasttarget = otherCollider.node;
    }

    //离开碰撞
    OnColliderEnd(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let index = this.targets.indexOf(otherCollider.node);
        if (index != -1) {
            this.targets.splice(index, 1);
            if (this.targets.length == 0) {
                this.Lasttarget = null;
            }
        }
    }




    point: Vec2 = v2(0, 0);
    //触摸按下
    OnTouchDown(even) {
        NBSYS_GameManager.Instance.PlayAudio(1);
        this.point = even.getUILocation().clone();
        this.InitPoint = even.getUILocation().clone();
        this.PianYi = even.getUILocation().clone().subtract(this.node.worldPosition);

        if (this.IsAngel) {
            this.node.angle = this.node.angle + this.AngelNumber;
        }

    }
    //触摸拖拽
    OnTouchMove(even) {

        if (this.ObjectType == NBSYS_Touch_ObjectType.物理拖拽式) {
            let x = even.getUILocation().x;
            let y = even.getUILocation().y;
            this.node.setWorldPosition(v3(x, y, 0).subtract(v3(this.PianYi.x, this.PianYi.y, 0)));
        }



        this.TouchMoveCourse();
    }

    //事件接口,拖拽过程中
    TouchMoveCourse() {

    }
    //事件接口《按下抬起是同一个点
    TouchOnClick() {


    }
    //触摸抬起
    OnTouchUp(even: EventTouch) {

        if (this.point.x == even.getUILocation().x && this.point.y == even.getUILocation().y) {
            this.TouchOnClick();
        }
        if (this.IsAngel) {
            this.node.angle = this.node.angle - this.AngelNumber;
        }
        if (this.ObjectType == NBSYS_Touch_ObjectType.物理拖拽式) {

            let Distance = (even.getUILocation().add(this.Offset)).subtract(v2(this.TargetNode.getWorldPosition().x, this.TargetNode.getWorldPosition().y)).length();
            this.TouchMoveInCident();
        }


    }
    //事件接口，回到初始位置
    TouchHoming() {

    }
    //事件接口,抬起事件
    TouchMoveInCident() {

    }

    //条件判断（在开始做事之前执行）
    ConditionalJudgment(): boolean {
        return true;
    }

    //方向拖拽抬起
    OnDirectionTouchUp(even) {
        let Point: Vec2 = even.getUILocation();
        if (!this.InitPoint) return;
        if (Point.x > this.InitPoint.x + this.DragDistance) {//向右拖拽
            this.Drag_Right();
        }
        if (Point.x < this.InitPoint.x - this.DragDistance) {//向左拖拽
            this.Drag_Left();
        }
        if (Point.y > this.InitPoint.y + this.DragDistance) {//向上拖拽
            this.Drag_Up();
        }
        if (Point.y < this.InitPoint.y - this.DragDistance) {//向下拖拽
            this.Drag_Down();
        }
    }
    //事件接口
    Drag_Down() {

    }
    //事件接口
    Drag_Up() {

    }
    //事件接口
    Drag_Left() {

    }
    //事件接口
    Drag_Right() {

    }
    //归位（拖拽物体不通过抬起鼠标强制归位到初始位置）
    restoration() {
        this.node.worldPosition = this.InitPoint.clone();
    }
    //注销自身所有事件
    writeoff() {
        this.node.off(Node.EventType.TOUCH_START);
        this.node.off(Node.EventType.TOUCH_MOVE);
        this.node.off(Node.EventType.TOUCH_CANCEL);
        this.node.off(Node.EventType.TOUCH_END);
    }
}


