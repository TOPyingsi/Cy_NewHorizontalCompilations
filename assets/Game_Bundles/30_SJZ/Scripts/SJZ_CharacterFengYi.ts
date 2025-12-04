import { _decorator, Vec2, v2, Node, Collider2D, v3, misc, math, Contact2DType, PhysicsSystem2D, ERaycast2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

import SJZ_CharacterController, { PlayerAniState } from './SJZ_CharacterController';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_Constant } from './SJZ_Constant';
import { SJZ_DataManager } from './SJZ_DataManager';
import { SJZ_AmmoData, SJZ_EquipData, SJZ_ItemData } from './SJZ_Data';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import SJZ_Bullet from './SJZ_Bullet';
import { SJZ_PoolManager } from './SJZ_PoolManager';
import SJZ_GamePanel from './UI/SJZ_GamePanel';
import { SJZ_LvManager } from './SJZ_LvManager';
import { SJZ_GameManager } from './SJZ_GameManager';
import { SJZ_FloatingText } from './UI/SJZ_FloatingText';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_UIManager } from './UI/SJZ_UIManager';
import { SJZ_Audio, SJZ_AudioManager } from './SJZ_AudioManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';

const v3_0 = v3();

@ccclass('SJZ_CharacterFengYi')
export default class SJZ_CharacterFengYi extends SJZ_CharacterController {
    guideTarget: Node = null;

    // 在类定义上方添加属性
    @property
    rollSpeed: number = 80;
    @property
    rollDuration: number = 0.3;
    @property
    rollRotationSpeed: number = 360; // 每秒旋转度数
    private _wasForcedRollDirection: boolean = false; // 新增属性

    private _isRolling: boolean = false;
    private _rollTimer: number = 0;
    private _targetRotation: number = 0;
    private _currentRotation: number = 0;
    private _rotationDirection: number = 1;

    public get HP(): number {
        return this._hp;
    }
    public set HP(value: number) {
        if (value <= 0) {
            if (SJZ_LvManager.Instance.MapName == "训练场") {
                value = 1;
            } else {
                value = 0;
                this.Die()
            }
        }

        this._hp = Tools.Clamp(value, 0, this.MaxHP);
        this.hpBar?.Set(this._hp / this.MaxHP);
    }

    protected Die(): void {
        this.PlayAni(0, PlayerAniState.Dead, false);
        SJZ_GameManager.IsGameOver = true;
        this.StopFire();
        this.StopMove();
        this.scheduleOnce(() => {
            SJZ_DataManager.PlayerData.ClearBackpack();
            SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.GameOverPanel, [false, SJZ_LvManager.Instance.matchData]);
        }, 2);
    }

    onLoad() {
        super.onLoad();
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);

        this.AddSpineListener();
        this.RigistEvent();

        this.HP = 600;
    }

    start() {
        this.spine.setSkin("dog");
        this.hpBar = SJZ_GamePanel.Instance.HPBar;
        this.RefreshEquip();
    }

    RefreshEquip() {
        let helmet: string = "", bodyArmor: string = "", backpack: string = "";
        if (SJZ_DataManager.PlayerData.Weapon_Helmet) helmet = SJZ_DataManager.PlayerData.Weapon_Helmet.Name;
        if (SJZ_DataManager.PlayerData.Weapon_BodyArmor) bodyArmor = SJZ_DataManager.PlayerData.Weapon_BodyArmor.Name;
        if (SJZ_DataManager.PlayerData.BackpackData) backpack = SJZ_DataManager.PlayerData.BackpackData.Name;

        let gun: SJZ_ItemData = this.weapon;

        if (!gun) {
            if (SJZ_DataManager.PlayerData.Weapon_Primary) gun = SJZ_DataManager.PlayerData.Weapon_Primary;
            else if (SJZ_DataManager.PlayerData.Weapon_Secondary) gun = SJZ_DataManager.PlayerData.Weapon_Secondary;
            else if (SJZ_DataManager.PlayerData.Weapon_Pistol) gun = SJZ_DataManager.PlayerData.Weapon_Pistol;
        }

        if (gun) this.SetGun(gun);
        else this.SetMeelee();

        this.SetEquipment(helmet, bodyArmor, backpack);
    }

    Roll() {
        if (this._isRolling) return;
        
        this._isRolling = true;
        this._rollTimer = this.rollDuration;
        this._wasForcedRollDirection = this.dir.length() === 0; // 记录是否为强制方向
        // this.PlayAni(1, PlayerAniState.Roll, false);
        this.character.getChildByName("Spine").active = false;
        this.character.getChildByName("roll").active = true;

        
        // 根据当前朝向设置初始旋转方向
        const rollDir = this.dir.length() > 0 ? this.dir : 
            v2(this.character.scale.x < 0 ? -1 : 1, 0); // 静止时使用角色朝向
        this._rotationDirection = rollDir.x < 0 ? 1 : -1;
        this._targetRotation = this._rotationDirection * 360;
        this._currentRotation = 0;
        
        this.dir = rollDir.normalize();
        this.speed = this.rollSpeed;
    }


    SetDir(x: number, y: number, rate: number) {
        if (SJZ_GameManager.IsGameOver) return;
        if (this._isRolling) {
            this.dir.set(x, y);
            return;
        }
        super.SetDir(x, y, rate);
    }

    SetGunDir(dir: Vec2) {
        if (SJZ_GameManager.IsGameOver) return;
        super.SetGunDir(dir);
    }

    StopMove() {
        super.StopMove();
    }

    update(dt) {
        if (SJZ_GameManager.IsGameOver) return;


        if (this._isRolling) {
            // 动态调整旋转方向
            if (this.dir.length() > 0) {
                const newDirection = this.dir.x < 0 ? 1 : -1;
                if (newDirection !== this._rotationDirection) {
                    this._rotationDirection = newDirection;
                    this._targetRotation = this._currentRotation + (newDirection * 360);
                }
            }
            
            // 根据剩余时间和角度计算当前帧旋转速度
            const remainingRotation = this._targetRotation - this._currentRotation;
            const rotationSpeed = remainingRotation / this._rollTimer;
            const rotationStep = rotationSpeed * dt;
            this._currentRotation += rotationStep;
            
            // 应用旋转
            this.character.angle = this._currentRotation;
            
            this._rollTimer -= dt;
            if (this._rollTimer <= 0) {
                this._isRolling = false;
                // this.speed = this.maxSpeed;
                this.character.angle = 0; // 回正
                this.StopAni(1);
                this.character.getChildByName("Spine").active = true;
                this.character.getChildByName("roll").active = false;

                // 修改判断逻辑
                if (!this._wasForcedRollDirection && this.dir.length() > 0) {
                    this.speed = this.maxSpeed;
                } else {
                    this.StopMove();
                }
            }
        }
        super.update(dt);
    }

    Fire() {
        if (SJZ_GameManager.IsGameOver) return;
        this.isFire = true;
        this.schedule(this.StartFire, 0.1);
    }

    MeleeAttack(): void {
        console.log("近战攻击");
        let startPosition = this.node.getWorldPosition().clone();
        let endPosition = startPosition.clone().add(v3(this.fireDir.normalize().multiplyScalar(180).x, this.fireDir.normalize().multiplyScalar(180).y));

        this.results = PhysicsSystem2D.instance.raycast(startPosition, endPosition, ERaycast2DType.Closest);
        if (this.results && this.results.length >= 1 && this.results[0].collider.group == SJZ_Constant.Group.Enemy) {
            this.results[0].collider.node.getComponent(SJZ_CharacterController).TakeMeleeDamage(10);
        }
    }

    Reload(reloadCallback?: Function): void {
        this.reloadCallback = reloadCallback;
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.Reload);
        this.PlayAni(1, PlayerAniState.Reload, false);
    }

    StartFire() {
        if (SJZ_GameManager.IsGameOver) return;

        if (this.useMelee) {
            this.PlayAni(1, PlayerAniState.Attack)
            return;
        }

        if (!this.weapon) {
            return;
        }

        if (!this.weapon.WeaponData.Ammo) {
            this.StopAni(1)
            return;
        }

        if (this.weapon.WeaponData.Ammo.Count <= 0) {
            this.StopFire();
            UIManager.ShowTip("没有子弹");
            return;
        }

        if (!this.useMelee) {
            SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.Fire);
            this.PlayAni(1, PlayerAniState.Shoot)
        }

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

    StopFire() {
        super.StopFire();
    }

    TakeDamage(weapon: SJZ_ItemData, ammo: SJZ_ItemData): void {
        if (SJZ_GameManager.IsGameOver) return;

        //伤害=枪械伤害*穿透比
        //护甲伤害=枪械伤害*(1-穿透比)

        //基础的伤害
        let damage = weapon.WeaponData.Damage / 4;

        const ArmorDamage = (data: SJZ_EquipData, quality: number, damage: number): number => {
            let armorDamage = Math.floor(damage * (1 - SJZ_AmmoData.GetDamage(ammo.AmmoData, quality)) / 2);
            data.Durability -= armorDamage;
            data.Durability = misc.clampf(data.Durability, 0, 99999);

            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.FloatingText, SJZ_LvManager.Instance.Game);
            node.setWorldPosition(v3(this.node.worldPosition.x + math.random() * 20, this.node.worldPosition.y + 100 + math.random() * 20, 0));
            node.getComponent(SJZ_FloatingText).Show(`护甲 -${armorDamage}`, "#FFAD00", "#AC0000", 0.3);

            EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_WEAON_CONTENT);
            return damage * SJZ_AmmoData.GetDamage(ammo.AmmoData, quality);
        }

        let taked: boolean = false;


        if (SJZ_DataManager.PlayerData.Weapon_Helmet && math.random() < 0.5) {
            taked = true;
            let quality = SJZ_DataManager.PlayerData.Weapon_Helmet.Quality;

            //甲的耐久>0才有效果
            if (SJZ_DataManager.PlayerData.Weapon_Helmet.EquipData.Durability > 0) {
                damage = ArmorDamage(SJZ_DataManager.PlayerData.Weapon_Helmet.EquipData, quality, damage);
            }
        }

        if (SJZ_DataManager.PlayerData.Weapon_BodyArmor && !taked && math.random() < 0.5) {
            let quality = SJZ_DataManager.PlayerData.Weapon_BodyArmor.Quality;

            //甲的耐久>0才有效果
            if (SJZ_DataManager.PlayerData.Weapon_BodyArmor.EquipData.Durability > 0) {
                damage = ArmorDamage(SJZ_DataManager.PlayerData.Weapon_BodyArmor.EquipData, quality, damage);
            }
        }

        let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.FloatingText, this.node);
        node.setWorldPosition(v3(this.node.worldPosition.x + math.random() * 20, this.node.worldPosition.y + 100 + math.random() * 20, 0));
        node.getComponent(SJZ_FloatingText).Show(`-${damage}`, "#FF0000", "#AC0000", 0.3);

        this.HP -= damage;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "Supplies") {
        }

        if (otherCollider.node.name == "DroppedItem") {
        }

        if (otherCollider.node.name == "Bullet") {
            let bullet = otherCollider.node.getComponent(SJZ_Bullet);
            if (bullet.weapon == SJZ_GameManager.Instance.player.weapon) return;

            const worldManifold = contact.getWorldManifold();
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Explosion, SJZ_LvManager.Instance.Game);
            node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
            node.angle = misc.radiansToDegrees(v2(0, 1).signAngle(worldManifold.normal.negative())) - 90;

            if (bullet && bullet.weapon) {
                this.TakeDamage(bullet.weapon, bullet.ammo);
                this.scheduleOnce(() => { SJZ_PoolManager.Instance.Put(otherCollider.node); });
            }
        }

        if (otherCollider.node.name == "Missile") {
            const worldManifold = contact.getWorldManifold();
            SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.MissileExplosion);
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.MissileExplosion, SJZ_LvManager.Instance.Game);
            node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
            this.scheduleOnce(() => {
                SJZ_PoolManager.Instance.Put(otherCollider.node);
            });

            let FloatingText = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.FloatingText, this.node);
            FloatingText.setWorldPosition(v3(this.node.worldPosition.x + math.random() * 20, this.node.worldPosition.y + 100 + math.random() * 20, 0));
            FloatingText.getComponent(SJZ_FloatingText).Show(`-${30}`, "#FF0000", "#AC0000", 0.3);
            this.HP -= 30;
        }

        if (otherCollider.node.name == "Evacuation") {
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "Supplies") {
        }
        if (otherCollider.node.name == "DroppedItem") {
        }
        if (otherCollider.node.name == "Evacuation") {

        }
    }

    protected onDisable(): void {
        this.UnrigistEvent();
    }

    protected onDestroy(): void {
        SJZ_GameManager.Instance.player = null;
    }

    protected RigistEvent(): void {
        EventManager.Scene.on(SJZ_Constant.Event.MOVEMENT, this.SetDir, this);
        EventManager.Scene.on(SJZ_Constant.Event.Roll, this.Roll, this);
        EventManager.Scene.on(SJZ_Constant.Event.MOVEMENT_STOP, this.StopMove, this);
        EventManager.Scene.on(SJZ_Constant.Event.SET_ATTACK_DIR, this.SetGunDir, this);
        EventManager.Scene.on(SJZ_Constant.Event.FIRE_START, this.Fire, this);
        EventManager.Scene.on(SJZ_Constant.Event.FIRE_STOP, this.StopFire, this);
        EventManager.Scene.on(SJZ_Constant.Event.REFRESH_EUIP, this.RefreshEquip, this);
    }

    protected UnrigistEvent(): void {
        EventManager.Scene.off(SJZ_Constant.Event.MOVEMENT, this.SetDir, this);
        EventManager.Scene.off(SJZ_Constant.Event.Roll, this.Roll, this);
        EventManager.Scene.off(SJZ_Constant.Event.MOVEMENT_STOP, this.StopMove, this);
        EventManager.Scene.off(SJZ_Constant.Event.SET_ATTACK_DIR, this.SetGunDir, this);
        EventManager.Scene.off(SJZ_Constant.Event.FIRE_START, this.Fire, this);
        EventManager.Scene.off(SJZ_Constant.Event.FIRE_STOP, this.StopFire, this);
        EventManager.Scene.off(SJZ_Constant.Event.REFRESH_EUIP, this.RefreshEquip, this);
    }
}