import { _decorator, Component, director, Node, sys, } from 'cc';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { TLWLSJ_WEAPON } from './TLWLSJ_Constant';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_Panel } from './TLWLSJ_Panel';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { TLWLSJ_PrefsManager } from './TLWLSJPrefsManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_MenuManager')
export class TLWLSJ_MenuManager extends Component {
    @property(Node)
    newGamePanel: Node = null;

    @property(Node)
    LoadPanel: Node = null;

    protected onLoad(): void {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "逃离物理试卷");
    }

    protected start(): void {
        TLWLSJ_AudioManager.PlayMusic(Audios.BGM);
    }

    newGameBtn() {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        this.newGamePanel.active = true;
    }

    goOnBtn() {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        this.LoadPanel.active = true;
        TLWLSJ_PrefsManager.Instance.userData.AllWeapon.forEach(e => {
            TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, e);
            TLWLSJ_GameData.addWeaponByType(e);
        })
        director.loadScene("TLWLSJ_Game");
    }

    startNewGame() {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        this.LoadPanel.active = true;
        sys.localStorage.removeItem("TLWLSJ_GAMEDATA");
        sys.localStorage.removeItem("TLWLSJ_USERData");
        TLWLSJ_PrefsManager.Instance.userData.AllWeapon.forEach(e => {
            TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_WEAPON, e);
            TLWLSJ_GameData.addWeaponByType(e);
        })
        director.loadScene("TLWLSJ_Game");

    }

    closeNewGameBtn() {
        TLWLSJ_AudioManager.PlaySound(Audios.ButtonClick);
        this.close(this.newGamePanel);
    }

    close(panel: Node) {
        panel.getComponent(TLWLSJ_Panel).close(() => {
            panel.active = false;
        });
    }

    breakBtn() {
        director.loadScene(GameManager.StartScene);
    }
}


