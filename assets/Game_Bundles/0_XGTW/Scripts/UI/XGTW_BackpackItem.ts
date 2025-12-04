import { _decorator, Component, Label, Node, Event } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_GameBackpackPanel from "./XGTW_GameBackpackPanel";
import XGTW_Item from "./XGTW_Item";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { GameData } from 'db://assets/Scripts/Framework/Managers/DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

@ccclass('XGTW_BackpackItem')
export default class XGTW_BackpackItem extends Component {
    NameLabel: Label | null = null;
    WeightLabel: Label | null = null;
    PriceLabel: Label | null = null;
    Button_0Label: Label | null = null;
    Button_1Label: Label | null = null;
    Item: Node | null = null;
    Buttons: Node | null = null;
    data: XGTW_ItemData;
    cb_0: Function = null;
    cb_1: Function = null;

    protected onLoad(): void {
        this.NameLabel = NodeUtil.GetComponent("NameLabel", this.node, Label);
        this.WeightLabel = NodeUtil.GetComponent("WeightLabel", this.node, Label);
        this.PriceLabel = NodeUtil.GetComponent("PriceLabel", this.node, Label);
        this.Button_0Label = NodeUtil.GetComponent("Button_0Label", this.node, Label);
        this.Button_1Label = NodeUtil.GetComponent("Button_1Label", this.node, Label);
        this.Item = NodeUtil.GetNode("Item", this.node);
        this.Buttons = NodeUtil.GetNode("Buttons", this.node);
    }

    Init(data, cb_0: Function = null, cb_1: Function = null, btn_0: string = `丢弃`, btn_1: string = `存加密`) {
        this.Buttons.active = false;
        this.data = data;
        this.cb_0 = cb_0;
        this.cb_1 = cb_1;

        this.Button_0Label.string = btn_0;
        this.Button_1Label.string = btn_1;

        this.NameLabel.string = `${data.Name}`;
        this.WeightLabel.string = `${data.Weight}`;
        this.PriceLabel.string = `${data.Price}`;

        this.Item.children.forEach(e => PoolManager.PutNode(e));

        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/Item", this.Item).then((node) => {
            node.getComponent(XGTW_Item).InitSimple(data);
        });
    }
    SetSelect(data) {
        this.Buttons.active = data == this.data;
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "BackpackItem":
                const sb = () => {
                    XGTW_DataManager.RemoveItemFromBackpack(this.data);
                    EventManager.Scene.emit(XGTW_Event.RefreshBackpackGoodsItem);
                    EventManager.Scene.emit(XGTW_Event.RefreshInventoryButtons);
                    EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                }

                let type = XGTW_ItemData.GetItemType(this.data.Type);
                if (XGTW_ItemData.IsMainGun(type) && XGTW_DataManager.PlayerData.Weapon_0 == null) {
                    XGTW_DataManager.PlayerData.Weapon_0 = this.data;
                    sb();
                    return;
                }

                if (XGTW_ItemData.IsMainGun(type) && XGTW_DataManager.PlayerData.Weapon_1 == null) {
                    XGTW_DataManager.PlayerData.Weapon_1 = this.data;
                    sb();
                    return;
                }

                if (type == XGTW_ItemType.手枪 && XGTW_DataManager.PlayerData.Pistol == null) {
                    XGTW_DataManager.PlayerData.Pistol = this.data;
                    sb();
                    return;
                }

                if (type == XGTW_ItemType.近战 && XGTW_DataManager.PlayerData.MeleeWeapon == null) {
                    XGTW_DataManager.PlayerData.MeleeWeapon = this.data;
                    sb();
                    return;
                }

                if (type == XGTW_ItemType.头盔 && XGTW_DataManager.PlayerData.Helmet == null) {
                    XGTW_DataManager.PlayerData.Helmet = this.data;
                    sb();
                    return;
                }

                if (type == XGTW_ItemType.防弹衣 && XGTW_DataManager.PlayerData.Bulletproof == null) {
                    XGTW_DataManager.PlayerData.Bulletproof = this.data;
                    sb();
                    return;
                }

                if (type == XGTW_ItemType.背包 && XGTW_DataManager.PlayerData.Backpack == null) {
                    XGTW_DataManager.PlayerData.Backpack = this.data;
                    sb();
                    return;
                }

                XGTW_GameBackpackPanel.Instance.RefreshItemSelect(this.data);
                break;
            case "Button_0":
                this.cb_0 && this.cb_0(this.data);
                break;
            case "Button_1":
                this.cb_1 && this.cb_1(this.data);
                break;
        }

    }
}