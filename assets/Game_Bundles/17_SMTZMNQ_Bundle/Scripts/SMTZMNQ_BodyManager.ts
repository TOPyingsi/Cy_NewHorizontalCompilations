import { _decorator, Collider, PolygonCollider2D, Collider2D, Component, EventTouch, Node, UITransform, Vec2, Vec3, RigidBody2D, v3, Contact2DType, IPhysics2DContact, PhysicsSystem2D, EPhysics2DDrawFlags, Label, UIOpacity, Tween, tween, math } from 'cc';
import { SMTZMNQ_EventManager, SMTZMNQ_MyEvent } from './SMTZMNQ_EventManager';
import { SMTZMNQ_Body } from './SMTZMNQ_Body';
import LoadingPanel from '../../../Scripts/UI/Panel/LoadingPanel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_BodyManager')
export class SMTZMNQ_BodyManager extends Component {

    public static Instance: SMTZMNQ_BodyManager = null;

    @property(PolygonCollider2D)
    Colliders: PolygonCollider2D[] = [];

    @property(Collider2D)
    ClickCollider: Collider2D = null;

    @property(Label)
    NameLabel: Label = null;

    @property(UIOpacity)
    NameUIOpacity: UIOpacity = null;

    @property(Node)
    Panels: Node[] = [];

    @property(Node)
    MainPanel: Node = null;

    @property(Node)
    XZ: Node = null;

    @property(Node)
    F: Node = null;

    TargetCollider: Collider2D = null;
    IsClick: boolean = false;
    ClickColliderPos: Vec3 = new Vec3();

    protected onLoad(): void {
        PhysicsSystem2D.instance.enable = true;
        SMTZMNQ_BodyManager.Instance = this;
        this.ClickColliderPos = this.ClickCollider.node.getWorldPosition().clone();
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.IsClick = true;

        if (this.ClickCollider) {
            this.ClickCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    protected start(): void {
        this.heartbeat();
        this.breathe()
    }

    onTouchEnd(event: EventTouch) {
        const touchPos = event.getUILocation();
        this.IsClick = true;
        this.ClickCollider.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));

        this.scheduleOnce(() => {
            if (!this.IsClick) {
                this.showPanel();
            }
        },)
    }


    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.TargetCollider == otherCollider || !this.IsClick) return;
        this.TargetCollider = otherCollider;
        this.IsClick = false;
        // console.error(this.Colliders.findIndex(collider => collider == otherCollider));
        SMTZMNQ_EventManager.Scene.emit(SMTZMNQ_MyEvent.SMTZMNQ_HIDEBODY);
        this.TargetCollider.node.getComponent(SMTZMNQ_Body).Show();
        this.showName(this.TargetCollider.node.name);
    }

    showName(name: string, delay: number = 1) {
        Tween.stopAllByTarget(this.NameUIOpacity);
        this.NameUIOpacity.opacity = 255;
        this.NameLabel.string = name;
        tween(this.NameUIOpacity)
            .delay(delay)
            .to(1, { opacity: 0 }, { easing: `sineOut` })
            .start();
    }

    showPanel() {
        this.Panels.filter(panel => panel.active = false);
        this.MainPanel.active = false;
        const index = this.Colliders.findIndex(collider => collider == this.TargetCollider);
        if (index != -1) this.Panels[index].active = true;
    }

    hidePanel() {
        this.unschedule(this.ClickBlank);
        this.scheduleOnce(this.ClickBlank, 5);
    }

    ClickBlank() {
        SMTZMNQ_EventManager.Scene.emit(SMTZMNQ_MyEvent.SMTZMNQ_HIDEBODY);
        this.Panels.filter(panel => panel.active = false);
        this.MainPanel.active = true;
        this.TargetCollider = null;
        this.scheduleOnce(() => { this.ClickCollider.node.setWorldPosition(this.ClickColliderPos); });
    }

    QCBody(name: string) {
        const index = this.Colliders.findIndex(e => e.node.name === name);
        if (index != -1) {
            if (this.TargetCollider == this.Colliders[index]) {
                this.ClickBlank();
            }
            this.showName(`${name}切除成功`);
            this.Colliders[index].node.destroy();
            this.Panels[index].destroy();
            this.Colliders.splice(index, 1)
            this.Panels.splice(index, 1)
        }
    }

    heartbeat() {
        let delay: number = Math.random();
        delay = math.clamp(delay, 0.5, 1);
        tween(this.XZ)
            .delay(delay)
            .to(0.4, { scale: v3(1.1, 1.1, 1) }, { easing: `sineOut` })
            .to(0.8, { scale: v3(0.9, 0.9, 1) }, { easing: `sineOut` })
            .to(0.4, { scale: v3(1, 1, 1) }, { easing: `sineOut` })
            .call(() => {
                this.heartbeat();
            })
            .start();
    }

    breathe() {
        let delay: number = Math.random();
        delay = math.clamp(delay, 1, 2);
        tween(this.F)
            .delay(delay)
            .to(1, { scale: v3(1.1, 1.1, 1) }, { easing: `sineOut` })
            .to(2, { scale: v3(0.9, 0.9, 1) }, { easing: `sineOut` })
            .to(1, { scale: v3(1, 1, 1) }, { easing: `sineOut` })
            .call(() => {
                this.breathe();
            })
            .start();
    }

}


