import { _decorator, Component, Vec2, v2, RigidBody2D, Node, Sprite, Animation, Collider2D, CircleCollider2D, SpriteFrame, Vec3, v3, misc, director, JsonAsset, PhysicsSystem2D, ERaycast2DType, Contact2DType, IPhysics2DContact, tween, math, PostSettingsInfo } from 'cc';
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

const v3_0 = v3();
const v3_1 = v3();

@ccclass('SJZ_CharacterStickman')
export default class SJZ_CharacterStickman extends SJZ_CharacterController {

    results = null;
    isDie: boolean = false;
    needMove: boolean = false;

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

        this.AddSpineListener();
    }

    start() {
        this.RefreshEquip();
    }

    RefreshEquip() {
        let weaponData = SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Weapon).find(e => e.Name == "野牛");
        // let ammo = SJZ_DataManager.GetRandomAmmoByType(weaponData.WeaponData.AmmoType);//TODO 有时候查找不到？？
        let ammo = SJZ_DataManager.ItemDataMap.get(SJZ_ItemType.Ammo).find(e => e.ID == 51602);
        weaponData.WeaponData.Ammo = ammo;
        weaponData.WeaponData.Ammo.Count = weaponData.WeaponData.Clip;
        this.SetGun(weaponData);
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
        let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Supplies, SJZ_LvManager.Instance.Game);
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

    StartFire() {
        if (SJZ_GameManager.IsGameOver) return;

        if (!this.weapon) {
            return;
        }

        if (this.weapon.WeaponData.Ammo.Count <= 0) {
            this.Reload(() => {
                this.scheduleOnce(() => {
                    this.weapon.WeaponData.Ammo.Count = this.weapon.WeaponData.Clip;
                }, (math.random() + 0.3) * 2)
            });
            return;
        }

        this.PlayAni(1, PlayerAniState.Shoot)

        // let bulletCount = this.gun.Type == XGTW_ItemType[XGTW_ItemType.霰弹枪] ? 5 : 1;
        let bulletCount = 1;

        this.weapon.WeaponData.Ammo.Count -= 1;

        const fireBone = this.spine.findBone(this.weapon.Name);

        for (let i = 0; i < bulletCount; i++) {
            let Bullet = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Bullet, this.node);
            Bullet.setWorldPosition(this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0)));

            Bullet.angle = this.character.scale.x < 0 ? 180 - this.gunBone.rotation : this.gunBone.rotation;
            Bullet.getComponent(SJZ_Bullet).Init(this.node, this.weapon, Tools.Clone(this.weapon.WeaponData.Ammo), null);
        }

        let BulletBlank = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.BulletBlank, this.node);
        this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0), v3_0);
        BulletBlank.setWorldPosition(v3_0);
        BulletBlank.getComponent(SJZ_Bullet).InitBlank(this.node, v2(-5 * this.character.scale.x, Tools.GetRandom(5, 8)).multiplyScalar(0.2));

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