import { _decorator, Component, Vec2, v2, Node, RigidBody2D, Collider2D, v3, misc, Vec3, IPhysics2DContact, Contact2DType, PhysicsSystem2D, sp, find, JsonAsset } from 'cc';
import { SJNDGZ_EventManager, SJNDGZ_MyEvent } from './SJNDGZ_EventManager';
import { SJNDGZ_GROUP } from './SJNDGZ_Constant';
import { SJNDGZ_Cube } from './SJNDGZ_Cube';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { SJNDGZ_UIController } from './SJNDGZ_UIController';
const { ccclass, property } = _decorator;

export enum Ani {
    Idle = "ldle",
    Attack = "gongj",
    Jump = "jump",
    Runing = "runing",
}

const PickaxeName: string[] = [
    "default",
    "创游金镐",
    "创游草镐",
    "火焰之镐",
    "木镐",
    "合金镐",
    "铁镐",
    "水立方镐",
    "紫水晶镐",
    "石镐",
    "莹石镐",
    "红石镐",
    "钻石镐",
    "金镐",
    "青金石镐",
    "石英镐",
    "红蓝镐",
    "黑曜石镐",
    "蓝曜石镐",
    "只因岩镐",
    "破灭星辰镐",
    "血曜战镐",
    "幽冥魔镐",
    "虚空之镐",
    "天启之镐",
    "雷霆力镐",
    "神殿圣镐",
    "禁忌之镐",
    "创游土镐",
    "创游土镐",
    "红曜石镐",
]

@ccclass('SJNDGZ_PlayerController')
export default class SJNDGZ_PlayerController extends Component {
    public static Instance: SJNDGZ_PlayerController = null;
    static oriPosition: Vec2 = v2();

    rigidbody: RigidBody2D = null;
    collider: Collider2D = null;

    x: number = 0;
    y: number = 0;

    maxSpeed: number = 50;
    speed: number = 0;

    private _hp = 0;
    public get HP(): number {
        return this._hp;
    }
    public set HP(value: number) {
        if (value <= 0) {
            value = 0;
        }
    }

    DirX: number = 0;
    DirY: number = 0;

    Harm: number = 0;
    IsAttack: boolean = false;
    Pickaxe: Node = null;
    PickaxeCollider: Collider2D = null;
    Skeleton: sp.Skeleton = null;

    TargetCube: SJNDGZ_Cube = null;
    Ani: string = "";
    IsJumP: boolean = false;
    IsPlaying: boolean = false;

    onLoad() {
        SJNDGZ_PlayerController.Instance = this;
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);

        this.Pickaxe = this.node.getChildByName("镐子");
        this.PickaxeCollider = this.Pickaxe.getComponent(Collider2D);

        this.Skeleton = find("玩家", this.node).getComponent(sp.Skeleton);

        // 监听碰撞事件
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
        PhysicsSystem2D.instance.enable = true;
        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
        //     EPhysics2DDrawFlags.Pair |
        //     EPhysics2DDrawFlags.CenterOfMass |
        //     EPhysics2DDrawFlags.Joint |
        //     EPhysics2DDrawFlags.Shape;

        this.Skeleton.setSkin("default");
    }

    SetMoveDir(x: number, y: number, rate: number) {
        this.x = x;
        this.y = 0;
        this.speed = this.maxSpeed * rate;
        if (x != 0) this.node.scale = x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);
        if (x == 0) {
            if (!this.IsAttack && !this.IsJumP) {
                this.PlayAni(Ani.Idle, true);
            }
        } else {
            if (!this.IsAttack && !this.IsJumP) this.PlayAni(Ani.Runing, true);
        }
    }

    attack() {
        if (!this.IsAttack) {
            if (this.x == 0) {
                if (!this.IsAttack && !this.IsJumP) this.PlayAni(Ani.Idle, true);
            } else {
                if (!this.IsAttack && !this.IsJumP) this.PlayAni(Ani.Runing, true);
            }
            return;
        }
        if (this.TargetCube) {
            this.TargetCube.BeHit(this.Harm);
        }
        this.PlayAni(Ani.Attack, false, () => {
            this.Ani = Ani.Idle;
            this.attack();
        });
    }

    attackStart(x: number, y: number) {
        this.DirX = x;
        this.DirY = y;
        this.node.scale = x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);

        let angleRadians = Math.atan2(y, x);
        let angleDegrees = misc.radiansToDegrees(angleRadians);

        // this.Weapon.angle = (angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? 180 - angleDegrees : angleDegrees;

        if (this.IsAttack) return;
        this.IsAttack = true;
        // this.schedule(this.attack, 1);
        this.IsPlaying = true;
        this.PlayAni(Ani.Attack, false, () => {
            this.Ani = Ani.Idle;
            this.attack();
        });
    }

    attackEnd() {
        this.IsAttack = false;
    }

    update(dt) {
        if (this.rigidbody.enabled) {
            // this.rigidbody.linearVelocity.x = this.x * this.speed;
            this.rigidbody.linearVelocity = v2(this.x * this.speed, this.rigidbody.linearVelocity.y);
            // this.rigidbody.linearVelocity = v2(this.x * this.speed, this.y * this.speed);
        }
        this.Pickaxe.setPosition(Vec3.ZERO);
    }

    // skeleton.setSkin(this.keletonName[index])
    SwitchSkin(name: string) {
        const skinName = PickaxeName.findIndex(e => e === name);

        if (skinName < 1) {
            this.Skeleton.setSkin("default");
            this.Harm = 0;
            return;
        }
        BundleManager.LoadJson("12_SJNDGZ_Bundle", "PickaxeData").then((jsonAsset: JsonAsset) => {
            this.Harm = jsonAsset.json[name].Gain;
            SJNDGZ_UIController.Instance.showHarm();
        })
        this.Skeleton.setSkin(skinName.toString());
    }

    PlayAni(ani: string, isLoop: boolean = false, callBack?: Function) {
        if (this.Ani === ani && ani !== Ani.Jump) return;
        this.Ani = ani;

        this.Skeleton.setAnimation(0, ani, isLoop);
        this.Skeleton.setCompleteListener(() => {
            if (callBack) callBack();
        })
    }

    protected onEnable(): void {
        SJNDGZ_EventManager.on(SJNDGZ_MyEvent.SJNDGZ_MOVEMENT, this.SetMoveDir, this);
        SJNDGZ_EventManager.on(SJNDGZ_MyEvent.SJNDGZ_JUMP, this.Jump, this);
        SJNDGZ_EventManager.on(SJNDGZ_MyEvent.SJNDGZ_ATTACK_START, this.attackStart, this);
        SJNDGZ_EventManager.on(SJNDGZ_MyEvent.SJNDGZ_ATTACK_END, this.attackEnd, this);
    }

    protected onDisable(): void {
        SJNDGZ_EventManager.off(SJNDGZ_MyEvent.SJNDGZ_MOVEMENT, this.SetMoveDir, this);
        SJNDGZ_EventManager.off(SJNDGZ_MyEvent.SJNDGZ_JUMP, this.Jump, this);
        SJNDGZ_EventManager.off(SJNDGZ_MyEvent.SJNDGZ_ATTACK_START, this.attackStart, this);
        SJNDGZ_EventManager.off(SJNDGZ_MyEvent.SJNDGZ_ATTACK_END, this.attackEnd, this);
    }

    //#region 跳跃
    // 最大跳跃次数
    private maxJumpCount: number = 2;

    // 当前跳跃次数
    private jumpCount: number = 0;

    // 跳跃的初始速度
    private jumpForce: number = 1500;

    // 用于检测是否在地面
    private isOnGround: boolean = true;

    Jump() {
        if (this.jumpCount < this.maxJumpCount) {
            this.jumpCount++;
            // 清除垂直速度，防止重复跳跃时累积
            const velocity = this.rigidbody.linearVelocity.clone();
            velocity.y = 0;
            this.rigidbody.linearVelocity = velocity;

            // 添加向上的跳跃力
            this.rigidbody.applyLinearImpulseToCenter(v2(0, this.jumpForce), true);

            // 如果不在地面，设置为 false
            this.isOnGround = false;
            if (!this.IsAttack) this.PlayAni(Ani.Jump, false,);
        }
    }

    ResetJump() {
        // 重置跳跃状态
        this.jumpCount = 0;
        this.isOnGround = true;
        this.IsJumP = false;
        if (this.x == 0) {
            if (!this.IsAttack && !this.IsJumP) this.PlayAni(Ani.Idle, true);
        } else {
            if (!this.IsAttack && !this.IsJumP) this.PlayAni(Ani.Runing, true);
        }
    }

    // 碰撞检测
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 检测是否与地面碰撞
        if (otherCollider.group == SJNDGZ_GROUP.DEFAULT) {
            this.ResetJump(); // 重置跳跃次数
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == SJNDGZ_GROUP.DEFAULT) {
            this.isOnGround = false; // 离开地面
            this.IsJumP = true;
        }
    }

}