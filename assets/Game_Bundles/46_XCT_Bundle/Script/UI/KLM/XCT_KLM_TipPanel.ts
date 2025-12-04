import { _decorator, Button, Component, director, Graphics, Label, Mask, Node, Sprite, tween } from 'cc';

import { EventManager, MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_KLM_DataManager } from '../../Manager/XCT_KLM_DataManager';
import Banner from 'db://assets/Scripts/Banner';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
import { XCT_GameManager } from '../../Manager/XCT_GameManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_KLM_TipPanel')
export class XCT_KLM_TipPanel extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Pop2;
    protected animationDuration: number = 0.6;


    @property(Node)
    tipNoMoneyPanel: Node = null;

    @property(Node)
    tipBackPanel: Node = null;

    @property(Node)
    tipOpenTakeoutPanel: Node = null;

    isAddedEvent: boolean = false;


    protected onLoad(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init() {
        this.hideTipPanel();
    }

    hideTipPanel() {
        this.tipNoMoneyPanel.active = false;
        this.tipBackPanel.active = false;
        this.tipOpenTakeoutPanel.active = false;

    }


    showBackTipPanel() {
           EventManager.Scene.emit(XCT_Events.Game_Pause);
        this.tipBackPanel.active = true;
        let btnContinue = this.tipBackPanel.getChildByName("btnContinue");
        btnContinue.on("click", this.hideBackTipPanel, this);
        let btnExit = this.tipBackPanel.getChildByName("btnExit");
        btnExit.on("click", this.onBtnExit, this);
    }

    onBtnExit() {
        XCT_AudioManager.getInstance().playSound("点击");
        if(XCT_GameManager.Instance.hasStartPanel){
            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_TipPanel);
            EventManager.Scene.emit(XCT_Events.hideTableItem);
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.TablePanel, null, () => {
                XCT_UIManager.Instance.showPanel(XCT_UIPanel.LoadingPanel, () => {
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.StartPanel, null, () => {
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_DialoguePanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_GameUI);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_TutorialPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_GamePanel, null, XCT_PanelAnimation.NONE);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.TipPanel);

                        this.scheduleOnce(() => {
                            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.LoadingPanel, () => {
                            ProjectEventManager.emit(ProjectEvent.游戏结束, "小吃摊");
                            });
                        }, 0.5);

                    });
                },()=>{
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_ShopPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_CheckoutPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_TakeoutPanel);
                });
            });
        }
        else{
            ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                    ProjectEventManager.emit(ProjectEvent.返回主页, "小吃摊");
                })
            });
        }

    }

    hideBackTipPanel() {
                EventManager.Scene.emit(XCT_Events.Game_Resume);
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_TipPanel);
    }

    showNoMoneyTipPanel() {
           EventManager.Scene.emit(XCT_Events.Game_Pause);
        this.tipNoMoneyPanel.active = true;
        let btnBack = this.tipNoMoneyPanel.getChildByName("btnBack");
        btnBack.on("click", this.hideNoMoneyTipPanel, this);
        let btnVideo = this.tipNoMoneyPanel.getChildByName("btnVideo");
        btnVideo.on("click", this.btnVideoClick, this);
    }

    hideNoMoneyTipPanel() {
               if(!XCT_KLM_DataManager.Instance.isShowingShopPanel){
                EventManager.Scene.emit(XCT_Events.Game_Resume);
            }
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_TipPanel);
    }

    btnVideoClick() {
        XCT_AudioManager.getInstance().playSound("点击");
        // 这里应该调用视频广告接口
        Banner.Instance.ShowVideoAd(() => {
            // 假设视频播放完成
            XCT_KLM_DataManager.Instance.playerData.money += 200;
            EventManager.Scene.emit(XCT_Events.KLM_Update_Money);
            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_TipPanel);
                   if(!XCT_KLM_DataManager.Instance.isShowingShopPanel){
                EventManager.Scene.emit(XCT_Events.Game_Resume);
            }
        });
    }


    showOpenTakeoutPanel() {
           EventManager.Scene.emit(XCT_Events.Game_Pause);
        this.tipOpenTakeoutPanel.active = true;
        let btnBack = this.tipOpenTakeoutPanel.getChildByName("btnBack");
        btnBack.on("click", this.hideOpenTakeoutPanel, this);
        let btnVideo = this.tipOpenTakeoutPanel.getChildByName("btnVideo");
        btnVideo.on("click", this.btnVideoOpenTakeoutClick, this);
    }

    hideOpenTakeoutPanel() {
                EventManager.Scene.emit(XCT_Events.Game_Resume);
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_TipPanel);
    }

    btnVideoOpenTakeoutClick() {
        XCT_AudioManager.getInstance().playSound("点击");
        // 这里应该调用视频广告接口
        Banner.Instance.ShowVideoAd(() => {
            XCT_KLM_DataManager.Instance.playerData.isTakeOutProjectOpen = true;
            EventManager.Scene.emit(XCT_Events.KLM_Takeout_Open);
            // 假设视频播放完成
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.KLM_TakeoutPanel, null, () => {
                XCT_UIManager.Instance.hidePanel(XCT_UIPanel.KLM_TipPanel);
            });
        });
    }



    // 注册事件监听
    addListener() {

        EventManager.on(XCT_Events.KLM_ShowTip_Back, this.showBackTipPanel, this);
        EventManager.on(XCT_Events.KLM_ShowTip_NoMoney, this.showNoMoneyTipPanel, this);

        EventManager.on(XCT_Events.KLM_ShowTip_OpenTakeout, this.showOpenTakeoutPanel, this);

        // this.btnKLM.on(Button.EventType.CLICK, this.onClickKLM, this);
        // EventManager.on(XCT_Events.KLM_Pack_Ingredients, this.onPackIngredients, this);
        // EventManager.on(XCT_Events.KLM_All_Packed, this.onAllPackd, this);
    }

    // 注销事件监听
    removeListener() {
        ;

        EventManager.off(XCT_Events.KLM_ShowTip_Back, this.showBackTipPanel, this);
        EventManager.off(XCT_Events.KLM_ShowTip_NoMoney, this.showNoMoneyTipPanel, this);
        EventManager.off(XCT_Events.KLM_ShowTip_OpenTakeout, this.showOpenTakeoutPanel, this);

        // EventManager.off(XCT_Events.KLM_Pack_Ingredients, this.onPackIngredients, this);
        // EventManager.off(XCT_Events.KLM_All_Packed, this.onAllPackd, this);
        // EventManager.off(XCT_Events.showTableItem, this.onShowTableItem, this);
    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








