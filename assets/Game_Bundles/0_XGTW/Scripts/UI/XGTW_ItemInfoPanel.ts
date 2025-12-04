import { _decorator, Component, Label, Node, Slider, Sprite, Event, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

import { InventoryType } from "./XGTW_InventoryPanel";
import XGTW_Item from "./XGTW_Item";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_ItemInfoPanel')
export default class XGTW_ItemInfoPanel extends Component {
    NameLabel: Label | null = null;
    PriceLabel: Label | null = null;
    DescLabel: Label | null = null;
    SliderCountLabel: Label | null = null;
    SliderMaxCountLabel: Label | null = null;
    WeightLabel: Label | null = null;
    Durable: Node | null = null;
    DurableLabel: Label | null = null;
    ConfirmButtonLabel: Label | null = null;
    Slider: Slider | null = null;
    SliderBar: Sprite | null = null;
    Item: Node | null = null;
    Accessories: Node | null = null;
    SellButton: Node | null = null;
    PutButton: Node | null = null;
    count: number = 1;
    maxCount: number = 999;
    data: XGTW_ItemData = null;
    item: XGTW_Item = null;
    formShop: boolean = false;
    cb: Function = null;
    protected onLoad(): void {
        this.NameLabel = NodeUtil.GetComponent("NameLabel", this.node, Label);
        this.PriceLabel = NodeUtil.GetComponent("PriceLabel", this.node, Label);
        this.DescLabel = NodeUtil.GetComponent("DescLabel", this.node, Label);
        this.SliderCountLabel = NodeUtil.GetComponent("SliderCountLabel", this.node, Label);
        this.SliderMaxCountLabel = NodeUtil.GetComponent("SliderMaxCountLabel", this.node, Label);
        this.WeightLabel = NodeUtil.GetComponent("WeightLabel", this.node, Label);
        this.DurableLabel = NodeUtil.GetComponent("DurableLabel", this.node, Label);
        this.ConfirmButtonLabel = NodeUtil.GetComponent("ConfirmButtonLabel", this.node, Label);
        this.Slider = NodeUtil.GetComponent("Slider", this.node, Slider);
        this.SliderBar = NodeUtil.GetComponent("SliderBar", this.node, Sprite);
        this.Item = NodeUtil.GetNode("Item", this.node);
        this.Durable = NodeUtil.GetNode("Durable", this.node);
        this.Accessories = NodeUtil.GetNode("Accessories", this.node);
        this.SellButton = NodeUtil.GetNode("SellButton", this.node);
        this.PutButton = NodeUtil.GetNode("PutButton", this.node);
    }
    Show(data: XGTW_ItemData, formShop: boolean, cb: Function = null) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        if (!this.node.active) this.node.active = true;
        this.data = data;
        this.formShop = formShop;
        this.cb = cb;
        this.count = 1;

        this.NameLabel.string = `${XGTW_ItemData.GetFullName(data)}`;

        if (this.item) PoolManager.PutNode(this.item.node);

        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/Item", this.Item).then(e => {
            this.item = e.getComponent(XGTW_Item);
            this.item.InitSimple(data);
        });

        this.DurableLabel.string = `${data.Durable}/${data.Durable}`;
        this.Durable.active = data.Durable != -1;

        this.SellButton.active = !formShop;
        this.PutButton.active = !formShop;

        this.ConfirmButtonLabel.node.parent.active = true;
        this.ConfirmButtonLabel.string = formShop ? "购买" : "装备";

        if (!formShop) {
            this.ConfirmButtonLabel.node.parent.active = XGTW_ItemData.CanEquip(XGTW_ItemData.GetItemType(data.Type));
        }

        this.ShowSlider(XGTW_ItemData.IsConsumables(XGTW_ItemType[data.Type]) && formShop);

        let showAccessories = XGTW_ItemData.GetAssories(XGTW_ItemData.GetItemType(data.Type)).length > 0 && !formShop;
        this.Accessories.active = showAccessories;
        if (showAccessories) {
            this.RefreshAssories();
        }

        this.RefreshSlider();
        this.RefreshPriceAndWeight();

        let height = (showAccessories || XGTW_ItemData.IsConsumables(XGTW_ItemType[data.Type]) || this.ConfirmButtonLabel.node.parent.active) ? 900 : 650;
        this.node.getComponent(UITransform).setContentSize(650, height);

        this.node.active = false;
        this.node.active = true;
    }
    Hide() {
        if (this.node.active) this.node.active = false;
    }
    RefreshMoney() {
    }
    RefreshPriceAndWeight() {
        this.WeightLabel.string = `${(this.count * this.data.Weight).toFixed(1)}`;
        this.PriceLabel.string = `${this.count * this.data.Price}`;
    }
    SliderCallback(slider, customEventData) {
        this.count = Math.floor(slider.progress * this.maxCount);
        this.RefreshSlider();
    }

    //展示枪支配件
    RefreshAssories() {
        let as = XGTW_ItemData.GetAssories(XGTW_ItemData.GetItemType(this.data.Type));
        for (let i = 0; i < this.Accessories.children.length; i++) {
            const node = this.Accessories.children[i];
            node.active = as.find(f => f == node.name)
            if (node.active) {
                node.getChildByName("Icon").getComponent(Sprite).spriteFrame = null;
                let a = (this.data as any).Assories.find(f => f.Type == node.name);
                if (a) {
                    BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${a.Type}/${a.Name}`).then((sf: SpriteFrame) => {
                        node.getChildByName("Icon").getComponent(Sprite).spriteFrame = sf;
                    });
                }
            }
        }
    }
    //    //展示购买滑动器
    ShowSlider(active: boolean) {
        this.Slider.node.active = active;
    }
    RefreshSlider() {
        if (!this.Slider.node.active) return;
        this.count = Tools.Clamp(this.count, 1, this.maxCount);
        let progress = this.count / this.maxCount;
        this.Slider.progress = progress;
        this.SliderBar.fillRange = progress;
        this.SliderCountLabel.string = `${this.count}`;
        this.data.Count = this.count;
        this.RefreshPriceAndWeight();
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "AddButton":
                this.count++;
                this.RefreshSlider();
                break;
            case "ReduceButton":
                this.count--;
                this.RefreshSlider();
                break;
            case "ConfirmButton":
                //商店购买
                if (this.formShop) {
                    if (XGTW_DataManager.Money >= this.data.Price) {
                        XGTW_DataManager.Money -= this.data.Price;
                        let data = this.data;
                        if (XGTW_ItemData.GetItemType(this.data.Type) == XGTW_ItemType.抽奖礼包) {
                            data = (this.data as any).GetItemData();
                        }

                        XGTW_DataManager.AddPlayerItem(data, this.formShop);
                        XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.RewardPanel, [data]);
                    } else {
                        UIManager.ShowTip("金钱不足");
                    }
                } else {
                    //穿戴装备
                    if (XGTW_ItemData.IsMainGun(XGTW_ItemData.GetItemType(this.data.Type))) {
                        if (XGTW_DataManager.PlayerData.Weapon_0 == null) {
                            XGTW_DataManager.AddEquippedItem(InventoryType.Weapon_0, this.data);
                        } else if (XGTW_DataManager.PlayerData.Weapon_1 == null) {
                            XGTW_DataManager.AddEquippedItem(InventoryType.Weapon_1, this.data);
                        } else {
                            XGTW_DataManager.AddEquippedItem(InventoryType.Weapon_0, this.data);
                        }
                    } else if (XGTW_ItemData.GetItemType(this.data.Type) == XGTW_ItemType.手枪) {
                        XGTW_DataManager.AddEquippedItem(InventoryType.Pistol, this.data);
                    } else if (XGTW_ItemData.GetItemType(this.data.Type) == XGTW_ItemType.头盔) {
                        XGTW_DataManager.AddEquippedItem(InventoryType.Helmet, this.data);
                    } else if (XGTW_ItemData.GetItemType(this.data.Type) == XGTW_ItemType.防弹衣) {
                        XGTW_DataManager.AddEquippedItem(InventoryType.Bulletproof, this.data);
                    } else if (XGTW_ItemData.GetItemType(this.data.Type) == XGTW_ItemType.近战) {
                        XGTW_DataManager.AddEquippedItem(InventoryType.MeleeWeapon, this.data);
                    } else if (XGTW_ItemData.GetItemType(this.data.Type) == XGTW_ItemType.背包) {
                        XGTW_DataManager.AddEquippedItem(InventoryType.Backpack, this.data);
                    } else {
                        XGTW_DataManager.AddItemToBackpack(this.data);
                    }
                }
                this.Hide();
                this.cb && this.cb();
                break;

            case "SellButton":
                XGTW_DataManager.RemovePlayerItem(this.data);
                XGTW_DataManager.Money += this.data.Price * this.data.Count;
                UIManager.ShowTip(`出售成功，获得：${this.data.Price * this.data.Count}`);
                this.Hide();
                break;

            case "PutButton":
                XGTW_DataManager.RemovePlayerItem(this.data);
                XGTW_DataManager.RemoveItemFromLockbox(this.data);
                XGTW_DataManager.AddItemToBackpack(this.data);
                this.Hide();
                break;

            case "枪口":
                if (!this.data) return;
                console.error((this.data as any).Assories);
                if ((this.data as any).Assories.find(e => XGTW_ItemData.GetItemType(e.Type) == XGTW_ItemType.枪口)) {
                    XGTW_DataManager.AddPlayerItem((this.data as any).Assories.find(e => XGTW_ItemData.GetItemType(e.Type) == XGTW_ItemType.枪口), false);
                    (this.data as any).Assories = (this.data as any).Assories.filter(e => XGTW_ItemData.GetItemType(e.Type) != XGTW_ItemType.枪口);
                }
                break;
            case "握把":
                break;
            case "弹匣":
                break;
            case "枪托":
                break;
            case "瞄具":
                break;

        }
    }
}