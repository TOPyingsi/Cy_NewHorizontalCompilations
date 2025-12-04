import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, ScrollView } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import XGTS_Item from './XGTS_Item';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_Constant } from '../XGTS_Constant';
import XGTS_BackpackInventory from './XGTS_BackpackInventory';
import { XGTS_WeaponContent, XGTS_WeaponContentType } from './XGTS_WeaponContent';
import XGTS_SingleInventory from './XGTS_SingleInventory';
import { XGTS_UIManager } from './XGTS_UIManager';
import XGTS_ChestRigInventory from './XGTS_ChestRigInventory';
import XGTS_SafeBoxInventory from './XGTS_SafeBoxInventory';
import XGTS_Inventory from './XGTS_Inventory';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
import { XGTS_GameManager } from '../XGTS_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_InventoryPanel_Right')
export default class XGTS_InventoryPanel_Right extends PanelBase {
    playerNum :number = 0;
    Content: Node = null;
    ItemContent: Node = null;
    PocketInventorys: Node = null;
    InventoryNd: Node = null;

    MoneyLabel: Label = null;
    TotalValueLabel: Label = null;
    BackpackScrollView: ScrollView = null;

    //=============================================================
    Weapon_Primary: XGTS_WeaponContent = null;//主武器
    Weapon_Secondary: XGTS_WeaponContent = null;//副武器
    Weapon_Pistol: XGTS_WeaponContent = null;//手枪
    Weapon_Melee: XGTS_WeaponContent = null;//近战
    Weapon_Helmet: XGTS_WeaponContent = null;//头盔
    Weapon_BodyArmor: XGTS_WeaponContent = null;//防弹衣
    //=============================================================

    singleInventorys: XGTS_SingleInventory[] = [];

    ChestRigInventory: XGTS_ChestRigInventory = null;
    BackpackInventory: XGTS_BackpackInventory = null;
    SafeBoxInventory: XGTS_SafeBoxInventory = null;

    targetInventory: XGTS_Inventory = null;

    protected onLoad(): void {
        this.Content = NodeUtil.GetNode("Content", this.node);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.TotalValueLabel = NodeUtil.GetComponent("TotalValueLabel", this.node, Label);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.BackpackScrollView = NodeUtil.GetComponent("BackpackScrollView", this.node, ScrollView);
        this.PocketInventorys = NodeUtil.GetNode("PocketInventorys", this.node);
        this.InventoryNd = NodeUtil.GetNode("InventoryNd", this.node);
        this.ChestRigInventory = NodeUtil.GetComponent("ChestRigInventory", this.node, XGTS_ChestRigInventory);
        this.BackpackInventory = NodeUtil.GetComponent("BackpackInventory", this.node, XGTS_BackpackInventory);
        this.SafeBoxInventory = NodeUtil.GetComponent("SafeBoxInventory", this.node, XGTS_SafeBoxInventory);

        this.Weapon_Primary = NodeUtil.GetComponent("Weapon_Primary", this.node, XGTS_WeaponContent);
        this.Weapon_Secondary = NodeUtil.GetComponent("Weapon_Secondary", this.node, XGTS_WeaponContent);
        this.Weapon_Pistol = NodeUtil.GetComponent("Weapon_Pistol", this.node, XGTS_WeaponContent);
        this.Weapon_Melee = NodeUtil.GetComponent("Weapon_Melee", this.node, XGTS_WeaponContent);
        this.Weapon_Helmet = NodeUtil.GetComponent("Weapon_Helmet", this.node, XGTS_WeaponContent);
        this.Weapon_BodyArmor = NodeUtil.GetComponent("Weapon_BodyArmor", this.node, XGTS_WeaponContent);
    }

    protected start(): void {
        let playerNum = XGTS_GameManager.currentBackpackNum;
        //初始化口袋
        for (let i = 0; i < this.PocketInventorys.children.length; i++) {
            let singleInventory = this.PocketInventorys.children[i].getComponent(XGTS_SingleInventory)
            if (!XGTS_DataManager.PlayerDatas[playerNum].PocketData[i]) {
                XGTS_DataManager.PlayerDatas[playerNum].PocketData[i] = [];
            }
            singleInventory.InitSingle(XGTS_DataManager.PlayerDatas[playerNum].PocketData[i], XGTS_DataManager.PlayerDatas[playerNum].SingleGrids[i]);
            this.singleInventorys.push(singleInventory);
        }
        XGTS_GameManager.currentBackpackNum = 0;
    }

    Show(spawnInverntory: Function,playerNum:number): void {
        this.playerNum = playerNum;
        if (this.targetInventory) this.targetInventory.node.destroy();

        let inventory = spawnInverntory && spawnInverntory(this.InventoryNd);

        this.targetInventory = inventory;

        for (let i = 0; i < this.singleInventorys.length; i++) {
            let singleInventory = this.singleInventorys[i];
            if (!XGTS_DataManager.PlayerDatas[this.playerNum].PocketData[i]) {
                XGTS_DataManager.PlayerDatas[this.playerNum].PocketData[i] = [];
            }
            singleInventory.InitSingle(XGTS_DataManager.PlayerDatas[this.playerNum].PocketData[i], XGTS_DataManager.PlayerDatas[this.playerNum].SingleGrids[i]);
        }

        this.ChestRigInventory.InitPlayerNum(this.playerNum);
        this.BackpackInventory.InitPlayerNum(this.playerNum);
        this.SafeBoxInventory.InitPlayerNum(this.playerNum);
        this.Weapon_Primary.InitPlayerNum(this.playerNum);
        this.Weapon_Secondary.InitPlayerNum(this.playerNum);
        this.Weapon_Pistol.InitPlayerNum(this.playerNum);
        this.Weapon_Melee.InitPlayerNum(this.playerNum);
        this.Weapon_Helmet.InitPlayerNum(this.playerNum);
        this.Weapon_BodyArmor.InitPlayerNum(this.playerNum);

        this.ChestRigInventory.Refresh();
        this.BackpackInventory.Refresh();
        this.SafeBoxInventory.Refresh();
        this.Weapon_Primary.Init(XGTS_WeaponContentType.Primary);
        this.Weapon_Secondary.Init(XGTS_WeaponContentType.Secondary);
        this.Weapon_Pistol.Init(XGTS_WeaponContentType.Pistol);
        this.Weapon_Melee.Init(XGTS_WeaponContentType.Melee);
        this.Weapon_Helmet.Init(XGTS_WeaponContentType.Helmet);
        this.Weapon_BodyArmor.Init(XGTS_WeaponContentType.BodyArmor);

        this.RefreshTotalValue();
        this.RefreshMoney();
        this.RefreshWeaponContentLabel();
    }

    RefreshWeaponContentLabel() {
        this.Weapon_Primary.RefreshContentLabel();
        this.Weapon_Secondary.RefreshContentLabel();
        this.Weapon_Pistol.RefreshContentLabel();
        this.Weapon_Melee.RefreshContentLabel();
        this.Weapon_Helmet.RefreshContentLabel();
        this.Weapon_BodyArmor.RefreshContentLabel();
    }

    OnDragStart(item: XGTS_Item) {
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

    OnDragging(item: XGTS_Item, point: Vec2) {
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

    OnDragEnd(item: XGTS_Item, point: Vec2) {
        this.BackpackScrollView.enabled = true;
        // 保存当前滚动位置
        let scrollOffset = this.BackpackScrollView.getScrollOffset();

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

        EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_GAME_ITEM_UI);

        //TODO 优化
        EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_WEAON_CONTENT);
        EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_EUIP);

        // 恢复滚动位置
        this.BackpackScrollView.scrollToOffset(scrollOffset, 0);
    }

    RefreshMoney() {
        this.MoneyLabel.string = `${XGTS_DataManager.PlayerDatas[this.playerNum].Money.toLocaleString()}`;
    }

    RefreshTotalValue() {
        let totalValue = 0;
        //装备
        if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Primary) totalValue += XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Primary.Price;
        if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Secondary) totalValue += XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Secondary.Price;
        if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Pistol) totalValue += XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Pistol.Price;
        if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet) totalValue += XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet.Price;
        if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor) totalValue += XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor.Price;

        //口袋
        if (XGTS_DataManager.PlayerDatas[this.playerNum].PocketData) {
            for (let i = 0; i < XGTS_DataManager.PlayerDatas[this.playerNum].PocketData.length; i++) {
                const element = XGTS_DataManager.PlayerDatas[this.playerNum].PocketData[i];
                if (element[0]) totalValue += element[0].Price;
            }
        }

        //胸挂
        if (XGTS_DataManager.PlayerDatas[this.playerNum].ChestRigData) {
            totalValue += XGTS_DataManager.PlayerDatas[this.playerNum].ChestRigData.Price;
            for (let i = 0; i < XGTS_DataManager.PlayerDatas[this.playerNum].ChestRigData.EquipData.ItemData.length; i++) {
                let data = XGTS_DataManager.PlayerDatas[this.playerNum].ChestRigData.EquipData.ItemData;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]) totalValue += data[j].Price;
                }
            }
        }

        //背包
        if (XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData) {
            totalValue += XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.Price;
            for (let i = 0; i < XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.EquipData.ItemData.length; i++) {
                let data = XGTS_DataManager.PlayerDatas[this.playerNum].BackpackData.EquipData.ItemData;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]) totalValue += data[j].Price;
                }
            }
        }

        //安全箱
        if (XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox) {
            for (let i = 0; i < XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData.length; i++) {
                let data = XGTS_DataManager.PlayerDatas[this.playerNum].SafeBox.ItemData;
                for (let j = 0; j < data.length; j++) {
                    if (data[j]) totalValue += data[j].Price;
                }
            }
        }

        this.TotalValueLabel.string = "总价值：" + XGTS_DataManager.PlayerDatas[this.playerNum].GetTotalValue().toLocaleString();
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

        const showItemInfoPanel = (container: any, key: string, content: XGTS_WeaponContent) => {
            const data = container[key];
            XGTS_GameManager.itemPlayerNum = this.playerNum;
            XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.ItemInfoPanel, [data, true, (option: string) => {
                if (option == "Sell") {
                    UIManager.ShowTip(`出售成功，获得${data.Price.toLocaleString()}`);
                    XGTS_DataManager.PlayerDatas[this.playerNum].Money += data.Price;
                    container[key] = null;
                    if (XGTS_GameManager.Instance.player.weapon == data) XGTS_GameManager.Instance.player.weapon = null;
                    EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_EUIP);
                    EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_GAME_ITEM_UI);
                }

                if (option == "Takeoff") {
                    if (XGTS_DataManager.PlayerDatas[this.playerNum].AddItemToInventory(data)) {
                        container[key] = null;
                        if (XGTS_GameManager.Instance.player.weapon == data) XGTS_GameManager.Instance.player.weapon = null;
                        EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_EUIP);
                        EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_GAME_ITEM_UI);
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
                if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Primary) {
                    showItemInfoPanel(XGTS_DataManager.PlayerDatas[this.playerNum], "Weapon_Primary", this.Weapon_Primary);
                }
                break;
            case "Weapon_Pistol":
                if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Pistol) {
                    showItemInfoPanel(XGTS_DataManager.PlayerDatas[this.playerNum], "Weapon_Pistol", this.Weapon_Pistol);
                }
                break;
            case "Weapon_Secondary":
                if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Secondary) {
                    showItemInfoPanel(XGTS_DataManager.PlayerDatas[this.playerNum], "Weapon_Secondary", this.Weapon_Secondary);
                }
                break;
            case "Weapon_Helmet":
                if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_Helmet) {
                    showItemInfoPanel(XGTS_DataManager.PlayerDatas[this.playerNum], "Weapon_Helmet", this.Weapon_Helmet);
                }
                break;
            case "Weapon_BodyArmor":
                if (XGTS_DataManager.PlayerDatas[this.playerNum].Weapon_BodyArmor) {
                    showItemInfoPanel(XGTS_DataManager.PlayerDatas[this.playerNum], "Weapon_BodyArmor", this.Weapon_BodyArmor);
                }
                break;
            case "ReturnButton":
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.InventoryPanel_Right);
                break;
        }
    }

    protected onEnable(): void {
        EventManager.on(XGTS_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshWeaponContentLabel, this);
        EventManager.on(XGTS_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
        EventManager.on(XGTS_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.on(XGTS_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.on(XGTS_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);

    }
    protected onDisable(): void {
        EventManager.off(XGTS_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshWeaponContentLabel, this);
        EventManager.off(XGTS_Constant.Event.REFRESH_MONEY, this.RefreshMoney, this);
        EventManager.off(XGTS_Constant.Event.ON_ITEM_DRAGSTART, this.OnDragStart, this);
        EventManager.off(XGTS_Constant.Event.ON_ITEM_DRAGGING, this.OnDragging, this);
        EventManager.off(XGTS_Constant.Event.ON_ITEM_DRAGEND, this.OnDragEnd, this);
    }
}