import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, ScrollView } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import SJZ_Item from './SJZ_Item';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_Constant } from '../SJZ_Constant';
import SJZ_BackpackInventory from './SJZ_BackpackInventory';
import { SJZ_WeaponContent, SJZ_WeaponContentType } from './SJZ_WeaponContent';
import SJZ_SingleInventory from './SJZ_SingleInventory';
import { SJZ_UIManager } from './SJZ_UIManager';
import SJZ_ChestRigInventory from './SJZ_ChestRigInventory';
import SJZ_SafeBoxInventory from './SJZ_SafeBoxInventory';
import SJZ_Inventory from './SJZ_Inventory';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_InventoryPanel')
export default class SJZ_InventoryPanel extends PanelBase {
    Content: Node = null;
    ItemContent: Node = null;
    PocketInventorys: Node = null;
    InventoryNd: Node = null;

    MoneyLabel: Label = null;
    TotalValueLabel: Label = null;
    BackpackScrollView: ScrollView = null;

    //=============================================================
    Weapon_Primary: SJZ_WeaponContent = null;//主武器
    Weapon_Secondary: SJZ_WeaponContent = null;//副武器
    Weapon_Pistol: SJZ_WeaponContent = null;//手枪
    Weapon_Melee: SJZ_WeaponContent = null;//近战
    Weapon_Helmet: SJZ_WeaponContent = null;//头盔
    Weapon_BodyArmor: SJZ_WeaponContent = null;//防弹衣
    //=============================================================

    singleInventorys: SJZ_SingleInventory[] = [];

    ChestRigInventory: SJZ_ChestRigInventory = null;
    BackpackInventory: SJZ_BackpackInventory = null;
    SafeBoxInventory: SJZ_SafeBoxInventory = null;

    targetInventory: SJZ_Inventory = null;

    protected onLoad(): void {
        this.Content = NodeUtil.GetNode("Content", this.node);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.TotalValueLabel = NodeUtil.GetComponent("TotalValueLabel", this.node, Label);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.BackpackScrollView = NodeUtil.GetComponent("BackpackScrollView", this.node, ScrollView);
        this.PocketInventorys = NodeUtil.GetNode("PocketInventorys", this.node);
        this.InventoryNd = NodeUtil.GetNode("InventoryNd", this.node);
        this.ChestRigInventory = NodeUtil.GetComponent("ChestRigInventory", this.node, SJZ_ChestRigInventory);
        this.BackpackInventory = NodeUtil.GetComponent("BackpackInventory", this.node, SJZ_BackpackInventory);
        this.SafeBoxInventory = NodeUtil.GetComponent("SafeBoxInventory", this.node, SJZ_SafeBoxInventory);

        this.Weapon_Primary = NodeUtil.GetComponent("Weapon_Primary", this.node, SJZ_WeaponContent);
        this.Weapon_Secondary = NodeUtil.GetComponent("Weapon_Secondary", this.node, SJZ_WeaponContent);
        this.Weapon_Pistol = NodeUtil.GetComponent("Weapon_Pistol", this.node, SJZ_WeaponContent);
        this.Weapon_Melee = NodeUtil.GetComponent("Weapon_Melee", this.node, SJZ_WeaponContent);
        this.Weapon_Helmet = NodeUtil.GetComponent("Weapon_Helmet", this.node, SJZ_WeaponContent);
        this.Weapon_BodyArmor = NodeUtil.GetComponent("Weapon_BodyArmor", this.node, SJZ_WeaponContent);
    }

    protected start(): void {
        //初始化口袋
        for (let i = 0; i < this.PocketInventorys.children.length; i++) {
            let singleInventory = this.PocketInventorys.children[i].getComponent(SJZ_SingleInventory)
            if (!SJZ_DataManager.PlayerData.PocketData[i]) {
                SJZ_DataManager.PlayerData.PocketData[i] = [];
            }
            singleInventory.InitSingle(SJZ_DataManager.PlayerData.PocketData[i], SJZ_DataManager.PlayerData.SingleGrids[i]);
            this.singleInventorys.push(singleInventory);
        }
    }

    Show(spawnInverntory: Function): void {
        if (this.targetInventory) this.targetInventory.node.destroy();

        let inventory = spawnInverntory && spawnInverntory(this.InventoryNd);

        this.targetInventory = inventory;

        for (let i = 0; i < this.singleInventorys.length; i++) {
            let singleInventory = this.singleInventorys[i];
            if (!SJZ_DataManager.PlayerData.PocketData[i]) {
                SJZ_DataManager.PlayerData.PocketData[i] = [];
            }
            singleInventory.InitSingle(SJZ_DataManager.PlayerData.PocketData[i], SJZ_DataManager.PlayerData.SingleGrids[i]);
        }

        this.ChestRigInventory.Refresh();
        this.BackpackInventory.Refresh();
        this.SafeBoxInventory.Refresh();
        this.Weapon_Primary.Init(SJZ_WeaponContentType.Primary);
        this.Weapon_Secondary.Init(SJZ_WeaponContentType.Secondary);
        this.Weapon_Pistol.Init(SJZ_WeaponContentType.Pistol);
        this.Weapon_Melee.Init(SJZ_WeaponContentType.Melee);
        this.Weapon_Helmet.Init(SJZ_WeaponContentType.Helmet);
        this.Weapon_BodyArmor.Init(SJZ_WeaponContentType.BodyArmor);

        this.RefreshTotalValue();
        this.RefreshMoney();
        this.RefreshWeaponContentLabel();

        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    RefreshWeaponContentLabel() {
        this.Weapon_Primary.RefreshContentLabel();
        this.Weapon_Secondary.RefreshContentLabel();
        this.Weapon_Pistol.RefreshContentLabel();
        this.Weapon_Melee.RefreshContentLabel();
        this.Weapon_Helmet.RefreshContentLabel();
        this.Weapon_BodyArmor.RefreshContentLabel();
    }

    OnDragStart(item: SJZ_Item) {
        this.BackpackScrollView.enabled = false;

        if (this.targetInventory) this.targetInventory.OnDragStart(item);
        this.ChestRigInventory.OnDragStart(item);
        this.BackpackInventory.OnDragStart(item);
        this.SafeBoxInventory.OnDragStart(item);

        this.Weapon_Primary.OnDragStart(item);
        this.Weapon_Secondary.OnDragStart(item);
        this.Weapon_Pistol.OnDragStart(item);
        this.Weapon_Melee.OnDragStart(item);
        this.Weapon_Helmet.OnDragStart(item);
        this.Weapon_BodyArmor.OnDragStart(item);

        //口袋
        this.singleInventorys.forEach(element => {
            element.OnDragStart(item);
        });
    }

    OnDragging(item: SJZ_Item, point: Vec2) {
        if (this.targetInventory) this.targetInventory.OnDragging(item, point);
        this.ChestRigInventory.OnDragging(item, point);
        this.BackpackInventory.OnDragging(item, point);
        this.SafeBoxInventory.OnDragging(item, point);

        this.Weapon_Primary.OnDragging(item, point);
        this.Weapon_Secondary.OnDragging(item, point);
        this.Weapon_Pistol.OnDragging(item, point);
        this.Weapon_Melee.OnDragging(item, point);
        this.Weapon_Helmet.OnDragging(item, point);
        this.Weapon_BodyArmor.OnDragging(item, point);

        //口袋
        this.singleInventorys.forEach(element => {
            element.OnDragging(item, point);
        });
    }

    OnDragEnd(item: SJZ_Item, point: Vec2) {
        this.BackpackScrollView.enabled = true;

        if (this.targetInventory) this.targetInventory.OnDragEnd(item, point);
        this.ChestRigInventory.OnDragEnd(item, point);
        this.BackpackInventory.OnDragEnd(item, point);
        this.SafeBoxInventory.OnDragEnd(item, point);

        this.Weapon_Primary.OnDragEnd(item, point);
        this.Weapon_Secondary.OnDragEnd(item, point);
        this.Weapon_Pistol.OnDragEnd(item, point);
        this.Weapon_Melee.OnDragEnd(item, point);
        this.Weapon_Helmet.OnDragEnd(item, point);
        this.Weapon_BodyArmor.OnDragEnd(item, point);

        //口袋
        this.singleInventorys.forEach(element => {
            element.OnDragEnd(item, point);
        });

        this.RefreshTotalValue();

        EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_GAME_ITEM_UI);

        //TODO 优化
        EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_WEAON_CONTENT);
        EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_EUIP);
    }

    RefreshMoney() {
        this.MoneyLabel.string = `${SJZ_DataManager.PlayerData.Money.toLocaleString()}`;
    }

    RefreshTotalValue() {
        let totalValue = 0;
        //装备
        if (SJZ_DataManager.PlayerData.Weapon_Primary) totalValue += SJZ_DataManager.PlayerData.Weapon_Primary.Price;
        if (SJZ_DataManager.PlayerData.Weapon_Secondary) totalValue += SJZ_DataManager.PlayerData.Weapon_Secondary.Price;
        if (SJZ_DataManager.PlayerData.Weapon_Pistol) totalValue += SJZ_DataManager.PlayerData.Weapon_Pistol.Price;
        if (SJZ_DataManager.PlayerData.Weapon_Helmet) totalValue += SJZ_DataManager.PlayerData.Weapon_Helmet.Price;
        if (SJZ_DataManager.PlayerData.Weapon_BodyArmor) totalValue += SJZ_DataManager.PlayerData.Weapon_BodyArmor.Price;

        //口袋
        if (SJZ_DataManager.PlayerData.PocketData) {
            for (let i = 0; i < SJZ_DataManager.PlayerData.PocketData.length; i++) {
                const element = SJZ_DataManager.PlayerData.PocketData[i];
                if (element[0]) totalValue += element[0].Price;
            }
        }

        //胸挂
        if (SJZ_DataManager.PlayerData.ChestRigData) {
            totalValue += SJZ_DataManager.PlayerData.ChestRigData.Price;
            for (let i = 0; i < SJZ_DataManager.PlayerData.ChestRigData.EquipData.ItemData.length; i++) {
                let data = SJZ_DataManager.PlayerData.ChestRigData.EquipData.ItemData;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]) totalValue += data[j].Price;
                }
            }
        }

        //背包
        if (SJZ_DataManager.PlayerData.BackpackData) {
            totalValue += SJZ_DataManager.PlayerData.BackpackData.Price;
            for (let i = 0; i < SJZ_DataManager.PlayerData.BackpackData.EquipData.ItemData.length; i++) {
                let data = SJZ_DataManager.PlayerData.BackpackData.EquipData.ItemData;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]) totalValue += data[j].Price;
                }
            }
        }

        //安全箱
        if (SJZ_DataManager.PlayerData.SafeBox) {
            for (let i = 0; i < SJZ_DataManager.PlayerData.SafeBox.ItemData.length; i++) {
                let data = SJZ_DataManager.PlayerData.SafeBox.ItemData;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]) totalValue += data[j].Price;
                }
            }
        }

        this.TotalValueLabel.string = "总价值：" + SJZ_DataManager.PlayerData.GetTotalValue().toLocaleString();
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        const showItemInfoPanel = (container: any, key: string, content: SJZ_WeaponContent) => {
            const data = container[key];

            SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.ItemInfoPanel, [data, true, (option: string) => {
                if (option == "Sell") {
                    UIManager.ShowTip(`出售成功，获得${data.Price.toLocaleString()}`);
                    SJZ_DataManager.PlayerData.Money += data.Price;
                    container[key] = null;
                    if (SJZ_GameManager.Instance.player.weapon == data) SJZ_GameManager.Instance.player.weapon = null;
                    EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_EUIP);
                    EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_GAME_ITEM_UI);
                }

                if (option == "Takeoff") {
                    if (SJZ_DataManager.PlayerData.AddItemToInventory(data)) {
                        container[key] = null;
                        if (SJZ_GameManager.Instance.player.weapon == data) SJZ_GameManager.Instance.player.weapon = null;
                        EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_EUIP);
                        EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_GAME_ITEM_UI);
                    } else {
                        UIManager.ShowTip(`放入失败`);
                    }
                }

                content.RefreshWeaponContent();
                content.RefreshContentLabel();
                this.RefreshTotalValue();
            }]);
        };

        switch (event.target.name) {
            case "Weapon_Primary":
                if (SJZ_DataManager.PlayerData.Weapon_Primary) {
                    showItemInfoPanel(SJZ_DataManager.PlayerData, "Weapon_Primary", this.Weapon_Primary);
                }
                break;
            case "Weapon_Pistol":
                if (SJZ_DataManager.PlayerData.Weapon_Pistol) {
                    showItemInfoPanel(SJZ_DataManager.PlayerData, "Weapon_Pistol", this.Weapon_Pistol);
                }
                break;
            case "Weapon_Secondary":
                if (SJZ_DataManager.PlayerData.Weapon_Secondary) {
                    showItemInfoPanel(SJZ_DataManager.PlayerData, "Weapon_Secondary", this.Weapon_Secondary);
                }
                break;
            case "Weapon_Helmet":
                if (SJZ_DataManager.PlayerData.Weapon_Helmet) {
                    showItemInfoPanel(SJZ_DataManager.PlayerData, "Weapon_Helmet", this.Weapon_Helmet);
                }
                break;
            case "Weapon_BodyArmor":
                if (SJZ_DataManager.PlayerData.Weapon_BodyArmor) {
                    showItemInfoPanel(SJZ_DataManager.PlayerData, "Weapon_BodyArmor", this.Weapon_BodyArmor);
                }
                break;
            case "ReturnButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.InventoryPanel);
                break;
        }
    }

    protected onEnable(): void {
        EventManager.on(SJZ_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshWeaponContentLabel, this);
        EventManager.on(SJZ_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
        EventManager.on(SJZ_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.on(SJZ_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.on(SJZ_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);
    }
    protected onDisable(): void {
        EventManager.off(SJZ_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshWeaponContentLabel, this);
        EventManager.off(SJZ_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
        EventManager.off(SJZ_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.off(SJZ_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.off(SJZ_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);
    }
}