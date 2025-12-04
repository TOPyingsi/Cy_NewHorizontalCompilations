import { _decorator, Component, EventTouch, instantiate, JsonAsset, Node, Prefab } from 'cc';
import { TLWLSJ_BulletItem } from './TLWLSJ_BulletItem';
import { TLWLSJ_SHOPITEM } from './TLWLSJ_Constant';
import { TLWLSJ_NumberIncrementLabel } from './TLWLSJ_NumberIncrementLabel';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
import Banner from '../../../Scripts/Banner';

const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Shop')
export class TLWLSJ_Shop extends Component {
    public static Instance: TLWLSJ_Shop = null;

    @property(Node)
    AmmoContent: Node = null;

    @property(Node)
    AmmoPanel: Node = null;

    @property(Node)
    WeaponPanel: Node = null;

    @property(Node)
    PropsPanel: Node = null;

    @property(Node)
    NonePanel: Node = null;

    @property(TLWLSJ_NumberIncrementLabel)
    Gold: TLWLSJ_NumberIncrementLabel = null;

    private _targetPanel: Node = null;

    protected onLoad(): void {
        TLWLSJ_Shop.Instance = this;
        this.initAmmo();
    }

    protected start(): void {
        this.showPanel(this.AmmoPanel);
    }

    switchPanel(type: TLWLSJ_SHOPITEM) {
        let panel: Node = null;
        switch (type) {
            case TLWLSJ_SHOPITEM.AMMO:
                panel = this.AmmoPanel;
                break;
            case TLWLSJ_SHOPITEM.WEAPON:
                panel = this.WeaponPanel;
                break;
            case TLWLSJ_SHOPITEM.PROPS:
                panel = this.PropsPanel;
                break;
            case TLWLSJ_SHOPITEM.NONE:
                panel = this.NonePanel;
                break;
        }
        if (this._targetPanel === panel) return;
        this.showPanel(panel);
    }

    showPanel(panel: Node) {
        if (this._targetPanel) this._targetPanel.active = false;

        this._targetPanel = panel;
        this._targetPanel.active = true;
    }

    initAmmo() {
        BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "AmmoData").then((jsonAsset: JsonAsset) => {
            this.AmmoContent.removeAllChildren();
            const json = jsonAsset.json;
            const names: string[] = Object.keys(json);
            for (let i = 0; i < names.length - 6; i++) {
                const data = json[names[i]];
                BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "商店_Ammo").then((prefab: Prefab) => {
                    const node: Node = instantiate(prefab);
                    node.getComponent(TLWLSJ_BulletItem).init(names[i], data);
                    node.parent = this.AmmoContent;
                })
            }
            this.initGrenade();
        })
    }

    initGrenade() {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "商店_破片手雷").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.getComponent(TLWLSJ_BulletItem).initGrenade("破片手雷");
            node.parent = this.AmmoContent;
        })
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "商店_高爆手雷").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.getComponent(TLWLSJ_BulletItem).initGrenade("高爆手雷");
            node.parent = this.AmmoContent;
        })
    }

    showGold(changeGold: number = 0) {
        TLWLSJ_PrefsManager.Instance.userData.Gold -= changeGold;
        this.Gold.playNumberIncrementTo(TLWLSJ_PrefsManager.Instance.userData.Gold);
    }

    playViedo() {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        Banner.Instance.ShowVideoAd(() => {
            this.showGold(-1000);
        })
    }

    protected onEnable(): void {
        this.showGold();
    }

}


