import { _decorator, Component, Animation } from "cc";
import SWMCQ_GameScene from "./SWMCQ_GameScene";

const { ccclass, property } = _decorator;

@ccclass("SWMCQ_AniEvent")
export default class SWMCQ_AniEvent extends Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    CutPotato() {
        if (SWMCQ_GameScene.Instance.cutPotato) this.getComponent(Animation).play("Cut");
    }

    CutFinish() {
        SWMCQ_GameScene.Instance.CutFinish();
    }
}
