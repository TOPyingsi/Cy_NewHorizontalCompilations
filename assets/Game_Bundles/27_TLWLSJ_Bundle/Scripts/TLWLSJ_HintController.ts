import { _decorator, Component, Label, Node, tween, UIOpacity, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_HintController')
export class TLWLSJ_HintController extends Component {

    @property(Label)
    TestLabel: Label = null;

    @property(UIOpacity)
    UIOpacity: UIOpacity = null;


    showHint(test: string) {
        this.TestLabel.string = test;
    }

    protected onEnable(): void {
        this.TestLabel.node.scale = v3(1.2, 1.2, 1.2)
        tween(this.TestLabel.node)
            .to(0.2, { scale: v3(1, 1, 1) })
            .start();

        tween(this.UIOpacity)
            .delay(2)
            .to(1, { opacity: 0 })
            .call(() => {
                this.node.destroy();
            })
            .start();
    }

}


