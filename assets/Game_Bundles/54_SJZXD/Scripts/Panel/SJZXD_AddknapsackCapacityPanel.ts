import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import Banner from '../../../../Scripts/Banner';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_AddknapsackCapacityPanel')
export class SJZXD_AddknapsackCapacityPanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }


    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.AddknapsackCapacityPanel);
                break;
            case "确定":
                Banner.Instance.ShowVideoAd(() => {
                    SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.AddknapsackCapacityPanel);
                    SJZXD_GameManager.Instance.knapsackCapacity += 30;
                    SJZXD_GameManager.Instance.IsAddknapsackCapacity = true;
                    SJZXD_UIManager.Instance.ShowText("背包扩容成功！");
                    director.getScene().emit(SJZXD_EventManager.背包扩容);
                })
                break;
        }
    }
}


