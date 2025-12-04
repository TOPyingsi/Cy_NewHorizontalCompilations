import { _decorator, Component, Node, Label, Sprite, Toggle, Event, Color, SpriteFrame, v2, color, ScrollView } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_CommonItem from "./XGTW_CommonItem";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import XGTW_GameManager from '../XGTW_GameManager';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import Banner from '../../../../Scripts/Banner';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_SpecialSkinShopPanel')
export default class XGTW_SpecialSkinShopPanel extends Component {
    ItemContent: Node | null = null;
    GunButton: Node | null = null;
    SkinButton: Node | null = null;
    Detail: Node | null = null;
    DetailLabel: Label | null = null;
    DetailUseButton: Node | null = null;
    DetailBuyButton: Node | null = null;
    DetailUnequippedButton: Node | null = null;
    LeftPin: Node | null = null;
    ItemIcon: Sprite | null = null;
    StudyDetails: Node | null = null;
    ScrollView: ScrollView = null;
    TTBB: Node | null = null;
    ZJWG: Node | null = null;
    ZLPH: Node | null = null;
    BroadcastPosition: Node | null = null;
    items: Node[] = [];
    selectItemData: any = null;

    protected onLoad(): void {
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.GunButton = NodeUtil.GetNode("GunButton", this.node);
        this.SkinButton = NodeUtil.GetNode("SkinButton", this.node);

        this.Detail = NodeUtil.GetNode("Detail", this.node);
        this.DetailUseButton = NodeUtil.GetNode("DetailUseButton", this.node);
        this.DetailBuyButton = NodeUtil.GetNode("DetailBuyButton", this.node);
        this.DetailUnequippedButton = NodeUtil.GetNode("DetailUnequippedButton", this.node);
        this.LeftPin = NodeUtil.GetNode("LeftPin", this.node);

        this.DetailLabel = NodeUtil.GetComponent("DetailLabel", this.node, Label);

        this.StudyDetails = NodeUtil.GetNode("StudyDetails", this.node);
        this.TTBB = NodeUtil.GetNode("TTBB", this.node);
        this.ZJWG = NodeUtil.GetNode("ZJWG", this.node);
        this.ZLPH = NodeUtil.GetNode("ZLPH", this.node);
        this.BroadcastPosition = NodeUtil.GetNode("BroadcastPosition", this.node);

        this.ItemIcon = NodeUtil.GetComponent("ItemIcon", this.node, Sprite);
        this.ScrollView = NodeUtil.GetComponent("ScrollView", this.node, ScrollView);
    }
    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.LeftPin.active = false;
        this.StudyDetails.active = false;

        this.Detail.active = false;
        this.RefreshButtonState("GunButton");
        this.RefreshItems(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.个性化枪械));
    }
    RefreshItems(items: XGTW_ItemData[]) {
        this.items.forEach(e => PoolManager.PutNode(e));

        for (let i = 0; i < items.length; i++) {
            const data = items[i];
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/CommonItem", this.ItemContent).then(e => {
                let item = e.getComponent(XGTW_CommonItem);
                item.Init(data, this.OnItemCallback.bind(this))
                this.items.push(e);
            })
        }
    }
    OnItemCallback(itemData: any) {
        if (!this.LeftPin.active) this.LeftPin.active = true;

        this.selectItemData = itemData;
        this.items.forEach(e => e.getComponent(XGTW_CommonItem).SetSelect(itemData));
        this.StudyDetails.active = XGTW_ItemType[`${this.selectItemData.Type}`] == XGTW_ItemType.个性化枪械;

        this.RefreshBottomBar();


        //更新展示图标
        if (XGTW_ItemType[`${itemData.Type}`] == XGTW_ItemType.个性化枪械) {

            this.RefreshDetailButtonState("ZJWG");
            this.TTBB.active = itemData.HasBroadcast;
            this.ZLPH.active = itemData.HasBox;
        }
        else if (XGTW_ItemType[`${itemData.Type}`] == XGTW_ItemType.个性化装扮) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/个性化装扮/${itemData.Name}`).then((sf: SpriteFrame) => {
                this.ItemIcon.spriteFrame = sf;
            });
        } else {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${itemData.Type}/${itemData.Name}`).then((sf: SpriteFrame) => {
                this.ItemIcon.spriteFrame = sf;
            });
        }
    }
    RefreshButtonState(state: string) {
        this.GunButton.getChildByName("Select").active = state == "GunButton";
        this.SkinButton.getChildByName("Select").active = state == "SkinButton";
        this.GunButton.getChildByName("Label").getComponent(Label).color = state == "GunButton" ? color().fromHEX("#FFAA00") : Color.WHITE;
        this.SkinButton.getChildByName("Label").getComponent(Label).color = state == "SkinButton" ? color().fromHEX("#FFAA00") : Color.WHITE;
    }
    RefreshBottomBar() {
        this.Detail.active = true;
        //按钮状态
        this.DetailBuyButton.active = !this.selectItemData.IsUnlock;
        if (this.selectItemData.IsUnlock) {
            let equipped = false;

            if (this.selectItemData.Type == "个性化枪械") {
                equipped = Boolean(XGTW_DataManager.PlayerData.EquipGunSkins.find(e => e.Name == this.selectItemData.Name));
            }
            if (this.selectItemData.Type == "个性化装扮") {
                if (XGTW_DataManager.PlayerData.Skin_Bulletproof) {
                    equipped = XGTW_DataManager.PlayerData.Skin_Bulletproof.Name == this.selectItemData.Name;
                }
            }

            this.DetailUseButton.active = !equipped
            this.DetailUnequippedButton.active = equipped;
        } else {
            this.DetailUseButton.active = false;
            this.DetailUnequippedButton.active = false;
        }

        this.Detail.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(this.selectItemData.Quality);
        this.DetailLabel.string = `${this.selectItemData.Name}`;
    }
    RefreshDetailButtonState(state: string) {
        this.TTBB.getChildByName("Select").active = state == "TTBB";
        this.ZJWG.getChildByName("Select").active = state == "ZJWG";
        this.ZLPH.getChildByName("Select").active = state == "ZLPH";
        this.TTBB.getChildByName("Label").getComponent(Label).color = state == "TTBB" ? Color.WHITE : color().fromHEX("#999999");
        this.ZJWG.getChildByName("Label").getComponent(Label).color = state == "ZJWG" ? Color.WHITE : color().fromHEX("#999999");
        this.ZLPH.getChildByName("Label").getComponent(Label).color = state == "ZLPH" ? Color.WHITE : color().fromHEX("#999999");
        if (state == "ZJWG") {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/个性化枪械/${this.selectItemData.Name}`).then((sf: SpriteFrame) => {
                this.ItemIcon.spriteFrame = sf;
            });
        }

        if (state == "ZLPH" && this.selectItemData && this.selectItemData.HasBox) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Doggie/个性化枪械/${this.selectItemData.Name}_Box`).then((sf: SpriteFrame) => {
                this.ItemIcon.spriteFrame = sf;
            });
        }

        if (state == "TTBB" && this.selectItemData && this.selectItemData.HasBroadcast) {
            XGTW_UIManager.ShowBroadcast(``, `${this.selectItemData.Name}_Broadcast`, v2(this.BroadcastPosition.getPosition().x, this.BroadcastPosition.getPosition().y));
        }
    }
    OnToggleClick(toggle, customEventData) {
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);
        switch (event.target.name) {
            case "GunButton":
                this.ScrollView.scrollToTop(0.1);
                this.Detail.active = false;
                this.RefreshButtonState(event.target.name);
                this.RefreshItems(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.个性化枪械));
                break;

            case "SkinButton":
                this.ScrollView.scrollToTop(0.1);
                this.Detail.active = false;
                this.RefreshButtonState(event.target.name);
                this.RefreshItems(XGTW_DataManager.ItemDatas.get(XGTW_ItemType.个性化装扮));
                break;
            case "TTBB":
                this.RefreshDetailButtonState(event.target.name);
                break;
            case "ZJWG":
                this.RefreshDetailButtonState(event.target.name);
                break;
            case "ZLPH":
                this.RefreshDetailButtonState(event.target.name);
                break;

            case "DetailUseButton":
                console.log("使用", this.selectItemData.Name);

                if (this.selectItemData.Type == "个性化枪械") XGTW_DataManager.EquipGunSkin(this.selectItemData);
                if (this.selectItemData.Type == "个性化装扮") XGTW_DataManager.EquipDogSkin(this.selectItemData);

                this.RefreshBottomBar();
                EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                break;

            case "DetailUnequippedButton":
                console.log("卸下", this.selectItemData.Type, this.selectItemData.Name);

                if (this.selectItemData.Type == "个性化枪械") XGTW_DataManager.UnequipGunSkin(this.selectItemData);
                if (this.selectItemData.Type == "个性化装扮") XGTW_DataManager.UnequipDogSkin(this.selectItemData);

                this.RefreshBottomBar();
                EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                break;

            case "DetailBuyButton":
                console.log("购买", this.selectItemData.Name);
                Banner.Instance.ShowVideoAd(() => {
                    this.selectItemData.IsUnlock = true;
                    this.RefreshBottomBar();
                });
                break;

            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.SpecialSkinShopPanel);
                break;

        }
    }
}