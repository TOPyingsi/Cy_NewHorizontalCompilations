import { _decorator, Component, Label, Node, Event, Prefab, Vec2, instantiate, Vec3, tween, v3, director, resources, find, Sprite, SpriteFrame } from 'cc';
import NodeUtil from '../../Framework/Utils/NodeUtil';
import Banner, { Channel } from '../../Banner';
import { AudioManager, Audios } from '../../Framework/Managers/AudioManager';
import { Panel, UIManager } from '../../Framework/Managers/UIManager';
import { GameManager } from '../../GameManager';
import { DataManager } from '../../Framework/Managers/DataManager';
import { BannerManager } from '../../Framework/Managers/BannerManager';
import { SJZ_DataManager } from 'db://assets/Game_Bundles/30_SJZ/Scripts/SJZ_DataManager';
const { ccclass, property } = _decorator;


@ccclass('StartPanel')
export default class StartPanel extends Component {
    MoneyLabel: Label | null = null;
    Player: Node | null = null;
    PrivacyButton: Node | null = null;
    KeFuButton: Node | null = null;
    MoreGameButton: Node | null = null;
    QuitButton: Node | null = null;
    BottomRightPin: Node | null = null;
    MoreModeButton: Node | null = null;

    protected onLoad(): void {
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.Player = NodeUtil.GetNode("Player", this.node);
        this.PrivacyButton = NodeUtil.GetNode("PrivacyButton", this.node);
        this.KeFuButton = NodeUtil.GetNode("KeFuButton", this.node);
        this.MoreGameButton = NodeUtil.GetNode("MoreGameButton", this.node);
        this.QuitButton = NodeUtil.GetNode("QuitButton", this.node);
        this.BottomRightPin = NodeUtil.GetNode("BottomRightPin", this.node);
        this.MoreModeButton = NodeUtil.GetNode("MoreModeButton", this.node);
    }

    public static IsfirstStart: boolean = true;
    protected start(): void {
        if (StartPanel.IsfirstStart) {
            //初始化广告控制器
            BannerManager.Instance.Init();
            StartPanel.IsfirstStart = false;
        }

        Banner.Instance.JudgeChannel((channel) => this.SetButtonState(channel));

        GameManager.GameData = DataManager.GetStartGameData();

        //华为
        let isHwNeedLogin = Banner.IS_HUAWEI_QUICK_GAME && !Banner.IsLogin;

        if (isHwNeedLogin) {
            UIManager.ShowPanel(Panel.HwLoginPanel);

            Banner.Instance.HWGameLogin(() => {
                Banner.IsLogin = true;
                UIManager.HidePanel(Panel.HwLoginPanel);
            }, () => {
                UIManager.ShowTip("登陆失败");
            });
        }
    }

    SetButtonState(channel: Channel) {
        if (this.KeFuButton) {
            this.KeFuButton.active = channel == Channel.VivoBtn || channel == Channel.OppoBtn;
        }
        else {
            this.KeFuButton = this.node.getChildByName("Buttons").getChildByName("KeFuButton");
            if (this.KeFuButton) {
                this.KeFuButton.active = channel == Channel.VivoBtn || channel == Channel.OppoBtn;
            }
            else {
                console.error("KeFuButton 不存在");
            }
        }

        if (this.MoreGameButton) {
            this.MoreGameButton.active = channel == Channel.OppoBtn;
        }
        else {
            this.MoreGameButton = this.node.getChildByName("Buttons").getChildByName("MoreGameButton");
            if (this.MoreGameButton) {
                this.MoreGameButton.active = channel == Channel.OppoBtn;
            }
            else {
                console.error("MoreGameButton 不存在");
            }
        }

        if (this.QuitButton) {
            this.QuitButton.active = channel == Channel.HuaweiBtn;
        }
        else {
            this.QuitButton = this.node.getChildByName("Buttons").getChildByName("QuitButton");
            if (this.QuitButton) {
                this.QuitButton.active = channel == Channel.HuaweiBtn;
            }
            else {
                console.error("QuitButton 不存在");
            }
        }

        // this.QuitButton.active = channel == Channel.HuaweiBtn;
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "StartGameButton":
                if (Banner.IsWz) {
                    Banner.Instance.ShowCustomAd();
                }
                if (Banner.IsShowServerBundle) {
                    director.loadScene("GameMode");
                }
                else UIManager.ShowPanel(Panel.LoadingPanel, [GameManager.GameData, GameManager.GameData.startScene]);
                break;

            case "PrivacyButton":
                if (Banner.IS_ANDROID) {
                    Banner.Instance.AndroidPrivacy();
                } else if (Banner.IS_HarmonyOSNext_GAME) {
                    Banner.Instance.HarmonyOsNextPrivacy();
                }
                else {
                    UIManager.ShowPanel(Panel.PrivacyPanel, false);
                }
                break;

            case "KeFuButton":
                Banner.Instance.AndroidKeFu();
                break;
            case "MoreGameButton":
                Banner.Instance.AndroidMoreGame();
                break;
            case "QuitButton":
                Banner.Instance.Quit();
                break;
            case "SettingButton":
                UIManager.ShowPanel(Panel.SettingPanel);
                break;
            //更多模式
            case "MoreModeButton":
                UIManager.ShowPanel(Panel.MoreGamePanel);
                break;

        }
    }
}