import { _decorator, Component, RigidBody2D, Node, Vec2, RigidBody, v2, v3, director, misc, Vec3, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact, find } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_Constant } from './Framework/Const/XGTW_Constant';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_PlayerData, XGTW_ItemData } from './Datas/XGTW_Data';
import { GameManager } from 'db://assets/Scripts/GameManager';

@ccclass('XGTW_Bullet')
export default class XGTW_Bullet extends Component {
    rigidbody: RigidBody2D | null = null;
    target: Node | null = null;
    weapon = null;
    playerData: XGTW_PlayerData = null;
    onLoad() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
    }
    Init(target: Node, weapon: XGTW_ItemData, playerData: XGTW_PlayerData) {
        this.target = target;
        this.weapon = weapon;
        this.playerData = playerData;
        let speed = v3(this.node.right.clone().multiplyScalar(10000));
        // let speed = cc.v2(this.node.right.clone().multiplyScalar(2000));
        this.rigidbody.applyForceToCenter(v2(speed.x, speed.y), true);
        this.node.getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
    }

    //子弹抛壳
    InitBlank(target: Node, impulse: Vec2) {
        this.target = target;
        this.rigidbody.applyLinearImpulseToCenter(impulse, true);
        this.rigidbody.applyTorque(0.5, true);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTW_Constant.Group.Obstacle) {
            const worldManifold = contact.getWorldManifold();

            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/Explosion", find("Canvas")).then(node => {
                node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
                // node.angle = misc.radiansToDegrees(v2(0, 1).signAngle(worldManifold.normal.negative()));
                node.angle = this.node.angle + 180;
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