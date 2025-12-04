import { _decorator, Component, Node, Event, Label, UITransform, resources, Prefab, ScrollView, Vec2, instantiate, v3 } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import SJZ_Item from './SJZ_Item';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_UIManager } from './SJZ_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import SJZ_PlayerInventory from './SJZ_PlayerInventory';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import SJZ_SellInventory from './SJZ_SellInventory';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';

@ccclass('SJZ_SellPanel')
export default class SJZ_SellPanel extends PanelBase {
    Inventory: SJZ_PlayerInventory = null;
    SellInventory: SJZ_SellInventory = null;

    MoneyLabel: Label | null = null;

    protected onLoad(): void {
        this.Inventory = NodeUtil.GetComponent("Inventory", this.node, SJZ_PlayerInventory);
        this.SellInventory = NodeUtil.GetComponent("SellInventory", this.node, SJZ_SellInventory);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
    }

    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.Inventory.InitPlayerInventory();
        this.SellInventory.Init();
        this.RefreshMoney();
    }

    RefreshMoney() {
        this.MoneyLabel.string = SJZ_DataManager.PlayerData.Money.toLocaleString();
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "SellButton":
                this.SellInventory.Sell();
                break;

            case "ReturnButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.SellPanel);
                break;
        }
    }

    OnDragStart(item: SJZ_Item, point: Vec2) {
        this.Inventory.OnDragStart(item);
        this.SellInventory.OnDragStart(item);
    }

    OnDragging(item: SJZ_Item, point: Vec2) {
        this.Inventory.OnDragging(item, point);
        this.SellInventory.OnDragging(item, point);
    }

    OnDragEnd(item: SJZ_Item, point: Vec2) {
        this.Inventory.OnDragEnd(item, point);
        this.SellInventory.OnDragEnd(item, point);
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