import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite } from 'cc';
import SJZ_Item from './SJZ_Item';
import { SJZ_ItemData, SJZ_ItemType } from '../SJZ_Data';
import SJZ_Inventory from './SJZ_Inventory';
import { SJZ_InventoryGrid } from '../SJZ_InventoryGrid';

const { ccclass, property } = _decorator;

@ccclass('SJZ_SingleInventory')
export default class SJZ_SingleInventory extends SJZ_Inventory {

    inBox: boolean = false;

    protected onLoad(): void {
        this.ItemContent = this.node;
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
    }

    InitSingle(data: SJZ_ItemData[], gridCtrl: SJZ_InventoryGrid) {
        super.Init(data, gridCtrl);
    }

    OnDragStart(item: SJZ_Item) {
        super.OnDragStart(item);
    }

    OnDragging(item: SJZ_Item, position: Vec2) {
        super.OnDragging(item, position);
    }

    OnDragEnd(item: SJZ_Item, position: Vec2) {
        super.OnDragEnd(item, position);
    }
}