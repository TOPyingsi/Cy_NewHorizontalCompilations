import { _decorator, Animation, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, PhysicsGroup, RigidBody2D, tween, v2, v3, Vec2 } from 'cc';
import { WGYQ_ActionPanel } from './WGYQ_ActionPanel';
import { WGYQ_LockDog } from './WGYQ_LockDog';
import { WGYQ_YardUI } from './WGYQ_YardUI';
import { WGYQ_GameData } from './WGYQ_GameData';
import { WGYQ_BowDog } from './WGYQ_BowDog';
import { WGYQ_Dog } from './WGYQ_Dog';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_Player')
export class WGYQ_Player extends Component {

    private static instance: WGYQ_Player;
    public static get Instance(): WGYQ_Player {
        return this.instance;
    }

    @property
    speed: number = 0;

    rig: RigidBody2D;
    ani: Animation;
    collider: Collider2D;
    state = "Idle";

    carType = -1;

    protected onLoad(): void {
        WGYQ_Player.instance = this;
        this.rig = this.getComponent(RigidBody2D);
        this.ani = this.getComponent(Animation);
        this.collider = this.getComponent(Collider2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    InitCar() {
        this.carType = WGYQ_GameData.Instance.getNumberData("CurrentCar");
        let str = "player" + (this.carType == -1 ? "idle" : this.carType == 0 ? "elec" : this.carType == 1 ? "car" : "suv");
        this.ani.play(str);
    }

    start() {
        this.InitCar();
    }

    update(deltaTime: number) {
        this.Move();
    }

    Move() {
        let pos = WGYQ_ActionPanel.Instance.joystick.children[0].getPosition();
        let dir = v2(pos.x, pos.y).normalize();
        if (Vec2.equals(dir, Vec2.ZERO) && this.state != "Idle") {
            this.state = "Idle";
            if (this.carType == -1) this.ani.play("playeridle");
        }
        else if (!Vec2.equals(dir, Vec2.ZERO) && this.state != "Move") {
            this.state = "Move";
            if (this.carType == -1) this.ani.play("playermove");
        }
        this.node.setScale(v3(dir.x > 0 ? 1 : -1, 1));
        this.rig.linearVelocity = dir.multiplyScalar(this.speed);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        console.log('onBeginContact');
        if (this.node.scene.name == "WGYQ_Home") {
            if (otherCollider.sensor && otherCollider.group == PhysicsGroup.DEFAULT) {
                otherCollider.node.children[0].active = true;
            }
        }
        else {
            if (otherCollider.sensor && otherCollider.group == PhysicsGroup.DEFAULT) {
                let lock = otherCollider.getComponent(WGYQ_LockDog);
                if (lock) {
                    if (lock.isAtk) {
                        lock.isAtk = false;
                        WGYQ_ActionPanel.Instance.Stop();
                        WGYQ_GameData.Instance.setNumberData("Hp", 99);
                        WGYQ_YardUI.Instance.Init();
                        this.node.children[0].active = true;
                        this.scheduleOnce(() => {
                            this.node.children[0].active = false;
                        }, 0.1);
                        tween(this.node)
                            .by(0.25, { position: v3(-200, 0) })
                            .call(() => {
                                WGYQ_YardUI.Instance.Talk();
                            })
                            .start();
                    }
                    else {
                        WGYQ_ActionPanel.Instance.Target = otherCollider.node;
                    }
                }
                let bow = otherCollider.getComponent(WGYQ_BowDog);
                if (bow) {
                    WGYQ_ActionPanel.Instance.Target = otherCollider.node;
                }
                let dog = otherCollider.getComponent(WGYQ_Dog);
                if (dog) {
                    WGYQ_ActionPanel.Instance.Target = otherCollider.node;
                }
            }
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        console.log('onEndContact');
        if (this.node.scene.name == "WGYQ_Home") {
            if (otherCollider.sensor && otherCollider.group == PhysicsGroup.DEFAULT) {
                otherCollider.node.children[0].active = false;
            }
        }
        else {
            if (otherCollider.sensor && otherCollider.group == PhysicsGroup.DEFAULT) {
                WGYQ_ActionPanel.Instance.Target = null;
            }
        }
    }

}


