import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { TLWLSJ_GameWeapon } from './TLWLSJ_GameWeapon';
import { TLWLSJ_Gun } from './TLWLSJ_Gun';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_BULLETNAME, TLWLSJ_CAPACITY, TLWLSJ_WEAPON, TLWLSJ_WEAPONBULLET } from './TLWLSJ_Constant';
import { TLWLSJ_Magazine } from './TLWLSJ_Magazine';
import { TLWLSJ_Reload } from './TLWLSJ_Reload';
import { TLWLSJ_BulletController_LDP } from './TLWLSJ_BulletController_LDP';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_GameWeapon_DCP')
export class TLWLSJ_GameWeapon_DCP extends TLWLSJ_GameWeapon {

    @property
    CoolingTime: number = 1;

    Muzzle: Node = null;

    private _data: TLWLSJ_Gun = null;
    private _capacity: number = 0;

    protected start(): void {
        this.Muzzle = this.node.getChildByName("枪口");
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
            this._data.CurMagazine.Bullets.push(TLWLSJ_BULLETNAME.DCP);
        }
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "装弹中").then((prefab: Prefab) => {
            const reload: Node = instantiate(prefab);
            reload.parent = TLWLSJ_GameManager.Instance.Canvas;
            reload.getComponent(TLWLSJ_Reload).reload(() => {
                this.IsReload = false;
                this.updateWeaponShow(this._data.CurMagazine);
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
            TLWLSJ_PlayerController.Instance.applyRecoil(100000);
            this.scheduleOnce(() => {
                TLWLSJ_PlayerController.Instance.IsRecoil = false;
            }, 0.2);
            this.fireBullet(bullet);
            this.attackAni(() => {
                this.IsFire = false;
                this.updateWeaponShow(this._data.CurMagazine);
                this.attack();
            })
        } else {
            this.loadBullet();
            this.endAttack();
        }
    }

    attackAni(cb: Function = null) {
        this.scheduleOnce(() => {
            cb && cb();
        }, this.CoolingTime);
    }

    //发射子弹
    fireBullet(bulletName: string) {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "子弹_电磁炮").then((prefab: Prefab) => {
            const bullet: Node = instantiate(prefab);
            bullet.parent = TLWLSJ_GameManager.Instance.BulletLayout;
            bullet.setWorldPosition(this.Muzzle.getWorldPosition());
            bullet.getComponent(TLWLSJ_BulletController_LDP).fire(bulletName, TLWLSJ_PlayerController.Instance.DirX, TLWLSJ_PlayerController.Instance.DirY);
        });
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


