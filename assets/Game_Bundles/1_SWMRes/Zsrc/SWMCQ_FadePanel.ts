import { _decorator, Component, game, tween, UIOpacity } from "cc";

const { ccclass, property } = _decorator;

@ccclass("FadePanel")
export default class FadePanel extends Component {


    public static get Instance(): FadePanel {
        return this.instance;
    }


    private static instance: FadePanel;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (!FadePanel.instance) {
            FadePanel.instance = this;
            game.addPersistRootNode(this.node.parent);
        }
    }

    start() {

    }

    // update (dt) {}

    FadeIn(call?: Function) {
        FadePanel.Instance.node.children[0].active = true;
        tween(FadePanel.Instance.node.children[0].getComponent(UIOpacity))
            .to(1, { opacity: 255 })
            .call(() => {
                call && call();
            })
            .start();
    }

    FadeOut(call?: Function) {
        if (!FadePanel.Instance.node.children[0].active) return;
        tween(FadePanel.Instance.node.children[0].getComponent(UIOpacity))
            .to(1, { opacity: 0 })
            .call(() => {
                call && call();
                FadePanel.Instance.node.children[0].active = false;
            })
            .start();
    }
}
