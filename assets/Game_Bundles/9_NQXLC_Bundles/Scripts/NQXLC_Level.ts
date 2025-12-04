import { _decorator, Component, Enum, instantiate, Node, Prefab } from 'cc';
import { LEVEL } from './NQXLC_Constant';
import { NQXLC_Dialog } from './NQXLC_Dialog';
import { NQXLC_GameManager } from './NQXLC_GameManager';
import { NQXLC_DialogBox } from './NQXLC_DialogBox';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('NQXLC_Level')
export class NQXLC_Level extends Component {
    @property({ type: Enum(LEVEL) })
    Level: LEVEL = LEVEL.LEVEL1;

    Dialogs: string[] = [];
    IsNext: boolean = true;

    protected onLoad(): void {
        this.Dialogs = NQXLC_Dialog.MainDialog[this.Level];
    }

    startDialog() {
        if (!this.IsNext || this.Dialogs.length <= 0) return;
        this.IsNext = false;
        BundleManager.LoadPrefab("9_NQXLC_Bundles", "Prefabs/对话框").then((prefab: Prefab) => {
            const node: Node = instantiate(prefab);
            node.parent = NQXLC_GameManager.Instance.Canvas;
            node.getComponent(NQXLC_DialogBox).showDialog(this.Dialogs.shift());
        })
    }
}


