import { _decorator, Component, Node } from 'cc';
import { XYMJDWY_AudioManager } from '../XYMJDWY_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_BlackMarket')
export class XYMJDWY_BlackMarket extends Component {
    start() {

    }
    OnExit() {
        this.node.active = false;
        XYMJDWY_AudioManager.globalAudioPlay("点击");
    }

}


