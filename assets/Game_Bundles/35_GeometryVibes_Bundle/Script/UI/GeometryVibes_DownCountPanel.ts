import { _decorator, Button, Component, director, Label, Node, tween } from 'cc';
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_DataManager } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';
import { EventManager, MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_DownCountPanel')
export class GeometryVibes_DownCountPanel extends GeometryVibes_BasePanel {

     @property(Label)
    countdownLabel: Label = null;

    countdownDuration: number = 5; // 可配置的倒计时时长

    private remainingTime: number = 0;
    private elapsedTime: number = 0;
    private isPlayAudio = false;

    private isRunning: boolean = false;

    init(){
        this.startCountdown();
        GeometryVibes_DataManager.getInstance().setIsDownCountEnd(false);
        if(ProjectEventManager.GameStartIsShowTreasureBox){
            director.getScene().once(MyEvent.TreasureBoxDestroy,this.onTreasureBoxEnd, this);
        }
        else{
            this.onTreasureBoxEnd();
        }
    }

    onTreasureBoxEnd(){
        GeometryVibes_DataManager.getInstance().setIsTreasureChestEnd(true)
        // EventManager.off("TreasureBoxEnd",this.onTreasureBoxEnd,this)
    }

    // 启动倒计时（可外部调用）
    startCountdown(): void {
        this.remainingTime = this.countdownDuration;
        this.isRunning = true;
        this.updateDisplay();
        if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
            // GeometryVibes_AudioManager.globalAudioPlay("gerisayim");
            GeometryVibes_AudioManager.getInstance().playSound("gerisayim");
        }
    }

    update(dt: number) {
        let isa =  GeometryVibes_DataManager.getInstance().getIsGameStartDownCount();
        let isb = GeometryVibes_DataManager.getInstance().getIsTreasureChestEnd();
        let isTreaEnd=  isa && !isb;
        if (isTreaEnd||GeometryVibes_DataManager.getInstance().getIsPausedClicked()) return;

        this.elapsedTime += dt;
        
        if (this.elapsedTime >= 1 &&  this.remainingTime >=2 && !this.isPlayAudio) {
            this.isPlayAudio = true;
            if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
                // GeometryVibes_AudioManager.globalAudioPlay("gerisayim");
                GeometryVibes_AudioManager.getInstance().playSound("gerisayim");
            }
        }
        if (this.elapsedTime >= 1.0) {
            this.remainingTime -= Math.floor(this.elapsedTime);
            this.elapsedTime = 0;
            this.isPlayAudio = false;

            this.updateDisplay();

            if (this.remainingTime <= 0) {
                this.stopCountdown();
                this.onComplete();
            }
        }
    }

    // 强制停止倒计时
    public stopCountdown(): void {
        this.isRunning = false;
    }

    private updateDisplay(): void {
        if (this.countdownLabel) {
            // 显示整数秒（也可以显示小数实现精确倒计时）
            this.countdownLabel.string = Math.ceil(this.remainingTime).toString();
        }
    }

    private onComplete(): void {
        GeometryVibes_DataManager.getInstance().setIsGameStartDownCount(false)
        GeometryVibes_DataManager.getInstance().setIsDownCountEnd(true);
        // 场景事件派发（可替换为全局事件系统）
        GeometryVibes_DataManager.getInstance().setIsPaused(false);
        GeometryVibes_UIManager.getInstance().hideUI("DownCountPanel");
        // // 自动销毁（根据需求可选）
        // this.destroy();
    }
}








