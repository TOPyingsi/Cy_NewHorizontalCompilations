import { _decorator, Component, director, EventTouch, Node, Sprite, Texture2D } from 'cc';
import { XSHZ_GameManager } from './XSHZ_GameManager';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from '../../../Scripts/GameManager';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_Start')
export class XSHZ_Start extends Component {
    @property(Node)
    Bg: Node = null;

    start() {

        if (!Banner.TimeMask) {
            XSHZ_GameManager.GameMode = "1V1";
            XSHZ_GameManager.TeamData[0] = "路飞";
            XSHZ_GameManager.TeamData[3] = "空条承太郎";
            XSHZ_GameManager.ReSetData();
            director.loadScene("XSHZ_Game");
        }

    }



    OnbuttonClick(Btn: EventTouch) {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        switch (Btn.target.name) {
            case "对战":
                this.Bg.getChildByName("模式选择").active = true;
                break;
            case "商店":
                this.Bg.getChildByName("商店界面").active = true;
                break;
            case "演练":
                XSHZ_GameManager.GameMode = "演练";
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


