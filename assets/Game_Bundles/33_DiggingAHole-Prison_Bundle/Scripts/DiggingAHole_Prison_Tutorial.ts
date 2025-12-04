import { _decorator, AudioClip, AudioSource, clamp, Component, Event, EventTouch, Label, Node, Sprite, toDegree, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHole_Prison_Tutorial')
export class DiggingAHole_Prison_Tutorial extends Component {

    @property(Node)
    target: Node;

    @property(Node)
    target2: Node;

    protected update(dt: number): void {
        this.node.setWorldPosition(this.target2.getWorldPosition());
        let pos1 = v2(this.target.getWorldPosition().x, this.target.getWorldPosition().z);
        let pos2 = v2(this.node.getWorldPosition().x, this.node.getWorldPosition().z);
        let dir = v2();
        dir = Vec2.subtract(dir, pos1, pos2).normalize();
        let angle = Vec2.angle(dir, Vec2.UNIT_Y);
        angle = toDegree(angle);
        if (pos1.x < pos2.x) angle = -angle;
        this.node.setRotationFromEuler(v3(0, angle));
        let dis = Vec2.distance(pos1, pos2);
        dis = clamp(dis, 1, 3) - 0.5;
        this.node.children[0].setPosition(v3(0, -0.6, dis));
    }

}


