import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { SJZ_InventoryGrid } from '../SJZ_InventoryGrid';
import SJZ_Item from './SJZ_Item';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_ItemData, SJZ_ItemType } from '../SJZ_Data';
import { GridCellState, SJZ_GridCell } from './SJZ_GridCell';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import SJZ_Inventory from './SJZ_Inventory';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { SJZ_UIManager } from './SJZ_UIManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('SJZ_BackpackInventory')
export default class SJZ_BackpackInventory extends SJZ_Inventory {
    Item: UITransform = null;
    ItemLabel: Label = null;
    Icon: Sprite = null;
    PutTip: Sprite = null;
    ndTrans: UITransform = null;

    inBox: boolean = false;

    protected onLoad(): void {
        this.Item = NodeUtil.GetComponent("Item", this.node, UITransform);
        this.ItemLabel = NodeUtil.GetComponent("ItemLabel", this.node, Label);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.PutTip = NodeUtil.GetComponent("PutTip", this.node, Sprite);

        this.ndTrans = this.node.getComponent(UITransform);
    }

    Refresh() {
        let data = SJZ_DataManager.PlayerData.BackpackData;

        if (data) {
            let width = data.EquipData.CarryingSpace.width;
            let height = data.EquipData.CarryingSpace.height;
            this.ItemContentTrans.setContentSize(width * SJZ_Constant.itemSize, height * SJZ_Constant.itemSize);
            this.ndTrans.setContentSize(170 + width * SJZ_Constant.itemSize + 20, 150 + height * SJZ_Constant.itemSize);
            this.ItemLabel.string = data.Name;
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
                SJZ_GameManager.SetImagePreferScale(this.Icon, 130, 130);
            });

            super.Init(data.EquipData.ItemData, SJZ_DataManager.PlayerData.BackpackGrid);
        } else {
            this.ClearItems();
            this.Icon.spriteFrame = null;
            this.ItemContentTrans.setContentSize(0, 0);
            this.ndTrans.setContentSize(170, 250);
            this.ItemLabel.string = `背包`;
        }
    }

    EquipBackpack(data: SJZ_ItemData) {
        SJZ_DataManager.PlayerData.EquipBackpack(data);
        this.Refresh();
    }

    CanEquipBackpack(data: SJZ_ItemData, position: Vec2) {
        let inBox = this.Item.getBoundingBoxToWorld().contains(position);
        if (inBox) {
            this.inBox = true;

            //TODO满足条件为背包且当前背包内没有物品以及替换逻辑
            let canPut = data.Type == SJZ_ItemType.Backpack && SJZ_DataManager.PlayerData.BackpackData == null;
            this.SetPutTipState(canPut ? GridCellState.CanPut : GridCellState.CanntPut);
            return canPut;
        } else {
            if (this.inBox) {
                this.ClearPutTipState();
                this.inBox = false;
            }

            return false;
        }
    }

    SetPutTipState(state: GridCellState) {
        this.PutTip.color = Tools.GetColorFromHex(state);
    }

    ClearPutTipState() {
        this.PutTip.color = Tools.GetColorFromHex(GridCellState.None);
    }

    OnDragStart(item: SJZ_Item) {
        if (!SJZ_DataManager.PlayerData.BackpackData) return;
        super.OnDragStart(item);
    }

    OnDragging(item: SJZ_Item, position: Vec2) {
        this.CanEquipBackpack(item.data, position);

        if (!SJZ_DataManager.PlayerData.BackpackData) return;
        super.OnDragging(item, position);
    }

    OnDragEnd(item: SJZ_Item, position: Vec2) {
        //背包判断
        if (this.CanEquipBackpack(item.data, position)) {
            this.ClearPutTipState();
            item.RemoveItemFromAndResetLastInventory();
            this.EquipBackpack(item.data);
            SJZ_PoolManager.Instance.Put(item.node);
            SJZ_DataManager.SaveData();
            SJZ_GameManager.Instance.HideTipCells();
            return;
        } else {
            this.ClearPutTipState();
        }

        if (!SJZ_DataManager.PlayerData.BackpackData) return;
        super.OnDragEnd(item, position);
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "Item":
                if (!SJZ_DataManager.PlayerData.BackpackData) return;
                SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.ItemInfoPanel, [SJZ_DataManager.PlayerData.BackpackData, true, (option: string) => {
                    if (option == "Sell") {
                        if (SJZ_DataManager.PlayerData.BackpackData && SJZ_DataManager.PlayerData.BackpackData.EquipData.ItemData.length == 0) {
                            UIManager.ShowTip(`出售成功，获得${SJZ_DataManager.PlayerData.BackpackData.Price.toLocaleString()}`);
                            SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.GetMoney);
                            SJZ_DataManager.PlayerData.Money += SJZ_DataManager.PlayerData.BackpackData.Price;
                            SJZ_DataManager.PlayerData.BackpackData = null;
                            this.Refresh();
                        } else if (SJZ_DataManager.PlayerData.BackpackData.EquipData.ItemData.length > 0) {
                            UIManager.ShowTip(`出售失败，背包中还有物品`);
                        }
                    }

                    if (option == "Takeoff") {
                        if (SJZ_DataManager.PlayerData.BackpackData && SJZ_DataManager.PlayerData.BackpackData.EquipData.ItemData.length == 0) {
                            if (SJZ_DataManager.PlayerData.AddItemToInventory(SJZ_DataManager.PlayerData.BackpackData)) {
                                EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_INVENTORY_ITEMS);
                                SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.Unequip);
                                SJZ_DataManager.PlayerData.BackpackData = null;
                            } else {
                                UIManager.ShowTip(`放入失败`);
                            }
                            this.Refresh();
                        } else if (SJZ_DataManager.PlayerData.BackpackData.EquipData.ItemData.length > 0) {
                            UIManager.ShowTip(`放入失败，背包中还有物品`);
                        }
                    }

                }]);
                break;
        }
    }
}