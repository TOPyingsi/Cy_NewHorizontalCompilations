import { _decorator, Button, Component, director, Graphics, instantiate, Label, Mask, Node, Sprite, Tween, tween, UIOpacity, UITransform, v3, Vec3 } from 'cc';

import { EventManager, MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JBT_DataManager, XCT_JBT_Order, XCT_JBT_TakeoutOrder } from '../../Manager/XCT_JBT_DataManager';
import Banner from 'db://assets/Scripts/Banner';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
import { XCT_GameManager } from '../../Manager/XCT_GameManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_JBT_TipPanel')
export class XCT_JBT_TipPanel extends XCT_BasePanel {
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

    @property(Node)
    tipEvaluationPanel: Node = null;


    isAddedEvent: boolean = false;

    private tween:Tween<Node> = null;


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
        this.tipEvaluationPanel.active = false;
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
        XCT_AudioManager.getInstance().stopMusic();
        if(XCT_GameManager.Instance.hasStartPanel){
            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_TipPanel);
            EventManager.Scene.emit(XCT_Events.hideTableItem);
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.TablePanel, null, () => {
                XCT_UIManager.Instance.showPanel(XCT_UIPanel.LoadingPanel, () => {
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.StartPanel, null, () => {
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_DialoguePanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_GameUI);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_TutorialPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_GamePanel, null, XCT_PanelAnimation.NONE);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.TipPanel);
                        this.scheduleOnce(() => {
                            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.LoadingPanel, () => {
                            ProjectEventManager.emit(ProjectEvent.游戏结束, "小吃摊");
                            });
                        }, 0.5);

                    });
                },()=>{
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_ShopPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_CheckoutPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_TakeoutPanel);
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
        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_TipPanel);
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
        if(!XCT_JBT_DataManager.Instance.isShowingShopPanel){
            EventManager.Scene.emit(XCT_Events.Game_Resume);
        }
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_TipPanel);
    }

    btnVideoClick() {
        XCT_AudioManager.getInstance().playSound("点击");
        // 这里应该调用视频广告接口
        Banner.Instance.ShowVideoAd(() => {
            // 假设视频播放完成
            XCT_JBT_DataManager.Instance.playerData.money += 200;
            EventManager.Scene.emit(XCT_Events.JBT_Update_Money);
            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_TipPanel);
            if(!XCT_JBT_DataManager.Instance.isShowingShopPanel){
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
        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_TipPanel);
    }

    btnVideoOpenTakeoutClick() {
        XCT_AudioManager.getInstance().playSound("点击");
        // 这里应该调用视频广告接口
        Banner.Instance.ShowVideoAd(() => {
            XCT_JBT_DataManager.Instance.playerData.isTakeOutProjectOpen = true;
            EventManager.Scene.emit(XCT_Events.JBT_Takeout_Open);
            // 假设视频播放完成
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.JBT_TakeoutPanel, null, () => {
                XCT_UIManager.Instance.hidePanel(XCT_UIPanel.JBT_TipPanel);
            });
        });
    }

    showEvaluationTipPanel(){
        let order = XCT_JBT_DataManager.Instance.evaluationOrder;
        this.tipEvaluationPanel.active = true;

        let  nodeEvaluation = this.tipEvaluationPanel.getChildByName("right").getChildByName("NodeEvaluation");
                // 设置头像(这里假设使用Sprite)
        nodeEvaluation.getChildByName('spAvatar').children.forEach((node: Node) => {
            if (node.name === order.avatarName) {
                node.active = true;
            }
            else {
                node.active = false;
            }
        })

        nodeEvaluation.getChildByName('lblName').getComponent(Label).string = order.customerName;
        nodeEvaluation.getChildByName('starContainer').children.forEach((node: Node) => {
            if (parseInt(node.name) <= order.star) {
                node.children[0].active = false;
            }
            else {
                node.children[0].active = true;
            }
        })

        let width = nodeEvaluation.getComponent(UITransform).width;
        nodeEvaluation.setPosition(v3(width, 0, 0));
        this.tween = tween(nodeEvaluation)
            .to(1, { position: Vec3.ZERO })
            .call(()=>{

                if(order.sellingAddTip >0){
                    let moneyContainer = nodeEvaluation.getChildByName('moneyContainer');
                    let moneyItem = moneyContainer.getChildByName('moneyItem');
                    moneyContainer.removeAllChildren();
            
                    const item = instantiate(moneyItem);
                    item.parent = moneyContainer;
                    item.setPosition(v3(0, 0, 0));
                    item.getComponentInChildren(Label).string = "小费+" + XCT_JBT_DataManager.Instance.currentSellingAddTip;
                    // 设置初始位置和透明度
                    item.setPosition(0, -100);
                    item.getComponent(UIOpacity).opacity = 255;
                    item.active = true;
            
                    // 动画序列：淡入、停留、淡出
                    tween(item)
                        .to(1.5, { position: new Vec3(0, 100, 0) }, { easing: 'sineIn' })
                        .parallel(
                            tween(item.getComponent(UIOpacity))
                                .to(1.5, { opacity: 0 })
                        )
                        .call(() => {
                            item.destroy();
                        })
                        .start();
                }
                    
            })
            .delay(1.5)
            .to(1, { position: v3(width, 0, 0) })
            .call(() => {
                this.tipEvaluationPanel.active = false;
                XCT_JBT_DataManager.Instance.evaluationOrder = null;
                this.tween = null;
            })
            .start();
    }

    gamePause(){
        if(this.tween){
            this.tween.pause();
        }
    }

    gameResume(){
        if(this.tween){
            this.tween.resume();
        }
    }


    // 注册事件监听
    addListener() {

        EventManager.on(XCT_Events.JBT_ShowTip_Back, this.showBackTipPanel, this);
        EventManager.on(XCT_Events.JBT_ShowTip_NoMoney, this.showNoMoneyTipPanel, this);
        EventManager.on(XCT_Events.JBT_ShowTip_OpenTakeout, this.showOpenTakeoutPanel, this);
        EventManager.on(XCT_Events.JBT_ShowTip_Evaluation, this.showEvaluationTipPanel, this);
        EventManager.on(XCT_Events.Game_Pause, this.gamePause, this);
        EventManager.on(XCT_Events.Game_Resume, this.gameResume, this);

    }

    // 注销事件监听
    removeListener() {
        EventManager.off(XCT_Events.JBT_ShowTip_Back, this.showBackTipPanel, this);
        EventManager.off(XCT_Events.JBT_ShowTip_NoMoney, this.showNoMoneyTipPanel, this);
        EventManager.off(XCT_Events.JBT_ShowTip_OpenTakeout, this.showOpenTakeoutPanel, this);
        EventManager.off(XCT_Events.JBT_ShowTip_Evaluation, this.showEvaluationTipPanel, this);
        EventManager.off(XCT_Events.Game_Pause, this.gamePause, this);
        EventManager.off(XCT_Events.Game_Resume, this.gameResume, this);



        // EventManager.off(XCT_Events.JBT_Pack_Ingredients, this.onPackIngredients, this);
        // EventManager.off(XCT_Events.JBT_All_Packed, this.onAllPackd, this);
        // EventManager.off(XCT_Events.showTableItem, this.onShowTableItem, this);
    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








