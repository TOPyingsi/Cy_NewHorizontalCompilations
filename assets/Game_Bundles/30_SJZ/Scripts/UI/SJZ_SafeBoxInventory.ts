import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import SJZ_Item from './SJZ_Item';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_Constant } from '../SJZ_Constant';
import SJZ_Inventory from './SJZ_Inventory';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_InventoryGrid } from '../SJZ_InventoryGrid';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('SJZ_SafeBoxInventory')
export default class SJZ_SafeBoxInventory extends SJZ_Inventory {
    Item: UITransform = null;
    ItemLabel: Label = null;
    Icon_0: Node = null;
    Icon_1: Node = null;
    Icon_2: Node = null;
    Icon_3: Node = null;
    ndTrans: UITransform = null;

    inBox: boolean = false;

    protected onLoad(): void {
        this.Item = NodeUtil.GetComponent("Item", this.node, UITransform);
        this.ItemLabel = NodeUtil.GetComponent("ItemLabel", this.node, Label);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
        this.Icon_0 = NodeUtil.GetNode("Icon_0", this.node);
        this.Icon_1 = NodeUtil.GetNode("Icon_1", this.node);
        this.Icon_2 = NodeUtil.GetNode("Icon_2", this.node);
        this.Icon_3 = NodeUtil.GetNode("Icon_3", this.node);

        this.ndTrans = this.node.getComponent(UITransform);
    }

    Refresh() {
        let data = SJZ_DataManager.PlayerData.SafeBox;
        this.Icon_0.active = data.width == 2 && data.height == 1;
        this.Icon_1.active = data.width == 2 && data.height == 2;
        this.Icon_2.active = data.width == 3 && data.height == 2;
        this.Icon_3.active = data.width == 3 && data.height == 3;

        let width = data.width;
        let height = data.height;
        this.ItemContentTrans.setContentSize(width * SJZ_Constant.itemSize, height * SJZ_Constant.itemSize);
        this.ndTrans.setContentSize(170 + width * SJZ_Constant.itemSize + 20, 150 + height * SJZ_Constant.itemSize);
        super.Init(data.ItemData, SJZ_DataManager.PlayerData.SafeBoxGrid);
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

    OnButtonClick(event: Event) {
         SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);
 

        switch (event.target.name) {
            case "Item":
                SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.SelectSafeBoxPanel, [() => { this.Refresh(); }]);
                break;
        }
    }
}