import { _decorator, Component, director, Node } from 'cc';
import { ATZJ_EasyControllerEvent } from './ATZJ_EasyController';
import { ATZJ_AudioManager } from './ATZJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_SelectPanelSkillUpBox')
export class ATZJ_SelectPanelSkillUpBox extends Component {
    OnClick() {
        ATZJ_AudioManager.globalAudioPlay("按钮点击");
        director.getScene().emit(ATZJ_EasyControllerEvent.选中通灵, this.node.name);
    }

}


