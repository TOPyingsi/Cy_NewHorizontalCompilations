import { _decorator, CircleCollider2D, Component, Graphics, HingeJoint2D, Node, RigidBody2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bacon_Joint')
export class Bacon_Joint extends Component {
    rigid: RigidBody2D = null;
    joint: HingeJoint2D = null;
    collider: CircleCollider2D = null;

    protected onLoad(): void {
        this.rigid = this.node.getComponent(RigidBody2D);
        this.joint = this.node.getComponent(HingeJoint2D);
        this.collider = this.node.getComponent(CircleCollider2D);
    }
}