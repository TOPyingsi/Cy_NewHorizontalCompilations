import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, v2, v3, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_ATKBox')
export class HJMSJ_ATKBox extends Component {
    public Attack: number = 0;//伤害
    public Attacknode: Node = null;//攻击者节点

    private boxPos: Vec2[] = [];
    protected onEnable(): void {

    }

    start() {
        this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D) => {
            this.boxPos.push(boxcollider.offset.clone());
        })
        // this.node.active = false;
        this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D) => {
            boxcollider.on(Contact2DType.BEGIN_CONTACT, this.AttackHurt, this)
        })
    }

    //造成伤害
    AttackHurt(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let group = otherCollider.node;
        // console.log(group.name);

        if (otherCollider && group.name === "AIPlayer") {//是敌人

        }
    }
    Show() {

        if (this.node.parent?.children[0].eulerAngles.y === 0) {//如果是反向
            this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D, index) => {
                boxcollider.offset = v2(-this.boxPos[index].x, this.boxPos[index].y);
                boxcollider.apply();
            })
        } else if (this.node.parent?.children[0].eulerAngles.y === 180) {
            this.node.getComponents(Collider2D).forEach((boxcollider: Collider2D, index) => {
                boxcollider.offset = v2(this.boxPos[index].x, this.boxPos[index].y);
                boxcollider.apply();

            })
        }

        // this.node.active = true;
        // this.scheduleOnce(() => {
        //     this.node.active = false;
        // })

    }
}


