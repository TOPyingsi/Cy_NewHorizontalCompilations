import { _decorator, Component, Label, Node, Tween, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

//“购买提示”组件把文字立即显示出来，1 秒后开始 0.5 秒渐隐，期间打断重来会重置动画。

@ccclass('CDXX2_TipsBuy')
export class CDXX2_TipsBuy extends Component {

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


