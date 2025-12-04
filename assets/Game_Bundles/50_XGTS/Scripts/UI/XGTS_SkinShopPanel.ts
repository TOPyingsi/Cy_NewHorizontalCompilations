import { _decorator, Component, Node, Event, Label, UITransform, resources, Prefab, ScrollView, Vec2, instantiate, v3 } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XGTS_ItemData, XGTS_ItemType } from '../XGTS_Data';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { XGTS_Constant, XGTS_Quality } from '../XGTS_Constant';
import { XGTS_UIManager } from './XGTS_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XGTS_LootManager } from '../XGTS_LootManager';
import XGTS_SkinItem from './XGTS_SkinItem';
import { XGTS_PoolManager } from '../XGTS_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import Banner from 'db://assets/Scripts/Banner';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
import { XGTS_GameManager } from '../XGTS_GameManager';

@ccclass('XGTS_SkinShopPanel')
export default class XGTS_SkinShopPanel extends PanelBase {
    Buttons: Node | null = null;
    MoneyLabel: Label | null = null;

    ManDeErPanel: Node | null = null;
    SkinPanel: Node | null = null;
    SkinContent: Node | null = null;
    EquipSkinButton: Node | null = null;
    EquipSkinButtonLabel: Label | null = null;

    skinItems: XGTS_SkinItem[] = [];
    selectedSkin: string = "";

    playerNum = 0;

    protected onLoad(): void {
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.Buttons = NodeUtil.GetNode("Buttons", this.node);

        this.ManDeErPanel = NodeUtil.GetNode("ManDeErPanel", this.node);
        this.SkinPanel = NodeUtil.GetNode("SkinPanel", this.node);
        this.SkinContent = NodeUtil.GetNode("SkinContent", this.node);
        this.EquipSkinButton = NodeUtil.GetNode("EquipSkinButton", this.node);
        this.EquipSkinButtonLabel = NodeUtil.GetComponent("EquipSkinButtonLabel", this.node, Label);

    }

    Show(playerNum?: number) {
        if(playerNum !== undefined){
            this.playerNum = playerNum;
        }
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.RefreshMoney();
        this.RefreshPanels("ManDeEr");
    }

    RefreshMoney() {
        this.MoneyLabel.string = `${XGTS_DataManager.PlayerDatas[this.playerNum].Money}`;
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
        this.skinItems.forEach(e => XGTS_PoolManager.Instance.Put(e.node));
        this.skinItems = [];
        this.selectedSkin = "";

        if (active) {
            this.EquipSkinButton.active = false;

            for (let i = 0; i < XGTS_DataManager.SkinData.length; i++) {
                let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.SkinItem, this.SkinContent);
                let item = node.getComponent(XGTS_SkinItem);
                item.Init(XGTS_DataManager.SkinData[i].Name, this.SkinItemCallback.bind(this));
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
        let equipped = XGTS_DataManager.GetGunUseSkin(this.selectedSkin.split(`_`)[0]);
        this.EquipSkinButtonLabel.string = equipped ? "卸下" : "装备";
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

        switch (event.target.name) {

            case "ManDeEr":
            case "Skin":
            case "AnQuanXiang":
                this.RefreshPanels(event.target.name);
                break;
            case "LotteryButton":
                Banner.Instance.ShowVideoAd(() => {
                    let result = XGTS_LootManager.GetRandomItemInPrizePool();
                    let data;
                    if (result) {
                        let playerNum = 0;
                        if (XGTS_GameManager.IsDoubleMode) {
                            playerNum = 1;
                        }
                        //收藏品
                        if (result.AwardType == 1) {
                            data = Tools.Clone(XGTS_DataManager.GetItemDataByID(result.ID));
                            if (data) {
                             
                                if (!XGTS_DataManager.PlayerDatas[playerNum].AddItemToInventory(data)) {//TODO LCH_奖励是否平均分配
                                    if(XGTS_GameManager.IsDoubleMode){
                                        XGTS_DataManager.PlayerDatas[1].Money += data.Price/2;
                                        XGTS_DataManager.PlayerDatas[2].Money += data.Price/2;
                                    }else{
                                        XGTS_DataManager.PlayerDatas[0].Money += data.Price;
                                    }
                                    UIManager.ShowTip(`仓库已满，自动出售 +${data.Price}`);
                                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.RewardPanel, [[data]]);
                                }
                            }
                        }

                        //枪皮
                        if (result.AwardType == 2) {
                            data = new XGTS_ItemData(result.ID, XGTS_ItemType.None, result.Name, 100000, XGTS_Quality.Mythic, "1_1", 0, result.Name, "", true);
                            if (!XGTS_DataManager.GetGunSkinUnlock(result.Name)) {
                                XGTS_DataManager.SetGunSkinUnlock(result.Name);
                            } else {
                                   if(XGTS_GameManager.IsDoubleMode){
                                        XGTS_DataManager.PlayerDatas[1].Money += 50000;
                                        XGTS_DataManager.PlayerDatas[2].Money += 50000;
                                    }else{
                                        XGTS_DataManager.PlayerDatas[0].Money += 100000;
                                    }
                                // XGTS_DataManager.PlayerData.Money += 100000;
                                UIManager.ShowTip(`已拥有该皮肤，+${100000}`);
                            }
                        }

                        if (data) XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.RewardPanel, [[data]]);
                    }
                });
                break;

            case "EquipSkinButton":
                let gunName = this.selectedSkin.split(`_`)[0];

                let equipped = XGTS_DataManager.GetGunUseSkin(gunName);
                if (equipped) {
                    XGTS_DataManager.SetGunUseSkin(gunName, "")
                } else {
                    console.error(`SetGunUseSkin`, gunName);
                    XGTS_DataManager.SetGunUseSkin(gunName, this.selectedSkin)
                }

                this.RefreshEquipSkinButtonLabel();
                break;
            case "ReturnButton":
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.SkinShopPanel);
                break;
        }
    }

    protected onEnable(): void {
        EventManager.on(XGTS_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTS_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
    }

}