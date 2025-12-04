import { _decorator, AudioSource, Component, director, EventTouch, find, game, native, Node, RichText, Sprite, SpriteFrame, tween, v3, Vec3 } from 'cc';
import { JJHZWX_GameManager } from './JJHZWX_GameManager';
import { GameManager } from '../../../Scripts/GameManager';
import Banner, { BannerMode } from '../../../Scripts/Banner';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';


const { ccclass, property } = _decorator;

@ccclass('JJHZWX_StartPanel')
export class JJHZWX_StartPanel extends Component {
    public static IsOnCe: boolean = true;//是否第一次到主页
    start() {
        // this.SetStarPanel();
        //------广告-------------------------------------------------
        //-------------------------------------------------
        if (!JJHZWX_StartPanel.IsOnCe) {
            if (Banner.RegionMask) {
                Banner.Instance.ShowCustomAd();
            }
        } else {
            // this.node.getChildByName("主页").active = true;
            if (Banner.RegionMask) {
                Banner.Instance.ShowBannerAd();
            }
        }
        JJHZWX_StartPanel.IsOnCe = false;
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
    OnPrivacyButtonClick() {
        if (Banner.IS_ANDROID) {
            Banner.Instance.AndroidPrivacy();
        } else {
            UIManager.ShowPanel(Panel.PrivacyPanel);
        }
    }
    OnExitPrivacy() {
        this.node.getChildByName("Privacy").active = false;
    }


    OnKeFuClick() {
        Banner.Instance.AndroidKeFu();
    }
    OnMoreGameClick() {
        Banner.Instance.AndroidMoreGame();
    }
    OnZhuXIaoClick() {
        Banner.Instance.Quit();
    }




    //点击开始游戏
    OnGameStarClick() {
        JJHZWX_GameManager.Scene = 0;
        director.loadScene("JJHZWX_Game");
    }


    //返回主页
    OnReturn() {
        director.loadScene(GameManager.StartScene);
    }

    //点击节奏盒子
    OnJieZhouHeZiClick() {
        director.loadScene("HHJZ_Start");
    }
}

