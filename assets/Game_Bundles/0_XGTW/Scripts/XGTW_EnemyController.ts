import { _decorator, Component, RigidBody2D, Animation, Node, Sprite, Vec2, v2, Vec3, Collider2D, Prefab, instantiate, RigidBody, CircleCollider2D, v3, UITransform, Color, SpriteFrame, misc, director, tween, Tween, PhysicsSystem2D, ERaycast2DType, Contact2DType, IPhysics2DContact, find } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_Bullet from "./XGTW_Bullet";
import { AniState } from "./XGTW_PlayerController";
import XGTW_Supplies from "./XGTW_Supplies";
import XGTW_GamePanel from "./UI/XGTW_GamePanel";
import XGTW_HPBar from "./UI/XGTW_HPBar";
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import XGTW_Missile from './XGTW_Missile';
import { XGTW_AudioManager } from './XGTW_AudioManager';
import { XGTW_UIManager } from './Framework/Managers/XGTW_UIManager';
import XGTW_GameManager from './XGTW_GameManager';
import NodeUtil from '../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from './Framework/Const/XGTW_Constant';
import { AStarManager, AStarNode } from '../../../Scripts/Framework/Algorithm/AStar';
import { GameManager } from '../../../Scripts/GameManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_ItemData, XGTW_PlayerData } from './Datas/XGTW_Data';
import { XGTW_AchievementManager, XGTW_EAchievement } from './Framework/Managers/XGTW_AchievementManager';
import { XGTW_DataManager } from './Framework/Managers/XGTW_DataManager';

@ccclass('XGTW_EnemyController')
export default class XGTW_EnemyController extends Component {
    MAXHP = 200;
    private _hp = 0;
    public get HP(): number {
        return this._hp;
    }
    public set HP(value: number) {
        if (this.isDie) return;

        if (value <= 0) {
            this.isDie = true;
            const items = this.playerData.ItemToArray();
            this.playerData.Clear();
            this.RefreshEquip();
            this.PlayAni(AniState.Die);
            XGTW_DataManager.EXP += 200;
            XGTW_DataManager.RankPoint += 200;

            let name = "Common_Broadcast";
            if (this.killedGun && XGTW_ItemData.IsMainGun(XGTW_ItemData.GetItemType(this.killedGun.Type))) {
                let skin: any = XGTW_DataManager.GetEquipGunSkin(this.killedGun);
                if (skin && skin.HasBroadcast) {
                    name = `${skin.Name}_Broadcast`
                }
            }

            XGTW_UIManager.ShowBroadcast(`击败${this.playerData.Name}`, name, v2(XGTW_GamePanel.Instance.BroadcastPosition.getPosition().x, XGTW_GamePanel.Instance.BroadcastPosition.getPosition().y));

            if (this.isTeamMode && this.isRedTeam) {
                XGTW_GamePanel.Instance.RefreshTeamScore(0, 1);
            }
            if (this.isTeamMode && !this.isRedTeam) {
                XGTW_GamePanel.Instance.RefreshTeamScore(1, 0);
            }

            this.scheduleOnce(() => {
                BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `Supplies`).then((prefab: Prefab) => {
                    let node = instantiate(prefab);
                    node.getComponent(XGTW_Supplies).generateBox = false;
                    node.setParent(XGTW_GameManager.Instance.ItemsNd);
                    node.setWorldPosition(this.node.getWorldPosition())
                    node.getComponent(XGTW_Supplies).InitDieBox(this.playerData.Name, this.killedGun, items);

                    if (this.isTeamMode) {
                        this.isDie = false;
                        this.StopChasing();
                        if (XGTW_GameManager.Instance.timer >= 120) {
                            this.MAXHP = 200;
                        } else {
                            this.MAXHP = 60;
                        }
                        this.HP = this.MAXHP;
                        this.playerData = XGTW_DataManager.GeneratePlayerData();
                        this.RefreshEquip();
                        this.node.setWorldPosition(v3(this.oriPosition.x, this.oriPosition.y));
                        this.PlayAni("Idle");
                    } else {
                        this.scheduleOnce(() => { this.node.destroy(); })
                    }
                });
            }, 1);
            value = 0;
        }

        this._hp = Tools.Clamp(value, 0, this.MAXHP);
        this.hpBar?.Set(this._hp / this.MAXHP);
    }
    rigidbody: RigidBody2D | null = null;
    collider: CircleCollider2D | null = null;
    GunSpAni: Animation | null = null;
    FirePos: Node;
    Gun: Node;
    Doggie: Node;
    GunSp: Sprite;
    Equip: Node;
    Equip_Helmet: Sprite;
    Equip_Bulletproof: Sprite;
    speed: number = 5;
    x: number = 0;
    y: number = 0;
    hpBar: XGTW_HPBar = null;
    results = null;
    isDie: boolean = false;
    isFire: boolean = false;
    isCooldown: boolean = true;//射击冷却
    isReload: boolean = false;//换弹
    oriPosition: Vec3 = v3();
    targetPosition: Vec3 = v3();
    state: string = "Idle";
    playerData: XGTW_PlayerData = null;
    gun = null;
    @property
    isTeamMode: boolean = false;
    @property({ visible() { return this.isTeamMode } })
    isRedTeam: boolean = false;
    onLoad() {
        // this.node.active = Math.random() > 0.3;

        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(CircleCollider2D);
        this.Doggie = NodeUtil.GetNode("Doggie", this.node);
        this.Gun = this.node.getChildByName("Gun");
        this.GunSp = NodeUtil.GetComponent("GunSp", this.node, Sprite);
        this.FirePos = NodeUtil.GetNode("FirePos", this.node);
        this.Equip = NodeUtil.GetNode("Equip", this.node);
        this.Equip_Helmet = NodeUtil.GetComponent("Equip_Helmet", this.node, Sprite);
        this.Equip_Bulletproof = NodeUtil.GetComponent("Equip_Bulletproof", this.node, Sprite);
        this.GunSpAni = this.GunSp.getComponent(Animation);

        this.GunSpAni.on(Animation.EventType.FINISHED, () => {
            if (this.gun) this.gun.BulletCount = 60;
            this.isReload = false;
            this.isFire = false;
            this.Fire();
        }, this);

        this.playerData = XGTW_DataManager.GeneratePlayerData();

        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/HPBar", this.node).then(node => {
            node.setPosition(0, this.node.getComponent(UITransform).height / 2 + 20);
            this.hpBar = node.getComponent(XGTW_HPBar);
            this.hpBar.Init(this.isTeamMode ? (this.isRedTeam ? Color.RED : Color.BLUE) : Color.RED);
            if (XGTW_GameManager.Instance.timer >= 60) {
                this.MAXHP = 200;
            } else {
                this.MAXHP = 60;
            }

            this.HP = this.MAXHP;
        });

        this.oriPosition.set(v3(this.node.getWorldPosition().x, this.node.getWorldPosition().y));
        this.targetPosition.set(this.oriPosition);

        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
    }
    protected start(): void {
        this.RefreshEquip();
    }
    RefreshEquip() {
        this.Equip_Helmet.node.active = this.playerData.Helmet != null;
        if (this.playerData.Helmet != null) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/${this.playerData.Helmet.Type}/${this.playerData.Helmet.Name}`).then((sf: SpriteFrame) => {
                this.Equip_Helmet.spriteFrame = sf;
            });
        }

        this.Equip_Bulletproof.node.active = this.playerData.Bulletproof != null;
        if (this.playerData.Bulletproof != null) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/${this.playerData.Bulletproof.Type}/${this.playerData.Bulletproof.Name}`).then((sf: SpriteFrame) => {
                this.Equip_Bulletproof.spriteFrame = sf;
            });
        }

        let gunData = null;

        if (this.playerData.Weapon_0 != null) {
            gunData = this.playerData.Weapon_0;
        } else if (this.playerData.Weapon_1 != null) {
            gunData = this.playerData.Weapon_1;
        } else if (this.playerData.Pistol != null) {
            gunData = this.playerData.Pistol;
        }

        if (gunData) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${gunData.Type}/${gunData.Name}`).then((sf: SpriteFrame) => {
                this.GunSp.spriteFrame = sf;
            });

            if (gunData.Type == XGTW_ItemType[XGTW_ItemType.近战]) {
                this.GunSp.node.setScale(Vec3.ONE);
            } else {
                this.FirePos.setPosition(v3(gunData.FirePosition.x, gunData.FirePosition.y));
            }

            this.gun = gunData;
        }

    }
    Move(dir: Vec2) {
        if (this.isDie) return;

        this.rigidbody.linearVelocity = dir.multiplyScalar(this.speed);
        this.PlayAni(AniState.Move);
    }
    StopMove() {
        if (this.isDie) return;
        this.rigidbody.linearVelocity = Vec2.ZERO;
        this.PlayAni(AniState.Idle);
    }
    SetGunDir(dir: Vec3) {
        if (this.isDie) return;

        if (this.isFire) {
            this.Doggie.setScale(v3(dir.x < 0 ? -1 : 1, this.Doggie.scale.y));
        }

        let angleRadians = Math.atan2(dir.y, dir.x);
        let angleDegrees = misc.radiansToDegrees(angleRadians);


        this.Gun.setScale(v3((angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? -1 : 1, this.Gun.scale.y));

        angleDegrees = Tools.Lerp((angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? angleDegrees - 180 : angleDegrees, this.Gun.angle, 0.1);

        this.Gun.angle = angleDegrees;
    }
    Fire() {
        if (this.isDie) return;
        if (this.isFire) return;

        this.isFire = true;

        if (!this.gun) return;
        if (this.isReload) return;

        if (this.isCooldown) {
            this.isCooldown = false;
            this.StartFire();
        }

        this.schedule(this.StartFire, this.gun.FireRate * 2);
    }
    StartFire() {
        if (this.isDie) return;

        if (!this.gun) return;

        if (this.gun.BulletCount <= 0) {
            this.StopFire();
            this.Reload();
            return;
        }

        let bulletCount = this.gun.Type == XGTW_ItemType[XGTW_ItemType.霰弹枪] ? 5 : 1;

        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Fire);
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
            node.setWorldPosition(v3(this.FirePos.getWorldPosition().x - 50, this.FirePos.getWorldPosition().y));
            node.getComponent(XGTW_Bullet).InitBlank(this.node, v2(-5 * this.Gun.scale.x, Tools.GetRandom(5, 8)).multiplyScalar(0.2));
        });
    }
    StopFire() {
        if (!this.isFire) return;
        this.isFire = false;
        this.unschedule(this.StartFire);
    }
    Reload() {
        if (this.isDie) return;

        if (this.gun) {
            this.isReload = true;
            this.GunSpAni.play("Reload");
        }
    }
    killedGun = null;
    TakeDamage(bullet: XGTW_Bullet) {
        if (this.isDie) return;
        if (!Tools.IsEmptyStr(bullet.playerData.Name)) return;
        this.killedGun = bullet.weapon;

        let damage = bullet.weapon.Damage;

        let data, lv = 0;
        if (this.playerData.Bulletproof != null) {
            data = this.playerData.Bulletproof;
            lv += data.Quality;
            data.Durable -= damage / 50;
            if (data.Durable <= 0) {
                this.playerData.Bulletproof = null;
            }
        }

        if (this.playerData.Helmet != null) {
            data = this.playerData.Helmet;
            lv += data.Quality;
            data.Durable -= damage / 50;
            if (data.Durable <= 0) {
                this.playerData.Helmet = null;
            }
        }

        this.HP -= lv == 0 ? damage : damage / lv * 2;

        if (this.HP <= 0) {
            if (bullet.weapon && XGTW_ItemData.IsAX50(bullet.weapon.Name)) {
                XGTW_AchievementManager.AddAchievementTimes(XGTW_EAchievement.AX50专家);
            }

            if (bullet.weapon && bullet.weapon.Type == XGTW_ItemType[`${XGTW_ItemType.轻机枪}`]) {
                XGTW_AchievementManager.AddAchievementTimes(XGTW_EAchievement.RPK专家);
            }

            if (bullet.weapon && bullet.weapon.Type == XGTW_ItemType[`${XGTW_ItemType.冲锋枪}`]) {
                XGTW_AchievementManager.AddAchievementTimes(XGTW_EAchievement.这里不是披萨塔);
            }
        }
    }
    TakeMeleeDamage(damage: number) {
        if (this.isDie) return;

        if (this.playerData.Bulletproof != null) {
            damage = damage * (this.playerData.Bulletproof as any).Quality / 10;
        }

        if (this.playerData.Helmet != null) {
            damage = damage * (this.playerData.Helmet as any).Quality / 5;
        }

        this.HP -= damage;
        if (this.HP <= 0) {
            XGTW_AchievementManager.AddAchievementTimes(XGTW_EAchievement.不讲武德);
        }
    }

    target: Node | null = null;
    protected update(dt: number): void {
        if (XGTW_GameManager.IsGameOver) return;

        if (this.isDie) {
            this.rigidbody.linearVelocity = Vec2.ZERO;
            return;
        }

        if (!XGTW_GameManager.Instance.player) return;

        if (XGTW_GameManager.Instance.player.getWorldPosition().clone().subtract(this.node.getWorldPosition().clone()).length() > 3000) {
            this.StopFire();
            // this.StopChasing();
            this.StopMove();
            return;
        }

        this.results = PhysicsSystem2D.instance.raycast(this.node.worldPosition, XGTW_GameManager.Instance.player.worldPosition, ERaycast2DType.Closest);

        if (this.results && this.results.length >= 1 && this.results[0].collider.node.getComponent(RigidBody2D).group == XGTW_Constant.Group.Player) {
            this.targetPosition.set(this.results[0].collider.node.getWorldPosition().clone());
            let dir = this.targetPosition.clone().subtract(v3(this.node.getWorldPosition().x, this.node.getWorldPosition().y));
            let dis = dir.clone();
            this.Move(v2(dir.normalize().x, dir.normalize().y));
            if (dis.length() < 1200) {
                if (dis.length() < 600) {
                    this.StopMove();
                } else {
                    this.Move(v2(dir.normalize().x, dir.normalize().y));
                }

                this.SetGunDir(v3(dir.normalize().x, dir.normalize().y));
                this.Fire();
            } else {
                this.StopFire();
                this.Move(v2(dir.normalize().x, dir.normalize().y));
            }

            // for (let i = 0; i < this.results.length; i++) {
            //     if (this.results[i].collider.node.group == XGTW_Constant.Group.Obstacle) {
            //         return;
            //     }

            //     if (this.results[i].collider.node.group == XGTW_Constant.Group.Player) {
            //         let dir = NodeUtil.GetWorldPosition(this.results[i].collider.node).subtract(NodeUtil.GetWorldPosition(this.node));
            //         if (dir.len() < 1000) {
            //             this.StopChasing();
            //             this.SetGunDir(cc.v3(dir.normalize()));
            //             this.Fire();
            //         } else {
            //             this.StopFire();
            //             this.StartChasing();
            //         }
            //         return;
            //     }
            // }

        } else {
            let dir = this.targetPosition.clone().subtract(v3(this.node.getWorldPosition().x, this.node.getWorldPosition().y));
            if (dir.length() > 1) {
                this.SetGunDir(v3(dir.normalize().x, dir.normalize().y));
                this.Move(v2(v2(dir.normalize().x, dir.normalize().y)));
            } else {
                this.StopFire();
                // this.StopChasing();
                this.StopMove();
            }
        }
    }
    PlayAni(state: string) {
        if (this.state == state) return;
        this.state = state;
    }
    //    //#region 寻路
    redDots: Node[] = [];
    lastNode: AStarNode = null;
    isChasing: boolean = false;
    StartChasing() {
        if (this.isChasing) return;
        this.isChasing = true;
        this.ChasingFunc();
        this.schedule(this.ChasingFunc, 0.5);
    }
    StopChasing() {
        if (!this.isChasing) return;
        this.isChasing = false;
        Tween.stopAllByTarget(this.node)
        this.unschedule(this.ChasingFunc);
    }
    ChasingFunc() {
        if (!XGTW_GameManager.Instance.player) {
            this.StopChasing();
            return;
        }

        if (XGTW_GameManager.Instance.IsInCantArrivePosition(XGTW_GameManager.Instance.player)) return;

        let start = XGTW_GameManager.Instance.GetMapPosition(this.node);
        let end = XGTW_GameManager.Instance.GetMapPosition(XGTW_GameManager.Instance.player);
        if (start && end && start.length !== 0 && start.length !== 0) {
            let path = AStarManager.Instance.FindPath(v2(Number(start.split(`_`)[0]), Number(start.split(`_`)[1])), v2(Number(end.split(`_`)[0]), Number(end.split(`_`)[1])));
            this.Chasing(this.node, path);

            // //寻路点
            // this.redDots.forEach(e => PoolManager.PutNode(e));
            // this.redDots = [];
            // if (!path) return;
            // for (let i = 0; i < path.length; i++) {
            //     const e = path[i];
            //     if (XGTW_GameManager.Instance.map.has(`${e.x}_${e.y}`)) {
            //         GetNodeByBundle(GameManager.GameData.DefaultBundle,"Prefabs/UI/RedDot", cc.director.getScene()).then(node => {
            //             node.getComponent(RedDot).Init(i);
            //             let position = NodeUtil.GetWorldPosition(XGTW_GameManager.Instance.map.get(`${e.x}_${e.y}`));
            //             NodeUtil.SetWorldPosition(node, position);
            //             this.redDots.push(node);
            //         })
            //     }
            // }
        }
    }
    Chasing(node: Node, path: AStarNode[]) {
        if (!path) return;
        let index = path.some(e => e == this.lastNode) ? 1 : 0;
        for (let i = index; i < path.length; i++) {
            const e = path[i];
            if (XGTW_GameManager.Instance.map.has(`${e.x}_${e.y}`)) {
                Tween.stopAllByTarget(node);
                this.lastNode = e;
                let target = XGTW_GameManager.Instance.map.get(`${e.x}_${e.y}`);
                // let position = node.parent.convertToNodeSpaceAR(target.getWorldPosition());
                let position;
                let time = Vec3.distance(node.position, v3(position.x, position.y)) / this.speed;
                tween(node).to(time, { position: v3(position.x, position.y) }).call(() => {
                    path.splice(0, path.indexOf(e) + 1)
                    this.Chasing(node, path);
                }).start();
                break;
            }
        }
    }
    //#endregion
    //监听
    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTW_Constant.Group.Bullet) {
            let bullet = otherCollider.node.getComponent(XGTW_Bullet);
            if (bullet && bullet.weapon && this.gun != bullet.weapon) {
                this.TakeDamage(bullet);
                this.scheduleOnce(() => { PoolManager.PutNode(otherCollider.node); });
            } else {
                let missile = otherCollider.node.getComponent(XGTW_Missile);
                if (missile) {
                    const worldManifold = contact.getWorldManifold();
                    PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/MissileExplosion", find("Canvas")).then(node => {
                        node.setWorldPosition(v3(worldManifold.points[0].x, worldManifold.points[0].y));
                    });
                    this.HP -= 50;
                }
                this.scheduleOnce(() => { PoolManager.PutNode(otherCollider.node); });
            }
        }
    }
    // onEndContact(contact, selfCollider, otherCollider) { }
}