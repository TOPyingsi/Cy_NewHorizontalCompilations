import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_Const')
export class EMLHJ_Const extends Component {
 

    static EventName = {
        PassGame:"EMLHJ_PassGame",
        StartGame:"EMLHJ_StartGame",
        GameOver:"EMLHJ_GameOver",
        ResetGame:"EMLHJ_ResetGame",
        BackToMainPanel:"EMLHJ_BackToMainPanel",
    }
}


