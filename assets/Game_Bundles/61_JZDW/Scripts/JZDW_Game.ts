import { _decorator, Component, Node, Sprite, SpriteFrame, Label, AudioSource, AudioClip, tween, Vec3, Color } from 'cc';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

// 图片和音频的配对数据
@ccclass('ImageAudioPair')
export class ImageAudioPair {
    @property(SpriteFrame)
    image: SpriteFrame = null;

    @property(AudioClip)
    audio: AudioClip = null;
}

@ccclass('JZDW_Game')
export class JZDW_Game extends Component {
    @property(Node)
    leftContainer: Node = null; // 左侧8个框的容器

    @property(Node)
    rightContainer: Node = null; // 右侧4个框的容器

    @property(Node)
    hpContainer: Node = null; // 血量容器

    @property(Node)
    winPanel: Node = null; // 胜利面板

    @property(Node)
    losePanel: Node = null; // 失败面板

    @property(Node)
    nextLevelButton: Node = null; // 下一关按钮（在胜利面板中）

    @property(Node)
    restartButton: Node = null; // 重新开始按钮（在胜利面板中）

    @property(Label)
    levelLabel: Label = null; // 关卡显示

    @property(Node)
    character: Node = null; // 中间的人物角色

    @property(SpriteFrame)
    characterNormal: SpriteFrame = null; // 人物正常状态图片

    @property(SpriteFrame)
    characterHurt: SpriteFrame = null; // 人物受伤状态图片

    @property(SpriteFrame)
    characterHappy: SpriteFrame = null; // 人物开心状态图片（答对时）

    @property([ImageAudioPair])
    imageAudioPairs: ImageAudioPair[] = []; // 17组图片和音频配对

    @property(AudioClip)
    wrongAudio: AudioClip = null; // 错误音效

    @property(AudioClip)
    bgMusic: AudioClip = null; // 背景音乐

    @property(AudioSource)
    audioSource: AudioSource = null; // 音频播放器

    @property(AudioSource)
    bgAudioSource: AudioSource = null; // 背景音乐播放器（可选，如果不配置会使用 audioSource）

    @property(Node)
    countdownPanel: Node = null; // 倒计时面板（黑幕）

    @property(Label)
    countdownLabel: Label = null; // 倒计时数字显示（可选，如果不配置会自动查找）

    private leftItems: Node[] = []; // 左侧8个框
    private rightItems: Node[] = []; // 右侧8个框
    private hpNodes: Node[] = []; // 血量节点

    private currentLevel: number = 1; // 当前关卡
    private maxLevel: number = 5; // 最大关卡
    private currentHp: number = 5; // 当前血量
    private maxHp: number = 5; // 最大血量

    private currentSelectIndex: number = 0; // 当前选中的左侧框索引
    private selectedPairs: ImageAudioPair[] = []; // 当前关卡选中的4组图片音频
    private leftImageOrder: number[] = []; // 左侧图片对应的索引（0-3，每个数字出现两次）
    private rightImageOrder: number[] = []; // 右侧图片对应的索引（0-3，每个数字出现两次）
    private isWaiting: boolean = false; // 是否在等待状态

    start() {
        // 确保背景音乐播放器设置为循环模式
        if (this.bgAudioSource) {
            this.bgAudioSource.loop = true;
        }

        this.initGame();

        // 触发游戏开始事件
        ProjectEventManager.emit(ProjectEvent.游戏开始, "节奏大王");

        // 如果配置了倒计时面板，显示倒计时
        if (this.countdownPanel && this.countdownLabel) {
            this.showCountdown();
        } else {
            // 没有配置倒计时，直接开始游戏
            this.startGameplay();
        }
    }

    showCountdown() {
        // 显示倒计时面板
        if (this.countdownPanel) {
            this.countdownPanel.active = true;
        }

        // 查找 CountdownLabel（可能在 CountdownPanel 下）
        let label = this.countdownLabel;
        if (!label && this.countdownPanel) {
            const labelNode = this.countdownPanel.getChildByName('CountdownLabel');
            if (labelNode) {
                label = labelNode.getComponent(Label);
            }
        }

        // 显示 5
        if (label) label.string = "5";
        
        this.scheduleOnce(() => {
            // 显示 4
            if (label) label.string = "4";
            
            this.scheduleOnce(() => {
                // 显示 3
                if (label) label.string = "3";
                
                this.scheduleOnce(() => {
                    // 显示 2
                    if (label) label.string = "2";
                    
                    this.scheduleOnce(() => {
                        // 显示 1
                        if (label) label.string = "1";
                        
                        this.scheduleOnce(() => {
                            // 显示"游戏开始"
                            if (label) label.string = "游戏开始!";
                            
                            this.scheduleOnce(() => {
                                // 隐藏面板，开始游戏
                                if (this.countdownPanel) {
                                    this.countdownPanel.active = false;
                                }
                                this.startGameplay();
                            }, 1);
                        }, 1);
                    }, 1);
                }, 1);
            }, 1);
        }, 1);
    }

    startGameplay() {
        // 播放背景音乐（只在专门的背景音乐播放器上播放）
        if (this.bgMusic && this.bgAudioSource) {
            // 如果背景音乐已经在播放，不需要重新播放
            if (!this.bgAudioSource.playing) {
                this.bgAudioSource.clip = this.bgMusic;
                this.bgAudioSource.loop = true; // 循环播放
                this.bgAudioSource.play();
            }
        }

        // 真正开始游戏，显示第一个选中效果
        this.scheduleOnce(() => {
            this.showSelectFrame();
        }, 0.5);
    }

    initGame() {
        // 初始化左右容器的子节点
        this.leftItems = [];
        this.rightItems = [];

        for (let i = 0; i < 8; i++) {
            if (this.leftContainer.children[i]) {
                this.leftItems.push(this.leftContainer.children[i]);
                // 隐藏所有左侧框的选中效果
                const selectEffect = this.leftContainer.children[i].getChildByName('选中效果');
                if (selectEffect) {
                    selectEffect.active = false;
                }
            }
        }

        for (let i = 0; i < 8; i++) {
            if (this.rightContainer.children[i]) {
                this.rightItems.push(this.rightContainer.children[i]);
                // 给右侧框添加点击事件
                this.rightItems[i].on(Node.EventType.TOUCH_END, () => this.onRightItemClick(i), this);
            }
        }

        // 初始化血量
        for (let i = 0; i < this.maxHp; i++) {
            if (this.hpContainer.children[i]) {
                this.hpNodes.push(this.hpContainer.children[i]);
                // 初始化血量显示：爱心显示，爱心灰隐藏
                const heartGray = this.hpContainer.children[i].getChildByName('爱心灰');
                const heart = this.hpContainer.children[i].getChildByName('爱心');
                if (heartGray) heartGray.active = false;
                if (heart) heart.active = true;
            }
        }

        // 初始化人物为正常状态
        if (this.character && this.characterNormal) {
            const characterSprite = this.character.getComponent(Sprite);
            if (characterSprite) {
                characterSprite.spriteFrame = this.characterNormal;
            }
        }

        // 隐藏面板
        if (this.winPanel) this.winPanel.active = false;
        if (this.losePanel) this.losePanel.active = false;
        if (this.countdownPanel) this.countdownPanel.active = false;

        // 开始第一关（但不立即显示选中效果，等倒计时）
        this.startLevel(1);
    }

    startLevel(level: number) {
        this.currentLevel = level;
        // this.currentHp = this.maxHp;
        this.currentSelectIndex = 0;
        this.isWaiting = false;

        // 更新关卡显示
        if (this.levelLabel) {
            this.levelLabel.string = `${level}/5`;
        }

        // 更新血量显示
        this.updateHpDisplay();

        // 随机选择4张图片
        this.selectRandomImages();

        // 设置右侧框的图片
        this.setupRightItems();

        // 打乱并设置左侧框的图片
        this.setupLeftItems();

        // 不在这里开始选中，等倒计时结束后再开始
        // 如果是第一关，会在 showCountdown 后调用 startGameplay
        // 如果是后续关卡，直接开始
        if (level > 1) {
            this.scheduleOnce(() => {
                this.showSelectFrame();
            }, 0.5);
        }
    }

    selectRandomImages() {
        this.selectedPairs = [];
        const indices = [];

        // 从17组图片音频中随机选4组
        while (indices.length < 4) {
            const randomIndex = Math.floor(Math.random() * this.imageAudioPairs.length);
            if (!indices.includes(randomIndex)) {
                indices.push(randomIndex);
                this.selectedPairs.push(this.imageAudioPairs[randomIndex]);
            }
        }
    }

    setupRightItems() {
        // 每张图片两份，共8张
        this.rightImageOrder = [0, 0, 1, 1, 2, 2, 3, 3];

        // 打乱顺序
        for (let i = this.rightImageOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.rightImageOrder[i], this.rightImageOrder[j]] = [this.rightImageOrder[j], this.rightImageOrder[i]];
        }

        // 设置右侧框的图片
        for (let i = 0; i < 8; i++) {
            // 先尝试查找"图片"子节点
            let imageNode = this.rightItems[i].getChildByName('图片');

            // 如果没有"图片"节点，直接使用当前节点
            if (!imageNode) {
                imageNode = this.rightItems[i];
            }

            const sprite = imageNode.getComponent(Sprite);
            if (sprite && this.selectedPairs[this.rightImageOrder[i]]) {
                sprite.spriteFrame = this.selectedPairs[this.rightImageOrder[i]].image;
            }
        }
    }

    setupLeftItems() {
        // 每张图片两份，共8张
        this.leftImageOrder = [0, 0, 1, 1, 2, 2, 3, 3];

        // 打乱顺序
        for (let i = this.leftImageOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.leftImageOrder[i], this.leftImageOrder[j]] = [this.leftImageOrder[j], this.leftImageOrder[i]];
        }

        // 设置左侧框的图片
        for (let i = 0; i < 8; i++) {
            // 查找"图片"子节点
            const imageNode = this.leftItems[i].getChildByName('图片');
            if (imageNode) {
                const sprite = imageNode.getComponent(Sprite);
                if (sprite && this.selectedPairs[this.leftImageOrder[i]]) {
                    sprite.spriteFrame = this.selectedPairs[this.leftImageOrder[i]].image;
                }
                // 设置左侧图片缩放为1.5倍
                imageNode.setScale(1.5, 1.5, 1);
            }
        }
    }

    showSelectFrame() {
        if (this.currentSelectIndex >= 8) {
            // 本关完成
            this.onLevelComplete();
            return;
        }

        // 隐藏所有选中效果
        for (let i = 0; i < this.leftItems.length; i++) {
            const selectEffect = this.leftItems[i].getChildByName('选中效果');
            if (selectEffect) {
                selectEffect.active = false;
            }
        }

        // 显示当前框的选中效果
        const currentSelectEffect = this.leftItems[this.currentSelectIndex].getChildByName('选中效果');
        if (currentSelectEffect) {
            currentSelectEffect.active = true;
        }

        this.isWaiting = true;

        // 2秒后自动判定为失败
        this.scheduleOnce(() => {
            if (this.isWaiting) {
                this.onWrongAnswer();
            }
        }, 2);
    }

    onRightItemClick(index: number) {
        if (!this.isWaiting) return;

        const correctIndex = this.leftImageOrder[this.currentSelectIndex];
        const clickedIndex = this.rightImageOrder[index];

        if (clickedIndex === correctIndex) {
            // 回答正确
            this.onCorrectAnswer();
        } else {
            // 回答错误
            this.onWrongAnswer();
        }
    }

    onCorrectAnswer() {
        this.isWaiting = false;
        this.unscheduleAllCallbacks();

        // 播放对应图片的音频
        const correctIndex = this.leftImageOrder[this.currentSelectIndex];
        if (this.audioSource && this.selectedPairs[correctIndex] && this.selectedPairs[correctIndex].audio) {
            this.audioSource.clip = this.selectedPairs[correctIndex].audio;
            this.audioSource.play();
        }

        // 人物变成开心状态
        if (this.character && this.characterHappy && this.characterNormal) {
            const characterSprite = this.character.getComponent(Sprite);
            if (characterSprite) {
                // 切换到开心图片
                characterSprite.spriteFrame = this.characterHappy;
                
                // 0.5秒后恢复正常
                this.scheduleOnce(() => {
                    if (characterSprite) {
                        characterSprite.spriteFrame = this.characterNormal;
                    }
                }, 0.5);
            }
        }

        // 播放正确动画（可以添加缩放或闪烁效果）
        this.playCorrectAnimation();

        // 延迟后移动到下一个
        this.scheduleOnce(() => {
            this.currentSelectIndex++;
            this.showSelectFrame();
        }, 0.5);
    }

    onWrongAnswer() {
        this.isWaiting = false;
        this.unscheduleAllCallbacks();

        // 播放错误音效（如果有）
        if (this.audioSource && this.wrongAudio) {
            this.audioSource.clip = this.wrongAudio;
            this.audioSource.play();
        }

        // 扣血
        this.currentHp--;
        this.updateHpDisplay();

        // 播放受伤动画
        this.playHurtAnimation();

        // 检查是否死亡
        if (this.currentHp <= 0) {
            this.scheduleOnce(() => {
                this.onGameOver();
            }, 1);
        } else {
            // 延迟后移动到下一个
            this.scheduleOnce(() => {
                this.currentSelectIndex++;
                this.showSelectFrame();
            }, 1);
        }
    }

    updateHpDisplay() {
        for (let i = 0; i < this.hpNodes.length; i++) {
            const heartGray = this.hpNodes[i].getChildByName('爱心灰');
            const heart = this.hpNodes[i].getChildByName('爱心');

            if (i < this.currentHp) {
                // 有血：显示爱心，隐藏爱心灰
                if (heartGray) heartGray.active = false;
                if (heart) heart.active = true;
            } else {
                // 没血：隐藏爱心，显示爱心灰
                if (heartGray) heartGray.active = true;
                if (heart) heart.active = false;
            }
        }
    }

    playCorrectAnimation() {
        const currentItem = this.leftItems[this.currentSelectIndex];
        // 查找图片节点进行动画
        const imageNode = currentItem.getChildByName('图片');
        const targetNode = imageNode || currentItem;

        tween(targetNode)
            .to(0.1, { scale: new Vec3(1.2, 1.2, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    playHurtAnimation() {
        // 人物受伤动画：切换到受伤图片，1秒后恢复
        if (this.character && this.characterHurt && this.characterNormal) {
            const characterSprite = this.character.getComponent(Sprite);
            if (characterSprite) {
                // 切换到受伤图片
                characterSprite.spriteFrame = this.characterHurt;

                // 1秒后恢复正常
                this.scheduleOnce(() => {
                    if (characterSprite) {
                        characterSprite.spriteFrame = this.characterNormal;
                    }
                }, 1);
            }
        }

        // 左侧当前框闪红效果（可选）
        const currentItem = this.leftItems[this.currentSelectIndex];
        const imageNode = currentItem.getChildByName('图片');
        const targetNode = imageNode || currentItem;
        const sprite = targetNode.getComponent(Sprite);

        if (sprite) {
            const originalColor = sprite.color.clone();
            tween(sprite)
                .to(0.1, { color: new Color(255, 0, 0, 255) })
                .to(0.1, { color: originalColor })
                .to(0.1, { color: new Color(255, 0, 0, 255) })
                .to(0.1, { color: originalColor })
                .start();
        }
    }

    onLevelComplete() {
        // 隐藏所有选中效果
        for (let i = 0; i < this.leftItems.length; i++) {
            const selectEffect = this.leftItems[i].getChildByName('选中效果');
            if (selectEffect) {
                selectEffect.active = false;
            }
        }

        // 每关完成后都显示胜利面板
        this.scheduleOnce(() => {
            this.showWinPanel();
            ProjectEventManager.emit(ProjectEvent.游戏结束, "节奏大王");
        }, 1);
    }

    onGameOver() {
        // 隐藏所有选中效果
        for (let i = 0; i < this.leftItems.length; i++) {
            const selectEffect = this.leftItems[i].getChildByName('选中效果');
            if (selectEffect) {
                selectEffect.active = false;
            }
        }
        this.showLosePanel();
    }

    showWinPanel() {
        if (this.winPanel) {
            this.winPanel.active = true;

            // 根据当前关卡显示不同的按钮
            if (this.currentLevel >= this.maxLevel) {
                // 第5关：显示重新开始按钮，隐藏下一关按钮
                if (this.nextLevelButton) this.nextLevelButton.active = false;
                if (this.restartButton) this.restartButton.active = true;
            } else {
                // 1-4关：显示下一关按钮，隐藏重新开始按钮
                if (this.nextLevelButton) this.nextLevelButton.active = true;
                if (this.restartButton) this.restartButton.active = false;
            }
        }
    }

    showLosePanel() {
        if (this.losePanel) {
            this.losePanel.active = true;
            ProjectEventManager.emit(ProjectEvent.游戏结束, "节奏大王");
        }
    }

    // 按钮回调
    onNextLevelClick() {
        if (this.winPanel) this.winPanel.active = false;
        
        // 清理所有定时器
        this.unscheduleAllCallbacks();
        
        // 重置选中索引
        this.currentSelectIndex = 0;
        this.isWaiting = false;
        
        // 隐藏所有选中效果
        for (let i = 0; i < this.leftItems.length; i++) {
            const selectEffect = this.leftItems[i].getChildByName('选中效果');
            if (selectEffect) {
                selectEffect.active = false;
            }
        }
        
        // 重置人物为正常状态
        if (this.character && this.characterNormal) {
            const characterSprite = this.character.getComponent(Sprite);
            if (characterSprite) {
                characterSprite.spriteFrame = this.characterNormal;
            }
        }
        
        // 进入下一关
        this.startLevel(this.currentLevel + 1);
        
        // 直接开始游戏（不显示倒计时）
        this.scheduleOnce(() => {
            this.showSelectFrame();
        }, 0.5);
    }

    onRestartClick() {
        if (this.winPanel) this.winPanel.active = false;
        if (this.losePanel) this.losePanel.active = false;
        
        // 清理所有定时器
        this.unscheduleAllCallbacks();
        
        // 重置游戏状态
        this.currentLevel = 1;
        this.currentHp = this.maxHp;
        this.currentSelectIndex = 0;
        this.isWaiting = false;
        
        // 隐藏所有选中效果
        for (let i = 0; i < this.leftItems.length; i++) {
            const selectEffect = this.leftItems[i].getChildByName('选中效果');
            if (selectEffect) {
                selectEffect.active = false;
            }
        }
        
        // 重置人物为正常状态
        if (this.character && this.characterNormal) {
            const characterSprite = this.character.getComponent(Sprite);
            if (characterSprite) {
                characterSprite.spriteFrame = this.characterNormal;
            }
        }
        
        // 确保背景音乐继续播放
        if (this.bgMusic && this.bgAudioSource && !this.bgAudioSource.playing) {
            this.bgAudioSource.clip = this.bgMusic;
            this.bgAudioSource.loop = true;
            this.bgAudioSource.play();
        }
        
        // 开始第一关
        this.startLevel(1);
        
        // 如果配置了倒计时面板，显示倒计时
        if (this.countdownPanel) {
            this.showCountdown();
        } else {
            // 没有配置倒计时，直接开始游戏
            this.startGameplay();
        }
    }

    onBackClick() {
        // console.error( GameManager.StartScene
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "节奏大王");
            });
        });
    }

    // onDestroy() {
    //     // 清理定时器
    //     this.unscheduleAllCallbacks();

    //     // 移除右侧框的点击事件
    //     for (let i = 0; i < this.rightItems.length; i++) {
    //         if (this.rightItems[i]) {
    //             this.rightItems[i].off(Node.EventType.TOUCH_END);
    //         }
    //     }

    //     // 隐藏所有选中效果
    //     for (let i = 0; i < this.leftItems.length; i++) {
    //         const selectEffect = this.leftItems[i].getChildByName('选中效果');
    //         if (selectEffect) {
    //             selectEffect.active = false;
    //         }
    //     }
    // }
}
