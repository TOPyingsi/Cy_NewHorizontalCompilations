import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, RigidBody2D, v2, v3, Vec2 } from 'cc';
import { MTRNX_PoolManager } from './Utils/MTRNX_PoolManager';
import { MTRNX_Unit } from './MTRNX_Unit';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_WBullet')
export class MTRNX_WBullet extends Component {

    @property(RigidBody2D)
    rig: RigidBody2D;
    @property(Collider2D)
    collider: Collider2D;

    target: Node;
    danamge = 0;
    speed = 0;
    isEnemy = false;
    isMissle = false;
    isShoot = false;
    ispenetrate = false;
    Velocity = v2(0, 0);

    init(_target: Node, _damage: number, _speed: number, _isEnemy: boolean, _isMissle: boolean, _Velocity: Vec2) {
        this.target = _target;
        this.danamge = _damage;
        this.speed = _speed;
        this.isEnemy = _isEnemy;
        this.isMissle = _isMissle;
        this.Velocity = _Velocity;
        if (this.Velocity == v2(0, 0)) {
            var dir = this.target.getWorldPosition().subtract(this.node.getWorldPosition()).normalize();
            this.Velocity = v2(this.speed * dir.x, this.speed * dir.y);
        }
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.Shoot();
    }

    private Shoot() {
        if (!this.target) var dir = v3(this.isEnemy ? -1 : 1, 0);
        else {
            this.rig.linearVelocity = this.Velocity;
        }
        this.isShoot = true;
    }

    onDisable() {
        this.isShoot = false;
    }

    update(deltaTime: number) {
        if (this.node.position.x > 3000 || this.node.position.x < -3000) {
            MTRNX_PoolManager.Instance.PutNode(this.node);
        }
        if (!this.isShoot || this.isMissle) return;
        if (this.target) {
            var dir = this.target.getWorldPosition().subtract(this.node.getWorldPosition()).normalize();
            this.rig.linearVelocity = v2(this.speed * dir.x, this.speed * dir.y);
        }

    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        var other = otherCollider.node;
        if (other.name == "地面" || other.name == "黑色") MTRNX_PoolManager.Instance.PutNode(this.node);
        else if (other.getComponent(MTRNX_Unit)) {
            var otherUnit = other.getComponent(MTRNX_Unit);
            if (otherUnit.IsEnemy == this.isEnemy || otherUnit.State == 2) return;
            otherUnit.Hurt(this.danamge);
            // PoolManager.Instance.PutNode(this.node);
            if (!this.ispenetrate) {
                this.scheduleOnce(() => { MTRNX_PoolManager.Instance.PutNode(this.node); });
            }
        }
    }
}


