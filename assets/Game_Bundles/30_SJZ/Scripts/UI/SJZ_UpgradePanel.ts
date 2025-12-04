import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, misc } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZ_ItemData, SJZ_ItemType, SJZ_WorkbenchData, SJZ_WorkbenchType } from '../SJZ_Data';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import SJZ_CommonItem from './SJZ_CommonItem';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_UpgradePanel')
export default class SJZ_UpgradePanel extends PanelBase {
    Panel: Node = null;
    TitleLabel: Label = null;
    MoneyLabel: Label = null;

    //左侧
    WorkbenchTitleLabel: Label = null;
    UpgradeUnlockContent: Node = null;
    LvLabel: Label = null;
    LvAfterLabel: Label = null;
    MaxLvLabel: Node = null;
    UpgradeUnlockLabel: Node = null;
    ScrollView: Node = null;


    //右侧
    NeedMatContent: Node = null;
    CostMoneyLabel: Label = null;
    CostTimeLabel: Label = null;
    Arrow: Node = null;

    needMatItems: SJZ_CommonItem[] = [];
    unlockItems: SJZ_CommonItem[] = [];

    type: SJZ_WorkbenchType = null;
    data: SJZ_WorkbenchData = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.TitleLabel = NodeUtil.GetComponent("TitleLabel", this.node, Label);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);

        this.WorkbenchTitleLabel = NodeUtil.GetComponent("WorkbenchTitleLabel", this.node, Label);
        this.UpgradeUnlockContent = NodeUtil.GetNode("UpgradeUnlockContent", this.node);
        this.LvLabel = NodeUtil.GetComponent("LvLabel", this.node, Label);
        this.LvAfterLabel = NodeUtil.GetComponent("LvAfterLabel", this.node, Label);
        this.MaxLvLabel = NodeUtil.GetNode("MaxLvLabel", this.node);
        this.UpgradeUnlockLabel = NodeUtil.GetNode("UpgradeUnlockLabel", this.node);
        this.ScrollView = NodeUtil.GetNode("ScrollView", this.node);
        this.Arrow = NodeUtil.GetNode("Arrow", this.node);

        this.NeedMatContent = NodeUtil.GetNode("NeedMatContent", this.node);
        this.CostMoneyLabel = NodeUtil.GetComponent("CostMoneyLabel", this.node, Label);
        this.CostTimeLabel = NodeUtil.GetComponent("CostTimeLabel", this.node, Label);
    }

    Show(type: SJZ_WorkbenchType): void {
        super.Show(this.Panel);
        this.type = type;

        if (!SJZ_DataManager.WorkbenchData.get(type)) {
            console.error(`SJZ_DataManager.WorkbenchData.get(${type}) is null`);
        }

        this.Refresh();
        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    Refresh() {
        let lv = SJZ_DataManager.PlayerData.GetWorkbenchLv(this.type);
        let nextLv = misc.clampf(lv + 1, 1, 3);
        let maxLv = 3;

        this.data = SJZ_DataManager.WorkbenchData.get(this.type).find(e => e.Lv == nextLv);

        //右侧
        this.MaxLvLabel.active = lv == maxLv;
        this.Panel.active = lv < maxLv;
        if (this.Panel.active) {
            this.CostMoneyLabel.string = `${this.data.Cost.toLocaleString()}`;
            this.CostTimeLabel.string = `${Tools.FormatTime(this.data.CostTime)}`;
            this.GetAndInitResults(this.data.Requirements, this.data.QuantityDemanded, this.needMatItems, this.NeedMatContent);

            for (let i = 0; i < this.needMatItems.length; i++) {
                let count = SJZ_DataManager.PlayerData.GetInventoryItemCount(this.needMatItems[i].data.ID);
                let str = `<b><color=${count >= this.needMatItems[i].data.Count ? "#00ff00" : "#ff0000"}>${count}/${this.needMatItems[i].data.Count}</color></b>`

                this.needMatItems[i].SetDescStr(str);
            }
        }

        //左侧
        this.Arrow.active = lv < maxLv;
        this.LvAfterLabel.node.active = lv < maxLv;
        this.UpgradeUnlockLabel.active = lv < maxLv;
        this.ScrollView.active = lv < maxLv;
        this.LvLabel.string = `Lv.${lv}`;
        if (lv < maxLv) {
            this.TitleLabel.string = `${SJZ_Constant.WorkbenchName[this.type]}`;
            this.WorkbenchTitleLabel.string = `${SJZ_Constant.WorkbenchName[this.type]}`;
            this.LvAfterLabel.string = `Lv.${nextLv}`;
            this.GetAndInitResults(this.data.Making, null, this.unlockItems, this.UpgradeUnlockContent);
        }

        this.RefreshMoney()
    }

    Upgrade() {
        let lv = SJZ_DataManager.PlayerData.GetWorkbenchLv(this.type);
        lv++;
        SJZ_DataManager.PlayerData.SetWorkbenchLv(this.type, lv);

        this.Refresh();
    }

    GetAndInitResults(itemIds: number[], needCount: number[], items: SJZ_CommonItem[], parent: Node) {
        let data = [];
        for (let i = 0; i < itemIds.length; i++) {
            let result = null;
            for (const [key, value] of SJZ_DataManager.ItemDataMap) {
                result = value.find(e => e.ID == itemIds[i])
                if (result) {
                    let d = Tools.Clone(result);
                    if (needCount) d.Count = needCount[i];
                    data.push(d);
                    break;
                }
            }

            if (!result) console.error(`Item表中没有该材料 ID：${itemIds[i]}`);
        }

        items.forEach(e => SJZ_PoolManager.Instance.Put(e.node));
        items.length = 0;

        for (let i = 0; i < data.length; i++) {
            let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.CommonItem, parent);
            let item = node.getComponent(SJZ_CommonItem);
            item.InitDisplay(data[i]);
            items.push(item);
        }
    }

    RefreshMoney() {
        this.MoneyLabel.string = SJZ_DataManager.PlayerData.Money.toLocaleString();
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);


        switch (event.target.name) {
            case "Mask":
            case "ReturnButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.UpgradePanel);
                break;
            case "UpgradeAnywayButton":
                let costMoney = 0;
                for (let i = 0; i < this.needMatItems.length; i++) {
                    costMoney += this.needMatItems[i].data.Price * this.needMatItems[i].data.Count;
                }
                costMoney += this.data.Cost;

                if (SJZ_DataManager.PlayerData.Money < costMoney) {
                    UIManager.ShowTip(`金钱不足，需要${costMoney}`);
                } else {
                    SJZ_DataManager.PlayerData.Money -= costMoney;
                    this.Upgrade();
                }
                break;
            case "UpgradeButton":
                let needItemData: SJZ_ItemData[] = [];

                for (let i = 0; i < this.needMatItems.length; i++) {
                    let ownItemData = SJZ_DataManager.PlayerData.InventoryItemData.filter(e => e.ID == this.needMatItems[i].data.ID);
                    if (ownItemData && ownItemData.length > 0) {
                        needItemData.push(ownItemData[0]);
                    } else {
                        UIManager.ShowTip(`材料不足`);
                        return;
                    }
                }

                if (SJZ_DataManager.PlayerData.Money < this.data.Cost) {
                    UIManager.ShowTip(`金钱不足，需要${this.data.Cost}`);
                } else {
                    SJZ_DataManager.PlayerData.Money -= this.data.Cost;

                    //把物品从仓库中移除
                    for (let i = 0; i < needItemData.length; i++) {
                        SJZ_DataManager.PlayerData.RemoveItemFromInventory(needItemData[i]);
                    }

                    this.Upgrade();
                }
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