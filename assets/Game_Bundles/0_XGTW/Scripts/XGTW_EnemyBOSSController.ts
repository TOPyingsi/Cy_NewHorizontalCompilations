import { _decorator, Component, RigidBody2D, Animation, Node, Sprite, Vec2, v2, Vec3, Prefab, instantiate, CircleCollider2D, v3, UITransform, Color, SpriteFrame, misc, director, tween, Tween, PhysicsSystem2D, ERaycast2DType, find, Contact2DType, IPhysics2DContact, Collider2D } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_Bullet from "./XGTW_Bullet";
import { XGTW_UIManager } from "./Framework/Managers/XGTW_UIManager";
import { AniState } from "./XGTW_PlayerController";
import XGTW_Supplies from "./XGTW_Supplies";
import XGTW_GamePanel from "./UI/XGTW_GamePanel";
import XGTW_HPBar from "./UI/XGTW_HPBar";
import XGTW_Missile from './XGTW_Missile';
import { XGTW_ItemType, XGTW_Constant } from './Framework/Const/XGTW_Constant';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import XGTW_GameManager from './XGTW_GameManager';
import NodeUtil from '../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from '../../../Scripts/GameManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_ItemData, XGTW_PlayerData } from './Datas/XGTW_Data';
import { XGTW_DataManager } from './Framework/Managers/XGTW_DataManager';
import { XGTW_AchievementManager, XGTW_EAchievement } from './Framework/Managers/XGTW_AchievementManager';

@ccclass('XGTW_EnemyBOSSController')
export default class XGTW_EnemyBOSSController extends Component {
    MAXHP = 1200;
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
            XGTW_DataManager.EXP += 5000;
            XGTW_DataManager.RankPoint += 5000;

            let name = "Common_Broadcast";
            if (this.killedGun && XGTW_ItemData.IsMainGun(XGTW_ItemData.GetItemType(this.killedGun.Type))) {
                let skin: any = XGTW_DataManager.GetEquipGunSkin(this.killedGun);
                if (skin && skin.HasBroadcast) {
                    name = `${skin.Name}_Broadcast`
                }
            }

            XGTW_UIManager.ShowBroadcast(`击败${this.playerData.Name}`, name, v2(XGTW_GamePanel.Instance.BroadcastPosition.getPosition().x, XGTW_GamePanel.Instance.BroadcastPosition.getPosition().y));

            this.scheduleOnce(() => {
                BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `Supplies`).then((prefab: Prefab) => {
                    let node = instantiate(prefab);
                    node.getComponent(XGTW_Supplies).generateBox = false;
                    node.setParent(XGTW_GameManager.Instance.ItemsNd);
                    node.setWorldPosition(this.node.getWorldPosition())
                    node.getComponent(XGTW_Supplies).InitDieBox(this.playerData.Name, this.killedGun, items);

                    this.scheduleOnce(() => { this.node.destroy(); })
                });
            }, 1);
            value = 0;
        }

        this._hp = Tools.Clamp(value, 0, this.MAXHP);
        this.hpBar?.Set(this._hp / this.MAXHP);
    }

    @property
    gailv: number = 0.2;

    rigidbody: RigidBody2D | null = null;
    collider: CircleCollider2D | null = null;
    FirePos: Node;
    Gun: Node;
    Doggie: Node;
    GunSp: Sprite;
    Equip: Node;
    Attack: UITransform;
    Equip_Helmet: Sprite;
    Equip_Bulletproof: Sprite;
    speed: number = 15;
    x: number = 0;
    y: number = 0;
    hpBar: XGTW_HPBar = null;
    results = null;
    isDie: boolean = false;
    oriPosition: Vec3 = v3();
    targetPosition: Vec3 = v3();
    state: string = "Idle";
    playerData: XGTW_PlayerData = null;
    onLoad() {
        this.node.active = Math.random() < this.gailv;

        this.rigidbody = this.node.getComponent(RigidBody2D);
        this.collider = this.node.getComponent(CircleCollider2D);
        this.Doggie = NodeUtil.GetNode("Doggie", this.node);
        this.Gun = this.node.getChildByName("Gun");
        this.GunSp = NodeUtil.GetComponent("GunSp", this.node, Sprite);
        this.FirePos = NodeUtil.GetNode("FirePos", this.node);
        this.Equip = NodeUtil.GetNode("Equip", this.node);
        this.Attack = NodeUtil.GetComponent("Attack", this.node, UITransform);
        this.Equip_Helmet = NodeUtil.GetComponent("Equip_Helmet", this.node, Sprite);
        this.Equip_Bulletproof = NodeUtil.GetComponent("Equip_Bulletproof", this.node, Sprite);

        this.playerData = XGTW_DataManager.GeneratePlayerData();

        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/HPBar", this.node).then(node => {
            node.setPosition(0, this.node.getComponent(UITransform).height / 2 + 20);
            this.hpBar = node.getComponent(XGTW_HPBar);
            this.hpBar.Init(Color.RED);
            this.HP = this.MAXHP;
        });

        this.oriPosition.set(v3(this.node.getWorldPosition().x, this.node.getWorldPosition().y));
        this.targetPosition.set(this.oriPosition);

        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
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
        this.Doggie.setScale(v3(dir.x < 0 ? -1 : 1, this.Doggie.scale.y));
        let angleRadians = Math.atan2(dir.y, dir.x);
        let angleDegrees = misc.radiansToDegrees(angleRadians);

        this.Gun.setScale(v3((angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? -1 : 1, this.Gun.scale.y));

        angleDegrees = Tools.Lerp((angleDegrees > 90 && angleDegrees <= 180 || angleDegrees < -90 && angleDegrees >= -180) ? angleDegrees - 180 : angleDegrees, this.Gun.angle, 0.1);

        this.Gun.angle = angleDegrees;
    }

    Fire() {
        if (this.isDie) return;
        this.StartFire();
    }

    StartFire() {
        if (this.isDie) return;
        this.node.getChildByPath("Gun/GunSp/FirePos").active = true;
    }

    StopFire() {
        this.unschedule(this.StartFire);
        this.node.getChildByPath("Gun/GunSp/FirePos").active = false;
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


    target: Node | null = null;
    protected update(dt: number): void {
        if (XGTW_GameManager.IsGameOver) return;

        if (XGTW_GameManager.Instance.player && XGTW_GameManager.Instance.playerCtrl && this.Attack.getBoundingBoxToWorld().contains(v2(XGTW_GameManager.Instance.player.getWorldPosition().x, XGTW_GameManager.Instance.player.getWorldPosition().y))) {
            XGTW_GameManager.Instance.playerCtrl.HP -= 1;
        }

        if (this.isDie) {
            this.rigidbody.linearVelocity = Vec2.ZERO;
            return;
        }

        if (!XGTW_GameManager.Instance.player) return;

        if (XGTW_GameManager.Instance.player.getWorldPosition().clone().subtract(this.node.getWorldPosition().clone()).length() > 3000) {
            this.StopFire();
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



        } else {
            let dir = this.targetPosition.clone().subtract(v3(this.node.getWorldPosition().x, this.node.getWorldPosition().y));
            if (dir.length() > 1) {
                this.SetGunDir(v3(dir.normalize().x, dir.normalize().y));
                this.Move(v2(v2(dir.normalize().x, dir.normalize().y)));
            } else {
                this.StopFire();
                this.StopMove();
            }
        }
    }

    PlayAni(state: string) {
        if (this.state == state) return;
        this.state = state;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTW_Constant.Group.Bullet) {
            let bullet = otherCollider.node.getComponent(XGTW_Bullet);
            if (bullet && bullet.weapon) {
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

    onEndContact(contact, selfCollider, otherCollider) {

    }
}