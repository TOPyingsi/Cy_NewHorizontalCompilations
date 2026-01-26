import { _decorator, Component, EventTouch, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import Banner from '../../../../Scripts/Banner';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_GetCashPanel')
export class SJZXD_GetCashPanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }


    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.GetCashPanel);
                break;
            case "免费获得":
                Banner.Instance.ShowVideoAd(() => {
                    SJZXD_GameData.Instance.ChanggeMoney(2000000);
                    SJZXD_UIManager.Instance.ShowText("获得200W钞票！");
                    SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.GetCashPanel);
                })
                break;
        }
    }
}


