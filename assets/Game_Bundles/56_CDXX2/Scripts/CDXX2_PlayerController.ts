import { _decorator, Component, Vec2, v2, Animation, Node, RigidBody2D, Collider2D, Texture2D, v3, misc, Prefab, instantiate, Vec3, ICollisionEvent, Input, IPhysics2DContact, Contact2DType, PhysicsSystem2D, EPhysics2DDrawFlags, Collider, sp, find, JsonAsset, Color, Label } from 'cc';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX2_UIController } from './CDXX2_UIController';
import { CDXX2_PoolManager } from './CDXX2_PoolManager';
// import { CDXX2_Bullet } from './CDXX2_Bullet';
import { CDXX2_Tool } from './CDXX2_Tool';
import { CDXX2_REALM, CDXX2_PICKAXE_DAMAGE_RATE } from './CDXX2_Constant';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_GameManager } from './CDXX2_GameManager';
import { CDXX2_HarmText } from './CDXX2_HarmText';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

//"玩家控制器"负责把摇杆/键盘的输入变成八方向移动与瞄准，播放对应骨骼动画进行近战攻击
//被击伤累计超过血量即调出复活面板，同时管理换肤、境界显示与出生坐标。

export enum Ani {
    Idle = "ldle",
    Attack = "gongj",
    Runing = "runing",
}

enum WeaponName {
    "凡品光辉" = 0,
    "良品影刀" = 1,
    "上品熄灭" = 2,
    "精品辰砂" = 3,
    "极品极星" = 4,
    "灵品秀春" = 5,
    "宝品剑" = 6,
    "暗虚剑" = 7,
}

// const GunBulletColor: Color[] = [
//     new Color(255, 213, 93, 255),
//     new Color(127, 72, 57, 255),
//     new Color(71, 78, 72, 255),
//     new Color(90, 99, 74, 255),
//     new Color(233, 193, 33, 255),
//     new Color(152, 133, 122, 255),
//     new Color(181, 77, 229, 255),
//     new Color(121, 86, 42, 255),
//     new Color(75, 215, 121, 255),
//     new Color(217, 68, 75, 255),
//     new Color(116, 177, 227, 255),
//     new Color(171, 0, 236, 255),
//     new Color(238, 137, 38, 255),
//     new Color(176, 28, 15, 255),
//     new Color(246, 244, 160, 255),
//     new Color(53, 96, 158, 255),
//     new Color(0, 165, 213, 255),
//     new Color(173, 20, 7, 255),
//     new Color(244, 1, 11, 255),
//     new Color(4, 131, 90, 255),
//     new Color(219, 0, 255, 255),
// ];

@ccclass('CDXX2_PlayerController')
export default class CDXX2_PlayerController extends Component {
    public static Instance: CDXX2_PlayerController = null;
    static oriPosition: Vec2 = v2();

    // @property(Prefab)
    // BulletPrefab: Prefab = null;

    // @property(Node)
    // BulletPos: Node = null;

    @property(Node)
    AttackRange: Node = null; // 攻击范围节点（带碰撞体）

    @property
    Speed: number = 10;

    @property(Prefab)
    HarmTextPrefab: Prefab = null;

    @property({ type: [Texture2D] })
    WeaponTex: Texture2D[] = [];

    rigidbody: RigidBody2D = null;
    collider: Collider2D = null;
    attackRangeCollider: Collider2D = null; // 攻击范围的碰撞体


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
    GunName = "凡品光辉";
    RealmLabel: Label = null
    Realm: string = "";

    HP: number = 0;
    Injured: number = 0;
    IsInvincible: boolean = false; // 无敌状态

    private _isMove: boolean = false;
    // private _bulletColor: Color[] = [];
    private _initPos: Vec3 = new Vec3();
    private _currentAttackId: number = 0; // 当前攻击的唯一ID，每次攻击递增
    private _weaponPos: Vec3 = v3();
    private _weaponDamageRate: number = 1.0; // 当前武器的伤害倍率

    onLoad() {
        CDXX2_PlayerController.Instance = this;
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(Collider2D);
        this.RealmLabel = find("Realm", this.node).getComponent(Label);

        // 获取攻击范围节点和碰撞体
        if (this.AttackRange) {
            this.attackRangeCollider = this.AttackRange.getComponent(Collider2D);
            console.log(this.attackRangeCollider);

            if (this.attackRangeCollider) {
                this.attackRangeCollider.on(Contact2DType.BEGIN_CONTACT, this.onAttackRangeBeginContact, this);
                // 初始状态禁用碰撞体
                this.attackRangeCollider.enabled = false;


            }
        }

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
        this._weaponPos = this.AttackRange.getPosition().clone();
    }

    protected start(): void {
        // CDXX2_PoolManager.Instance.preload(this.BulletPrefab, 100);
        // this.initBulletColor();
        this.SwitchSkin(this.GunName);
        this.PlayAni(Ani.Idle, true);
        this.ShowRealm();
        this.ApplySpeedBonus(); // 应用速度加成

        // 每5秒自动回复20%血量
        this.schedule(() => {
            const healAmount = Math.floor(CDXX2_GameData.Instance.HP * 0.2);
            this.Injured = Math.max(0, this.Injured - healAmount);
            CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
        }, 5);
    }

    // 应用速度加成
    ApplySpeedBonus() {
        const speedBonus = CDXX2_GameData.Instance.userData["速度加成"] || 0;
        this.maxSpeed = 20 + speedBonus;
    }

    InitPos(pos: Vec3 = this._initPos) {
        this.node.setWorldPosition(pos);
    }

    // initBulletColor() {
    //     let index: number = 0;
    //     for (let gun in WeaponName) {
    //         if (gun.length <= 2) this._bulletColor[Number(gun)] = GunBulletColor[index++];
    //     }
    // }

    ShowRealm() {
        this.RealmLabel.string = CDXX2_Tool.GetEnumKeyByValue(CDXX2_REALM, CDXX2_GameData.Instance.Realm);
    }

    StartBattle() {
        this.Injured = 0;
    }

    BeHit(harm: number) {
        // 无敌状态下不受伤
        if (this.IsInvincible) return;
        
        this.Injured += harm;
        if (this.Injured >= CDXX2_GameData.Instance.HP) {
            CDXX2_GameManager.Instance.ShowResurgencePanel();
            // 触发游戏结束事件
            ProjectEventManager.emit(ProjectEvent.游戏结束, "吃丹修仙2");
            // CDXX2_UIController.Instance.showHarm();
        }
        const node: Node = CDXX2_PoolManager.Instance.get(this.HarmTextPrefab);
        node.parent = CDXX2_GameManager.Instance.Canvas;
        node.getComponent(CDXX2_HarmText).show(this.node.getWorldPosition().clone(), harm);
        CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_STATE_SHOW);
    }

    // 设置无敌状态
    SetInvincible(duration: number) {
        this.IsInvincible = true;
        this.scheduleOnce(() => {
            this.IsInvincible = false;
        }, duration);
    }

    SetMoveDir(x: number, y: number, rate: number) {
        this._isMove = x != 0 || y != 0;
        this.x = x;
        this.y = y;  // 现在支持上下移动
        this.speed = this.maxSpeed * rate;
        if (x != 0) this.node.scale = x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);
        if (x == 0 && y == 0) {
            // 没有移动
            if (!this.IsAttack) {
                this.PlayAni(Ani.Idle, true);
            } else {
                this.PlayAni(Ani.Attack, true);
            }
        } else {
            // 有移动（包括上下左右）
            // 允许边移动边攻击，不中断攻击
            if (!this.IsAttack) {
                this.PlayAni(Ani.Runing, true);
            }
        }
    }

    attack() {
        // if (this._isMove) return;
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
            CDXX2_UIController.Instance.PlayFire();
            this.fireBullet();
        }, 0.1);
        this.PlayAni(Ani.Attack, false, () => {
            this.PlayAni(Ani.Idle, true);
            this.attack();
        });
    }

    attackStart(x: number, y: number) {
        // 允许移动时攻击
        this.DirX = x;
        this.DirY = y;
        if (x != 0 && !this.IsAuto) this.node.scale = x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);

        let angleRadians = Math.atan2(y, x);
        let angleDegrees = misc.radiansToDegrees(angleRadians);

        // this.Weapon.angle = (angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? 180 - angleDegrees : angleDegrees;

        if (this.IsAttack) return;
        this.IsAttack = true;
        // this.schedule(this.attack, 1);
        this.IsPlaying = true;
        this.scheduleOnce(() => {
            CDXX2_UIController.Instance.PlayFire();
            this.fireBullet();
        }, 0.1);
        this.PlayAni(Ani.Attack, false, () => {
            this.PlayAni(Ani.Idle, true);
            this.attack();
        });
    }

    fireBullet() {
        // 生成新的攻击ID，防止同一刀多次伤害
        this._currentAttackId++;

        // 启用攻击范围碰撞体 - 延迟0.2秒才启用
        if (this.attackRangeCollider) {
            this.scheduleOnce(() => {
                if (this.attackRangeCollider) {
                    this.attackRangeCollider.enabled = true;
                }
            }, 0.2);
            // 0.3秒后禁用碰撞体（0.2秒启用 + 0.1秒判定窗口）
            this.scheduleOnce(() => {
                if (this.attackRangeCollider) {
                    this.attackRangeCollider.enabled = false;
                }
            }, 0.3);
        }
    }

    onAttackRangeBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 检查是否碰到敌人
        let enemy = otherCollider.getComponent('CDXX2_EnemyController');

        // 如果敌人组件不在碰撞体节点上，尝试从父节点获取
        if (!enemy && otherCollider.node.parent) {
            enemy = otherCollider.node.parent.getComponent('CDXX2_EnemyController');
        }

        // 如果还是没找到，尝试遍历父节点链
        if (!enemy) {
            let currentNode = otherCollider.node.parent;
            while (currentNode && !enemy) {
                enemy = currentNode.getComponent('CDXX2_EnemyController');
                currentNode = currentNode.parent;
            }
        }

        // 用攻击ID判重：防止同一刀多次伤害
        if (enemy) {
            const anyEnemy = enemy as any;
            // 如果敌人上次被击中的攻击ID不同，才造成伤害
            if (anyEnemy._lastHitAttackId !== this._currentAttackId) {
                anyEnemy._lastHitAttackId = this._currentAttackId;
                // 计算最终伤害 = 基础伤害 × 武器倍率
                const finalDamage = Math.floor(CDXX2_GameData.Instance.Harm * this._weaponDamageRate);
                anyEnemy.BeHit(finalDamage);
                CDXX2_UIController.Instance.PlayHit();
            }
        }
    }

    attackEnd() {
        this.IsAttack = false;
        this.IsAuto = false;
    }

    update(dt) {
        if (this.rigidbody.enabled) {
            // 支持上下左右移动
            this.rigidbody.linearVelocity = v2(this.x * this.speed, this.y * this.speed);
        }

        // 攻击范围节点设置：锚点在左下角，位置在角色左下角，根据方向翻转和偏移
        if (this.AttackRange) {
            const playerPos = this.node.position;
            let offsetY = 0;

            // 如果没有指定攻击方向，默认使用角色朝向（水平）
            let dirX = this.DirX;
            if (dirX === 0) {
                dirX = this.node.scale.x; // 使用角色当前朝向
            }

            // 计算缩放：参考子弹的方式，dirX为正向右，为负向左
            const scaleX = dirX > 0 ? 1 : -1;

            // 只有往上下攻击时才有垂直偏移
            let dirY = this.DirY;
            if (dirY !== 0) {
                const offsetDist = 50; // 垂直偏移距离
                offsetY = dirY > 0 ? offsetDist : -offsetDist; // 往上偏移正值，往下偏移负值
            }

            // 根据攻击方向设置攻击范围的水平翻转（参考子弹的做法）
            this.AttackRange.scale = v3(scaleX, 1, 1);

            // 攻击范围的位置在角色左下角（基于锚点在左下角的前提）
            // this.AttackRange.setPosition(v3(playerPos.x, playerPos.y + offsetY, playerPos.z));
            this.AttackRange.setPosition(v3(this._weaponPos.x, this._weaponPos.y, this._weaponPos.z));
        }
        // this.Pickaxe.setPosition(Vec3.ZERO);
    }

    // skeleton.setSkin(this.keletonName[index])
    SwitchSkin(name: string) {
        this.GunName = name;
        const idx = WeaponName[name];          // 拿到 0 1 2 …

        // 1. 换武器贴图（槽位 wuqi）
        console.log(idx);
        
        if (this.WeaponTex[idx]) {
            this.Skeleton.setSlotTexture('wuqi', this.WeaponTex[idx]);
        } else {
            console.warn(`WeaponTex[${idx}] 不存在，换武器失败`);
        }

        // 2. 伤害倍率（原逻辑不动）
        this._weaponDamageRate = CDXX2_PICKAXE_DAMAGE_RATE.get(name) ?? 1.0;

        // 3. 刷新 UI（原逻辑不动）
        CDXX2_UIController.Instance.showHarm();
    }

    public _index: number = 1;
    nextSkin() {
        this._index++;
        this.Skeleton.setSkin(this._index.toString());
        // this.SwitchSkin(this._index.toString());
    }

    PlayAni(ani: string, isLoop: boolean = false, callBack?: Function, timeScale: number = 1,) {
        if (this.Ani === ani) return;
        this.Ani = ani;
        let track = this.Skeleton.setAnimation(0, ani, isLoop);
        track.timeScale = timeScale;
        this.Skeleton.setCompleteListener(() => {
            if (callBack) callBack();
        })
    }

    protected onEnable(): void {
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_MOVEMENT, this.SetMoveDir, this);
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_ATTACK_START, this.attackStart, this);
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_ATTACK_END, this.attackEnd, this);
    }

    protected onDisable(): void {
        CDXX2_EventManager.off(CDXX2_MyEvent.CDXX2_MOVEMENT, this.SetMoveDir, this);
        CDXX2_EventManager.off(CDXX2_MyEvent.CDXX2_ATTACK_START, this.attackStart, this);
        CDXX2_EventManager.off(CDXX2_MyEvent.CDXX2_ATTACK_END, this.attackEnd, this);
    }

}