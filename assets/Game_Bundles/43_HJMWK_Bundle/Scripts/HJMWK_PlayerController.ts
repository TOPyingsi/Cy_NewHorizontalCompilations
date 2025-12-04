import { _decorator, Component, Vec2, v2, Node, RigidBody2D, Collider2D, v3, misc, Vec3, IPhysics2DContact, Contact2DType, PhysicsSystem2D, sp, find, JsonAsset, director, tween, Tween, Prefab, instantiate, CircleCollider2D } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { HJMWK_GameData, } from './HJMWK_GameData';
import { HJMWK_SKIN } from './HJMWK_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { HJMWK_Pickaxe } from './HJMWK_Pickaxe';
import { HJMWK_GameManager } from './HJMWK_GameManager';
const { ccclass, property } = _decorator;



@ccclass('HJMWK_PlayerController')
export default class HJMWK_PlayerController extends Component {

    public static Instance: HJMWK_PlayerController = null;

    @property
    MaxSpeed: number = 200;

    @property(Node)
    Skins: Node[] = [];

    rigidbody: RigidBody2D = null;
    Player: Node = null;
    Pickaxe: Node = null;

    CurPickaxe: HJMWK_Pickaxe = null;
    Harm: number = 0;
    private _dirX: number = 0;
    private _speed: number = 0;
    private _isPlaying: boolean = false;

    onLoad() {
        HJMWK_PlayerController.Instance = this;

        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.Player = find("player", this.node);
        this.Pickaxe = find("player/Pickaxe", this.node);

        this.getComponents(CircleCollider2D).forEach(e => {
            if (e) {
                e.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
                e.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            }
        })

        PhysicsSystem2D.instance.enable = true;
        // PhysicsSystem2D.instance.debugDrawFlags = 1;
    }

    protected start(): void {
        this.changeSkin();
        this.switchPickaxe(HJMWK_GameData.Instance.CurProp);
    }

    SetMoveDir(x: number, rate: number) {
        this._dirX = x;
        this._speed = this.MaxSpeed * rate * (1 + HJMWK_GameData.Instance.userData["移动速度"] * 0.1);
        if (x != 0) this.node.scale = x < 0 ? v3(-0.5, 0.5, 1) : v3(0.5, 0.5, 1);
        if (x == 0) {
            this.stopAni();
        } else {
            this.playAni();
        }
    }

    playAni() {
        if (this._isPlaying) return;
        this._isPlaying = true;
        tween(this.Player)
            .to(0.3, { eulerAngles: v3(0, 0, 9) }, { easing: `sineOut` })
            .to(0.3, { eulerAngles: v3(0, 0, -2) }, { easing: `sineOut` })
            .union()
            .repeatForever()
            .start();
    }

    stopAni() {
        this._isPlaying = false;
        Tween.stopAllByTarget(this.Player);
        this.Player.eulerAngles = v3(0, 0, 0);
    }

    changeSkin() {
        if (HJMWK_SKIN[HJMWK_GameData.Instance.CurSkin] == HJMWK_SKIN.哈基米) {
            this.Skins[0].active = false;
            this.Skins[1].active = false;
        } else if (HJMWK_SKIN[HJMWK_GameData.Instance.CurSkin] == HJMWK_SKIN.皇家卫队长) {
            this.Skins[0].active = true;
            this.Skins[1].active = false;
        } else if (HJMWK_SKIN[HJMWK_GameData.Instance.CurSkin] == HJMWK_SKIN.魅影战甲) {
            this.Skins[0].active = false;
            this.Skins[1].active = true;
        }
    }

    attackClick() {
        this.CurPickaxe && this.CurPickaxe.attackStart();
    }

    attackStart(x: number, y: number) {
        this.node.scale = x < 0 ? v3(-0.5, 0.5, 0.5) : v3(0.5, 0.5, 0.5);
        let angleRadians = Math.atan2(y, x);
        let angleDegrees = misc.radiansToDegrees(angleRadians);
        this.Pickaxe.angle = (angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? 180 - angleDegrees : angleDegrees;
        this.CurPickaxe && this.CurPickaxe.attackStart();
    }

    attackEnd() {
        // if (!HJMWK_GameManager.Instance.AutoAttack) this.Pickaxe.angle = 0;
        this.CurPickaxe && this.CurPickaxe.attackEnd();
    }

    switchPickaxe(prop: string) {
        BundleManager.LoadPrefab("43_HJMWK_Bundle", `Props/${prop}`).then((prefab: Prefab) => {
            this.Pickaxe.removeAllChildren();
            const propNode: Node = instantiate(prefab);
            propNode.parent = this.Pickaxe;
            propNode.setPosition(Vec3.ZERO);
            this.CurPickaxe = propNode.getComponent(HJMWK_Pickaxe);
            this.Harm = Tools.hasKey(HJMWK_GameManager.Instance.PropData, prop) ? Number(HJMWK_GameManager.Instance.PropData.json[prop]["Gain"]) : 0;
        })


    }

    update(dt) {
        if (this.rigidbody.enabled) {
            this.rigidbody.linearVelocity = v2(this._dirX * this._speed, this.rigidbody.linearVelocity.y);
        }
    }

    //#region 跳跃
    // 最大跳跃次数
    private maxJumpCount: number = 2;

    // 当前跳跃次数
    private jumpCount: number = 0;

    // 跳跃的初始速度
    private jumpForce: number = 400;

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
        }
    }

    ResetJump() {
        // 重置跳跃状态
        this.jumpCount = 0;
        this.isOnGround = true;
        // this.IsJumP = false;
        // if (this.x == 0) {
        //     if (!this.IsAttack && !this.IsJumP) this.PlayAni(Ani.Idle, true);
        // } else {
        //     if (!this.IsAttack && !this.IsJumP) this.PlayAni(Ani.Runing, true);
        // }
    }

    // 碰撞检测
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 检测是否与地面碰撞
        this.ResetJump(); // 重置跳跃次数
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == 1 << 0 || otherCollider.group == 1 << 2) {
            this.isOnGround = false; // 离开地面
            // this.IsJumP = true;
        }
    }

    protected onEnable(): void {
        director.getScene().on("HJMWK_Move", this.SetMoveDir, this);
        director.getScene().on("HJMWK_AttackClick", this.attackClick, this);
        director.getScene().on("HJMWK_Attack", this.attackStart, this);
        director.getScene().on("HJMWK_Attack_End", this.attackEnd, this);
        director.getScene().on("HJMWK_ChangeSkin", this.changeSkin, this);
        director.getScene().on("HJMWK_Jump", this.Jump, this);
    }

    protected onDisable(): void {
        director.getScene().off("HJMWK_Move", this.SetMoveDir, this);
        director.getScene().off("HJMWK_AttackClick", this.attackClick, this);
        director.getScene().off("HJMWK_Attack", this.attackStart, this);
        director.getScene().off("HJMWK_Attack_End", this.attackEnd, this);
        director.getScene().off("HJMWK_ChangeSkin", this.changeSkin, this);
        director.getScene().off("HJMWK_Jump", this.Jump, this);
    }



}