import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_GameUI } from '../UI/XGDY_GameUI';
import { XGDY_AnglerPanel } from '../UI/XGDY_AnglerPanel';
import { XGDY_GameSettingPanel } from '../UI/XGDY_GameSettingPanel';
import { XGDY_LoadingPanel } from '../UI/XGDY_LoadingPanel';
import { XGDY_AnimationPanel } from '../UI/XGDY_AnimationPanel';
import { XGDY_MapPanel } from '../UI/XGDY_MapPanel';
import { XGDY_HomePanel } from '../UI/XGDY_HomePanel';
import { XGDY_DataManager, XGDY_HomeType } from './XGDY_DataManager';
import { XGDY_DialougePanel } from '../UI/XGDY_DialougePanel';
import { XGDY_RewardPanel } from '../UI/XGDY_RewardPanel';
import { XGDY_FishPanel } from '../UI/XGDY_FishPanel';
import { XGDY_SkillPanel } from '../UI/XGDY_SkillPanel';
import { XGDY_FishRodPanel } from '../UI/XGDY_FishRodPanel';
import { XGDY_TipPanel } from '../UI/XGDY_TipPanel';
import { XGDY_SelectFishLevelPanel } from '../UI/XGDY_SelectFishLevelPanel';
import { XGDY_CelebrationShopPanel } from '../UI/XGDY_CelebrationShopPanel';
import { XGDY_FishingCompetitionPanel } from '../UI/XGDY_FishingCompetitionPanel';
import { XGDY_DefaultBlackPanel } from '../UI/XGDY_DefaultBlackPanel';
import { XGDY_LoadingPanel_Black } from '../UI/XGDY_LoadingPanel_Black';
import { XGDY_ItemDialougePanel } from '../UI/XGDY_ItemDialougePanel';
import { XGDY_SeatPanel } from '../UI/XGDY_SeatPanel';
import { XGDY_AnimationPanel2 } from '../UI/XGDY_AnimationPanel2';
import { XGDY_AddMoneyPanel } from '../UI/XGDY_AddMoneyPanel';
import { XGDY_PoolPanel } from '../UI/XGDY_PoolPanel';
import { XGDY_SignPanel } from '../UI/XGDY_SignPanel';


const { ccclass, property } = _decorator;

@ccclass('XGDY_UIManager')
export class XGDY_UIManager extends Component {
    @property(XGDY_GameUI)
    public gameUI: XGDY_GameUI = null;  

    @property(XGDY_AnglerPanel)
    public anglerPanel: XGDY_AnglerPanel = null;  

    @property(XGDY_GameSettingPanel)
    public gameSettingPanel: XGDY_GameSettingPanel = null; 

    @property(XGDY_LoadingPanel)
    loadingPanel: XGDY_LoadingPanel = null;

    @property(XGDY_AnimationPanel)
    animationPanel: XGDY_AnimationPanel = null;

    @property(XGDY_MapPanel)
    mapPanel: XGDY_MapPanel = null;
    
    @property(XGDY_HomePanel)
    homePanel: XGDY_HomePanel = null;

    @property(XGDY_DialougePanel)
    dialougePanel: XGDY_DialougePanel = null;  

    @property(XGDY_RewardPanel)
    rewardPanel: XGDY_RewardPanel = null;  

    @property(XGDY_FishPanel)
    fishPanel: XGDY_FishPanel = null;  

    @property(XGDY_SkillPanel)
    skillPanel: XGDY_SkillPanel = null;  

    @property(XGDY_FishRodPanel)
    fishRodPanel: XGDY_FishRodPanel = null; 
    
    @property(XGDY_TipPanel)
    tipPanel: XGDY_TipPanel = null; 

    @property(XGDY_SelectFishLevelPanel)
    selectFishLevelPanel: XGDY_SelectFishLevelPanel = null;

    @property(XGDY_CelebrationShopPanel)
    celebrationShopPanel: XGDY_CelebrationShopPanel = null;
    
    @property(XGDY_FishingCompetitionPanel)
    fishingCompetitionPanel: XGDY_FishingCompetitionPanel = null;

    @property(XGDY_DefaultBlackPanel)
    defaultBlackPanel: XGDY_DefaultBlackPanel = null;
    
    @property(XGDY_LoadingPanel_Black)
    loadingPanel_black: XGDY_LoadingPanel_Black = null;

    @property(XGDY_ItemDialougePanel)
    itemDialougePanel: XGDY_ItemDialougePanel = null;

    @property(XGDY_SeatPanel)
    seatPanel: XGDY_SeatPanel = null;

    
    @property(XGDY_AnimationPanel2)
    animationPanel2: XGDY_AnimationPanel2 = null;
    
    @property(XGDY_AddMoneyPanel)
    addMoneyPanel: XGDY_AddMoneyPanel = null;


    @property(XGDY_PoolPanel)
    poolPanel: XGDY_PoolPanel = null;

    @property(XGDY_SignPanel)
    signPanel:XGDY_SignPanel = null;


    
    protected onLoad(): void {
        this.init();
    }

    init() {
        this.registerEvents();
    }


    initUI(){
        XGDY_DataManager.Instance.dynamicData.isEnterGameEnd = false;
        XGDY_DataManager.Instance.dynamicData.isEnterGame = false;
        if(XGDY_DataManager.Instance.dynamicData.isFirstEnterHome){
            XGDY_DataManager.Instance.dynamicData.isFirstEnterHome = false;
            this.showDefaultBlackPanel();
        }
        this.showLoadingPanel_black();
        EventManager.on(XGDY_GameEvents.Loading_Show_Completed,this.initHome,this);
    }

    initHome(){
        EventManager.off(XGDY_GameEvents.Loading_Show_Completed,this.initHome,this);
        this.hideDialougePanel();
        this.hideAnglerPanel();
        this.hideMapPanel();
        this.hideLoadingPanel();
 
        this.hideRewardPanel();
        this.hideFishPanel();
        this.hideSkillPanel();
        this.hideFishRodPanel();
        this.hideSelectFishLevelPanel();
        this.hideCelebrationShopPanel();
        this.hideFishingCompetitionPanel();
        this.hideItemDialougePanel();
        this.hideSeatPanel();
        this.hideAddMoneyPanel();
        this.hidePoolPanel();
        this.hideSignPanel();
        
        this.showTipPanel();
        this.showGameSettingPanel();
        this.showHomePanel();
        this.showAnimationPanel2();
        this.showGameUI();

        if(XGDY_DataManager.Instance.saveData.homeType == XGDY_HomeType.公路){
            this.showAnimationPanel();

            EventManager.Scene.emit(XGDY_GameEvents.UI_Show_UIItem_Fishing);
            XGDY_DataManager.Instance.dynamicData.isEnterHomeEnd = true;
        }
        else{
            EventManager.Scene.emit(XGDY_GameEvents.UI_Hide_UIItem_Fishing);
        }
    }

    enterGame(){
        XGDY_DataManager.Instance.dynamicData.isEnterGame = true;
        if(XGDY_DataManager.Instance.saveData.homeType == XGDY_HomeType.公路){
            this.showAnimationPanel();
        }
        else{
            EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_LOADING_PANEL);
        }

        this.hideGameSettingPanel();
        this.hideMapPanel();
        this.hideHomePanel();
        this.hideAnimationPanel2();
    }

    exiterGame(){
        XGDY_DataManager.Instance.dynamicData.isEnterGameEnd = false;
        XGDY_DataManager.Instance.dynamicData.isEnterGame = false;
        this.showAnimationPanel();
        this.hideGameUI();
        this.showGameSettingPanel();
        this.showHomePanel();
        this.showAnimationPanel2();
        // this.showMapPanel();
    }

    backToHomeMap(){

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

    showSelectFishLevelPanel(){
        this.selectFishLevelPanel.init();
        this.selectFishLevelPanel.node.active = true;
    }

    hideSelectFishLevelPanel(){
        this.selectFishLevelPanel.node.active = false;
    }

    showCelebrationShopPanel(){
        this.celebrationShopPanel.init();
        this.celebrationShopPanel.node.active = true;
    }

    hideCelebrationShopPanel(){
        this.celebrationShopPanel.node.active = false;
    }

    showFishingCompetitionPanel(){
        this.fishingCompetitionPanel.init();
        this.fishingCompetitionPanel.node.active = true;
    }

    hideFishingCompetitionPanel(){
        this.fishingCompetitionPanel.node.active = false;
    }


    showDefaultBlackPanel(){
        this.defaultBlackPanel.init();
        this.defaultBlackPanel.node.active = true;
    }

    hideDefaultBlackPanel(){
        this.defaultBlackPanel.node.active = false;
    }

    showLoadingPanel_black(){
        this.loadingPanel_black.init();
        this.loadingPanel_black.node.active = true;
    }

    hideLoadingPanel_black(){
        this.loadingPanel_black.node.active = false;
    }

    showItemDialougePanel(){
        this.itemDialougePanel.init();
        this.itemDialougePanel.node.active = true;
    }

    hideItemDialougePanel(){
        this.itemDialougePanel.node.active = false;
    }

    showSeatPanel(){
        this.seatPanel.init();
        this.seatPanel.node.active = true;
    }

    hideSeatPanel(){
        this.seatPanel.node.active = false;
    }

    showAnimationPanel2(){
        this.animationPanel2.init();
        this.animationPanel2.node.active = true;
    }

    hideAnimationPanel2(){
        this.animationPanel2.node.active = false;
    }

    showAddMoneyPanel(){
        this.addMoneyPanel.init();
        this.addMoneyPanel.node.active = true;
    }

    hideAddMoneyPanel(){
        this.addMoneyPanel.node.active = false;
    }

    showPoolPanel(){
        this.poolPanel.init();
        this.poolPanel.node.active = true;
    }

    hidePoolPanel(){
        this.poolPanel.node.active = false;
    }

    showSignPanel(){
        this.signPanel.init();
        this.signPanel.node.active = true; 
    }

    hideSignPanel(){
        this.signPanel.node.active = false; 
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
        EventManager.on(XGDY_GameEvents.UI_INIT_UI, this.initUI, this);
        EventManager.on(XGDY_GameEvents.UI_ENTER_GAME, this.enterGame, this);
        EventManager.on(XGDY_GameEvents.UI_EXIT_GAME, this.exiterGame, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);

        EventManager.on(XGDY_GameEvents.UI_SHOW_HOME_PANEL, this.showHomePanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_HOME_PANEL, this.hideHomePanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_GAME_SETTING_PANEL, this.showGameSettingPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_GAME_SETTING_PANEL, this.hideGameSettingPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_ANGLER_PANEL, this.showAnglerPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_ANGLER_PANEL, this.hideAnglerPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_SUCCESS_TIP_PANEL, this.showSuccessTipPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_SUCCESS_TIP_PANEL, this.hideSuccessTipPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_LOADING_PANEL, this.hideLoadingPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_LOADING_PANEL, this.showLoadingPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_MAP_PANEL, this.hideMapPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_MAP_PANEL, this.showMapPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_DIALOUGE_PANEL, this.hideDialougePanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_DIALOUGE_PANEL, this.showDialougePanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_REWARD_PANEL, this.showRewardPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_REWARD_PANEL, this.hideRewardPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_FISH_PANEL, this.showFishPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_FISH_PANEL, this.hideFishPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_SKILL_PANEL, this.showSkillPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_SKILL_PANEL, this.hideSkillPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_FISH_ROD_PANEL, this.showFishRodPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_FISH_ROD_PANEL, this.hideFishRodPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_ITEM_DIALOUGE_PANEL, this.showItemDialougePanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_ITEM_DIALOUGE_PANEL, this.hideItemDialougePanel, this);


        EventManager.on(XGDY_GameEvents.UI_SHOW_ANIMATION_PANEL, this.showAnimationPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_ANIMATION_PANEL, this.hideAnimationPanel, this);

        EventManager.on(XGDY_GameEvents.UI_SHOW_SELECT_FISH_LEVEL_PANEL, this.showSelectFishLevelPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_SELECT_FISH_LEVEL_PANEL, this.hideSelectFishLevelPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_CELEBRATION_PANEL, this.showCelebrationShopPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_CELEBRATION_PANEL, this.hideCelebrationShopPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_FISHING_COMPTITION_PANEL, this.showFishingCompetitionPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_FISHING_COMPTITION_PANEL, this.hideFishingCompetitionPanel, this);
    
        EventManager.on(XGDY_GameEvents.UI_SHOW_SEAT_PANEL, this.showSeatPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_SEAT_PANEL, this.hideSeatPanel, this);

        EventManager.on(XGDY_GameEvents.UI_SHOW_ANIMATION_PANEL2, this.showAnimationPanel2, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_ANIMATION_PANEL2, this.hideAnimationPanel2, this);
    
        EventManager.on(XGDY_GameEvents.UI_SHOW_DEFAULT_BLACK_PANEL, this.showDefaultBlackPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_DEFAULT_BLACK_PANEL, this.hideDefaultBlackPanel, this);
        EventManager.on(XGDY_GameEvents.UI_SHOW_LOADING_PANEL_BLACK, this.showLoadingPanel_black, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_LOADING_PANEL_BLACK, this.hideLoadingPanel_black, this);

        EventManager.on(XGDY_GameEvents.UI_SHOW_ADD_MONEY_PANEL, this.showAddMoneyPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_ADD_MONEY_PANEL, this.hideAddMoneyPanel, this);

        EventManager.on(XGDY_GameEvents.UI_SHOW_POOL_PANEL, this.showPoolPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_POOL_PANEL, this.hidePoolPanel, this);

        EventManager.on(XGDY_GameEvents.UI_SHOW_SIGN_PANEL, this.showSignPanel, this);
        EventManager.on(XGDY_GameEvents.UI_HIDE_SIGN_PANEL, this.hideSignPanel, this);
    
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(XGDY_GameEvents.UI_INIT_UI, this.initUI, this);
        EventManager.off(XGDY_GameEvents.UI_ENTER_GAME, this.enterGame, this);
        EventManager.off(XGDY_GameEvents.UI_EXIT_GAME, this.exiterGame, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_ALL_SCREENS, this.hideAllScreens, this);

        EventManager.off(XGDY_GameEvents.UI_SHOW_HOME_PANEL, this.showHomePanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_HOME_PANEL, this.hideHomePanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_GAMEUI, this.showGameUI, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_GAMEUI, this.hideGameUI, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_GAME_SETTING_PANEL, this.showGameSettingPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_GAME_SETTING_PANEL, this.hideGameSettingPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_ANGLER_PANEL, this.showAnglerPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_ANGLER_PANEL, this.hideAnglerPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_END_PANEL, this.showEndPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_END_PANEL, this.hideEndPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_TIP_PANEL, this.showTipPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_TIP_PANEL, this.hideTipPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_SUCCESS_TIP_PANEL, this.showSuccessTipPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_SUCCESS_TIP_PANEL, this.hideSuccessTipPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_LOADING_PANEL, this.hideLoadingPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_LOADING_PANEL, this.showLoadingPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_MAP_PANEL, this.hideMapPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_MAP_PANEL, this.showMapPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_DIALOUGE_PANEL, this.hideDialougePanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_DIALOUGE_PANEL, this.showDialougePanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_REWARD_PANEL, this.showRewardPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_REWARD_PANEL, this.hideRewardPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_SKILL_PANEL, this.showSkillPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_SKILL_PANEL, this.hideSkillPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_FISH_ROD_PANEL, this.showFishRodPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_FISH_ROD_PANEL, this.hideFishRodPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_ITEM_DIALOUGE_PANEL, this.showItemDialougePanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_ITEM_DIALOUGE_PANEL, this.hideItemDialougePanel, this);

        EventManager.off(XGDY_GameEvents.UI_SHOW_ANIMATION_PANEL, this.showAnimationPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_ANIMATION_PANEL, this.hideAnimationPanel, this);

        EventManager.off(XGDY_GameEvents.UI_SHOW_FISH_PANEL, this.showFishPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_FISH_PANEL, this.hideFishPanel, this);

        EventManager.off(XGDY_GameEvents.UI_SHOW_SELECT_FISH_LEVEL_PANEL, this.showSelectFishLevelPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_SELECT_FISH_LEVEL_PANEL, this.hideSelectFishLevelPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_CELEBRATION_PANEL, this.showCelebrationShopPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_CELEBRATION_PANEL, this.hideCelebrationShopPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_FISHING_COMPTITION_PANEL, this.showFishingCompetitionPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_FISHING_COMPTITION_PANEL, this.hideFishingCompetitionPanel, this);


        EventManager.off(XGDY_GameEvents.UI_SHOW_SEAT_PANEL, this.showSeatPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_SEAT_PANEL, this.hideSeatPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_ANIMATION_PANEL2, this.showAnimationPanel2, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_ANIMATION_PANEL2, this.hideAnimationPanel2, this);

        EventManager.off(XGDY_GameEvents.UI_SHOW_DEFAULT_BLACK_PANEL, this.showDefaultBlackPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_DEFAULT_BLACK_PANEL, this.hideDefaultBlackPanel, this);
        EventManager.off(XGDY_GameEvents.UI_SHOW_LOADING_PANEL_BLACK, this.showLoadingPanel_black, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_LOADING_PANEL_BLACK, this.hideLoadingPanel_black, this);

        EventManager.off(XGDY_GameEvents.UI_SHOW_ADD_MONEY_PANEL, this.showAddMoneyPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_ADD_MONEY_PANEL, this.hideAddMoneyPanel, this);

        EventManager.off(XGDY_GameEvents.UI_SHOW_POOL_PANEL, this.showPoolPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_POOL_PANEL, this.hidePoolPanel, this);

        EventManager.off(XGDY_GameEvents.UI_SHOW_SIGN_PANEL, this.showSignPanel, this);
        EventManager.off(XGDY_GameEvents.UI_HIDE_SIGN_PANEL, this.hideSignPanel, this);
    }

    onDestroy() {
        this.unregisterEvents();
    }
}


