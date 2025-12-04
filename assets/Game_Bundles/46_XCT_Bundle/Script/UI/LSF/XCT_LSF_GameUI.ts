import { _decorator, Button, Component, director, Graphics, Label, Mask, Node, Sprite, tween } from 'cc';

import { EventManager, MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_LSF_DataManager } from '../../Manager/XCT_LSF_DataManager';
import Banner from 'db://assets/Scripts/Banner';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_LSF_GameUI')
export class XCT_LSF_GameUI extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.GameUI;
    protected animationDuration: number = 0.6;


    @property(Node)
    spSun: Node = null;

    @property(Label)
    lblDay: Label = null;

    @property(Label)
    lblTime: Label = null;


    @property(Node)
    smileNode: Node = null;


    @property(Label)
    lblSmile: Label = null;

    @property(Label)
    lblMoney: Label = null;

    @property(Node)
    btnAdd: Node = null;


    @property(Node)
    btnShowTipBack: Node = null;


    isAddedEvent: boolean = false;

    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init() {
        if (XCT_LSF_DataManager.Instance.isDayEnd) {
            this.smileNode.active = false;
        }
        else {
            this.smileNode.active = true;
        }
        // this.startNewDish
        this.updateUI();
    }

    updateUI() {
        this.lblDay.string = "第" + XCT_LSF_DataManager.Instance.playerData.currentDay + "天";
        this.updateTime();
        this.updateSmile();
        this.lblMoney.string = XCT_LSF_DataManager.Instance.playerData.money.toFixed(1);
    }

    updateMoney() {
        this.lblMoney.string = XCT_LSF_DataManager.Instance.playerData.money.toFixed(1);
    }

    updateTime() {
        // 将小时和分钟格式化为两位数显示
        const hour = XCT_LSF_DataManager.Instance.currentHour.toString().padStart(2, '0');
        const minute = XCT_LSF_DataManager.Instance.currentMinute.toString().padStart(2, '0');
        this.lblTime.string = `${hour}:${minute}`;

        let spCom = this.spSun.getComponent(Sprite);
        spCom.fillRange = - (XCT_LSF_DataManager.Instance.currentTime + 8 * XCT_LSF_DataManager.Instance.MINUTES_PER_HOUR) / XCT_LSF_DataManager.Instance.totalTime;
    }

    updateSmile() {
        this.lblSmile.string = XCT_LSF_DataManager.Instance.currentSmile.toString() + "%";
    }

    onClickAdd() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.LSF_TipPanel, null, () => {
            EventManager.Scene.emit(XCT_Events.LSF_ShowTip_NoMoney);
        })
    }


    hideSmile() {
        this.smileNode.active = false;
    }

    showSmile() {
        this.smileNode.active = true;
    }


    showBackTipPanel() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.LSF_TipPanel, null, () => {
            EventManager.Scene.emit(XCT_Events.LSF_ShowTip_Back);
        })
    }


    // 注册事件监听
    addListener() {
        EventManager.on(XCT_Events.LSF_Update_Money, this.updateMoney, this);
        EventManager.on(XCT_Events.LSF_Update_Time, this.updateTime, this);
        EventManager.on(XCT_Events.LSF_Update_Smile, this.updateSmile, this);
        EventManager.on(XCT_Events.LSF_Hide_smile, this.hideSmile, this);
        EventManager.on(XCT_Events.LSF_Show_smile, this.showSmile, this);

        this.btnAdd.on("click", this.onClickAdd, this);
        this.btnShowTipBack.on("click", this.showBackTipPanel, this);

        // this.btnLSF.on(Button.EventType.CLICK, this.onClickLSF, this);
        // EventManager.on(XCT_Events.LSF_Pack_Ingredients, this.onPackIngredients, this);
        // EventManager.on(XCT_Events.LSF_All_Packed, this.onAllPackd, this);
    }

    // 注销事件监听
    removeListener() {
        EventManager.off(XCT_Events.LSF_Update_Money, this.updateMoney, this);
        EventManager.off(XCT_Events.LSF_Update_Time, this.updateTime, this);
        EventManager.off(XCT_Events.LSF_Update_Smile, this.updateSmile, this);
        EventManager.off(XCT_Events.LSF_Hide_smile, this.hideSmile, this);
        EventManager.off(XCT_Events.LSF_Show_smile, this.showSmile, this);
        // EventManager.off(XCT_Events.LSF_Pack_Ingredients, this.onPackIngredients, this);
        // EventManager.off(XCT_Events.LSF_All_Packed, this.onAllPackd, this);
        // EventManager.off(XCT_Events.showTableItem, this.onShowTableItem, this);
    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








