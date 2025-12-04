import { _decorator, Button, Component, instantiate, Label, Node, ProgressBar, Sprite, SpriteFrame, tween, UIOpacity, Vec3 } from 'cc';
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_ToolUtils } from '../Common/GeometryVibes_ToolUtils';
import { GeometryVibes_DataManager, GeometryVibes_LevelInfo } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

// DataManager.levelsInfo = [
//     { levelNumber: 1, difficulty: 'Easy', progress: 100, emojiSpriteFrame: 'emoji_happy', isLocked: false, backgroundSpriteFrame: 'background_1' },
//     { levelNumber: 2, difficulty: 'Easy', progress: 100, emojiSpriteFrame: 'emoji_happy', isLocked: false, backgroundSpriteFrame: 'background_2' },
//     { levelNumber: 3, difficulty: 'Normal', progress: 100, emojiSpriteFrame: 'emoji_smile', isLocked: false, backgroundSpriteFrame: 'background_3' },
//     // ... 更多关卡数据
// ];



@ccclass('GeometryVibes_LevelSelectPanel')
export class GeometryVibes_LevelSelectPanel extends GeometryVibes_BasePanel {
        @property(Button)
        backButton: Button = null;
    
        @property(Node)
        levelContainer: Node = null; // 存放所有关卡的容器节点

        @property(SpriteFrame)
        emojiSpriteFrames: SpriteFrame[] = []; 

        

        // @property(SpriteFrame)
        // backgroundSpriteFrames: SpriteFrame[] = []; 

    
        public init(): void {
            super.init();
            this.setupUI();
            if(GeometryVibes_DataManager.getInstance().isMusicEnabled()){
                // GeometryVibes_AudioManager.playDefaultClip();
                GeometryVibes_AudioManager.getInstance().playMusic("Menu Theme");
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
            // 设置返回按钮点击事件
            this.addButtonClick(this.backButton, this.onBackClick, this);
    
            let levelsInfo = GeometryVibes_DataManager.getInstance().getLevelInfo(); // Get level info
    
            levelsInfo.forEach((levelData: GeometryVibes_LevelInfo, index: number) => {
                const progress = GeometryVibes_DataManager.getInstance().getLevelProgress(levelData.levelNumber);
                levelData.progress = progress;
                levelData.isLocked = progress >= 0; // Lock the level if no progress

                this.createLevelItem(levelData, index);
            });
        }
    
        // 返回按钮点击事件
        private onBackClick(): void {
            GeometryVibes_UIManager.getInstance().showUI("MainMenuPanel", () => {
                GeometryVibes_UIManager.getInstance().hideUI("LevelSelectPanel");
            });
        }
    
        // 创建一个关卡项
        private createLevelItem(levelData: GeometryVibes_LevelInfo, index: number): void {
            // 获取模板节点（假设是levelContainer的第一个子节点）
            const levelItem = this.levelContainer.children[levelData.levelNumber-1];

            
            // // 实例化模板节点
            // const levelItem = instantiate(templateNode);
            // levelItem.active = true;
            // levelItem.setParent(this.levelContainer);
            
            // // 获取预设的子节点
            // const background = levelItem.getChildByName('Background').getComponent(Sprite);
            const levelLabel = levelItem.getChildByName('LevelLabel').getComponent(Label);
            const difficultyLabel = levelItem.getChildByName('DifficultyLabel').getComponent(Label);
            const progressBar = levelItem.getChildByName('ProgressBar').getComponent(ProgressBar);
            const progressLabel = levelItem.getChildByName('ProgressLabel').getComponent(Label);
            const emojiSprite = levelItem.getChildByName('Emoji').getComponent(Sprite);
            const lockedSprite = levelItem.getChildByName('Locked');
            
            // // 设置关卡项内容
            // background.spriteFrame = this.backgroundSpriteFrames[levelData.backgroundColorId-1];
            levelLabel.string = `第${levelData.levelNumber}关`;
            difficultyLabel.string = levelData.difficulty;
            progressBar.progress = levelData.progress;
            progressLabel.string = ` ${(levelData.progress * 100).toFixed(1)}%`;
            emojiSprite.spriteFrame = this.emojiSpriteFrames[levelData.emojiId-1];

            lockedSprite.active = !levelData.isLocked;
            
            // 设置关卡点击事件
            this.addButtonClick(levelItem.getComponent(Button), () => this.onLevelItemClick(levelData.levelNumber), this);
            
            // 播放摇摆动画
            this.playShakeAnimation(levelItem, index);
        }
    
       // 播放摇摆动画，旋转和透明度动画同时进行
        private playShakeAnimation(levelItem: Node, index: number): void {
            const delayTime = index * 0.1;  // 设置动画的延迟时间，确保每个关卡项按顺序摇摆
            
            // 获取UIOpacity组件
            const opacityComponent = levelItem.getComponent(UIOpacity);
            opacityComponent.opacity = 0;
            levelItem.scale = new Vec3(0,0,1);
            // 使用tween进行旋转和透明度的动画
            tween(levelItem)
                .delay(delayTime)  // 延迟时间
                .parallel(
                    // 旋转动画，绕中心旋转30度
                    tween(levelItem)
                    .to(0.1, { angle: 30 })  // 改用angle属性
                    .to(0.1, { angle: -30 })
                    .to(0.1, { angle: 0 }),
                    
                    // 透明度动画，从0到1
                    tween(opacityComponent)
                        .to(0.3, { opacity: 255 }),  // 透明度从0到255
                     // 缩放动画
                    tween(levelItem)
                        .to(0.3, { scale: new Vec3(1, 1, 1) })
                    )
                .start();
        }

    
        // 关卡项点击事件
        private onLevelItemClick(levelNumber: number): void {
            if(!GeometryVibes_DataManager.getInstance().isLevelUnLocked(levelNumber)){
                return;
            }
            //console.log("点击了第" + levelNumber + "关");

            // 设置选择的关卡
            GeometryVibes_DataManager.getInstance().setCurrentLevel(levelNumber);
            GeometryVibes_UIManager.getInstance().showUI("ShopPanel",()=>{
                GeometryVibes_UIManager.getInstance().hideUI("LevelSelectPanel")
                // GeometryVibes_GameManager.getInstance().startGame();
            });
        }
    }
    



