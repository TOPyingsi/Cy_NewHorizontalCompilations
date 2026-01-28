import { _decorator, Component, Label, Node, tween, UIOpacity, v3, Vec3 } from 'cc';
import { CDXX2_PoolManager } from './CDXX2_PoolManager';
const { ccclass, property } = _decorator;

//“伤害数字”从对象池取出后，在目标世界坐标处先放大+上升，再渐隐并继续上浮，动画结束自动回池。

@ccclass('CDXX2_HarmText')
export class CDXX2_HarmText extends Component {

    Text: Label = null;
    UIOpacity: UIOpacity = null;

    protected onLoad(): void {
        this.Text = this.getComponent(Label);
        this.UIOpacity = this.getComponent(UIOpacity);
    }

    show(worldPos: Vec3, harm: number) {
        this.UIOpacity.opacity = 255;
        this.Text.string = harm.toString();
        this.node.setWorldPosition(worldPos);
        tween(this.node)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: `sineOut` })
            .start();

        tween(this.node)
            .by(0.5, { position: v3(0, 160, 0) }, { easing: `sineOut` })
            .call(() => {
                this.hide();
            })
            .start();
    }

    // 显示文字提示（用于商店等场景）
    showText(worldPos: Vec3, text: string) {
        this.UIOpacity.opacity = 255;
        this.Text.string = text;
        this.node.setWorldPosition(worldPos);
        tween(this.node)
            .to(0.5, { scale: v3(1, 1, 1) }, { easing: `sineOut` })
            .start();

        tween(this.node)
            .by(0.5, { position: v3(0, 160, 0) }, { easing: `sineOut` })
            .call(() => {
                this.hide();
            })
            .start();
    }

    hide() {
        tween(this.UIOpacity)
            .to(1, { opacity: 0 }, { easing: `sineOut` })
            .call(() => {
                CDXX2_PoolManager.Instance.put(this.node);
            })
            .start()

        tween(this.node)
            .by(0.5, { position: v3(0, 40, 0) }, { easing: `sineOut` })
            .start();
    }

}


