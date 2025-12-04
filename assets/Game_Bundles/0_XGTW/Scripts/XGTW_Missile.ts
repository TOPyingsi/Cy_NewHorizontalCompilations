import { _decorator, Component, RigidBody2D, Node, Vec2, RigidBody, v2, v3, director, misc, Vec3, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact, find } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_Constant } from './Framework/Const/XGTW_Constant';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

@ccclass('XGTW_Missile')
export default class XGTW_Missile extends Component {
    rigidbody: RigidBody2D | null = null;
    target: Node | null = null;

    onLoad() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
    }

    Init(target: Node) {
        this.rigidbody.linearVelocity = Vec2.ZERO;
        this.target = target;
        let speed = v3(this.node.right.clone().multiplyScalar(3000));
        this.rigidbody.applyForceToCenter(v2(speed.x, speed.y), true);
        this.node.getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTW_Constant.Group.Obstacle) {
            const worldManifold = contact.getWorldManifold();

            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/MissileExplosion", find("Canvas")).then(node => {
                node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
            });
            this.scheduleOnce(() => {
                PoolManager.PutNode(this.node);
            })
        }
    }

    update(dt) {
        if (this.target) {
            if (Vec2.distance(this.node.getWorldPosition(), this.target.getWorldPosition()) > 3500) {
                this.rigidbody.linearVelocity = Vec2.ZERO;
                PoolManager.PutNode(this.node);
            }
        } else {
            this.rigidbody.linearVelocity = Vec2.ZERO;
            PoolManager.PutNode(this.node);
        }
    }
}