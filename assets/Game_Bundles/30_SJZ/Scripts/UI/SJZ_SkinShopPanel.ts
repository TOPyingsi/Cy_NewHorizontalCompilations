import { _decorator, Component, Node, Event, Label, UITransform, resources, Prefab, ScrollView, Vec2, instantiate, v3 } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { SJZ_ItemData, SJZ_ItemType } from '../SJZ_Data';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_Constant, SJZ_Quality } from '../SJZ_Constant';
import { SJZ_UIManager } from './SJZ_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { SJZ_LootManager } from '../SJZ_LootManager';
import SJZ_SkinItem from './SJZ_SkinItem';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import Banner from 'db://assets/Scripts/Banner';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';

@ccclass('SJZ_SkinShopPanel')
export default class SJZ_SkinShopPanel extends PanelBase {
    Buttons: Node | null = null;
    MoneyLabel: Label | null = null;

    ManDeErPanel: Node | null = null;
    SkinPanel: Node | null = null;
    SkinContent: Node | null = null;
    EquipSkinButton: Node | null = null;
    EquipSkinButtonLabel: Label | null = null;

    skinItems: SJZ_SkinItem[] = [];
    selectedSkin: string = "";

    protected onLoad(): void {
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.Buttons = NodeUtil.GetNode("Buttons", this.node);

        this.ManDeErPanel = NodeUtil.GetNode("ManDeErPanel", this.node);
        this.SkinPanel = NodeUtil.GetNode("SkinPanel", this.node);
        this.SkinContent = NodeUtil.GetNode("SkinContent", this.node);
        this.EquipSkinButton = NodeUtil.GetNode("EquipSkinButton", this.node);
        this.EquipSkinButtonLabel = NodeUtil.GetComponent("EquipSkinButtonLabel", this.node, Label);

    }

    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.RefreshMoney();
        this.RefreshPanels("ManDeEr");
    }

    RefreshMoney() {
        this.MoneyLabel.string = `${SJZ_DataManager.PlayerData.Money}`;
    }

    RefreshPanels(name: string) {
        switch (name) {
            case "ManDeEr":
                break;
            case "Skin":
                break;
            case "AnQuanXiang":
                break;
        }

        this.ManDeErPanel.active = name == "ManDeEr";

        this.ShowSkinPanel(name == "Skin");

        this.Buttons.children.forEach(e => {
            e.getChildByName("Selected").active = e.name == name;
        })
    }

    ShowSkinPanel(active: boolean) {
        this.SkinPanel.active = active;
        this.skinItems.forEach(e => SJZ_PoolManager.Instance.Put(e.node));
        this.skinItems = [];
        this.selectedSkin = "";

        if (active) {
            this.EquipSkinButton.active = false;

            for (let i = 0; i < SJZ_DataManager.SkinData.length; i++) {
                let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.SkinItem, this.SkinContent);
                let item = node.getComponent(SJZ_SkinItem);
                item.Init(SJZ_DataManager.SkinData[i].Name, this.SkinItemCallback.bind(this));
                this.skinItems.push(item);
            }
        }
    }

    SkinItemCallback(name: string) {
        this.selectedSkin = name;
        this.skinItems.forEach(e => e.SetSelect(name));
        this.EquipSkinButton.active = true;
        this.RefreshEquipSkinButtonLabel();
    }

    RefreshEquipSkinButtonLabel() {
        let equipped = SJZ_DataManager.GetGunUseSkin(this.selectedSkin.split(`_`)[0]);
        this.EquipSkinButtonLabel.string = equipped ? "卸下" : "装备";
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {

            case "ManDeEr":
            case "Skin":
            case "AnQuanXiang":
                this.RefreshPanels(event.target.name);
                break;
            case "LotteryButton":
                Banner.Instance.ShowVideoAd(() => {
                    let result = SJZ_LootManager.GetRandomItemInPrizePool();
                    let data;
                    if (result) {
                        //收藏品
                        if (result.AwardType == 1) {
                            data = Tools.Clone(SJZ_DataManager.GetItemDataByID(result.ID));
                            if (data) {
                                if (!SJZ_DataManager.PlayerData.AddItemToInventory(data)) {
                                    SJZ_DataManager.PlayerData.Money += data.Price;
                                    UIManager.ShowTip(`仓库已满，自动出售 +${data.Price}`);
                                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.RewardPanel, [[data]]);
                                }
                            }
                        }

                        //枪皮
                        if (result.AwardType == 2) {
                            data = new SJZ_ItemData(result.ID, SJZ_ItemType.None, result.Name, 100000, SJZ_Quality.Mythic, "1_1", 0, result.Name, "", true);
                            if (!SJZ_DataManager.GetGunSkinUnlock(result.Name)) {
                                SJZ_DataManager.SetGunSkinUnlock(result.Name);
                            } else {
                                SJZ_DataManager.PlayerData.Money += 100000;
                                UIManager.ShowTip(`已拥有该皮肤，+${100000}`);
                            }
                        }

                        if (data) SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.RewardPanel, [[data]]);
                    }
                });
                break;

            case "EquipSkinButton":
                let gunName = this.selectedSkin.split(`_`)[0];

                let equipped = SJZ_DataManager.GetGunUseSkin(gunName);
                if (equipped) {
                    SJZ_DataManager.SetGunUseSkin(gunName, "")
                } else {
                    console.error(`SetGunUseSkin`, gunName);
                    SJZ_DataManager.SetGunUseSkin(gunName, this.selectedSkin)
                }

                this.RefreshEquipSkinButtonLabel();
                break;
            case "ReturnButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.SkinShopPanel);
                break;
        }
    }

    protected onEnable(): void {
        EventManager.on(SJZ_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
    }
    protected onDisable(): void {
        EventManager.off(SJZ_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
    }

}