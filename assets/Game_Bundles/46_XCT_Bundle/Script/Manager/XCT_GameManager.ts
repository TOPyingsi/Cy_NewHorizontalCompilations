import { _decorator, Component, Node } from 'cc';
import { XCT_UIManager } from './XCT_UIManager';
import { XCT_UIPanel } from '../Common/XCT_UIPanel';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../Common/XCT_Events';
import { XCT_PanelAnimation } from '../Common/XCT_BasePanel';
import { XCT_JBT_DataManager } from './XCT_JBT_DataManager';
import { XCT_HJM_DataManager } from './XCT_HJM_DataManager';
import { XCT_KLM_DataManager } from './XCT_KLM_DataManager';
import { XCT_LSF_DataManager } from './XCT_LSF_DataManager';
import { XCT_JP_DataManager } from './XCT_JP_DataManager';
const { ccclass, property } = _decorator;

enum XCT_GameMode{
    JBT = 1,
    HJM = 2,
    KLM = 3,
    LSF = 4,
    JP = 5,
}

@ccclass('XCT_GameManager')
export class XCT_GameManager extends Component {
    public static Instance: XCT_GameManager;

    hasStartPanel:boolean = true;
    gameMode:number = XCT_GameMode.LSF;

    protected onLoad(): void {
        XCT_GameManager.Instance = this;
    }

    start() {
        XCT_UIManager.Instance.showPanel(XCT_UIPanel.TablePanel);
        if(!this.hasStartPanel){
            this.chooseMode(this.gameMode);
        }
        else{
            XCT_UIManager.Instance.showPanel(XCT_UIPanel.StartPanel);
        }
    }

    chooseMode(mode:number){
       switch (mode) {
        case XCT_GameMode.JBT:
            this.onChooseJBT();
            break;
        case XCT_GameMode.HJM:
            this.onChooseHJM();
            break;
        case XCT_GameMode.KLM:
            this.onChooseKLM();
            break;
        case XCT_GameMode.LSF:
            this.onChooseLSF();
            break;
        case XCT_GameMode.JP:
            this.onChooseJP();
            break;
        default:
            break;
       }
      
    }

    
    onChooseJBT() {
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
        },null, XCT_PanelAnimation.NONE);

    }

    onChooseHJM() {
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
        },null, XCT_PanelAnimation.NONE);
    }

    onChooseKLM() {
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
        },null, XCT_PanelAnimation.NONE);
    }

    onChooseLSF() {
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
        },null, XCT_PanelAnimation.NONE);
    }

    onChooseJP() {
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
                    });
                }, 0.5);
            }, XCT_PanelAnimation.NONE);
        },null, XCT_PanelAnimation.NONE);
    }
}


