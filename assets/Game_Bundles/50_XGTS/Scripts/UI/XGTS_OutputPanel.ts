import { _decorator, Component, Node, Event, Label, UITransform, resources, Prefab, ScrollView, Vec2, instantiate, v3, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XGTS_AmmoData, XGTS_ConsumableData, XGTS_EquipData, XGTS_ItemData, XGTS_ItemType, XGTS_WeaponData, XGTS_WorkbenchType } from '../XGTS_Data';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { XGTS_PoolManager } from '../XGTS_PoolManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTS_UIManager } from './XGTS_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import XGTS_OutputItem from './XGTS_OutputItem';
import XGTS_CommonItem from './XGTS_CommonItem';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';

@ccclass('XGTS_OutputPanel')
export default class XGTS_OutputPanel extends PanelBase {
    OutputItemContent: Node | null = null;
    NeedMatContent: Node | null = null;
    MoneyLabel: Label | null = null;
    ItemNameLabel: Label | null = null;
    OutputTimeLabel: Label | null = null;
    TitleLabel: Label | null = null;
    Icon: Sprite | null = null;
    MatLabel: Node | null = null;
    OutputButton: Node | null = null;

    outputItems: XGTS_OutputItem[] = [];
    matItems: XGTS_CommonItem[] = [];
    data: XGTS_ItemData = null;

    playerNum:number = 0;
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

    Show(type: XGTS_WorkbenchType,playerNum:number) {
        this.playerNum = playerNum;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        this.outputItems.forEach(e => XGTS_PoolManager.Instance.Put(e.node));
        this.outputItems = [];
        this.matItems.forEach(e => XGTS_PoolManager.Instance.Put(e.node));
        this.matItems = [];

        let lv = XGTS_DataManager.PlayerDatas[this.playerNum].GetWorkbenchLv(type);
        let outputItemData = [];

        for (let i = 1; i <= lv; i++) {
            let data = XGTS_DataManager.WorkbenchData.get(type).find(e => e.Lv == i);

            for (let i = 0; i < data.Making.length; i++) {
                let result = XGTS_DataManager.GetItemDataByID(data.Making[i]);
                if (result) outputItemData.push(result);
            }
        }

        for (let i = 0; i < outputItemData.length; i++) {
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.OutputItem, this.OutputItemContent);
            let item = node.getComponent(XGTS_OutputItem);
            item.Init(outputItemData[i], this.ItemCallback.bind(this));
            this.outputItems.push(item);
        }

        this.TitleLabel.string = `${XGTS_Constant.WorkbenchName[type]}`;

        this.MatLabel.active = false;
        this.OutputButton.active = false;
        this.ItemNameLabel.string = `选择一项进行制造`;
        this.Icon.spriteFrame = null;

        this.RefreshMoney();

        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    ItemCallback(data: XGTS_ItemData) {
        this.data = data;
        this.RefreshInfo(data);
        this.outputItems.forEach(e => e.Refresh(data));
    }

    RefreshInfo(data: XGTS_ItemData) {
        this.MatLabel.active = true;
        this.OutputButton.active = true;
        this.ItemNameLabel.string = `${data.Name}`;
        //制造武器
        if (data.Type == XGTS_ItemType.Weapon) {
            let weaponData: XGTS_WeaponData = XGTS_DataManager.WeaponData.find(e => e.ID == data.ID);
            if (weaponData) {
                this.InitNeedMatItem(weaponData.Required, weaponData.Quantity);
            } else {
                console.error(`WeaponData未找到武器数据：${data.Name}`);
            }
        }

        //制造装备
        if (data.Type == XGTS_ItemType.Helmet || data.Type == XGTS_ItemType.BodyArmor) {
            let equipData: XGTS_EquipData = XGTS_DataManager.EquipData.find(e => e.ID == data.ID);

            if (equipData) {
                this.InitNeedMatItem(equipData.Required, equipData.Quantity);
            } else {
                console.error(`EquipData未找到装备数据：${data.Name}`);
            }
        }

        //制造子弹
        if (data.Type == XGTS_ItemType.Ammo) {
            let ammoData: XGTS_AmmoData = XGTS_DataManager.AmmoData.find(e => e.ID == data.ID);

            if (ammoData) {
                this.InitNeedMatItem(ammoData.Required, ammoData.Quantity);
            } else {
                console.error(`AmmoData未找到子弹数据：${data.Name, data.ID}`);
            }
        }

        //制造消耗
        if (data.Type == XGTS_ItemType.ArmorItem || data.Type == XGTS_ItemType.MedicalItem) {
            let consumableData: XGTS_ConsumableData = XGTS_DataManager.ConsumableData.find(e => e.ID == data.ID);
            console.error(consumableData.ID, consumableData.Name, consumableData.Required, consumableData.Quantity)

            if (consumableData) {
                this.InitNeedMatItem(consumableData.Required, consumableData.Quantity);
            } else {
                console.error(`ConsumableData未找到消耗品数据：${data.Name}`);
            }
        }



        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
            XGTS_GameManager.SetImagePreferScale(this.Icon, 800, 500);
        });
    }

    InitNeedMatItem(ids: number[], quantitys: number[]) {
        this.matItems.forEach(e => XGTS_PoolManager.Instance.Put(e.node));
        this.matItems = [];

        let matItemData = [];

        for (let i = 0; i < ids.length; i++) {
            let d = Tools.Clone(XGTS_DataManager.GetItemDataByID(ids[i]));

            if (d) {
                d.Count = quantitys[i]
                matItemData.push(d);
            }
        }

        for (let i = 0; i < matItemData.length; i++) {
            let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.CommonItem, this.NeedMatContent);
            let item = node.getComponent(XGTS_CommonItem);
            item.InitDisplay(matItemData[i]);

            let playerNum = 0;
            if(XGTS_GameManager.IsDoubleMode){
                playerNum = 1;
            }

            let count = XGTS_DataManager.PlayerDatas[playerNum].GetInventoryItemCount(matItemData[i].ID);
            let str = `<b><color=${count >= matItemData[i].Count ? "#00ff00" : "#ff0000"}>${count}/${matItemData[i].Count}</color></b>`
            item.SetDescStr(str);

            this.matItems.push(item);
        }
    }


    RefreshMoney() {
        this.MoneyLabel.string = `${XGTS_DataManager.PlayerDatas[this.playerNum].Money}`;
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

        switch (event.target.name) {
            case "OutputButton":
                let needItemData: XGTS_ItemData[] = [];

                for (let i = 0; i < this.matItems.length; i++) {
                    let playerNum = 0;
                    if(XGTS_GameManager.IsDoubleMode){
                        playerNum = 1;
                    }

                    let ownItemDataCount = XGTS_DataManager.PlayerDatas[playerNum].GetInventoryItemCount(this.matItems[i].data.ID);
                    if (ownItemDataCount < this.matItems[i].data.Count) {
                        UIManager.ShowTip(`材料不足`);
                        return;
                    } else {
                        let playerNum = 0;
                        if(XGTS_GameManager.IsDoubleMode){
                            playerNum = 1;
                        }
                        let ownItemData = XGTS_DataManager.PlayerDatas[playerNum].InventoryItemData.filter(e => e.ID == this.matItems[i].data.ID);

                        for (let j = 0; j < this.matItems[i].data.Count; j++) {
                            needItemData.push(ownItemData[j]);
                        }
                    }
                }

                //把物品从仓库中移除
                for (let i = 0; i < needItemData.length; i++) {
                        let playerNum = 0;
                        if(XGTS_GameManager.IsDoubleMode){
                            playerNum = 1;
                        }
                    XGTS_DataManager.PlayerDatas[playerNum].RemoveItemFromInventory(needItemData[i]);
                }

                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.RewardPanel, [[this.data]]);
                this.RefreshInfo(this.data);
                break;

            case "MakeAnywayButton":
                let costMoney = 0;
                for (let i = 0; i < this.matItems.length; i++) {
                    costMoney += this.matItems[i].data.Price * this.matItems[i].data.Count;
                }

                if (XGTS_DataManager.PlayerDatas[this.playerNum].Money < costMoney) {
                    UIManager.ShowTip(`金钱不足，需要${costMoney}`);
                } else {
                    XGTS_DataManager.PlayerDatas[this.playerNum].Money -= costMoney;
                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.RewardPanel, [[this.data]]);
                }
                break;

            case "ReturnButton":
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.OutputPanel);
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