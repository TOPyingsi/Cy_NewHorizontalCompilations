import { _decorator, AudioClip, AudioSource, Component, director, EPhysics2DDrawFlags, EPhysicsDrawFlags, instantiate, Node, PhysicsSystem, PhysicsSystem2D, PolygonCollider2D, Prefab, UITransform, Vec3 } from 'cc';
import { GeometryVibes_UIManager } from './GeometryVibes_UIManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { GeometryVibes_DataManager, GeometryVibes_GameMode, GeometryVibes_LevelData } from './GeometryVibes_DataManager';
import { GeometryVibes_ClassicLevelCtrl } from '../Game/GeometryVibes_ClassicLevelCtrl';
import { GeometryVibes_EndlessLevelCtrl } from '../Game/GeometryVibes_EndlessLevelCtrl';
import { GeometryVibes_AudioManager } from './GeometryVibes_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

export enum GeometryVibes_GameState {
    READY,      // 准备中
    PLAYING,    // 游戏中
    PAUSED,     // 暂停
    GAME_OVER,   // 游戏结束
    GAME_RESTART   // 游戏重启
}

@ccclass('GeometryVibes_GameManager')
export class GeometryVibes_GameManager extends Component {

    private static instance: GeometryVibes_GameManager;
    private currentMode: GeometryVibes_GameMode;
    private currentLevel: number;
    private gameState: GeometryVibes_GameState;
    private gameScene: Node | null;

    @property({type:Node})
    public uiLayer:Node = null;
    @property({type:Node})
    public gameLayer: Node = null;
    @property({type:Node})
    public touchLayer: Node = null;

    
    @property({type:AudioClip})
    public clips: AudioClip[] = [];

    // @property({type:Node})
    // public wallLayer: Node = null;
    
    // 单例模式
    public static getInstance(): GeometryVibes_GameManager {
        if (!GeometryVibes_GameManager.instance) {
            // 查找场景中是否已存在GameManager节点
            const existingNode = director.getScene().getChildByName('GameManager');
            if (existingNode) {
                GeometryVibes_GameManager.instance = existingNode.getComponent(GeometryVibes_GameManager);
            } else {
                // 如果不存在，则创建新节点并添加组件
                const gameManagerNode = new Node('GameManager');
                director.getScene().addChild(gameManagerNode);
                GeometryVibes_GameManager.instance = gameManagerNode.addComponent(GeometryVibes_GameManager);
            }
        }
        return GeometryVibes_GameManager.instance;
    }
    
    
    // 初始化游戏
    onLoad() {
        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
        // // EPhysics2DDrawFlags.Pair |
        // // EPhysics2DDrawFlags.CenterOfMass |
        // // EPhysics2DDrawFlags.Joint |
        // // EPhysics2DDrawFlags.Shape;

        // // this.parseAllLevels(5);
        // // 确保单例实例指向这个组件   
        // // if (!GeometryVibes_GameManager.instance) {
        //     GeometryVibes_GameManager.instance = this;

        //     let audio:AudioSource = this.node.getComponent(AudioSource)
        //     // 初始化音频
        //     // if (!GeometryVibes_AudioManager.MusicAudioSource) {
        //         GeometryVibes_AudioManager.MusicAudioSource = audio;
        //     // }
        //     GeometryVibes_AudioManager.setDefaultClip(audio.clip);
        //     GeometryVibes_AudioManager.Init();
        //     // 初始化音频
        //     if (!GeometryVibes_AudioManager.SoundAudioSource) {
        //         let node = new Node();
        //         node.setParent(this.node);
        //         GeometryVibes_AudioManager.SoundAudioSource = node.addComponent(AudioSource);
        //     }

        GeometryVibes_AudioManager.getInstance().init(this.clips,this.node.addComponent(AudioSource),this.node.addComponent(AudioSource));

            // 设置节点名称便于识别
            this.node.name = 'GameManager';

            // this.gameLayer.active = false;
            // this.wallLayer.active = false;

            // 初始化游戏数据
            // 显示主界面
            GeometryVibes_UIManager.getInstance().init(this.uiLayer);
            GeometryVibes_UIManager.getInstance().setStartUI(this.uiLayer.getChildByName("MainMenuPanel"));
            GeometryVibes_DataManager.getInstance().setInited();
            // GeometryVibes_UIManager.getInstance().showUI("MainMenuPanel");
        // } else if (GeometryVibes_GameManager.instance !== this) {
        //     // 如果已经有实例，销毁当前组件
        //     this.destroy();
        // }
    }
    
    // 开始游戏
    startGame() {
        GeometryVibes_DataManager.getInstance().setIsPaused(true);

        // if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
        //     GeometryVibes_AudioManager.StopLoopAudio("Menu Theme");
        // }

        // 全屏触摸监听节点（已在场景预制体中设置）
        this.touchLayer.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchLayer.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        let onComplete = ()=>{
            // 设置游戏状态
            this.gameState = GeometryVibes_GameState.READY;
            // this.gameLayer.active = true;
            // 隐藏所有UI
            GeometryVibes_UIManager.getInstance().hideAllUI();
            GeometryVibes_UIManager.getInstance().showUI("GameUI",()=>{
                GeometryVibes_DataManager.getInstance().setIsTreasureChestEnd(false);
                GeometryVibes_DataManager.getInstance().setIsGameStartDownCount(true);
                ProjectEventManager.emit(ProjectEvent.游戏开始, "几何冲刺")
                GeometryVibes_UIManager.getInstance().showUI("DownCountPanel")
            //     debugger;
            // this.schedule(this.restartGame(),1)

            })
        }
            // if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
            //     GeometryVibes_AudioManager.StopLoopAudio("Menu Theme");
            // }
        // this.wallLayer.active = true;
        if(GeometryVibes_DataManager.getInstance().getCurrentGameMode() === GeometryVibes_GameMode.ENDLESS){
            this.gameLayer.getComponent(GeometryVibes_EndlessLevelCtrl).startGame(onComplete);
        }
        else{
            this.gameLayer.getComponent(GeometryVibes_ClassicLevelCtrl).startGame(onComplete);
        }
        // GeometryVibes_DataManager.getInstance().setIsPaused(true);

        // // 创建游戏场景
        // BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `game/GameScene`).then((prefab: Prefab)=>{
        //     this.gameScene = instantiate(prefab);
        //     director.getScene().addChild(this.gameScene);
        // })
    }

      destroyGame(){
        // 全屏触摸监听节点（已在场景预制体中设置）
        this.touchLayer.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchLayer.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        GeometryVibes_DataManager.getInstance().setIsPaused(true);
          // this.wallLayer.active = true;
          if(GeometryVibes_DataManager.getInstance().getCurrentGameMode() === GeometryVibes_GameMode.ENDLESS){
            this.gameLayer.getComponent(GeometryVibes_EndlessLevelCtrl).destroyGame(()=>{
                // 设置游戏状态
                // this.gameLayer.active = false;
                // GeometryVibes_UIManager.getInstance().hideUI("GameUI");
            })
        }
        else{
            this.gameLayer.getComponent(GeometryVibes_ClassicLevelCtrl).destroyGame(()=>{
                // 设置游戏状态
                // this.gameLayer.active = false;
                // GeometryVibes_UIManager.getInstance().hideUI("GameUI");
            })
        }

    }

    revivalGame(onComplete: Function){
        
        let callback = () =>{
            this.touchLayer.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.touchLayer.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
            GeometryVibes_DataManager.getInstance().setIsTouching(false);
            GeometryVibes_DataManager.getInstance().setIsPaused(true);
            GeometryVibes_UIManager.getInstance().hideAllUI();
            GeometryVibes_UIManager.getInstance().showUI("GameUI",()=>{
                GeometryVibes_UIManager.getInstance().showUI("DownCountPanel")
            })
            onComplete();
        }
        if(GeometryVibes_DataManager.getInstance().getCurrentGameMode() === GeometryVibes_GameMode.ENDLESS){
            this.gameLayer.getComponent(GeometryVibes_EndlessLevelCtrl).revivalGame(()=>{
                callback();
            })       
        }
        else{
            this.gameLayer.getComponent(GeometryVibes_ClassicLevelCtrl).revivalGame(()=>{
                callback();
            }) 
        }
    }
    
    
    // 游戏结束
    gameOver(isSuccess: boolean) {
        this.gameState = GeometryVibes_GameState.GAME_OVER;
        this.touchLayer.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchLayer.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        GeometryVibes_DataManager.getInstance().setIsTouching(false);
       
        const level = GeometryVibes_DataManager.getInstance().getCurrentLevel();
        const mode = GeometryVibes_DataManager.getInstance().getCurrentGameMode();
        if(isSuccess) {
            if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
                // GeometryVibes_AudioManager.globalAudioPlay("Win");
                GeometryVibes_AudioManager.getInstance().playSound("Win");
            }
            GeometryVibes_DataManager.getInstance().updateLevelProgress(level ,1);
            GeometryVibes_DataManager.getInstance().setCurrentProgress(1);
            GeometryVibes_DataManager.getInstance().passLevel(level);
            GeometryVibes_UIManager.getInstance().showUI("SuccessPanel");
        } else {
            GeometryVibes_DataManager.getInstance().setIsPaused(true);
            if(mode == GeometryVibes_GameMode.CLASSIC) {
                const progress = GeometryVibes_DataManager.getInstance().getCurrentProgress();
                GeometryVibes_DataManager.getInstance().updateLevelProgress(level ,progress);
            }
            else{
                const maters = GeometryVibes_DataManager.getInstance().getCurrrentTotalMeters()
                // GeometryVibes_DataManager.getInstance().updateEndlessHighScore(maters);
            }
            GeometryVibes_UIManager.getInstance().showUI("RevivalPanel");
        }
    }

  
    // 暂停游戏
    pauseGame() {
        this.gameState = GeometryVibes_GameState.PAUSED;
        GeometryVibes_DataManager.getInstance().setIsPaused(true);
        // 显示暂停界面
        GeometryVibes_UIManager.getInstance().showUI("PausePanel");
    }
    
    // 恢复游戏
    resumeGame() {
        this.gameState = GeometryVibes_GameState.PLAYING;
        if(GeometryVibes_DataManager.getInstance().getIsPausedClicked()){
            GeometryVibes_DataManager.getInstance().setIsPausedClicked(false);
        }
        if(!GeometryVibes_DataManager.getInstance().getIsDownCountEnd()){
             GeometryVibes_UIManager.getInstance().hideUI("PausePanel");
        }
        else{
            GeometryVibes_UIManager.getInstance().showUI("DownCountPanel",()=>{
                // 隐藏暂停界面
                GeometryVibes_UIManager.getInstance().hideUI("PausePanel");
            });
        }
    }

    // 再玩一次
    restartGame() {
        this.destroyGame();
        this.startGame();
    }

    // 下一关
    backToLevelSelect() {
        // if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
        //     GeometryVibes_AudioManager.playDefaultClip();
        // }
        GeometryVibes_UIManager.getInstance().showUI("LevelSelectPanel",()=>{
            this.destroyGame();
            GeometryVibes_UIManager.getInstance().hideAllOtherUI("LevelSelectPanel");
        });
        ProjectEventManager.emit(ProjectEvent.游戏结束, "几何冲刺");
    }
    
    // 返回主界面
    backToMain() {
        // if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
        //     GeometryVibes_AudioManager.playDefaultClip()

        // }
        
        // 显示主界面
        GeometryVibes_UIManager.getInstance().showUI("MainMenuPanel",()=>{
            this.destroyGame();
            GeometryVibes_UIManager.getInstance().hideAllOtherUI("MainMenuPanel");
        });
        ProjectEventManager.emit(ProjectEvent.游戏结束, "几何冲刺");
    }

    private onTouchStart() {
        
        // if(GeometryVibes_DataManager.getInstance().getIsPaused()){
        //     GeometryVibes_DataManager.getInstance().setIsTouching(false);
        //     return;
        // };
        if(GeometryVibes_DataManager.getInstance().getIsPaused()){
            return;
        }

        GeometryVibes_DataManager.getInstance().setIsTouching(true);
    }

    private onTouchEnd() {
        if(GeometryVibes_DataManager.getInstance().getIsPaused()){
            return;
        }
        // if(GeometryVibes_DataManager.getInstance().getIsPaused()) {
        //     GeometryVibes_DataManager.getInstance().setIsTouching(false);
        //     return;
        // }
        GeometryVibes_DataManager.getInstance().setIsTouching(false);
    }

////////////////////////////
    parseAllLevels(count:number){
        let levelDatas :{[key:number]:GeometryVibes_LevelData} = {};

        for(let i = 1;i<=count;i++){
            // 1. 加载关卡预制体
            const levelPath = `Game/Levels/level_${i}`;
            // 加载并创建UI预制体
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, levelPath).then((prefab: Prefab) => {
                let levelNode = instantiate(prefab);
                this.gameLayer.addChild(levelNode);
                let levelData= this.parseData(levelNode);
                levelDatas[i] = levelData;
                // levelDatas.push(levelData);
                //console.log("levelData",JSON.stringify(levelDatas));
            });
        }
    }

    parseData(levelNode:Node):GeometryVibes_LevelData{
        let revivalPoses:Vec3[] = [];
        let polyCollider = levelNode.getChildByName("resurrectionPoses").getComponent(PolygonCollider2D);
        polyCollider.points.forEach((point)=>{
            revivalPoses.push(new Vec3(point.x + polyCollider.node.worldPosition.x,point.y + polyCollider.node.worldPosition.y));
        })

        let ceilingNode = levelNode.getChildByName("WallLayer").getChildByName("Ceiling");
        let floorNode = levelNode.getChildByName("WallLayer").getChildByName("Floor");
        let heightCeiling = ceilingNode.getComponent(UITransform).height;
        let heightFloor = floorNode.getComponent(UITransform).height;
        let ceilingPosY = ceilingNode.worldPosition.y - heightCeiling/2;
        let floorPosY = floorNode.worldPosition.y + heightFloor/2;

        let endLinePosX = levelNode.getChildByName("endLine").worldPosition.x;
        let length = endLinePosX - levelNode.getChildByName("startPos").worldPosition.x;

        let levelData:GeometryVibes_LevelData = {
            levelID:parseInt(levelNode.name.split("_")[1]),
            startPos:levelNode.getChildByName("startPos").worldPosition,
            length:length,
            endPos:levelNode.getChildByName("endPos").worldPosition,
            totalRevivalPoses:revivalPoses,
            ceilingPosY:ceilingPosY,
            floorPosY:floorPosY,
        };
        return levelData;
    }


    onDestroy(){

    }
}



