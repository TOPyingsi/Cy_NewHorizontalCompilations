import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { SJZXD_Unit } from './SJZXD_Unit';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_AttackBox')
export class SJZXD_AttackBox extends Component {
    public _camp: number = 0;
    public _attack: number = 0;
    onLoad() {
        this.node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
    }
    //触碰到单位
    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.getComponent(SJZXD_Unit)) {
            if (otherCollider.node.getComponent(SJZXD_Unit)?.Camp != this._camp) {
                otherCollider.node.getComponent(SJZXD_Unit).TakeDamage(this._attack);
            }
        }
    }

}


