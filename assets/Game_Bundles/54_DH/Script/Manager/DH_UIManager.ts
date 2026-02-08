import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { DH_GameUI } from '../UI/DH_GameUI';
import { DH_AnglerPanel } from '../UI/DH_AnglerPanel';
import { DH_GameSettingPanel } from '../UI/DH_GameSettingPanel';
import { DH_LoadingPanel } from '../UI/DH_LoadingPanel';
import { DH_AnimationPanel } from '../UI/DH_AnimationPanel';
import { DH_MapPanel } from '../UI/DH_MapPanel';
import { DH_HomePanel } from '../UI/DH_HomePanel';
import { DH_DataManager } from './DH_DataManager';
import { DH_DialougePanel } from '../UI/DH_DialougePanel';
import { DH_RewardPanel } from '../UI/DH_RewardPanel';
import { DH_FishPanel } from '../UI/DH_FishPanel';
import { DH_SkillPanel } from '../UI/DH_SkillPanel';
import { DH_FishRodPanel } from '../UI/DH_FishRodPanel';
import { DH_TipPanel } from '../UI/DH_TipPanel';
import { DH_GetMoreMoneyPanel } from '../UI/DH_GetMoreMoneyPanel';


const { ccclass, property } = _decorator;

@ccclass('DH_UIManager')
export class DH_UIManager extends Component {
    @property(DH_GameUI)
    public gameUI: DH_GameUI = null;  

    @property(DH_AnglerPanel)
    public anglerPanel: DH_AnglerPanel = null;  

    @property(DH_GameSettingPanel)
    public gameSettingPanel: DH_GameSettingPanel = null; 

    @property(DH_LoadingPanel)
    loadingPanel: DH_LoadingPanel = null;

    @property(DH_AnimationPanel)
    animationPanel: DH_AnimationPanel = null;

    @property(DH_MapPanel)
    mapPanel: DH_MapPanel = null;
    
    @property(DH_HomePanel)
    homePanel: DH_HomePanel = null;

    @property(DH_DialougePanel)
    dialougePanel: DH_DialougePanel = null;  

    @property(DH_RewardPanel)
    rewardPanel: DH_RewardPanel = null;  

    @property(DH_FishPanel)
    fishPanel: DH_FishPanel = null;  

    @property(DH_SkillPanel)
    skillPanel: DH_SkillPanel = null;  

    @property(DH_FishRodPanel)
    fishRodPanel: DH_FishRodPanel = null; 
    
    @property(DH_TipPanel)
    tipPanel: DH_TipPanel = null; 
    
    @property(DH_GetMoreMoneyPanel)
    getMoreMoneyPanel: DH_GetMoreMoneyPanel = null;
    

    protected onLoad(): void {
        this.init();
    }

    init() {
        this.registerEvents();
    }


    initUI(){
        DH_DataManager.Instance.dynamicData.isEnterGameEnd = false;
        DH_DataManager.Instance.dynamicData.isEnterGame = false;
        this.showAnimationPanel();
        this.showHomePanel();
        this.showGameSettingPanel();
        this.hideDialougePanel();
        this.hideAnglerPanel();
        this.hideMapPanel();
        this.hideLoadingPanel();
        this.hideGameUI
        this.hideRewardPanel();
        this.hideFishPanel();
        this.hideSkillPanel();
        this.hideFishRodPanel();
        this.showTipPanel();
        this.hideGetMoreMoneyPanel();
    }

    enterGame(){
        DH_DataManager.Instance.dynamicData.isEnterGame = true;
        this.showAnimationPanel();
        this.hideGameSettingPanel();
        this.hideMapPanel();
        this.hideHomePanel();
    }

    exiterGame(){
        DH_DataManager.Instance.dynamicData.isEnterGameEnd = false;
        DH_DataManager.Instance.dynamicData.isEnterGame = false;
        this.showAnimationPanel();
        this.hideGameUI();
        this.showGameSettingPanel();
        this.showHomePanel();
        // this.showMapPanel();
    }


    showHomePanel() {
        this.homePanel.init(); // 确保UI初始化后再显示UI元素
        this.homePanel.node.active = true;
    }

    hideHomePanel() {
        this.homePanel.node.active = false;
    }

    showGameUI() {
        this.gameUI.init(); // 确保UI初始化后再显示UI元素
        this.gameUI.node.active = true;
    }

    hideGameUI() {
        this.gameUI.node.active = false;
    }

    showAnglerPanel() {
        this.anglerPanel.init(); // 确保UI初始化后再显示UI元素
        this.anglerPanel.node.active = true;
    }

    hideAnglerPanel() {
        this.anglerPanel.node.active = false;
    }

    showGameSettingPanel() {
        this.gameSettingPanel.init(); // 确保UI初始化后再显示UI元素
        this.gameSettingPanel.node.active = true;
    }

    hideGameSettingPanel() {
        this.gameSettingPanel.node.active = false;
    }

    showLoadingPanel() {
         this.loadingPanel.init();
        this.loadingPanel.node.active = true;
    }

    hideLoadingPanel() {
       
       this.loadingPanel.node.active = false;
    }

    showAnimationPanel(){
        this.animationPanel.init();
        this.animationPanel.node.active = true;
    }

    hideAnimationPanel(){
        this.animationPanel.node.active = false;
    }

    showMapPanel(){
        this.mapPanel.init();
        this.mapPanel.node.active = true;
    }

    hideMapPanel(){
        this.mapPanel.node.active = false;
    }

    showDialougePanel(){
        this.dialougePanel.init();
        this.dialougePanel.node.active = true;
    }
    hideDialougePanel(){
        this.dialougePanel.node.active = false;
    }

    showRewardPanel(){
        this.rewardPanel.init();
        this.rewardPanel.node.active = true;
    }

    hideRewardPanel(){
        this.rewardPanel.node.active = false;
    }

    showSkillPanel(){
        this.skillPanel.init();
        this.skillPanel.node.active = true;
    }

    hideSkillPanel(){
        this.skillPanel.node.active = false;
    }

    showFishRodPanel(){
        this.fishRodPanel.init();
        this.fishRodPanel.node.active = true;
    }

    hideFishRodPanel(){
        this.fishRodPanel.node.active = false;
    }

    showGetMoreMoneyPanel(){
        this.getMoreMoneyPanel.init();
        this.getMoreMoneyPanel.node.active = true;
    }

    hideGetMoreMoneyPanel(){
        this.getMoreMoneyPanel.node.active = false;
    }

    showEndPanel() {

    }

    hideEndPanel() {

    }




    showTipPanel() {
        this.tipPanel.init();
        this.tipPanel.node.active = true;
    }

    hideTipPanel() {
        this.tipPanel.node.active = false;
    }

    showSuccessTipPanel() {

    }

    hideSuccessTipPanel() {

    }

    showFishPanel(){
        this.fishPanel.init();
        this.fishPanel.node.active = true;
    }

    hideFishPanel(){
        this.fishPanel.node.active = false;
    }


    hideAllScreens() {
        // this.hideGameUI();
        this.hideEndPanel();
        this.hideTipPanel();
        this.hideSuccessTipPanel();
    }

    


    // 注册事件监听
    registerEvents() {
        EventManager.on(DH_GameEvents.UI_INIT_UI, this.initUI, this);
        EventManager.on(DH_GameEvents.UI_ENTER_GAME, this.enterGame, this);
        EventManager.on(DH_GameEvents.UI_EXIT_GAME, this.exiterGame, this);
        EventManager.on(DH_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);

        EventManager.on(DH_GameEvents.UI_SHOW_HOME_PANEL, this.showHomePanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_HOME_PANEL, this.hideHomePanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.on(DH_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.on(DH_GameEvents.UI_SHOW_GAME_SETTING_PANEL, this.showGameSettingPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_GAME_SETTING_PANEL, this.hideGameSettingPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_ANGLER_PANEL, this.showAnglerPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_ANGLER_PANEL, this.hideAnglerPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_SUCCESS_TIP_PANEL, this.showSuccessTipPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_SUCCESS_TIP_PANEL, this.hideSuccessTipPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_LOADING_PANEL, this.hideLoadingPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_LOADING_PANEL, this.showLoadingPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_MAP_PANEL, this.hideMapPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_MAP_PANEL, this.showMapPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_DIALOUGE_PANEL, this.hideDialougePanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_DIALOUGE_PANEL, this.showDialougePanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_REWARD_PANEL, this.showRewardPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_REWARD_PANEL, this.hideRewardPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_FISH_PANEL, this.showFishPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_FISH_PANEL, this.hideFishPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_SKILL_PANEL, this.showSkillPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_SKILL_PANEL, this.hideSkillPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_FISH_ROD_PANEL, this.showFishRodPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_FISH_ROD_PANEL, this.hideFishRodPanel, this);
        EventManager.on(DH_GameEvents.UI_SHOW_GET_MORE_MONEY_PANEL, this.showGetMoreMoneyPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_GET_MORE_MONEY_PANEL, this.hideGetMoreMoneyPanel, this);


        EventManager.on(DH_GameEvents.UI_SHOW_ANIMATION_PANEL, this.showAnimationPanel, this);
        EventManager.on(DH_GameEvents.UI_HIDE_ANIMATION_PANEL, this.hideAnimationPanel, this);
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(DH_GameEvents.UI_INIT_UI, this.initUI, this);
        EventManager.off(DH_GameEvents.UI_ENTER_GAME, this.enterGame, this);
        EventManager.off(DH_GameEvents.UI_EXIT_GAME, this.exiterGame, this);
        EventManager.off(DH_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);

        EventManager.off(DH_GameEvents.UI_SHOW_HOME_PANEL, this.showHomePanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_HOME_PANEL, this.hideHomePanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.off(DH_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.off(DH_GameEvents.UI_SHOW_GAME_SETTING_PANEL, this.showGameSettingPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_GAME_SETTING_PANEL, this.hideGameSettingPanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_ANGLER_PANEL, this.showAnglerPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_ANGLER_PANEL, this.hideAnglerPanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_SUCCESS_TIP_PANEL, this.showSuccessTipPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_SUCCESS_TIP_PANEL, this.hideSuccessTipPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_LOADING_PANEL, this.hideLoadingPanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_LOADING_PANEL, this.showLoadingPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_MAP_PANEL, this.hideMapPanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_MAP_PANEL, this.showMapPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_DIALOUGE_PANEL, this.hideDialougePanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_DIALOUGE_PANEL, this.showDialougePanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_REWARD_PANEL, this.showRewardPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_REWARD_PANEL, this.hideRewardPanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_SKILL_PANEL, this.showSkillPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_SKILL_PANEL, this.hideSkillPanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_FISH_ROD_PANEL, this.showFishRodPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_FISH_ROD_PANEL, this.hideFishRodPanel, this);
        EventManager.off(DH_GameEvents.UI_SHOW_GET_MORE_MONEY_PANEL, this.showGetMoreMoneyPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_GET_MORE_MONEY_PANEL, this.hideGetMoreMoneyPanel, this);

        EventManager.off(DH_GameEvents.UI_SHOW_ANIMATION_PANEL, this.showAnimationPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_ANIMATION_PANEL, this.hideAnimationPanel, this);

        EventManager.off(DH_GameEvents.UI_SHOW_FISH_PANEL, this.showFishPanel, this);
        EventManager.off(DH_GameEvents.UI_HIDE_FISH_PANEL, this.hideFishPanel, this);
    }

    onDestroy() {
        this.unregisterEvents();
    }
}


