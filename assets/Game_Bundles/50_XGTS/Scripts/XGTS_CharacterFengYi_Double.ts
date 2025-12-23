import { _decorator, Vec2, v2, Node, Collider2D, v3, misc, math, Contact2DType, PhysicsSystem2D, ERaycast2DType, IPhysics2DContact, Vec3, ProgressBar, RigidBody2D } from 'cc';
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
import XGTS_CharacterEnemy from './XGTS_CharacterEnemy';
import XGTS_HPBar from './UI/XGTS_HPBar';
import XGTS_CameraController from './XGTS_CameraController';
import { XGTS_GameData } from './XGTS_GameData';

const v3_0 = v3();

@ccclass('XGTS_CharacterFengYi_Double')
export default class XGTS_CharacterFengYi_Double extends XGTS_CharacterController {
    // 新增弹夹属性（在类开始处添加）
    private currentMagazine: number = 30;
    private maxMagazine: number = 30;
    private reloading: boolean = false;
    // @property({ type: ProgressBar, tooltip: "弹夹剩余子弹进度条" })
    public magazineProgress: ProgressBar = null;

    MaxHP = 900;

    playerNum = 0;

    Arrow: Node = null;

    guideTarget: Node = null;

    private restrictX: boolean = false;
    private restrictY: boolean = false;
    private cameraMidPoint: Vec3 = v3();


    // 自动攻击相关属性
    // @property({ tooltip: "是否启用自动攻击" })
    autoAttack: boolean = true;

    // @property({ tooltip: "远程武器探测范围", visible() { return this.autoAttack; } })
    attackRange: number = 1000;

    // @property({ tooltip: "敌人检测间隔(秒)，用于性能优化", visible() { return this.autoAttack; } })
    enemyCheckInterval: number = 0.5;

    // @property({ tooltip: "近战攻击判定距离", visible() { return this.autoAttack; } })
    meleeCheckDistance: number = 200;

    // 私有变量
    private currentTarget: Node = null;
    private enemyCheckTimer: number = 0;
    private nearestEnemyDistance: number = Infinity;

    private dirX: number;
    private dirY: number;
    private dirRate: number;
    private isStopMove: boolean = false;


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

        this.StopFire();
        this.StopMove();
        this.PlayAni(0, PlayerAniState.Dead, false);
        this.isDie = true;
        this.UnrigistEvent();

        if (this.playerNum == 1) {
            XGTS_CameraController.Instance.player1 = null;
        }
        else {
            XGTS_CameraController.Instance.player2 = null;
        }

        let playerNode: Node;
        if (XGTS_GameManager.Instance.playerNodes.length == 2) {
            playerNode = XGTS_GameManager.Instance.playerNodes[this.playerNum - 1];
            XGTS_GameManager.Instance.playerNodes.splice(this.playerNum - 1, 1);
        }
        else {
            playerNode = XGTS_GameManager.Instance.playerNodes[0];
            XGTS_GameManager.Instance.playerNodes.splice(0, 1);
        }

        playerNode.getComponents(Collider2D).forEach((collider) => {
            collider.destroy()
        })
        playerNode.getComponent(RigidBody2D).destroy()



        // playerNode.destroy();
        let player = null;
        if (XGTS_GameManager.Instance.players.length == 2) {
            player = XGTS_GameManager.Instance.players[this.playerNum - 1];
            XGTS_GameManager.Instance.players.splice(this.playerNum - 1, 1);
        }
        else {
            player = XGTS_GameManager.Instance.players[0];
            XGTS_GameManager.Instance.players.splice(0, 1);
        }

        if (XGTS_GameManager.Instance.playerNodes.length == 0) {
            XGTS_GameManager.IsGameOver = true;
        }


        this.scheduleOnce(() => {
            XGTS_DataManager.PlayerDatas[this.playerNum].ClearBackpack();
            if (XGTS_GameManager.Instance.playerNodes.length == 0) {
                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.GameOverPanel, [false, XGTS_LvManager.Instance.matchData]);
            }
            if (player) {
                player.destroy();
            }
        }, 2);
    }

    onLoad() {
        super.onLoad();
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);

        this.Arrow = NodeUtil.GetNode("Arrow", this.node);

        this.playerNum = parseInt(this.node.name.split("_")[1]);

        this.AddSpineListener();
        this.RigistEvent();

        this.hpBar = this.node.getChildByName("blood").getComponent(XGTS_HPBar);
        this.HP = 900;

        this.magazineProgress = NodeUtil.GetNode("bullet", this.node).getComponent(ProgressBar);
        this.magazineProgress.progress = 1;
        this.MaxHP = 900 + XGTS_GameData.Instance.AddHp;
        this.HP = 900 + XGTS_GameData.Instance.AddHp;
        this.speed = this.speed * (1 + (XGTS_GameData.Instance.AddSpeed / 100));
        this.maxSpeed = this.maxSpeed * (1 + (XGTS_GameData.Instance.AddSpeed / 100));
    }

    start() {
        this.spine.setSkin("dog");
        // this.hpBar = XGTS_GamePanel.Instance.HPBar;
        this.RefreshEquip();
    }

    RefreshEquip() {
        let helmet: string = "", bodyArmor: string = "", backpack: string = "";
        if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet) helmet = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet.Name;
        if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor) bodyArmor = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor.Name;
        if (XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData) backpack = XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.Name;

        let gun: XGTS_ItemData = this.weapon;

        if (!gun) {
            if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Primary) gun = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Primary;
            else if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Secondary) gun = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Secondary;
            else if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Pistol) gun = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Pistol;
        }

        if (gun) {
            this.SetGun(gun);
            // this.weapon.WeaponData.Ammo.Count = this.weapon.WeaponData.Clip;
            let ammoType = XGTS_DataManager.PlayerDatas[this.playerNum].GetFirstAmmoType()
            let ammoData = XGTS_DataManager.PlayerDatas[this.playerNum].GetAmmoByType(ammoType, this.weapon.WeaponData.Clip);
            this.weapon.WeaponData.Ammo = ammoData;
            // this.weapon.WeaponData.Ammo.Count = ammoData.Count;
            // if (ammoData) {
            //     XGTS_GameManager.Instance.player.Reload(() => {
            //         if (ammoData.Count > needCount) {
            //             ammoData.Count -= needCount;
            //         } else {
            //             needCount = ammoData.Count;
            //         }

            //         if (!XGTS_GameManager.Instance.player.weapon.WeaponData.Ammo) {
            //             XGTS_GameManager.Instance.player.weapon.WeaponData.Ammo = Tools.Clone(ammoData);
            //         }

            //         XGTS_GameManager.Instance.player.weapon.WeaponData.Ammo.Count += needCount;
            //         EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_WEAON_CONTENT);
            //     });
            // } else {
            //     UIManager.ShowTip(`没有弹药`);
            // }
        }
        else this.SetMeelee();

        this.SetEquipment(helmet, bodyArmor, backpack);
    }



    SetDir(x: number, y: number, rate: number) {
        this.dirX = x;
        this.dirY = y;
        this.dirRate = rate;
        this.isStopMove = false;
        if (XGTS_GameManager.IsGameOver) return;
        // 处理 X 方向限制：如果限制且当前移动会让距离拉远（根据相机中点判断方向）
        if (this.restrictX) {
            const playerPos = this.node.worldPosition;
            // 判断玩家当前移动方向是否会让与相机中点在 X 方向拉远
            const isPullAwayX = (x > 0 && playerPos.x > this.cameraMidPoint.x) || (x < 0 && playerPos.x < this.cameraMidPoint.x);
            if (isPullAwayX) {
                x = 0; // 限制 X 方向移动
            }
        }

        // 处理 Y 方向限制，逻辑类似 X 方向
        if (this.restrictY) {
            const playerPos = this.node.worldPosition;
            const isPullAwayY = (y > 0 && playerPos.y > this.cameraMidPoint.y) || (y < 0 && playerPos.y < this.cameraMidPoint.y);
            if (isPullAwayY) {
                y = 0; // 限制 Y 方向移动
            }
        }
        // if (this._isRolling) rate = this.rollSpeed / this.maxSpeed
        super.SetDir(x, y, rate);
    }

    SetGunDir(dir: Vec2) {
        if (XGTS_GameManager.IsGameOver) return;
        super.SetGunDir(dir);
    }

    StopMove() {
        this.isStopMove = true;
        super.StopMove();
    }

    update(dt) {
        if (XGTS_GameManager.IsGameOver || this.isDie) return;
        super.update(dt);

        // 自动攻击逻辑
        if (this.autoAttack) {
            this.checkEnemies(dt);
            this.handleAutoAttack();
        }
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
        if (XGTS_GameManager.IsGameOver || this.reloading) return;

        // // 弹夹检查（替换原有弹药检查）
        // if (this.currentMagazine <= 0) {
        //     this.Reload();
        //     return;
        // }

        // 保留原有近战武器判断
        if (this.useMelee) {
            this.PlayAni(1, PlayerAniState.Attack)
            return;
        }

        if (!this.weapon) return;

        if (this.weapon.WeaponData.Ammo.Count <= 0) {
            this.Reload(() => {
                this.scheduleOnce(() => {
                    this.weapon.WeaponData.Ammo.Count = this.weapon.WeaponData.Clip;
                }, (math.random() + 0.3) * 2)
            });
            return;
        }


        // 消耗弹夹子弹（新增）
        // this.currentMagazine--;

        if (!this.weapon.WeaponData.Ammo) {
            this.StopAni(1)
            return;
        }

        // if (this.weapon.WeaponData.Ammo.Count <= 0) {
        //     this.StopFire();
        //     UIManager.ShowTip("没有子弹");
        //     return;
        // }

        if (!this.useMelee) {
            XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.Fire);
            this.PlayAni(1, PlayerAniState.Shoot)
        }

        // let bulletCount = this.gun.Type == XGTW_ItemType[XGTW_ItemType.霰弹枪] ? 5 : 1;
        // let bulletCount = this.gun.Type == XGTW_ItemType[XGTW_ItemType.霰弹枪] ? 5 : 1;
        let bulletCount = 1;

        this.weapon.WeaponData.Ammo.Count -= 1;
        this.UpdateMagazineProgress();

        // const fireBone = this.spine.findBone(this.weapon.Name);

        // XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Fire);
        // this.weapon.WeaponData.Ammo.Count -= 1;
        // EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_WEAON_CONTENT);

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

    // 新增进度条更新方法
    private UpdateMagazineProgress() {
        if (this.magazineProgress) {
            this.magazineProgress.progress = this.weapon.WeaponData.Ammo.Count / this.weapon.WeaponData.Clip;
        }
    }

    // // 修改后的换弹逻辑
    // Reload(reloadCallback?: Function): void {
    //     if (this.reloading || this.currentMagazine === this.maxMagazine) return;
    //     this.reloadCallback = reloadCallback; // 需要保留原有回调处理

    //     this.reloading = true;
    //     this.StopFire();

    //     XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.Reload);
    //     this.PlayAni(1, PlayerAniState.Reload, false);

    //     // 换弹完成回调（新增逻辑）
    //     this.scheduleOnce(() => {
    //         this.currentMagazine = this.maxMagazine;
    //         this.UpdateMagazineProgress();
    //         this.reloading = false;
    //         reloadCallback?.();
    //     }, 2); // 换弹动画持续时间2秒
    // }

    // 修改停止射击逻辑
    StopFire() {
        super.StopFire();


        // 重置武器角度为水平方向（0度），同时保持与玩家朝向一致
        this.gunBone.rotation = 0;

        // 如果是近战武器，也重置攻击方向
        if (this.useMelee) {
            this.fireDir = this.character.scale.x > 0 ? v2(1, 0) : v2(-1, 0);
        }

        // 弹夹打空自动换弹（新增）
        if (this.currentMagazine <= 0) {
            this.Reload();
        }
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


        if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet && math.random() < 0.5) {
            taked = true;
            let quality = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet.Quality;

            //甲的耐久>0才有效果
            if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet.EquipData.Durability > 0) {
                damage = ArmorDamage(XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet.EquipData, quality, damage);
            }
        }

        if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor && !taked && math.random() < 0.5) {
            let quality = XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor.Quality;

            //甲的耐久>0才有效果
            if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor.EquipData.Durability > 0) {
                damage = ArmorDamage(XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor.EquipData, quality, damage);
            }
        }

        let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.FloatingText, this.node);
        node.setWorldPosition(v3(this.node.worldPosition.x + math.random() * 20, this.node.worldPosition.y + 100 + math.random() * 20, 0));
        node.getComponent(XGTS_FloatingText).Show(`-${damage}`, "#FF0000", "#AC0000", 0.3);

        this.HP -= damage;
    }


    // 新增处理移动限制的方法
    private HandleMovementRestriction(data: { restrictX: boolean, restrictY: boolean, midPoint: Vec3 }) {
        const { restrictX, restrictY, midPoint } = data;
        // 这里根据限制条件，调整玩家移动逻辑，比如修改移动方向的计算等
        // 示例：如果限制 X 方向移动，在 SetDir 时对 X 方向做特殊处理，这里简单示意标记限制状态
        if (!this.isStopMove) {
            let lastRestrictX = this.restrictX;
            let lastRestrictY = this.restrictY;

            this.restrictX = restrictX;
            this.restrictY = restrictY;
            this.cameraMidPoint = midPoint;
            // let needChange = false;
            if (lastRestrictX !== restrictX || lastRestrictY !== restrictY) {
                this.SetDir(this.dirX, this.dirY, this.dirRate)
            }
            // if( lastRestrictX !== restrictX || lastRestrictY !== restrictY){
            //     needChange = true;
            // }
        }

    }

    private enemies: XGTS_CharacterController[] = [];
    private _enemyIndex: number = 0;
    private enemiesPerFrame: number = 5;
    private _isSearching: boolean = false;
    private nearestEnemy: Node = null;
    private currentTargetDistance: number = 0;
    /**
     * 检测范围内的敌人，只在指定间隔执行以节省性能
     */
    private checkEnemies(dt: number) {
        if (!this.autoAttack || XGTS_GameManager.IsGameOver) return;

        // this.enemyCheckTimer += dt;
        // if (this.enemyCheckTimer < this.enemyCheckInterval) return;

        // this.enemyCheckTimer = 0;

        this.findNearestEnemy();
    }

    /**
     * 寻找范围内最近的敌人
     */
    private findNearestEnemy() {

        const playerPos = this.node.worldPosition;

        // 计算本帧要处理的敌人范围
        let startIndex

        if (!this._isSearching) {
            // 获取场景中所有敌人
            this.enemies = XGTS_LvManager.Instance.Game.getComponentsInChildren(XGTS_CharacterController).filter((item) => item.isEnemy && item.node.active);
            startIndex = 0;
            this._isSearching = true;
            this.nearestEnemyDistance = Infinity;
            // this.currentTarget = null;
        }
        else {
            startIndex = this._enemyIndex;
        }

        const endIndex = Math.min(startIndex + this.enemiesPerFrame, this.enemies.length);

        // let enemiesNames:string[] = [];
        for (let i = startIndex; i < endIndex; i++) {
            const enemy = this.enemies[i];
            // enemiesNames.push(enemy.node.name);
            // 跳过已死亡的敌人
            if (enemy.isDie) continue;

            // 新增障碍物检测（参考XGTS_CharacterEnemy逻辑）
            const enemyPos = enemy.node.worldPosition;

            // 先比较x轴距离
            const xDistance = Math.abs(playerPos.x - enemyPos.x);
            if (xDistance > this.attackRange) continue;


            const results = PhysicsSystem2D.instance.raycast(
                playerPos,
                enemyPos,
                ERaycast2DType.Closest
            );

            // 如果射线检测到障碍物且不是敌人，则跳过该目标
            if (results && results.length > 0 &&
                results[0].collider.group !== XGTS_Constant.Group.Enemy) {
                continue;
            }


            // 计算距离
            const distance = Vec3.distance(playerPos, enemy.node.worldPosition);

            // 检查是否在攻击范围内
            const inRange = this.useMelee
                ? distance <= this.meleeCheckDistance
                : distance <= this.attackRange;

            // 更新最近的敌人
            if (inRange && distance < this.nearestEnemyDistance) {
                this.nearestEnemyDistance = distance;
                this.nearestEnemy = enemy.node;
            }
        }
        // 更新索引，如果处理完所有敌人则重置
        if (endIndex >= this.enemies.length) {
            this._enemyIndex = 0;
            this._isSearching = false;
            this.currentTarget = this.nearestEnemy;
            this.currentTargetDistance = this.nearestEnemyDistance;
        } else {
            this._enemyIndex = endIndex;
            // this.currentTarget = null;
            // // 如果还有敌人未处理完，则继续处理
            // this.scheduleOnce(() => {
            //     this.findNearestEnemy();
            // }, 0);
        }
        // console.log("enemyNames", enemiesNames);
        // console.log( this.currentTarget )
    }


    /**
     * 处理自动攻击逻辑
     */
    private handleAutoAttack() {
        if (!this.autoAttack || XGTS_GameManager.IsGameOver || !this.currentTarget) {
            this.StopFire();
            return;
        }

        // 确保目标仍然有效
        if (!this.currentTarget.active || this.currentTarget.getComponent(XGTS_CharacterController).isDie) {
            this.currentTarget = null;
            this.StopFire();
            return;
        }

        // 计算目标方向并设置武器朝向
        const targetDir = new Vec2(
            this.currentTarget.worldPosition.x - this.node.worldPosition.x,
            this.currentTarget.worldPosition.y - this.node.worldPosition.y
        ).normalize();
        this.SetGunDir(targetDir);

        // 根据武器类型执行攻击
        if (this.useMelee) {
            // 近战武器：在范围内时攻击
            if (this.currentTargetDistance <= this.meleeCheckDistance) {
                this.schedule(this.MeleeAttack, 0.6);
                this.Fire();
                // this.MeleeAttack();
            } else {
                this.unschedule(this.MeleeAttack);
                this.StopFire();
            }
        } else {
            // 远程武器：在范围内时持续攻击
            if (this.currentTargetDistance <= this.attackRange) {
                if (!this.isFire) {
                    this.Fire();
                }
            } else {
                this.StopFire();
            }
        }
    }


    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "Supplies") {
        }

        if (otherCollider.node.name == "DroppedItem") {
        }

        if (otherCollider.node.name == "Bullet") {
            let bullet = otherCollider.node.getComponent(XGTS_Bullet);
            if (bullet.weapon == this.weapon) return;

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
        EventManager.Scene.on(XGTS_Constant.Event.MOVEMENT + "_" + this.playerNum, this.SetDir, this);
        EventManager.Scene.on(XGTS_Constant.Event.MOVEMENT_STOP + "_" + this.playerNum, this.StopMove, this);
        EventManager.Scene.on(XGTS_Constant.Event.SET_ATTACK_DIR, this.SetGunDir, this);
        EventManager.Scene.on(XGTS_Constant.Event.FIRE_START, this.Fire, this);
        EventManager.Scene.on(XGTS_Constant.Event.FIRE_STOP, this.StopFire, this);
        EventManager.Scene.on(XGTS_Constant.Event.REFRESH_EUIP + "_" + this.playerNum, this.RefreshEquip, this);

        EventManager.Scene.on(XGTS_Constant.Event.RESTRICT_PLAYER_MOVEMENT, this.HandleMovementRestriction, this);
    }

    protected UnrigistEvent(): void {
        EventManager.Scene.off(XGTS_Constant.Event.MOVEMENT + "_" + this.playerNum, this.SetDir, this);
        EventManager.Scene.off(XGTS_Constant.Event.MOVEMENT_STOP + "_" + this.playerNum, this.StopMove, this);
        EventManager.Scene.off(XGTS_Constant.Event.SET_ATTACK_DIR, this.SetGunDir, this);
        EventManager.Scene.off(XGTS_Constant.Event.FIRE_START, this.Fire, this);
        EventManager.Scene.off(XGTS_Constant.Event.FIRE_STOP, this.StopFire, this);
        EventManager.Scene.off(XGTS_Constant.Event.REFRESH_EUIP + "_" + this.playerNum, this.RefreshEquip, this);
        EventManager.Scene.off(XGTS_Constant.Event.RESTRICT_PLAYER_MOVEMENT, this.HandleMovementRestriction, this);
    }
}