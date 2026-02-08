import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import Banner from '../../../../Scripts/Banner';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_AddknapsackCapacityPanel')
export class SJZGMMT_AddknapsackCapacityPanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.AddknapsackCapacityPanel);
                break;
            case "确定":
                Banner.Instance.ShowVideoAd(() => {
                    SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.AddknapsackCapacityPanel);
                    SJZGMMT_GameManager.Instance.knapsackCapacity += 30;
                    SJZGMMT_GameManager.Instance.IsAddknapsackCapacity = true;
                    SJZGMMT_UIManager.Instance.ShowText("背包扩容成功！");
                    director.getScene().emit(SJZGMMT_EventManager.背包扩容);
                })
                break;
        }
    }
}


