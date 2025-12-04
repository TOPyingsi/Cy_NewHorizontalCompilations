import { _decorator, Component, Node } from 'cc';
import { HXTJB_ShopPanel } from '../UI/HXTJB_ShopPanel';
import { EMLHJ_GameUI } from '../../../41_EMLHJ_Bundle/Script/UI/EMLHJ_GameUI';
import { HXTJB_EndPanel } from '../UI/HXTJB_EndPanel';
import { HXTJB_GameUI } from '../UI/HXTJB_GameUI';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
import { HXTJB_TipPanel } from '../UI/HXTJB_TipPanel';
import { HXTJB_TutorialPanel } from '../UI/HXTJB_TutorialPanel';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_UIManager')
export class HXTJB_UIManager extends Component {
 @property(HXTJB_GameUI)
    GameUI: HXTJB_GameUI = null;


    @property(HXTJB_ShopPanel)
    shopPanel: HXTJB_ShopPanel = null;


    @property(HXTJB_EndPanel)
    endPanel: HXTJB_EndPanel = null;

    
    @property(HXTJB_TipPanel)
    tipPanel: HXTJB_TipPanel = null;

    @property(HXTJB_TutorialPanel)
    tutorialPanel: HXTJB_TutorialPanel = null;

    protected onLoad(): void {
        this.init();
    }

    init(){
        this.registerEvents();
    }


    showGameUI(){
        if(this.GameUI){
            this.GameUI.initUI();
            this.GameUI.node.active = true;
        }
    }

    hideGameUI(){
        if(this.GameUI){
            this.GameUI.node.active = false;
        }
    }


    showShopPanel(){
        if(this.shopPanel){
            this.shopPanel.node.active = true;
            this.shopPanel.initUI();
        }
    }

    hideShopPanel(){
        if(this.shopPanel){
            this.shopPanel.node.active = false;
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


    hideAllScreens(){
        // this.hideGameUI();
        this.hideShopPanel();
        this.hideEndPanel();
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

    showTutorialPanel(){
        if(this.tutorialPanel){
            this.tutorialPanel.node.active = true;
            this.tutorialPanel.initUI();
        }
    }

    hideTutorialPanel(){
        if(this.tutorialPanel){
            this.tutorialPanel.node.active = false;
        }
    }
    


 // 注册事件监听
    registerEvents() {
        EventManager.on(HXTJB_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);
        EventManager.on(HXTJB_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.on(HXTJB_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.on(HXTJB_GameEvents.UI_SHOW_SHOP_PANEL, this.showShopPanel, this);
        EventManager.on(HXTJB_GameEvents.UI_HIDE_SHOP_PANEL, this.hideShopPanel, this);
        EventManager.on(HXTJB_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.on(HXTJB_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.on(HXTJB_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.on(HXTJB_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
        EventManager.on(HXTJB_GameEvents.UI_SHOW_TUTORIAL_PANEL, this.showTutorialPanel, this);
        EventManager.on(HXTJB_GameEvents.UI_HIDE_TUTORIAL_PANEL, this.hideTutorialPanel, this);
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(HXTJB_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);
        EventManager.off(HXTJB_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.off(HXTJB_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.off(HXTJB_GameEvents.UI_SHOW_SHOP_PANEL, this.showShopPanel, this);
        EventManager.off(HXTJB_GameEvents.UI_HIDE_SHOP_PANEL, this.hideShopPanel, this);
        EventManager.off(HXTJB_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.off(HXTJB_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.off(HXTJB_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.off(HXTJB_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
        EventManager.off(HXTJB_GameEvents.UI_SHOW_TUTORIAL_PANEL, this.showTutorialPanel, this);
        EventManager.off(HXTJB_GameEvents.UI_HIDE_TUTORIAL_PANEL, this.hideTutorialPanel, this);
    }

    onDestroy(){
        this.unregisterEvents();
    }
}


