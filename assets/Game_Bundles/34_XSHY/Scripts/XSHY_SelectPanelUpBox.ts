import { _decorator, Component, director, Node } from 'cc';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_GameData } from './XSHY_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XSHY_AudioManager } from './XSHY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_SelectPanelUpBox')
export class XSHY_SelectPanelUpBox extends Component {
    private IsUnLuck: boolean = false;
    protected onEnable(): void {
        this.Show();
    }
    OnClick() {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        if (this.IsUnLuck) {
            director.getScene().emit(XSHY_EasyControllerEvent.选中角色, this.node.name);
        } else {
            UIManager.ShowTip("请先在商店解锁该角色！");
        }
    }


    Show() {
        if (XSHY_GameData.Instance.UnLook.indexOf(this.node.name) != -1) {
            this.IsUnLuck = true;
            this.node.getChildByName("锁定框").active = false;
        } else {
            this.IsUnLuck = false;
            this.node.getChildByName("锁定框").active = true;
        }
    }
}


