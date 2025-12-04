import { _decorator, Component, EventTouch, Label, math, Node, tween, v3, Vec2, Vec3 } from 'cc';
import { SMTZMNQ_BodyManager } from './SMTZMNQ_BodyManager';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_YWPanel')
export class SMTZMNQ_YWPanel extends Component {
    public static Instance: SMTZMNQ_YWPanel = null;

    @property(Node)
    ZSPanel: Node = null;

    @property(Label)
    NameLabel: Label = null;

    @property(Node)
    IconNode: Node = null;

    @property(Node)
    Icon: Node = null;

    @property(Node)
    EatNode: Node = null;

    @property
    Clamp: Vec2 = new Vec2();

    IconPos: Vec3 = new Vec3();
    Name: string = "";
    Way: string = "";

    EatPos: Vec3 = new Vec3();

    protected onLoad(): void {
        SMTZMNQ_YWPanel.Instance = this;
        this.IconNode.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.IconNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.IconPos = this.Icon.getWorldPosition().clone();
        this.EatPos = this.EatNode.getPosition().clone();
    }

    showPanel(name: string, way) {
        this.Name = name;
        this.Way = way;
        this.NameLabel.string = name;
        this.ZSPanel.active = true;
    }

    onTouchMove(event: EventTouch) {
        const Y = math.clamp(event.getUILocation().y, this.Clamp.x, this.Clamp.y);
        this.Icon.setWorldPosition(v3(this.IconPos.x, Y, this.IconPos.z))
    }

    ColsePanel() {
        this.ZSPanel.active = false;
        if (this.Name !== "") SMTZMNQ_BodyManager.Instance.showName(`${this.Way}${this.Name}`);
        this.Name = "";
    }

    Eat() {
        this.EatNode.setPosition(this.EatPos);
        this.EatNode.active = true;

        tween(this.EatNode)
            .by(1, { position: v3(0, -123, 0) }, { easing: `sineOut` })
            .start();

        tween(this.EatNode)
            .to(1, { scale: v3(0.8, 0.8, 0.8) }, { easing: `sineOut` })
            .call(() => {
                this.EatNode.active = false;
            })
            .start();

    }

}


