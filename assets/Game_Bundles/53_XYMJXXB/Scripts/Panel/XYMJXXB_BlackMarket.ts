import { _decorator, Component, Node } from 'cc';
import { XYMJXXB_AudioManager } from '../XYMJXXB_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_BlackMarket')
export class XYMJXXB_BlackMarket extends Component {
    start() {

    }
    OnExit() {
        this.node.active = false;
        XYMJXXB_AudioManager.globalAudioPlay("点击");
    }

}


