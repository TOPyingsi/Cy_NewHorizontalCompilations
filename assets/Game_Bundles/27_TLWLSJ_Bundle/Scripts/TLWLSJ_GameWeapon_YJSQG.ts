import { _decorator, instantiate, Node, Prefab } from 'cc';
import { TLWLSJ_GameWeapon } from './TLWLSJ_GameWeapon';
import { TLWLSJ_Gun } from './TLWLSJ_Gun';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_BULLETNAME, TLWLSJ_CAPACITY, TLWLSJ_WEAPON, TLWLSJ_WEAPONBULLET } from './TLWLSJ_Constant';
import { TLWLSJ_Magazine } from './TLWLSJ_Magazine';
import { TLWLSJ_Reload } from './TLWLSJ_Reload';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { TLWLSJ_BulletController } from './TLWLSJ_BulletController';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass } = _decorator;

enum Ani {
    None = "",
    Fire = "kaiqiang",
}


@ccclass('TLWLSJ_GameWeapon_YJSQG')
export class TLWLSJ_GameWeapon_YJSQG extends TLWLSJ_GameWeapon {
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
        this.scheduleOnce(() => { this.updateWeaponShow(this._data.CurMagazine); }, 0.1)
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
            this.playAni(Ani.None, false);
            return;
        }
        if (this._data.CurMagazine && this._data.CurMagazine.Bullets.length > 0) {
            const bullet = this._data.CurMagazine.Bullets.shift();
            this.IsFire = true;
            this.playAni(Ani.Fire, false, () => {
                this.State = Ani.None;
                this.IsFire = false;
                this.fireBullet(bullet);
                this.updateWeaponShow(this._data.CurMagazine);
                this.attack();
                //发起攻击
            });
        } else {
            this.loadBullet();
            this.endAttack();
        }
    }

    //发射子弹
    fireBullet(bulletName: string) {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "子弹_阴极射线管").then((prefab: Prefab) => {
            const bullet: Node = instantiate(prefab);
            bullet.parent = TLWLSJ_GameManager.Instance.BulletLayout;
            bullet.setWorldPosition(this.Muzzle.getWorldPosition());
            bullet.getComponent(TLWLSJ_BulletController).fire(bulletName, TLWLSJ_PlayerController.Instance.DirX + TLWLSJ_Tool.GetRandom(-0.1, 0.1), TLWLSJ_PlayerController.Instance.DirY + TLWLSJ_Tool.GetRandom(-0.1, 0.1));
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


