import { _decorator, Component, find, Node, tween, v3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { GML_Events } from './GML_Events';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GML_AudioManager } from './GML_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('GML_GameManager')
export class GML_GameManager extends Component {

    static Instance: GML_GameManager = null!;

    public isPlayerDie: boolean = false;

    public resurgenceCount: number = 1;
    public progress: number = 0;

    public isRestart: boolean = false;
    public isWatchedVideo: boolean = false;

    @property(Node)
    passPanel: Node = null!;
    @property(Node)
    failPanel: Node = null!;

    onLoad(){
        GML_GameManager.Instance = this;
        this.isPlayerDie = false;
        this.passPanel.active = false;
        this.failPanel.active = false;
    }


    start(){
        let playSound = ()=>{
            GML_AudioManager.getInstance().playSound("大巴");
            this.scheduleOnce(()=>{
              playSound();
            },Math.random()*10+5)
        }
    }

    playerDie(){
        EventManager.Scene.emit(GML_Events.PLAYER_DIE);
        GML_GameManager.Instance.isPlayerDie = true;
        EventManager.Scene.emit(GML_Events.FIXED_CAMERA);
        
        if(this.resurgenceCount > 0){
            EventManager.Scene.emit(GML_Events.UI_SHOW_BTN_ReStart);
        }
        else{
            EventManager.Scene.emit(GML_Events.UI_HIDE_BTN_ReStart);
            EventManager.Scene.emit(GML_Events.UI_HIDE_BTN_Video);
            this.failGame();
        }
        EventManager.Scene.emit(GML_Events.UI_HIDE_BTN_CTRL);
        ProjectEventManager.emit(ProjectEvent.游戏结束, "过马路")
    }

    //复位
    restart(){
        // this.node.getComponent(GML_CarFlowSystem).stopCarFlow();
        // this.node.getComponent(GML_CarFlowSystem).restartCarFlow();
        this.resurgenceCount--;
        if(!this.isPlayerDie){
            EventManager.Scene.emit(GML_Events.PLAYER_LOG_RESUERGENCE_POS);
        }
        EventManager.Scene.emit(GML_Events.UI_UPDATE_RESTART_COUNT);
        EventManager.Scene.emit(GML_Events.RESET_PLAYER);
        EventManager.Scene.emit(GML_Events.UI_SHOW_BTN_CTRL);
        this.isPlayerDie = false;
    }

    failGame(){
        this.failPanel.active = true;
       let node = this.failPanel.getChildByName("node");
        node.setScale(v3(0,0,0));
       tween(node)
        .to(0.5, { scale: v3(1,1,1) })
        .call(()=>{
            node.getChildByName("btnReStart").on("click",this.restartGameFail,this);
            node.getChildByName("btnBackToMain").on("click",this.backToMainFail,this);
        })
        .start(); 
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "过马路")
    }

 

    passGame(){
       this.passPanel.active = true;
       let node = this.passPanel.getChildByName("node");
        node.setScale(v3(0,0,0));
       tween(node)
        .to(0.5, { scale: v3(1,1,1) })
        .call(()=>{
            node.getChildByName("btnReStart").on("click",this.restartGamePass,this);
            node.getChildByName("btnBackToMain").on("click",this.backToMainPass,this);
        })
        .start();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "过马路")
    }

    restartGameFail(){
       this.restartGame(this.failPanel);
    }

    restartGamePass(){
       this.restartGame(this.passPanel);
    }

    backToMainFail(){
        this.backToMain(this.failPanel);
    }

    backToMainPass(){
        this.backToMain(this.passPanel);
    }



    restartGame(panel:Node){
      
       let node = panel.getChildByName("node");
        node.setScale(v3(1,1,1));
       tween(node)
        .to(0.5, { scale: v3(0,0,0) })
        .call(()=>{
            node.getChildByName("btnReStart").off("click");
            node.getChildByName("btnBackToMain").off("click");
            panel.active = false;
            this.isRestart = true;
            this.isWatchedVideo = false;
            this.restart();
            this.resurgenceCount = 1;
            EventManager.Scene.emit(GML_Events.UI_UPDATE_RESTART_COUNT);
            EventManager.Scene.emit(GML_Events.UI_SHOW_BTN_ReStart);
        })
        .start();
        ProjectEventManager.emit(ProjectEvent.游戏开始, "过马路")
    }

    backToMain(panel?:Node){
        if(panel){
            panel.getChildByName("node").getChildByName("btnReStart").off("click");
            panel.getChildByName("node").getChildByName("btnBackToMain").off("click");
        }
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                    ProjectEventManager.emit(ProjectEvent.返回主页, "过马路");
            })
        });
    }
}


