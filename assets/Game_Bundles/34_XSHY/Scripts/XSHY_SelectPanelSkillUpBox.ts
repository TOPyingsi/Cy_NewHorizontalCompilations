import { _decorator, Component, director, Node } from 'cc';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_AudioManager } from './XSHY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_SelectPanelSkillUpBox')
export class XSHY_SelectPanelSkillUpBox extends Component {
    OnClick() {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        director.getScene().emit(XSHY_EasyControllerEvent.选中通灵, this.node.name);
    }

}


