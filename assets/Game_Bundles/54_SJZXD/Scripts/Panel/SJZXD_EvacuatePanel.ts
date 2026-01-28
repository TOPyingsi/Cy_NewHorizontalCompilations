import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import Banner from '../../../../Scripts/Banner';
import { SJZXD_GameManager } from '../SJZXD_GameManager';

const { ccclass, property } = _decorator;

@ccclass('SJZXD_EvacuatePanel')
export class SJZXD_EvacuatePanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }


    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.EvacuatePanel);
                break;
            case "撤离":
                Banner.Instance.ShowVideoAd(() => {
                    SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.EvacuatePanel);
                    SJZXD_GameManager.Instance.Leave();
                })
                break;
        }
    }
}


