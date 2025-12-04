import { _decorator, AudioSource, Component, director, EventTouch, find, game, native, Node, RichText, Sprite, SpriteFrame, tween, v3, Vec3 } from 'cc';

import { MFXR_GameManager } from './MFXR_GameManager';
import { GameManager } from '../../../Scripts/GameManager';
import Banner from '../../../Scripts/Banner';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';


const { ccclass, property } = _decorator;

@ccclass('MFXR_StartPanel')
export class MFXR_StartPanel extends Component {
    public static IsOnCe: boolean = true;//是否第一次到主页
    start() {
        // this.SetStarPanel();
        //------广告-------------------------------------------------
        //-------------------------------------------------
        if (!MFXR_StartPanel.IsOnCe) {
            if (Banner.RegionMask) {
                Banner.Instance.ShowCustomAd();
            }
        } else {
            this.node.getChildByName("主页").active = true;
            if (Banner.RegionMask) {

            }
        }
        MFXR_StartPanel.IsOnCe = false;
        game.frameRate = 59;
        // this.Open_Select();
        if (Banner.RegionMask) {
            UIManager.ShowPanel(Panel.TreasureBoxPanel);
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

    OnButtomClick(touch: EventTouch) {
        switch (touch.target.name) {
            case "退出选关":
                this.node.getChildByPath("选关界面").active = false;
                break;
            case "简单":
                MFXR_GameManager.GameScene = 0;
                director.loadScene("MFXR_Game");
                break;
            case "常规":
                MFXR_GameManager.GameScene = 1;
                director.loadScene("MFXR_Game");
                break;
            case "猎奇":
                MFXR_GameManager.GameScene = 2;
                director.loadScene("MFXR_Game");
                break;
            case "疯狂":
                MFXR_GameManager.GameScene = 3;
                director.loadScene("MFXR_Game");
                break;
            case "炼狱":
                MFXR_GameManager.GameScene = 4;
                director.loadScene("MFXR_Game");
                break;
        }

    }


    //点击开始游戏
    OnGameStarClick() {
        this.node.getChildByPath("选关界面").active = true;
    }

    //点击教程
    OnJiaoChengClick() {
        this.node.getChildByPath("教学面板").active = true;
    }
    //点击退出教程
    OnExitJiaoChengClick() {
        this.node.getChildByPath("教学面板").active = false;
    }
    //返回主页
    OnReturn() {
        director.loadScene(GameManager.StartScene);
    }
}


