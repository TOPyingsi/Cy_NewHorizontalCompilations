import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, find, IPhysics2DContact, misc, Node, RigidBody2D, v2, v3, Vec3 } from 'cc';
import { SJZXD_Constant } from './SJZXD_Constant';
import { SJZXD_PoolManager } from './SJZXD_PoolManager';
import { SJZXD_Unit } from './SJZXD_Unit';
import { SJZXD_GameManager } from './SJZXD_GameManager';
import { SJZXD_Gun_Effect } from './SJZXD_Gun_Effect';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Bullet')
export class SJZXD_Bullet extends Component {
    @property()
    public speed: number = 100; // 子弹速度
    camp: number = 0;//阵营
    attack: number = 10;//伤害


    private collider: Collider2D = null;
    private rg: RigidBody2D = null;
    start() {
        this.collider = this.node.getComponent(Collider2D);
        this.rg = this.node.getComponent(RigidBody2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
    }
    protected update(dt: number): void {
        const direction = v2(0.1, 0); // 本地坐标的正前方（右侧）
        const worldDirection = this.node.right;
        let pos = worldDirection.normalize().multiplyScalar(this.speed);
        this.rg.linearVelocity = v2(pos.x, pos.y);
    }
    private Count: number = 1;//计数(避免多次计算伤害)

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.Count == 0) return;
        if (otherCollider.group == SJZXD_Constant.Group.Obstacle) {
            this.Count = 0;
            this.CreateEffect(this.node.worldPosition.clone());
            SJZXD_PoolManager.Instance.Put(this.node);
        } else if (otherCollider.group == SJZXD_Constant.Group.Unit) {
            let unit = otherCollider.node.getComponent(SJZXD_Unit);
            if (unit.Camp != this.camp) {
                this.Count = 0
                unit.TakeDamage(this.attack);
                this.CreateEffect(this.node.worldPosition.clone());
                SJZXD_PoolManager.Instance.Put(this.node);
            }
        }
    }
    //生成子弹特效
    public CreateEffect(worldpos: Vec3) {
        let effect = SJZXD_PoolManager.Instance.Get("击中特效");
        effect.setParent(SJZXD_GameManager.Instance.GameNode);
        effect.getComponent(SJZXD_Gun_Effect).setPos(worldpos);
    }
    Setproperty(angle: number, camp: number, attack: number) {
        this.node.angle = angle;
        this.camp = camp;
        this.attack = attack;
    }
    protected onEnable(): void {
        this.Count = 1;
    }
}


