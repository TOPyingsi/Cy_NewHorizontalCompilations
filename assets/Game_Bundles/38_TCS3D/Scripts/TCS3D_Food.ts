import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TCS3D_Food')
export class TCS3D_Food extends Component {

    @property()
    score: number = 5;

    sign: number = 1;
    start() {
        this.moveSelf();
    }


    moveSelf() {
        tween(this.node)
            .by(1, { position: v3(0, 0.05 * this.sign, 0), eulerAngles: v3(0, 60, 0) })
            .call(() => {
                this.sign = -this.sign;
                this.moveSelf();
            })
            .start();
    }
}


