import { _decorator, CircleCollider2D, Collider2D, Component, Contact2DType, director, game, ICollisionEvent, IPhysics2DContact, Node, PhysicsSystem2D, RigidBody2D, v2 } from 'cc';
import { JJHZWX_GameManager } from './JJHZWX_GameManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZWX_LabyrinthPlayer')
export class JJHZWX_LabyrinthPlayer extends Component {
    @property(RigidBody2D)
    RG: RigidBody2D = null;
    @property(CircleCollider2D)
    Collider: CircleCollider2D = null;
    start() {
        this.Collider.on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            this.onCollisionEnter(selfCollider, otherCollider, contact);
        });

    }
    move(x: number, y: number, radius: number) {
        // console.log(`X:${x},y:${y},radius:${radius}`);
        this.RG.linearVelocity = v2(x, y).multiplyScalar(radius * 10);
    }
    Stop() {
        this.RG.linearVelocity = v2(0, 0)

    }


    private onCollisionEnter(selfCollider: Collider2D, otherCollider: Collider2D, event: IPhysics2DContact) {
        switch (otherCollider.node.name) {
            case "敌人":
                this.scheduleOnce(() => {
                    JJHZWX_GameManager.Instance.GameOver(false);
                    this.node.parent.parent.destroy();
                })
                break;
            case "道具":
                this.scheduleOnce(() => {
                    JJHZWX_GameManager.Instance.AnimationPlay(JJHZWX_GameManager.Instance.sceneIndex);
                    this.node.parent.parent.destroy();
                })
                break;
        }
    }
}


