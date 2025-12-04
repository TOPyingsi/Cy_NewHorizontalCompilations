import { _decorator, Node, Event, tween, v3, Tween, Label, Sprite, SpriteFrame, Vec3, Prefab, instantiate } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Bacon_Constant } from './Bacon_Constant';
import { Bacon_Manager } from './Bacon_Manager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('Bacon_StartPanel')
export default class Bacon_StartPanel extends PanelBase {
    Panel: Node = null;
    Pan: Sprite = null;
    HandPos: Node = null;
    BaconItemDisplay: Node = null;
    MoreModeButton: Node = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Pan = NodeUtil.GetComponent("Pan", this.node, Sprite);
        this.HandPos = NodeUtil.GetNode("HandPos", this.node);
        this.MoreModeButton = NodeUtil.GetNode("MoreModeButton", this.node);
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `BaconItem`).then((prefab: Prefab) => {
            this.BaconItemDisplay = instantiate(prefab);
            this.BaconItemDisplay.setParent(this.HandPos);
            this.BaconItemDisplay.setPosition(Vec3.ZERO);
        });
        this.RefreshPan();

        ProjectEventManager.emit(ProjectEvent.游戏开始, GameManager.GameData.gameName);
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.MoreModeButton);
    }

    Show() {
        super.Show(this.Panel);
        if (this.BaconItemDisplay) this.BaconItemDisplay.destroy();
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `BaconItem`).then((prefab: Prefab) => {
            this.BaconItemDisplay = instantiate(prefab);
            this.BaconItemDisplay.setParent(this.HandPos);
            this.BaconItemDisplay.setPosition(Vec3.ZERO);
        });
        this.RefreshPan();
    }

    RefreshPan() {
        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Sprites/Skins/Pan_${Bacon_Manager.GetDefaultPan()}`).then((sf: SpriteFrame) => {
            this.Pan.spriteFrame = sf;
        });
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "StartGameButton":
                Bacon_Manager.Instance.ShowGamePanel();
                break;
            case "ShopButton":
                UIManager.ShowBundlePanel(GameManager.GameData.DefaultBundle, Bacon_Constant.UI.BaconShopPanel);
                break;
            case "SettingButton":
                UIManager.ShowPanel(Panel.SettingPanel);
                break;
            case "ReturnButton":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, [GameManager.StartScene], () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, GameManager.GameData.gameName);
                    });
                });
                // UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene);
                break;
            case "BaconBarButton":
                UIManager.ShowBundlePanel(GameManager.GameData.DefaultBundle, Bacon_Constant.UI.BaconShopPanel);
                break;
            case "MoreModeButton":
                UIManager.ShowPanel(Panel.MoreGamePanel);
                break;

        }
    }

    protected onEnable(): void {
        EventManager.on(Bacon_Constant.Event_RefreshPan, this.RefreshPan, this);
    }

    protected onDisable(): void {
        EventManager.off(Bacon_Constant.Event_RefreshPan, this.RefreshPan, this);
    }
}
