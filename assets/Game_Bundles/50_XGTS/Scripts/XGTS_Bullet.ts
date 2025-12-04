import { _decorator, Component, RigidBody2D, Node, Vec2, RigidBody, v2, v3, director, misc, Vec3, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact, find } from 'cc';
const { ccclass, property } = _decorator;

import { XGTS_PlayerData } from './XGTS_PlayerData';
import { XGTS_ItemData } from './XGTS_Data';
import { XGTS_Constant } from './XGTS_Constant';
import { XGTS_PoolManager } from './XGTS_PoolManager';
import XGTS_CharacterController from './XGTS_CharacterController';

@ccclass('XGTS_Bullet')
export default class XGTS_Bullet extends Component {
    rigidbody: RigidBody2D | null = null;
    target: XGTS_CharacterController | null = null;
    weapon: XGTS_ItemData = null;
    ammo: XGTS_ItemData = null;
    playerData: XGTS_PlayerData = null;
    onLoad() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
    }

    Init(target: XGTS_CharacterController, weapon: XGTS_ItemData, ammo: XGTS_ItemData, playerData: XGTS_PlayerData) {
        this.target = target;
        this.weapon = weapon;
        this.ammo = ammo;
        this.playerData = playerData;
        let speed = v3(this.node.right.clone().multiplyScalar(500));
        this.rigidbody.applyForceToCenter(v2(speed.x, speed.y), true);
        this.node.getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
    }

    //子弹抛壳
    InitBlank(target: XGTS_CharacterController, impulse: Vec2) {
        this.rigidbody.linearVelocity = Vec2.ZERO;
        this.rigidbody.angularVelocity = 0;
        this.target = target;
        this.rigidbody.applyLinearImpulseToCenter(impulse, true);
        this.rigidbody.applyTorque(0.5, true);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTS_Constant.Group.Obstacle) {
            const worldManifold = contact.getWorldManifold();

            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Explosion, find("Canvas"));
            node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
            node.angle = misc.radiansToDegrees(v2(0, 1).signAngle(worldManifold.normal.negative())) - 90;
            // node.angle = this.node.angle + 180;

            this.scheduleOnce(() => {
                XGTS_PoolManager.Instance.Put(this.node);
            })
        }
    }

    update(dt) {
        if (this.target && this.target.node) {
            if (this.target.isDie || Vec2.distance(this.node.getWorldPosition(), this.target.node.getWorldPosition()) > 3500) {
                this.rigidbody.linearVelocity = Vec2.ZERO;
                XGTS_PoolManager.Instance.Put(this.node);
            }
        } else {
            this.rigidbody.linearVelocity = Vec2.ZERO;
            XGTS_PoolManager.Instance.Put(this.node);
        }
    }
}