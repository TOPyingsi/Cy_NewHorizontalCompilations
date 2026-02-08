import { _decorator, Component, director, Node } from 'cc';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_OpenButtom')
export class SJZGMMT_OpenButtom extends Component {
    start() {
        director.getScene().on(SJZGMMT_EventManager.离开容器范围, () => {
            this.node.active = false;
        }, this);
        director.getScene().on(SJZGMMT_EventManager.离开青铜门范围, () => {
            this.node.active = false;
        }, this);
        director.getScene().on(SJZGMMT_EventManager.进入容器范围, () => {
            this.node.active = true;
        }, this);
        director.getScene().on(SJZGMMT_EventManager.进入青铜门范围, () => {
            this.node.active = true;
        }, this);
        this.node.active = false;
    }

    OnClick() {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        director.getScene().emit(SJZGMMT_EventManager.点击打开按钮);
    }
}


