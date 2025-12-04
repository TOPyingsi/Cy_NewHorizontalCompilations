import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XSHY_EasyController, XSHY_EasyControllerEvent } from './XSHY_EasyController';
const { ccclass, property } = _decorator;

@ccclass('XSHY_UI')
export class XSHY_UI extends Component {
    start() {

    }

    OnButtomClick(btn: EventTouch) {
        switch (btn.target.name) {
            case "攻击":
                director.getScene().emit(XSHY_EasyControllerEvent.ATTACK);
                break;

        }
    }
}


