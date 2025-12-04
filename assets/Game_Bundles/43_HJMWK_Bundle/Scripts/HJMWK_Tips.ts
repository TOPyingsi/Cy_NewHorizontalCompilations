import { _decorator, Component, Label, Node, Tween, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_Tips')
export class HJMWK_Tips extends Component {

    @property(Label)
    TipsLabel: Label = null;

    @property(UIOpacity)
    UIOpacity: UIOpacity = null;

    show(tips: string) {
        Tween.stopAllByTarget(this.UIOpacity);
        this.TipsLabel.string = tips;
        this.UIOpacity.opacity = 255;
        tween(this.UIOpacity)
            .delay(1)
            .to(0.5, { opacity: 0 }, { easing: `sineOut` })
            .start();
    }
}


