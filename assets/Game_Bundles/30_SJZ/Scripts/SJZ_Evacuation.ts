import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view, Collider2D, IPhysics2DContact, Contact2DType, instantiate, Prefab, Enum, CCString } from 'cc';
import { SJZ_Constant } from './SJZ_Constant';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_LvManager } from './SJZ_LvManager';
import { SJZ_DataManager } from './SJZ_DataManager';
const { ccclass, property } = _decorator;


@ccclass('SJZ_Evacuation')
export default class SJZ_Evacuation extends Component {
    collider: BoxCollider2D | null = null;

    @property(CCString)
    EvacuationSite: string = "";

    onLoad() {
        this.collider = this.node.getComponent(BoxCollider2D);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == SJZ_Constant.Group.Player) {
            SJZ_LvManager.Instance.matchData.EvacuationSite = this.EvacuationSite;
            let tip = "";
            let result = SJZ_DataManager.PlayerData.GetBackpackItem("摄影机") && SJZ_DataManager.PlayerData.GetBackpackItem("稳定型芯片A");
            if (SJZ_LvManager.Instance.MapName == "训练场") {
                if (!result) tip = "还有容器没被搜索";
            }

            EventManager.Scene.emit(SJZ_Constant.Event.SHOW_EVACUATION, tip);
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == SJZ_Constant.Group.Player) {
            EventManager.Scene.emit(SJZ_Constant.Event.HIDE_EVACUATION);
        }
    }

    protected onEnable(): void {
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    protected onDisable(): void {
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
}