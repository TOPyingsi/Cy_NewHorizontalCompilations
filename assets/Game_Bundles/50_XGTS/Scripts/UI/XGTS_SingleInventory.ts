import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite } from 'cc';
import XGTS_Item from './XGTS_Item';
import { XGTS_ItemData, XGTS_ItemType } from '../XGTS_Data';
import XGTS_Inventory from './XGTS_Inventory';
import { XGTS_InventoryGrid } from '../XGTS_InventoryGrid';

const { ccclass, property } = _decorator;

@ccclass('XGTS_SingleInventory')
export default class XGTS_SingleInventory extends XGTS_Inventory {

    inBox: boolean = false;

    protected onLoad(): void {
        this.ItemContent = this.node;
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
    }

    InitSingle(data: XGTS_ItemData[], gridCtrl: XGTS_InventoryGrid) {
        super.Init(data, gridCtrl);
    }

    OnDragStart(item: XGTS_Item) {
        super.OnDragStart(item);
    }

    OnDragging(item: XGTS_Item, position: Vec2) {
        super.OnDragging(item, position);
    }

    OnDragEnd(item: XGTS_Item, position: Vec2) {
        super.OnDragEnd(item, position);
    }
}