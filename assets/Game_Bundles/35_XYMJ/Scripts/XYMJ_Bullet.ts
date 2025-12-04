import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, v3, Vec3, Vec4 } from 'cc';
import { XYMJ_AIPlayer } from './XYMJ_AIPlayer';
import { XYMJ_Player } from './XYMJ_Player';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_Bullet')
export class XYMJ_Bullet extends Component {

    public playerNode: Node = null;

    public Dir: Vec3 = null;
    public owner: string = "";
    public rotate: Vec3 = null;
    public startForward: Vec3 = null;

    colider: Collider2D = null;

    ATK: number = 0;

    speed: number = 15;
    isCreate: boolean = false;
    isDestory: boolean = false;
    start() {
        this.isCreate = true;

        this.scheduleOnce(() => {
            if (this.node?.isValid) {
                this.node.destroy();
            }
        }, 5);

        this.colider = this.getComponent(Collider2D);
        this.colider.on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this)
    }

    update(deltaTime: number) {
        if (!this.node) {
            return;
        }

        if (this.isCreate && !this.isDestory) {

            this.node.eulerAngles = v3(0, 180, this.rotate.clone().z + 180);

            let offset = v3(this.Dir.x * this.speed * deltaTime, this.Dir.y * this.speed * deltaTime);
            this.node.position = this.node.position.add(offset);

            // this.node.eulerAngles = this.rotate;
            // let dir = this.speed * deltaTime;
            // this.node.position = this.node.position.clone().add(v3(dir, 0, 0));
            // this.node.worldPosition = this.node.worldPosition.clone().add(v3(dir, 0, 0));
            // this.node.worldPosition.add(this.startForward.clone().normalize().negative().add(v3(dir, 0, 0)));
            // this.node.forward = this.startForward;
        }
    }

    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let group = otherCollider.node;
        if (!this.isDestory) {
            if (group.name === "Player" && group.name !== this.owner) {
                let playerTs = group.getComponent(XYMJ_Player);
                playerTs.onAttack(this.ATK);
                this.onHit();
            }
            if (group.name === "AIPlayer" /*&& group.name !== this.owner*/) {
                let AITs = group.getComponent(XYMJ_AIPlayer);
                if (AITs.isDie) {
                    return;
                }
                AITs.onAttack(this.ATK);
                this.onHit();
            }

            if (group.name.startsWith("box") || group.parent.name === "Lock") {
                this.onHit();
            }
        }

    }

    onHit() {
        this.isDestory = true;
        this.colider.off(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
        this.colider.enabled = false;
        this.colider.getComponent(RigidBody2D).enabled = false;

        this.node.destroy();
    }
}



