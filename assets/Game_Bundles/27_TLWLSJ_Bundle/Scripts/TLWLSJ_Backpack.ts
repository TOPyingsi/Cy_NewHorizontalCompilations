import { _decorator, Component, instantiate, log, Node, Prefab } from 'cc';
import { TLWLSJ_Item } from './TLWLSJ_Item';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { TLWLSJ_Gun } from './TLWLSJ_Gun';
import { TLWLSJ_Magazine } from './TLWLSJ_Magazine';
import { TLWLSJ_Bullet } from './TLWLSJ_Bullet';
import { TLWLSJ_TipsController } from './TLWLSJ_TipsController';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { TLWLSJ_WEAPON } from './TLWLSJ_Constant';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameData } from '../../../Scripts/Framework/Managers/DataManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Backpack')
export class TLWLSJ_Backpack extends Component {
    public static Instance: TLWLSJ_Backpack = null;

    @property(Node)
    WeaponContent: Node = null;

    @property(Node)
    MagazineContent: Node = null;

    @property(Node)
    BulletContent: Node = null;

    @property(Node)
    BackButton: Node = null;

    CheckedBullet: TLWLSJ_Item = null;//选用子弹

    private _weaponName: string = "";
    private _haveMagazine: boolean = false;
    private _weapon: TLWLSJ_Gun = null;
    private _isCheckMagazine: boolean = false;

    protected onLoad(): void {
        TLWLSJ_Backpack.Instance = this;
    }


    protected onEnable(): void {
        this.showWeapon();
        if (TLWLSJ_TipsController.Instance.IsPack && TLWLSJ_TipsController.Instance.IsPackStart) {
            this.BackButton.active = false;
        }
    }

    showWeapon() {
        this.WeaponContent.removeAllChildren();
        this.CheckedBullet = null;
        const weapons: TLWLSJ_WEAPON[] = TLWLSJ_PrefsManager.Instance.userData.HaveWeapon;

        for (let i = 0; i < weapons.length; i++) {
            const name: string = TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, weapons[i]);
            const path: string = "背包_武器_" + name;
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${path}`).then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = this.WeaponContent;
                node.getComponent(TLWLSJ_Item).Name = name;
                if (i == 0) {
                    this._weaponName = name;
                    this._haveMagazine = node.getComponent(TLWLSJ_Item).HaveMagazine;
                    node.getComponent(TLWLSJ_Item).show(true);
                    this.showData();
                }
            })
        }
    }

    showData() {
        this.MagazineContent.removeAllChildren();
        if (!this._haveMagazine) {
            const path = "背包_弹匣包_空";
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${path}`).then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = this.MagazineContent;
            });
        } else {
            this.showMazanie();
        }

        this.showBullet();
    }

    showMazanie() {
        this._weapon = TLWLSJ_GameData.getWeaponByName(this._weaponName) as TLWLSJ_Gun;
        const path: string = "背包_弹匣包_" + this._weaponName;
        this._weapon.HaveMagazine.forEach(e => {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${path}`).then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = this.MagazineContent;
                if (!this._isCheckMagazine && e.Bullets.length < e.Capacity) {
                    this._isCheckMagazine = true;
                    node.getComponent(TLWLSJ_Item).showMagazine();
                }
                // node.getComponent(Item).showMagazine(e.Bullets.length, e.Capacity);
                node.getComponent(TLWLSJ_Item).addMagazine(e);
            });
        })
        const path1 = "背包_弹匣包_新建";
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${path1}`).then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = this.MagazineContent;
        });
    }

    showBullet() {
        this.BulletContent.removeAllChildren();
        const bullets: TLWLSJ_Bullet[] = TLWLSJ_GameData.getBulletByWeapon(TLWLSJ_WEAPON[this._weaponName]);
        if (bullets.length == 0) {
            this.CheckedBullet = null;
            const path = "背包_子弹包_空";
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${path}`).then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = this.BulletContent;
            });
        } else {
            for (let i = 0; i < bullets.length; i++) {
                const bullet: TLWLSJ_Bullet = bullets[i];
                const path = "背包_子弹包_" + bullet.Name;
                BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `${path}`).then((prefab: Prefab) => {
                    const node: Node = instantiate(prefab);
                    node.parent = this.BulletContent;
                    node.getComponent(TLWLSJ_Item).addBulletTs(bullet);
                    if (i == 0 && this._isCheckMagazine) {
                        this.CheckedBullet = node.getComponent(TLWLSJ_Item);
                        node.getComponent(TLWLSJ_Item).show(true);
                    }
                });
            }
        }
    }

    switchWeapon(weaponItem: TLWLSJ_Item) {
        this._isCheckMagazine = false;
        this._weaponName = weaponItem.Name;
        this._haveMagazine = weaponItem.HaveMagazine;
        weaponItem.show(true);
        this.showData();
    }

    newMagazine() {
        this._isCheckMagazine = false;
        this._weapon.HaveMagazine.push(new TLWLSJ_Magazine(this._weapon.Capacity));
        this.showData();
        TLWLSJ_GameData.DateSave();
    }

}


