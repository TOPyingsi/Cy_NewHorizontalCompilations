import { _decorator, Component, RigidBody2D, Node, Vec2, RigidBody, v2, v3, director, misc, Vec3, BoxCollider2D, Contact2DType, Collider2D, IPhysics2DContact, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XGTW_FireGun')
export default class XGTW_FireGun extends Component {
    rigidbody: RigidBody2D | null = null;

    onLoad() {
        this.rigidbody = this.node.getComponent(RigidBody2D);
        // this.node.getComponent(BoxCollider2D).on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);//添加碰撞监听
    }
}