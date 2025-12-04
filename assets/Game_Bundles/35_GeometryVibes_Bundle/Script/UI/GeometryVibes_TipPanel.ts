import { _decorator, Button, Component, Label, Node, ProgressBar, Sprite, tween, UIOpacity, Vec3 } from 'cc';
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
import { GeometryVibes_DataManager, GeometryVibes_GameMode } from '../Manager/GeometryVibes_DataManager';
import Banner from 'db://assets/Scripts/Banner';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;


@ccclass('GeometryVibes_TipPanel')
export class GeometryVibes_TipPanel extends GeometryVibes_BasePanel {

    @property(Button)
    getMoneyButton: Button = null; // REVIVAL? 按钮

    @property(Button)
    NoButton: Button = null; // 倒计时数字文本

    @property(Label)
    coinsLabel: Label = null; // 倒计时数字文本

    private countdown: number = 3; // 初始倒计时3秒
    private isCountdownActive: boolean = true; // 是否正在倒计时

    public init(): void {
        super.init();
        this.setupUI();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "几何冲刺");
    }

    private setupUI(): void {
    const coins = GeometryVibes_DataManager.getInstance().getCoins();
        // 绑定按钮事件
        this.addButtonClick(this.getMoneyButton, this.onGetMoneyClick, this);
        this.addButtonClick(this.NoButton, this.onNoClick, this);
        this.coinsLabel.string = `${coins}`;
    }



    private onGetMoneyClick(): void {
        // if (!this.isNewRecord) return;
          Banner.Instance.ShowVideoAd(()=>{
            GeometryVibes_DataManager.getInstance().addCoins(500);
            if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
                // GeometryVibes_AudioManager.globalAudioPlay("Coins 03",0.5);
                GeometryVibes_AudioManager.getInstance().playSound("Coins 03");
            }
            this.coinsLabel.string = `${GeometryVibes_DataManager.getInstance().getCoins()}`;
            EventManager.Scene.emit("CoinChange");
            GeometryVibes_UIManager.getInstance().hideUI("TipPanel")
        });
    }

    // onAdFail(){

    // }


    private onNoClick(): void {
        GeometryVibes_UIManager.getInstance().hideUI("TipPanel"); 
    }

     
}