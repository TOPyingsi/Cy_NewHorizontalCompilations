import { _decorator, AudioSource, Button, Component, director, Event, EventHandler, EventTouch, find, instantiate, Label, log, Node, Prefab, resources, RichText, Sprite, SpriteFrame, tween, v3, Vec3 } from 'cc';

import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from '../../../../Scripts/Framework/Managers/ProjectEventManager';
import { MTRNX_GameDate } from '../MTRNX_GameDate';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
import { MTRNX_GameMode } from '../Data/MTRNX_Constant';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_StartPanel')
export class MTRNX_StartPanel extends Component {
    public static IsOnCe: boolean = true;//是否第一次到主页

    //MassacreGame地图是否是boss模式
    public static IsBoss: boolean = false;
    start() {
        MTRNX_GameDate.ReadDate();
        //------广告-------------------------------------------------

        if (MTRNX_StartPanel.IsOnCe) {
            // AudioManager_Mtr.BGMPlay("背景音效");
            // if (Banner.RegionMask) Banner.Instance.ShowBannerAd();
        }
        //-------------------------------------------------
        // if (!StartPanel.IsOnCe) {
        //     UIManager.Instance.ShowPanel(Panel.SelectLvPanel);
        // }
        // StartPanel.IsOnCe = false;
        this.node.setScale(2, 2, 2);
        this.node.setPosition(0, 250, 0);
        tween(this.node).to(0.5, { scale: v3(2.3, 2.3, 2.3), position: Vec3.ZERO }, { easing: `sineOut` }).to(0.5, { scale: Vec3.ONE }, { easing: `expoIn` }).start();
    }
    OnNormalButtonClick() {
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
        // if (GameManager_Mtr.TestMode) {
        //     UIManager.Instance.ShowPanel(Panel.LoadingPanel, ["Game_Mtr"]);
        //     return;
        // }
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_GameManager.GameMode = MTRNX_GameMode.Normal;
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.SelectLvPanel);

    }
    OnEndlessButtonClick() {
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_GameManager.GameMode = MTRNX_GameMode.Endless;
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.SelectLvPanel);
    }
    OnMiniGameButtonClick() {//小游戏模式
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.miniGameSelect);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    OnShaLvGameButtonClick() {//杀戮模式
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        find("Canvas/杀戮模式界面").active = true;
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    OnPrivacyButtonClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.PrivacyPanel, [false]);
    }

    //返回主页
    Back_Main() {
        // AudioManager_Mtr.audiosource.stop();

        //TODO 修改Panel常量的位置
        // UIManager.ShowPanel("Prefabs/UI/MoreGamePanel", true);
        // director.loadScene(GameManager.MainScene);

        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "山海经逆袭");
            })
        });
    }
}


