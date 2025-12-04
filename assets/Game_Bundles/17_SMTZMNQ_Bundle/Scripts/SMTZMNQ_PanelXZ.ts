import { _decorator, Sprite, UIOpacity, tween } from 'cc';
import { SMTZMNQ_Panel } from './SMTZMNQ_Panel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_PanelXZ')
export class SMTZMNQ_PanelXZ extends SMTZMNQ_Panel {

    @property(UIOpacity)
    JT: UIOpacity[] = [];

    @property(Sprite)
    Sprite: Sprite[] = [];

    @property(Sprite)
    XDT1: Sprite = null;

    @property(Sprite)
    XDT2: Sprite = null;

    protected start(): void {
        this.XDTFill();
        this.fill();
        this.flicker();
    }

    XDTFill() {
        this.XDT1.fillRange = 0;
        this.XDT2.fillRange = -0.9;

        tween(this.XDT1)
            .to(8, { fillRange: 1 }, { easing: `sineOut` })
            .call(() => {
                this.XDTFill();
            })
            .start();

        tween(this.XDT2)
            .to(8, { fillRange: 0 }, { easing: `sineOut` })
            .start();
    }

    flicker() {
        for (let i = 0; i < this.JT.length; i++) {
            tween(this.JT[i])
                .to(2, { opacity: 100 }, { easing: `sineOut` })
                .delay(0.5)
                .to(2, { opacity: 255 }, { easing: `sineOut` })
                .union()
                .repeatForever()
                .start();
        }
    }

    fill() {
        for (let i = 0; i < this.Sprite.length; i++) {
            this.Sprite[i].fillRange = 0;
            tween(this.Sprite[i])
                .to(8, { fillRange: 1 }, { easing: `sineOut` })
                .delay(0.5)
                .call(() => {
                    if (i == this.Sprite.length - 1) {
                        this.fill();
                    }
                })
                .start();
        }

    }
}


