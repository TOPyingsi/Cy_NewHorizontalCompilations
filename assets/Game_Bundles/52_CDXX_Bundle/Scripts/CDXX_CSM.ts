import { _decorator, Collider2D, Component, Contact2DType, Enum, IPhysics2DContact, Node } from 'cc';
import { CDXX_BG, CDXX_GROUP } from './CDXX_Constant';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import { CDXX_GameManager } from './CDXX_GameManager';
const { ccclass, property } = _decorator;

@ccclass('CDXX_CSM')
export class CDXX_CSM extends Component {

    @property({ type: Enum(CDXX_BG) })
    Target: CDXX_BG = CDXX_BG.凡界_上层;

    @property(Collider2D)
    Collider2D: Collider2D = null;

    IsTrigger: boolean = false;

    protected onEnable(): void {
        this.IsTrigger = false;
        this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    protected onDisable(): void {
        this.Collider2D.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this.IsTrigger) return;
        if (otherCollider.group == CDXX_GROUP.CDXX_Player) {
            this.IsTrigger = true;
            CDXX_GameManager.Instance.ShowLoadingPanel(3, () => {
                CDXX_EventManager.Scene.emit(CDXX_MyEvent.CDXX_BG_SHOW, this.Target);
            })
        }
    }
}


