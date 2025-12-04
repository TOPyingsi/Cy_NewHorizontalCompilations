import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, v2, v3, Vec2 } from 'cc';
import { XSHY_Unit } from './XSHY_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHY_AttackBox')
export class XSHY_AttackBox extends Component {
    public Attack: number = 0;//伤害
    public Attacknode: Node = null;//攻击者节点

    private Pos: Vec2 = v2(0, 0);
    private boxPos: Vec2[] = [];
    protected onEnable(): void {

    }

    start() {
        this.Pos = v2(this.node.position.x, this.node.position.y);
        this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D) => {
            this.boxPos.push(boxcollider.offset.clone());
        })
        this.node.active = false;
        this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D) => {
            boxcollider.on(Contact2DType.BEGIN_CONTACT, this.AttackHurt, this)
        })
    }

    //造成伤害
    AttackHurt(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider && otherCollider.node != this.Attacknode) {//是敌人
            otherCollider.node.getComponent(XSHY_Unit).Hurt(this.Attack)
        }
    }
    Show() {
        this.node.position = v3(this.Pos.x, this.Pos.y, 0)
        if (this.node.parent?.scale.x == -1) {//如果是反向
            this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D, index) => {
                boxcollider.offset = v2(-this.boxPos[index].x, this.boxPos[index].y);
            })
        } else {
            this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D, index) => {
                boxcollider.offset = v2(this.boxPos[index].x, this.boxPos[index].y);
            })
        }
        this.node.active = true;
        this.scheduleOnce(() => {
            this.node.active = false;
        })

    }
}


