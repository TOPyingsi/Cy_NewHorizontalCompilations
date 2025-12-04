import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, EventTouch, Input, UITransform, ScrollView, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { XGTS_InventoryGrid } from '../XGTS_InventoryGrid';
import XGTS_Item from './XGTS_Item';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_ItemData, XGTS_ItemType } from '../XGTS_Data';
import { GridCellState, XGTS_GridCell } from './XGTS_GridCell';
import { XGTS_PoolManager } from '../XGTS_PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import XGTS_Inventory from './XGTS_Inventory';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { XGTS_UIManager } from './XGTS_UIManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('XGTS_BackpackInventory')
export default class XGTS_BackpackInventory extends XGTS_Inventory {
    Item: UITransform = null;
    ItemLabel: Label = null;
    Icon: Sprite = null;
    PutTip: Sprite = null;
    ndTrans: UITransform = null;

    inBox: boolean = false;

    playerNum:number = 0;

    protected onLoad(): void {
        this.Item = NodeUtil.GetComponent("Item", this.node, UITransform);
        this.ItemLabel = NodeUtil.GetComponent("ItemLabel", this.node, Label);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.ItemContentTrans = this.ItemContent.getComponent(UITransform);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.PutTip = NodeUtil.GetComponent("PutTip", this.node, Sprite);

        this.ndTrans = this.node.getComponent(UITransform);
    }

    InitPlayerNum(PlayerNum:number){
        this.playerNum = PlayerNum;
    }


    Refresh() {
        let data = XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData;

        if (data) {
            let width = data.EquipData.CarryingSpace.width;
            let height = data.EquipData.CarryingSpace.height;
            
            // 检查网格尺寸是否发生变化，如果变化则重置网格
            let gridCtrl = XGTS_DataManager.PlayerDatas[this.playerNum].BackpackGrid;
            if (gridCtrl.width !== width || gridCtrl.height !== height) {
                XGTS_InventoryGrid.ResizeGrid(gridCtrl, width, height);
            } else {
                // 即使尺寸没有变化，也要确保网格状态被正确重置
                XGTS_InventoryGrid.ClearGrid(gridCtrl);
            }
            
            this.ItemContentTrans.setContentSize(width * XGTS_Constant.itemSize, height * XGTS_Constant.itemSize);
            this.ndTrans.setContentSize(170 + width * XGTS_Constant.itemSize + 20, 150 + height * XGTS_Constant.itemSize);
            this.ItemLabel.string = data.Name;
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
                XGTS_GameManager.SetImagePreferScale(this.Icon, 130, 130);
            });

            super.Init(data.EquipData.ItemData, XGTS_DataManager.PlayerDatas[this.playerNum].BackpackGrid);
        } else {
            this.ClearItems();
            this.Icon.spriteFrame = null;
            this.ItemContentTrans.setContentSize(0, 0);
            this.ndTrans.setContentSize(170, 250);
            this.ItemLabel.string = `背包`;
        }
    }

    EquipBackpack(data: XGTS_ItemData) {
        XGTS_DataManager.PlayerDatas[this.playerNum].EquipBackpack(data);
        this.Refresh();
    }

    CanEquipBackpack(data: XGTS_ItemData, position: Vec2) {
        let inBox = this.Item.getBoundingBoxToWorld().contains(position);
        if (inBox) {
            this.inBox = true;

            //TODO满足条件为背包且当前背包内没有物品以及替换逻辑
            let canPut = data.Type == XGTS_ItemType.Backpack && XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData == null;
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

    OnDragStart(item: XGTS_Item) {
        if (!XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData) return;
        super.OnDragStart(item);
    }

    OnDragging(item: XGTS_Item, position: Vec2) {
        this.CanEquipBackpack(item.data, position);

        if (!XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData) return;
        super.OnDragging(item, position);
    }

    OnDragEnd(item: XGTS_Item, position: Vec2) {
        //背包判断
        if (this.CanEquipBackpack(item.data, position)) {
            this.ClearPutTipState();
            item.RemoveItemFromAndResetLastInventory();
            this.EquipBackpack(item.data);
            XGTS_PoolManager.Instance.Put(item.node);
            XGTS_DataManager.SaveData();
            XGTS_GameManager.Instance.HideTipCells();
            return;
        } else {
            this.ClearPutTipState();
        }

        if (!XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData) return;
        super.OnDragEnd(item, position);
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

        switch (event.target.name) {
            case "Item":
                if (!XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData) return;
                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.ItemInfoPanel, [XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData, true, (option: string) => {
                    if (option == "Sell") {
                        if (XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData && XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.EquipData.ItemData.length == 0) {
                            UIManager.ShowTip(`出售成功，获得${XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.Price.toLocaleString()}`);
                            XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.GetMoney);
                            XGTS_DataManager.PlayerDatas[this.playerNum].Money += XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.Price;
                            XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData = null;
                            this.Refresh();
                        } else if (XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.EquipData.ItemData.length > 0) {
                            UIManager.ShowTip(`出售失败，背包中还有物品`);
                        }
                    }

                    if (option == "Takeoff") {
                        if (XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData && XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.EquipData.ItemData.length == 0) {
                            let playerNum = 0;
                            if(XGTS_GameManager.IsDoubleMode){
                                playerNum = 1;
                            }

                            if (XGTS_DataManager.PlayerDatas[playerNum].AddItemToInventory(XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData)) {
                                EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_INVENTORY_ITEMS);
                                XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.Unequip);
                                XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData = null;
                            } else {
                                UIManager.ShowTip(`放入失败`);
                            }
                            this.Refresh();
                        } else if (XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.EquipData.ItemData.length > 0) {
                            UIManager.ShowTip(`放入失败，背包中还有物品`);
                        }
                    }

                }]);
                break;
        }
    }
}