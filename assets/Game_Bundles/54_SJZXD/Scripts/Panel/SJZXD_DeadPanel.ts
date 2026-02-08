import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import Banner from '../../../../Scripts/Banner';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { ProjectEvent, ProjectEventManager } from '../../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_DeadPanel')
export class SJZXD_DeadPanel extends PanelBase {
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        ProjectEventManager.emit(ProjectEvent.游戏结束, "三角洲行动")
    }


    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.DeadPanel);
                SJZXD_GameManager.Instance.ExitGame();
                break;
            case "完美撤离":
                Banner.Instance.ShowVideoAd(() => {
                    SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.DeadPanel);
                    SJZXD_GameManager.Instance.Leave();
                })
                break;
            case "恢复满血":
                Banner.Instance.ShowVideoAd(() => {
                    SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.DeadPanel);
                    director.getScene().emit(SJZXD_EventManager.主角复活);
                })
                break;
        }
    }
}


