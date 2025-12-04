import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_StartPanel } from './MTRNX_StartPanel';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_GameMode } from '../Data/MTRNX_Constant';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_SeletGamePanel')
export class MTRNX_SeletGamePanel extends Component {
    Show() {

    }



    OnbuttonClick(btn: EventTouch) {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_StartPanel.IsBoss = false;
        MTRNX_GameManager.GameMode = MTRNX_GameMode.Massacre;
        switch (btn.target.name) {
            case "城区1":
                MTRNX_GameManager.Gamedifficulty = 1;
                break;
            case "城区2":
                MTRNX_GameManager.Gamedifficulty = 2;
                break;
            case "城区3":
                MTRNX_GameManager.Gamedifficulty = 5;
                break;
            case "城区4":
                MTRNX_GameManager.Gamedifficulty = 10;
                break;
            case "城区5":
                MTRNX_GameManager.Gamedifficulty = 25;
                break;
        }
        director.loadScene("MassacreGame");
    }

    //返回
    OnExitClick() {
        MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.SeletGamePanel);
    }


}


