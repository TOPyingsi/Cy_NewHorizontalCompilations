import { _decorator, Button, Component, Label, Node, tween } from 'cc';
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_DataManager, GeometryVibes_GameMode } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_MainMenuPanel')
export class GeometryVibes_MainMenuPanel extends GeometryVibes_BasePanel {

    @property(Button)
    classicButton: Button = null;

    @property(Button)
    endlessButton: Button = null;

    @property(Label)
    bestDistanceLabel: Label = null;

    @property(Button)
    soundButton: Button = null;

    @property(Button)
    musicButton: Button = null;

    @property(Button)
    returnButton: Button = null;

    public init(): void {
        super.init();
        this.setupUI();

        if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
            // if(!GeometryVibes_DataManager.getInstance().getIsInit()){
                // GeometryVibes_AudioManager.playDefaultClip();
                GeometryVibes_AudioManager.getInstance().playMusic("Menu Theme");
                // GeometryVibes_AudioManager.playLoopAudio("Menu Theme");
            // }
            // else{
            //     // debugger;
            //     GeometryVibes_AudioManager.playLoopAudio("Menu Theme");
            // }
        }

        let Particle2DNode = this.node.getChildByName("Particle2D");
        tween( Particle2DNode)
        .call(()=>{
            Particle2DNode.setPosition(-1225,0,0);
        })
        .delay(0.1)
        .call(()=>{
            Particle2DNode.setPosition(1225,0,0);
        })
        .start();

        ProjectEventManager.emit(ProjectEvent.弹出窗口, "几何冲刺");
    }

    // 设置UI内容
    private setupUI(): void {
        // 设置按钮点击事件
        this.addButtonClick(this.classicButton, this.onClassicClick, this);
        this.addButtonClick(this.endlessButton, this.onEndlessClick, this);
        this.addButtonClick(this.soundButton, this.onSoundToggle, this,false);
        this.addButtonClick(this.musicButton, this.onMusicToggle, this,false);
        this.addButtonClick(this.returnButton, this.onBackButtonClick, this,false);
        // 显示最佳分数
        this.bestDistanceLabel.string = `${GeometryVibes_DataManager.getInstance().getEndlessHighScore()}m`;

        if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
            this.soundButton.node.getChildByName("no").active = false;
        }
        else{
            this.soundButton.node.getChildByName("no").active = true;
        }
        
        if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
            this.musicButton.node.getChildByName("no").active = false; 
        }
        else{
            this.musicButton.node.getChildByName("no").active = true; 
        }
   
    }

    // Classic按钮点击事件
    private onClassicClick(): void {
        //console.log("点击了Classic按钮");

        GeometryVibes_DataManager.getInstance().setCurrentGameMode(GeometryVibes_GameMode.CLASSIC);
        GeometryVibes_UIManager.getInstance().showUI("LevelSelectPanel",()=>{
            GeometryVibes_UIManager.getInstance().hideUI("MainMenuPanel");
        });
    }

    // Endless按钮点击事件
    private onEndlessClick(): void {
        GeometryVibes_DataManager.getInstance().setCurrentGameMode(GeometryVibes_GameMode.ENDLESS);
         GeometryVibes_UIManager.getInstance().showUI("ShopPanel",()=>{
            GeometryVibes_UIManager.getInstance().hideUI("MainMenuPanel");
        });
    
        // GeometryVibes_GameManager.getInstance().startGame();
        //EventManager.emit("play-endless");
    }

    // 音效按钮点击事件
    private onSoundToggle(): void {
        GeometryVibes_DataManager.getInstance().toggleSound();
        if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
            this.soundButton.node.getChildByName("no").active = false; 
        }
        else{
            this.soundButton.node.getChildByName("no").active = true; 
        }
        //EventManager.emit("toggle-sound");
    }

    // 音乐按钮点击事件
    private onMusicToggle(): void {
        GeometryVibes_DataManager.getInstance().toggleMusic();
        if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
            this.musicButton.node.getChildByName("no").active = false; 
            // GeometryVibes_AudioManager.playDefaultClip();
            GeometryVibes_AudioManager.getInstance().playMusic("Menu Theme");
        }
        else{
            this.musicButton.node.getChildByName("no").active = true; 
            // GeometryVibes_AudioManager.StopLoopAudio("Menu Theme");
            GeometryVibes_AudioManager.getInstance().stopMusic();

        }

        // GeometryVibes_AudioManager.StopLoopAudio("Level_2");

        //EventManager.emit("toggle-music");
    }

    private onBackButtonClick(){
        console.log("点击了返回按钮");
 // director.loadScene(GameManager.StartScene);
        // ProjectEventManager.emit(ProjectEvent.返回主页, "掘地求财方块版");
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                 ProjectEventManager.emit(ProjectEvent.返回主页, "几何冲刺");
            })
        });
    }
    
}








