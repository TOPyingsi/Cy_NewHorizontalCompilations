import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import Banner from '../../../../Scripts/Banner';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_DeadPanel')
export class SJZGMMT_DeadPanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }


    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.DeadPanel);
                SJZGMMT_GameManager.Instance.ExitGame();
                break;
            case "完美撤离":
                Banner.Instance.ShowVideoAd(() => {
                    SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.DeadPanel);
                    SJZGMMT_GameManager.Instance.Leave();
                })
                break;
            case "恢复满血":
                Banner.Instance.ShowVideoAd(() => {
                    SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.DeadPanel);
                    director.getScene().emit(SJZGMMT_EventManager.主角复活);
                })
                break;
        }
    }
}


