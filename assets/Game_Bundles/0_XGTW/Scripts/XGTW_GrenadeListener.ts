import { _decorator, Component, Node, Collider2D, Vec2, Vec3, RigidBody2D } from 'cc';
import { XGTW_Constant } from './Framework/Const/XGTW_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
const { ccclass, property } = _decorator;


@ccclass('XGTW_GrenadeListener')
export default class XGTW_GrenadeListener extends Component {
    nds: Node[] = [];
    protected update(dt: number): void {
        this.node.setPosition(Vec3.ZERO);
    }
    onBeginContact(contact, selfCollider, otherCollider) {
        console.error(otherCollider.name);
        if (otherCollider.node.getComponent(RigidBody2D).group == XGTW_Constant.Group.Player) {
            this.nds.push(otherCollider.node);
        }
    }
    onEndContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.getComponent(RigidBody2D).group == XGTW_Constant.Group.Player) {
            Tools.RemoveItemFromArray(this.nds, otherCollider.node);
        }
    }
}