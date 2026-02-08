import { _decorator, Component, director, EventTouch, Node, Sprite, Texture2D } from 'cc';
import { ATZJ_GameManager } from './ATZJ_GameManager';
import { ATZJ_AudioManager } from './ATZJ_AudioManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from '../../../Scripts/GameManager';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_Start')
export class ATZJ_Start extends Component {
    @property(Node)
    Bg: Node = null;

    start() {

        if (!Banner.TimeMask) {
            ATZJ_GameManager.GameMode = "1V1";
            ATZJ_GameManager.TeamData[0] = "火柴人";
            ATZJ_GameManager.TeamData[3] = "火柴人";
            ATZJ_GameManager.ReSetData();
            director.loadScene("ATZJ_Game");
        }

    }



    OnbuttonClick(Btn: EventTouch) {
        ATZJ_AudioManager.globalAudioPlay("按钮点击");
        switch (Btn.target.name) {
            case "对战":
                this.Bg.getChildByName("模式选择").active = true;
                break;
            case "商店":
                this.Bg.getChildByName("商店界面").active = true;
                break;
            case "演练":
                ATZJ_GameManager.GameMode = "演练";
                this.Bg.getChildByName("角色选择").active = true;
                break;
            case "无尽试炼":
                this.Bg.getChildByName("无尽试炼界面").active = true;
                break;
            case "强者挑战":
                this.Bg.getChildByName("强者挑战界面").active = true;
                break;
            case "返回":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "像素火影");
                    })
                });
                break;
        }
    }

}


