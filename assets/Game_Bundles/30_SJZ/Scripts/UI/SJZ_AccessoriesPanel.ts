import { _decorator, Label, Node, Event, Sprite, SpriteFrame, Vec2, UITransform } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZ_ItemData, SJZ_ItemType } from '../SJZ_Data';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import SJZ_Item from './SJZ_Item';
import SJZ_Inventory from './SJZ_Inventory';
import { GridCellState } from './SJZ_GridCell';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_DataManager } from '../SJZ_DataManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_AccessoriesPanel')
export default class SJZ_AccessoriesPanel extends PanelBase {
    Panel: Node = null;
    Icon: Sprite = null;

    Accessor_0: UITransform = null;
    Accessor_1: UITransform = null;
    Accessor_2: UITransform = null;
    InventoryNd: Node = null;

    Desc0Label: Label = null;
    Desc1Label: Label = null;
    Desc2Label: Label = null;

    data: SJZ_ItemData = null;
    callback: Function = null;

    targetInventory: SJZ_Inventory = null;

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

    Show(data: SJZ_ItemData, spawnInverntory: Function): void {
        SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.InventoryPanel);
        this.data = data;
        super.Show(this.Panel);

        if (this.targetInventory) this.targetInventory.node.destroy();
        let inventory = spawnInverntory && spawnInverntory(this.InventoryNd);
        this.targetInventory = inventory;

        this.Reset();

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
            SJZ_GameManager.SetImagePreferScale(this.Icon, 500, 200);
        });

        this.RefreshAccessoriesInfo();

        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    OnDragStart(item: SJZ_Item) {
        this.targetInventory.OnDragStart(item);
    }

    OnDragging(item: SJZ_Item, point: Vec2) {
        this.targetInventory.OnDragging(item, point);
        this.DragAccessory(item, point);
    }

    OnDragEnd(item: SJZ_Item, point: Vec2) {
        this.targetInventory.OnDragEnd(item, point);
        this.EquipAccessory(item, point);
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "CloseButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.AccessoriesPanel);
                break;
            case "Accessor_0":
                if (this.data.WeaponData.Accessory_0) {
                    SJZ_DataManager.PlayerData.AddItemToInventory(Tools.Clone(this.data.WeaponData.Accessory_0));
                    this.data.WeaponData.Accessory_0 = null;
                    this.RefreshAccessoriesInfo();
                }
                break;
            case "Accessor_1":
                if (this.data.WeaponData.Accessory_1) {
                    SJZ_DataManager.PlayerData.AddItemToInventory(Tools.Clone(this.data.WeaponData.Accessory_1));
                    this.data.WeaponData.Accessory_1 = null;
                    this.RefreshAccessoriesInfo();
                }
                break;
            case "Accessor_2":
                if (this.data.WeaponData.Accessory_2) {
                    SJZ_DataManager.PlayerData.AddItemToInventory(Tools.Clone(this.data.WeaponData.Accessory_2));
                    this.data.WeaponData.Accessory_2 = null;
                    this.RefreshAccessoriesInfo();
                }
                break;
        }
    }

    DragAccessory(item: SJZ_Item, position: Vec2) {
        if (this.Accessor_0.getBoundingBoxToWorld().contains(position)) {
            this.SetPutTipState(this.Accessor_0.node.getChildByName("PutTip").getComponent(Sprite), item.data.Type == SJZ_ItemType.Accessory ? GridCellState.CanPut : GridCellState.CanntPut);
        } else {
            this.ClearPutTipState(this.Accessor_0.node.getChildByName("PutTip").getComponent(Sprite));
        }

        if (this.Accessor_1.getBoundingBoxToWorld().contains(position)) {
            this.SetPutTipState(this.Accessor_1.node.getChildByName("PutTip").getComponent(Sprite), item.data.Type == SJZ_ItemType.Accessory ? GridCellState.CanPut : GridCellState.CanntPut);
        } else {
            this.ClearPutTipState(this.Accessor_1.node.getChildByName("PutTip").getComponent(Sprite));
        }

        if (this.Accessor_2.getBoundingBoxToWorld().contains(position)) {
            this.SetPutTipState(this.Accessor_2.node.getChildByName("PutTip").getComponent(Sprite), item.data.Type == SJZ_ItemType.Accessory ? GridCellState.CanPut : GridCellState.CanntPut);
        } else {
            this.ClearPutTipState(this.Accessor_2.node.getChildByName("PutTip").getComponent(Sprite));
        }
    }

    EquipAccessory(item: SJZ_Item, position: Vec2) {
        const data = Tools.Clone(item.data);

        if (this.Accessor_0.getBoundingBoxToWorld().contains(position) && data.Type == SJZ_ItemType.Accessory) {
            if (this.data.WeaponData.Accessory_0) {
                SJZ_DataManager.PlayerData.AddItemToInventory(Tools.Clone(this.data.WeaponData.Accessory_0));
                this.data.WeaponData.Accessory_0 = null;
            }
            SJZ_DataManager.PlayerData.RemoveItemFromInventory(item.data);
            this.data.WeaponData.Accessory_0 = data;
        }
        this.ClearPutTipState(this.Accessor_0.node.getChildByName("PutTip").getComponent(Sprite));

        if (this.Accessor_1.getBoundingBoxToWorld().contains(position) && item.data.Type == SJZ_ItemType.Accessory) {
            if (this.data.WeaponData.Accessory_1) {
                SJZ_DataManager.PlayerData.AddItemToInventory(this.data.WeaponData.Accessory_1);
            }
            SJZ_DataManager.PlayerData.RemoveItemFromInventory(item.data);
            this.data.WeaponData.Accessory_1 = data;
        }
        this.ClearPutTipState(this.Accessor_1.node.getChildByName("PutTip").getComponent(Sprite));

        if (this.Accessor_2.getBoundingBoxToWorld().contains(position) && item.data.Type == SJZ_ItemType.Accessory) {
            if (this.data.WeaponData.Accessory_2) {
                SJZ_DataManager.PlayerData.AddItemToInventory(this.data.WeaponData.Accessory_2);
            }
            SJZ_DataManager.PlayerData.RemoveItemFromInventory(item.data);
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
                SJZ_GameManager.SetImagePreferScale(icon_0, 130, 130);
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
                SJZ_GameManager.SetImagePreferScale(icon_1, 130, 130);
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
                SJZ_GameManager.SetImagePreferScale(icon_2, 130, 130);
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
        EventManager.on(SJZ_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.on(SJZ_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.on(SJZ_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);

    }

    protected onDisable(): void {
        EventManager.off(SJZ_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.off(SJZ_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.off(SJZ_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);
    }
}