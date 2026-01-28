import { _decorator, Component, director, Node } from 'cc';
import { XSHZ_EasyControllerEvent } from './XSHZ_EasyController';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_SelectPanelSkillUpBox')
export class XSHZ_SelectPanelSkillUpBox extends Component {
    OnClick() {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        director.getScene().emit(XSHZ_EasyControllerEvent.选中通灵, this.node.name);
    }

}


