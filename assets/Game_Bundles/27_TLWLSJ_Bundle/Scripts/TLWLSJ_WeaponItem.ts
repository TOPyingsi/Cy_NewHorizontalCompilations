import { _decorator, Component, Enum, EventTouch, find, instantiate, Node, Prefab } from 'cc';
import { TLWLSJ_WEAPON } from './TLWLSJ_Constant';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { TLWLSJ_Shop } from './TLWLSJ_Shop';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_WeaponItem')
export class TLWLSJ_WeaponItem extends Component {

    @property({ type: Enum(TLWLSJ_WEAPON) })
    Type: TLWLSJ_WEAPON = TLWLSJ_WEAPON.自动手枪;

    @property
    Price: number = 0;

    Have: Node = null;
    NoHave: Node = null;

    protected onLoad(): void {
        this.Have = find("拥有/拥有", this.node);
        this.NoHave = find("拥有/未拥有", this.node);
        this.Have.on(Node.EventType.TOUCH_END, this.onHaveTouchEnd, this);
        this.NoHave.on(Node.EventType.TOUCH_END, this.onNoHaveTouchEnd, this);
    }

    protected start(): void {
        this.show();
    }

    show() {
        if (TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.findIndex(e => e == this.Type) == -1) {
            this.Have.active = false;
            this.NoHave.active = true;
        } else {
            this.Have.active = true;
            this.NoHave.active = false;
        }
    }

    onHaveTouchEnd(event: EventTouch) {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = TLWLSJ_GameManager.Instance.Canvas;
            const hint: string = `已经拥有！`;
            node.getComponent(TLWLSJ_HintController).showHint(hint);
        })
    }

    onNoHaveTouchEnd(event: EventTouch) {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        let hint: string = "";
        if (TLWLSJ_PrefsManager.Instance.userData.Gold >= this.Price) {
            TLWLSJ_PrefsManager.Instance.userData.HaveWeapon.push(this.Type);
            TLWLSJ_Shop.Instance.showGold(this.Price);
            TLWLSJ_GameData.addWeaponByType(this.Type);
            TLWLSJ_GameData.DateSave();
            TLWLSJ_PrefsManager.Instance.saveData();
            TLWLSJ_UIManager.Instance.showWeapon();
            this.show();
            hint = `购买成功！恭喜获得：` + TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, this.Type);
        } else {
            hint = `余额不足！`;
        }
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = TLWLSJ_GameManager.Instance.Canvas;
            node.getComponent(TLWLSJ_HintController).showHint(hint);
        })
    }
}


