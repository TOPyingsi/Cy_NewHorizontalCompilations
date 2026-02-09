import { _decorator, Component, EventTouch, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import Banner from '../../../../Scripts/Banner';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_GetCashPanel')
export class SJZGMMT_GetCashPanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.GetCashPanel);
                break;
            case "免费获得":
                Banner.Instance.ShowVideoAd(() => {
                    SJZGMMT_GameData.Instance.ChanggeMoney(2000000);
                    SJZGMMT_UIManager.Instance.ShowText("获得200W钞票！");
                    SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.GetCashPanel);
                })
                break;
        }
    }
}


