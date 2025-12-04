import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import XGTS_Item from './XGTS_Item';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { XGTS_Constant } from '../XGTS_Constant';
import XGTS_Inventory from './XGTS_Inventory';
import { XGTS_UIManager } from './XGTS_UIManager';
import { XGTS_InventoryGrid } from '../XGTS_InventoryGrid';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('XGTS_SafeBoxInventory')
export default class XGTS_SafeBoxInventory extends XGTS_Inventory {
    Item: UITransform = null;
    ItemLabel: Label = null;
    Icon_0: Node = null;
    Icon_1: Node = null;
    Icon_2: Node = null;
    Icon_3: Node = null;
    ndTrans: UITransform = null;

    inBox: boolean = false;
    playerNum = 0;

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

    InitPlayerNum(PlayerNum:number){
        this.playerNum = PlayerNum;
    }


    Refresh() {
        let data = XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox;
        this.Icon_0.active = data.width == 2 && data.height == 1;
        this.Icon_1.active = data.width == 2 && data.height == 2;
        this.Icon_2.active = data.width == 3 && data.height == 2;
        this.Icon_3.active = data.width == 3 && data.height == 3;

        let width = data.width;
        let height = data.height;
        
        // 检查网格尺寸是否发生变化，如果变化则重置网格
        let gridCtrl = XGTS_DataManager.PlayerDatas[this.playerNum].SafeBoxGrid;
        if (gridCtrl.width !== width || gridCtrl.height !== height) {
            XGTS_InventoryGrid.ResizeGrid(gridCtrl, width, height);
        } else {
            // 即使尺寸没有变化，也要确保网格状态被正确重置
            XGTS_InventoryGrid.ClearGrid(gridCtrl);
        }
        
        this.ItemContentTrans.setContentSize(width * XGTS_Constant.itemSize, height * XGTS_Constant.itemSize);
        this.ndTrans.setContentSize(170 + width * XGTS_Constant.itemSize + 20, 150 + height * XGTS_Constant.itemSize);
        super.Init(data.ItemData, XGTS_DataManager.PlayerDatas[this.playerNum].SafeBoxGrid);
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

    OnButtonClick(event: Event) {
         XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);
 

        switch (event.target.name) {
            case "Item":
                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.SelectSafeBoxPanel, [() => { this.Refresh(); },this.playerNum]);
                break;
        }
    }
}