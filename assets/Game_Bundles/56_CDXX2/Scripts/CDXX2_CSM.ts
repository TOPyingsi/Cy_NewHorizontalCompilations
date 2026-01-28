import { _decorator, Collider2D, Component, Contact2DType, Enum, IPhysics2DContact, Node } from 'cc';
import { CDXX2_BG, CDXX2_GROUP } from './CDXX2_Constant';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_GameManager } from './CDXX2_GameManager';
const { ccclass, property } = _decorator;

//“传送门”碰撞体，玩家一碰就锁触发，通知 GameManager 弹出 3 秒 Loading 条，随后切换到指定背景地图。

@ccclass('CDXX2_CSM')
export class CDXX2_CSM extends Component {

    @property({ type: Enum(CDXX2_BG) })
    Target: CDXX2_BG = CDXX2_BG.凡界_上层;

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
        if (otherCollider.group == CDXX2_GROUP.CDXX2_Player) {
            this.IsTrigger = true;
            CDXX2_GameManager.Instance.ShowLoadingPanel(3, () => {
                CDXX2_EventManager.Scene.emit(CDXX2_MyEvent.CDXX2_BG_SHOW, this.Target);
            })
        }
    }
}


