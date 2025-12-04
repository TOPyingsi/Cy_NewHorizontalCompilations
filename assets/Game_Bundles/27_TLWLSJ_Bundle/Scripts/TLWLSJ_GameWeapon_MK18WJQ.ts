import { _decorator, instantiate, Node, Prefab } from 'cc';
import { TLWLSJ_GameWeapon } from './TLWLSJ_GameWeapon';
import { TLWLSJ_Gun } from './TLWLSJ_Gun';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';
import { TLWLSJ_BulletController } from './TLWLSJ_BulletController';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { TLWLSJ_CAPACITY, TLWLSJ_UITYPE, TLWLSJ_WEAPON, TLWLSJ_WEAPONBULLET } from './TLWLSJ_Constant';
import { TLWLSJ_Magazine } from './TLWLSJ_Magazine';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';

const { ccclass } = _decorator;

enum Ani {
    None = "",
    Fire = "kaiqiang",
    Reload = "huandan",
}

@ccclass('TLWLSJ_GameWeapon_MK18WJQ')
export class TLWLSJ_GameWeapon_MK18WJQ extends TLWLSJ_GameWeapon {

    Muzzle: Node = null;
    private _data: TLWLSJ_Gun = null;

    protected start(): void {
        this.Muzzle = this.node.getChildByName("枪口");
        this._data = this.Data as TLWLSJ_Gun;
        TLWLSJ_PlayerController.Instance.WeaponTs = this;
        this.scheduleOnce(() => { this.updateWeaponShow(this._data.CurMagazine); }, 0.1)
    }

    //却换弹夹
    switchMagazine() {
        if (TLWLSJ_UIManager.Instance.IsLock) {
            this.getWeapon();
            return;
        }
        if (this._data.HaveMagazine.length <= 0) {
            // console.log(`弹夹数量不够！`);
            TLWLSJ_UIManager.Instance.showDXPanel(TLWLSJ_UITYPE.背包, () => {
                TLWLSJ_UIManager.Instance.closeDXPanel();
                this.IsReload = true;
                TLWLSJ_AudioManager.PlaySound(Audios.Reload);
                this.playAni(Ani.Reload, false, () => {
                    this.State = Ani.None;
                    this.IsReload = false;
                    if (this._data.CurMagazine && this._data.CurMagazine.Bullets.length > 0) {
                        this._data.HaveMagazine.push(this._data.CurMagazine);
                    }
                    const weaponName = TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, this.WeaponType);
                    this._data.CurMagazine = new TLWLSJ_Magazine(TLWLSJ_CAPACITY[weaponName], TLWLSJ_WEAPONBULLET[weaponName]);
                    this.updateWeaponShow(this._data.CurMagazine);
                });
            })
            return;
        }
        this.IsReload = true;
        if (this._data.CurMagazine && this._data.CurMagazine.Bullets.length > 0) {
            TLWLSJ_AudioManager.PlaySound(Audios.Reload);
            this.playAni(Ani.Reload, false, () => {
                this.State = Ani.None;
                this.IsReload = false;
                this._data.HaveMagazine.push(this._data.CurMagazine);
                this._data.CurMagazine = this._data.HaveMagazine.shift();
                this.updateWeaponShow(this._data.CurMagazine);
                this.IsStop ? this.endAttack() : this.attack();
            })
        } else {
            TLWLSJ_AudioManager.PlaySound(Audios.Reload);
            this.playAni(Ani.Reload, false, () => {
                this.State = Ani.None;
                this.IsReload = false;
                this._data.CurMagazine = this._data.HaveMagazine.shift();
                this.updateWeaponShow(this._data.CurMagazine);
                this.IsStop ? this.endAttack() : this.attack();
            })
        }
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
            TLWLSJ_AudioManager.PlaySound(Audios.Fire);
            this.playAni(Ani.Fire, false, () => {
                this.State = Ani.None;
                this.IsFire = false;
                this.fireBullet(bullet);
                this.updateWeaponShow(this._data.CurMagazine);
                this.attack();
                //发起攻击
            });
        } else {
            this.switchMagazine();
        }
    }

    //发射子弹
    fireBullet(bulletName: string) {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "子弹").then((prefab: Prefab) => {
            const bullet: Node = instantiate(prefab);
            bullet.parent = TLWLSJ_GameManager.Instance.BulletLayout;
            bullet.setWorldPosition(this.Muzzle.getWorldPosition());
            bullet.getComponent(TLWLSJ_BulletController).fire(bulletName, TLWLSJ_PlayerController.Instance.DirX, TLWLSJ_PlayerController.Instance.DirY);
        });
    }

    protected onEnable(): void {
        super.onEnable();
        TLWLSJ_EventManager.on(TLWLSJ_MyEvent.TLWLSJ_RELOAD, this.switchMagazine, this);
    }

    protected onDisable(): void {
        super.onDisable();
        TLWLSJ_EventManager.off(TLWLSJ_MyEvent.TLWLSJ_RELOAD, this.switchMagazine, this);
    }

}


