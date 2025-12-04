import { _decorator, Component, Label, Node, Event, Prefab, Vec2, instantiate, Vec3, tween, v3, director, resources, find, game } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_PlayerController, { AniState } from "../XGTW_PlayerController";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import XGTW_GameManager from '../XGTW_GameManager';
import { EasingType } from '../../../../Scripts/Framework/Utils/TweenUtil';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import Banner from '../../../../Scripts/Banner';
import { AudioManager, Audios } from '../../../../Scripts/Framework/Managers/AudioManager';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_StartPanel')
export default class XGTW_StartPanel extends Component {
    MoneyLabel: Label | null = null;
    Player: Node | null = null;
    playerCtrl: XGTW_PlayerController = null;
    PrivacyButton: Node | null = null;
    KeFuButton: Node | null = null;
    MoreGameButton: Node | null = null;
    QuitButton: Node | null = null;
    BottomRightPin: Node | null = null;
    GDMSButton: Node | null = null;

    protected onLoad(): void {
        XGTW_GameManager.IsGameOver = false;
        this.LoadResources();
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.Player = NodeUtil.GetNode("Player", this.node);
        this.PrivacyButton = NodeUtil.GetNode("PrivacyButton", this.node);
        this.KeFuButton = NodeUtil.GetNode("KeFuButton", this.node);
        this.MoreGameButton = NodeUtil.GetNode("MoreGameButton", this.node);
        this.QuitButton = NodeUtil.GetNode("QuitButton", this.node);
        this.BottomRightPin = NodeUtil.GetNode("BottomRightPin", this.node);
        this.GDMSButton = NodeUtil.GetNode("GDMSButton", this.node);

        this.RefreshMoney();
        // AudioManager_XGTW.BGMPlay(XGTW_Constant.Audio.BG);
        ProjectEventManager.emit(ProjectEvent.游戏开始, GameManager.GameData.gameName);
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.GDMSButton);
    }

    //**加载需要的资源 */
    async LoadResources() {
        // await Res.loadDir("ab:Audios/", AudioClip, false).then((clips: AudioClip[]) => {
        //     for (let i = 0; i < clips.length; i++) {
        //         AudioManager.ClipMap.set(clips[i].name, clips[i]);
        //     }
        // });
        // console.log("资源加载完成。");
        await XGTW_DataManager.LoadData();
        console.log("修狗突围数据加载完成。");
    }

    protected onDestroy(): void {
        // AudioManager.StopBGM(XGTW_Constant.Audio.BG);
    }
    protected start(): void {
        game.frameRate = 59;

        this.InitPlayer();
        if (Banner.RegionMask) {
            Banner.Instance.ShowCustomAd();
        }

        this.BottomRightPin.children.forEach((e) => e.setPosition(600, e.position.y));

        let delay = 0;
        for (let i = this.BottomRightPin.children.length - 1; i >= 0; i--) {
            const e = this.BottomRightPin.children[i];
            tween(e).delay(delay).to(1, { position: v3(0, e.position.y) }, { easing: EasingType.elasticInOut }).start();
            delay += 0.3;
        }
    }

    RefreshMoney() {
        this.MoneyLabel.string = `${XGTW_DataManager.Money}`;
    }
    RefreshEquip() {
        this.playerCtrl && this.playerCtrl.RefreshEquip();
    }

    InitPlayer() {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `Player`).then((prefab: Prefab) => {
            let player = instantiate(prefab);
            player.setParent(this.Player);
            player.setPosition(Vec3.ZERO);
            this.playerCtrl = player.getComponent(XGTW_PlayerController);
            this.playerCtrl.hpBar.node.active = false;
            this.playerCtrl.PlayAni(AniState.Idle);
        })
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "GeXingHuaButton"://个性化
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.SpecialSkinShopPanel);
                break;
            case "HeiShiButton"://黑市
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.HeiShiPanel);
                break;
            case "ZhanBeiButton"://战备
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.InventoryPanel);
                break;
            case "SeletMapButton":
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.SelectMapPanel);
                break;
            case "StartGameButton":
                if (Banner.RegionMask) {
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.TreasureBox, [() => {
                        UIManager.ShowPanel(Panel.LoadingPanel, XGTW_GameManager.GetSceneName());
                    }]);
                } else {
                    UIManager.ShowPanel(Panel.LoadingPanel, XGTW_GameManager.GetSceneName());
                }
                break;
            case "AddMoneyButton":
                Banner.Instance.ShowVideoAd(() => {
                    XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.GetMoney);
                    XGTW_DataManager.Money += 20000;
                });
                break;
            case "ReturnButton":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, [GameManager.StartScene], () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, GameManager.GameData.gameName);
                    });
                });
                break;
            //动力装甲
            case "DLZJButton":
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.ZhuangJiaPanel);
                break;
            //勘察中心
            case "KCZXButton":
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.SearchPanel);
                break;
            //更多模式
            case "GDMSButton":
                UIManager.ShowPanel(Panel.MoreGamePanel);
                break;

        }
    }

    protected onEnable(): void {
        EventManager.on(XGTW_Event.RefreshEquip, this.RefreshEquip, this);
        EventManager.on(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.RefreshEquip, this.RefreshEquip, this);
        EventManager.off(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
    }
}