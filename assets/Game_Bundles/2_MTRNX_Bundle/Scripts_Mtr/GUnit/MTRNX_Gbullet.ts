import { _decorator, animation, Animation, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, Prefab, quat, Quat, RigidBody2D, tween, UIOpacity, v2, v3, Vec2, Vec3 } from 'cc';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_ResourceUtil } from '../Utils/MTRNX_ResourceUtil';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_GEffect } from './MTRNX_GEffect';
import { MTRNX_ZUnit } from '../ZUnit/MTRNX_ZUnit';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Gbullet')
export class MTRNX_Gbullet extends Component {
    @property(RigidBody2D)
    rig: RigidBody2D;
    @property(Collider2D)
    collider: Collider2D;

    danamge = 0;
    speed = 0;
    isEnemy = false;
    isShoot = false;
    Velocity: Vec2 = v2();
    canThrough: boolean = false;//子弹是否可穿透
    duration: number = 10;//子弹飞行持续时间
    posed: Vec3 = v3();

    init(_targetPoint: Vec3, _forword: Vec2, _damage: number, _speed: number, _isEnemy: boolean, _canThrough: boolean, _duration: number, isfadeOut: boolean, isAim: boolean) {
        this.danamge = _damage;
        this.speed = _speed;
        this.isEnemy = _isEnemy;
        this.canThrough = _canThrough;
        this.duration = _duration;
        if (isfadeOut) {
            if (!this.node.getComponent(UIOpacity)) {
                this.node.addComponent(UIOpacity);
            }
            this.node.getComponent(UIOpacity).opacity = 255;
            tween(this.node.getComponent(UIOpacity))
                .to(this.duration, { opacity: 50 })
                .start();
        }
        if (isAim) {
            let dir = _targetPoint.subtract(this.node.worldPosition);
            this.Velocity = v2(dir.x * this.speed, dir.y * this.speed);
            //根据朝向计算出夹角弧度
            var angle = this.Velocity.signAngle(_forword);
            //将弧度转换为欧拉角
            var degree = angle / Math.PI * 180;
            //赋值给节点
            this.node.angle = -degree;
        }
        else {
            this.Velocity = _forword.multiplyScalar(this.speed);
        }
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.isShoot = true;
        this.scheduleOnce(this.Recycle, this.duration);
        if (this.node.getComponent(Animation)) this.node.getComponent(Animation).play("animation");
    }

    Recycle() {
        MTRNX_PoolManager.Instance.PutNode(this.node);
    }

    onDisable() {
        this.unschedule(this.Recycle);
        this.isShoot = false;
    }

    update(deltaTime: number) {
        if (this.isShoot) {
            this.rig.linearVelocity = this.Velocity;
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        var other = otherCollider.node;
        if (other.name == "地面" || other.name == "黑色") MTRNX_PoolManager.Instance.PutNode(this.node);
        else if (other.getComponent(MTRNX_Unit)) {
            var otherUnit = other.getComponent(MTRNX_Unit);
            if (otherUnit.IsEnemy == this.isEnemy || otherUnit.State == 2 || !this.isShoot) return;
            otherUnit.Hurt(this.danamge);
            if (!this.canThrough) {
                this.isShoot = false;
                this.node.setScale(0, 0, 0);
            }
            if (this.node.name == "GFlyKnife") {
                if (other.getComponent(MTRNX_ZUnit)) {
                    this.posed.set(other.worldPosition);
                }
                else {
                    this.posed.set(v3(other.worldPosition.x, other.worldPosition.y + other.getComponent(BoxCollider2D).size.height / 2));
                }
                MTRNX_ResourceUtil.LoadPrefab("Bullet/GLight").then((prefab: Prefab) => {
                    let effect: Node = MTRNX_PoolManager.Instance.GetNode(prefab, MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层"));
                    effect.getComponent(MTRNX_GEffect).Init(this.posed, 0.85);
                    MTRNX_AudioManager.AudioClipPlay("音响攻击音效");
                })
            }
            else {
                this.posed.set(this.node.worldPosition);
                MTRNX_ResourceUtil.LoadPrefab("Bullet/Geffect").then((prefab: Prefab) => {
                    let effect: Node = MTRNX_PoolManager.Instance.GetNode(prefab, MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层"));
                    effect.getComponent(MTRNX_GEffect).Init(this.posed, 0.4);
                })
            }
        }
    }
}


