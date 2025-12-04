import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { HJMWK_Joystick } from './HJMWK_Joystick';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_ShopAI')
export class HJMWK_ShopAI extends Component {

    @property(Node)
    TargetPanel: Node = null;

    Collider2D: Collider2D = null;

    protected onLoad(): void {
        this.Collider2D = this.getComponent(Collider2D);

        if (this.Collider2D) {
            this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.Collider2D.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == 1 << 1) {
            HJMWK_Joystick.Instance.addTarget(this.TargetPanel);
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == 1 << 1) {
            HJMWK_Joystick.Instance.removeTarget();
        }
    }

}


