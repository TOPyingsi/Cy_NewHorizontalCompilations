import { _decorator, Component, director, Label, Node, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NQXLC_StartManager')
export class NQXLC_StartManager extends Component {

    @property(Node)
    BG: Node = null;

    @property(UIOpacity)
    TextUIOpacity: UIOpacity = null;

    protected onLoad(): void {
        this.BG.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected start(): void {
        tween(this.TextUIOpacity)
            .to(2, { opacity: 60 }, { easing: `sineOut` })
            .to(2, { opacity: 255 }, { easing: `sineOut` })
            .union()
            .repeatForever()
            .start();
    }

    onTouchEnd(event: TouchEvent) {
        director.loadScene("NQXLC_Game");
    }

}


