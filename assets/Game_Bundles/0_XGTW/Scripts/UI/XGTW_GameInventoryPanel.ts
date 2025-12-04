import { _decorator, Component, Label, Node, Event } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_DroppedItem from "../XGTW_DroppedItem";
import { XGTW_DataManager } from "../Framework/Managers/XGTW_DataManager";
import XGTW_PlayerController from "../XGTW_PlayerController";
import XGTW_GamePanel from "./XGTW_GamePanel";
import XGTW_GoodsItem from "./XGTW_GoodsItem";
import XGTW_InventoryButton from "./XGTW_InventoryButton";
import XGTW_ValueBar from "./XGTW_ValueBar";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import XGTW_GameManager from '../XGTW_GameManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTW_ItemData, XGTW_PlayerData } from '../Datas/XGTW_Data';
import { XGTW_AchievementManager, XGTW_EAchievement } from '../Framework/Managers/XGTW_AchievementManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
export enum InventoryType {
    None = "None",
    Helmet = "头盔",
    Bulletproof = "防弹衣",
    Weapon_0 = "主武器",
    Weapon_1 = "副武器",
    Pistol = "手枪",
    MeleeWeapon = "近战武器",
}

@ccclass('XGTW_GameInventoryPanel')
export default class XGTW_GameInventoryPanel extends Component {
    Helmet: XGTW_InventoryButton = null;
    Bulletproof: XGTW_InventoryButton = null;
    Weapon_0: XGTW_InventoryButton = null;
    Weapon_1: XGTW_InventoryButton = null;
    Pistol: XGTW_InventoryButton = null;
    MeleeWeapon: XGTW_InventoryButton = null;
    buttons: XGTW_InventoryButton[] = [];
    MoneyLabel: Label | null = null;
    GoodsTitleLabel: Label | null = null;
    GoodsContentLabel: Label | null = null;
    GoodsScrollViewContent: Node | null = null;
    PlayerGoodsContent: Node | null = null;
    DetailPanel: Node | null = null;
    DetailEquipButton: Node | null = null;
    DetailGoodsContent: Node | null = null;
    DetailGoodsLabel: Label | null = null;
    DetailUseButton: Node | null = null;
    DetailTakeButton: Node | null = null;
    GoodsSearchLabel: Node | null = null;
    ValuesContent: Node | null = null;
    PlayerBackpackItems: XGTW_GoodsItem[] = [];
    GoodsItems: XGTW_GoodsItem[] = [];
    DetailGoodsItem: XGTW_GoodsItem = null;
    ItemDatas: XGTW_ItemData[] = [];
    SelectItemData: XGTW_ItemData = null;
    valueBars: Node[] = [];
    protected onLoad(): void {
        this.Helmet = NodeUtil.GetComponent("Helmet", this.node, XGTW_InventoryButton);
        this.Bulletproof = NodeUtil.GetComponent("Bulletproof", this.node, XGTW_InventoryButton);
        this.Weapon_0 = NodeUtil.GetComponent("Weapon_0", this.node, XGTW_InventoryButton);
        this.Weapon_1 = NodeUtil.GetComponent("Weapon_1", this.node, XGTW_InventoryButton);
        this.Pistol = NodeUtil.GetComponent("Pistol", this.node, XGTW_InventoryButton);
        this.MeleeWeapon = NodeUtil.GetComponent("MeleeWeapon", this.node, XGTW_InventoryButton);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);

        this.buttons.push(this.Helmet);
        this.buttons.push(this.Bulletproof);
        this.buttons.push(this.Weapon_0);
        this.buttons.push(this.Weapon_1);
        this.buttons.push(this.Pistol);
        this.buttons.push(this.MeleeWeapon);

        this.GoodsTitleLabel = NodeUtil.GetComponent("GoodsTitleLabel", this.node, Label);
        this.GoodsContentLabel = NodeUtil.GetComponent("GoodsContentLabel", this.node, Label);
        this.GoodsScrollViewContent = NodeUtil.GetNode("GoodsScrollViewContent", this.node);
        this.DetailPanel = NodeUtil.GetNode("DetailPanel", this.node);
        this.DetailEquipButton = NodeUtil.GetNode("DetailEquipButton", this.node);
        this.DetailGoodsContent = NodeUtil.GetNode("DetailGoodsContent", this.node);
        this.DetailGoodsLabel = NodeUtil.GetComponent("DetailGoodsLabel", this.node, Label);
        this.DetailUseButton = NodeUtil.GetNode("DetailUseButton", this.node);
        this.DetailTakeButton = NodeUtil.GetNode("DetailTakeButton", this.node);
        this.PlayerGoodsContent = NodeUtil.GetNode("PlayerGoodsContent", this.node);
        this.GoodsSearchLabel = NodeUtil.GetNode("GoodsSearchLabel", this.node);
        this.ValuesContent = NodeUtil.GetNode("ValuesContent", this.node);
    }
    Show(title: string, itemDatas: XGTW_ItemData[], searchTime: number = 2) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        this.Helmet.Set(InventoryType.Helmet);
        this.Bulletproof.Set(InventoryType.Bulletproof);
        this.Weapon_0.Set(InventoryType.Weapon_0);
        this.Weapon_1.Set(InventoryType.Weapon_1);
        this.Pistol.Set(InventoryType.Pistol);
        this.MeleeWeapon.Set(InventoryType.MeleeWeapon);
        this.GoodsSearchLabel.active = true;
        this.GoodsItems.forEach((e) => PoolManager.PutNode(e.node));

        this.GoodsSearchLabel.active = itemDatas && itemDatas.length > 0;

        this.scheduleOnce(() => {
            this.GoodsSearchLabel.active = false;
            this.RefreshGoodsItem();
        }, searchTime);

        this.SelectItemData = null;
        this.ItemDatas = itemDatas;
        this.GoodsTitleLabel.string = `${title}`;
        this.RefreshMoney();
        this.RefreshInventoryButtons();
        this.RefreshBackpackGoodsItem();
        this.ShowValues();
    }
    ShowDetailPanel(active: boolean, isEquippedItem: boolean = false) {
        this.DetailPanel.active = active;

        if (active) {
            if (this.DetailGoodsItem) PoolManager.PutNode(this.DetailGoodsItem.node);
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/GoodsItem", this.DetailGoodsContent).then((node) => {
                let goods = node.getComponent(XGTW_GoodsItem);
                goods.InitSimple(this.SelectItemData);
                this.DetailGoodsItem = goods;
                this.DetailGoodsLabel.string = `${this.SelectItemData.Name}`;
            });

            let inPlayerGoods = XGTW_DataManager.PlayerData.BackpackItems.indexOf(this.SelectItemData) != -1;
            this.DetailUseButton.active = (!isEquippedItem || inPlayerGoods) && !(this.SelectItemData.Type == XGTW_ItemType[XGTW_ItemType.战利品]);
            this.DetailTakeButton.active = this.ItemDatas.indexOf(this.SelectItemData) != -1;
        } else {
            this.SelectItemData = null;
        }

        this.ShowValues(this.SelectItemData != null && isEquippedItem, this.SelectItemData);
    }
    ShowValues(active: boolean = false, data = null) {
        this.valueBars.forEach(e => PoolManager.PutNode(e));
        this.ValuesContent.active = active;

        if (active && !(this.ItemDatas && this.ItemDatas.length > 0)) {
            let hasValues = false;
            let type = XGTW_ItemType[`${data.Type}`];
            if (XGTW_ItemData.IsGun(type)) {
                hasValues = true;
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                    node.getComponent(XGTW_ValueBar).Init(data.Damage / 90, `伤害`);
                    this.valueBars.push(node);
                });
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                    node.getComponent(XGTW_ValueBar).Init((1.5 - data.FireRate) / 1.5, `射速`);
                    this.valueBars.push(node);
                });
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                    node.getComponent(XGTW_ValueBar).Init(data.Recoil / 0.5, `后坐力`);
                    this.valueBars.push(node);
                });
            }

            if (XGTW_ItemData.IsEquip(type)) {
                hasValues = true;

                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                    node.getComponent(XGTW_ValueBar).Init(data.Lv / 5, `防护等级`);
                    this.valueBars.push(node);
                });
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                    node.getComponent(XGTW_ValueBar).Init(data.Durability / 100, `耐久度`);
                    this.valueBars.push(node);
                });
            }

            if (XGTW_ItemData.IsMedicine(type)) {
                hasValues = true;

                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                    node.getComponent(XGTW_ValueBar).Init(data.HP / 500, `血量`);
                    this.valueBars.push(node);
                });
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/ValueBar", this.ValuesContent).then((node: Node) => {
                    node.getComponent(XGTW_ValueBar).Init((6 - data.Time) / 6, `速度`);
                    this.valueBars.push(node);
                });
            }

        }
    }
    RefreshGoodsItem() {
        this.GoodsItems.forEach((e) => PoolManager.PutNode(e.node));

        for (let i = 0; i < this.ItemDatas.length; i++) {
            const data = this.ItemDatas[i];
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/GoodsItem", this.GoodsScrollViewContent).then((node) => {
                let goods = node.getComponent(XGTW_GoodsItem);
                goods.Init(data, this.OnGoodsItemCallback.bind(this));
                this.GoodsItems.push(goods);
            });
        }
    }
    RefreshInventoryButtons() {
        this.buttons.forEach(e => e.Refresh());
    }
    RefreshBackpackGoodsItem() {
        this.PlayerBackpackItems.forEach((e) => PoolManager.PutNode(e.node));
        for (let i = 0; i < XGTW_PlayerData.MaxBackpackItems; i++) {
            const data = XGTW_DataManager.PlayerData.BackpackItems[i];
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/GoodsItem", this.PlayerGoodsContent).then((node) => {
                let goods = node.getComponent(XGTW_GoodsItem);
                if (data) {
                    goods.Init(data, this.OnGoodsItemCallback.bind(this));
                } else {
                    goods.InitBlank();
                }
                this.PlayerBackpackItems.push(goods);
            });
        }
    }
    OnGoodsItemCallback(data: XGTW_ItemData) {
        this.GoodsItems.forEach((e) => e.SetSelected(data));
        this.PlayerBackpackItems.forEach((e) => e.SetSelected(data));
        this.SelectItemData = data;
        this.ShowDetailPanel(true);
    }
    InventoryType: InventoryType;
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "Helmet"://头盔
                if (!XGTW_DataManager.PlayerData.Helmet) {
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.ShopPanel, [XGTW_ItemType.头盔]);
                } else {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Helmet;
                    this.ShowDetailPanel(true, true);
                }
                this.buttons.forEach(e => e.RefreshSelected(InventoryType[event.target.name]));
                break;
            case "Bulletproof"://防弹衣
                if (!XGTW_DataManager.PlayerData.Bulletproof) {
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.ShopPanel, [XGTW_ItemType.防弹衣]);
                } else {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Bulletproof;
                    this.ShowDetailPanel(true, true);
                }
                this.buttons.forEach(e => e.RefreshSelected(InventoryType[event.target.name]));
                break;
            case "Weapon_0"://主武器
                if (!XGTW_DataManager.PlayerData.Weapon_0) {
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.ShopPanel, [XGTW_ItemType.突击步枪]);
                } else {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Weapon_0;
                    this.ShowDetailPanel(true, true);
                }
                this.buttons.forEach(e => e.RefreshSelected(InventoryType[event.target.name]));
                break;
            case "Weapon_1"://副武器
                if (!XGTW_DataManager.PlayerData.Weapon_1) {
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.ShopPanel, [XGTW_ItemType.射手步枪]);
                } else {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Weapon_1;
                    this.ShowDetailPanel(true, true);
                }
                this.buttons.forEach(e => e.RefreshSelected(InventoryType[event.target.name]));
                break;
            case "Pistol"://手枪
                if (!XGTW_DataManager.PlayerData.Pistol) {
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.ShopPanel, [XGTW_ItemType.手枪]);
                } else {
                    this.SelectItemData = XGTW_DataManager.PlayerData.Pistol;
                    this.ShowDetailPanel(true, true);
                }
                this.buttons.forEach(e => e.RefreshSelected(InventoryType[event.target.name]));
                break;
            case "MeleeWeapon"://近战武器
                this.SelectItemData = XGTW_DataManager.PlayerData.MeleeWeapon;
                this.ShowDetailPanel(true, true);
                this.buttons.forEach(e => e.RefreshSelected(InventoryType[event.target.name]));
                break;
            case "ReturnButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.GameInventoryPanel);
                break;
            case "DetailUseButton":
                if (this.SelectItemData.Type == XGTW_ItemType[XGTW_ItemType.子弹]) {
                    if (XGTW_DataManager.PlayerData.Weapon_0 && (XGTW_DataManager.PlayerData.Weapon_0 as any).Desc == this.SelectItemData.Name) {
                        (XGTW_DataManager.PlayerData.Weapon_0 as any).BulletCount += this.SelectItemData.Count;
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        XGTW_DataManager.RemoveItemFromBackpack(this.SelectItemData);
                        this.ShowDetailPanel(false);
                    }
                    else if (XGTW_DataManager.PlayerData.Weapon_1 && (XGTW_DataManager.PlayerData.Weapon_1 as any).Desc == this.SelectItemData.Name) {
                        (XGTW_DataManager.PlayerData.Weapon_1 as any).BulletCount += this.SelectItemData.Count;
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        XGTW_DataManager.RemoveItemFromBackpack(this.SelectItemData);
                        this.ShowDetailPanel(false);
                    }
                    else if (XGTW_DataManager.PlayerData.Pistol && (XGTW_DataManager.PlayerData.Pistol as any).Desc == this.SelectItemData.Name) {
                        (XGTW_DataManager.PlayerData.Pistol as any).BulletCount += this.SelectItemData.Count;
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        XGTW_DataManager.RemoveItemFromBackpack(this.SelectItemData);
                        this.ShowDetailPanel(false);
                    } else {
                        UIManager.ShowTip("没有合适的枪械");
                    }
                } else if (XGTW_ItemData.IsMainGun(XGTW_ItemType[this.SelectItemData.Type])) {
                    //装备 0 或者 1
                    if (XGTW_DataManager.AddEquippedItem(InventoryType.Weapon_0, this.SelectItemData) || XGTW_DataManager.AddEquippedItem(InventoryType.Weapon_1, this.SelectItemData)) {
                        this.RefreshGoodsItem();
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        XGTW_DataManager.RemoveItemFromBackpack(this.SelectItemData);
                    } else {
                        UIManager.ShowTip("装备已满");
                    }
                } else if (XGTW_ItemType[this.SelectItemData.Type] == XGTW_ItemType.手枪) {
                    if (XGTW_DataManager.AddEquippedItem(InventoryType.Pistol, this.SelectItemData)) {
                        this.RefreshGoodsItem();
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        XGTW_DataManager.RemoveItemFromBackpack(this.SelectItemData);
                    } else {
                        UIManager.ShowTip("已有装备");
                    }
                } else if (XGTW_ItemType[this.SelectItemData.Type] == XGTW_ItemType.头盔) {
                    if (XGTW_DataManager.AddEquippedItem(InventoryType.Helmet, this.SelectItemData)) {
                        this.RefreshGoodsItem();
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        XGTW_DataManager.RemoveItemFromBackpack(this.SelectItemData);
                    } else {
                        UIManager.ShowTip("已有装备");
                    }
                } else if (XGTW_ItemType[this.SelectItemData.Type] == XGTW_ItemType.防弹衣) {
                    if (XGTW_DataManager.AddEquippedItem(InventoryType.Bulletproof, this.SelectItemData)) {
                        this.RefreshGoodsItem();
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        XGTW_DataManager.RemoveItemFromBackpack(this.SelectItemData);
                    } else {
                        UIManager.ShowTip("已有装备");
                    }
                }
                else if (XGTW_ItemType[this.SelectItemData.Type] == XGTW_ItemType.药品) {
                    if (XGTW_GameManager.Instance.playerCtrl.HP < XGTW_PlayerController.MAXHP) {
                        XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.GameInventoryPanel);
                        XGTW_GamePanel.Instance.ShowUseItem(true, this.SelectItemData, (item) => {
                            XGTW_GameManager.Instance.playerCtrl.HP += item.HP;
                            XGTW_DataManager.RemoveItemFromBackpack(item);
                            XGTW_AchievementManager.AddAchievementTimes(XGTW_EAchievement.根本死不掉);
                            this.RefreshBackpackGoodsItem();
                        });
                    } else {
                        UIManager.ShowTip("血量已满");
                    }
                }
                this.ShowDetailPanel(false);
                EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                break;
            case "DetailDetailButton":
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.ItemDetailPanel, [this.SelectItemData]);
                break;
            case "DetailDropButton":
                if (this.SelectItemData) {
                    const itemData = this.SelectItemData;
                    if (itemData.Type == XGTW_ItemType[XGTW_ItemType.近战]) return;
                    if (XGTW_DataManager.RemovePlayerItem(this.SelectItemData) || XGTW_DataManager.RemovePlayerEquippedItem(this.SelectItemData) || XGTW_DataManager.RemoveItemFromBackpack(this.SelectItemData)) {
                        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/DroppedItem", XGTW_GameManager.Instance.ItemsNd).then(node => {
                            node.setWorldPosition(XGTW_GameManager.Instance.player.getWorldPosition());
                            node.getComponent(XGTW_DroppedItem).Init(itemData);
                        });
                    }
                    XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Unequip);
                    this.RefreshGoodsItem();
                    this.ShowDetailPanel(false);

                    EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                }
                break;
            case "DetailCloseButton":
                this.ShowDetailPanel(false);
                break;
            case "DetailTakeButton":
                if (XGTW_DataManager.AddItemToBackpack(this.SelectItemData)) {
                    Tools.RemoveItemFromArray(this.ItemDatas, this.SelectItemData);
                    this.RefreshBackpackGoodsItem();
                    this.RefreshGoodsItem();
                } else {
                    UIManager.ShowTip("背包已满");
                }
                this.ShowDetailPanel(false);
                break;
        }

        this.RefreshInventoryButtons();
    }
    RefreshMoney() {
        this.MoneyLabel.string = `${XGTW_DataManager.Money}`;
    }
    protected onEnable(): void {
        EventManager.on(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
        EventManager.on(XGTW_Event.RefreshInventoryItems, this.RefreshGoodsItem, this);
        EventManager.on(XGTW_Event.RefreshBackpackGoodsItem, this.RefreshBackpackGoodsItem, this);
        EventManager.on(XGTW_Event.RefreshInventoryButtons, this.RefreshInventoryButtons, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.RefreshMoney, this.RefreshMoney, this);
        EventManager.off(XGTW_Event.RefreshInventoryItems, this.RefreshGoodsItem, this);
        EventManager.off(XGTW_Event.RefreshBackpackGoodsItem, this.RefreshBackpackGoodsItem, this);
        EventManager.off(XGTW_Event.RefreshInventoryButtons, this.RefreshInventoryButtons, this);
    }
}