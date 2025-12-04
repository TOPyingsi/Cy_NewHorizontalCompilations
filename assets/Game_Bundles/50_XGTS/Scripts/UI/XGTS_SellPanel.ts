import { _decorator, Component, Node, Event, Label, UITransform, resources, Prefab, ScrollView, Vec2, instantiate, v3 } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import XGTS_Item from './XGTS_Item';
import { XGTS_DataManager } from '../XGTS_DataManager';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_UIManager } from './XGTS_UIManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import XGTS_PlayerInventory from './XGTS_PlayerInventory';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import XGTS_SellInventory from './XGTS_SellInventory';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';

@ccclass('XGTS_SellPanel')
export default class XGTS_SellPanel extends PanelBase {
    Inventory: XGTS_PlayerInventory = null;
    SellInventory: XGTS_SellInventory = null;

    MoneyLabel: Label | null = null;

    playerNum: number = 0;

    protected onLoad(): void {
        this.Inventory = NodeUtil.GetComponent("Inventory", this.node, XGTS_PlayerInventory);
        this.SellInventory = NodeUtil.GetComponent("SellInventory", this.node, XGTS_SellInventory);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
    }

    Show(playerNum: number) {
        this.playerNum = playerNum;
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        this.Inventory.InitPlayerInventory();
        this.SellInventory.Init();
        this.RefreshMoney();
    }

    RefreshMoney() {
        this.MoneyLabel.string = XGTS_DataManager.PlayerDatas[this.playerNum].Money.toLocaleString();
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

        switch (event.target.name) {
            case "SellButton":
                this.SellInventory.Sell(this.playerNum);
                break;

            case "ReturnButton":
                XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.SellPanel);
                break;
        }
    }

    OnDragStart(item: XGTS_Item, point: Vec2) {
        this.Inventory.OnDragStart(item);
        this.SellInventory.OnDragStart(item);
    }

    OnDragging(item: XGTS_Item, point: Vec2) {
        this.Inventory.OnDragging(item, point);
        this.SellInventory.OnDragging(item, point);
    }

    OnDragEnd(item: XGTS_Item, point: Vec2) {
        this.Inventory.OnDragEnd(item, point);
        this.SellInventory.OnDragEnd(item, point);
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