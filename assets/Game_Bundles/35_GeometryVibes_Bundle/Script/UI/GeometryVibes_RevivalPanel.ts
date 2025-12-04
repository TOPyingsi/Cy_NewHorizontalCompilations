import { _decorator, Button, Component, Label, Node, ProgressBar, Sprite, tween, UIOpacity, Vec3 } from 'cc';
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
import { GeometryVibes_DataManager, GeometryVibes_GameMode } from '../Manager/GeometryVibes_DataManager';
import Banner from 'db://assets/Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_RevivalPanel')
export class GeometryVibes_RevivalPanel extends GeometryVibes_BasePanel {
    @property(Node)
    BgMask: Node = null; // REVIVAL? 按钮

    @property(Button)
    revivalButton: Button = null; // REVIVAL? 按钮

    @property(Label)
    levelLabel: Label = null; // 倒计时数字文本

    @property(Label)
    countdownLabel: Label = null; // 倒计时数字文本

    @property(ProgressBar)
    progressBar: ProgressBar = null; // 右上角进度条

    private countdown: number = 3; // 初始倒计时3秒
    private isCountdownActive: boolean = true; // 是否正在倒计时

    public init(): void {
        super.init();
        this.setupUI();
        // ProjectEventManager.emit(ProjectEvent.弹出窗口, "几何冲刺");
        GeometryVibes_DataManager.getInstance().setIsDownCountEnd(false);
    }

    private setupUI(): void {
        // 初始化显示
        this.countdownLabel.string = `${this.countdown}`;
        this.progressBar.progress = 1; // 进度条初始为0
        if(GeometryVibes_DataManager.getInstance().getCurrentGameMode() == GeometryVibes_GameMode.ENDLESS){
            this.levelLabel.node.active = false;
        }
        else{
            this.levelLabel.string = `关卡 ${GeometryVibes_DataManager.getInstance().getCurrentLevel()}`;
             this.levelLabel.node.active = true;
        }

        // 绑定按钮事件
        this.addButtonClick(this.revivalButton, this.onRevivalClick, this);
        this.startTitleAnimation();
        this.startBgAnimation();
    }

    update(dt: number): void {
         if (!this.isCountdownActive || GeometryVibes_DataManager.getInstance().getIsPausedClicked()) {
            // debugger;
            return;
         }

        // 进度条更新：从1变为0，每秒减少33.3%
        this.progressBar.progress = Math.max(this.progressBar.progress - 0.333 * dt, 0);

        // 倒计时逻辑
        this.countdown -= dt;
        if (this.countdown <= 0) {
            this.countdown = 0;
            this.isCountdownActive = false;
            this.onCountdownComplete(); // 倒计时结束事件
        }
        this.countdownLabel.string = `${Math.ceil(this.countdown)}`; // 向上取整显示
    }

    private onRevivalClick(): void {
        if (!this.isCountdownActive){
            return; 
        } 
        // debugger
        // this.stopTitleAnimation()
        // this.isCountdownActive = false;
        let x = this;
        Banner.Instance.ShowVideoAd(()=>{
            // debugger;
            GeometryVibes_GameManager.getInstance().revivalGame(()=>{
                // debugger;
                    GeometryVibes_UIManager.getInstance().hideUI("RevivalPanel")
            });
        });

    }

    // onAdFail(){
    //     this.stopTitleAnimation()
    //     this.isCountdownActive = true;
    // }

    private onCountdownComplete(): void {
        let isEndless = GeometryVibes_DataManager.getInstance().getCurrentGameMode() == GeometryVibes_GameMode.ENDLESS;
        GeometryVibes_DataManager.getInstance().setIsDownCountEnd(true);

        if(isEndless){
            GeometryVibes_UIManager.getInstance().showUI("GameOverPanel",()=>{
                GeometryVibes_UIManager.getInstance().hideUI("RevivalPanel")
            });
        }
        else{
            GeometryVibes_UIManager.getInstance().showUI("FailPanel",()=>{
                GeometryVibes_UIManager.getInstance().hideUI("RevivalPanel")
            });
        }
    }

        // 标题动画(循环缩放)
        private startTitleAnimation(): void {
            tween(this.revivalButton.node)
                .repeatForever(
                    tween()
                        .to(0.4, { scale: new Vec3(1.2, 1.2, 1) })
                        .to(0.4, { scale: new Vec3(1, 1, 1) })
                )
                .start();
        }

        private startBgAnimation(){
            tween(this.BgMask.getComponent(UIOpacity))
                .to(1.5, { opacity: 240 })
                .start();
        }

        private stopTitleAnimation(): void {
            tween(this.revivalButton.node).stop(); // 停止所有正在运行的tween
            this.revivalButton.node.scale = new Vec3(1, 1, 1); // 重置缩放
        }
}