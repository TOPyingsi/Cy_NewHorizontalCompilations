import { _decorator, Component, Vec2, v2, RigidBody2D, Node, Sprite, Animation, Collider2D, CircleCollider2D, SpriteFrame, Vec3, v3, misc, director, JsonAsset, PhysicsSystem2D, ERaycast2DType, Contact2DType, IPhysics2DContact, sp, UITransform, find, math } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { SJZ_GameManager } from './SJZ_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_Constant } from './SJZ_Constant';
import { SJZ_PoolManager } from './SJZ_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import SJZ_Bullet from './SJZ_Bullet';
import { SJZ_AmmoData, SJZ_EquipData, SJZ_ItemData, SJZ_ItemType } from './SJZ_Data';
import SJZ_GunFire from './SJZ_GunFire';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import SJZ_HPBar from './UI/SJZ_HPBar';
import { SJZ_LvManager } from './SJZ_LvManager';
import { SJZ_FloatingText } from './UI/SJZ_FloatingText';
import { SJZ_DataManager } from './SJZ_DataManager';
import { SJZ_Audio, SJZ_AudioManager } from './SJZ_AudioManager';
const { ccclass, property } = _decorator;

const v3_0 = v3();

export enum PlayerAniState {
    None = "None",
    Idle = "待机",
    Hit = "受击",
    Shoot = "开枪",
    Dead = "死亡",
    Move = "移动",
    Attack = "近战",
    Reload = "换弹",
    Roll = "翻滚",
    LS_Idle = "leisi/Standby",
    LS_Shoot = "leisi/sj",
    LS_Move = "leisi/walk-loop",
    LS_Attack = "leisi/zhouji",
}

@ccclass('SJZ_CharacterController')
export default class SJZ_CharacterController extends Component {
    MaxHP = 600;

    rigidbody: RigidBody2D | null = null;
    collider: CircleCollider2D | null = null;
    character: Node = null;
    spine: sp.Skeleton = null;
    spineTrans: UITransform = null;

    gunBone: sp.spine.Bone = null;

    hpBar: SJZ_HPBar = null;

    isPlayer: boolean = false;
    isFire: boolean = false;

    maxSpeed: number = 20;
    speed: number = 20;
    dir: Vec2 = v2();
    fireDir: Vec2 = v2();

    aniMap: Map<number, sp.spine.TrackEntry> = new Map();

    weapon: SJZ_ItemData = null;

    reloadCallback: Function = null;

    useMelee: boolean = false;

    results = null;

    protected _hp = 0;
    public get HP(): number {
        return this._hp;
    }
    public set HP(value: number) {
        if (value <= 0) {
            value = 0;
            this.Die()
        }

        this._hp = Tools.Clamp(value, 0, this.MaxHP);
        this.hpBar?.Set(this._hp / this.MaxHP);
    }

    onLoad() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(CircleCollider2D);
        this.character = NodeUtil.GetNode("Character", this.node);
        this.spine = NodeUtil.GetComponent("Spine", this.node, sp.Skeleton);
        this.spineTrans = this.spine.node.getComponent(UITransform);

        this.gunBone = this.spine.findBone("rotation");

        this.SetAniMix(PlayerAniState.Idle, PlayerAniState.Move);
        this.SetAniMix(PlayerAniState.Hit, PlayerAniState.Shoot);
    }

    SetAniMix(anim1: string, anim2: string) {
        this.spine?.setMix(anim1, anim2, 0.2);
        this.spine?.setMix(anim2, anim1, 0.2);
    }

    SetGun(weapon: SJZ_ItemData) {
        this.weapon = weapon;

        if (weapon) {
            this.useMelee = false;
            let name = weapon.Name;
            if (!Tools.IsEmptyStr(SJZ_DataManager.GetGunUseSkin(weapon.Name))) {
                name = `${SJZ_DataManager.GetGunUseSkin(weapon.Name)}`;
            }
            this.spine.setAttachment("gun", name);
        }
    }

    SetMeelee() {
        this.useMelee = true;
        this.spine.setAttachment("gun", "刀");
    }

    SetEquipment(helmet: string = "", bodyArmor: string = "", backpack: string = "") {
        console.log("装备：", "头盔=" + helmet, "护甲=" + bodyArmor, "背包=" + backpack);
        this.spine.setAttachment("tk", helmet);
        this.spine.setAttachment("hj", bodyArmor);
        this.spine.setAttachment("bb", backpack);
    }

    Reload(reloadCallback: Function = null) {
        this.reloadCallback = reloadCallback;
        this.PlayAni(1, PlayerAniState.Reload, false);
    }

    SetDir(x: number, y: number, rate: number) {
        this.dir.set(x, y);
        if (!this.isFire) {
            this.character.scale = v3(x < 0 ? -1 : 1, 1);
        }

        this.speed = rate * this.maxSpeed;
        this.PlayAni(0, PlayerAniState.Move);
    }

    StopMove() {
        this.speed = 0;
        this.dir.set(Vec2.ZERO);

        if (this.rigidbody.enabled) {
            this.rigidbody.linearVelocity = v2(this.dir.x, this.dir.y);
        }

        this.PlayAni(0, PlayerAniState.Idle);
    }

    SetGunDir(dir: Vec2) {
        if (SJZ_GameManager.IsGameOver) return;

        this.fireDir.set(dir);

        // 始终根据方向更新角色朝向，无论是否在开火状态
        this.character.scale = v3(dir.x < 0 ? -1 : 1, 1);

        // 计算旋转角度时考虑角色朝向
        const scaleSign = this.character.scale.x < 0 ? -1 : 1;
        const adjustedX = dir.x * scaleSign; // 将方向转换到本地坐标系
        let angle = Math.atan2(dir.y, adjustedX) * 180 / Math.PI;

        // 设置武器骨骼的旋转
        this.gunBone.rotation = angle;
    }

    SetSkin(skin: string) {
        this.spine!.setSkin(skin);
    }

    Fire() {
        if (SJZ_GameManager.IsGameOver) return;
        this.isFire = true;
        this.schedule(this.StartFire, 0.1);
    }

    StartFire() {
        if (SJZ_GameManager.IsGameOver) return;

        if (this.useMelee) {
            this.PlayAni(1, PlayerAniState.Attack)
        }

        if (!this.weapon) {
            return;
        }

        if (!this.weapon.WeaponData.Ammo || this.weapon.WeaponData.Ammo.Count <= 0) {
            this.StopAni(1)
            return;
        }

        if (!this.useMelee) {
            this.PlayAni(1, PlayerAniState.Shoot)
        }

        // if (XGTW_ItemData.IsMeleeWeapon(XGTW_ItemData.GetItemType(this.gun.Type))) {
        //     this.MeleeAttack();
        //     return;
        // }

        // let bulletCount = this.gun.Type == XGTW_ItemType[XGTW_ItemType.霰弹枪] ? 5 : 1;
        let bulletCount = 1;

        // XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Fire);
        this.weapon.WeaponData.Ammo.Count -= 1;
        EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_WEAON_CONTENT);

        const fireBone = this.spine.findBone(this.weapon.Name);

        for (let i = 0; i < bulletCount; i++) {
            let Bullet = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Bullet, SJZ_LvManager.Instance.Layer_Effects);
            Bullet.setWorldPosition(this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0)));

            // let recoil = Tools.GetRandom(this.gun.Recoil * -10 * bulletCount, this.gun.Recoil * 10 * bulletCount);
            // node.angle = this.Gun.scale.x < 0 ? this.Gun.angle + recoil - 180 : this.Gun.angle + recoil;
            Bullet.angle = this.character.scale.x < 0 ? 180 - this.gunBone.rotation : this.gunBone.rotation;
            Bullet.getComponent(SJZ_Bullet).Init(this, this.weapon, this.weapon.WeaponData.Ammo, null);
        }

        let BulletBlank = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.BulletBlank, SJZ_LvManager.Instance.Layer_Effects);
        this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0), v3_0);
        BulletBlank.setWorldPosition(v3_0);
        BulletBlank.getComponent(SJZ_Bullet).InitBlank(this, v2(-5 * this.character.scale.x, Tools.GetRandom(5, 8)).multiplyScalar(0.2));
    }

    protected Die() {
    }

    StopFire() {
        this.isFire = false;
        this.unschedule(this.StartFire);
        this.StopAni(1);
    }

    PlayAni(track: number, state: PlayerAniState, loop: boolean = true, timeScale: number = 1) {
        if (SJZ_GameManager.IsGameOver) return;

        if (!this.aniMap.has(track)) {
            this.aniMap.set(track, null);
        }

        if (this.aniMap.get(track) && this.aniMap.get(track).animation.name == state && this.aniMap.get(track).timeScale == timeScale) {
            return;
        }

        const trackEntry: sp.spine.TrackEntry = this.spine.setAnimation(track, state, loop);
        if (trackEntry) {
            trackEntry.timeScale = timeScale;
            this.aniMap.set(track, trackEntry);
        } else {
            console.error(`${this.node.name} 上没有 ${state} 状态`);
        }

    }

    StopAni(track: number) {
        this.aniMap.set(track, null);
        this.spine?.clearTrack(track);
    }

    TakeDamage(weapon: SJZ_ItemData, ammo: SJZ_ItemData) {
        if (SJZ_GameManager.IsGameOver) return;

        //基础的伤害
        let damage = weapon.WeaponData.Damage / 2;

        let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.FloatingText, this.node);
        node.setWorldPosition(v3(this.node.worldPosition.x + math.random() * 20, this.node.worldPosition.y + 100 + math.random() * 20, 0));
        node.getComponent(SJZ_FloatingText).Show(`-${damage}`, "#FF0000", "#AC0000", 0.3);

        this.HP -= damage;
    }

    MeleeAttack() { }

    TakeMeleeDamage(damage: number) {
        let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.FloatingText, this.node);
        node.setWorldPosition(v3(this.node.worldPosition.x + math.random() * 20, this.node.worldPosition.y + 100 + math.random() * 20, 0));
        node.getComponent(SJZ_FloatingText).Show(`-${damage}`, "#FF0000", "#AC0000", 0.3);
        this.HP -= damage;
    }

    update(dt) {
        if (this.rigidbody.enabled) {
            this.rigidbody.linearVelocity = v2(this.dir.x * this.speed, this.dir.y * this.speed);
        }
    }

    AddSpineListener() {
        //用来设置开始播放动画的事件监听
        this.spine!.setStartListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            // console.log("[track %s][animation %s] start.", trackEntry.trackIndex, animationName);
        });
        //用来设置动画被打断的事件监听
        this.spine!.setInterruptListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            console.log("[track %s][animation %s] interrupt.", trackEntry.trackIndex, animationName);
        });
        //用来设置动画播放完后的事件监听
        this.spine!.setEndListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            console.log("[track %s][animation %s] end.", trackEntry.trackIndex, animationName);
        });
        //用来设置动画将被销毁的事件监听
        this.spine!.setDisposeListener(trackEntry => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";
            console.log("[track %s][animation %s] will be disposed.", trackEntry.trackIndex, animationName);
        });
        //用来设置动画播放一次循环结束后的事件监听
        this.spine!.setCompleteListener((trackEntry) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";

            var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);

            // //枪火动画
            // if (animationName == PlayerAniState.Shoot) {
            //     const fireBone = this.spine.findBone("AK-12");
            //     let GunFire = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.GunFire, find("Canvas"));
            //     GunFire.setWorldPosition(this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0)));
            //     GunFire.angle = this.character.scale.x < 0 ? 180 - this.gunBone.rotation : this.gunBone.rotation;

            //     GunFire.getComponent(SJZ_GunFire).Play();
            // }

            // console.log("[track %s][animation %s] complete: %s", trackEntry.trackIndex, animationName, loopCount);
        });
        //用来设置动画播放过程中帧事件的监听
        this.spine!.setEventListener(((trackEntry: any, event: any) => {
            var animationName = trackEntry.animation ? trackEntry.animation.name : "";

            //播放枪火动画
            if (event.data.name == "fire") {
                // const fireBone = this.spine.findBone("AK-12");
                // let GunFire = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.GunFire, find("Canvas"));
                // GunFire.setWorldPosition(this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0)));
                // GunFire.angle = this.character.scale.x < 0 ? 180 - this.gunBone.rotation : this.gunBone.rotation;

                // GunFire.getComponent(SJZ_GunFire).Play();
            }

            //换弹
            if (event.data.name == "Replenish") {
                this.reloadCallback && this.reloadCallback();
                this.reloadCallback = null;
            }

            //近战攻击1
            if (event.data.name == "jj1") {
                this.MeleeAttack();
            }

            //近战攻击2
            if (event.data.name == "jj2") {
                this.MeleeAttack();
            }


            // console.log("[track %s][animation %s] event: %s, %s, %s, %s", trackEntry.trackIndex, animationName, event.data.name, event.intValue, event.floatValue, event.stringValue);
        }) as any);

    }


    CheckSpine() {
        for (let i = 0; i < SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Weapon).length; i++) {
            let data = SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Weapon)[i];
            let gun = this.spine.getAttachment("gun", data.Name);
            if (!gun) {
                console.error(`找不到枪皮肤 Name: ${data.Name}`);
            }

            let fireBone = this.spine.findBone(data.Name);
            if (!fireBone) {
                console.error(`找不到枪口骨骼 Name: ${data.Name}`);
            }
        }

        for (let i = 0; i < SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Helmet).length; i++) {
            let gun = this.spine.getAttachment("tk", SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Helmet)[i].Name);
            if (!gun) {
                console.error(SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Helmet)[i].Name);
            }
        }

        for (let i = 0; i < SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.BodyArmor).length; i++) {
            let gun = this.spine.getAttachment("hj", SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.BodyArmor)[i].Name);
            if (!gun) {
                console.error(SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.BodyArmor)[i].Name);
            }
        }

        for (let i = 0; i < SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Backpack).length; i++) {
            let gun = this.spine.getAttachment("bb", SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Backpack)[i].Name);
            if (!gun) {
                console.error(SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Backpack)[i].Name);
            }
        }
    }

    DebugSlot() {
        this.spine!.debugSlots = !this.spine?.debugSlots;
        this.spine!.debugBones = !this.spine?.debugBones;
        this.spine!.debugMesh = !this.spine?.debugMesh;
        this.spine!.useTint = !this.spine?.useTint;
    }
}