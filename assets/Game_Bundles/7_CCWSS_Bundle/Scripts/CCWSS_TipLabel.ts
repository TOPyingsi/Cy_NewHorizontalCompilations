import { _decorator, Component, find, instantiate, Label, Node, Prefab, tween, UIOpacity, v3, Vec3 } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('CCWSS_TipLabel')
export class CCWSS_TipLabel extends Component {

    TipStr: string[] = [];
    CallBack: Function = null;

    Init(str: string[], cb: Function) {
        this.TipStr = str;
        this.CallBack = cb;
        this.Show();
    }

    Show() {
        this.node.getComponentInChildren(Label).string = this.TipStr[0];
        this.node.children[0].getComponent(UIOpacity).opacity = 0;
        this.node.children[0].setScale(v3(3, 3));
        tween(this.node.children[0])
            .to(2, { scale: Vec3.ONE }, { easing: "circOut" })
            .start();
        tween(this.node.children[0].getComponent(UIOpacity))
            .to(2, { opacity: 255 })
            .call(() => {
                this.TipStr.shift();
                if (this.TipStr.length > 0) {
                    this.Show();
                }
                else {
                    this.CallBack();
                    this.scheduleOnce(() => { this.node.destroy(); });
                }
            })
            .start();
    }
}


