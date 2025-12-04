import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import XGTS_Item from './XGTS_Item';
import XGTS_Inventory from './XGTS_Inventory';
import { XGTS_InventoryGrid } from '../XGTS_InventoryGrid';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XGTS_GameManager } from '../XGTS_GameManager';

const { ccclass, property } = _decorator;

@ccclass('XGTS_SellInventory')
export default class XGTS_SellInventory extends XGTS_Inventory {
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

        this.gridCtrl = new XGTS_InventoryGrid(width, height);
        super.Init(this.data, this.gridCtrl);
    }

    RefreshMoney() {
        this.SellMoneyLabel.string = this.GetTotalMoneny().toLocaleString();
    }

    OnDragStart(item: XGTS_Item) {
        super.OnDragStart(item);
    }

    OnDragging(item: XGTS_Item, position: Vec2) {
        super.OnDragging(item, position);
    }

    OnDragEnd(item: XGTS_Item, position: Vec2) {
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

    Sell(playerNum: number) {
        if(XGTS_GameManager.IsDoubleMode){
             XGTS_DataManager.PlayerDatas[1].Money += this.GetTotalMoneny()/2;
             XGTS_DataManager.PlayerDatas[2].Money += this.GetTotalMoneny()/2;
        }
        else{
            XGTS_DataManager.PlayerDatas[0].Money += this.GetTotalMoneny();
        }
        // XGTS_DataManager.PlayerDatas[playerNum].Money += this.GetTotalMoneny();
        UIManager.ShowTip(`出售成功，金钱 +${this.GetTotalMoneny().toLocaleString()}`);
        this.data = [];
        this.ClearItems();
        this.RefreshMoney();
    }
}