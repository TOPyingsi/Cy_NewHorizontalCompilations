import { _decorator, Component, EventTouch, instantiate, Label, Node, Prefab, Sprite, Tween, tween, UIOpacity } from 'cc';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { PROPS, TLWLSJ_UITYPE, TLWLSJ_WEAPON, TLWLSJ_WEAPONSWITCH } from './TLWLSJ_Constant';
import { TLWLSJ_WeaponShow } from './TLWLSJ_WeaponShow';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController';
import { TLWLSJ_NumberIncrementLabel } from './TLWLSJ_NumberIncrementLabel';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_EventManager, TLWLSJ_MyEvent } from './TLWLSJ_EventManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
import Banner from '../../../Scripts/Banner';

const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_UIManager')
export class TLWLSJ_UIManager extends Component {
    public static Instance: TLWLSJ_UIManager = null;

    @property(Node)
    Agonal: Node = null;

    @property(UIOpacity)
    AgonalUIOpacity: UIOpacity = null;

    @property(Node)
    Weapon: Node = null;

    @property(Node)
    Last: Node = null;

    @property(Node)
    Next: Node = null;

    @property(Sprite)
    HPSprite: Sprite = null;

    @property(Node)
    TipsNode: Node = null;

    @property(Node)
    TimeNode: Node = null;

    @property(Label)
    TimeLabel: Label = null;

    @property(UIOpacity)
    WaveUIOpacity: UIOpacity = null;

    @property(Label)
    WaveLabel: Label = null;

    @property(TLWLSJ_NumberIncrementLabel)
    YW: TLWLSJ_NumberIncrementLabel = null;

    @property(TLWLSJ_NumberIncrementLabel)
    KF: TLWLSJ_NumberIncrementLabel = null;

    @property(Node)
    DXPanel: Node = null;

    @property(Label)
    TipsLabel: Label = null;

    @property(Node)
    PackNode: Node = null;

    @property(Node)
    ShopNode: Node = null;

    @property(Node)
    CDZPanel: Node = null;

    IsAgonal: boolean = false;
    IsAgonalOnce: boolean = false;
    WeaponShowTs: TLWLSJ_WeaponShow = null;

    IsLock: boolean = false;

    private _cb: Function = null;

    protected onLoad(): void {
        TLWLSJ_UIManager.Instance = this;
        this.Last.on(Node.EventType.TOUCH_END, this.onLast, this);
        this.Next.on(Node.EventType.TOUCH_END, this.onNext, this);
    }

    protected start(): void {
        this.showWeapon();
        // this.showAgonalStaged();
        this.showYW();
        this.showKF();
    }

    showAgonalStaged() {
        if (this.IsAgonal) return;
        this.IsAgonal = true;
        this.Agonal.active = true;
        this.IsAgonalOnce = false;
        Tween.stopAllByTarget(this.AgonalUIOpacity);
        tween(this.AgonalUIOpacity)
            .to(0.5, { opacity: 100 }, { easing: `sineInOut` })
            .delay(0.5)
            .to(0.5, { opacity: 255 }, { easing: `sineInOut` })
            .delay(0.5)
            .union()
            .repeatForever()
            .start();
    }

    showAgonalStagedOnce() {
        if (this.IsAgonal || this.IsAgonalOnce) return;
        this.IsAgonalOnce = true;
        this.Agonal.active = true;
        tween(this.AgonalUIOpacity)
            .to(0.3, { opacity: 100 }, { easing: `sineInOut` })
            .call(() => {
                this.IsAgonalOnce = false;
                this.closeAgonalStaged();
            })
            .start();
    }

    closeAgonalStaged() {
        this.IsAgonal = false;
        this.Agonal.active = false;
        Tween.stopAllByTarget(this.AgonalUIOpacity);
    }

    onLast(event: EventTouch) {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        this.showWeapon(TLWLSJ_WEAPONSWITCH.LAST);
        TLWLSJ_PrefsManager.Instance.saveData();
    }

    onNext(event: EventTouch) {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        this.showWeapon(TLWLSJ_WEAPONSWITCH.NEXT);
        TLWLSJ_PrefsManager.Instance.saveData();
    }

    showWeapon(weapon: TLWLSJ_WEAPONSWITCH = TLWLSJ_WEAPONSWITCH.NON) {
        switch (weapon) {
            case TLWLSJ_WEAPONSWITCH.NON:
                break;
            case TLWLSJ_WEAPONSWITCH.LAST:
                TLWLSJ_PrefsManager.Instance.userData.CurWeapon = TLWLSJ_Tool.getAdjacentElement(TLWLSJ_PrefsManager.Instance.userData.AllWeapon, TLWLSJ_PrefsManager.Instance.userData.CurWeapon, false);
                break;
            case TLWLSJ_WEAPONSWITCH.NEXT:
                TLWLSJ_PrefsManager.Instance.userData.CurWeapon = TLWLSJ_Tool.getAdjacentElement(TLWLSJ_PrefsManager.Instance.userData.AllWeapon, TLWLSJ_PrefsManager.Instance.userData.CurWeapon);
                break;
        }

        this.Weapon.removeAllChildren();
        TLWLSJ_PlayerController.Instance.showWeapon();
        const path = `展示_武器_${TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, TLWLSJ_PrefsManager.Instance.userData.CurWeapon)}`
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${path}`).then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.Weapon;
            this.WeaponShowTs = node.getComponent(TLWLSJ_WeaponShow);
            this.IsLock = this.checkIsLock();
            if (this.IsLock) {
                BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Lock").then((prefab: Prefab) => {
                    const lock: Node = instantiate(prefab);
                    lock.parent = node;
                    //给锁注册点击事件
                    lock.on(Node.EventType.TOUCH_END, () => {
                        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
                        this.showDXPanel(TLWLSJ_UITYPE.武器, () => {
                            this.closeDXPanel();
                            TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.push(TLWLSJ_PrefsManager.Instance.userData.CurWeapon);
                            TLWLSJ_GameData.addWeaponByType(TLWLSJ_PrefsManager.Instance.userData.CurWeapon);
                            this.showWeapon();
                        })
                    });
                })
            }
        })
    }

    getZDSQ() {
        TLWLSJ_GameData.addWeaponByType(TLWLSJ_WEAPON.自动手枪);
        TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.push(TLWLSJ_WEAPON.自动手枪);
        TLWLSJ_PrefsManager.Instance.userData.CurWeapon = TLWLSJ_WEAPON.自动手枪;
        TLWLSJ_PrefsManager.Instance.saveData();
        this.Weapon.removeAllChildren();
        TLWLSJ_PlayerController.Instance.showWeapon();
        const path = `展示_武器_${TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, TLWLSJ_PrefsManager.Instance.userData.CurWeapon)}`;
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${path}`).then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.Weapon;
            this.WeaponShowTs = node.getComponent(TLWLSJ_WeaponShow);
            this.IsLock = this.checkIsLock();
            this.scheduleOnce(() => { TLWLSJ_EventManager.Scene.emit(TLWLSJ_MyEvent.TLWLSJ_FL); }, 0.2);
        })
    }

    /**
     * 
     * @returns 检查当前装备是否被锁住 锁住返回true
     */
    checkIsLock() {
        if (TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.findIndex(e => e == TLWLSJ_PrefsManager.Instance.userData.CurWeapon) == -1) {
            return true;
        }
        return false;
    }

    setHPFillRange(fillRange: number) {
        fillRange = TLWLSJ_Tool.Clamp(fillRange, 0, 1);
        this.HPSprite.fillRange = fillRange;
    }

    time(time: number, wave: number, isLast: boolean = false, cb: Function = null) {
        this.TipsNode.active = true;
        this.TimeNode.active = true;
        this.startTime(time, wave, isLast, cb);
    }

    startTime(time: number = 0, wave: number, isLast: boolean = false, cb: Function = null) {
        if (time <= 0) {
            const tips = isLast ? `最后一波` : `第 ${wave} 波`;
            this.showTips(tips);
            cb && cb();
            return;
        }
        this.TimeLabel.string = time.toString();
        this.scheduleOnce(() => { this.startTime(time - 1, wave, isLast, cb) }, 1);
    }

    showTips(tips: string, cb: Function = null) {
        this.TipsNode.active = true;
        this.TimeNode.active = false;
        this.WaveUIOpacity.opacity = 255;
        this.WaveLabel.string = tips;
        tween(this.WaveUIOpacity)
            .delay(1)
            .to(2, { opacity: 0 }, { easing: `sineOut` })
            .call(() => { this.TipsNode.active = false; cb && cb() })
            .start();
    }

    showYW(change: number = 0) {
        TLWLSJ_PrefsManager.Instance.userData.YW += change;
        if (TLWLSJ_PrefsManager.Instance.userData.YW < 0) {
            TLWLSJ_PrefsManager.Instance.userData.YW = 0;
            this.showDXPanel(TLWLSJ_UITYPE.药物, () => {
                this.closeDXPanel();
                this.showYW(3);
                TLWLSJ_GameData.addPropByType(PROPS.药丸, 3);
            });
            return;
        }
        if (change < 0) {
            TLWLSJ_AudioManager.PlaySound(Audios.Drink);
            TLWLSJ_GameData.userPropByType(PROPS.药丸);
            TLWLSJ_PlayerController.Instance.propCure(PROPS.药丸);
        }
        TLWLSJ_PrefsManager.Instance.saveData();
        this.YW.playNumberIncrementTo(TLWLSJ_PrefsManager.Instance.userData.YW);
    }

    showKF(change: number = 0) {
        TLWLSJ_PrefsManager.Instance.userData.KF += change;
        if (TLWLSJ_PrefsManager.Instance.userData.KF < 0) {
            TLWLSJ_PrefsManager.Instance.userData.KF = 0;
            this.showDXPanel(TLWLSJ_UITYPE.药物, () => {
                this.closeDXPanel();
                this.showKF(1);
                TLWLSJ_GameData.addPropByType(PROPS.咖啡, 1);
            });
            return;
        }
        if (change < 0) {
            TLWLSJ_AudioManager.PlaySound(Audios.Drink);
            TLWLSJ_GameData.userPropByType(PROPS.咖啡);
            TLWLSJ_PlayerController.Instance.propCure(PROPS.咖啡);
        }
        TLWLSJ_PrefsManager.Instance.saveData();
        this.KF.playNumberIncrementTo(TLWLSJ_PrefsManager.Instance.userData.KF);
    }

    ShowTips(hint: string) {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = TLWLSJ_GameManager.Instance.Canvas;
            node.getComponent(TLWLSJ_HintController).showHint(hint);
        })
    }

    onButtonClick(event: EventTouch) {
        const target: Node = event.getCurrentTarget();
        switch (target.name) {
            case "药丸":
                if (TLWLSJ_PlayerController.Instance.isCure()) this.showYW(-1);
                else this.ShowTips("血量已满！")
                break;
            case "咖啡":
                if (TLWLSJ_PlayerController.Instance.isCure()) this.showKF(-1);
                else this.ShowTips("血量已满！")
                break;
        }
    }

    showDXPanel(type: TLWLSJ_UITYPE, cb: Function = null) {
        TLWLSJ_GameManager.Instance.IsPause = true;
        this.DXPanel.active = true;
        let tips = "";
        if (type == TLWLSJ_UITYPE.背包) {
            tips = "弹匣已用完！";
            this.PackNode.active = true;
            this.ShopNode.active = false;
        } else if (type == TLWLSJ_UITYPE.商店) {
            tips = "子弹已用完！";
            this.ShopNode.active = true;
            this.PackNode.active = false;
        } else if (type == TLWLSJ_UITYPE.武器) {
            tips = "武器未解锁！";
            this.ShopNode.active = true;
            this.PackNode.active = false;
        } else if (type == TLWLSJ_UITYPE.药物) {
            tips = "已用完！";
            this.ShopNode.active = true;
            this.PackNode.active = false;
        }
        this.TipsLabel.string = tips;
        this._cb = cb;
    }

    closeDXPanel() {
        TLWLSJ_GameManager.Instance.IsPause = false;
        this.DXPanel.active = false;
        this._cb = null;
    }

    playViedo() {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        Banner.Instance.ShowVideoAd(() => { this._cb && this._cb() });
    }

    openPack() {
        this.closeDXPanel();
        TLWLSJ_GameManager.Instance.backpackBtn();
    }

    openShop() {
        this.closeDXPanel();
        TLWLSJ_GameManager.Instance.shopBtn();
    }

    showCDZPanel(cb: Function = null) {
        TLWLSJ_GameManager.Instance.IsPause = true;
        this.CDZPanel.active = true;
        this._cb = cb;
    }

    closeCDZPanel() {
        TLWLSJ_GameManager.Instance.IsPause = false;
        this.CDZPanel.active = false;
        this._cb = null;
    }

    // updateWeapon() {
    //     if (this.WeaponShowTs.Type == WEAPONSHOW.NON) {
    //         return;
    //     }

    //     const magazine: Magazine = (PlayerController.Instance.WeaponTs as Gun).CurMagazine;
    //     let num: number = 0;
    //     if (magazine) {
    //         num = magazine.Bullets.length;
    //     }
    //     if (this.WeaponShowTs.Type == WEAPONSHOW.FILL) {
    //         this.WeaponShowTs.showBulletNum(num);
    //     } else if (this.WeaponShowTs.Type == WEAPONSHOW.INSTANT) {
    //         this.WeaponShowTs.showBulletNum(num);
    //         const bullets = GameData.getBulletByWeapon(PrefsManager.Instance.userData.CurWeapon);
    //         if (bullets.length > 0) {
    //             this.WeaponShowTs.showBullet(bullets[0].Name);
    //         } else {
    //             this.WeaponShowTs.showBullet();
    //         }
    //     }
    // }
}


