import { _decorator, Component, Node, Event, instantiate, Prefab } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_Item from "./XGTW_Item";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_BackpackPanel')
export default class XGTW_BackpackPanel extends Component {
    QualityBar: Node | null = null;
    BackpackScrollViewContent: Node | null = null;
    LockboxScrollViewContent: Node | null = null;
    SellButton: Node | null = null;
    PutButton: Node | null = null;
    BackpackItems: XGTW_Item[] = [];
    LockBoxItems: XGTW_Item[] = [];
    SelectData: XGTW_ItemData = null;
    protected onLoad(): void {
        this.QualityBar = NodeUtil.GetNode("QualityBar", this.node);
        this.BackpackScrollViewContent = NodeUtil.GetNode("BackpackScrollViewContent", this.node);
        this.LockboxScrollViewContent = NodeUtil.GetNode("LockboxScrollViewContent", this.node);
        this.SellButton = NodeUtil.GetNode("SellButton", this.node);
        this.PutButton = NodeUtil.GetNode("PutButton", this.node);
    }
    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        if (!this.node.active) this.node.active = true;
        this.RefreshItems();
        this.SellButton.active = false;
        this.PutButton.active = false;
    }

    RefreshItems() {
        this.RefreshBackpackItems();
        this.RefreshLockItems();
    }

    RefreshBackpackItems() {
        console.error("RefreshBackpackItems1", this.BackpackItems);
        this.BackpackItems.forEach((e) => e.node.destroy());
        console.error("RefreshBackpackItems2", this.BackpackItems);

        this.BackpackItems = [];
        for (let i = 0; i < XGTW_DataManager.PlayerData.BackpackItems.length; i++) {
            const data = XGTW_DataManager.PlayerData.BackpackItems[i];
            BundleManager.GetBundle(GameManager.GameData.DefaultBundle).load("Prefabs/UI/Item", (err: any, prefab: Prefab) => {
                let node = instantiate(prefab);
                node.setParent(this.BackpackScrollViewContent);

                let item = node.getComponent(XGTW_Item);
                item.Init(data, this.OnItemCallback.bind(this), false);
                this.BackpackItems.push(item);
            });
        }
    }
    RefreshLockItems() {
        this.LockBoxItems.forEach((e) => e.node.destroy());
        this.LockBoxItems = [];
        for (let i = 0; i < XGTW_DataManager.PlayerData.LockboxItems.length; i++) {
            const data = XGTW_DataManager.PlayerData.LockboxItems[i];
            BundleManager.GetBundle(GameManager.GameData.DefaultBundle).load("Prefabs/UI/Item", (err: any, prefab: Prefab) => {
                let node = instantiate(prefab);
                node.setParent(this.LockboxScrollViewContent);

                let item = node.getComponent(XGTW_Item);
                item.Init(data, this.OnItemCallback.bind(this), false);
                this.LockBoxItems.push(item);
            });
        }
    }
    OnItemCallback(data: XGTW_ItemData) {
        this.PutButton.active = true;
        this.SellButton.active = true;

        this.SelectData = data;
        this.BackpackItems.forEach((e) => e.SetSelect(data));
        this.LockBoxItems.forEach((e) => e.SetSelect(data));
    }
    Hide() {
        if (this.node.active) this.node.active = false;
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "SellButton":
                if (this.SelectData) {
                    let price = 0;

                    for (let i = 0; i < this.BackpackItems.length; i++) {
                        if (XGTW_DataManager.RemoveItemFromBackpack(this.BackpackItems[i].data)) {
                            price += this.BackpackItems[i].data.Price * this.BackpackItems[i].data.Count;
                        }
                    }

                    this.RefreshItems();
                    XGTW_DataManager.Money += price;
                    UIManager.ShowTip(`获得金钱${price}`);
                }
                break;
            case "PutButton":
                if (this.SelectData) {
                    if (XGTW_DataManager.RemoveItemFromBackpack(this.SelectData)) {
                        XGTW_DataManager.AddPlayerItem(this.SelectData);
                    }

                    if (XGTW_DataManager.RemoveItemFromLockbox(this.SelectData)) {
                        XGTW_DataManager.AddPlayerItem(this.SelectData);
                    }

                    this.RefreshItems();
                }
                break;
            case "ReturnButtton":
                this.Hide();
                break;
        }
    }
}