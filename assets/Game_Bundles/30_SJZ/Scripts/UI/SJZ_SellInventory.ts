import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import SJZ_Item from './SJZ_Item';
import SJZ_Inventory from './SJZ_Inventory';
import { SJZ_InventoryGrid } from '../SJZ_InventoryGrid';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';

const { ccclass, property } = _decorator;

@ccclass('SJZ_SellInventory')
export default class SJZ_SellInventory extends SJZ_Inventory {
    SellMoneyLabel: Label = null;

    protected onLoad(): void {
        this.SellMoneyLabel = NodeUtil.GetComponent("SellMoneyLabel", this.node, Label);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
    }

    Init() {
        let width = 8;
        let height = 7;

        this.data = [];

        this.gridCtrl = new SJZ_InventoryGrid(width, height);
        super.Init(this.data, this.gridCtrl);
    }

    RefreshMoney() {
        this.SellMoneyLabel.string = this.GetTotalMoneny().toLocaleString();
    }

    OnDragStart(item: SJZ_Item) {
        super.OnDragStart(item);
    }

    OnDragging(item: SJZ_Item, position: Vec2) {
        super.OnDragging(item, position);
    }

    OnDragEnd(item: SJZ_Item, position: Vec2) {
        super.OnDragEnd(item, position);
        this.RefreshMoney();
    }

    GetTotalMoneny() {
        let total: number = 0;
        for (let i = 0; i < this.data.length; i++) {
            total += this.data[i].Price * this.data[i].Count;
        }
        return total;
    }

    Sell() {
        SJZ_DataManager.PlayerData.Money += this.GetTotalMoneny();
        UIManager.ShowTip(`出售成功，金钱 +${this.GetTotalMoneny().toLocaleString()}`);
        this.data = [];
        this.ClearItems();
        this.RefreshMoney();
    }
}