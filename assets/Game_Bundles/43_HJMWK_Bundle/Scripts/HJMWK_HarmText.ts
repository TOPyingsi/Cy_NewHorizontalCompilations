import { _decorator, Component, Label, Node, tween, UIOpacity, v3, Vec3 } from 'cc';
import { HJMWK_PoolManager } from './HJMWK_PoolManager';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_HarmText')
export class HJMWK_HarmText extends Component {

    @property(Label)
    Text: Label = null;

    @property(UIOpacity)
    UIOpacity: UIOpacity = null;

    show(worldPos: Vec3, harm: number) {
        this.UIOpacity.opacity = 255;
        this.Text.string = harm.toFixed(1);
        this.node.setWorldPosition(worldPos);
        tween(this.node)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: `sineOut` })
            .start();

        tween(this.node)
            .by(0.5, { position: v3(0, 160, 0) }, { easing: `sineOut` })
            .call(() => {
                this.hide();
            })
            .start();
    }

    hide() {
        tween(this.UIOpacity)
            .to(1, { opacity: 0 }, { easing: `sineOut` })
            .call(() => {
                // this.node.destroy();
                HJMWK_PoolManager.Instance.PutNode(this.node);
            })
            .start()

        tween(this.node)
            .by(0.5, { position: v3(0, 40, 0) }, { easing: `sineOut` })
            .start();
    }

}


