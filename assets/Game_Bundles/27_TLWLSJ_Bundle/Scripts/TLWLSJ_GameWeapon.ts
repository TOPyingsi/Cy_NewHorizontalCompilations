import { _decorator, Component, Enum, instantiate, Node, Prefab, sp } from 'cc';
import { TLWLSJ_UITYPE, TLWLSJ_WEAPON, TLWLSJ_WEAPONSHOW } from './TLWLSJ_Constant';
import { TLWLSJ_Weapon } from './TLWLSJ_Weapon';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { TLWLSJ_Magazine } from './TLWLSJ_Magazine';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

enum Ani {
    None = "",
    Fire = "kaiqiang",
    Reload = "huandan",
}

@ccclass('TLWLSJ_GameWeapon')
export class TLWLSJ_GameWeapon extends Component {
    @property({ type: Enum(TLWLSJ_WEAPON) })
    WeaponType: TLWLSJ_WEAPON = TLWLSJ_WEAPON.签字笔;

    Skeleton: sp.Skeleton = null;
    State: string = "";
    CB: Function = null;

    Data: TLWLSJ_Weapon = null;
    IsStop: boolean = false;
    IsReload: boolean = false;
    IsFire: boolean = false;

    protected onLoad(): void {
        this.Skeleton = this.node.getComponent(sp.Skeleton);
        this.Data = TLWLSJ_GameData.getWeaponByName(TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, this.WeaponType));
        this.Skeleton.setCompleteListener((trackEntry: sp.spine.TrackEntry) => { this.CB && this.CB() });
    }

    playAni(ani: string, loop: boolean = false, cb: Function = null) {
        if (this.State === ani) return;
        this.State = ani;
        if (this.State == Ani.None) {
            this.Skeleton.timeScale = 0;
            return;
        }
        this.Skeleton.timeScale = 1;
        this.CB = cb;
        this.Skeleton.setAnimation(0, ani, loop);
    }

    attack() {
    }

    /**
     * 
     * @returns 能否攻击
     */
    isAttack(): boolean {
        if (this.IsReload) {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                node.getComponent(TLWLSJ_HintController).showHint(`正在装弹！`);
            })
            return false;
        } else if (this.IsFire) {
            return false;
        }
        return true;
    }

    startAttack() {
        this.IsStop = false;
        this.attack();
    }

    endAttack() {
        this.IsStop = true;
    }

    getWeapon() {
        TLWLSJ_UIManager.Instance.showDXPanel(TLWLSJ_UITYPE.武器, () => {
            TLWLSJ_UIManager.Instance.closeDXPanel();
            TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.push(this.WeaponType);
            TLWLSJ_GameData.addWeaponByType(this.WeaponType);
            TLWLSJ_UIManager.Instance.showWeapon();
            TLWLSJ_PrefsManager.Instance.saveData();
        })
    }

    updateWeaponShow(magazine: TLWLSJ_Magazine) {
        if (TLWLSJ_UIManager.Instance.WeaponShowTs.Type == TLWLSJ_WEAPONSHOW.NON) {
            return;
        }

        let num: number = 0;
        if (magazine) {
            num = magazine.Bullets.length;
        }
        if (TLWLSJ_UIManager.Instance.WeaponShowTs.Type == TLWLSJ_WEAPONSHOW.FILL) {
            TLWLSJ_UIManager.Instance.WeaponShowTs.showBulletNum(num);
        } else if (TLWLSJ_UIManager.Instance.WeaponShowTs.Type == TLWLSJ_WEAPONSHOW.INSTANT) {

            TLWLSJ_UIManager.Instance.WeaponShowTs.showBulletNum(num);
            const bullets = TLWLSJ_GameData.getBulletByWeapon(this.WeaponType);
            if (bullets.length > 0) {
                TLWLSJ_UIManager.Instance.WeaponShowTs.showBullet(bullets[0].Name);
            } else {
                TLWLSJ_UIManager.Instance.WeaponShowTs.showBullet();
            }
        }
    }

    updateWeaponShowByNum(num: number) {
        if (num <= 0) num = 0;
        TLWLSJ_UIManager.Instance.WeaponShowTs.showBulletNum(num);
    }


    protected onEnable(): void {
        TLWLSJ_EventManager.on(TLWLSJ_MyEvent.TLWLSJ_ATTACKSTART, this.startAttack, this);
        TLWLSJ_EventManager.on(TLWLSJ_MyEvent.TLWLSJ_ATTACKEND, this.endAttack, this);
    }

    protected onDisable(): void {
        TLWLSJ_EventManager.off(TLWLSJ_MyEvent.TLWLSJ_ATTACKSTART, this.startAttack, this);
        TLWLSJ_EventManager.off(TLWLSJ_MyEvent.TLWLSJ_ATTACKEND, this.endAttack, this);
    }
}


