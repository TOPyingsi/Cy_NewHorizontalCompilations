import { _decorator, Component, director, Node } from 'cc';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { EMLHJ_DataManager } from './EMLHJ_DataManager';
import { EMLHJ_Const } from '../Common/EMLHJ_Const';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { LotteryMatrixGenerator } from '../Game/EMLHJ_LotteryMatrixGenerator';
import { EMLHJ_LotteryChecker } from '../Game/EMLHJ_LotteryChecker';
import { EMLHJ_LotteryRotation } from '../Game/EMLHJ_LotteryRotation';
import { EMLHJ_SymbolNodeInfo } from '../Common/EMLHJ_SymbolNodeInfo';
import { EMLHJ_WinInfo } from '../Common/EMLHJ_WinInfo';
import { EMLHJ_HighlightManager } from '../Game/EMLHJ_HighlightManager';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
import { EMLHJ_UIManager } from './EMLHJ_UIManager';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_GameManager')
export class EMLHJ_GameManager extends Component {
    private static instance: EMLHJ_GameManager;

    @property(EMLHJ_LotteryRotation)
    EMLHJ_LotteryRotation: EMLHJ_LotteryRotation = null;

    @property(EMLHJ_UIManager)
    UIManager: EMLHJ_UIManager = null;

    // private UIManager: EMLHJ_UIManager = null;

    // @property(EMLHJ_HighlightManager)
    highlightManager: EMLHJ_HighlightManager = null;
    // rotationManager: EMLHJ_LotteryRotation = null;
    checkerManager: EMLHJ_LotteryChecker = null;

    resultSymbolMatrix: (EMLHJ_SymbolNodeInfo | null)[][] = [];
    rewardResultData:EMLHJ_WinInfo = null;
    generator: LotteryMatrixGenerator = null;

    // 单例模式
    public static getInstance(): EMLHJ_GameManager {
        if (!EMLHJ_GameManager.instance) {
            // 查找场景中是否已存在GameManager节点
            const existingNode = director.getScene().getChildByName('GameManager');
            if (existingNode) {
                EMLHJ_GameManager.instance = existingNode.getComponent(EMLHJ_GameManager);
            } else {
                // 如果不存在，则创建新节点并添加组件
                const gameManagerNode = new Node('GameManager');
                director.getScene().addChild(gameManagerNode);
                EMLHJ_GameManager.instance = gameManagerNode.addComponent(EMLHJ_GameManager);
            }
        }
        return EMLHJ_GameManager.instance;
    }
    
    
    // 初始化游戏
    onLoad() {
        console.log("EMLHJ_GameManager onLoad");
        EMLHJ_GameManager.instance = this;

        EMLHJ_DataManager.Instance.init();
        this.onListenEvent()

        ProjectEventManager.emit(ProjectEvent.游戏开始, "恶魔老虎机");

        this.test();
        this.highlightManager = this.getComponent(EMLHJ_HighlightManager)
        this.checkerManager =this.getComponent(EMLHJ_LotteryChecker)
        this.UIManager.init();
    }

    start(){
        EMLHJ_DataManager.Instance.setNewDebt()
        this.UIManager.showGameUI();
        this.UIManager.hideAllScreens();
        this.UIManager.showTutorialPanel();
    }

    test(){
        // 创建生成器实例
        this.generator = new LotteryMatrixGenerator();

        // 示例1：使用默认参数生成矩阵（幸运值为5，无图案影响）
        // const matrix1 = this.generator.generateMatrix(3);
        const matrix1 = this.generator.generateMatrix(6, {5: 0.5});
        console.log("矩阵1:", matrix1);

        // 示例2：指定幸运值和图案影响（提高图案1和图案5的出现概率）
        // const matrix2 = this.generator.generateMatrix(8, {1: 0.5,2: 0.3 });
        // const matrix2 = this.generator.generateMatrix(8, {1: 0.9});

        // const matrix2 = this.generator.generateMatrix(4);
        // console.log("矩阵2:", matrix2);

        let rotation = this.EMLHJ_LotteryRotation;

        // this.getComponent(EMLHJ_LotteryChecker).initialize((rewardResultData: EMLHJ_WinInfo)=>{
        //     this.rewardResultData = rewardResultData;
        //     console.log("判断完成", this.rewardResultData  );
        //     // console.log("奖励:", rewardResultData);
        // });
        // this.getComponent(EMLHJ_LotteryChecker).startDetection(matrix2);
        rotation.initialize(matrix1);
        // this.scheduleOnce(()=>{
        //     rotation.startSpin(matrix2,(resultSymbolMatrix: (EMLHJ_SymbolNodeInfo | null)[][])=>{
        //         this.resultSymbolMatrix = resultSymbolMatrix;
        //         console.log("旋转完成：" + resultSymbolMatrix);
        //         this.highlightManager.startHighlight( this.rewardResultData,this.resultSymbolMatrix);
        //     });
        // },3);
    }

    startNewDebt(){
        // EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_SELECT_COUNT);
        EventManager.Scene.emit(EMLHJ_GameEvents.SHOW_NEW_DEBT);
        
    }

    spin(){
        
        let rotation = this.EMLHJ_LotteryRotation;
        const matrix2 = this.generator.generateMatrix(EMLHJ_DataManager.Instance.basicLuckyValue,
            EMLHJ_DataManager.Instance.iconProbabilitys
        );

        this.getComponent(EMLHJ_LotteryChecker).initialize((rewardResultData: EMLHJ_WinInfo)=>{
            this.rewardResultData = rewardResultData;
            console.log("判断完成", this.rewardResultData  )
            EMLHJ_DataManager.Instance.calculateRewards(matrix2,this.rewardResultData);
            
        });
        this.getComponent(EMLHJ_LotteryChecker).startDetection(matrix2);
        // rotation.initialize(matrix1);
        // this.scheduleOnce(()=>{
        rotation.startSpin(matrix2,(resultSymbolMatrix: (EMLHJ_SymbolNodeInfo | null)[][])=>{
            this.resultSymbolMatrix = resultSymbolMatrix;
            console.log("旋转完成：" + resultSymbolMatrix);
            this.highlightManager.startHighlight( this.rewardResultData,this.resultSymbolMatrix);
        });
        // },3);
        
    }

    consoleReward(rewardResultData: EMLHJ_WinInfo){
        this.rewardResultData = rewardResultData;
        console.log("判断完成", this.rewardResultData  );
        // console.log("奖励:", rewardResultData);
    }

    // 开始游戏
    startGame(): void {
        // if(EMLHJ_DataManager.Instance.currentPoints.level !== 1){
        //     this.playerCtrl.resetPlayer();
        //     this.monsterCtrl.resetMonster();
        //     EMLHJ_DataManager.Instance.setCurrentRoundNodes();
        //      EMLHJ_DataManager.Instance.isGameStart = true;
        // }
        // else{
        //     this.comicController.playStartAnimation(EMLHJ_DataManager.Instance.currentPoints.level,()=>{
        //         this.playerCtrl.resetPlayer();
        //         this.monsterCtrl.resetMonster();
        //     EMLHJ_DataManager.Instance.setCurrentRoundNodes();
        //         EMLHJ_DataManager.Instance.isGameStart = true;
        //    });
        // }
    }

    passGame(){
        EMLHJ_DataManager.Instance.isGameStart = false;
        EMLHJ_DataManager.Instance.isFail = false;
        this.UIManager.showEndPanel();

        // EMLHJ_DataManager.Instance.isGameStart = false;
        //         EMLHJ_DataManager.Instance.passLevel();

        //    this.comicController.playEndAnimation(EMLHJ_DataManager.Instance.currentPoints.level,()=>{
        //         this.monsterCtrl.clearMonster();
        //         this.gameUI.clearUI();
        //         EMLHJ_DataManager.Instance.passLevel();
        //         EMLHJ_DataManager.Instance.setCurrentRoundNodes();
        //         this.gameUI.showLevelSelectPanel();
        // }); 
    }

    gameOver(){
        
        EMLHJ_DataManager.Instance.isGameStart = false;
        EMLHJ_DataManager.Instance.isFail = true;
        this.UIManager.showEndPanel();

        
    //     this.comicController.playDeathAnimation(1,()=>{
    //         this.monsterCtrl.clearMonster();
    //         // this.gameUI.showDeadAnim();
    //          this.gameUI.clearUI();
    //          EMLHJ_DataManager.Instance.initcurrentLevel();
    //          EMLHJ_DataManager.Instance.setCurrentRoundNodes();
    //          this.gameUI.showDeadAnim();
    //  }); 
    }

    // backToSelete(){
    //     EMLHJ_DataManager.Instance.isGameStart = false;
    //     //   this.gameUI.showDeadAnim();
    //         // this.monsterCtrl.clearMonster();
    //         this.gameUI.clearUI();
    //          EMLHJ_DataManager.Instance.initcurrentLevel();
    //          EMLHJ_DataManager.Instance.setCurrentRoundNodes();
    //          this.gameUI.showLevelSelectPanel();
    // }

    backToMainPanel(){

    }

    onDestroy(){
        this.offListenEvent();
        // EMLHJ_AudioManager.clear();
        EMLHJ_GameManager.instance = null;
    }


    onListenEvent(){
        // EventManager.on(EMLHJ_GameEvents.START_NEW_DEBT,this.startNewDebt,this);
        EventManager.on(EMLHJ_GameEvents.END_GAME, this.gameOver, this);
        EventManager.on(EMLHJ_GameEvents.PASS_GAME, this.passGame, this);
        EventManager.on(EMLHJ_GameEvents.START_SPIN, this.spin, this);
        EventManager.on(EMLHJ_Const.EventName.PassGame, this.passGame, this);
        EventManager.on(EMLHJ_Const.EventName.GameOver, this.gameOver, this);
        EventManager.on(EMLHJ_Const.EventName.StartGame, this.startGame, this);
        EventManager.on(EMLHJ_Const.EventName.BackToMainPanel, this.backToMainPanel, this);
    }

    offListenEvent(){
        // EventManager.off(EMLHJ_GameEvents.START_NEW_DEBT,this.startNewDebt,this);
        EventManager.off(EMLHJ_GameEvents.END_GAME, this.gameOver, this);
        EventManager.off(EMLHJ_GameEvents.PASS_GAME, this.passGame, this);
        EventManager.off(EMLHJ_GameEvents.START_SPIN, this.spin, this);
        EventManager.off(EMLHJ_Const.EventName.PassGame, this.passGame, this);
        EventManager.off(EMLHJ_Const.EventName.GameOver, this.gameOver, this);
        EventManager.off(EMLHJ_Const.EventName.StartGame, this.startGame, this);
        EventManager.off(EMLHJ_Const.EventName.BackToMainPanel, this.backToMainPanel, this);
    }

}


