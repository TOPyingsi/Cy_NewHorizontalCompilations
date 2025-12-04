import { _decorator, Component, director, Label, Node } from 'cc';
import { AXBX_Constant } from './AXBX_Constant';
import { AXBX_GameManager } from './AXBX_GameManager';
const { ccclass, property } = _decorator;

@ccclass('AXBX_AudioBtn')
export class AXBX_AudioBtn extends Component {
    private _State: string = "";
    Init(State: string) {
        this._State = State;
        this.node.getChildByName("Label").getComponent(Label).string = State;
    }
    OnClick() {
        let AudioName = AXBX_GameManager.instance.getAudioNameByActionAndGoods(this._State, AXBX_GameManager.instance.AIgoods);
        director.getScene().emit("爱信不信_播放音效", AudioName);
    }

}


