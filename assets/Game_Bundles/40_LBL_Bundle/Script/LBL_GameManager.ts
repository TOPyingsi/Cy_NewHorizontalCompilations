import { _decorator, AudioSource, Component, director, JsonAsset, Node } from 'cc';
import { LBL_AudioManager } from './LBL_AudioManager';
import { LBL_ComicController } from './LBL_ComicController';
import { LBL_DataManager } from './LBL_DataManager';
import { LBL_GameUI } from './LBL_GameUI';
import { LBL_PlayerController } from './LBL_PlayerController';
import { LBL_MonsterController } from './Monster/LBL_MonsterController';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { LBL_Const } from './LBL_Const';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('LBL_GameManager')
export class LBL_GameManager extends Component {
  private static instance: LBL_GameManager;
    private currentMode: LBL_GameManager;
    private currentLevel: number;
    private gameState: LBL_GameManager;
    private gameScene: Node | null;

    @property(LBL_ComicController)
    public comicController:LBL_ComicController = null;

    @property(Node)
    public pointParentNode:Node = null;

    @property(JsonAsset)
    public levelData:JsonAsset = null;

     @property(LBL_GameUI)
    public gameUI:LBL_GameUI = null;

    
    @property(LBL_PlayerController)
    public playerCtrl:LBL_PlayerController = null;

    @property(Node)
    public monsterNode:Node = null;

    monsterCtrl:LBL_MonsterController = null;

    // @property({type:Node})
    // public uiLayer:Node = null;
    // @property({type:Node})
    // public gameLayer: Node = null;
    // @property({type:Node})
    // public touchLayer: Node = null;
    // @property({type:Node})
    // public wallLayer: Node = null;
    
    // 单例模式
    public static getInstance(): LBL_GameManager {
        if (!LBL_GameManager.instance) {
            // 查找场景中是否已存在GameManager节点
            const existingNode = director.getScene().getChildByName('GameManager');
            if (existingNode) {
                LBL_GameManager.instance = existingNode.getComponent(LBL_GameManager);
            } else {
                // 如果不存在，则创建新节点并添加组件
                const gameManagerNode = new Node('GameManager');
                director.getScene().addChild(gameManagerNode);
                LBL_GameManager.instance = gameManagerNode.addComponent(LBL_GameManager);
            }
        }
        return LBL_GameManager.instance;
    }
    
    
    // 初始化游戏
    onLoad() {
        LBL_GameManager.instance = this;

        // // 初始化音频
        // let audio:AudioSource = this.node.getComponent(AudioSource)
        // // if (!GeometryVibes_AudioManager.MusicAudioSource) {
        //     LBL_AudioManager.MusicAudioSource = audio;
        // // }
        // LBL_AudioManager.setDefaultClip(audio.clip);
        // LBL_AudioManager.Init();
        // if (!LBL_AudioManager.SoundAudioSource) {
        //     let node = new Node();
        //     node.setParent(this.node);
        //     LBL_AudioManager.SoundAudioSource = node.addComponent(AudioSource);
        // }

        this.monsterCtrl = this.monsterNode.getComponent(LBL_MonsterController)


        LBL_DataManager.Instance.initlevelData(this.levelData.json);
        LBL_DataManager.Instance.initLevelParentNode(this.pointParentNode);
        this.onListenEvent()

        ProjectEventManager.emit(ProjectEvent.游戏开始, "狼伴侣");
        // this.comicController.init(LBL_DataManager.Instance.currentPoints.level,()=>{
          
        // });

    }

    // 开始游戏
    startGame(): void {
        if(LBL_DataManager.Instance.currentPoints.level !== 1){
            this.playerCtrl.resetPlayer();
            this.monsterCtrl.resetMonster();
            LBL_DataManager.Instance.setCurrentRoundNodes();
             LBL_DataManager.Instance.isGameStart = true;
        }
        else{
            this.comicController.playStartAnimation(LBL_DataManager.Instance.currentPoints.level,()=>{
                this.playerCtrl.resetPlayer();
                this.monsterCtrl.resetMonster();
            LBL_DataManager.Instance.setCurrentRoundNodes();
                LBL_DataManager.Instance.isGameStart = true;
           });
        }
    }

    passGame(){
        LBL_DataManager.Instance.isGameStart = false;

           this.comicController.playEndAnimation(LBL_DataManager.Instance.currentPoints.level,()=>{
                this.monsterCtrl.clearMonster();
                this.gameUI.clearUI();
                LBL_DataManager.Instance.passLevel();
                LBL_DataManager.Instance.setCurrentRoundNodes();
                this.gameUI.showLevelSelectPanel();
        }); 
    }

    gameOver(){
        LBL_DataManager.Instance.isGameStart = false;

        this.comicController.playDeathAnimation(1,()=>{
            this.monsterCtrl.clearMonster();
            // this.gameUI.showDeadAnim();
             this.gameUI.clearUI();
             LBL_DataManager.Instance.initcurrentLevel();
             LBL_DataManager.Instance.setCurrentRoundNodes();
             this.gameUI.showDeadAnim();
     }); 
    }

    backToSelete(){
        LBL_DataManager.Instance.isGameStart = false;
        //   this.gameUI.showDeadAnim();
            // this.monsterCtrl.clearMonster();
            this.gameUI.clearUI();
             LBL_DataManager.Instance.initcurrentLevel();
             LBL_DataManager.Instance.setCurrentRoundNodes();
             this.gameUI.showLevelSelectPanel();
    }

    onDestroy(){
        this.offListenEvent();
        LBL_AudioManager.clear();
        LBL_GameManager.instance = null;
    }


    onListenEvent(){
        EventManager.on(LBL_Const.EventName.PassGame, this.passGame, this);
        EventManager.on(LBL_Const.EventName.GameOver, this.gameOver, this);
        EventManager.on(LBL_Const.EventName.BackToSelete, this.backToSelete, this);
        EventManager.on(LBL_Const.EventName.StartGame, this.startGame, this);
    }

    offListenEvent(){
        EventManager.off(LBL_Const.EventName.PassGame, this.passGame, this);
        EventManager.off(LBL_Const.EventName.GameOver, this.gameOver, this);
        EventManager.off(LBL_Const.EventName.BackToSelete, this.backToSelete, this);
        EventManager.off(LBL_Const.EventName.StartGame, this.startGame, this);
    }

}

