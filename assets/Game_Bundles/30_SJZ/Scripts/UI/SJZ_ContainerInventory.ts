import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import SJZ_Item from './SJZ_Item';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_ContainerData, SJZ_ContainerType, SJZ_ItemData, SJZ_ItemType } from '../SJZ_Data';
import SJZ_Inventory from './SJZ_Inventory';

const { ccclass, property } = _decorator;

@ccclass('SJZ_ContainerInventory')
export default class SJZ_ContainerInventory extends SJZ_Inventory {
    BarLabel: Label = null;
    ndTrans: UITransform = null;

    inBox: boolean = false;

    type: SJZ_ContainerType = SJZ_ContainerType.BirdNest;

    protected onLoad(): void {
        this.BarLabel = NodeUtil.GetComponent("BarLabel", this.node, Label);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
        this.ndTrans = this.node.getComponent(UITransform);
    }

    InitContainer(data: SJZ_ContainerData) {
        let width = data.Size.width;
        let height = data.Size.height;

        this.ItemContentTrans.setContentSize(width * SJZ_Constant.itemSize, height * SJZ_Constant.itemSize);
        this.ndTrans.setContentSize(40 + width * SJZ_Constant.itemSize, 120 + height * SJZ_Constant.itemSize);
        this.BarLabel.string = data.Name;

        super.InitLootContainer(data.ItemData, width, height);
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