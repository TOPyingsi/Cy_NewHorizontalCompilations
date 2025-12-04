import { _decorator, instantiate, Node, Prefab } from 'cc';
import { TLWLSJ_GameWeapon } from './TLWLSJ_GameWeapon';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { TLWLSJ_UITYPE, TLWLSJ_WEAPON } from './TLWLSJ_Constant';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_BulletController_SLD } from './TLWLSJ_BulletController_SLD';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;


@ccclass('TLWLSJ_GameWeapon_PPSL')
export class TLWLSJ_GameWeapon_PPSL extends TLWLSJ_GameWeapon {
    Muzzle: Node = null;
    private _num: number = 0;
    private _weaponName: string = "";

    protected start(): void {
        this.Muzzle = this.node.getChildByName("枪口");
        TLWLSJ_PlayerController.Instance.WeaponTs = this;
        this._weaponName = TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, this.WeaponType);
        this._num = TLWLSJ_GameData.getBulletNumByName(this._weaponName);
        this.scheduleOnce(() => this.updateWeaponShowByNum(this._num), 0.1)
    }

    attack() {
        if (!this.isAttack()) return;
        if (this.IsStop) {
            return;
        }
        if (this._num > 0) {
            this.IsFire = true;
            this._num--;
            this.fireBullet();
            TLWLSJ_GameData.subBulletByName(this._weaponName);
            this.updateWeaponShowByNum(this._num);
            this.attackAni(1, () => {
                this.IsFire = false;
                this.attack();
            })
        } else {
            TLWLSJ_UIManager.Instance.showDXPanel(TLWLSJ_UITYPE.商店, () => {
                TLWLSJ_UIManager.Instance.closeDXPanel();
                TLWLSJ_GameData.addBulletByName(this._weaponName, 10);
                this.scheduleOnce(() => { this.updateNum(); }, 0.1);
            })
            this.endAttack();
        }
    }

    attackAni(time: number, cb: Function = null) {
        this.scheduleOnce(() => {
            cb && cb();
        }, time);
    }

    //发射子弹
    fireBullet() {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "子弹_破片手雷").then((prefab: Prefab) => {
            const bullet: Node = instantiate(prefab);
            bullet.parent = TLWLSJ_GameManager.Instance.BulletLayout;
            bullet.setWorldPosition(this.Muzzle.getWorldPosition());
            bullet.getComponent(TLWLSJ_BulletController_SLD).fire(this._weaponName, TLWLSJ_PlayerController.Instance.DirX, TLWLSJ_PlayerController.Instance.DirY);
        });
    }

    updateNum() {
        this._num = TLWLSJ_GameData.getBulletNumByName(this._weaponName);
        this.updateWeaponShowByNum(this._num);
    }

    protected onEnable(): void {
        super.onEnable();
        TLWLSJ_EventManager.on(TLWLSJ_MyEvent.TLWLSJ_UPDATESLD, this.updateNum, this);
    }

    protected onDisable(): void {
        super.onDisable();
        TLWLSJ_EventManager.off(TLWLSJ_MyEvent.TLWLSJ_UPDATESLD, this.updateNum, this);
    }

}


