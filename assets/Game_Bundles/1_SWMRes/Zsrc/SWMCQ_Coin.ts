
import { _decorator, Component, tween, Tween, UIOpacity, v3, Vec3 } from "cc";
import SWMCQ_GameData from "./SWMCQ_GameData";
import SWMCQ_GameUI from "./SWMCQ_GameUI";
import { PoolManager } from "db://assets/Scripts/Framework/Managers/PoolManager";

const { ccclass, property } = _decorator;

@ccclass("Coin")
export default class Coin extends Component {

    @property
    price = 0;

    isCollected = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected onEnable(): void {
        this.isCollected = false;
        this.node.children[0].getComponent(UIOpacity).opacity = 0;
        tween(this.node.children[0])
            .delay(SWMCQ_GameData.randomRange(0, 3))
            .call(() => {
                this.node.children[0].setScale(Vec3.ZERO);
                this.node.children[0].getComponent(UIOpacity).opacity = 255;
                var v = v3();
                tween(this.node.children[0])
                    .to(0.5, {
                        scale: Vec3.multiplyScalar(v, Vec3.ONE, 3)
                    })
                    .delay(5)
                    .call(() => {
                        this.node.children[0].setScale(Vec3.ONE);
                        this.node.children[0].getComponent(UIOpacity).opacity = 255;
                    })
                    .union()
                    .repeatForever()
                    .start();

                tween(this.node.children[0].getComponent(UIOpacity))
                    .to(0.5, { opacity: 0 })
                    .delay(5)
                    .union()
                    .repeatForever()
                    .start();
            })
            .start();
    }

    start() {

    }

    // update (dt) {}

    Collect() {
        Tween.stopAllByTarget(this.node.children[0]);
        this.isCollected = true;
        var x = this;
        tween(this.node)
            .to(0.5, { position: SWMCQ_GameUI.Instance.coinLabel.node.parent.position })
            .call(() => {
                var num = x.price
                SWMCQ_GameUI.Instance.Coins += num;
                PoolManager.PutNode(x.node);
            })
            .start();
    }
}
