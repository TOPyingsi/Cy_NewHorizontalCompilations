import { _decorator, assetManager, AudioSource, Component, director, EventTouch, find, game, native, Node, RichText, Sprite, SpriteFrame, tween, v3, Vec3 } from 'cc';

import { JJHZ_GameManager } from '../Game/JJHZ_GameManager';
import { JJHZ_GameData } from '../JJHZ_GameData';
import { GameManager } from '../../../../Scripts/GameManager';
import Banner from '../../../../Scripts/Banner';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_StartPanel')
export class JJHZ_StartPanel extends Component {
    public static IsOnCe: boolean = true;//是否第一次到主页
    start() {
        // this.SetStarPanel();
        //------广告-------------------------------------------------
        //-------------------------------------------------
        if (!JJHZ_StartPanel.IsOnCe) {
            if (Banner.RegionMask) {
                Banner.Instance.ShowCustomAd();
            }
        } else {
            if (Banner.RegionMask) {

            }
        }
        JJHZ_StartPanel.IsOnCe = false;
        game.frameRate = 59;

        if (JJHZ_GameManager.IsPauseMusic) {
            find("MainBG").getComponent(AudioSource).volume = 0;
        }
        if (Banner.RegionMask) {

        }
        if (Banner.IsShowServerBundle) {
            BundleManager.LoadBundle("4_JJHZ_Bundle2");
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


    hanDes() {
        this.node.getChildByName("小手").active = false;

    }
    //返回主页
    OnReturn() {
        // UIManager.Instance.ShowPanel(Constant.Panel.MoreGamePanel, [true]);
        // director.loadScene(GameManager.StartScene);
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "节奏盒子");
            })
        });
    }
}


