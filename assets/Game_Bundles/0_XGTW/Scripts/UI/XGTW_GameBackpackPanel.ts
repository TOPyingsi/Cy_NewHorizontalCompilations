import { _decorator, Component, Node, Label, Event } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_DroppedItem from "../XGTW_DroppedItem";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import XGTW_GameManager from '../XGTW_GameManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import XGTW_BackpackItem from './XGTW_BackpackItem';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import XGTW_BackpackWeaponButton from './XGTW_BackpackWeaponButton';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_GameBackpackPanel')
export default class XGTW_GameBackpackPanel extends Component {
    public static Instance: XGTW_GameBackpackPanel = null;
    QualityBar: Node | null = null;
    ChangeTypeButton: Node | null = null;
    ScrollViewContent: Node | null = null;
    Weapon_0: XGTW_BackpackWeaponButton = null;
    Weapon_1: XGTW_BackpackWeaponButton = null;
    MeleeWeapon: XGTW_BackpackWeaponButton = null;
    Pistol: XGTW_BackpackWeaponButton = null;
    Helmet: XGTW_BackpackWeaponButton = null;
    Bulletproof: XGTW_BackpackWeaponButton = null;
    Backpack: XGTW_BackpackWeaponButton = null;
    TotalWeightLabel: Label | null = null;
    TotalPriceLabel: Label | null = null;
    BackpackItems: XGTW_BackpackItem[] = [];
    SelectData: XGTW_ItemData = null;
    isBackpackList: boolean = true;

    protected onLoad(): void {
        XGTW_GameBackpackPanel.Instance = this;
        this.QualityBar = NodeUtil.GetNode("QualityBar", this.node);
        this.ChangeTypeButton = NodeUtil.GetNode("ChangeTypeButton", this.node);
        this.ScrollViewContent = NodeUtil.GetNode("ScrollViewContent", this.node);

        this.Weapon_0 = NodeUtil.GetComponent("Weapon_0", this.node, XGTW_BackpackWeaponButton);
        this.Weapon_1 = NodeUtil.GetComponent("Weapon_1", this.node, XGTW_BackpackWeaponButton);
        this.MeleeWeapon = NodeUtil.GetComponent("MeleeWeapon", this.node, XGTW_BackpackWeaponButton);
        this.Pistol = NodeUtil.GetComponent("Pistol", this.node, XGTW_BackpackWeaponButton);
        this.Helmet = NodeUtil.GetComponent("Helmet", this.node, XGTW_BackpackWeaponButton);
        this.Bulletproof = NodeUtil.GetComponent("Bulletproof", this.node, XGTW_BackpackWeaponButton);
        this.Backpack = NodeUtil.GetComponent("Backpack", this.node, XGTW_BackpackWeaponButton);
        this.TotalWeightLabel = NodeUtil.GetComponent("TotalWeightLabel", this.node, Label);
        this.TotalPriceLabel = NodeUtil.GetComponent("TotalPriceLabel", this.node, Label);
    }
    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        if (!this.node.active) this.node.active = true;
        this.isBackpackList = true;
        this.RefreshWeaponButtons();
        this.RefreshChangeTypeButton();
        this.RefreshItems();
    }

    RefreshWeaponButtons() {
        this.Weapon_0.Refresh(XGTW_DataManager.PlayerData.Weapon_0);
        this.Weapon_1.Refresh(XGTW_DataManager.PlayerData.Weapon_1);
        this.MeleeWeapon.Refresh(XGTW_DataManager.PlayerData.MeleeWeapon);
        this.Pistol.Refresh(XGTW_DataManager.PlayerData.Pistol);
        this.Helmet.Refresh(XGTW_DataManager.PlayerData.Helmet);
        this.Bulletproof.Refresh(XGTW_DataManager.PlayerData.Bulletproof);
        this.Backpack.Refresh(XGTW_DataManager.PlayerData.Backpack);
    }

    RefreshItems() {
        this.BackpackItems.forEach((e) => PoolManager.PutNode(e.node));
        let datas = this.isBackpackList ? XGTW_DataManager.PlayerData.BackpackItems : XGTW_DataManager.PlayerData.LockboxItems;

        let price = 0;
        let weight = 0;
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/BackpackItem", this.ScrollViewContent).then((node) => {
                let item = node.getComponent(XGTW_BackpackItem);

                if (this.isBackpackList) {
                    item.Init(data, this.PutInLockbox.bind(this), this.ThrowAway.bind(this), "存加密", "丢弃");
                } else {
                    item.Init(data, this.PutInBackpack.bind(this), this.ThrowAwayFromLockBox.bind(this), "放背包", "丢弃");
                }

                this.BackpackItems.push(item);
            });
            price += Math.ceil(data.Price);
            weight += Math.ceil(data.Weight);
        }

        this.TotalPriceLabel.string = `${price}`;
        this.TotalWeightLabel.string = `${weight}`;
    }

    GetLockBoxTotalWeight() {
        let datas = XGTW_DataManager.PlayerData.LockboxItems;
        let weight = 0;
        for (let i = 0; i < datas.length; i++) {
            weight += Math.ceil(datas[i].Weight);
        }
        return weight;
    }

    ThrowAway(data) {
        XGTW_DataManager.RemoveItemFromBackpack(data);
        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/DroppedItem", XGTW_GameManager.Instance.ItemsNd).then(node => {
            node.setWorldPosition(XGTW_GameManager.Instance.player.getWorldPosition());
            node.getComponent(XGTW_DroppedItem).Init(data);
        });

        this.RefreshItems();
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Unequip);
        EventManager.Scene.emit(XGTW_Event.RefreshEquip);
    }

    ThrowAwayFromLockBox(data) {
        XGTW_DataManager.RemoveItemFromLockbox(data);
        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/DroppedItem", XGTW_GameManager.Instance.ItemsNd).then(node => {
            node.setWorldPosition(XGTW_GameManager.Instance.player.getWorldPosition());
            node.getComponent(XGTW_DroppedItem).Init(data);
        });

        this.RefreshItems();
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Unequip);
        EventManager.Scene.emit(XGTW_Event.RefreshEquip);
    }

    PutInBackpack(data) {
        XGTW_DataManager.RemoveItemFromLockbox(data);
        XGTW_DataManager.AddItemToBackpack(data);
        this.RefreshItems();
    }

    PutInLockbox(data) {
        if ((this.GetLockBoxTotalWeight() + data.Weight) > 300) {
            UIManager.ShowTip("重量超出上限");
        }

        XGTW_DataManager.RemoveItemFromBackpack(data);
        XGTW_DataManager.AddItemToLockbox(data);
        this.RefreshItems();
    }

    RefreshItemSelect(data) {
        this.BackpackItems.forEach((e) => e.SetSelect(data));
    }

    RefreshChangeTypeButton() {
        this.ChangeTypeButton.getChildByName("Backpack").active = this.isBackpackList;
        this.ChangeTypeButton.getChildByName("Lockbox").active = !this.isBackpackList;
        this.ChangeTypeButton.getChildByName("ChangeTypeButtonLb").getComponent(Label).string = this.isBackpackList ? "背包" : "加密箱";
    }

    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "ReturnButtton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.GameBackpackPanel);
                break;

            case "ChangeTypeButton":
                this.isBackpackList = !this.isBackpackList;
                this.RefreshChangeTypeButton();
                this.RefreshItems();
                break;

        }
    }
    protected onEnable(): void {
        EventManager.on(XGTW_Event.RefreshInventoryButtons, this.RefreshWeaponButtons, this);
        EventManager.on(XGTW_Event.RefreshBackpackGoodsItem, this.RefreshItems, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.RefreshInventoryButtons, this.RefreshWeaponButtons, this);
        EventManager.off(XGTW_Event.RefreshBackpackGoodsItem, this.RefreshItems, this);
    }
}