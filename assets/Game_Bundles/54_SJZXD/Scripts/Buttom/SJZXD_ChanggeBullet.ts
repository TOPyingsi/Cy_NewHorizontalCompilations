import { _decorator, Component, director, Node } from 'cc';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_ChanggeBullet')
export class SJZXD_ChanggeBullet extends Component {
    start() {

    }

    OnClick() {
        director.getScene().emit(SJZXD_EventManager.换弹键按下);
    }
}


