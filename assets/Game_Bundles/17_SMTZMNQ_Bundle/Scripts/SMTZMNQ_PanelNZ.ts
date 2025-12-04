import { _decorator, Component, EventTouch, Node, Sprite, tween, UIOpacity } from 'cc';
import { SMTZMNQ_Panel } from './SMTZMNQ_Panel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_PanelNZ')
export class SMTZMNQ_PanelNZ extends SMTZMNQ_Panel {

    @property(UIOpacity)
    JT1: UIOpacity = null;

    @property(UIOpacity)
    JT2: UIOpacity = null;

    @property(Sprite)
    Sprite1: Sprite = null;

    @property(Sprite)
    Sprite2: Sprite = null;

    @property(Sprite)
    Sprite3: Sprite = null;

    @property(Sprite)
    Sprite4: Sprite = null;

    @property(Sprite)
    XDT1: Sprite = null;

    @property(Sprite)
    XDT2: Sprite = null;

    protected start(): void {
        this.fill();
        this.flicker();
        this.XDTFill();
    }


    flicker() {
        tween(this.JT1)
            .to(2, { opacity: 100 }, { easing: `sineOut` })
            .delay(0.5)
            .to(2, { opacity: 255 }, { easing: `sineOut` })
            .union()
            .repeatForever()
            .start();

        tween(this.JT2)
            .to(2, { opacity: 100 }, { easing: `sineOut` })
            .delay(0.5)
            .to(2, { opacity: 255 }, { easing: `sineOut` })
            .union()
            .repeatForever()
            .start();
    }

    fill() {
        this.Sprite1.fillRange = 0;
        tween(this.Sprite1)
            .to(12, { fillRange: 1 }, { easing: `sineOut` })
            .delay(0.5)
            .call(() => {
                this.fill();
            })
            .start();

        this.Sprite2.fillRange = 0;
        tween(this.Sprite2)
            .to(12, { fillRange: 1 }, { easing: `sineOut` })
            .delay(0.5)
            .call(() => {
                this.fill();
            })
            .start();

        this.Sprite3.fillRange = 0;
        tween(this.Sprite3)
            .to(12, { fillRange: 1 }, { easing: `sineOut` })
            .delay(0.5)
            .call(() => {
                this.fill();
            })
            .start();

        this.Sprite4.fillRange = 0;
        tween(this.Sprite4)
            .to(12, { fillRange: 1 }, { easing: `sineOut` })
            .delay(0.5)
            .call(() => {
                this.fill();
            })
            .start();

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

}


