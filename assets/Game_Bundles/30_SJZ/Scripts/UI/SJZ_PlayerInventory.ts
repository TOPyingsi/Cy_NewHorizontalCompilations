import { _decorator, Vec2, UITransform, ScrollView } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import SJZ_Item from './SJZ_Item';
import SJZ_Inventory from './SJZ_Inventory';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_Constant } from '../SJZ_Constant';

const { ccclass, property } = _decorator;

@ccclass('SJZ_PlayerInventory')
export default class SJZ_PlayerInventory extends SJZ_Inventory {

    ScrollView: ScrollView = null;

    protected onLoad(): void {
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
        this.ScrollView = NodeUtil.GetComponent("ScrollView", this.node, ScrollView);
    }

    InitPlayerInventory(): void {
        super.Init(SJZ_DataManager.PlayerData.InventoryItemData, SJZ_DataManager.PlayerData.InventoryGridCtrl);
    }

    OnDragStart(item: SJZ_Item) {
        this.ScrollView.enabled = false;
        super.OnDragStart(item);
    }

    OnDragging(item: SJZ_Item, point: Vec2) {
        super.OnDragging(item, point);
    }

    OnDragEnd(item: SJZ_Item, position: Vec2) {
        this.ScrollView.enabled = true;
        super.OnDragEnd(item, position);
    }

    protected onEnable(): void {
        EventManager.Scene.on(SJZ_Constant.Event.REFRESH_INVENTORY_ITEMS, this.InitPlayerInventory, this);
    }

    protected onDisable(): void {
        EventManager.Scene.off(SJZ_Constant.Event.REFRESH_INVENTORY_ITEMS, this.InitPlayerInventory, this);
    }
}