import { _decorator, color, Color, Component, Node, Sprite, spriteAssembler, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_BlankScreen')
export class TLWLSJ_BlankScreen extends Component {

    show(cb: Function = null) {
        const uiOpacity: UIOpacity = this.getComponent(UIOpacity);
        tween(uiOpacity)
            .to(1, { opacity: 255 }, { easing: `smooth` })
            .delay(0.5)
            .call(() => {
                cb && cb();
            })
            .to(1, { opacity: 0 }, { easing: `smooth` })
            .call(() => {
                this.node.destroy();
            })
            .start()
    }

}


