import { _decorator, Component, director, Node } from 'cc';
import { ATZJ_EasyControllerEvent } from './ATZJ_EasyController';
import { ATZJ_GameData } from './ATZJ_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { ATZJ_AudioManager } from './ATZJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_SelectPanelUpBox')
export class ATZJ_SelectPanelUpBox extends Component {
    private IsUnLuck: boolean = false;
    protected onEnable(): void {
        this.Show();
    }
    OnClick() {
        ATZJ_AudioManager.globalAudioPlay("按钮点击");
        if (this.IsUnLuck) {
            director.getScene().emit(ATZJ_EasyControllerEvent.选中角色, this.node.name);
        } else {
            UIManager.ShowTip("请先在商店解锁该角色！");
        }
    }


    Show() {
        if (ATZJ_GameData.Instance.UnLook.indexOf(this.node.name) != -1) {
            this.IsUnLuck = true;
            this.node.getChildByName("锁定框").active = false;
        } else {
            this.IsUnLuck = false;
            this.node.getChildByName("锁定框").active = true;
        }
    }
}


