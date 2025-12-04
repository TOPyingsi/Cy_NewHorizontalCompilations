import { _decorator, Component, Label, Node, Event, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_BackpackPanel from "./XGTW_BackpackPanel";
import XGTW_EquipInfoPanel from "./XGTW_EquipInfoPanel";
import XGTW_InventoryButton from "./XGTW_InventoryButton";
import XGTW_Item from "./XGTW_Item";
import XGTW_ItemInfoPanel from "./XGTW_ItemInfoPanel";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import Banner from '../../../../Scripts/Banner';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
export enum InventoryType {
    None = "None",
    Helmet = "头盔",
    Bulletproof = "防弹衣",
    Weapon_0 = "主武器",
    Weapon_1 = "副武器",
    Pistol = "手枪",
    MeleeWeapon = "近战武器",
    Backpack = "背包",
}

@ccclass('XGTW_InventoryPanel')
export default class XGTW_InventoryPanel extends Component {
    static Instance: XGTW_InventoryPanel = null;
    Weapon_0: XGTW_InventoryButton = null;
    Weapon_1: XGTW_InventoryButton = null;
    MeleeWeapon: XGTW_InventoryButton = null;
    Pistol: XGTW_InventoryButton = null;
    Helmet: XGTW_InventoryButton = null;
    Bulletproof: XGTW_InventoryButton = null;
    Backpack: XGTW_InventoryButton = null;
    equipButtons: XGTW_InventoryButton[] = [];
    MoneyLabel: Label | null = null;
    WeaponItemContent: Node | null = null;
    ItemContent: Node | null = null;
    DetailEquipButton: Node | null = null;
    DetailGoodsContent: Node | null = null;
    DetailGoodsLabel: Label | null = null;
    DetailPutButton: Node | null = null;
    DetailBuyBulletButton: Node | null = null;
    WeaponButtons: Node | null = null;
    PlayerGoodsItems: XGTW_Item[] = [];
    DetailGoodsItem: XGTW_Item = null;
    ItemInfoPanel: XGTW_ItemInfoPanel = null;
    EquipInfoPanel: XGTW_EquipInfoPanel = null;
    BackpackPanel: XGTW_BackpackPanel = null;
    Items: XGTW_Item[] = [];
    SelectItemData: XGTW_ItemData = null;
    protected onLoad(): void {
        XGTW_InventoryPanel.Instance = this;

        this.Helmet = NodeUtil.GetComponent("Helmet", this.node, XGTW_InventoryButton);
        this.Bulletproof = NodeUtil.GetComponent("Bulletproof", this.node, XGTW_InventoryButton);
        this.Weapon_0 = NodeUtil.GetComponent("Weapon_0", this.node, XGTW_InventoryButton);
        this.Weapon_1 = NodeUtil.GetComponent("Weapon_1", this.node, XGTW_InventoryButton);
        this.Pistol = NodeUtil.GetComponent("Pistol", this.node, XGTW_InventoryButton);
        this.MeleeWeapon = NodeUtil.GetComponent("MeleeWeapon", this.node, XGTW_InventoryButton);
        this.Backpack = NodeUtil.GetComponent("Backpack", this.node, XGTW_InventoryButton);

        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);

        this.equipButtons.push(this.Helmet);
        this.equipButtons.push(this.Bulletproof);
        this.equipButtons.push(this.Weapon_0);
        this.equipButtons.push(this.Weapon_1);
        this.equipButtons.push(this.Pistol);
        this.equipButtons.push(this.MeleeWeapon);
        this.equipButtons.push(this.Backpack);

        this.WeaponButtons = NodeUtil.GetNode("WeaponButtons", this.node);

        this.WeaponItemContent = NodeUtil.GetNode("WeaponItemContent", this.node);
        this.ItemContent = NodeUtil.GetNode("ItemContent", this.node);
        this.DetailEquipButton = NodeUtil.GetNode("DetailEquipButton", this.node);
        this.DetailGoodsContent = NodeUtil.GetNode("DetailGoodsContent", this.node);
        this.DetailGoodsLabel = NodeUtil.GetComponent("DetailGoodsLabel", this.node, Label);
        this.DetailPutButton = NodeUtil.GetNode("DetailPutButton", this.node);
        this.DetailBuyBulletButton = NodeUtil.GetNode("DetailBuyBulletButton", this.node);

        this.ItemInfoPanel = NodeUtil.GetComponent("ItemInfoPanel", this.node, XGTW_ItemInfoPanel);
        this.EquipInfoPanel = NodeUtil.GetComponent("EquipInfoPanel", this.node, XGTW_EquipInfoPanel);
        this.BackpackPanel = NodeUtil.GetComponent("BackpackPanel", this.node, XGTW_BackpackPanel);
    }
    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        this.ItemInfoPanel.Hide();

        this.Helmet.Set(InventoryType.Helmet);
        this.Bulletproof.Set(InventoryType.Bulletproof);
        this.Weapon_0.Set(InventoryType.Weapon_0);
        this.Weapon_1.Set(InventoryType.Weapon_1);
        this.Pistol.Set(InventoryType.Pistol);
        this.MeleeWeapon.Set(InventoryType.MeleeWeapon);
        this.Backpack.Set(InventoryType.Backpack);

        this.RefreshItemByWeaponButtons("Button_All");
        this.SelectItemData = null;
        this.RefreshMoney();
        this.RefreshEquipButtons();
    }
    RefreshItems(itemDatas: XGTW_ItemData[]) {
        this.Items.forEach((e) => e.node.destroy());
        this.Items = [];

        for (let i = 0; i < itemDatas.length; i++) {
            BundleManager.GetBundle(GameManager.GameData.DefaultBundle).load("Prefabs/UI/Item", (err: any, prefab: Prefab) => {
                let node = instantiate(prefab);
                node.setParent(this.ItemContent);
                let item = node.getComponent(XGTW_Item);
                item.Init(itemDatas[i], this.OnItemCallback.bind(this), false);
                this.Items.push(item);
            });
        }
    }
    RefreshEquipButtons() {
        this.equipButtons.forEach(e => e.Refresh());
    }
    RefreshEquipButtonSelect(type: InventoryType) {
        this.equipButtons.forEach(e => e.RefreshSelected(type));
    }
    OnItemCallback(data: XGTW_ItemData) {
        this.EquipInfoPanel.Hide();
        this.BackpackPanel.Hide();

        let confirmCB = null;
        switch (XGTW_ItemData.GetItemType(data.Type)) {
            case XGTW_ItemType.弹匣:
            case XGTW_ItemType.握把:
            case XGTW_ItemType.枪口:
            case XGTW_ItemType.枪托:
            case XGTW_ItemType.瞄具:
                if (!this.SelectItemData) {
                    confirmCB = () => { UIManager.ShowTip("未选择装备"); }
                } else {
                    confirmCB = () => {
                        if (XGTW_ItemData.GetAssories(XGTW_ItemData.GetItemType(this.SelectItemData.Type)).find(e => e == data.Type)) {
                            let unequippedItem = XGTW_DataManager.EquipAccessorie(this.SelectItemData, data);
                            XGTW_DataManager.RemovePlayerItem(data);
                            if (unequippedItem) {
                                XGTW_DataManager.AddPlayerItem(unequippedItem);
                            }
                            this.ItemInfoPanel.Hide();
                            this.EquipInfoPanel.RefreshAssories();
                            UIManager.ShowTip("装配成功");
                        } else {
                            UIManager.ShowTip("装配失败");
                        }
                    }
                }
                break;
            case XGTW_ItemType.冲锋枪:
            case XGTW_ItemType.射手步枪:
            case XGTW_ItemType.手枪:
            case XGTW_ItemType.弓弩:
            case XGTW_ItemType.栓动步枪:
            case XGTW_ItemType.突击步枪:
            case XGTW_ItemType.轻机枪:
            case XGTW_ItemType.霰弹枪:
            case XGTW_ItemType.防弹衣:
            case XGTW_ItemType.头盔:
            case XGTW_ItemType.近战:
            case XGTW_ItemType.背包:
                confirmCB = () => {
                    this.ItemInfoPanel.Hide();
                    this.RefreshEquipButtons();
                }
                break;
        }

        this.ItemInfoPanel.Show(data, false, confirmCB);
    }
    InventoryType: InventoryType;
    //    //右侧物品菜单
    RefreshItemByWeaponButtons(name: string) {
        let items = [];
        switch (name) {
            case "Button_All"://全部
                items.push(...XGTW_DataManager.PlayerItems);
                this.RefreshItems(items);
                break;

            case "Button_Gun"://枪械
                items.push(...(XGTW_DataManager.PlayerItems.filter(a => XGTW_ItemData.GunTypes.find(e => e == XGTW_ItemType[`${a.Type}`]))));
                this.RefreshItems(items);
                break

            case "Button_ZhuangBei"://装备
                items.push(...(XGTW_DataManager.PlayerItems.filter(a => XGTW_ItemData.FangJuTypes.find(e => e == XGTW_ItemType[`${a.Type}`]))));
                this.RefreshItems(items);
                break

            case "Button_PeiJian"://配件
                items.push(...(XGTW_DataManager.PlayerItems.filter(a => XGTW_ItemData.PeiJianTypes.find(e => e == XGTW_ItemType[`${a.Type}`]))));
                this.RefreshItems(items);
                break

            case "Button_YiLiao"://消耗品
                items.push(...(XGTW_DataManager.PlayerItems.filter(a => XGTW_ItemData.IsConsumables(XGTW_ItemType[`${a.Type}`]))));
                this.RefreshItems(items);
                break

            case "Button_CangKu"://保险箱
                items.push(...(XGTW_DataManager.PlayerData.LockboxItems));
                this.RefreshItems(items);
                break
        }

        this.WeaponButtons.children.forEach(e => e.getChildByName("BG").active = e.name == name);
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        this.ItemInfoPanel.Hide();

        switch (event.target.name) {
            case "Button_All"://全部
            case "Button_Gun"://枪械
            case "Button_ZhuangBei"://装备
            case "Button_PeiJian"://配件
            case "Button_YiLiao"://消耗品
            case "Button_CangKu"://保险箱
                this.RefreshItemByWeaponButtons(event.target.name);
                break

            case "Helmet"://头盔
                this.RefreshEquipButtonSelect(InventoryType.Helmet);
                if (XGTW_DataManager.PlayerData.Helmet) {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Helmet;
                    this.EquipInfoPanel.Show(this.SelectItemData);
                }
                break;

            case "Bulletproof"://防弹衣
                this.RefreshEquipButtonSelect(InventoryType.Bulletproof);
                if (XGTW_DataManager.PlayerData.Bulletproof) {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Bulletproof;
                    this.EquipInfoPanel.Show(this.SelectItemData);
                }
                break;

            case "Weapon_0"://主武器
                this.RefreshEquipButtonSelect(InventoryType.Weapon_0);
                if (XGTW_DataManager.PlayerData.Weapon_0) {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Weapon_0;
                    this.EquipInfoPanel.Show(this.SelectItemData);
                }
                break;

            case "Weapon_1"://副武器
                this.RefreshEquipButtonSelect(InventoryType.Weapon_1);
                if (XGTW_DataManager.PlayerData.Weapon_1) {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Weapon_1;
                    this.EquipInfoPanel.Show(this.SelectItemData);
                }
                break;

            case "Pistol"://手枪
                this.RefreshEquipButtonSelect(InventoryType.Pistol);
                if (XGTW_DataManager.PlayerData.Pistol) {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Pistol;
                    this.EquipInfoPanel.Show(this.SelectItemData);
                }
                break;

            case "MeleeWeapon"://近战武器
                this.RefreshEquipButtonSelect(InventoryType.MeleeWeapon);
                if (XGTW_DataManager.PlayerData.MeleeWeapon) {
                    this.SelectItemData = XGTW_DataManager.PlayerData.MeleeWeapon;
                    this.EquipInfoPanel.Show(this.SelectItemData);
                }
                break;

            case "Backpack"://背包
                this.BackpackPanel.Show();
                break;

            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.InventoryPanel);
                break;

            case "AddMoneyButton":
                Banner.Instance.ShowVideoAd(() => {
                    XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.GetMoney);
                    XGTW_DataManager.Money += 20000;
                });
                break;
        }

    }
    RefreshMoney() {
        this.MoneyLabel.string = `${XGTW_DataManager.Money}`;
    }
    protected onEnable(): void {
        EventManager.on(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
        EventManager.on(XGTW_Event.RefreshInventoryItems,
            () => {
                for (let i = 0; i < this.WeaponButtons.children.length; i++) {
                    if (this.WeaponButtons.children[i].getChildByName("BG").active) {
                        this.RefreshItemByWeaponButtons(this.WeaponButtons.children[i].name);
                    }
                }
            }, this);
        EventManager.on(XGTW_Event.RefreshInventoryButtons, this.RefreshEquipButtons, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
        EventManager.off(XGTW_Event.RefreshInventoryItems, () => {
            for (let i = 0; i < this.WeaponButtons.children.length; i++) {
                if (this.WeaponButtons.children[i].getChildByName("BG").active) {
                    this.RefreshItemByWeaponButtons(this.WeaponButtons.children[i].name);
                }
            }
        }, this);
        EventManager.off(XGTW_Event.RefreshInventoryButtons, this.RefreshEquipButtons, this);
    }
}