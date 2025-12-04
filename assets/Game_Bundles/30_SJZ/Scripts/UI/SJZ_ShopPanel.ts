import { _decorator, Component, Node, Event, Label, UITransform, resources, Prefab, ScrollView, Vec2, instantiate, v3 } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { SJZ_ItemData, SJZ_ItemType } from '../SJZ_Data';
import SJZ_Item from './SJZ_Item';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_InventoryGrid } from '../SJZ_InventoryGrid';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_UIManager } from './SJZ_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import SJZ_PlayerInventory from './SJZ_PlayerInventory';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';

@ccclass('SJZ_ShopPanel')
export default class SJZ_ShopPanel extends PanelBase {
    Inventory: SJZ_PlayerInventory = null;
    Buttons: Node | null = null;
    ShopItemContent: Node | null = null;
    ShopScrollView: ScrollView = null;
    ShopItemContentTrans: UITransform = null;
    ShopInventoryTitleLabel: Label | null = null;
    MoneyLabel: Label | null = null;

    itemMap: Map<SJZ_ItemType, { gridCtrl: SJZ_InventoryGrid, items: SJZ_Item[] }> = new Map();

    showAll: boolean = true;

    protected onLoad(): void {
        this.Inventory = NodeUtil.GetComponent("Inventory", this.node, SJZ_PlayerInventory);
        this.ShopInventoryTitleLabel = NodeUtil.GetComponent("ShopInventoryTitleLabel", this.node, Label);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.Buttons = NodeUtil.GetNode("Buttons", this.node);
        this.ShopItemContent = NodeUtil.GetNode("ShopItemContent", this.node);
        this.ShopScrollView = NodeUtil.GetComponent("ShopScrollView", this.node, ScrollView);
        this.ShopItemContentTrans = this.ShopItemContent.getComponent(UITransform);
    }

    protected start(): void {
        this.InitAllItem();
    }

    ShowItems(type: SJZ_ItemType) {
        this.ShopScrollView.enabled = false;
        this.ShopScrollView.enabled = true;
        this.ShopScrollView.scrollToTop();
        for (let i = 0; i < this.ShopItemContent.children.length; i++) {
            this.ShopItemContent.children[i].active = `${type}` == this.ShopItemContent.children[i].name;
        }
    }

    InitAllItem() {
        for (let i = 0; i < 20; i++) {
            let data = null;
            if (SJZ_DataManager.ItemDataMap.has(i)) {
                data = SJZ_DataManager.ItemDataMap.get(i).filter(e => !e.NotShow || this.showAll);
            }

            if (data && data.length > 0) {
                let cloneData: SJZ_ItemData[] = [];
                data.forEach(e => cloneData.push(Tools.Clone(e)));
                if (!this.itemMap.has(i)) this.itemMap.set(i, { gridCtrl: new SJZ_InventoryGrid(8, 100), items: [] });
                SJZ_GameManager.FillContainerByData(cloneData, this.itemMap.get(i).gridCtrl);
                for (let k = 0; k < cloneData.length; k++) {
                    const d = cloneData[k];
                    let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.Item, this.ShopItemContent.getChildByName(`${i}`));
                    node.setParent(this.ShopItemContent.getChildByName(`${i}`));
                    node.setPosition(d.Point.x * SJZ_Constant.itemSize + SJZ_Constant.itemSize / 2, -d.Point.y * SJZ_Constant.itemSize - SJZ_Constant.itemSize / 2);
                    let item = node.getComponent(SJZ_Item);
                    item.InitShopItem(d, this.ItemCallback.bind(this));
                    this.itemMap.get(i).items.push(item);
                }

            }
        }
    }

    ItemCallback(data: SJZ_ItemData) {
        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.ItemInfoPanel, [data, false, this.AddToInventory.bind(this)]);
    }

    AddToInventory(data: SJZ_ItemData) {
        if (SJZ_DataManager.PlayerData.Money >= data.Price) {
            SJZ_DataManager.PlayerData.Money -= data.Price;
            
            let cloneData = SJZ_DataManager.CloneItemData(data);

            if (SJZ_DataManager.PlayerData.AddItemToInventory(cloneData)) {
                UIManager.ShowTip("添加成功");
            } else {
                UIManager.ShowTip("添加失败");
            }
        } else {
            UIManager.ShowTip("金钱不足");
        }
    }

    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.Inventory.InitPlayerInventory();
        this.RefreshMoney();
        this.RefreshButtons("头盔商店");
    }

    RefreshInventory() {
    }

    RefreshMoney() {
        this.MoneyLabel.string = `${SJZ_DataManager.PlayerData.Money}`;
    }

    RefreshButtons(name: string) {
        switch (name) {
            case "头盔商店":
                this.ShopInventoryTitleLabel.string = "头盔商店";
                this.ShowItems(SJZ_ItemType.Helmet);
                break;
            case "防弹衣商店":
                this.ShopInventoryTitleLabel.string = "防弹衣商店";
                this.ShowItems(SJZ_ItemType.BodyArmor);
                break;
            case "武器商店":
                this.ShopInventoryTitleLabel.string = "武器商店";
                this.ShowItems(SJZ_ItemType.Weapon);
                break;
            case "弹药商店":
                this.ShopInventoryTitleLabel.string = "弹药商店";
                this.ShowItems(SJZ_ItemType.Ammo);
                break;
            case "配件商店":
                this.ShopInventoryTitleLabel.string = "配件商店";
                this.ShowItems(SJZ_ItemType.Accessory);
                break;
            case "胸挂商店":
                this.ShopInventoryTitleLabel.string = "胸挂商店";
                this.ShowItems(SJZ_ItemType.ChestRig);
                break;
            case "背包商店":
                this.ShopInventoryTitleLabel.string = "背包商店";
                this.ShowItems(SJZ_ItemType.Backpack);
                break;
            case "护甲道具商店":
                this.ShopInventoryTitleLabel.string = "护甲道具商店";
                this.ShowItems(SJZ_ItemType.ArmorItem);
                break;
            case "医疗道具商店":
                this.ShopInventoryTitleLabel.string = "医疗道具商店";
                this.ShowItems(SJZ_ItemType.MedicalItem);
                break;
            case "电子物品收集品":
                this.ShopInventoryTitleLabel.string = "电子物品收集品";
                this.ShowItems(SJZ_ItemType.Electronic);
                break;
            case "医疗道具收集品":
                this.ShopInventoryTitleLabel.string = "医疗道具收集品";
                this.ShowItems(SJZ_ItemType.Medical);
                break;
            case "工具材料收集品":
                this.ShopInventoryTitleLabel.string = "工具材料收集品";
                this.ShowItems(SJZ_ItemType.ToolMaterial);
                break;
            case "家具材料收集品":
                this.ShopInventoryTitleLabel.string = "家具材料收集品";
                this.ShowItems(SJZ_ItemType.FurnitureItem);
                break;
            case "工艺藏品收集品":
                this.ShopInventoryTitleLabel.string = "工艺藏品收集品";
                this.ShowItems(SJZ_ItemType.CraftCollectible);
                break;
            case "资料情报收集品":
                this.ShopInventoryTitleLabel.string = "资料情报收集品";
                this.ShowItems(SJZ_ItemType.IntelDocument);
                break;
            case "能源燃料收集品":
                this.ShopInventoryTitleLabel.string = "能源燃料收集品";
                this.ShowItems(SJZ_ItemType.EnergyFuel);
                break;
            default:
                break;
        }

        this.Buttons.children.forEach(e => {
            e.getChildByName("Selected").active = e.name == name;
        })
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "头盔商店":
            case "防弹衣商店":
            case "武器商店":
            case "弹药商店":
            case "配件商店":
            case "胸挂商店":
            case "背包商店":
            case "护甲道具商店":
            case "医疗道具商店":
            case "电子物品收集品":
            case "医疗道具收集品":
            case "工具材料收集品":
            case "家具材料收集品":
            case "工艺藏品收集品":
            case "资料情报收集品":
            case "能源燃料收集品":
                this.RefreshButtons(event.target.name);
                break;

            case "ReturnButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.ShopPanel);
                break;
        }
    }

    OnDragStart(item: SJZ_Item, point: Vec2) {
        this.Inventory.OnDragStart(item);
    }

    OnDragging(item: SJZ_Item, point: Vec2) {
        this.Inventory.OnDragging(item, point);
    }

    OnDragEnd(item: SJZ_Item, point: Vec2) {
        this.Inventory.OnDragEnd(item, point);
    }

    protected onEnable(): void {
        EventManager.on(SJZ_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
        EventManager.on(SJZ_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.on(SJZ_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.on(SJZ_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);

    }
    protected onDisable(): void {
        EventManager.off(SJZ_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
        EventManager.off(SJZ_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.off(SJZ_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.off(SJZ_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);
    }

}