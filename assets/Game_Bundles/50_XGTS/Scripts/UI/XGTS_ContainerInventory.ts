import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import XGTS_Item from './XGTS_Item';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_ContainerData, XGTS_ContainerType, XGTS_ItemData, XGTS_ItemType } from '../XGTS_Data';
import XGTS_Inventory from './XGTS_Inventory';

const { ccclass, property } = _decorator;

@ccclass('XGTS_ContainerInventory')
export default class XGTS_ContainerInventory extends XGTS_Inventory {
    BarLabel: Label = null;
    ndTrans: UITransform = null;

    inBox: boolean = false;

    type: XGTS_ContainerType = XGTS_ContainerType.BirdNest;

    protected onLoad(): void {
        this.BarLabel = NodeUtil.GetComponent("BarLabel", this.node, Label);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
        this.ndTrans = this.node.getComponent(UITransform);
    }

    InitContainer(data: XGTS_ContainerData) {
        let width = data.Size.width;
        let height = data.Size.height;

        this.ItemContentTrans.setContentSize(width * XGTS_Constant.itemSize, height * XGTS_Constant.itemSize);
        this.ndTrans.setContentSize(40 + width * XGTS_Constant.itemSize, 120 + height * XGTS_Constant.itemSize);
        this.BarLabel.string = data.Name;

        super.InitLootContainer(data.ItemData, width, height);
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