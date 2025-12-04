import { _decorator, Component, director, Node } from 'cc';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import ZWDZJS_GameManager from './ZWDZJS_GameManager';
const { ccclass, property } = _decorator;

@ccclass('ZWDZJS_Start')
export class ZWDZJS_Start extends Component {
    start() {

    }

    //开始游戏
    GoGame() {
        ZWDZJS_GameManager.GameMode = "Q版";
        UIManager.ShowPanel(Panel.LoadingPanel, ["ZWDZJS_Game_QBan"]);
        // director.loadScene("ZWDZJS_Game");
    }
    //星球版
    XinQiuClick() {
        ZWDZJS_GameManager.GameMode = "星空版";
        UIManager.ShowPanel(Panel.LoadingPanel, ["ZWDZJS_Game_TaiKon"]);
        // director.loadScene("ZWDZJS_Game");
    }
}


