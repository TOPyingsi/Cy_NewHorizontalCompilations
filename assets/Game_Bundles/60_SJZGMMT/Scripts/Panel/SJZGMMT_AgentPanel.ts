import { _decorator, Component, EventTouch, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_AgentPanel')
export class SJZGMMT_AgentPanel extends PanelBase {


    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }

    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                // SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.AgentPanel);
                break;


        }
    }
}


