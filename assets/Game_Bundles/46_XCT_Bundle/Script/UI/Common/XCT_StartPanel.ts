import { _decorator, Button, Component, director, Label, Node, tween } from 'cc';

import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JBT_DataManager } from '../../Manager/XCT_JBT_DataManager';
import { XCT_HJM_DataManager } from '../../Manager/XCT_HJM_DataManager';
import { XCT_KLM_DataManager } from '../../Manager/XCT_KLM_DataManager';
import { XCT_LSF_DataManager } from '../../Manager/XCT_LSF_DataManager';
import { XCT_JP_DataManager } from '../../Manager/XCT_JP_DataManager';
import { XCT_AudioManager } from '../../Manager/XCT_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_StartPanel')
export class XCT_StartPanel extends XCT_BasePanel {

    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Start;

    @property(Node)
    btnJBT: Node = null;

    @property(Node)
    btnHJM: Node = null;

    @property(Node)
    btnKLM: Node = null;

    @property(Node)
    btnLSF: Node = null;

    @property(Node)
    btnJP: Node = null;

    @property(Node)
    btnReturn: Node = null;

    isAddedEvent: boolean = false;

    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init() {

    }

    onClickJBT() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_JBT_DataManager.Instance.initData();

        XCT_UIManager.Instance.showPanel(XCT_UIPanel.LoadingPanel, () => {
            //加载游戏UI
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.JBT_GameUI, null, () => {
                //加载对话UI
                XCT_UIManager.Instance.showPanel(XCT_UIPanel.JBT_DialoguePanel, null, () => {
                    //加载提示UI
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.TipPanel);
                    let isGamePanelShow: boolean = false;
                    let isPass5Second: boolean = false;
                    let cb = ()=>{
                        if (XCT_JBT_DataManager.Instance.playerData.currentDay == 1 && !XCT_JBT_DataManager.Instance.isTutorialEnd)
                        XCT_UIManager.Instance.showPanel(XCT_UIPanel.JBT_TutorialPanel, null, null, XCT_PanelAnimation.PreLoad_at_Bottom);
                        //隐藏开始、加载面板
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.StartPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.LoadingPanel, () => {
                            //显示游戏物品
                            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.TablePanel);
                            EventManager.Scene.emit(XCT_Events.showTableItem);
                            // 开始新一天对话
                            XCT_JBT_DataManager.Instance.resetDay();
                            ProjectEventManager.emit(ProjectEvent.游戏开始, "小吃摊")
                            // XCT_DialogManager.Instance.startNewDayDialog(XCT_JBT_DataManager.Instance.playerData.currentDay)
                        });
                    }
                    //预加载游戏面板
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.JBT_GamePanel, null, ()=>{
                        isGamePanelShow = true;
                        if (isPass5Second && isGamePanelShow) cb();
                    }, XCT_PanelAnimation.PreLoad_at_Bottom);
                    this.scheduleOnce(() => {
                        isPass5Second = true;
                        if (isPass5Second && isGamePanelShow) cb();
                    }, 0.5);
                }, XCT_PanelAnimation.NONE);
            }, XCT_PanelAnimation.NONE);
        });

    }

    onClickHJM() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_HJM_DataManager.Instance.initData();
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.LoadingPanel, () => {
            //加载游戏UI
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_GameUI, null, () => {
                //加载对话UI
                XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_DialoguePanel, null, () => {
                    //加载提示UI
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.TipPanel);
                    let isGamePanelShow: boolean = false;
                    let isPass5Second: boolean = false;
                    let cb = ()=>{
                        if (XCT_HJM_DataManager.Instance.playerData.currentDay == 1 && !XCT_HJM_DataManager.Instance.isTutorialEnd)
                        XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_TutorialPanel, null, null, XCT_PanelAnimation.PreLoad_at_Bottom);
                        //隐藏开始、加载面板
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.StartPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.LoadingPanel, () => {
                            //显示游戏物品
                            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.TablePanel);
                            EventManager.Scene.emit(XCT_Events.showTableItem);
                            // 开始新一天对话   
                            XCT_HJM_DataManager.Instance.resetDay();
                            ProjectEventManager.emit(ProjectEvent.游戏开始, "小吃摊")
                        });
                    }
                    
                    //预加载游戏面板
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.HJM_GamePanel, null, ()=>{
                        isGamePanelShow = true;
                        if (isPass5Second && isGamePanelShow) cb();
                    }, XCT_PanelAnimation.PreLoad_at_Bottom);
                    this.scheduleOnce(() => {
                        isPass5Second = true;
                        if (isPass5Second && isGamePanelShow) cb();
                    }, 0.5);
                }, XCT_PanelAnimation.NONE);
            }, XCT_PanelAnimation.NONE);
        });
    }

    onClickKLM() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_KLM_DataManager.Instance.initData();

        XCT_UIManager.Instance.showPanel(XCT_UIPanel.LoadingPanel, () => {
            //加载游戏UI
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.KLM_GameUI, null, () => {
                //加载对话UI
                XCT_UIManager.Instance.showPanel(XCT_UIPanel.KLM_DialoguePanel, null, () => {
                    //加载提示UI
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.TipPanel);
                    let isGamePanelShow: boolean = false;
                    let isPass5Second: boolean = false;
                    let cb = ()=>{
                        if (XCT_KLM_DataManager.Instance.playerData.currentDay == 1 && !XCT_KLM_DataManager.Instance.isTutorialEnd)
                        XCT_UIManager.Instance.showPanel(XCT_UIPanel.KLM_TutorialPanel, null, null, XCT_PanelAnimation.PreLoad_at_Bottom);
                        //隐藏开始、加载面板
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.StartPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.LoadingPanel, () => {
                            //显示游戏物品
                            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.TablePanel);
                            EventManager.Scene.emit(XCT_Events.showTableItem);
                            // 开始新一天对话   
                            XCT_KLM_DataManager.Instance.resetDay();
                            ProjectEventManager.emit(ProjectEvent.游戏开始, "小吃摊")
                        });
                    }
                    //预加载游戏面板
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.KLM_GamePanel, null,()=>{
                        isGamePanelShow = true;
                        if (isPass5Second && isGamePanelShow) cb();
                    }, XCT_PanelAnimation.PreLoad_at_Bottom);
                     this.scheduleOnce(() => {
                        isPass5Second = true;
                        if (isPass5Second && isGamePanelShow) cb();
                    }, 0.5);
                }, XCT_PanelAnimation.NONE);
            }, XCT_PanelAnimation.NONE);
        });
    }

    onClickLSF() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_LSF_DataManager.Instance.initData();
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.LoadingPanel, () => {
            //加载游戏UI
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.LSF_GameUI, null, () => {
                //加载对话UI
                XCT_UIManager.Instance.showPanel(XCT_UIPanel.LSF_DialoguePanel, null, () => {
                    //加载提示UI
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.TipPanel);
                     let isGamePanelShow: boolean = false;
                    let isPass5Second: boolean = false;
                    let cb = ()=>{
                        if (XCT_LSF_DataManager.Instance.playerData.currentDay == 1 && !XCT_LSF_DataManager.Instance.isTutorialEnd)
                        XCT_UIManager.Instance.showPanel(XCT_UIPanel.LSF_TutorialPanel, null, null, XCT_PanelAnimation.PreLoad_at_Bottom);
                        //隐藏开始、加载面板
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.StartPanel);
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.LoadingPanel, () => {
                            //显示游戏物品
                            XCT_UIManager.Instance.hidePanel(XCT_UIPanel.TablePanel);
                            EventManager.Scene.emit(XCT_Events.showTableItem);
                            // 开始新一天对话   
                            XCT_LSF_DataManager.Instance.resetDay();
                            ProjectEventManager.emit(ProjectEvent.游戏开始, "小吃摊")
                        });
                    }
                    //预加载游戏面板
                    XCT_UIManager.Instance.showPanel(XCT_UIPanel.LSF_GamePanel, null, ()=>{
                        isGamePanelShow = true;
                        if (isPass5Second && isGamePanelShow) cb();
                    }, XCT_PanelAnimation.PreLoad_at_Bottom);
                    this.scheduleOnce(() => {
                        isPass5Second = true;
                        if (isPass5Second && isGamePanelShow) cb();
                    }, 0.5);
                }, XCT_PanelAnimation.NONE);
            }, XCT_PanelAnimation.NONE);
        });
    }

    onClickJP() {
        XCT_AudioManager.getInstance().playSound("点击");
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.LoadingPanel, () => {
            //加载提示UI
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.TipPanel);

            //更新游戏数据
            XCT_JP_DataManager.Instance.resetLevelData();

            XCT_UIManager.Instance.showPanel(XCT_UIPanel.JP_GamePanel, null, () => {
                // if(XCT_LSF_DataManager.Instance.playerData.currentDay == 1 && !XCT_LSF_DataManager.Instance.isTutorialEnd)
                // XCT_UIManager.Instance.showPanel(XCT_UIPanel.LSF_TutorialPanel,null,null,XCT_PanelAnimation.PreLoad_at_Bottom);
                //隐藏开始、加载面板
                this.scheduleOnce(() => {
                    XCT_UIManager.Instance.hidePanel(XCT_UIPanel.StartPanel);
                    XCT_UIManager.Instance.hidePanel(XCT_UIPanel.LoadingPanel, () => {
                        //显示游戏物品
                        XCT_UIManager.Instance.hidePanel(XCT_UIPanel.TablePanel);
                        EventManager.Scene.emit(XCT_Events.showTableItem);
                        ProjectEventManager.emit(ProjectEvent.游戏开始, "小吃摊")
                    });
                }, 0.5);
            }, XCT_PanelAnimation.NONE);
        });
    }

    onReturnClick(){
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "小吃摊");
            })
        });
    }

    // 注册事件监听
    addListener() {
        this.btnJBT.on(Button.EventType.CLICK, this.onClickJBT, this);
        this.btnHJM.on(Button.EventType.CLICK, this.onClickHJM, this);
        this.btnKLM.on(Button.EventType.CLICK, this.onClickKLM, this);
        this.btnLSF.on(Button.EventType.CLICK, this.onClickLSF, this);
        this.btnJP.on(Button.EventType.CLICK, this.onClickJP, this);
        this.btnReturn.on(Button.EventType.CLICK, this.onReturnClick, this);
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








