import { _decorator, Component, Node, Label, Button, Sprite, tween, UITransform, Vec3 } from 'cc';
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_DataManager } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
import Banner from 'db://assets/Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_GameOverPanel')
export class GeometryVibes_GameOverPanel extends GeometryVibes_BasePanel {

    @property(Label)
    currentScoreLabel: Label = null; // 当前成绩

    @property(Label)
    bestScoreLabel: Label = null; // 最高成绩

    @property(Label)
    rewardCoinsLabel: Label = null; // 获得金币数

    @property(Label)
    tripleRewardCoinsLabel: Label = null; // 3倍奖励金币数

    @property(Label)
    coinLabel: Label = null; // 右上角当前金币数

    @property(Button)
    tripleRewardBtn: Button = null; // 3倍奖励按钮

    @property(Button)
    playAgainBtn: Button = null; // 再玩一次按钮

    @property(Button)
    homeBtn: Button = null; // 回到主页按钮

    @property(Node)
    currentScoreBg: Node = null; // 当前成绩背景

    @property(Node)
    bestScoreBg: Node = null; // 最高成绩背景

    @property(Node)
    rewardNode: Node = null; // 最高成绩背景

    private currentDistance: number = 0;
    private baseReward: number = 0;
    private isNewRecord: boolean = false; // 新增记录状态

    public init(): void {
        super.init();
        this.setupUI();
        this.playEntranceAnimations();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "几何冲刺");
    }

    private setupUI(): void {
        const currentMeters = GeometryVibes_DataManager.getInstance().getCurrrentTotalMeters();
        const bestMeters = GeometryVibes_DataManager.getInstance().getEndlessHighScore();
        
        // 判断是否新纪录
        this.isNewRecord = currentMeters > bestMeters;
        
        // 设置按钮交互状态
        // this.tripleRewardBtn.interactable = this.isNewRecord;
        // this.playAgainBtn.interactable = this.isNewRecord;

        // 设置成绩显示
        this.currentScoreLabel.string = `${currentMeters}m`;
        this.bestScoreLabel.string = `${bestMeters}m`;


        // // 设置成绩显示
        // this.currentScoreLabel.string = `${GeometryVibes_DataManager.getInstance().getCurrrentTotalMeters()}m`;
        // this.bestScoreLabel.string = `${GeometryVibes_DataManager.getInstance().getEndlessHighScore()}m`;


        // // 计算基础奖励 (前进米数：金币数=5：1)
        // this.baseReward = Math.floor(GeometryVibes_DataManager.getInstance().getCurrrentTotalMeters() / 5);
        // this.rewardCoinsLabel.string = `${this.baseReward}`;
        // this.tripleRewardCoinsLabel.string = `${this.baseReward * 3}`;

            // 计算有效米数（超过历史记录的部分）
            
            const validMeters = Math.max(currentMeters , 0);
            // 基础奖励 = 有效米数 / 5
            this.baseReward = Math.floor(validMeters / 5) ;

            // 设置奖励显示
            this.rewardCoinsLabel.string = `${this.baseReward}`;
            this.tripleRewardCoinsLabel.string = `${this.baseReward * 3}`;



        // 更新金币显示
        this.updateCoinDisplay();

        // 设置按钮点击事件
        this.playAgainBtn.node.on(Button.EventType.CLICK, this.onRestartClick, this);
        this.homeBtn.node.on(Button.EventType.CLICK, this.onMainMenuClick, this);
        this.tripleRewardBtn.node.on(Button.EventType.CLICK, this.onTripleReward, this);

        // 如果当前成绩是新高，更新最高记录
        if (currentMeters > bestMeters) {
            GeometryVibes_DataManager.getInstance().updateEndlessHighScore(currentMeters);
            this.bestScoreLabel.string = `${currentMeters}m`;
        }
    }

    private updateCoinDisplay(): void {
        const coins = GeometryVibes_DataManager.getInstance().getCoins();
        this.coinLabel.string = coins.toString();
    }

    private playEntranceAnimations(): void {
        // 重置所有元素的缩放为0
        const allNodes = [
            this.currentScoreLabel.node, this.bestScoreLabel.node,
            this.playAgainBtn.node, this.homeBtn.node,
            this.currentScoreBg, this.bestScoreBg
        ];

        allNodes.forEach(node => {
            node.setScale(Vec3.ZERO);
        });

        // 背景缩放动画 (持续1秒)
        tween(this.currentScoreBg)
            .to(1, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();

        tween(this.bestScoreBg)
            .to(1, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();

        // 成绩标签动画 (延迟0.2秒开始)
        tween(this.currentScoreLabel.node)
            .delay(0.2)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();

        tween(this.bestScoreLabel.node)
            .delay(0.2)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();

        tween(this.rewardCoinsLabel.node)
            .delay(0.4)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();

        tween(this.tripleRewardBtn.node)
            .delay(0.6)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();

        tween(this.playAgainBtn.node)
            .delay(0.6)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();

        tween(this.homeBtn.node)
            .delay(0.6)
            .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
            .start();

        tween(this.tripleRewardBtn.node)
            .delay(1.0) // 确保其他动画已完成
            .repeatForever(
                tween()
                    .to(0.5, { scale: new Vec3(1.1, 1.1, 1) })
                    .to(0.5, { scale: Vec3.ONE })
            )
            .start();
    
    }

    // 重玩按钮点击事件
    private onRestartClick(): void {
        // if (this.isNewRecord) {
            const reward = this.baseReward;
            GeometryVibes_DataManager.getInstance().addCoins(reward);
            
            // 更新UI显示
            // this.rewardCoinsLabel.string = `+${reward}`;
            this.updateCoinDisplay();
        // }

         GeometryVibes_GameManager.getInstance().restartGame();
    }

    // 主界面按钮点击事件
    private onMainMenuClick(): void {
        const reward = this.baseReward;
        GeometryVibes_DataManager.getInstance().addCoins(reward);
        GeometryVibes_GameManager.getInstance().backToMain();
    }

    private onDoubleReward(): void {
        // 发放2倍奖励
        const reward = this.baseReward * 2;
        GeometryVibes_DataManager.getInstance().addCoins(reward);
        
        // 更新UI显示
        this.rewardCoinsLabel.string = `+${reward}(2倍)`;
        this.updateCoinDisplay();
        
        // 禁用奖励按钮
        this.tripleRewardBtn.interactable = false;
        
        // 此处应该播放广告，简化处理
        //console.log("播放广告以获得2倍奖励");
    }

    private onTripleReward(): void {
        // if (!this.isNewRecord) return;
          Banner.Instance.ShowVideoAd(()=>{
            // 发放3倍奖励
            const reward = this.baseReward * 3;
            GeometryVibes_DataManager.getInstance().addCoins(reward);
            
            // 更新UI显示
            // this.rewardCoinsLabel.string = `+${reward}`;
            this.updateCoinDisplay();
            
            // 禁用奖励按钮
            this.tripleRewardBtn.interactable = false;
            
            // 3倍奖励按钮缩小消失动画
            tween(this.rewardNode)
                .to(0.3, { scale: Vec3.ZERO })
                .start();
                
            // 重玩和主页按钮上移动画
            const buttonMoveDistance = 100; // 移动距离
            tween(this.playAgainBtn.node)
                .to(0.3, { position: new Vec3(
                    this.playAgainBtn.node.position.x,
                    this.playAgainBtn.node.position.y + buttonMoveDistance,
                    0
                )})
                .start();
                
            tween(this.homeBtn.node)
                .to(0.3, { position: new Vec3(
                    this.homeBtn.node.position.x,
                    this.homeBtn.node.position.y + buttonMoveDistance,
                    0
                )})
                .start();
        });

    }

    // onAdFail(){
    //         // 更新UI显示
    //         // this.rewardCoinsLabel.string = `+${reward}`;
    //         this.updateCoinDisplay();
            
    //         // 禁用奖励按钮
    //         this.tripleRewardBtn.interactable = true;
    // }
}
