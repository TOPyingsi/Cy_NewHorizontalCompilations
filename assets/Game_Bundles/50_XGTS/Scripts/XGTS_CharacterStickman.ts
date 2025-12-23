import { _decorator, Component, Vec2, v2, RigidBody2D, Node, Sprite, Animation, Collider2D, CircleCollider2D, SpriteFrame, Vec3, v3, misc, director, JsonAsset, PhysicsSystem2D, ERaycast2DType, Contact2DType, IPhysics2DContact, tween, math, PostSettingsInfo } from 'cc';
const { ccclass, property } = _decorator;

import XGTS_CharacterController, { PlayerAniState } from './XGTS_CharacterController';
import { XGTS_Constant } from './XGTS_Constant';
import { XGTS_DataManager } from './XGTS_DataManager';
import { XGTS_GameManager } from './XGTS_GameManager';
import { XGTS_ContainerType, XGTS_ItemType } from './XGTS_Data';
import { XGTS_PoolManager } from './XGTS_PoolManager';
import XGTS_Bullet from './XGTS_Bullet';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import XGTS_HPBar from './UI/XGTS_HPBar';
import { XGTS_LvManager } from './XGTS_LvManager';
import XGTS_Supplies from './XGTS_Supplies';
const v3_0 = v3();
const v3_1 = v3();

@ccclass('XGTS_CharacterStickman')
export default class XGTS_CharacterStickman extends XGTS_CharacterController {

    results = null;
    needMove: boolean = false;
    isEnemy: boolean = true;

    onLoad() {
        super.onLoad();

        this.speed = 10;
        this.MaxHP = 100;
        this.HP = 100;
        this.isDie = false;

        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);

        let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.HPBar, this.node);
        this.hpBar = node.getComponent(XGTS_HPBar);
        this.hpBar.Init();

        this.AddSpineListener();
    }

    start() {
        this.RefreshEquip();
    }

    RefreshEquip() {
        let weaponData = XGTS_DataManager.ItemDataMap.get(XGTS_ItemType.Weapon).find(e => e.Name == "野牛");
        // let ammo = XGTS_DataManager.GetRandomAmmoByType(weaponData.WeaponData.AmmoType);//TODO 有时候查找不到？？
        let ammo = XGTS_DataManager.ItemDataMap.get(XGTS_ItemType.Ammo).find(e => e.ID == 51602);
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
        XGTS_LvManager.Instance.matchData.KilledPE++;
        director.getScene().emit("怪物死亡");
    }

    InitDeadBox() {
        this.scheduleOnce(() => {
            this.node.active = false;
        });
        let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Supplies, XGTS_LvManager.Instance.Game);
        node.setWorldPosition(this.node.getWorldPosition());
        node.getComponent(XGTS_Supplies).InitCharacterCase(false);
    }

    update(dt) {
        if (XGTS_GameManager.IsGameOver) return;
        // if (!XGTS_GameManager.Instance.player) return;

        if (this.isDie) {
            this.rigidbody.linearVelocity = Vec2.ZERO;
            return;
        }



        // 获取所有存活玩家（双人模式）
        const players = XGTS_GameManager.IsDoubleMode
            ? XGTS_GameManager.Instance.playerNodes
                .filter(node => node.active && node.getComponent(XGTS_CharacterController).HP > 0)
            : [XGTS_GameManager.Instance.player?.node].filter(Boolean);
        if (players.length === 0) return;

        let nearestDistance = Infinity;
        let nearestPlayer: Node = null;

        // 寻找最近可见玩家
        for (const playerNode of players) {
            const playerPos = playerNode.worldPosition;
            const distance = Vec3.distance(this.node.worldPosition, playerPos);

            // 射线检测障碍物
            const results = PhysicsSystem2D.instance.raycast(
                this.node.worldPosition,
                playerPos,
                ERaycast2DType.Closest
            );

            // 判断是否可见（第一个碰撞体是玩家）
            if (results && results.length > 0 &&
                results[0].collider.node.getComponent(RigidBody2D).group === XGTS_Constant.Group.Player) {
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestPlayer = playerNode;
                }
            }
        }

        // 没有有效目标时停止攻击
        if (!nearestPlayer) {
            this.StopFire();
            this.needMove = false;
            return;
        }


        if (nearestPlayer.getWorldPosition().clone().subtract(this.node.getWorldPosition().clone()).length() > 3000) {
            this.StopFire();
            // this.StopChasing();
            // this.StopMove();
            return;
        }

        this.results = PhysicsSystem2D.instance.raycast(this.node.worldPosition, nearestPlayer.worldPosition, ERaycast2DType.Closest);

        if (this.results && this.results.length >= 1 && this.results[0].collider.node.getComponent(RigidBody2D).group == XGTS_Constant.Group.Player) {
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
            if (XGTS_GameManager.IsGameOver) return;
            this.isFire = true;
            this.schedule(this.StartFire, 0.1);
        }
    }

    StartFire() {
        if (XGTS_GameManager.IsGameOver) return;

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
            let Bullet = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Bullet, this.node);
            Bullet.setWorldPosition(this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0)));

            Bullet.angle = this.character.scale.x < 0 ? 180 - this.gunBone.rotation : this.gunBone.rotation;
            Bullet.getComponent(XGTS_Bullet).Init(this, this.weapon, Tools.Clone(this.weapon.WeaponData.Ammo), null);
        }

        let BulletBlank = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.BulletBlank, this.node);
        this.spineTrans.convertToWorldSpaceAR(v3_0.set(fireBone.worldX, fireBone.worldY, 0), v3_0);
        BulletBlank.setWorldPosition(v3_0);
        BulletBlank.getComponent(XGTS_Bullet).InitBlank(this, v2(-5 * this.character.scale.x, Tools.GetRandom(5, 8)).multiplyScalar(0.2));

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
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Explosion, XGTS_LvManager.Instance.Game);
            node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
            node.angle = misc.radiansToDegrees(v2(0, 1).signAngle(worldManifold.normal.negative())) - 90;

            let bullet = otherCollider.node.getComponent(XGTS_Bullet);
            if (bullet && bullet.weapon) {
                this.TakeDamage(bullet.weapon, bullet.ammo);
                this.scheduleOnce(() => { XGTS_PoolManager.Instance.Put(otherCollider.node); });
            }
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
    }

    protected onDestroy(): void {
    }
}