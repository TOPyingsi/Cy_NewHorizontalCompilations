import { _decorator, Component, director, Node } from 'cc';
import { XSHZ_EasyControllerEvent } from './XSHZ_EasyController';
import { XSHZ_GameData } from './XSHZ_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_SelectPanelUpBox')
export class XSHZ_SelectPanelUpBox extends Component {
    private IsUnLuck: boolean = false;
    protected onEnable(): void {
        this.Show();
    }
    OnClick() {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        if (this.IsUnLuck) {
            director.getScene().emit(XSHZ_EasyControllerEvent.选中角色, this.node.name);
        } else {
            UIManager.ShowTip("请先在商店解锁该角色！");
        }
    }


    Show() {
        if (XSHZ_GameData.Instance.UnLook.indexOf(this.node.name) != -1) {
            this.IsUnLuck = true;
            this.node.getChildByName("锁定框").active = false;
        } else {
            this.IsUnLuck = false;
            this.node.getChildByName("锁定框").active = true;
        }
    }
}


