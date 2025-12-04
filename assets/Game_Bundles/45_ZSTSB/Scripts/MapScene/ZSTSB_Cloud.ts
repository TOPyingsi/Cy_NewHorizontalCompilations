import { _decorator, Component, Node, tween, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Cloud')
export class ZSTSB_Cloud extends Component {

    @property()
    x: number = 0;

    @property()
    y: number = 10;

    startPos: Vec3 = v3(0, 0, 0);
    start() {
        this.startPos = this.node.position.clone();
    }

    protected onEnable(): void {
        this.moveSelf();
    }

    protected onDisable(): void {
        tween(this.node).stop();
        this.node.position = this.startPos;
    }

    sign: number = 1;
    moveSelf() {
        tween(this.node)
            .by(1, { position: v3(this.x * this.sign, this.y * this.sign, 0) })
            .call(() => {
                this.sign = -this.sign;
                this.moveSelf();
            })
            .start();
    }
}


