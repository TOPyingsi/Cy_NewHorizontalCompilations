import { _decorator, Component, Node } from 'cc';

import { EMLHJ_GameUI } from '../../../41_EMLHJ_Bundle/Script/UI/EMLHJ_GameUI';
import { TKJWL_EndPanel } from '../UI/TKJWL_EndPanel';
import { TKJWL_GameUI } from '../UI/TKJWL_GameUI';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../Common/TKJWL_GameEvents';
import { TKJWL_TipPanel } from '../UI/TKJWL_TipPanel';
import { TKJWL_SuccessTipPanel } from '../UI/TKJWL_SuccessTipPanel';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_UIManager')
export class TKJWL_UIManager extends Component {
 @property(TKJWL_GameUI)
    GameUI: TKJWL_GameUI = null;



    @property(TKJWL_EndPanel)
    endPanel: TKJWL_EndPanel = null;

    
    @property(TKJWL_TipPanel)
    tipPanel: TKJWL_TipPanel = null;

      
    @property(TKJWL_SuccessTipPanel)
    successTipPanel: TKJWL_SuccessTipPanel = null;


    protected onLoad(): void {
        this.init();
    }

    init(){
        this.registerEvents();
    }


    showGameUI(){
        if(this.GameUI){
            // this.GameUI.initUI();
            this.GameUI.node.active = true;
        }
    }

    hideGameUI(){
        if(this.GameUI){
            this.GameUI.node.active = false;
        }
    }


    showEndPanel(){
        if(this.endPanel){
            this.endPanel.node.active = true;
            this.endPanel.initUI();
        }
    }

    hideEndPanel(){
        if(this.endPanel){
            this.endPanel.node.active = false;
        }
    }




    showTipPanel(){
        if(this.tipPanel){
            this.tipPanel.node.active = true;
            this.tipPanel.initUI();
        }
    }

    hideTipPanel(){
        if(this.tipPanel){
            this.tipPanel.node.active = false;
        }
    }

    showSuccessTipPanel(){
        if(this.successTipPanel){
            this.successTipPanel.node.active = true;
            this.successTipPanel.initUI();
        }
    }

    hideSuccessTipPanel(){
        if(this.successTipPanel){
            this.successTipPanel.node.active = false;
        }
    }
    

    hideAllScreens(){
        // this.hideGameUI();
        this.hideEndPanel();
        this.hideTipPanel();
        this.hideSuccessTipPanel();
    }


 // 注册事件监听
    registerEvents() {
        EventManager.on(TKJWL_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);
        EventManager.on(TKJWL_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.on(TKJWL_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.on(TKJWL_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.on(TKJWL_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.on(TKJWL_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.on(TKJWL_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
        EventManager.on(TKJWL_GameEvents.UI_SHOW_SUCCESS_TIP_PANEL, this.showSuccessTipPanel, this);
        EventManager.on(TKJWL_GameEvents.UI_HIDE_SUCCESS_TIP_PANEL, this.hideSuccessTipPanel, this);
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(TKJWL_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);
        EventManager.off(TKJWL_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.off(TKJWL_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.off(TKJWL_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.off(TKJWL_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.off(TKJWL_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.off(TKJWL_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
        EventManager.off(TKJWL_GameEvents.UI_SHOW_SUCCESS_TIP_PANEL, this.showSuccessTipPanel, this);
        EventManager.off(TKJWL_GameEvents.UI_HIDE_SUCCESS_TIP_PANEL, this.hideSuccessTipPanel, this);
    }

    onDestroy(){
        this.unregisterEvents();
    }
}


