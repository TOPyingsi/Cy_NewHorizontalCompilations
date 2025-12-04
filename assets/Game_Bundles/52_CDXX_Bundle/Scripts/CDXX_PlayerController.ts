import { _decorator, Component, Vec2, v2, Animation, Node, RigidBody2D, Collider2D, v3, misc, Prefab, instantiate, Vec3, ICollisionEvent, Input, IPhysics2DContact, Contact2DType, PhysicsSystem2D, EPhysics2DDrawFlags, Collider, sp, find, JsonAsset, Color, Label } from 'cc';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX_UIController } from './CDXX_UIController';
import { CDXX_PoolManager } from './CDXX_PoolManager';
import { CDXX_Bullet } from './CDXX_Bullet';
import { CDXX_Tool } from './CDXX_Tool';
import { CDXX_REALM } from './CDXX_Constant';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_GameManager } from './CDXX_GameManager';
import { CDXX_HarmText } from './CDXX_HarmText';
const { ccclass, property } = _decorator;

export enum Ani {
    Idle = "ldle",
    Attack = "gongj",
    Jump = "jump",
    Runing = "runing",
}

enum GunName {
    "鎏金执法者" = 2,
    "木纹老兵" = 4,
    "战垒撕咬者" = 9,
    "绿影死神" = 10,
    "黄芒突袭者" = 11,
    "荒土战魂" = 12,
    "幻彩游骑兵" = 13,
    "锈纹拓荒者" = 14,
    "迷彩幽灵" = 15,
    "猩红复仇者" = 16,
    "蓝火冲锋" = 19,
    "紫电狂魔" = 20,
    "金芒战矛" = 21,
    "红缨怒号" = 23,
    "圣金猎隼" = 24,
    "丛林魅影" = 25,
    "冰蓝海啸" = 26,
    "猩红猎手" = 27,
    "赤炼火炮" = 28,
    "幻晶毒牙" = 29,
    "星陨狂徒" = 30,
}

const GunBulletColor: Color[] = [
    new Color(255, 213, 93, 255),
    new Color(127, 72, 57, 255),
    new Color(71, 78, 72, 255),
    new Color(90, 99, 74, 255),
    new Color(233, 193, 33, 255),
    new Color(152, 133, 122, 255),
    new Color(181, 77, 229, 255),
    new Color(121, 86, 42, 255),
    new Color(75, 215, 121, 255),
    new Color(217, 68, 75, 255),
    new Color(116, 177, 227, 255),
    new Color(171, 0, 236, 255),
    new Color(238, 137, 38, 255),
    new Color(176, 28, 15, 255),
    new Color(246, 244, 160, 255),
    new Color(53, 96, 158, 255),
    new Color(0, 165, 213, 255),
    new Color(173, 20, 7, 255),
    new Color(244, 1, 11, 255),
    new Color(4, 131, 90, 255),
    new Color(219, 0, 255, 255),
];

@ccclass('CDXX_PlayerController')
export default class CDXX_PlayerController extends Component {
    public static Instance: CDXX_PlayerController = null;
    static oriPosition: Vec2 = v2();

    @property(Prefab)
    BulletPrefab: Prefab = null;

    @property(Node)
    BulletPos: Node = null;

    @property
    Speed: number = 10;

    @property(Prefab)
    HarmTextPrefab: Prefab = null;

    rigidbody: RigidBody2D = null;
    collider: Collider2D = null;

    x: number = 0;
    y: number = 0;

    maxSpeed: number = 20;
    speed: number = 0;

    IsAuto: boolean = false;
    DirX: number = 0;
    DirY: number = 0;

    Harm: number = 0;
    IsAttack: boolean = false;
    // Pickaxe: Node = null;
    // PickaxeCollider: Collider2D = null;
    Skeleton: sp.Skeleton = null;

    Ani: string = "";
    IsPlaying: boolean = false;
    GunName = "鎏金执法者";
    RealmLabel: Label = null
    Realm: string = "";

    HP: number = 0;
    Injured: number = 0;

    private _isMove: boolean = false;
    private _bulletColor: Color[] = [];
    private _initPos: Vec3 = new Vec3();

    onLoad() {
        CDXX_PlayerController.Instance = this;
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);
        this.RealmLabel = find("Realm", this.node).getComponent(Label);

        // this.Pickaxe = this.node.getChildByName("镐子");
        // this.PickaxeCollider = this.Pickaxe.getComponent(Collider2D);

        this.Skeleton = find("玩家", this.node).getComponent(sp.Skeleton);

        // 监听碰撞事件
        // if (this.collider) {
        //     this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        //     this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        // }
        PhysicsSystem2D.instance.enable = true;
        // PhysicsSystem2D.instance.debugDrawFlags = 1;
        this._initPos = this.node.getWorldPosition().clone();
        // this.Skeleton.setSkin("default");
    }

    protected start(): void {
        CDXX_PoolManager.Instance.preload(this.BulletPrefab, 100);
        this.initBulletColor();
        this.SwitchSkin(this.GunName);
        this.PlayAni(Ani.Idle, true);
        this.ShowRealm();
    }

    InitPos(pos: Vec3 = this._initPos) {
        this.node.setWorldPosition(pos);
    }

    initBulletColor() {
        let index: number = 0;
        for (let gun in GunName) {
            if (gun.length <= 2) this._bulletColor[Number(gun)] = GunBulletColor[index++];
        }
    }

    ShowRealm() {
        this.RealmLabel.string = CDXX_Tool.GetEnumKeyByValue(CDXX_REALM, CDXX_GameData.Instance.Realm);
    }

    StartBattle() {
        this.Injured = 0;
    }

    BeHit(harm: number) {
        this.Injured += harm;
        if (this.Injured >= CDXX_GameData.Instance.HP) {
            CDXX_GameManager.Instance.ShowResurgencePanel();
            // CDXX_UIController.Instance.showHarm();
        }
        const node: Node = CDXX_PoolManager.Instance.get(this.HarmTextPrefab);
        node.parent = CDXX_GameManager.Instance.Canvas;
        node.getComponent(CDXX_HarmText).show(this.node.getWorldPosition().clone(), harm);
        CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_STATE_SHOW);
    }

    SetMoveDir(x: number, y: number, rate: number) {
        this._isMove = x != 0;
        this.x = x;
        this.y = 0;
        this.speed = this.maxSpeed * rate;
        if (x != 0) this.node.scale = x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);
        if (x == 0) {
            // this.PlayAni(Ani.Idle, true);
            if (!this.IsAttack) {
                this.PlayAni(Ani.Idle, true);
            } else {
                this.PlayAni(Ani.Attack, true);
            }
        } else {
            if (this.IsAttack) this.attackEnd();
            this.PlayAni(Ani.Runing, true);
        }
    }

    attack() {
        if (this._isMove) return;
        if (!this.IsAttack) {
            if (this.x == 0) {
                if (!this.IsAttack) this.PlayAni(Ani.Idle, true);
            } else {
                if (!this.IsAttack) this.PlayAni(Ani.Runing, true);
            }
            return;
        }
        // if (this.TargetCube) {
        //     this.TargetCube.BeHit(this.Harm);
        // }
        this.scheduleOnce(() => {
            CDXX_UIController.Instance.PlayFire();
            this.fireBullet();
        }, 0.1);
        this.PlayAni(Ani.Attack, false, () => {
            this.PlayAni(Ani.Idle, true);
            this.attack();
        });
    }

    attackStart(x: number, y: number) {
        if (this._isMove) return;
        this.DirX = x;
        this.DirY = y;
        if (!this._isMove && x != 0 && !this.IsAuto) this.node.scale = x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);

        let angleRadians = Math.atan2(y, x);
        let angleDegrees = misc.radiansToDegrees(angleRadians);

        // this.Weapon.angle = (angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? 180 - angleDegrees : angleDegrees;

        if (this.IsAttack) return;
        this.IsAttack = true;
        // this.schedule(this.attack, 1);
        this.IsPlaying = true;
        this.scheduleOnce(() => {
            CDXX_UIController.Instance.PlayFire();
            this.fireBullet();
        }, 0.1);
        this.PlayAni(Ani.Attack, false, () => {
            this.PlayAni(Ani.Idle, true);
            this.attack();
        });
    }

    fireBullet() {
        const bullet: Node = CDXX_PoolManager.Instance.get(this.BulletPrefab);
        const dirX = this.node.scale.x;
        bullet.getComponent(CDXX_Bullet).init(this.BulletPos.getWorldPosition().clone(), this.Harm, this._bulletColor[GunName[this.GunName]], dirX * this.Speed);
    }

    attackEnd() {
        this.IsAttack = false;
        this.IsAuto = false;
    }

    update(dt) {
        if (this.rigidbody.enabled) {
            // this.rigidbody.linearVelocity.x = this.x * this.speed;
            this.rigidbody.linearVelocity = v2(this.x * this.speed, this.rigidbody.linearVelocity.y);
            // this.rigidbody.linearVelocity = v2(this.x * this.speed, this.y * this.speed);
        }
        // this.Pickaxe.setPosition(Vec3.ZERO);
    }

    // skeleton.setSkin(this.keletonName[index])
    SwitchSkin(name: string) {
        this.GunName = name;
        // const skinName = PickaxeName.findIndex(e => e === name);
        const skinName = GunName[name];

        if (skinName < 1) {
            this.Skeleton.setSkin("default");
            this.Harm = 0;
            return;
        }
        BundleManager.LoadJson("52_CDXX_Bundle", "PickaxeData").then((jsonAsset: JsonAsset) => {
            this.Harm = jsonAsset.json[name].Gain;
            CDXX_UIController.Instance.showHarm();
        })
        this.Skeleton.setSkin(skinName.toString());
    }

    public _index: number = 1;
    nextSkin() {
        this._index++;
        this.Skeleton.setSkin(this._index.toString());
        // this.SwitchSkin(this._index.toString());
    }

    PlayAni(ani: string, isLoop: boolean = false, callBack?: Function, timeScale: number = 1,) {
        if (this.Ani === ani && ani !== Ani.Jump) return;
        this.Ani = ani;
        let track = this.Skeleton.setAnimation(0, ani, isLoop);
        track.timeScale = timeScale;
        this.Skeleton.setCompleteListener(() => {
            if (callBack) callBack();
        })
    }

    protected onEnable(): void {
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_MOVEMENT, this.SetMoveDir, this);
        // CDXX_EventManager.on(CDXX_MyEvent.CDXX_JUMP, this.Jump, this);
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_ATTACK_START, this.attackStart, this);
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_ATTACK_END, this.attackEnd, this);
    }

    protected onDisable(): void {
        CDXX_EventManager.off(CDXX_MyEvent.CDXX_MOVEMENT, this.SetMoveDir, this);
        // CDXX_EventManager.off(CDXX_MyEvent.CDXX_JUMP, this.Jump, this);
        CDXX_EventManager.off(CDXX_MyEvent.CDXX_ATTACK_START, this.attackStart, this);
        CDXX_EventManager.off(CDXX_MyEvent.CDXX_ATTACK_END, this.attackEnd, this);
    }

    // //#region 跳跃
    // // 最大跳跃次数
    // private maxJumpCount: number = 2;

    // // 当前跳跃次数
    // private jumpCount: number = 0;

    // // 跳跃的初始速度
    // private jumpForce: number = 1500;

    // // 用于检测是否在地面
    // private isOnGround: boolean = true;

    // Jump() {
    //     if (this.jumpCount < this.maxJumpCount) {
    //         this.jumpCount++;
    //         // 清除垂直速度，防止重复跳跃时累积
    //         const velocity = this.rigidbody.linearVelocity.clone();
    //         velocity.y = 0;
    //         this.rigidbody.linearVelocity = velocity;

    //         // 添加向上的跳跃力
    //         this.rigidbody.applyLinearImpulseToCenter(v2(0, this.jumpForce), true);

    //         // 如果不在地面，设置为 false
    //         this.isOnGround = false;
    //         if (!this.IsAttack) this.PlayAni(Ani.Jump, false,);
    //     }
    // }

    // ResetJump() {
    //     // 重置跳跃状态
    //     this.jumpCount = 0;
    //     this.isOnGround = true;
    //     this.IsJumP = false;
    //     if (this.x == 0) {
    //         if (!this.IsAttack && !this.IsJumP) this.PlayAni(Ani.Idle, true);
    //     } else {
    //         if (!this.IsAttack && !this.IsJumP) this.PlayAni(Ani.Runing, true);
    //     }
    // }

    // // 碰撞检测
    // onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    //     // 检测是否与地面碰撞
    //     if (otherCollider.group == CDXX_GROUP.DEFAULT) {
    //         this.ResetJump(); // 重置跳跃次数
    //     }
    // }

    // onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    //     if (otherCollider.group == CDXX_GROUP.DEFAULT) {
    //         this.isOnGround = false; // 离开地面
    //         this.IsJumP = true;
    //     }
    // }

}