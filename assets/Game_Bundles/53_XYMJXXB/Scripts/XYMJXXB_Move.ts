import { _decorator, Component, Tween, tween, UITransform, Vec3, v3, CCBoolean, CCFloat, Quat, quat, Vec2, v2 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_Move')
export default class XYMJXXB_Move extends Component {
    @property(CCBoolean)
    playOnAwake: boolean = true;

    @property()
    speed: number = 10;

    @property()
    Distance: Vec2 = v2(0, 0);

    @property()
    Isturnto: boolean = false;

    protected onLoad(): void {

        this.Move();
    }

    Move() {

        tween(this.node)
            .by(1 / this.speed, { x: this.Distance.x, y: this.Distance.y })
            .call(() => {
                if (this.Isturnto) {
                    this.node.scale = v3(-this.node.scale.x, this.node.scale.y, this.node.scale.z);
                }
            })
            .by(1 / this.speed, { x: -this.Distance.x, y: -this.Distance.y })
            .call(() => {
                if (this.Isturnto) {
                    this.node.scale = v3(-this.node.scale.x, this.node.scale.y, this.node.scale.z);
                }
            })
            .union().repeatForever().start();
    }


}
