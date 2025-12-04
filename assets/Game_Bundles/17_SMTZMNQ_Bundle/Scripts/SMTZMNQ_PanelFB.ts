import { _decorator, Sprite, tween, UIOpacity } from 'cc';
import { SMTZMNQ_Panel } from './SMTZMNQ_Panel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_PanelFB')
export class SMTZMNQ_PanelFB extends SMTZMNQ_Panel {

    @property(UIOpacity)
    JT: UIOpacity = null;

    @property(Sprite)
    Sprite: Sprite = null;

    protected start(): void {
        this.fill();
        this.flicker();
    }


    flicker() {
        tween(this.JT)
            .to(2, { opacity: 100 }, { easing: `sineOut` })
            .delay(0.5)
            .to(2, { opacity: 255 }, { easing: `sineOut` })
            .union()
            .repeatForever()
            .start();
    }

    fill() {
        this.Sprite.fillRange = 0;
        tween(this.Sprite)
            .to(8, { fillRange: 1 }, { easing: `sineOut` })
            .delay(0.5)
            .call(() => {
                this.fill();
            })
            .start();

    }

}


