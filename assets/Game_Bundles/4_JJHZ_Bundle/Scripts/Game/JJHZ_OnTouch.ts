import { _decorator, Component, EventTouch, Node } from 'cc';
import { JJHZ_AudioManager } from '../JJHZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_OnTouch')
export class JJHZ_OnTouch extends Component {
    start() {
        this.node.on(Node.EventType.TOUCH_START, (TouchData: EventTouch) => {
            JJHZ_AudioManager.globalAudioPlay("点击");
            this.OnTouchStar(TouchData);
        }, this);


    }

    //按键按下
    OnTouchStar(TouchData: EventTouch) {


    }
}


