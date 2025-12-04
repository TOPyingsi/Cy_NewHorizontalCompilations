import { _decorator, Component, director, Event, find, instantiate, Prefab } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { PLAY_AUDIO } from './LBB_Event';
import { AUDIO_ENUM, EVENT_ENUM } from './LBB_Enum';
const { ccclass, property } = _decorator;

@ccclass('LBB_MenuManager')
export class LBB_MenuManager extends Component {

    onButtonClick(event: Event) {
        PLAY_AUDIO.emit(EVENT_ENUM.PLAY_AUDIO, AUDIO_ENUM.BUTTON, this);

        switch (event.target.name) {

            case "StartGameButton":
                director.loadScene("Labubu_Game");
                break;

            case "TutorialButton":
                BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "Tutorial").then((prefab: Prefab) => {
                    const tu = instantiate(prefab);
                    tu.parent = find("Canvas");
                });
                break;

            case "CloseButton":
                const x = find("Canvas/Tutorial");
                if (x) x.destroy();
                break;

            default:
                console.error("错误的button", event.target.name);
                break
        }
    }
}


