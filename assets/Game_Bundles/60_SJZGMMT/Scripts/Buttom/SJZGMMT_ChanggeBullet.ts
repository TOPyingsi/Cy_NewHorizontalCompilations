import { _decorator, Component, director, Node } from 'cc';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_ChanggeBullet')
export class SJZGMMT_ChanggeBullet extends Component {
    start() {

    }

    OnClick() {
        director.getScene().emit(SJZGMMT_EventManager.换弹键按下);
    }
}


