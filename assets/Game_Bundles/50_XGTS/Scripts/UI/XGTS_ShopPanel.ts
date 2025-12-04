import { _decorator, Component, Node, Event, Label, UITransform, resources, Prefab, ScrollView, Vec2, instantiate, v3 } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XGTS_ItemData, XGTS_ItemType } from '../XGTS_Data';
import XGTS_Item from './XGTS_Item';
import { XGTS_GameManager } from '../XGTS_GameManager';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { XGTS_InventoryGrid } from '../XGTS_InventoryGrid';
import { XGTS_PoolManager } from '../XGTS_PoolManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTS_UIManager } from './XGTS_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import XGTS_PlayerInventory from './XGTS_PlayerInventory';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';

@ccclass('XGTS_ShopPanel')
export default class XGTS_ShopPanel extends PanelBase {
    Inventory: XGTS_PlayerInventory = null;
    Buttons: Node | null = null;
    ShopItemContent: Node | null = null;
    ShopScrollView: ScrollView = null;
    ShopItemContentTrans: UITransform = null;
    ShopInventoryTitleLabel: Label | null = null;
    MoneyLabel: Label | null = null;

    itemMap: Map<XGTS_ItemType, { gridCtrl: XGTS_InventoryGrid, items: XGTS_Item[] }> = new Map();

    playerNum: number = 0;

    protected onLoad(): void {
        this.Inventory = NodeUtil.GetComponent("Inventory", this.node, XGTS_PlayerInventory);
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

    ShowItems(type: XGTS_ItemType) {
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
            if (XGTS_DataManager.ItemDataMap.has(i)) {
                data = XGTS_DataManager.ItemDataMap.get(i).filter(e => !e.NotShow);
            }

            if (data && data.length > 0) {
                let cloneData: XGTS_ItemData[] = [];
                data.forEach(e => cloneData.push(Tools.Clone(e)));
                if (!this.itemMap.has(i)) this.itemMap.set(i, { gridCtrl: new XGTS_InventoryGrid(8, 100), items: [] });
                XGTS_GameManager.FillContainerByData(cloneData, this.itemMap.get(i).gridCtrl);
                for (let k = 0; k < cloneData.length; k++) {
                    const d = cloneData[k];
                    let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.Item, this.ShopItemContent.getChildByName(`${i}`));
                    node.setParent(this.ShopItemContent.getChildByName(`${i}`));

                    // 根据是否旋转来设置正确的初始位置
                    if (d.Rotated) {
                        node.setPosition(d.Point.x * XGTS_Constant.itemSize + d.Size.height * XGTS_Constant.itemSize / 2,
                            -d.Point.y * XGTS_Constant.itemSize - d.Size.width * XGTS_Constant.itemSize / 2);
                    } else {
                        node.setPosition(d.Point.x * XGTS_Constant.itemSize + d.Size.width * XGTS_Constant.itemSize / 2,
                            -d.Point.y * XGTS_Constant.itemSize - d.Size.height * XGTS_Constant.itemSize / 2);
                    }

                    let item = node.getComponent(XGTS_Item);
                    item.InitShopItem(d, this.ItemCallback.bind(this));
                    this.itemMap.get(i).items.push(item);
                }

            }
        }
    }

    ItemCallback(data: XGTS_ItemData) {
        XGTS_GameManager.itemPlayerNum = this.playerNum;
        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.ItemInfoPanel, [data, false, this.AddToInventory.bind(this)]);
    }

    AddToInventory(data: XGTS_ItemData) {
        let playerNum = 0;
        if (XGTS_GameManager.IsDoubleMode) {
            playerNum = 1;
        }

        if (XGTS_DataManager.PlayerDatas[playerNum].Money >= data.Price) {
            XGTS_DataManager.PlayerDatas[playerNum].Money -= data.Price;

            let cloneData = XGTS_DataManager.CloneItemData(data);


            if (XGTS_DataManager.PlayerDatas[playerNum].AddItemToInventory(cloneData)) {
                UIManager.ShowTip("添加成功");
            } else {
                UIManager.ShowTip("添加失败");
            }
        } else {
            UIManager.ShowTip("金钱不足");
        }
    }

    Show(playerNum: number) {
        this.playerNum = playerNum;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.Inventory.InitPlayerInventory();
        this.RefreshMoney();
        this.RefreshButtons("头盔商店");
    }

    RefreshInventory() {
    }

    RefreshMoney() {
        this.MoneyLabel.string = `${XGTS_DataManager.PlayerDatas[this.playerNum].Money}`;//TODO LCH_售卖需要平分吗
    }

    RefreshButtons(name: string) {
        switch (name) {
            case "头盔商店":
                this.ShopInventoryTitleLabel.string = "头盔商店";
                this.ShowItems(XGTS_ItemType.Helmet);
                break;
            case "防弹衣商店":
                this.ShopInventoryTitleLabel.string = "防弹衣商店";
                this.ShowItems(XGTS_ItemType.BodyArmor);
                break;
            case "武器商店":
                this.ShopInventoryTitleLabel.string = "武器商店";
                this.ShowItems(XGTS_ItemType.Weapon);
                break;
            case "弹药商店":
                this.ShopInventoryTitleLabel.string = "弹药商店";
                this.ShowItems(XGTS_ItemType.Ammo);
                break;
            case "配件商店":
                this.ShopInventoryTitleLabel.string = "配件商店";
                this.ShowItems(XGTS_ItemType.Accessory);
                break;
            case "胸挂商店":
                this.ShopInventoryTitleLabel.string = "胸挂商店";
                this.ShowItems(XGTS_ItemType.ChestRig);
                break;
            case "背包商店":
                this.ShopInventoryTitleLabel.string = "背包商店";
                this.ShowItems(XGTS_ItemType.Backpack);
                break;
            case "护甲道具商店":
                this.ShopInventoryTitleLabel.string = "护甲道具商店";
                this.ShowItems(XGTS_ItemType.ArmorItem);
                break;
            case "医疗道具商店":
                this.ShopInventoryTitleLabel.string = "医疗道具商店";
                this.ShowItems(XGTS_ItemType.MedicalItem);
                break;
            case "电子物品收集品":
                this.ShopInventoryTitleLabel.string = "电子物品收集品";
                this.ShowItems(XGTS_ItemType.Electronic);
                break;
            case "医疗道具收集品":
                this.ShopInventoryTitleLabel.string = "医疗道具收集品";
                this.ShowItems(XGTS_ItemType.Medical);
                break;
            case "工具材料收集品":
                this.ShopInventoryTitleLabel.string = "工具材料收集品";
                this.ShowItems(XGTS_ItemType.ToolMaterial);
                break;
            case "家具材料收集品":
                this.ShopInventoryTitleLabel.string = "家具材料收集品";
                this.ShowItems(XGTS_ItemType.FurnitureItem);
                break;
            case "工艺藏品收集品":
                this.ShopInventoryTitleLabel.string = "工艺藏品收集品";
                this.ShowItems(XGTS_ItemType.CraftCollectible);
                break;
            case "资料情报收集品":
                this.ShopInventoryTitleLabel.string = "资料情报收集品";
                this.ShowItems(XGTS_ItemType.IntelDocument);
                break;
            case "能源燃料收集品":
                this.ShopInventoryTitleLabel.string = "能源燃料收集品";
                this.ShowItems(XGTS_ItemType.EnergyFuel);
                break;
            default:
                break;
        }

        this.Buttons.children.forEach(e => {
            e.getChildByName("Selected").active = e.name == name;
        })
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

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
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.ShopPanel);
                break;
        }
    }

    OnDragStart(item: XGTS_Item, point: Vec2) {
        this.Inventory.OnDragStart(item);
    }

    OnDragging(item: XGTS_Item, point: Vec2) {
        this.Inventory.OnDragging(item, point);
    }

    OnDragEnd(item: XGTS_Item, point: Vec2) {
        // 保存当前滚动位置
        let scrollOffset = this.ShopScrollView.getScrollOffset();

        this.Inventory.OnDragEnd(item, point);

        // 恢复滚动位置
        this.ShopScrollView.scrollToOffset(scrollOffset, 0);
    }

    protected onEnable(): void {
        EventManager.on(XGTS_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
        EventManager.on(XGTS_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.on(XGTS_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.on(XGTS_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);

    }
    protected onDisable(): void {
        EventManager.off(XGTS_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
        EventManager.off(XGTS_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.off(XGTS_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.off(XGTS_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);
    }

}