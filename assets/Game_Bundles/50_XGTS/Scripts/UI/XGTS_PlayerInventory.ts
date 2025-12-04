import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import XGTS_Item from './XGTS_Item';
import XGTS_Inventory from './XGTS_Inventory';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_GameManager } from '../XGTS_GameManager';

const { ccclass, property } = _decorator;

@ccclass('XGTS_PlayerInventory')
export default class XGTS_PlayerInventory extends XGTS_Inventory {

    ScrollView: ScrollView = null;

    protected onLoad(): void {
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
        this.ScrollView = NodeUtil.GetComponent("ScrollView", this.node, ScrollView);
    }

    InitPlayerInventory(): void {
        let playerNum = 0;
        if (XGTS_GameManager.IsDoubleMode) {
            playerNum = 1;
        }
        super.Init(XGTS_DataManager.PlayerDatas[playerNum].InventoryItemData, XGTS_DataManager.PlayerDatas[playerNum].InventoryGridCtrl);
    }

    OnDragStart(item: XGTS_Item) {
        this.ScrollView.enabled = false;
        super.OnDragStart(item);
    }

    OnDragging(item: XGTS_Item, point: Vec2) {
        super.OnDragging(item, point);
    }

    OnDragEnd(item: XGTS_Item, position: Vec2) {
        let scrollOffset = this.ScrollView.getScrollOffset();
        this.ScrollView.enabled = true;
        super.OnDragEnd(item, position);

        this.ScrollView.scrollToOffset(scrollOffset, 0);
    }

    protected onEnable(): void {
        EventManager.Scene.on(XGTS_Constant.Event.REFRESH_INVENTORY_ITEMS, this.InitPlayerInventory, this);
    }

    protected onDisable(): void {
        EventManager.Scene.off(XGTS_Constant.Event.REFRESH_INVENTORY_ITEMS, this.InitPlayerInventory, this);
    }
}