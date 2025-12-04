import { _decorator, Component, RigidBody2D, Node, Vec2, RigidBody, v2, v3, director, misc, Vec3, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact, find } from 'cc';
import { XGTS_PoolManager } from './XGTS_PoolManager';
import { XGTS_Constant } from './XGTS_Constant';
import { XGTS_LvManager } from './XGTS_LvManager';
import { XGTS_Audio, XGTS_AudioManager } from './XGTS_AudioManager';
import XGTS_CharacterController from './XGTS_CharacterController';
const { ccclass, property } = _decorator;

@ccclass('XGTS_Missile')
export default class XGTS_Missile extends Component {
    rigidbody: RigidBody2D | null = null;
    target: XGTS_CharacterController | null = null;

    onLoad() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
    }

    Init(target: XGTS_CharacterController) {
        this.rigidbody.linearVelocity = Vec2.ZERO;
        this.target = target;
        let speed = v3(this.node.right.clone().multiplyScalar(3000));
        this.rigidbody.applyForceToCenter(v2(speed.x, speed.y), true);
        this.node.getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTS_Constant.Group.Obstacle) {
            const worldManifold = contact.getWorldManifold();
            XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.MissileExplosion);

            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.MissileExplosion, XGTS_LvManager.Instance.Game);
            node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));

            this.scheduleOnce(() => {
                XGTS_PoolManager.Instance.Put(this.node);
            })
        }
    }

    update(dt) {
        if (this.target && this.target.node) {
            if (!this.target.isDie || Vec2.distance(this.node.getWorldPosition(), this.target.node.getWorldPosition()) > 3500) {
                this.rigidbody.linearVelocity = Vec2.ZERO;
                XGTS_PoolManager.Instance.Put(this.node);
            }
        } else {
            this.rigidbody.linearVelocity = Vec2.ZERO;
            XGTS_PoolManager.Instance.Put(this.node);
        }
    }
}