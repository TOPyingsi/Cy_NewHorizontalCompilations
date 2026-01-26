import { _decorator, Component, EventTouch, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_AgentPanel')
export class SJZXD_AgentPanel extends PanelBase {


    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }

    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                // SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.AgentPanel);
                break;


        }
    }
}


