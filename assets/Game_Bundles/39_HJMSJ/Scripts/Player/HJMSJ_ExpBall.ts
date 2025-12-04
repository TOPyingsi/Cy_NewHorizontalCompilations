import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { HJMSJ_Player } from './HJMSJ_Player';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_ExpBall')
export class HJMSJ_ExpBall extends Component {

    @property
    public expNum: number = 5;

    public moveSpeed: number = 15;

    private colider: Collider2D = null;
    private playNode: Node = null;
    start() {
        this.colider = this.getComponent(Collider2D);
        this.colider.on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
    }

    timer: number = 0;
    interval: number = 0.5;
    update(deltaTime: number) {
        if (this.playNode) {
            this.timer += deltaTime;
            if (this.timer >= this.interval) {
                let distance = this.node.worldPosition.clone().subtract(this.playNode.worldPosition.clone());
                let dir = distance.clone().normalize().negative();
                let offset = this.node.worldPosition.add(dir.multiplyScalar(this.moveSpeed));

                if (distance.length() <= 10) {
                    this.onMoveEnd();
                }

                this.node.worldPosition = offset;
            }

        }
    }

    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name === "Player") {
            console.log("Hit");
            this.playNode = otherCollider.node;
            this.colider.off(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
        }
    }

    onMoveEnd() {
        let playerTs = this.playNode.getComponent(HJMSJ_Player);
        playerTs.onGetExp(this.expNum);
        this.playNode = null;

        this.node.active = false;

        this.scheduleOnce(() => {
            this.node.destroy();
        }, 0.5);
    }
}


