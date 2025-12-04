import { _decorator, instantiate, Node, Prefab } from 'cc';
import { TLWLSJ_GameWeapon } from './TLWLSJ_GameWeapon';
import { TLWLSJ_Gun } from './TLWLSJ_Gun';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';
import { TLWLSJ_BulletController } from './TLWLSJ_BulletController';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { TLWLSJ_Bullet } from './TLWLSJ_Bullet';
import { TLWLSJ_CAPACITY, TLWLSJ_UITYPE, TLWLSJ_WEAPON, TLWLSJ_WEAPONBULLET } from './TLWLSJ_Constant';
import { TLWLSJ_Magazine } from './TLWLSJ_Magazine';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';

const { ccclass, property } = _decorator;

enum Ani {
    None = "",
    Fire = "kaiqiang",
    Reload = "huandan",
    Load = "lashuan"
}

@ccclass('TLWLSJ_GameWeapon_LDP')
export class TLWLSJ_GameWeapon_LDP extends TLWLSJ_GameWeapon {

    Muzzle: Node = null;
    private _data: TLWLSJ_Gun = null;
    private _bullets: TLWLSJ_Bullet[] = [];
    private _capacity: number = 0;
    // IsReload: boolean = false;
    // IsFire: boolean = false;

    protected start(): void {
        this.Muzzle = this.node.getChildByName("枪口");
        this._data = this.Data as TLWLSJ_Gun;
        TLWLSJ_PlayerController.Instance.WeaponTs = this;
        this._bullets = TLWLSJ_GameData.getBulletByWeapon(this.WeaponType);
        this._capacity = TLWLSJ_CAPACITY[TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, this.WeaponType)];
        if (!this._data.CurMagazine) {
            this._data.CurMagazine = new TLWLSJ_Magazine(this._capacity);
        }
        this.scheduleOnce(() => this.updateWeaponShow(this._data.CurMagazine), 0.1)
    }


    loadBullet() {
        if (TLWLSJ_UIManager.Instance.IsLock) {
            this.getWeapon();
            return;
        }
        if (this.IsFire) return;
        if (this._data.CurMagazine.Bullets.length >= this._capacity) {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                node.getComponent(TLWLSJ_HintController).showHint("弹药充足，无需填充弹药！！");
            })
            return;
        } else if (this._bullets.length <= 0) {
            TLWLSJ_UIManager.Instance.showDXPanel(TLWLSJ_UITYPE.商店, () => {
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

        const needNum = this._capacity - this._data.CurMagazine.Bullets.length;
        const curNum = this._bullets[0].Count;
        const fillNum = Math.min(needNum, curNum);
        this.loadCountBullet(fillNum);
    }

    loadCountBullet(count: number) {
        if (count <= 0) {
            this.IsReload = false;
            this.IsStop ? this.endAttack() : this.attack();
            return;
        }
        TLWLSJ_AudioManager.PlaySound(Audios.Reload);
        this.playAni(Ani.Reload, false, () => {
            this.State = Ani.None;
            this._data.CurMagazine.Bullets.push(this._bullets[0].Name);
            TLWLSJ_GameData.subBulletByName(this._bullets[0].Name);
            this.updateWeaponShow(this._data.CurMagazine);
            if (this._bullets[0].Count <= 0) this._bullets.shift();
            this.loadCountBullet(count - 1);
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
            this.IsFire = true;
            const bullet = this._data.CurMagazine.Bullets.shift();
            TLWLSJ_AudioManager.PlaySound(Audios.Fire);
            this.playAni(Ani.Fire, false, () => {
                this.State = Ani.None;
                this.fireBullet(bullet);
                this.updateWeaponShow(this._data.CurMagazine);
                this.playAni(Ani.Load, false, () => {
                    this.IsFire = false;
                    this.attack();
                })
                //发起攻击
            });
        } else {
            this.loadBullet();
        }
    }

    //发射子弹
    fireBullet(bulletName: string) {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "子弹_榴弹发射器").then((prefab: Prefab) => {
            const bullet: Node = instantiate(prefab);
            bullet.parent = TLWLSJ_GameManager.Instance.BulletLayout;
            bullet.setWorldPosition(this.Muzzle.getWorldPosition());
            bullet.getComponent(TLWLSJ_BulletController).fire(bulletName, TLWLSJ_PlayerController.Instance.DirX, TLWLSJ_PlayerController.Instance.DirY);
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


