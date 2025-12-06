import { _decorator, Component, director, EventTouch, Node, Sprite, Texture2D } from 'cc';
import { XSHY_GameManager } from './XSHY_GameManager';
import { XSHY_AudioManager } from './XSHY_AudioManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from '../../../Scripts/GameManager';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('XSHY_Start')
export class XSHY_Start extends Component {
    @property(Node)
    Bg: Node = null;

    start() {

        if (!Banner.TimeMask) {
            XSHY_GameManager.GameMode = "1V1";
            XSHY_GameManager.TeamData[0] = "川尻浩作";
            XSHY_GameManager.TeamData[3] = "空条承太郎";
            XSHY_GameManager.ReSetData();
            director.loadScene("XSHY_Game");
        }

    }



    OnbuttonClick(Btn: EventTouch) {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        if(Btn.target.name!="返回"){
               ProjectEventManager.emit(ProjectEvent.弹出窗口);
        }
        switch (Btn.target.name) {
            case "对战":
                this.Bg.getChildByName("模式选择").active = true;
                break;
            case "商店":
                this.Bg.getChildByName("商店界面").active = true;
                break;
            case "演练":
                XSHY_GameManager.GameMode = "演练";
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


