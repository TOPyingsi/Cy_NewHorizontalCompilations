import { _decorator, Component, Label, math, random, RichText, tween, Tween, UIOpacity, v3, Vec3 } from 'cc';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
const { ccclass, property } = _decorator;

@ccclass('SJZ_FloatingText')
export class SJZ_FloatingText extends Component {
    label: Label | null = null!;

    protected onLoad(): void {
        this.label = this.node.getChildByName(`Label`).getComponent(Label);
    }

    Show(content: string, colorHex: string, outlineColorHex: string, delay: number = 0.35, type: number = 1) {
        this.node.setScale(Vec3.ONE);
        this.label.color = Tools.GetColorFromHex(colorHex);
        this.label.outlineColor = Tools.GetColorFromHex(outlineColorHex);

        this.label.string = content;
        if (this.label.node.getComponent(UIOpacity)) this.label.node.getComponent(UIOpacity).opacity = 255;
        else this.label.node.addComponent(UIOpacity);

        Tween.stopAllByTarget(this.node);
        Tween.stopAllByTarget(this.label.node);

        switch (type) {
            case 1:
                this.ShowTween1(delay);
                break;
            case 2:
                this.ShowTween2(delay);
                break;
            default:
                this.ShowTween1(delay);
                break;
        }
    }
    ShowTween1(delay: number) {
        this.node.setScale(Vec3.ZERO);
        tween(this.node)
            .to(0.2, { scale: Vec3.ONE }, { easing: `backOut` })
            .delay(delay)
            .call(() => tween(this.label.node.getComponent(UIOpacity)).to(0.25, { opacity: 100 }).start())
            .to(0.25, { position: v3(this.node.position.x + math.random() * 100 * (math.random() > 0.5 ? -1 : 1), this.node.position.y + 150) })
            .call(() => SJZ_PoolManager.Instance.Put(this.node))
            .start();
    }
    ShowTween2(delay: number) {
        tween(this.label.node.getComponent(UIOpacity)).delay(delay).to(0.25, { opacity: 0 }).start();
        tween(this.node).delay(delay).to(0.25, { position: v3(0, 250) }).call(() => { SJZ_PoolManager.Instance.Put(this.node) }).start();
    }
}