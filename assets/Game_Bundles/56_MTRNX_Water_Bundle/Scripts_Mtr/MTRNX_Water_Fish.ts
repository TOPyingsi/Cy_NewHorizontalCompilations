import { _decorator, CCBoolean, Component, Node, randomRange, tween, UITransform, v3 } from 'cc';
import { MTRNX_Water_GameManager } from './MTRNX_Water_GameManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_Fish')
export class MTRNX_Water_Fish extends Component {

    @property(CCBoolean)
    isLeft = false;

    start() {
        this.Move();
    }

    update(deltaTime: number) {

    }

    Move() {
        let game = MTRNX_Water_GameManager.Instance.GameNode;
        let target = v3();
        let ui = game.getComponent(UITransform);
        target.y = randomRange(0, ui.height / 2);
        let delta = ui.width / 2 + 200;
        target.x += this.isLeft ? delta : -delta;
        this.node.setScale(v3(this.isLeft ? 1 : -1, 1, 1));
        tween(this.node)
            .to(randomRange(10, 20), { position: target })
            .call(() => {
                this.isLeft = !this.isLeft;
                this.Move();
            }).start();
    }

}


