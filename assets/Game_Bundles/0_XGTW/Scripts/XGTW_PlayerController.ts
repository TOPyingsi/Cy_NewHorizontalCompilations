import { _decorator, Component, Vec2, v2, RigidBody2D, Node, Sprite, Animation, Collider2D, CircleCollider2D, SpriteFrame, Vec3, v3, misc, director, JsonAsset, PhysicsSystem2D, ERaycast2DType, Contact2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_Bullet from "./XGTW_Bullet";
import XGTW_DroppedItem from "./XGTW_DroppedItem";
import XGTW_EnemyController from "./XGTW_EnemyController";
import XGTW_Supplies from "./XGTW_Supplies";
import XGTW_GamePanel from "./UI/XGTW_GamePanel";
import XGTW_HPBar from "./UI/XGTW_HPBar";
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import XGTW_Missile from './XGTW_Missile';
import { XGTW_AudioManager } from './XGTW_AudioManager';
import XGTW_GameManager, { GameMode } from './XGTW_GameManager';
import { XGTW_UIManager } from './Framework/Managers/XGTW_UIManager';
import { XGTW_ItemType, XGTW_Constant } from './Framework/Const/XGTW_Constant';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import NodeUtil from '../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from '../../../Scripts/GameManager';
import { EventManager, MyEvent } from '../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from './Framework/Managers/XGTW_Event';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_ItemData } from './Datas/XGTW_Data';
import { XGTW_AchievementManager, XGTW_EAchievement } from './Framework/Managers/XGTW_AchievementManager';
import { XGTW_DataManager } from './Framework/Managers/XGTW_DataManager';
export enum AniState {
    Idle = "Idle",
    Move = "Move",
    Hit = "Hit",
    Die = "Die"
}

@ccclass('XGTW_PlayerController')
export default class XGTW_PlayerController extends Component {
    static MAXHP = 600;
    static JJMAXHP = 2000;
    static oriPosition: Vec2 = v2();
    rigidbody: RigidBody2D | null = null;
    collider: CircleCollider2D | null = null;
    Doggie: Node;
    FirePos: Node;
    Gun: Node;
    GunSp: Sprite;
    HPBar: Node;
    Skin_Helmet: Sprite;
    Skin_Bulletproof: Sprite;
    Equip: Node;
    Equip_Helmet: Sprite;
    Equip_Bulletproof: Sprite;
    AimLine: Node;
    GunSpAni: Animation | null = null;
    x: number = 0;
    y: number = 0;
    isFire: boolean = false;
    needFire: boolean = false;
    isCooldown: boolean = true;//射击冷却
    isReload: boolean = false;//换弹
    cooldownTimer: number = 0;
    maxSpeed: number = 30;
    speed: number = 30;
    state: AniState = AniState.Idle;
    gun = null;
    fireDir: Vec2 = v2();
    hpBar: XGTW_HPBar = null;

    jjRevival: boolean = false;//机甲回血
    jjRevivalTimer: number = 0;

    jjSpeedUp: boolean = false;//机甲加速
    jjSpeedUpTimer: number = 0;

    private _hp = 0;
    public get HP(): number {
        return this._hp;
    }
    public set HP(value: number) {
        // console.error(`血量：${value}`);
        if (value <= 0) {
            value = 0;
            XGTW_AchievementManager.AddAchievementTimes(XGTW_EAchievement.菜就多练);

            if (XGTW_GameManager.GameMode == GameMode.TEAM) {
                XGTW_GamePanel.Instance.RefreshTeamScore(0, 1);
                XGTW_GameManager.Instance.InitPlayer();
            } else {
                XGTW_DataManager.PlayerData.Clear();
                EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                this.StopFire();
                this.StopMove();
                this.PlayAni(AniState.Die);
                XGTW_GameManager.IsGameOver = true;
                this.scheduleOnce(() => {
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.FailPanel, [this.hitBullet]);
                }, 2);
            }
        }
        this._hp = Tools.Clamp(value, 0, XGTW_GameManager.JJMode ? XGTW_PlayerController.JJMAXHP : XGTW_PlayerController.MAXHP);
        EventManager.Scene.emit(XGTW_Event.RefreshHP);
        this.hpBar?.Set(value / (XGTW_GameManager.JJMode ? XGTW_PlayerController.JJMAXHP : XGTW_PlayerController.MAXHP));
    }
    onLoad() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(CircleCollider2D);
        // this.rigidbody["_body"].syncPositionToPhysics(true);
        this.Gun = this.node.getChildByName("Gun");
        this.GunSp = NodeUtil.GetComponent("GunSp", this.node, Sprite);
        this.FirePos = NodeUtil.GetNode("FirePos", this.node);
        this.Doggie = NodeUtil.GetNode("Doggie", this.node);
        this.Skin_Helmet = NodeUtil.GetComponent("Skin_Helmet", this.node, Sprite);
        this.Skin_Bulletproof = NodeUtil.GetComponent("Skin_Bulletproof", this.node, Sprite);
        this.Equip = NodeUtil.GetNode("Equip", this.node);
        this.Equip_Helmet = NodeUtil.GetComponent("Equip_Helmet", this.node, Sprite);
        this.Equip_Bulletproof = NodeUtil.GetComponent("Equip_Bulletproof", this.node, Sprite);
        this.AimLine = NodeUtil.GetNode("AimLine", this.node);
        this.HPBar = NodeUtil.GetNode("HPBar", this.node);
        this.hpBar = this.HPBar.getComponent(XGTW_HPBar);
        this.GunSpAni = NodeUtil.GetComponent("GunSp", this.node, Animation);

        this.GunSpAni.on(Animation.EventType.FINISHED, () => {
            this.isReload = false;

            if (this.needFire) {
                this.Fire();
            }
        }, this);

        this.hpBar.Init();
        this.HP = XGTW_GameManager.JJMode ? XGTW_PlayerController.JJMAXHP : XGTW_PlayerController.MAXHP;

        XGTW_PlayerController.oriPosition.set(v2(this.node.getWorldPosition().x, this.node.getWorldPosition().y));

        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);//添加碰撞监听
    }

    start() {
        this.RefreshEquip();
    }

    RefreshEquip() {
        if (XGTW_GameManager.JJMode) {
            this.LoadGun(XGTW_DataManager.GetJiJiaGun());
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/个性化装扮/动力装甲`).then((sf: SpriteFrame) => {
                this.Skin_Bulletproof.spriteFrame = sf;
            });
            return;
        }

        this.gun = null;
        this.GunSp.spriteFrame = null;

        this.Equip_Helmet.node.active = XGTW_DataManager.PlayerData.Helmet != null;
        if (XGTW_DataManager.PlayerData.Helmet != null) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/${XGTW_DataManager.PlayerData.Helmet.Type}/${XGTW_DataManager.PlayerData.Helmet.Name}`).then((sf: SpriteFrame) => {
                this.Equip_Helmet.spriteFrame = sf;
            });
        }

        this.Equip_Bulletproof.node.active = XGTW_DataManager.PlayerData.Bulletproof != null;
        if (XGTW_DataManager.PlayerData.Bulletproof != null) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/${XGTW_DataManager.PlayerData.Bulletproof.Type}/${XGTW_DataManager.PlayerData.Bulletproof.Name}`).then((sf: SpriteFrame) => {
                this.Equip_Bulletproof.spriteFrame = sf;
            });
        }

        this.Skin_Helmet.node.active = !this.Equip_Helmet.node.active;
        if (this.Skin_Helmet.node.active) {
            if (XGTW_DataManager.PlayerData.Skin_Helmet != null) {
                BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/${XGTW_DataManager.PlayerData.Skin_Helmet.Type}/${XGTW_DataManager.PlayerData.Skin_Helmet.Name}`).then((sf: SpriteFrame) => {
                    this.Skin_Helmet.spriteFrame = sf;
                });
            }
        }

        this.Skin_Bulletproof.node.active = !this.Equip_Bulletproof.node.active;
        if (this.Skin_Bulletproof.node.active) {
            if (XGTW_DataManager.PlayerData.Skin_Bulletproof != null) {
                if (XGTW_DataManager.IsPieceSkin(XGTW_DataManager.PlayerData.Skin_Bulletproof.Name)) {
                    BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${XGTW_DataManager.PlayerData.Skin_Bulletproof.Type}/${XGTW_DataManager.PlayerData.Skin_Bulletproof.Name}`).then((sf: SpriteFrame) => {
                        this.Skin_Bulletproof.spriteFrame = sf;
                    });
                } else {
                    BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/${XGTW_DataManager.PlayerData.Skin_Bulletproof.Type}/${XGTW_DataManager.PlayerData.Skin_Bulletproof.Name}`).then((sf: SpriteFrame) => {
                        this.Skin_Bulletproof.spriteFrame = sf;
                    });
                }
            } else {
                this.Skin_Bulletproof.spriteFrame = null;
            }
        }

        let data = null;
        if (XGTW_DataManager.PlayerData.Weapon_0 != null) {
            data = XGTW_DataManager.PlayerData.Weapon_0;
        } else if (XGTW_DataManager.PlayerData.Weapon_1 != null) {
            data = XGTW_DataManager.PlayerData.Weapon_1;
        } else if (XGTW_DataManager.PlayerData.Pistol != null) {
            data = XGTW_DataManager.PlayerData.Pistol;
        } else if (XGTW_DataManager.PlayerData.MeleeWeapon != null) {
            data = XGTW_DataManager.PlayerData.MeleeWeapon;
        }

        this.LoadGun(data);
    }
    LoadGun(data) {
        this.AimLine.active = data && XGTW_ItemData.IsSniper(XGTW_ItemType[`${data.Type}`]);

        if (data) {
            let skin = XGTW_DataManager.GetEquipGunSkin(data);
            if (skin) {
                //加载枪的皮肤
                BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/${skin.Type}/${skin.Name}`).then((sf: SpriteFrame) => {
                    this.GunSp.spriteFrame = sf;
                });
            } else {
                //加载枪
                BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
                    this.GunSp.spriteFrame = sf;
                });
            }

            if (data.Type == XGTW_ItemType[XGTW_ItemType.近战]) {
                this.GunSp.node.setScale(Vec3.ONE);
            } else {
                this.FirePos.setPosition(v3(data.FirePosition.x, data.FirePosition.y));
            }

            this.gun = data;
        }
    }
    SetDir(x: number, y: number, rate: number) {
        if (XGTW_GameManager.IsGameOver) return;

        this.x = x;
        this.y = y;

        if (!this.isFire) {
            this.Doggie.scale = v3(this.x < 0 ? -1 : 1, this.Doggie.scale.y)

            if ((this.x < 0 ? -1 : 1) != this.Gun.scale.x) {
                this.Gun.scale = v3(this.x < 0 ? -1 : 1, this.Gun.scale.y);
                this.Gun.angle = -this.Gun.angle;
            }
        }

        this.speed = this.maxSpeed;
        this.PlayAni(AniState.Move);
    }
    SetGunDir(dir: Vec2) {
        if (XGTW_GameManager.IsGameOver) return;

        this.fireDir.set(dir);

        if (this.isFire) {
            this.Doggie.scale = v3(dir.x < 0 ? -1 : 1, this.Doggie.scale.y)
        }

        let angleRadians = Math.atan2(dir.y, dir.x);
        let angleDegrees = misc.radiansToDegrees(angleRadians);

        this.Gun.scale = v3((angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? -1 : 1, this.Gun.scale.y);
        this.Gun.angle = (angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? angleDegrees - 180 : angleDegrees;
    }
    StopMove() {
        this.x = 0;
        this.y = 0;
        if (this.rigidbody.enabled) {
            this.rigidbody.linearVelocity = v2(this.x, this.y);
        }
        this.PlayAni(AniState.Idle);
    }
    PlayAni(state: AniState) {
        if (XGTW_GameManager.IsGameOver) return;
        if (this.state == state) return;
        this.state = state;
    }
    update(dt) {
        if (XGTW_GameManager.IsGameOver) return;

        if (this.jjRevival) {
            this.HP += 3;
            this.jjRevivalTimer += dt;
            if (this.jjRevivalTimer >= 3 || this.HP == (XGTW_GameManager.JJMode ? XGTW_PlayerController.JJMAXHP : XGTW_PlayerController.MAXHP)) {
                this.jjRevivalTimer = 0;
                this.jjRevival = false;
            }
        }

        if (this.jjSpeedUp) {
            this.jjSpeedUpTimer += dt;
            this.maxSpeed = 50;
            if (this.jjSpeedUpTimer >= 3) {
                this.maxSpeed = 30;
                this.jjSpeedUpTimer = 0;
                this.jjSpeedUp = false;
            }
        }

        if (this.gun) {
            if (!this.isCooldown) {
                this.cooldownTimer += dt;
                if (this.cooldownTimer >= this.gun.FireRate) {
                    this.isCooldown = true;
                    this.cooldownTimer = 0;
                }
            }
        }

        if (this.rigidbody.enabled) {
            this.rigidbody.linearVelocity = v2(this.x * this.speed, this.y * this.speed);
        }
    }
    hitBullet: XGTW_Bullet = null;
    TakeDamage(bullet: XGTW_Bullet) {
        this.hitBullet = bullet;

        let damage = bullet.weapon.Damage;
        if (XGTW_GameManager.IsGameOver) return;

        let data, lv = 0;
        if (XGTW_DataManager.PlayerData.Bulletproof != null) {
            data = XGTW_DataManager.PlayerData.Bulletproof;
            lv += data.Quality;
            data.Durable -= damage / 50;
            if (data.Durable <= 0) {
                XGTW_DataManager.PlayerData.Bulletproof = null;
                EventManager.Scene.emit(XGTW_Event.RefreshEquip);
            }
        }

        if (XGTW_DataManager.PlayerData.Helmet != null) {
            data = XGTW_DataManager.PlayerData.Helmet;
            lv += data.Quality;
            data.Durable -= damage / 50;
            if (data.Durable <= 0) {
                XGTW_DataManager.PlayerData.Helmet = null;
                EventManager.Scene.emit(XGTW_Event.RefreshEquip);
            }
        }

        this.HP -= lv == 0 ? damage : damage / lv * 2;
    }
    Reload(data) {
        if (this.gun) {
            this.isReload = true;

            this.isFire = false;
            if (this.gun && (this.gun.Type == XGTW_ItemType[XGTW_ItemType.栓动步枪] || this.gun.Type == XGTW_ItemType[XGTW_ItemType.射手步枪])) {
                EventManager.Scene.emit(XGTW_Event.CameraZoomIn);
            }

            this.unschedule(this.StartFire);
            this.GunSpAni.play("Reload");
            this.gun.BulletCount = data.Count;
            EventManager.Scene.emit(XGTW_Event.RefreshBulletCount);
        }
    }
    Fire() {
        if (XGTW_GameManager.IsGameOver) return;
        this.isFire = true;
        this.needFire = true;

        if (!this.gun) return;
        if (this.isReload) return;

        if (this.gun.BulletCount <= 0) {
            UIManager.ShowTip("弹匣没有子弹");
            return;
        }

        if (XGTW_ItemData.IsSniper(XGTW_ItemType[`${this.gun.Type}`])) {
            let ratio = (this.gun.Type == XGTW_ItemType[XGTW_ItemType.栓动步枪] || this.gun.Type == XGTW_ItemType[XGTW_ItemType.射手步枪]) ? 600 : 850;
            EventManager.Scene.emit(XGTW_Event.CameraZoomOut, ratio);
            if (this.gun.Type == XGTW_ItemType[XGTW_ItemType.栓动步枪]) {
                return;
            }
        }

        if (this.isCooldown && !XGTW_ItemData.IsSniper(XGTW_ItemType[`${this.gun.Type}`])) {
            this.isCooldown = false;
            this.StartFire();
        }

        this.schedule(this.StartFire, this.gun.FireRate);
    }

    FireMissile() {
        if (XGTW_GameManager.IsGameOver) return;
        let delay = 0;
        for (let i = 0; i < 4; i++) {
            this.scheduleOnce(() => {
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/Missile", this.node).then(node => {
                    if (XGTW_GameManager.IsGameOver) return;
                    node.setWorldPosition(this.FirePos.getWorldPosition());
                    node.angle = this.Gun.scale.x < 0 ? this.Gun.angle - 180 : this.Gun.angle;
                    node.getComponent(XGTW_Missile).Init(this.node);
                });
            }, delay);
            delay += 0.3;
        }
    }

    results = null;
    MeleeAttack() {
        let startPosition = this.node.getWorldPosition();
        let endPosition = startPosition.add(v3(this.fireDir.normalize().multiplyScalar(180).x, this.fireDir.normalize().multiplyScalar(180).y));
        this.results = PhysicsSystem2D.instance.raycast(startPosition, endPosition, ERaycast2DType.Closest);
        if (this.results && this.results.length >= 1 && this.results[0].collider.node.getComponent(RigidBody2D).group == XGTW_Constant.Group.Enemy) {
            this.results[0].collider.node.getComponent(XGTW_EnemyController).TakeMeleeDamage(this.gun.Damage);
        }
    }

    StartFire() {
        if (XGTW_GameManager.IsGameOver) return;

        if (!this.gun) return;

        if (XGTW_ItemData.IsMeleeWeapon(XGTW_ItemData.GetItemType(this.gun.Type))) {
            this.MeleeAttack();
            return;
        }

        if (this.gun.BulletCount <= 0) {
            UIManager.ShowTip("没有子弹");
            return;
        }

        let bulletCount = this.gun.Type == XGTW_ItemType[XGTW_ItemType.霰弹枪] ? 5 : 1;

        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Fire);
        this.gun.BulletCount -= 1;
        EventManager.Scene.emit(XGTW_Event.RefreshBulletCount);

        this.FirePos.getComponent(Animation).play("Fire");

        for (let i = 0; i < bulletCount; i++) {
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/Bullet", this.node.parent, null, this.FirePos.getWorldPosition().clone()).then(node => {
                if (XGTW_GameManager.IsGameOver) return;
                let recoil = Tools.GetRandom(this.gun.Recoil * -10 * bulletCount, this.gun.Recoil * 10 * bulletCount);
                node.angle = this.Gun.scale.x < 0 ? this.Gun.angle + recoil - 180 : this.Gun.angle + recoil;
                node.getComponent(XGTW_Bullet).Init(this.node, this.gun, XGTW_DataManager.PlayerData);
            });
        }

        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/BulletBlank", this.node).then(node => {
            if (XGTW_GameManager.IsGameOver) return;
            node.setWorldPosition(v3(this.FirePos.getWorldPosition().clone().x - 50, this.FirePos.getWorldPosition().clone().y));
            node.getComponent(XGTW_Bullet).InitBlank(this.node, v2(-5 * this.Gun.scale.x, Tools.GetRandom(5, 8)).multiplyScalar(0.2));
        });
    }

    StopFire() {
        this.isFire = false;
        this.needFire = false;

        if (this.gun && (this.gun.Type == XGTW_ItemType[XGTW_ItemType.栓动步枪] || this.gun.Type == XGTW_ItemType[XGTW_ItemType.射手步枪])) {
            EventManager.Scene.emit(XGTW_Event.CameraZoomIn);
        }

        this.unschedule(this.StartFire);

        if (this.gun && this.gun.Type == XGTW_ItemType[XGTW_ItemType.栓动步枪] && this.isCooldown) {
            this.StartFire();
            this.isCooldown = false;
        }

    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "Supplies") {
            let supplies = otherCollider.node.getComponent(XGTW_Supplies);
            if (supplies && supplies.node.active) {
                EventManager.Scene.emit(XGTW_Event.ShowTakeSupplies, true, supplies);
            }
        }

        if (otherCollider.node.name == "DroppedItem") {
            EventManager.Scene.emit(XGTW_Event.ShowTakeItem, true, otherCollider.node.getComponent(XGTW_DroppedItem));
        }

        if (otherCollider.node.name == "Bullet") {
            let bullet = otherCollider.node.getComponent(XGTW_Bullet);
            if (bullet && bullet.weapon && this.gun != bullet.weapon) {
                this.TakeDamage(bullet);
                this.scheduleOnce(() => { PoolManager.PutNode(otherCollider.node); });
            }
        }

        if (otherCollider.node.name == "Evacuation") {
            EventManager.Scene.emit(XGTW_Event.Evacuation, true);
        }
    }
    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "Supplies") {
            EventManager.Scene.emit(XGTW_Event.ShowTakeSupplies, false);
        }
        if (otherCollider.node.name == "DroppedItem") {
            EventManager.Scene.emit(XGTW_Event.ShowTakeItem, false);
        }
        if (otherCollider.node.name == "Evacuation") {
            EventManager.Scene.emit(XGTW_Event.Evacuation, false);
        }
    }
    LogGunData() {
        let GunSp = NodeUtil.GetNode("GunSp", this.node);
        let type = "霰弹枪";
        for (let i = 1; i < GunSp.children.length; i++) {
            const e = GunSp.children[i];

            BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "Data").then((ja: JsonAsset) => {
                let data = ja.json as any;

                let t = data.霰弹枪.find(d => d.Name == e.name);
                // console.error(`{"Name": "${e.name}","Type": "${type}", "Qualitys": "${t.Qualitys}","Prices": "${t.Prices}","Durables": "${t.Durables}","Weight": ${t.Weight}, "Damage": ${t.Damage}, "FireRate": ${t.FireRate}, "Recoil": ${t.Recoil}, "Desc": "${t.Desc}","FirePosition": "${e.children[0].getPosition().x},${e.children[0].getPosition().y}"},`);
            });
        }
    }
    protected onEnable(): void {
        EventManager.Scene.on(MyEvent.MOVEMENT, this.SetDir, this);
        EventManager.Scene.on(MyEvent.MOVEMENT_STOP, this.StopMove, this);
        EventManager.Scene.on(MyEvent.SET_ATTACK_DIR, this.SetGunDir, this);
        EventManager.Scene.on(MyEvent.Start_Fire, this.Fire, this);
        EventManager.Scene.on(MyEvent.Stop_Fire, this.StopFire, this);
        EventManager.Scene.on(XGTW_Event.RefreshEquip, this.RefreshEquip, this);
    }
    protected onDisable(): void {
        EventManager.Scene.off(MyEvent.MOVEMENT, this.SetDir, this);
        EventManager.Scene.off(MyEvent.MOVEMENT_STOP, this.StopMove, this);
        EventManager.Scene.off(MyEvent.SET_ATTACK_DIR, this.SetGunDir, this);
        EventManager.Scene.off(MyEvent.Start_Fire, this.Fire, this);
        EventManager.Scene.off(MyEvent.Stop_Fire, this.StopFire, this);
        EventManager.Scene.off(XGTW_Event.RefreshEquip, this.RefreshEquip, this);
    }
}