import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { MTRNX_StartPanel } from './MTRNX_StartPanel';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_GameMode } from '../Data/MTRNX_Constant';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';



const { ccclass, property } = _decorator;

@ccclass('MTRNX_ChallengePanel')
export class MTRNX_ChallengePanel extends Component {
    //boss模式的id
    public static BossName: string = "";
    Show() {

    }
    OnButtonClick(btn: EventTouch) {
        MTRNX_ChallengePanel.BossName = btn.target.name;
        MTRNX_StartPanel.IsBoss = true;
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_GameManager.GameMode = MTRNX_GameMode.Massacre;
        director.loadScene("MassacreGame")
    }
    OnreturnClick() {
        MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.ChallengePanel)
    }
}


