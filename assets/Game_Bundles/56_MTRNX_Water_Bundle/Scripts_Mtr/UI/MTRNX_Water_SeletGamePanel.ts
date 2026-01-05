import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
import { MTRNX_Water_StartPanel } from './MTRNX_Water_StartPanel';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_GameMode } from '../Data/MTRNX_Water_Constant';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from '../MTRNX_Water_UIManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_SeletGamePanel')
export class MTRNX_Water_SeletGamePanel extends Component {
    Show() {

    }



    OnbuttonClick(btn: EventTouch) {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_StartPanel.IsBoss = false;
        MTRNX_Water_GameManager.GameMode = MTRNX_Water_GameMode.Massacre;
        switch (btn.target.name) {
            case "城区1":
                MTRNX_Water_GameManager.Gamedifficulty = 1;
                break;
            case "城区2":
                MTRNX_Water_GameManager.Gamedifficulty = 2;
                break;
            case "城区3":
                MTRNX_Water_GameManager.Gamedifficulty = 5;
                break;
            case "城区4":
                MTRNX_Water_GameManager.Gamedifficulty = 10;
                break;
            case "城区5":
                MTRNX_Water_GameManager.Gamedifficulty = 25;
                break;
        }
        director.loadScene("MassacreGame_Water");
    }

    //返回
    OnExitClick() {
        MTRNX_Water_UIManager.Instance.HidePanel(MTRNX_Water_Panel.SeletGamePanel);
    }


}


