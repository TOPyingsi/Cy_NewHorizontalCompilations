import { _decorator, Component, director, Event, Node } from 'cc';
import { QLTZ_AudioManager } from './QLTZ_AudioManager';
import { QLTZ_GameMode, QLTZ_UIManager } from './QLTZ_UIManager';
const { ccclass, property } = _decorator;

@ccclass('QLTZ_Start')
export class QLTZ_Start extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    ButtonClick(event: Event) {
        QLTZ_AudioManager.AudioClipPlay("button");
        switch (event.target.name) {
            case "SingleBtn":
                {
                    QLTZ_UIManager.gameMode = QLTZ_GameMode.SingleMode;
                    director.loadScene("QLTZ_Game");
                }
                break;
            case "TwoBtn":
                {
                    QLTZ_UIManager.gameMode = QLTZ_GameMode.TwoMode;
                    director.loadScene("QLTZ_Game");
                }
                break;
        }
    }
}


