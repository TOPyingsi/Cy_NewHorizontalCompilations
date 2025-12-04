import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, Node, Prefab, randomRange, RigidBody2D, toDegree, toRadian, v2, v3, Vec2, Vec3 } from 'cc';
import { MTRNX_ZUnit } from './MTRNX_ZUnit';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';


const { ccclass, property } = _decorator;

@ccclass('MTRNX_ZBullet')
export class MTRNX_ZBullet extends Component {

    @property(RigidBody2D)
    rig: RigidBody2D;
    @property(Collider2D)
    collider: Collider2D;
    @property(Prefab)
    bulletDie: Prefab;

    target: Node;
    self: MTRNX_ZUnit;
    danamge = 0;
    speed = 0;
    isEnemy = false;
    traceLevel = 0;
    dispersion = 0;
    isShoot = false;

    init(_target: Node, _damage: number, _speed: number, _isEnemy: boolean, _traceLevel: number, _dispersion: number = 0) {
        this.target = _target;
        this.danamge = _damage;
        this.speed = _speed;
        this.isEnemy = _isEnemy;
        this.traceLevel = _traceLevel;
        this.dispersion = _dispersion;
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.Shoot();
    }

    private Shoot() {
        if (!this.target || this.traceLevel == 0) var dir = v3(this.isEnemy ? -1 : 1, 0);
        else {
            if (this.target.getComponent(MTRNX_ZUnit)) var dir = this.target.getWorldPosition().subtract(this.node.getWorldPosition()).normalize();
            else var dir = this.target.getWorldPosition().subtract(this.node.getWorldPosition()).add3f(0, this.target.getComponent(BoxCollider2D).size.height / 2, 0).normalize();
        }
        //根据朝向计算出夹角弧度
        var angle = v2(dir.x, dir.y).signAngle(Vec2.UNIT_X);
        //将弧度转换为欧拉角
        var degree = toDegree(angle);
        if (this.traceLevel == 1) {
            degree = degree + randomRange(-this.dispersion, this.dispersion);
            Vec3.rotateZ(dir, dir, Vec3.ZERO, toRadian(randomRange(-this.dispersion, this.dispersion)));
        }
        this.node.angle = degree;
        this.node.setScale(this.isEnemy ? -1 : 1, 1);
        this.rig.linearVelocity = v2(this.speed * dir.x, this.speed * dir.y);
        this.isShoot = true;
        this.unschedule(this.PutNode);
        this.scheduleOnce(this.PutNode, 10);
    }

    onDisable() {
        this.isShoot = false;
    }

    update(deltaTime: number) {
        if (!this.isShoot || this.traceLevel != 2 || !this.target) return;
        if (this.target) {
            if (this.target?.getComponent(MTRNX_Unit).Hp <= 0) this.target = null;
            if (this.target?.getComponent(MTRNX_ZUnit)) var dir = this.target.getWorldPosition().subtract(this.node.getWorldPosition()).normalize();
            else var dir = this.target?.getWorldPosition().subtract(this.node.getWorldPosition()).add3f(0, this.target.getComponent(BoxCollider2D).size.height / 2, 0).normalize();
            if (dir) {
                //根据朝向计算出夹角弧度
                var angle = v2(dir.x, dir.y).signAngle(Vec2.UNIT_X);
                //将弧度转换为欧拉角
                var degree = toDegree(angle);
                this.node.angle = degree;
                this.rig.linearVelocity = v2(this.speed * dir.x, this.speed * dir.y);
            }
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        // console.log('onBeginContact');
        var other = otherCollider.node;
        if (other.name == "地面" || other.name == "黑色") this.scheduleOnce(() => { this.PutNode(); });
        else if (other.getComponent(MTRNX_Unit)) {
            var otherUnit = other.getComponent(MTRNX_Unit);
            if (otherUnit.IsEnemy == this.isEnemy) return;
            if (otherUnit.Hp <= 0) return;
            otherUnit.Hurt(this.danamge);
            this.scheduleOnce(() => { this.PutNode(); });
        }
    }

    PutNode() {
        var ani = instantiate(this.bulletDie);
        ani.setParent(this.node.parent);
        ani.setPosition(this.node.getPosition());
        MTRNX_PoolManager.Instance.PutNode(this.node);
    }
}


