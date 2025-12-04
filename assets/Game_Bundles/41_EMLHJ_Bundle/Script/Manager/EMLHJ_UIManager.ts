import { _decorator, Component, Node } from 'cc';
import { EMLHJ_GameUI } from '../UI/EMLHJ_GameUI';
import { EMLHJ_IconPanel } from '../UI/EMLHJ_IconPanel';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
import { EMLHJ_RewardPanel } from '../UI/EMLHJ_RewardPanel';
import { EMLHJ_ShopPanel } from '../UI/EMLHJ_ShopPanel';
import { EMLHJ_ATMPanel } from '../UI/EMLHJ_ATMPanel';
import { EMLHJ_EndPanel } from '../UI/EMLHJ_EndPanel';
import { EMLHJ_PhonePanel } from '../UI/EMLHJ_PhonePanel';
import { EMLHJ_TutorialPanel } from '../UI/EMLHJ_TutorialPanel';
import { EMLHJ_TipPanel } from '../UI/EMLHJ_TipPanel';

const { ccclass, property } = _decorator;

@ccclass('EMLHJ_UIManager')
export class EMLHJ_UIManager extends Component {
    @property(EMLHJ_GameUI)
    GameUI: EMLHJ_GameUI = null;

    @property(EMLHJ_IconPanel)
    iconPanel: EMLHJ_IconPanel = null;

    @property(EMLHJ_RewardPanel)
    reWardPanel: EMLHJ_RewardPanel = null;

    @property(EMLHJ_ShopPanel)
    shopPanel: EMLHJ_ShopPanel = null;

    @property(EMLHJ_ATMPanel)
    atmPanel: EMLHJ_ATMPanel = null;

    @property(EMLHJ_EndPanel)
    endPanel: EMLHJ_EndPanel = null;

    @property(EMLHJ_PhonePanel)
    phonePanel: EMLHJ_PhonePanel = null;

    @property(EMLHJ_TutorialPanel)
    tutorialPanel: EMLHJ_TutorialPanel = null;

    @property(EMLHJ_TipPanel)
    tipPanel: EMLHJ_TipPanel = null;

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

    showIconPanel(){
        if(this.iconPanel){
            this.iconPanel.node.active = true;
            this.iconPanel.initUI();
        }
    }

    hideIconPanel(){
        if(this.iconPanel){
            this.iconPanel.node.active = false;
        }
    }

    showRewardPanel(){
        if(this.reWardPanel){
            this.reWardPanel.node.active = true;
            this.reWardPanel.initUI();
        }
    }

    hideRewardPanel(){
        if(this.reWardPanel){
            this.reWardPanel.node.active = false;
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

    showATMPanel(){
        if(this.atmPanel){
            this.atmPanel.node.active = true;
            this.atmPanel.initUI();
        }
    }

    hideATMPanel(){
        if(this.atmPanel){
            this.atmPanel.node.active = false;
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

    showPhonePanel(){
        if(this.phonePanel){
            this.phonePanel.node.active = true;
            this.phonePanel.initUI();
        }
    }

    hidePhonePanel(){
        if(this.phonePanel){
            this.phonePanel.node.active = false;
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


    hideAllScreens(){
        // this.hideGameUI();
        this.hideIconPanel();
        this.hideRewardPanel();
        this.hideShopPanel();
        this.hideATMPanel();
        this.hideEndPanel();
        this.hidePhonePanel();
        this.hideTutorialPanel();
        this.hideTipPanel();
    }

    


 // 注册事件监听
    registerEvents() {
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_ICON_PANEL, this.showIconPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_ICON_PANEL, this.hideIconPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_REWARD_PANEL, this.showRewardPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_REWARD_PANEL, this.hideRewardPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_SHOP_PANEL, this.showShopPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_SHOP_PANEL, this.hideShopPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_ATM_PANEL, this.showATMPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_ATM_PANEL, this.hideATMPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_PHONE_PANEL, this.showPhonePanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_PHONE_PANEL, this.hidePhonePanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_TUTORIAL_PANEL, this.showTutorialPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_TUTORIAL_PANEL, this.hideTutorialPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);
        EventManager.off(EMLHJ_GameEvents.UI_SHOW_ICON_PANEL, this.showIconPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_ICON_PANEL, this.hideIconPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.off(EMLHJ_GameEvents.UI_SHOW_REWARD_PANEL, this.showRewardPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_REWARD_PANEL, this.hideRewardPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_SHOW_SHOP_PANEL, this.showShopPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_SHOP_PANEL, this.hideShopPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_SHOW_ATM_PANEL, this.showATMPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_ATM_PANEL, this.hideATMPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_SHOW_PHONE_PANEL, this.showPhonePanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_PHONE_PANEL, this.hidePhonePanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_SHOW_TUTORIAL_PANEL, this.showTutorialPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_TUTORIAL_PANEL, this.hideTutorialPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
    }

    onDestroy(){
        this.unregisterEvents();
    }
}


