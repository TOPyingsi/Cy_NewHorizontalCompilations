import { _decorator, instantiate, Node, PhysicsSystem2D, Prefab, Tween, tween, UIOpacity, v2, Vec2, Vec3 } from 'cc';
import { TLWLSJ_GameWeapon } from './TLWLSJ_GameWeapon';
import { TLWLSJ_Gun } from './TLWLSJ_Gun';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_BULLETNAME, TLWLSJ_CAPACITY, TLWLSJ_Constant, TLWLSJ_WEAPON, TLWLSJ_WEAPONBULLET } from './TLWLSJ_Constant';
import { TLWLSJ_Magazine } from './TLWLSJ_Magazine';
import { TLWLSJ_Reload } from './TLWLSJ_Reload';
import { TLWLSJ_EnemyController } from './TLWLSJ_EnemyController';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_GameWeapon_GMSQ')
export class TLWLSJ_GameWeapon_GMSQ extends TLWLSJ_GameWeapon {

    @property
    CoolingTime: number = 0.5;

    QK: Node = null;

    QTOpacity: UIOpacity = null;
    GSOpacity: UIOpacity = null;

    private _data: TLWLSJ_Gun = null;
    private _capacity: number = 0;
    private _harm: number = 20;
    private _armor: number = 999;

    protected start(): void {
        this.QK = this.node.getChildByName("枪口");
        this.QTOpacity = this.node.getChildByName("枪口").getComponent(UIOpacity);
        this.GSOpacity = this.node.getChildByName("光束").getComponent(UIOpacity);

        this._data = this.Data as TLWLSJ_Gun;
        TLWLSJ_PlayerController.Instance.WeaponTs = this;
        this._capacity = TLWLSJ_CAPACITY[TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, this.WeaponType)];
        if (!this._data.CurMagazine) {
            this._data.CurMagazine = new TLWLSJ_Magazine(this._capacity);
        }
        this.scheduleOnce(() => { this.updateWeaponShow(this._data.CurMagazine); }, 0.1);
    }

    //却换弹夹
    loadBullet() {
        if (TLWLSJ_UIManager.Instance.IsLock) {
            this.getWeapon();
            return;
        }
        if (this._data.CurMagazine.Bullets.length >= this._capacity) {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                node.getComponent(TLWLSJ_HintController).showHint("弹夹已满！");
            })
            return;
        }

        if (!TLWLSJ_GameManager.Instance.IsRecharge) {
            TLWLSJ_UIManager.Instance.showCDZPanel(() => {
                TLWLSJ_UIManager.Instance.closeCDZPanel();
                const weaponName = TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, this.WeaponType);
                this._data.CurMagazine = new TLWLSJ_Magazine(TLWLSJ_CAPACITY[weaponName], TLWLSJ_WEAPONBULLET[weaponName]);
                this.updateWeaponShow(this._data.CurMagazine);
            });
            return;
        }

        this.IsReload = true;
        const needNum = this._capacity - this._data.CurMagazine.Bullets.length;

        for (let i = 0; i < needNum; i++) {
            this._data.CurMagazine.Bullets.push(TLWLSJ_BULLETNAME.GSQ);
        }
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "装弹中").then((prefab: Prefab) => {
            const reload: Node = instantiate(prefab);
            reload.parent = TLWLSJ_GameManager.Instance.Canvas;
            reload.getComponent(TLWLSJ_Reload).reload(() => {
                this.IsReload = false;
                this.updateWeaponShow(this._data.CurMagazine);
                this.IsStop ? this.endAttack() : this.attack();
            })
        })
    }

    attack() {
        if (TLWLSJ_UIManager.Instance.IsLock) {
            this.getWeapon();
            return;
        }
        if (!this.isAttack()) return;
        if (this.IsStop) {
            return;
        }
        if (this._data.CurMagazine && this._data.CurMagazine.Bullets.length > 0) {
            this.IsFire = true;
            const bullet = this._data.CurMagazine.Bullets.shift();
            TLWLSJ_AudioManager.PlaySound(Audios.GSQ);
            this.attackAni(() => {
                this.IsFire = false;
                this.castRayAll(this.QK.getWorldPosition().clone(), v2(TLWLSJ_PlayerController.Instance.DirX, TLWLSJ_PlayerController.Instance.DirY));
                this.updateWeaponShow(this._data.CurMagazine);
                this.attack();
            })
        } else {
            this.loadBullet();
            this.endAttack();
        }
    }

    attackAni(cb: Function = null) {
        Tween.stopAllByTarget(this.QTOpacity);
        this.GSOpacity.opacity = 255;
        this.QTOpacity.opacity = 255;

        tween(this.GSOpacity)
            .to(this.CoolingTime, { opacity: 0 }, { easing: `sineOut` })
            .call(() => {
                cb && cb();
            })
            .start();

        tween(this.QTOpacity)
            .to(this.CoolingTime, { opacity: 0 }, { easing: `sineOut` })
            .start();
    }

    castRayAll(origin: Vec3, direction: Vec2, distance: number = 10000) {

        const startPos = v2(origin.x, origin.y);
        const targetPos = startPos.clone().add(direction.multiplyScalar(distance));
        const results = PhysicsSystem2D.instance.raycast(startPos, targetPos, 3);

        // 检测所有碰撞
        if (results.length > 0) {
            for (const result of results) {
                // 获取碰撞点信息
                const hitCollider = result.collider;
                if (hitCollider.group == TLWLSJ_Constant.TLWLSJ_Group.ENEMY) {
                    // console.error('射线击中物体:' + hitCollider.node.name);
                    hitCollider.node.getComponent(TLWLSJ_EnemyController).hit(this._harm, this._armor);
                }
            }
        }

    }

    protected onEnable(): void {
        super.onEnable();
        TLWLSJ_EventManager.on(TLWLSJ_MyEvent.TLWLSJ_RELOAD, this.loadBullet, this);
    }

    protected onDisable(): void {
        super.onDisable();
        TLWLSJ_EventManager.off(TLWLSJ_MyEvent.TLWLSJ_RELOAD, this.loadBullet, this);
    }
}


