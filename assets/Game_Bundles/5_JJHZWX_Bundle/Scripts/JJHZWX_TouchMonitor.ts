import { _decorator, Color, Component, Enum, EventTouch, find, Graphics, Node, v2, v3, Vec2, Vec3 } from 'cc';
import { JJHZWX_Tool } from './JJHZWX_Tool';
import JJHZWX_ClearMask from './JJHZWX_ClearMask';
const { ccclass, property } = _decorator;
export enum JJHZ_Touch_ObjectType {
    单击按下触发 = 0,
    拖拽到某位置放开触发 = 1,
    方向拖拽抬起触发 = 2,
    画笔绘制 = 3,
    拖拽过程中多点触发 = 4,
    拖拽放开多点触发 = 5,
    纯色画笔 = 6,
}
@ccclass('JJHZWX_TouchMonitor')
export class JJHZWX_TouchMonitor extends Component {
    @property
    ID: number = 0;
    @property({ type: Enum(JJHZ_Touch_ObjectType) })
    ObjectType: JJHZ_Touch_ObjectType = JJHZ_Touch_ObjectType.单击按下触发;
    @property(Node)
    TargetNode: Node = null;//目标对象
    @property({ type: [Node] })
    BrushtNode: Array<Node> = [];//绘画对象
    @property({ type: [Node] })
    multipointTargetNode: Array<Node> = [];//多点触发对象
    public InitPoint: Vec3 = null;
    public upliftDistance: number = 80;// 类型1和4的触发_拖拽距离位置的触发范围
    public DragDistance: number = 30;// 类型2的触发_方向拖拽距离
    public drawingOffset: Vec2 = v2(0, 0);// 画笔绘制偏移坐标
    public Offset: Vec2 = v2(0, 0);// 触发偏移
    public Brushwidth: number = 20;// 画笔默认宽度
    public multipointTargetdestruction: boolean = false;//多点触发触发后是否会自动销毁(不销毁物体，仅从数组中剔除)
    //-----------拖拽特殊模式(生成子物体替代本体进行拖拽，本体不动,子物体必须叫targetnode)--
    public specialquestion: boolean = false;//开关
    private targetnode: Node = null;
    //-------------------

    //----------------------------------------------
    //---------纯色画笔--------------
    private LastPoint: Vec2 = null;//上一次的坐标
    public brushColor: Color = Color.BLACK;//画笔颜色
    public IsWorldPos: boolean = false;//是否为世界坐标绘画
    //------------------------------

    //---------------------------------
    //拖动的时候会自动旋转
    public IsAngel: boolean = false;
    public AngelNumber: number = 30;
    //-----------------------------------------

    start() {
        switch (this.ObjectType) {
            case 0: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); }); break;
            case 1: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); });
                this.node.on(Node.EventType.TOUCH_MOVE, (even) => { this.OnTouchMove(even); });
                this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnTouchUp(even); });
                this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnTouchUp(even); }); break;
            case 2: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); });
                this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnDirectionTouchUp(even); });
                this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnDirectionTouchUp(even); }); break;
            case 3: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); });
                this.node.on(Node.EventType.TOUCH_MOVE, (even) => { this.OnTouchMove(even); });
                this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnTouchUp(even); });
                this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnTouchUp(even); }); break;
            case 4: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); });
                this.node.on(Node.EventType.TOUCH_MOVE, (even) => { this.OnTouchMove(even); });
                this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnTouchUp(even); });
                this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnTouchUp(even); }); break;
            case 5: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); });
                this.node.on(Node.EventType.TOUCH_MOVE, (even) => { this.OnTouchMove(even); });
                this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnTouchUp(even); });
                this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnTouchUp(even); }); break;
            case 6: this.node.on(Node.EventType.TOUCH_START, (even) => { this.OnTouchDown(even); });
                this.node.on(Node.EventType.TOUCH_MOVE, (even) => { this.OnTouchMove(even); });
                this.node.on(Node.EventType.TOUCH_END, (even) => { this.OnTouchUp(even); });
                this.node.on(Node.EventType.TOUCH_CANCEL, (even) => { this.OnTouchUp(even); }); break;
        }
        if (this.specialquestion) {//特殊拖拽
            this.targetnode = this.node.getChildByName("targetnode");
        }
    }
    //触摸按下
    OnTouchDown(even) {
        if (this.IsAngel) {
            this.node.angle = this.node.angle + this.AngelNumber;
        }
        if (this.ObjectType == 2) {//方向拖拽
            if (this.InitPoint == null) {
                this.InitPoint = even.getUILocation();
            }
        }
    }
    //触摸拖拽
    OnTouchMove(even) {
        if (this.InitPoint == null) {
            this.InitPoint = this.node.position.clone();
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.拖拽到某位置放开触发) {
            let x = even.getUILocation().x;
            let y = even.getUILocation().y;
            if (this.specialquestion) {//特殊拖拽
                this.targetnode.active = true;
                this.targetnode.setWorldPosition(v3(x, y));
            } else {
                this.node.setWorldPosition(v3(x, y));
            }
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.画笔绘制) {
            let x = even.getUILocation().x;
            let y = even.getUILocation().y;
            if (this.specialquestion) {//特殊拖拽
                this.targetnode.active = true;
                this.targetnode.setWorldPosition(v3(x, y));
            } else {
                this.node.setWorldPosition(v3(x, y));
            }
            if (!this.ConditionalJudgment()) return;
            let Plan: number = 0;
            for (let i = 0; i < this.BrushtNode.length; i++) {
                this.BrushtNode[i].getComponent(JJHZWX_ClearMask).LineWidth = this.Brushwidth;
                this.BrushtNode[i].getComponent(JJHZWX_ClearMask).touchMoveEvent(even, this.drawingOffset.x, this.drawingOffset.y);
                Plan += this.BrushtNode[i].getComponent(JJHZWX_ClearMask).ClearRate / this.BrushtNode.length;
            }
            this.DrawingSchedule(Plan);
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.拖拽过程中多点触发) {
            let x = even.getUILocation().x;
            let y = even.getUILocation().y;
            this.node.setWorldPosition(v3(x, y));
            if (!this.ConditionalJudgment()) return;
            for (let i = 0; i < this.multipointTargetNode.length; i++) {
                let Distance = (even.getUILocation().add(this.Offset)).sub(this.multipointTargetNode[i].getWorldPosition().clone()).mag();
                if (Distance < this.upliftDistance) {
                    this.multipointTargetNodeSchedule(this.multipointTargetNode[i]);
                    if (this.multipointTargetdestruction) {
                        this.multipointTargetNode.splice(i, 1);
                    }
                    break;
                }
            }
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.拖拽放开多点触发) {
            let x = even.getUILocation().x;
            let y = even.getUILocation().y;
            if (this.specialquestion) {//特殊拖拽
                this.targetnode.active = true;
                this.targetnode.setWorldPosition(v3(x, y));
            } else {
                this.node.setWorldPosition(v3(x, y));
            }
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.纯色画笔) {
            if (this.LastPoint == null) {
                this.LastPoint = even.getUILocation();
            }
            let x = even.getUILocation().x;
            let y = even.getUILocation().y;
            this.node.setWorldPosition(v3(x, y));
            if (!this.ConditionalJudgment()) return;
            if (this.IsWorldPos == false) {
                for (let i = 0; i < this.BrushtNode.length; i++) {
                    this.BrushtNode[i].getComponent(Graphics).strokeColor = this.brushColor;
                    this.BrushtNode[i].getComponent(Graphics).lineWidth = this.Brushwidth;
                    this.BrushtNode[i].getComponent(Graphics).moveTo(this.LastPoint.x + this.drawingOffset.x, this.LastPoint.y + this.drawingOffset.y);
                    this.BrushtNode[i].getComponent(Graphics).lineTo(even.getUILocation().x + this.drawingOffset.x, even.getUILocation().y + this.drawingOffset.y);
                    this.BrushtNode[i].getComponent(Graphics).stroke();
                }
            } else {
                for (let i = 0; i < this.BrushtNode.length; i++) {
                    let pos = this.BrushtNode[i].getWorldPosition().clone();
                    this.BrushtNode[i].getComponent(Graphics).strokeColor = this.brushColor;
                    this.BrushtNode[i].getComponent(Graphics).lineWidth = this.Brushwidth;
                    this.BrushtNode[i].getComponent(Graphics).moveTo(this.LastPoint.x + this.drawingOffset.x - pos.x, this.LastPoint.y + this.drawingOffset.y - pos.y);
                    this.BrushtNode[i].getComponent(Graphics).lineTo(even.getUILocation().x + this.drawingOffset.x - pos.x, even.getUILocation().y + this.drawingOffset.y - pos.y);
                    this.BrushtNode[i].getComponent(Graphics).stroke();
                }
            }
            this.LastPoint = even.getUILocation();
        }
        this.TouchMoveCourse();
    }
    //绘画接口
    DrawingSchedule(_Schedule: number) {

    }
    //绘画抬起事件
    DrawingSchedule_Up(_Schedule: number) {

    }
    //多点触发接口
    multipointTargetNodeSchedule(node: Node) {

    }
    //事件接口,拖拽过程中
    TouchMoveCourse() {

    }
    //触摸抬起
    OnTouchUp(even: EventTouch) {
        if (this.IsAngel) {
            this.node.angle = this.node.angle - this.AngelNumber;
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.拖拽到某位置放开触发) {
            if (this.specialquestion) {//特殊拖拽
                this.targetnode.active = false;
            }
            if (!this.ConditionalJudgment()) {
                this.node.position = this.InitPoint;
                return;
            };
            let Distance = (even.getUILocation().add(this.Offset)).subtract(v2(this.TargetNode.getWorldPosition().x, this.TargetNode.getWorldPosition().y)).length();
            if (Distance > this.upliftDistance) {
                if (this.InitPoint) this.node.position = this.InitPoint.clone();
                this.TouchHoming();
            } else {
                this.TouchMoveInCident();
            }
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.画笔绘制) {
            if (this.specialquestion) {//特殊拖拽
                this.targetnode.active = false;
            }
            if (!this.ConditionalJudgment()) {
                this.node.position = this.InitPoint;
                return;
            };
            if (this.InitPoint) this.node.position = this.InitPoint;
            this.TouchHoming();
            this.TouchMoveInCident();
            let Plan: number = 0;
            for (let i = 0; i < this.BrushtNode.length; i++) {
                this.BrushtNode[i].getComponent(JJHZWX_ClearMask).LineWidth = this.Brushwidth;
                this.BrushtNode[i].getComponent(JJHZWX_ClearMask).touchMoveEvent(v3(even.getUILocation().x, even.getUILocation().y), this.drawingOffset.x, this.drawingOffset.y);
                Plan += this.BrushtNode[i].getComponent(JJHZWX_ClearMask).ClearRate / this.BrushtNode.length;
            }
            this.DrawingSchedule_Up(Plan);
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.拖拽过程中多点触发) {
            if (this.InitPoint) this.node.position = this.InitPoint;
            this.TouchHoming();
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.拖拽放开多点触发) {
            if (this.specialquestion) {//特殊拖拽
                this.targetnode.active = false;
            }
            if (!this.ConditionalJudgment()) {
                this.node.position = this.InitPoint;
                return;
            };
            this.node.position = this.InitPoint;
            for (let i = 0; i < this.multipointTargetNode.length; i++) {
                let Distance = (even.getUILocation().add(this.Offset)).subtract(v2(this.multipointTargetNode[i].getWorldPosition().x, this.multipointTargetNode[i].getWorldPosition().y)).length();
                if (Distance < this.upliftDistance) {
                    this.multipointTargetNodeSchedule(this.multipointTargetNode[i]);
                    if (this.multipointTargetdestruction) {
                        this.multipointTargetNode.splice(i, 1);
                    }
                    break;
                }
            }
        }
        if (this.ObjectType == JJHZ_Touch_ObjectType.纯色画笔) {
            if (!this.ConditionalJudgment()) {
                this.node.position = this.InitPoint;
                return;
            };
            if (this.InitPoint) this.node.position = this.InitPoint;
            this.LastPoint = null;
            this.TouchHoming();
            this.TouchMoveInCident();
        }
    }
    //事件接口，回到初始位置
    TouchHoming() {

    }
    //事件接口,拖拽到某位置放开触发_触发事件
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
        this.node.position = this.InitPoint;
    }
    //注销自身所有事件
    writeoff() {
        this.node.off(Node.EventType.TOUCH_START);
        this.node.off(Node.EventType.TOUCH_MOVE);
        this.node.off(Node.EventType.TOUCH_CANCEL);
        this.node.off(Node.EventType.TOUCH_END);
    }
}


