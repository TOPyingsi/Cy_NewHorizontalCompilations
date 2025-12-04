import { _decorator, Button, Component, Label, Node, ProgressBar, tween, Vec3, UIOpacity, SpriteFrame, instantiate, Sprite } from 'cc';
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_DataManager } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';
import Banner from 'db://assets/Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_SuccessPanel')
export class GeometryVibes_SuccessPanel extends GeometryVibes_BasePanel {

    // UI组件绑定
    @property(Label)
    successTitle: Label = null; // "闯关成功"标题Label

    @property(Label)
    levelLabel: Label = null; // 关卡ID Label

    @property(ProgressBar)
    progressBar: ProgressBar = null; // 进度条组件

    @property(Label)
    progressLabel: Label = null; // 进度百分比Label

    @property(Label)
    coinsLabel: Label = null; // 金币数量Label

    @property(Button)
    doubleRewardButton: Button = null; // 双倍奖励按钮

    @property(Button)
    nextLevelButton: Button = null; // 下一关按钮

    @property(Button)
    mainMenuButton: Button = null; // 主界面按钮

    @property(Label)
    baseRewardLabel: Label = null;  // 基础奖励Label
    
    @property(Label)
    tripleRewardLabel: Label = null; // 三倍奖励Label


    // New coin effect properties
    @property([SpriteFrame]) coinFrames: SpriteFrame[] = [];
    @property(Node) coinTemplate: Node = null;
    @property(Node) coinsTargetArea: Node = null;

    private activeCoins: Node[] = [];
    private coinsCollected: number = 0;

    // ... existing code ...
    private elementOriginalPositions: Map<Node, Vec3> = new Map();

    public init(): void {
        //console.log("aaaaaaaaaaaaaa")
        super.init();
        this.setupUI();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "几何冲刺");
    }

     private setupUI(): void {
        // 读取数据
        const currentLevel = GeometryVibes_DataManager.getInstance().getCurrentLevel();
        const currentProgress = GeometryVibes_DataManager.getInstance().getCurrentProgress();
        const coins = GeometryVibes_DataManager.getInstance().getCoins();

        // 设置静态文本
        
        // 设置动态数据
        this.levelLabel.string = `关卡: ${currentLevel}`;
        this.progressBar.progress = currentProgress;
        this.progressLabel.string = `进度: ${currentProgress*100}%`;
        this.coinsLabel.string = `${coins}`;

        const rewards = GeometryVibes_DataManager.getInstance().getCurrentLevelReward();
        this.baseRewardLabel.string = `${rewards}`;
        this.tripleRewardLabel.string = `${rewards * 3}`;

        if (!GeometryVibes_DataManager.getInstance().isLatestUnlockedLevel(currentLevel,false)){
            this.baseRewardLabel.string = `${0}`;
            this.tripleRewardLabel.string = `${0 * 3}`;
        }

        // 初始化所有UI元素的初始状态(除title和coins外)
        this.setInitialElementStates();

        // 绑定按钮事件
        this.addButtonClick(this.doubleRewardButton, this.onDoubleRewardClick, this);
        this.addButtonClick(this.nextLevelButton, this.onNextLevelClick, this);
        this.addButtonClick(this.mainMenuButton, this.onMainMenuClick, this);
        
        // 启动标题动画
        this.startTitleAnimation();
        
        // 播放元素出现动画
        this.playElementsAnimation();
    }

    

    // 标题动画(循环缩放)
    private startTitleAnimation(): void {
        tween(this.successTitle.node)
            .repeatForever(
                tween()
                    .to(0.5, { scale: new Vec3(1.2, 1.2, 1) })
                    .to(0.5, { scale: new Vec3(1, 1, 1) })
            )
            .start();
    }

private setInitialElementStates(): void {
        const elementList = [
            this.levelLabel.node,
            this.progressBar.node,
            this.progressLabel.node,
            this.doubleRewardButton.node,
            this.nextLevelButton.node,
            this.mainMenuButton.node
        ];

        elementList.forEach(node => {
            // 记录原始位置
            this.elementOriginalPositions.set(node, node.position.clone());
            
            // 设置透明度为0
            const opacity = node.getComponent(UIOpacity) || node.addComponent(UIOpacity);
            opacity.opacity = 0;
            
            // 设置缩放为0.5
            node.scale = new Vec3(0.5, 0.5, 1);
            
            // 设置初始位置在下方
            node.position = new Vec3(0, -300, 0);
        });
    }


    // 播放元素出现动画
    private playElementsAnimation(): void {
        const elementSequence = [
            this.levelLabel.node,
            this.progressBar.node,
            this.progressLabel.node,
            this.doubleRewardButton.node,
            this.nextLevelButton.node,
            this.mainMenuButton.node
        ];

        elementSequence.forEach((node, index) => {
            const originalPos = this.elementOriginalPositions.get(node);
            tween(node)
                .delay(index * 0.15)
                .to(0.3, {
                    position: originalPos,
                    scale: Vec3.ONE
                })
                .call(() => {
                    const opacity = node.getComponent(UIOpacity);
                    tween(opacity)
                        .to(0.3, { opacity: 255 })
                        .start();
                })
                .start();
        });
    }

    
    private playCoinEffect(): void {
        const coinCount = 15;
        const scatterArea = 500;
        
        for (let i = 0; i < coinCount; i++) {
            const coin = instantiate(this.coinTemplate);
            this.node.addChild(coin);
            this.activeCoins.push(coin);
            
            const coinImage = coin.getChildByName('CoinImage');
            const coinTrail = coin.getChildByName('CoinTrail');
            
            // Initial setup
            coin.position = Vec3.ZERO;
            coin.scale = new Vec3(0.5, 0.5, 1);
            coinTrail.active = false;
            
            // Setup sprite animation
            const sprite = coinImage.getComponent(Sprite);
            this.animateCoinSprite(sprite);
            
            // Scatter animation
            const scatterX = (Math.random() - 0.5) * scatterArea;
            const scatterY = (Math.random() - 0.5) * scatterArea;
            const scatterPos = new Vec3(scatterX, scatterY, 0);
            
            tween(coin)
                .to(0.3, { 
                    position: scatterPos,
                    scale: new Vec3(0.8, 0.8, 1)
                })
                .delay(0.3)
                .call(() => {
                    // Start trail effect when flying to target
                    coinTrail.active = true;
                    this.flyToTarget(coin, coinTrail);
                })
                .start();
        }
    }

    private animateCoinSprite(sprite: Sprite): void {
        let frameIndex = 0;
        this.schedule(() => {
            frameIndex = (frameIndex + 1) % this.coinFrames.length;
            sprite.spriteFrame = this.coinFrames[frameIndex];
        }, 0.1);
    }

    private flyToTarget(coin: Node, trail: Node): void {
        const targetPos = this.coinsTargetArea.position.clone();
        const duration = 0.6 + Math.random() * 0.4; // Variation in flight time
        
        tween(coin)
            .to(duration, { 
                position: targetPos,
                scale: new Vec3(0.3, 0.3, 1) // Shrink when flying
            }, {
                easing: 'sineOut' // Start slow, end fast
            })
            .call(() => {
                this.onCoinCollected(coin);
            })
            .start();

        // Trail effect
        // tween(trail)
        //     .set({ opacity: 0 })
        //     .to(0.2, { opacity: 200 })
        //     .to(0.4, { opacity: 0 })
        //     .start();
    }

    private onCoinCollected(coin: Node): void {
        coin.destroy();
        this.activeCoins = this.activeCoins.filter(c => c !== coin);
        this.coinsCollected++;
        
        // Update coins display
        const currentCoins = GeometryVibes_DataManager.getInstance().getCoins();
        this.coinsLabel.string = `${currentCoins + this.coinsCollected}`;
        
        // All coins collected
        if (this.activeCoins.length === 0) {
            this.onAllCoinsCollected();
        }
    }

    private onAllCoinsCollected(): void {
        // Update actual coins in data manager
        GeometryVibes_DataManager.getInstance().addCoins(this.coinsCollected);
        
        // // Emit event or perform other actions
        // GeometryVibes_GameManager.getInstance().onCoinsCollected(this.coinsCollected);
    }

    // 双倍奖励按钮点击事件
    private onDoubleRewardClick(): void {
        // if (!this.isNewRecord) return;
          Banner.Instance.ShowVideoAd(()=>{
            const currentLevel =GeometryVibes_DataManager.getInstance().getCurrentLevel();
            if (GeometryVibes_DataManager.getInstance().isLatestUnlockedLevel(currentLevel,true)){
                const rewards = GeometryVibes_DataManager.getInstance().getCurrentLevelReward();
                GeometryVibes_DataManager.getInstance().addCoins(rewards * 3);
                this.coinsLabel.string = `${GeometryVibes_DataManager.getInstance().getCoins()}`;
            }

            if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
                // GeometryVibes_AudioManager.globalAudioPlay("Coins 03",0.5);
                GeometryVibes_AudioManager.getInstance().playSound("Coins 03");
            }

            GeometryVibes_UIManager.getInstance().showUI("NextLevelPanel", () => {
                GeometryVibes_UIManager.getInstance().hideUI("SuccessPanel");
            });
        });
      
    }

    // onAdFail(){

    // }



    // 下一关按钮点击事件
    private onNextLevelClick(): void {
        if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
            // GeometryVibes_AudioManager.globalAudioPlay("Coins 03",0.5);
            GeometryVibes_AudioManager.getInstance().playSound("Coins 03");
        }
        const currentLevel =GeometryVibes_DataManager.getInstance().getCurrentLevel();
        if (GeometryVibes_DataManager.getInstance().isLatestUnlockedLevel(currentLevel,true)){
            const rewards = GeometryVibes_DataManager.getInstance().getCurrentLevelReward();
            GeometryVibes_DataManager.getInstance().addCoins(rewards);
            this.coinsLabel.string = `${GeometryVibes_DataManager.getInstance().getCoins()}`;
        }
     
        GeometryVibes_GameManager.getInstance().backToLevelSelect();
    }

    // 主界面按钮点击事件
    private onMainMenuClick(): void {
        if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
            // GeometryVibes_AudioManager.globalAudioPlay("Coins 03",0.5);
            GeometryVibes_AudioManager.getInstance().playSound("Coins 03");
        }
        const currentLevel =GeometryVibes_DataManager.getInstance().getCurrentLevel();
        if (GeometryVibes_DataManager.getInstance().isLatestUnlockedLevel(currentLevel,true)){
            const rewards = GeometryVibes_DataManager.getInstance().getCurrentLevelReward();
            GeometryVibes_DataManager.getInstance().addCoins(rewards);
            this.coinsLabel.string = `${GeometryVibes_DataManager.getInstance().getCoins()}`;
        }

        GeometryVibes_GameManager.getInstance().backToMain();
    }
}
