import { _decorator, Vec2, v2, Node, Collider2D, v3, misc, math, Contact2DType, PhysicsSystem2D, ERaycast2DType, IPhysics2DContact } from 'cc';
const { ccclass, property } = _decorator;

import XGTS_CharacterController, { PlayerAniState } from './XGTS_CharacterController';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_Constant } from './XGTS_Constant';
import { XGTS_DataManager } from './XGTS_DataManager';
import { XGTS_AmmoData, XGTS_EquipData, XGTS_ItemData } from './XGTS_Data';
import { XGTS_ArrowGuide } from './UI/XGTS_ArrowGuide';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import XGTS_Bullet from './XGTS_Bullet';
import { XGTS_PoolManager } from './XGTS_PoolManager';
import XGTS_GamePanel from './UI/XGTS_GamePanel';
import { XGTS_LvManager } from './XGTS_LvManager';
import { XGTS_GameManager } from './XGTS_GameManager';
import { XGTS_FloatingText } from './UI/XGTS_FloatingText';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTS_UIManager } from './UI/XGTS_UIManager';
import { XGTS_Audio, XGTS_AudioManager } from './XGTS_AudioManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XGTS_GameData } from './XGTS_GameData';

const v3_0 = v3();

@ccclass('XGTS_CharacterFengYi')
export default class XGTS_CharacterFengYi extends XGTS_CharacterController {

    Arrow: Node = null;

    guideTarget: Node = null;

    isEnemy: boolean = false;

    public get HP(): number {
        return this._hp;
    }
    public set HP(value: number) {
        if (value <= 0) {
            if (XGTS_LvManager.Instance.MapName == "训练场") {
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
        XGTS_GameManager.IsGameOver = true;
        this.isDie = true;
        this.StopFire();
        this.StopMove();
        this.PlayAni(0, PlayerAniState.Dead, false);
        this.scheduleOnce(() => {
            XGTS_DataManager.PlayerDatas[0].ClearBackpack();
            XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.GameOverPanel, [false, XGTS_LvManager.Instance.matchData]);
        }, 2);
    }

    onLoad() {
        super.onLoad();
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);

        this.Arrow = NodeUtil.GetNode("Arrow", this.node);

        this.AddSpineListener();
        this.RigistEvent();

        this.MaxHP = 600 + XGTS_GameData.Instance.AddHp;
        this.HP = 600 + XGTS_GameData.Instance.AddHp;
        this.speed = this.speed * (1 + (XGTS_GameData.Instance.AddSpeed / 100));
        this.maxSpeed = this.maxSpeed * (1 + (XGTS_GameData.Instance.AddSpeed / 100));
    }

    start() {
        this.spine.setSkin("dog");
        this.hpBar = XGTS_GamePanel.Instance.HPBar;
        this.RefreshEquip();
    }

    RefreshEquip() {
        let helmet: string = "", bodyArmor: string = "", backpack: string = "";
        if (XGTS_DataManager.PlayerDatas[0].Weapon_Helmet) helmet = XGTS_DataManager.PlayerDatas[0].Weapon_Helmet.Name;
        if (XGTS_DataManager.PlayerDatas[0].Weapon_BodyArmor) bodyArmor = XGTS_DataManager.PlayerDatas[0].Weapon_BodyArmor.Name;
        if (XGTS_DataManager.PlayerDatas[0].BackpackData) backpack = XGTS_DataManager.PlayerDatas[0].BackpackData.Name;

        let gun: XGTS_ItemData = this.weapon;

        if (!gun) {
            if (XGTS_DataManager.PlayerDatas[0].Weapon_Primary) gun = XGTS_DataManager.PlayerDatas[0].Weapon_Primary;
            else if (XGTS_DataManager.PlayerDatas[0].Weapon_Secondary) gun = XGTS_DataManager.PlayerDatas[0].Weapon_Secondary;
            else if (XGTS_DataManager.PlayerDatas[0].Weapon_Pistol) gun = XGTS_DataManager.PlayerDatas[0].Weapon_Pistol;
        }
        if (gun) {
            this.SetGun(gun);
        }
        else this.SetMeelee();
        this.SetEquipment(helmet, bodyArmor, backpack);
    }

    SetDir(x: number, y: number, rate: number) {
        if (XGTS_GameManager.IsGameOver) return;
        super.SetDir(x, y, rate);
    }

    SetGunDir(dir: Vec2) {
        if (XGTS_GameManager.IsGameOver) return;
        super.SetGunDir(dir);
    }

    StopMove() {
        super.StopMove();
    }

    update(dt) {
        if (XGTS_GameManager.IsGameOver) return;
        super.update(dt);
    }

    Fire() {
        if (XGTS_GameManager.IsGameOver) return;
        this.isFire = true;
        this.schedule(this.StartFire, 0.1);
    }

    MeleeAttack(): void {
        console.log("近战攻击");
        let startPosition = this.node.getWorldPosition().clone();
        let endPosition = startPosition.clone().add(v3(this.fireDir.normalize().multiplyScalar(180).x, this.fireDir.normalize().multiplyScalar(180).y));

        this.results = PhysicsSystem2D.instance.raycast(startPosition, endPosition, ERaycast2DType.Closest);
        if (this.results && this.results.length >= 1 && this.results[0].collider.group == XGTS_Constant.Group.Enemy) {
            this.results[0].collider.node.getComponent(XGTS_CharacterController).TakeMeleeDamage(10);
        }
    }

    Reload(reloadCallback?: Function): void {
        this.reloadCallback = reloadCallback;
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.Reload);
        this.PlayAni(1, PlayerAniState.Reload, false);
    }

    StartFire() {
        if (XGTS_GameManager.IsGameOver) return;

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
            XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.Fire);
            this.PlayAni(1, PlayerAniState.Shoot)
        }

        // let bulletCount = this.gun.Type == XGTW_ItemType[XGTW_ItemType.霰弹枪] ? 5 : 1;
        let bulletCount = 1;

        // XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Fire);
        this.weapon.WeaponData.Ammo.Count -= 1;
        EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_WEAON_CONTENT);

        const fireBone = this.spine.findBone(this.weapon.Name);

        for (let i = 0; i < bulletCount; i++) {
            let Bullet = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Bullet, XGTS_LvManager.Instance.Layer_Effects);
            Bullet.setWorldPosition(this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0)));

            // let recoil = Tools.GetRandom(this.gun.Recoil * -10 * bulletCount, this.gun.Recoil * 10 * bulletCount);
            // node.angle = this.Gun.scale.x < 0 ? this.Gun.angle + recoil - 180 : this.Gun.angle + recoil;
            Bullet.angle = this.character.scale.x < 0 ? 180 - this.gunBone.rotation : this.gunBone.rotation;
            Bullet.getComponent(XGTS_Bullet).Init(this, this.weapon, this.weapon.WeaponData.Ammo, null);
        }

        let BulletBlank = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.BulletBlank, XGTS_LvManager.Instance.Layer_Effects);
        this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0), v3_0);
        BulletBlank.setWorldPosition(v3_0);
        BulletBlank.getComponent(XGTS_Bullet).InitBlank(this, v2(-5 * this.character.scale.x, Tools.GetRandom(5, 8)).multiplyScalar(0.2));
    }

    StopFire() {
        super.StopFire();
    }

    TakeDamage(weapon: XGTS_ItemData, ammo: XGTS_ItemData): void {
        if (XGTS_GameManager.IsGameOver) return;

        //伤害=枪械伤害*穿透比
        //护甲伤害=枪械伤害*(1-穿透比)

        //基础的伤害
        let damage = weapon.WeaponData.Damage / 4;

        const ArmorDamage = (data: XGTS_EquipData, quality: number, damage: number): number => {
            let armorDamage = Math.floor(damage * (1 - XGTS_AmmoData.GetDamage(ammo.AmmoData, quality)) / 2);
            data.Durability -= armorDamage;
            data.Durability = misc.clampf(data.Durability, 0, 99999);

            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.FloatingText, XGTS_LvManager.Instance.Game);
            node.setWorldPosition(v3(this.node.worldPosition.x + math.random() * 20, this.node.worldPosition.y + 100 + math.random() * 20, 0));
            node.getComponent(XGTS_FloatingText).Show(`护甲 -${armorDamage}`, "#FFAD00", "#AC0000", 0.3);

            EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_WEAON_CONTENT);
            return damage * XGTS_AmmoData.GetDamage(ammo.AmmoData, quality);
        }

        let taked: boolean = false;


        if (XGTS_DataManager.PlayerDatas[0].Weapon_Helmet && math.random() < 0.5) {
            taked = true;
            let quality = XGTS_DataManager.PlayerDatas[0].Weapon_Helmet.Quality;

            //甲的耐久>0才有效果
            if (XGTS_DataManager.PlayerDatas[0].Weapon_Helmet.EquipData.Durability > 0) {
                damage = ArmorDamage(XGTS_DataManager.PlayerDatas[0].Weapon_Helmet.EquipData, quality, damage);
            }
        }

        if (XGTS_DataManager.PlayerDatas[0].Weapon_BodyArmor && !taked && math.random() < 0.5) {
            let quality = XGTS_DataManager.PlayerDatas[0].Weapon_BodyArmor.Quality;

            //甲的耐久>0才有效果
            if (XGTS_DataManager.PlayerDatas[0].Weapon_BodyArmor.EquipData.Durability > 0) {
                damage = ArmorDamage(XGTS_DataManager.PlayerDatas[0].Weapon_BodyArmor.EquipData, quality, damage);
            }
        }

        let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.FloatingText, this.node);
        node.setWorldPosition(v3(this.node.worldPosition.x + math.random() * 20, this.node.worldPosition.y + 100 + math.random() * 20, 0));
        node.getComponent(XGTS_FloatingText).Show(`-${damage}`, "#FF0000", "#AC0000", 0.3);

        this.HP -= damage;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "Supplies") {
        }

        if (otherCollider.node.name == "DroppedItem") {
        }

        if (otherCollider.node.name == "Bullet") {
            let bullet = otherCollider.node.getComponent(XGTS_Bullet);
            if (bullet.weapon == XGTS_GameManager.Instance.player.weapon) return;

            const worldManifold = contact.getWorldManifold();
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Explosion, XGTS_LvManager.Instance.Game);
            node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
            node.angle = misc.radiansToDegrees(v2(0, 1).signAngle(worldManifold.normal.negative())) - 90;

            if (bullet && bullet.weapon) {
                this.TakeDamage(bullet.weapon, bullet.ammo);
                this.scheduleOnce(() => { XGTS_PoolManager.Instance.Put(otherCollider.node); });
            }
        }

        if (otherCollider.node.name == "Missile") {
            const worldManifold = contact.getWorldManifold();
            XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.MissileExplosion);
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.MissileExplosion, XGTS_LvManager.Instance.Game);
            node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
            this.scheduleOnce(() => {
                XGTS_PoolManager.Instance.Put(otherCollider.node);
            });

            let FloatingText = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.FloatingText, this.node);
            FloatingText.setWorldPosition(v3(this.node.worldPosition.x + math.random() * 20, this.node.worldPosition.y + 100 + math.random() * 20, 0));
            FloatingText.getComponent(XGTS_FloatingText).Show(`-${30}`, "#FF0000", "#AC0000", 0.3);
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
        // XGTS_GameManager.Instance.player = null;
    }

    protected RigistEvent(): void {
        EventManager.Scene.on(XGTS_Constant.Event.MOVEMENT, this.SetDir, this);
        EventManager.Scene.on(XGTS_Constant.Event.MOVEMENT_STOP, this.StopMove, this);
        EventManager.Scene.on(XGTS_Constant.Event.SET_ATTACK_DIR, this.SetGunDir, this);
        EventManager.Scene.on(XGTS_Constant.Event.FIRE_START, this.Fire, this);
        EventManager.Scene.on(XGTS_Constant.Event.FIRE_STOP, this.StopFire, this);
        EventManager.Scene.on(XGTS_Constant.Event.REFRESH_EUIP, this.RefreshEquip, this);
    }

    protected UnrigistEvent(): void {
        EventManager.Scene.off(XGTS_Constant.Event.MOVEMENT, this.SetDir, this);
        EventManager.Scene.off(XGTS_Constant.Event.MOVEMENT_STOP, this.StopMove, this);
        EventManager.Scene.off(XGTS_Constant.Event.SET_ATTACK_DIR, this.SetGunDir, this);
        EventManager.Scene.off(XGTS_Constant.Event.FIRE_START, this.Fire, this);
        EventManager.Scene.off(XGTS_Constant.Event.FIRE_STOP, this.StopFire, this);
        EventManager.Scene.off(XGTS_Constant.Event.REFRESH_EUIP, this.RefreshEquip, this);
    }
}