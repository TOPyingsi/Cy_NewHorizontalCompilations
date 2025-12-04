import { _decorator, Component, Enum, EventTouch, find, instantiate, Node, Prefab } from 'cc';
import { PROPS } from './TLWLSJ_Constant';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_HintController } from './TLWLSJ_HintController';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { TLWLSJ_Shop } from './TLWLSJ_Shop';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_PropsItem')
export class TLWLSJ_PropsItem extends Component {

    @property({ type: Enum(PROPS) })
    Type: PROPS = PROPS.药丸;

    @property
    Price: number = 0;

    private _propName: string = "";

    protected onLoad(): void {
        find("购买", this.node).on(Node.EventType.TOUCH_END, this.onBuy, this);
        this._propName = TLWLSJ_Tool.GetEnumKeyByValue(PROPS, this.Type);
    }


    onBuy(event: EventTouch) {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        if (TLWLSJ_PrefsManager.Instance.userData.Gold >= this.Price) {
            TLWLSJ_Shop.Instance.showGold(this.Price);
            TLWLSJ_PrefsManager.Instance.saveData();
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                TLWLSJ_GameData.addPropByType(this.Type);
                const hint: string = `购买成功！${this._propName}:${TLWLSJ_GameData.getPropByType(this.Type)}`;
                node.getComponent(TLWLSJ_HintController).showHint(hint);
                if (this.Type == PROPS.药丸) {
                    TLWLSJ_UIManager.Instance.showYW(1);
                } else if (this.Type == PROPS.咖啡) {
                    TLWLSJ_UIManager.Instance.showKF(1);
                }
            })
        } else {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Hint").then((prefab: Prefab) => {
                const node: Node = instantiate(prefab);
                node.parent = TLWLSJ_GameManager.Instance.Canvas;
                const hint: string = `余额不足！`;
                node.getComponent(TLWLSJ_HintController).showHint(hint);
            })
        }
    }
}


