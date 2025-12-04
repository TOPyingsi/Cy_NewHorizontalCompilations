import { _decorator, Component, Vec2, v2, RigidBody2D, Node, Sprite, Animation, Collider2D, CircleCollider2D, SpriteFrame, Vec3, v3, misc, director, JsonAsset, PhysicsSystem2D, ERaycast2DType, Contact2DType, IPhysics2DContact, tween, math, PostSettingsInfo, sp } from 'cc';
const { ccclass, property } = _decorator;

import SJZ_CharacterController, { PlayerAniState } from './SJZ_CharacterController';
import { SJZ_Constant } from './SJZ_Constant';
import { SJZ_DataManager } from './SJZ_DataManager';
import { SJZ_GameManager } from './SJZ_GameManager';
import { SJZ_ContainerType, SJZ_ItemType } from './SJZ_Data';
import { SJZ_PoolManager } from './SJZ_PoolManager';
import SJZ_Bullet from './SJZ_Bullet';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import SJZ_HPBar from './UI/SJZ_HPBar';
import { SJZ_LvManager } from './SJZ_LvManager';
import SJZ_Supplies from './SJZ_Supplies';
import SJZ_Missile from './SJZ_Missile';
import { SJZ_Audio, SJZ_AudioManager } from './SJZ_AudioManager';

const v3_0 = v3();
const v3_1 = v3();

@ccclass('SJZ_CharacterEnemyRocketSoldier')
export default class SJZ_CharacterEnemyRocketSoldier extends SJZ_CharacterController {

    results = null;
    isDie: boolean = false;
    needMove: boolean = false;
    fireBone: sp.spine.Bone = null;

    onLoad() {
        super.onLoad();

        this.speed = 10;
        this.MaxHP = 100;
        this.HP = 100;
        this.isDie = false;

        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);

        let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.HPBar, this.node);
        this.hpBar = node.getComponent(SJZ_HPBar);
        this.hpBar.Init();
        this.fireBone = this.spine.findBone("fire");;

        this.AddSpineListener();
    }

    start() {
        this.RefreshEquip();
    }

    RefreshEquip() {
        // let weaponData = SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Weapon).find(e => e.Name == "野牛");
        // // let ammo = SJZ_DataManager.GetRandomAmmoByType(weaponData.WeaponData.AmmoType);//TODO 有时候查找不到？？
        // let ammo = SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Ammo).find(e => e.ID == 51602);
        // weaponData.WeaponData.Ammo = ammo;
        // weaponData.WeaponData.Ammo.Count = weaponData.WeaponData.Clip;
        // this.SetGun(weaponData);
    }

    SetDir(x: number, y: number, rate: number) {
        super.SetDir(x, y, rate);
    }

    SetGunDir(dir: Vec2) {
        super.SetGunDir(dir);
    }

    StopMove() {
        super.StopMove();
    }

    protected override Die(): void {
        if (this.isDie) return;
        this.isDie = true;
        this.PlayAni(0, PlayerAniState.Dead, false);
        SJZ_LvManager.Instance.matchData.KilledPE++;
    }

    InitDeadBox() {
        this.scheduleOnce(() => {
            this.node.destroy();
        });
        let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Supplies, SJZ_LvManager.Instance.Layer_Supplies);
        node.setWorldPosition(this.node.getWorldPosition());
        node.getComponent(SJZ_Supplies).InitCharacterCase(false);
    }

    update(dt) {
        if (SJZ_GameManager.IsGameOver) return;
        if (!SJZ_GameManager.Instance.player) return;

        if (this.isDie) {
            this.rigidbody.linearVelocity = Vec2.ZERO;
            return;
        }

        if (SJZ_GameManager.Instance.player.node.getWorldPosition().clone().subtract(this.node.getWorldPosition().clone()).length() > 3000) {
            this.StopFire();
            // this.StopChasing();
            // this.StopMove();
            return;
        }

        this.results = PhysicsSystem2D.instance.raycast(this.node.worldPosition, SJZ_GameManager.Instance.player.node.worldPosition, ERaycast2DType.Closest);

        if (this.results && this.results.length >= 1 && this.results[0].collider.node.getComponent(RigidBody2D).group == SJZ_Constant.Group.Player) {
            const target: Node = this.results[0].collider.node;

            v3_0.set(target.getWorldPosition().clone().subtract(this.node.getWorldPosition().clone()));
            v3_1.set(v3_0);
            v3_0.normalize();

            this.dir.set(v3_0.x, v3_0.y);

            if (v3_1.length() < 900) {
                //停下开枪
                if (v3_1.length() < 500) {
                    this.needMove = false;
                }

                this.SetGunDir(v2(v3_0.x, v3_0.y));
                this.Fire();
            } else {
                //追逐主角
                // this.StopFire();
                this.needMove = true;
            }
        } else {
            // let dir = this.targetPosition.clone().subtract(v3(this.node.getWorldPosition().x, this.node.getWorldPosition().y));
            // if (dir.length() > 1) {
            //     this.SetGunDir(v3(dir.normalize().x, dir.normalize().y));
            //     this.Move(v2(v2(dir.normalize().x, dir.normalize().y)));
            // } else {
            //     this.StopFire();
            //     // this.StopChasing();
            //     this.StopMove();
            // }
        }

        if (this.needMove) {
            this.PlayAni(0, PlayerAniState.Move);
            super.update(dt);
        } else {
            this.PlayAni(0, PlayerAniState.Idle);
            this.rigidbody.linearVelocity = Vec2.ZERO;
        }
    }

    Fire() {
        if (!this.isFire) {
            if (SJZ_GameManager.IsGameOver) return;
            this.isFire = true;
            this.schedule(this.StartFire, 0.1);
        }
    }

    fireCooldown: number = 0;
    cooldown: number = 1.5;

    StartFire() {
        if (SJZ_GameManager.IsGameOver) return;

        this.fireCooldown += 0.1;
        if (this.fireCooldown >= this.cooldown) {
            this.PlayAni(1, PlayerAniState.Shoot, false);
            SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.MissileFire);

            this.scheduleOnce(() => {
                this.StopAni(1);
            }, 0.5);
            let missile = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Missile, SJZ_LvManager.Instance.Game);
            missile.setWorldPosition(this.spineTrans.convertToWorldSpaceAR(v3_0.set(this.fireBone.worldX, this.fireBone.worldY, 0)));
            missile.angle = this.character.scale.x < 0 ? 180 - this.gunBone.rotation : this.gunBone.rotation;
            missile.getComponent(SJZ_Missile).Init(this.node);
            this.fireCooldown = 0;
        }
    }

    StopFire() {
        this.isFire = false;
        this.unschedule(this.StartFire);
        this.StopAni(1);
    }

    AddSpineListener() {
        this.spine!.setEventListener(((trackEntry: any, event: any) => {
            if (event.data.name == "Replenish") {
                this.reloadCallback && this.reloadCallback();
                this.reloadCallback = null;
            }

            if (event.data.name == "die") {
                this.InitDeadBox();
            }
        }) as any);

    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "Bullet") {
            const worldManifold = contact.getWorldManifold();
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Explosion, SJZ_LvManager.Instance.Game);
            node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
            node.angle = misc.radiansToDegrees(v2(0, 1).signAngle(worldManifold.normal.negative())) - 90;

            let bullet = otherCollider.node.getComponent(SJZ_Bullet);
            if (bullet.target.rigidbody.group == SJZ_Constant.Group.Enemy) return;

            if (bullet && bullet.weapon) {
                this.TakeDamage(bullet.weapon, bullet.ammo);
                this.scheduleOnce(() => { SJZ_PoolManager.Instance.Put(otherCollider.node); });
            }
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    }

    protected onDestroy(): void {
    }
}