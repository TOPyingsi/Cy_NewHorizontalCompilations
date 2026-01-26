import { _decorator, Component, director, Node } from 'cc';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_OpenButtom')
export class SJZXD_OpenButtom extends Component {
    start() {
        director.getScene().on(SJZXD_EventManager.离开容器范围, () => {
            this.node.active = false;
        }, this);
        director.getScene().on(SJZXD_EventManager.进入容器范围, () => {
            this.node.active = true;
        }, this);
        this.node.active = false;
    }

    OnClick() {
        SJZXD_AudioManager.globalAudioPlay("点击");
        director.getScene().emit(SJZXD_EventManager.点击打开按钮);
    }
}


