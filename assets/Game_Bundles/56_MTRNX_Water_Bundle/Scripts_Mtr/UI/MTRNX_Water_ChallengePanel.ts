import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { MTRNX_Water_StartPanel } from './MTRNX_Water_StartPanel';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_GameMode } from '../Data/MTRNX_Water_Constant';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from '../MTRNX_Water_UIManager';



const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_ChallengePanel')
export class MTRNX_Water_ChallengePanel extends Component {
    //boss模式的id
    public static BossName: string = "";
    Show() {

    }
    OnButtonClick(btn: EventTouch) {
        MTRNX_Water_ChallengePanel.BossName = btn.target.name;
        MTRNX_Water_StartPanel.IsBoss = true;
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_GameManager.GameMode = MTRNX_Water_GameMode.Massacre;
        director.loadScene("MassacreGame_Water")
    }
    OnreturnClick() {
        MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.ChallengePanel)
    }
}


