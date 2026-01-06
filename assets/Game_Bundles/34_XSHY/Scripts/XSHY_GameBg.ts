import { _decorator, Component, director, Node, tween, v2, v3 } from 'cc';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
const { ccclass, property } = _decorator;

@ccclass('XSHY_GameBg')
export class XSHY_GameBg extends Component {
    start() {
        director.getScene().on(XSHY_EasyControllerEvent.BeatBack, this.Shak, this)
    }
    Shak(nd: Node, attack: number) {
        let Scale = v2(1.02, 1.02);
        if (attack > 30) {
            Scale = v2(1.03, 1.03)
        }
        if (attack > 60) {
            Scale = v2(1.05, 1.05)
        }
        tween(this.node)
            .to(0.05, { scale: v3(Scale.x, Scale.y, 1) })
            .to(0.05, { scale: v3(1, 1, 1) })
            .start();
    }

}


