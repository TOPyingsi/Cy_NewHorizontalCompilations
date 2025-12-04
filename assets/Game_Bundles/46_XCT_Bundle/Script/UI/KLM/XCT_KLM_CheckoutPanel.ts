import { _decorator, Button, Color, Component, director, Graphics, instantiate, Label, Mask, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';

import { EventManager, } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_KLM_DataManager } from '../../Manager/XCT_KLM_DataManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_CheckoutPanel')
export class XCT_KLM_CheckoutPanel extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Pop2;
    protected animationDuration: number = 0.6;

    @property(Label)
    lblDay: Label = null;


    @property(Label)
    lblTurnover: Label = null;

    @property(Label)
    lblTip: Label = null;

    @property(Label)
    lblRent: Label = null;

    @property(Label)
    lblRefund: Label = null;

    @property(Label)
    lblCost: Label = null;

    @property(Label)
    lblProfit: Label = null;

    @property(Node)
    btnOK: Node = null;


    @property(Label)
    lblCatCost: Label = null;

    isAddedEvent: boolean = false;

    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init() {
         ProjectEventManager.emit(ProjectEvent.弹出窗口, "小吃摊");
        this.initUI();
    }

    initUI() {
        this.lblDay.string = "" + XCT_KLM_DataManager.Instance.playerData.currentDay;
        XCT_KLM_DataManager.Instance.playerData.money -= XCT_KLM_DataManager.Instance.Rent;

        if (XCT_KLM_DataManager.Instance.playerData.isAdoptedCat) {
            XCT_KLM_DataManager.Instance.playerData.money -= 10;
        }
        EventManager.Scene.emit(XCT_Events.KLM_Update_Money);
        this.lblTurnover.string = "+" + XCT_KLM_DataManager.Instance.daySellingPrice.toFixed(1);
        this.lblTip.string = "+" + XCT_KLM_DataManager.Instance.daySellingAddTip.toFixed(1);
        this.lblRent.string = "-" + XCT_KLM_DataManager.Instance.Rent
        this.lblRefund.string = "-" + XCT_KLM_DataManager.Instance.dayRefund.toFixed(1);
        this.lblCost.string = "-" + XCT_KLM_DataManager.Instance.dayCost.toFixed(1);
        this.lblCatCost.string = "-" + 10;
        this.lblCatCost.node.active = XCT_KLM_DataManager.Instance.playerData.isAdoptedCat;

        let profit = XCT_KLM_DataManager.Instance.daySellingPrice
            + XCT_KLM_DataManager.Instance.daySellingAddTip
            - XCT_KLM_DataManager.Instance.dayCost
            - XCT_KLM_DataManager.Instance.Rent
            - XCT_KLM_DataManager.Instance.dayRefund;


        if (profit < 0) {
            this.lblProfit.color = new Color("C53737");
        } else {
            this.lblProfit.color = new Color("5FC537");
        }
        this.lblProfit.string = "" + profit.toFixed(1);
    }


    onClickOK() {
        XCT_AudioManager.getInstance().playSound("点击");
        if (!XCT_KLM_DataManager.Instance.isHadShowShop) {
            XCT_KLM_DataManager.Instance.isHadShowShop = true;
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.KLM_ShopPanel, null, () => {
                XCT_UIManager.Instance.showPanel(XCT_UIPanel.KLM_GameUI, null, null, XCT_PanelAnimation.NONE, XCT_UILayer.GameUI2);
                XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_CheckoutPanel);
            });
        }
        else {
            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_CheckoutPanel);
        }

    }


    // 注册事件监听
    addListener() {
        this.btnOK.on(Button.EventType.CLICK, this.onClickOK, this);

    }

    // 注销事件监听
    removeListener() {

    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








