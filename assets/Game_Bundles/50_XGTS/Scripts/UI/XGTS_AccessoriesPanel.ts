import { _decorator, Label, Node, Event, Sprite, SpriteFrame, Vec2, UITransform } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { XGTS_ItemData, XGTS_ItemType } from '../XGTS_Data';
import { XGTS_UIManager } from './XGTS_UIManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import XGTS_Item from './XGTS_Item';
import XGTS_Inventory from './XGTS_Inventory';
import { GridCellState } from './XGTS_GridCell';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTS_DataManager } from '../XGTS_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_AccessoriesPanel')
export default class XGTS_AccessoriesPanel extends PanelBase {
    Panel: Node = null;
    Icon: Sprite = null;

    Accessor_0: UITransform = null;
    Accessor_1: UITransform = null;
    Accessor_2: UITransform = null;
    InventoryNd: Node = null;

    Desc0Label: Label = null;
    Desc1Label: Label = null;
    Desc2Label: Label = null;

    data: XGTS_ItemData = null;
    callback: Function = null;

    targetInventory: XGTS_Inventory = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Desc0Label = NodeUtil.GetComponent("Desc0Label", this.node, Label);
        this.Desc1Label = NodeUtil.GetComponent("Desc1Label", this.node, Label);
        this.Desc2Label = NodeUtil.GetComponent("Desc2Label", this.node, Label);

        this.InventoryNd = NodeUtil.GetNode("InventoryNd", this.node);

        this.Accessor_0 = NodeUtil.GetComponent("Accessor_0", this.node, UITransform);
        this.Accessor_1 = NodeUtil.GetComponent("Accessor_1", this.node, UITransform);
        this.Accessor_2 = NodeUtil.GetComponent("Accessor_2", this.node, UITransform);
    }

    Reset() {
        this.Icon.spriteFrame = null;
        this.Desc0Label.string = ``;
    }

    Show(data: XGTS_ItemData, spawnInverntory: Function): void {
        XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.InventoryPanel);
        this.data = data;
        super.Show(this.Panel);

        if (this.targetInventory) this.targetInventory.node.destroy();
        let inventory = spawnInverntory && spawnInverntory(this.InventoryNd);
        this.targetInventory = inventory;

        this.Reset();

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
            XGTS_GameManager.SetImagePreferScale(this.Icon, 500, 200);
        });

        this.RefreshAccessoriesInfo();

        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    OnDragStart(item: XGTS_Item) {
        this.targetInventory.OnDragStart(item);
    }

    OnDragging(item: XGTS_Item, point: Vec2) {
        this.targetInventory.OnDragging(item, point);
        this.DragAccessory(item, point);
    }

    OnDragEnd(item: XGTS_Item, point: Vec2) {
        this.targetInventory.OnDragEnd(item, point);
        this.EquipAccessory(item, point);
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);
        // let playerdata = XGTS_DataManager.PlayerDatas[XGTS_GameManager.itemPlayerNum];

        let InventoryPalyerNum = 0;
        if (XGTS_GameManager.IsDoubleMode) {
            InventoryPalyerNum = 1;
        }

        let playerdata = XGTS_DataManager.PlayerDatas[InventoryPalyerNum];

        switch (event.target.name) {
            case "CloseButton":
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.AccessoriesPanel);
                break;
            case "Accessor_0":
                if (this.data.WeaponData.Accessory_0) {
                    playerdata.AddItemToInventory(Tools.Clone(this.data.WeaponData.Accessory_0));
                    this.data.WeaponData.Accessory_0 = null;
                    this.RefreshAccessoriesInfo();
                }
                break;
            case "Accessor_1":
                if (this.data.WeaponData.Accessory_1) {
                    playerdata.AddItemToInventory(Tools.Clone(this.data.WeaponData.Accessory_1));
                    this.data.WeaponData.Accessory_1 = null;
                    this.RefreshAccessoriesInfo();
                }
                break;
            case "Accessor_2":
                if (this.data.WeaponData.Accessory_2) {
                    playerdata.AddItemToInventory(Tools.Clone(this.data.WeaponData.Accessory_2));
                    this.data.WeaponData.Accessory_2 = null;
                    this.RefreshAccessoriesInfo();
                }
                break;
        }
    }

    DragAccessory(item: XGTS_Item, position: Vec2) {
        if (this.Accessor_0.getBoundingBoxToWorld().contains(position)) {
            this.SetPutTipState(this.Accessor_0.node.getChildByName("PutTip").getComponent(Sprite), item.data.Type == XGTS_ItemType.Accessory ? GridCellState.CanPut : GridCellState.CanntPut);
        } else {
            this.ClearPutTipState(this.Accessor_0.node.getChildByName("PutTip").getComponent(Sprite));
        }

        if (this.Accessor_1.getBoundingBoxToWorld().contains(position)) {
            this.SetPutTipState(this.Accessor_1.node.getChildByName("PutTip").getComponent(Sprite), item.data.Type == XGTS_ItemType.Accessory ? GridCellState.CanPut : GridCellState.CanntPut);
        } else {
            this.ClearPutTipState(this.Accessor_1.node.getChildByName("PutTip").getComponent(Sprite));
        }

        if (this.Accessor_2.getBoundingBoxToWorld().contains(position)) {
            this.SetPutTipState(this.Accessor_2.node.getChildByName("PutTip").getComponent(Sprite), item.data.Type == XGTS_ItemType.Accessory ? GridCellState.CanPut : GridCellState.CanntPut);
        } else {
            this.ClearPutTipState(this.Accessor_2.node.getChildByName("PutTip").getComponent(Sprite));
        }
    }

    EquipAccessory(item: XGTS_Item, position: Vec2) {
        const data = Tools.Clone(item.data);
        let playerdata = XGTS_DataManager.PlayerDatas[XGTS_GameManager.itemPlayerNum];


        let InventoryPalyerNum = 0;
        if (XGTS_GameManager.IsDoubleMode) {
            InventoryPalyerNum = 1;
        }

        if (this.Accessor_0.getBoundingBoxToWorld().contains(position) && data.Type == XGTS_ItemType.Accessory) {
            if (this.data.WeaponData.Accessory_0) {
                playerdata.AddItemToInventory(Tools.Clone(this.data.WeaponData.Accessory_0));
                this.data.WeaponData.Accessory_0 = null;
            }
            // item.RemoveItemFromAndResetLastInventory();
            XGTS_DataManager.PlayerDatas[InventoryPalyerNum].RemoveItemFromInventory(item.data);
            this.data.WeaponData.Accessory_0 = data;
        }
        this.ClearPutTipState(this.Accessor_0.node.getChildByName("PutTip").getComponent(Sprite));

        if (this.Accessor_1.getBoundingBoxToWorld().contains(position) && item.data.Type == XGTS_ItemType.Accessory) {
            if (this.data.WeaponData.Accessory_1) {
                playerdata.AddItemToInventory(this.data.WeaponData.Accessory_1);
            }
            // item.RemoveItemFromAndResetLastInventory();
            XGTS_DataManager.PlayerDatas[InventoryPalyerNum].RemoveItemFromInventory(item.data);
            this.data.WeaponData.Accessory_1 = data;
        }
        this.ClearPutTipState(this.Accessor_1.node.getChildByName("PutTip").getComponent(Sprite));

        if (this.Accessor_2.getBoundingBoxToWorld().contains(position) && item.data.Type == XGTS_ItemType.Accessory) {
            if (this.data.WeaponData.Accessory_2) {
                playerdata.AddItemToInventory(this.data.WeaponData.Accessory_2);
            }
            // item.RemoveItemFromAndResetLastInventory();
            XGTS_DataManager.PlayerDatas[InventoryPalyerNum].RemoveItemFromInventory(item.data);
            this.data.WeaponData.Accessory_2 = data;
        }
        this.ClearPutTipState(this.Accessor_2.node.getChildByName("PutTip").getComponent(Sprite));

        this.RefreshAccessoriesInfo();
    }

    RefreshAccessoriesInfo() {
        if (!this.data) return;
        let label_0 = this.Accessor_0.node.getChildByName("ItemLabel").getComponent(Label);
        let icon_0 = this.Accessor_0.node.getChildByName("Icon").getComponent(Sprite);
        label_0.string = "芯片配件";
        icon_0.spriteFrame = null;
        this.Desc0Label.string = "";

        if (this.data.WeaponData.Accessory_0) {
            label_0.string = this.data.WeaponData.Accessory_0.Name;
            this.Desc0Label.string = `${this.data.WeaponData.Accessory_0.Name}\n\n增加后坐力：${this.data.WeaponData.Accessory_0.AccessoryData.RecoilUp}\n减少后坐力：${this.data.WeaponData.Accessory_0.AccessoryData.RecoilDown}\n增加换弹速度：${this.data.WeaponData.Accessory_0.AccessoryData.ReloadingSpeedUp}\n减少换弹速度：${this.data.WeaponData.Accessory_0.AccessoryData.ReloadingSpeedDown}\n视野倍数：${this.data.WeaponData.Accessory_0.AccessoryData.Magnificationlens}`;
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${this.data.WeaponData.Accessory_0.ImageId}`).then((sf: SpriteFrame) => {
                icon_0.spriteFrame = sf;
                XGTS_GameManager.SetImagePreferScale(icon_0, 130, 130);
            });
        }

        let label_1 = this.Accessor_1.node.getChildByName("ItemLabel").getComponent(Label);
        let icon_1 = this.Accessor_1.node.getChildByName("Icon").getComponent(Sprite);
        label_1.string = "芯片配件";
        icon_1.spriteFrame = null;
        this.Desc1Label.string = "";

        if (this.data.WeaponData.Accessory_1) {
            label_1.string = this.data.WeaponData.Accessory_1.Name;
            this.Desc1Label.string = `${this.data.WeaponData.Accessory_1.Name}\n\n增加后坐力：${this.data.WeaponData.Accessory_1.AccessoryData.RecoilUp}\n减少后坐力：${this.data.WeaponData.Accessory_1.AccessoryData.RecoilDown}\n增加换弹速度：${this.data.WeaponData.Accessory_1.AccessoryData.ReloadingSpeedUp}\n减少换弹速度：${this.data.WeaponData.Accessory_1.AccessoryData.ReloadingSpeedDown}\n视野倍数：${this.data.WeaponData.Accessory_1.AccessoryData.Magnificationlens}`;
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${this.data.WeaponData.Accessory_1.ImageId}`).then((sf: SpriteFrame) => {
                icon_1.spriteFrame = sf;
                XGTS_GameManager.SetImagePreferScale(icon_1, 130, 130);
            });
        }

        let label_2 = this.Accessor_2.node.getChildByName("ItemLabel").getComponent(Label);
        let icon_2 = this.Accessor_2.node.getChildByName("Icon").getComponent(Sprite);
        label_2.string = "芯片配件";
        icon_2.spriteFrame = null;
        this.Desc2Label.string = "";

        if (this.data.WeaponData.Accessory_2) {
            label_2.string = this.data.WeaponData.Accessory_2.Name;
            this.Desc2Label.string = `${this.data.WeaponData.Accessory_2.Name}\n\n增加后坐力：${this.data.WeaponData.Accessory_2.AccessoryData.RecoilUp}\n减少后坐力：${this.data.WeaponData.Accessory_2.AccessoryData.RecoilDown}\n增加换弹速度：${this.data.WeaponData.Accessory_2.AccessoryData.ReloadingSpeedUp}\n减少换弹速度：${this.data.WeaponData.Accessory_2.AccessoryData.ReloadingSpeedDown}\n视野倍数：${this.data.WeaponData.Accessory_2.AccessoryData.Magnificationlens}`;
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${this.data.WeaponData.Accessory_2.ImageId}`).then((sf: SpriteFrame) => {
                icon_2.spriteFrame = sf;
                XGTS_GameManager.SetImagePreferScale(icon_2, 130, 130);
            });
        }
    }

    SetPutTipState(putTip: Sprite, state: GridCellState) {
        putTip.color = Tools.GetColorFromHex(state);
    }

    ClearPutTipState(putTip: Sprite) {
        putTip.color = Tools.GetColorFromHex(GridCellState.None);
    }

    protected onEnable(): void {
        EventManager.on(XGTS_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.on(XGTS_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.on(XGTS_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);

    }

    protected onDisable(): void {
        EventManager.off(XGTS_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.off(XGTS_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.off(XGTS_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);
    }
}