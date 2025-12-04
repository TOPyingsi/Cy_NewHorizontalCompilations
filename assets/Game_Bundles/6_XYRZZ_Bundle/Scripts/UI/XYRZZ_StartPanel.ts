import { _decorator, Component, director, find, game, native, Node, tween, v3, Vec3 } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from '../XYRZZ_UIManager';

import { XYRZZ_AudioManager } from '../XYRZZ_AudioManager';
import Banner, { BannerMode } from '../../../../Scripts/Banner';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_StartPanel')
export class XYRZZ_StartPanel extends Component {
    @property(Node)
    UImanager: Node = null;
    public static IsOnCe: boolean = true;//是否第一次到主页
    start() {
        director.addPersistRootNode(this.UImanager);
        //------广告-------------------------------------------------
        //-------------------------------------------------
        if (!XYRZZ_StartPanel.IsOnCe) {
            if (Banner.RegionMask) {

            }
        } else {

        }
        XYRZZ_StartPanel.IsOnCe = false;
        game.frameRate = 59;
        if (Banner.IS_ANDROID && Banner.Mode != BannerMode.测试包) {
            var result = native.reflection.callStaticMethod("com/cocos/game/MainActivity", "JudgeChannel", "()Ljava/lang/String;");
            switch (result) {
                case "VivoBtn":
                    find("Canvas/StartPanel/联系客服").active = true;
                    break;
                case "OppoBtn":
                    find("Canvas/StartPanel/联系客服").active = true;
                    find("Canvas/StartPanel/更多精彩").active = true;
                    break;
                case "HuaweiBtn":
                    find("Canvas/StartPanel/注销账号").active = true;
                    break;
            }
        }
    }

    OnStartGameButtonClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");

        XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_LoadingPanel, ["XYRZZ_Game"]);
    }

    OnPrivacyButtonClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        // XYRZZ_UIManager.Instance.ShowPanel(XYRZZ_Panel.XYRZZ_PrivacyPanel, [false]);
        if (Banner.IS_ANDROID) {
            Banner.Instance.AndroidPrivacy();
        } else {
            UIManager.ShowPanel(Panel.PrivacyPanel);
        }
    }
    OnKeFuClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        Banner.Instance.AndroidKeFu();
    }
    OnMoreGameClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        Banner.Instance.AndroidMoreGame();
    }
    OnZhuXIaoClick() {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        Banner.Instance.Quit();
    }

}


