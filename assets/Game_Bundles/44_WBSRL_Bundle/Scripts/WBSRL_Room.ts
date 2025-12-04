import { _decorator, Component, instantiate, Node, Prefab, Vec3 } from 'cc';
import { WBSRL_GameManager } from './WBSRL_GameManager';
import { WBSRL_PlotInRoom } from './WBSRL_PlotInRoom';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_Room')
export class WBSRL_Room extends Component {

    @property(Node)
    PlotParent: Node = null;

    @property(Node)
    Corpse: Node = null;

    Init() {
    }

    OpenRoom() {
        this.node.active = true;
    }

    CloseRoom() {
        this.node.active = false;
    }

    AddItemByPrefab(prefab: Prefab) {
        const item: Node = instantiate(prefab);
        item.parent = this.PlotParent;
        item.setPosition(Vec3.ZERO);
        item.getComponent(WBSRL_PlotInRoom)?.Init();
        WBSRL_GameManager.Instance.MapPlot.set(item.name, item);
    }
}


