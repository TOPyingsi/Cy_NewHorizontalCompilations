import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { TLWLSJ_Constant } from './TLWLSJ_Constant';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_RangeSensor')
export class TLWLSJ_RangeSensor extends Component {
    Collider2D: Collider2D = null;

    protected onLoad(): void {
        this.Collider2D = this.getComponent(Collider2D);

        if (this.Collider2D) {
            this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            TLWLSJ_GameManager.Instance.startGame();
        }
    }
}


