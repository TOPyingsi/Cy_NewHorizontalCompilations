import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Panel')
export class TLWLSJ_Panel extends Component {
    Panel: Node = null;

    protected onLoad(): void {
        this.Panel = this.node.getChildByName("Panel");
    }

    close(cb: Function = null) {
        tween(this.Panel)
            .to(0.2, { scale: v3(0, 0, 0) }, { easing: `quadOut` })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    protected onEnable(): void {
        this.Panel.scale = v3(0, 0, 0);
        tween(this.Panel)
            .to(0.3, { scale: v3(1, 1, 1) }, { easing: `quadIn` })
            .to(0.1, { scale: v3(1.2, 1.2, 1.2) }, { easing: `quadIn` })
            .to(0.1, { scale: v3(1, 1, 1) }, { easing: `quadIn` })
            .start();
    }
}


