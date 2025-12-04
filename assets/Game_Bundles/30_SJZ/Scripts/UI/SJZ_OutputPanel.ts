import { _decorator, Component, Node, Event, Label, UITransform, resources, Prefab, ScrollView, Vec2, instantiate, v3, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { SJZ_AmmoData, SJZ_ConsumableData, SJZ_EquipData, SJZ_ItemData, SJZ_ItemType, SJZ_WeaponData, SJZ_WorkbenchType } from '../SJZ_Data';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_UIManager } from './SJZ_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import SJZ_OutputItem from './SJZ_OutputItem';
import SJZ_CommonItem from './SJZ_CommonItem';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';

@ccclass('SJZ_OutputPanel')
export default class SJZ_OutputPanel extends PanelBase {
    OutputItemContent: Node | null = null;
    NeedMatContent: Node | null = null;
    MoneyLabel: Label | null = null;
    ItemNameLabel: Label | null = null;
    OutputTimeLabel: Label | null = null;
    TitleLabel: Label | null = null;
    Icon: Sprite | null = null;
    MatLabel: Node | null = null;
    OutputButton: Node | null = null;

    outputItems: SJZ_OutputItem[] = [];
    matItems: SJZ_CommonItem[] = [];
    data: SJZ_ItemData = null;

    protected onLoad(): void {
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.ItemNameLabel = NodeUtil.GetComponent("ItemNameLabel", this.node, Label);
        this.TitleLabel = NodeUtil.GetComponent("TitleLabel", this.node, Label);
        this.OutputTimeLabel = NodeUtil.GetComponent("OutputTimeLabel", this.node, Label);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.NeedMatContent = NodeUtil.GetNode("NeedMatContent", this.node);
        this.OutputItemContent = NodeUtil.GetNode("OutputItemContent", this.node);
        this.MatLabel = NodeUtil.GetNode("MatLabel", this.node);
        this.OutputButton = NodeUtil.GetNode("OutputButton", this.node);
    }

    time: number = 3610;
    countDownTimer: number = -1;

    StartCountdown() {
        clearInterval(this.countDownTimer);
        this.countDownTimer = setInterval(this.Countdown.bind(this), 1000);
    }

    Countdown() {
        this.time--;
        if (this.time <= 0) {
            this.time = 0;
            clearInterval(this.countDownTimer);
        }
        this.OutputTimeLabel.string = Tools.FormatTime(this.time);
    }

    Show(type: SJZ_WorkbenchType) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        this.outputItems.forEach(e => SJZ_PoolManager.Instance.Put(e.node));
        this.outputItems = [];
        this.matItems.forEach(e => SJZ_PoolManager.Instance.Put(e.node));
        this.matItems = [];

        let lv = SJZ_DataManager.PlayerData.GetWorkbenchLv(type);
        let outputItemData = [];

        for (let i = 1; i <= lv; i++) {
            let data = SJZ_DataManager.WorkbenchData.get(type).find(e => e.Lv == i);

            for (let i = 0; i < data.Making.length; i++) {
                let result = SJZ_DataManager.GetItemDataByID(data.Making[i]);
                if (result) outputItemData.push(result);
            }
        }

        for (let i = 0; i < outputItemData.length; i++) {
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.OutputItem, this.OutputItemContent);
            let item = node.getComponent(SJZ_OutputItem);
            item.Init(outputItemData[i], this.ItemCallback.bind(this));
            this.outputItems.push(item);
        }

        this.TitleLabel.string = `${SJZ_Constant.WorkbenchName[type]}`;

        this.MatLabel.active = false;
        this.OutputButton.active = false;
        this.ItemNameLabel.string = `选择一项进行制造`;
        this.Icon.spriteFrame = null;

        this.RefreshMoney();

        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    ItemCallback(data: SJZ_ItemData) {
        this.data = data;
        this.RefreshInfo(data);
        this.outputItems.forEach(e => e.Refresh(data));
    }

    RefreshInfo(data: SJZ_ItemData) {
        this.MatLabel.active = true;
        this.OutputButton.active = true;
        this.ItemNameLabel.string = `${data.Name}`;
        //制造武器
        if (data.Type == SJZ_ItemType.Weapon) {
            let weaponData: SJZ_WeaponData = SJZ_DataManager.WeaponData.find(e => e.ID == data.ID);
            if (weaponData) {
                this.InitNeedMatItem(weaponData.Required, weaponData.Quantity);
            } else {
                console.error(`WeaponData未找到武器数据：${data.Name}`);
            }
        }

        //制造装备
        if (data.Type == SJZ_ItemType.Helmet || data.Type == SJZ_ItemType.BodyArmor) {
            let equipData: SJZ_EquipData = SJZ_DataManager.EquipData.find(e => e.ID == data.ID);

            if (equipData) {
                this.InitNeedMatItem(equipData.Required, equipData.Quantity);
            } else {
                console.error(`EquipData未找到装备数据：${data.Name}`);
            }
        }

        //制造子弹
        if (data.Type == SJZ_ItemType.Ammo) {
            let ammoData: SJZ_AmmoData = SJZ_DataManager.AmmoData.find(e => e.ID == data.ID);

            if (ammoData) {
                this.InitNeedMatItem(ammoData.Required, ammoData.Quantity);
            } else {
                console.error(`AmmoData未找到子弹数据：${data.Name, data.ID}`);
            }
        }

        //制造消耗
        if (data.Type == SJZ_ItemType.ArmorItem || data.Type == SJZ_ItemType.MedicalItem) {
            let consumableData: SJZ_ConsumableData = SJZ_DataManager.ConsumableData.find(e => e.ID == data.ID);
            console.error(consumableData.ID, consumableData.Name, consumableData.Required, consumableData.Quantity)

            if (consumableData) {
                this.InitNeedMatItem(consumableData.Required, consumableData.Quantity);
            } else {
                console.error(`ConsumableData未找到消耗品数据：${data.Name}`);
            }
        }



        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
            SJZ_GameManager.SetImagePreferScale(this.Icon, 800, 500);
        });
    }

    InitNeedMatItem(ids: number[], quantitys: number[]) {
        this.matItems.forEach(e => SJZ_PoolManager.Instance.Put(e.node));
        this.matItems = [];

        let matItemData = [];

        for (let i = 0; i < ids.length; i++) {
            let d = Tools.Clone(SJZ_DataManager.GetItemDataByID(ids[i]));

            if (d) {
                d.Count = quantitys[i]
                matItemData.push(d);
            }
        }

        for (let i = 0; i < matItemData.length; i++) {
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.CommonItem, this.NeedMatContent);
            let item = node.getComponent(SJZ_CommonItem);
            item.InitDisplay(matItemData[i]);

            let count = SJZ_DataManager.PlayerData.GetInventoryItemCount(matItemData[i].ID);
            let str = `<b><color=${count >= matItemData[i].Count ? "#00ff00" : "#ff0000"}>${count}/${matItemData[i].Count}</color></b>`
            item.SetDescStr(str);

            this.matItems.push(item);
        }
    }


    RefreshMoney() {
        this.MoneyLabel.string = `${SJZ_DataManager.PlayerData.Money}`;
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "OutputButton":
                let needItemData: SJZ_ItemData[] = [];

                for (let i = 0; i < this.matItems.length; i++) {
                    let ownItemDataCount = SJZ_DataManager.PlayerData.GetInventoryItemCount(this.matItems[i].data.ID);
                    if (ownItemDataCount < this.matItems[i].data.Count) {
                        UIManager.ShowTip(`材料不足`);
                        return;
                    } else {
                        let ownItemData = SJZ_DataManager.PlayerData.InventoryItemData.filter(e => e.ID == this.matItems[i].data.ID);

                        for (let j = 0; j < this.matItems[i].data.Count; j++) {
                            needItemData.push(ownItemData[j]);
                        }
                    }
                }

                //把物品从仓库中移除
                for (let i = 0; i < needItemData.length; i++) {
                    SJZ_DataManager.PlayerData.RemoveItemFromInventory(needItemData[i]);
                }

                SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.RewardPanel, [[this.data]]);
                this.RefreshInfo(this.data);
                break;

            case "MakeAnywayButton":
                let costMoney = 0;
                for (let i = 0; i < this.matItems.length; i++) {
                    costMoney += this.matItems[i].data.Price * this.matItems[i].data.Count;
                }

                if (SJZ_DataManager.PlayerData.Money < costMoney) {
                    UIManager.ShowTip(`金钱不足，需要${costMoney}`);
                } else {
                    SJZ_DataManager.PlayerData.Money -= costMoney;
                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.RewardPanel, [[this.data]]);
                }
                break;

            case "ReturnButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.OutputPanel);
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