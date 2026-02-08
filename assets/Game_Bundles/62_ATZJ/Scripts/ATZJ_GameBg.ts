import { _decorator, Component, director, Node, tween, v2, v3 } from 'cc';
import { ATZJ_EasyControllerEvent } from './ATZJ_EasyController';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_GameBg')
export class ATZJ_GameBg extends Component {
    start() {
        director.getScene().on(ATZJ_EasyControllerEvent.BeatBack, this.Shak, this)
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


