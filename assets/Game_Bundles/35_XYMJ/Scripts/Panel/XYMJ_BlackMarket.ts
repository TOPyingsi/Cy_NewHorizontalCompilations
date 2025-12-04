import { _decorator, Component, Node } from 'cc';
import { XYMJ_AudioManager } from '../XYMJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_BlackMarket')
export class XYMJ_BlackMarket extends Component {
    start() {

    }
    OnExit() {
        this.node.active = false;
        XYMJ_AudioManager.globalAudioPlay("点击");
    }

}


