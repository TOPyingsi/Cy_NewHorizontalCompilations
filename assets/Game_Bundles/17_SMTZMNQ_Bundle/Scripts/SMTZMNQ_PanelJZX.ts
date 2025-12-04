import { _decorator, Component, UIOpacity, Sprite, Node, tween } from 'cc';
import { SMTZMNQ_Panel } from './SMTZMNQ_Panel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_PanelJZX')
export class SMTZMNQ_PanelJZX extends SMTZMNQ_Panel {

    @property(UIOpacity)
    JT: UIOpacity[] = [];

    @property(Sprite)
    Sprite: Sprite[] = [];

    protected start(): void {
        this.fill();
        this.flicker();
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


