import { _decorator, Collider, Collider2D, Component, Contact2DType, EventTouch, IPhysics2DContact, Node, TERRAIN_SOUTH_INDEX } from 'cc';
import { TLWLSJ_Constant } from './TLWLSJ_Constant';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_VendingMachine')
export class TLWLSJ_VendingMachine extends Component {

    @property
    IsRecharge: boolean = false;

    Collider2D: Collider2D = null;
    Button: Node = null;

    protected onLoad(): void {
        this.Collider2D = this.node.getComponent(Collider2D);
        this.Button = this.node.getChildByName("按钮");

        this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.Collider2D.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    onButtonClick(event: EventTouch) {
        switch (this.node.name) {
            case "贩卖机":
                TLWLSJ_GameManager.Instance.shopBtn();
                break;
            case "咖啡机":
                TLWLSJ_PlayerController.Instance.cure();
                break;
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            this.Button.active = true;
        }

        if (this.IsRecharge) {
            TLWLSJ_GameManager.Instance.IsRecharge = true;
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            this.Button.active = false;
        }

        if (this.IsRecharge) {
            TLWLSJ_GameManager.Instance.IsRecharge = false;
        }
    }
}


