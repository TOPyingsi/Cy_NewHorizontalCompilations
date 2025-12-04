import { _decorator, Component, Sprite, SpriteFrame, resources, ImageAsset, UITransform, tween, UIOpacity, Node, Label, AssetManager, assetManager, JsonAsset } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

// 对话数据结构
interface LBL_DialogData {
    iconID: number;
    content: string;
}

// 帧数据结构
interface LBL_FrameData {
    dialogs: LBL_DialogData[];
}

// 动画配置结构
interface LBL_AnimationConfig {
    frameCount: number;
    frames: LBL_FrameData[];
}

// 关卡配置结构
export interface LBL_LevelComicConfig {
    level: number;
    start: LBL_AnimationConfig;
    end: LBL_AnimationConfig;
    death: LBL_AnimationConfig;
}

// 动画类型枚举
enum LBL_AnimationType {
    START = "start",
    END = "end",
    DEATH = "death"
}

// 新增：自定义Bundle加载请求类型（适配Bundle.load返回值，包含唯一标识便于查找）
interface LBL_BundleLoadTask {
  path: string; // 资源路径（唯一标识，用于查找和去重）
//   task: any; // 存储Bundle.load返回的原始请求对象（保留以备后续扩展）
}

@ccclass('LBL_ComicController')
export class LBL_ComicController extends Component {
    @property({ type: Node} )
    comicPanel: Node = null;

    @property({ type: Node, tooltip: "带有Sprite组件的幻灯片节点" })
    comicNode: Node = null;

    @property({ type: Node, tooltip: "黑色全屏背景节点" })
    backgroundNode: Node = null;

    @property({ type: Node, tooltip: "对话框节点" })
    dialogNode: Node = null;

    @property({ type: Node, tooltip: "对话头像子节点" })
    avatarNode: Node = null;

    @property({ type: Node, tooltip: "对话内容子节点" })
    contentNode: Node = null;

    @property({ type: SpriteFrame, tooltip: "头像SpriteFrame数组" })
    avatarSprites: SpriteFrame[] = [];

    @property(Node)
    darkMask:Node;

    @property({ type: Node} )
    skipButton: Node = null;

    @property(JsonAsset)
    public comicData:JsonAsset[] = [];

    currentType:LBL_AnimationType = null;

    // 私有变量
    private currentLevel: number = 0;
    private levelConfig: LBL_LevelComicConfig = null;
    private currentAnimationType: LBL_AnimationType = null;
    private currentFrameIndex: number = 0;
    private currentDialogIndex: number = 0;
    private isPlaying: boolean = false;
    private loadRequests: LBL_BundleLoadTask[] = [];
    private frameSprites: {[key: number]: SpriteFrame} = {};
    private animationCallback: Function = null;
    private dialogTimer: number = 0;
    private frameTimer: number = 0;

    // 组件引用缓存
    private comicSprite: Sprite = null;
    private avatarSprite: Sprite = null;
    private contentLabel: Label = null;
    private comicOpacity: UIOpacity = null;
    private backgroundOpacity: UIOpacity = null;

    private boundDialogTimer: Function = null;
    private boundFrameTimer: Function = null;

     // 新增：回调取消开关，控制已发起请求的回调是否执行
    private isAbortLoadCallback: boolean = false;

    private levelConfigs:LBL_LevelComicConfig[] = [];


    protected onLoad(): void {

       
        // 获取组件引用
        this.comicSprite = this.comicNode.getComponent(Sprite);
        this.avatarSprite = this.avatarNode.getComponent(Sprite);
        this.contentLabel = this.contentNode.getComponent(Label);
        this.comicOpacity = this.comicNode.getComponent(UIOpacity);
        this.backgroundOpacity = this.backgroundNode.getComponent(UIOpacity);

        // 初始化状态
        this.comicNode.active = false;
        this.backgroundNode.active = false;
        this.dialogNode.active = false;
        this.loadRequests = [];
        
        let levelConfigs:LBL_LevelComicConfig[] = [];
        this.comicData.forEach((item)=>{
            levelConfigs.push(item.json as LBL_LevelComicConfig);
        });

        this.initData(levelConfigs);
    }

 /**
     * 初始化接口
     * @param level 关卡数
     * @param callback 初始化完成回调
     */
    public initData( levelConfigs:LBL_LevelComicConfig[]): void {
    this.levelConfigs = levelConfigs;
        
        // 遍历所有关卡配置
        for (const config of levelConfigs) {
            const level = config.level;
            console.log("漫画配置:", config);
            this.levelConfig = config;
            
            // 预加载三种动画的第一帧
            const preloadFrames = async () => {
                try {
                    await Promise.all([
                        this.loadFrame(level, LBL_AnimationType.START, 1, true),
                        this.loadFrame(level, LBL_AnimationType.END, 1, true),
                        this.loadFrame(level, LBL_AnimationType.DEATH, 1, true)
                    ]);
                    console.log(`关卡${level}漫画控制器初始化完成`);
                } catch (error) {
                    console.error(`预加载第一帧失败:`, error);
                }
            };
            
            preloadFrames();
        }
        // });
    }


    /**
     * 初始化接口
     * @param level 关卡数
     * @param callback 初始化完成回调
     */
    public init(level: number, callback?: Function): void {
        this.currentLevel = level;
        
        
        // 加载配置文件
        // 2. 发起Bundle加载请求，存储自定义任务到数组
        const bundle = BundleManager.GetBundle("40_LBL_Bundle");
        bundle.load(`Data/comic_config_level_${level}`, (err, config: any) => {
            if (err) {
                console.error(`加载关卡${level}漫画配置失败:`, err);
                callback?.();
                return;
            }

            console.log("漫画配置:", config.json);
            this.levelConfig = config.json;
            
            // 预加载三种动画的第一帧
            const preloadFrames = async () => {
                try {
                    await Promise.all([
                        this.loadFrame(1, LBL_AnimationType.START, 1, true),
                        this.loadFrame(level, LBL_AnimationType.END, 1, true),
                        this.loadFrame(level, LBL_AnimationType.DEATH, 1, true)
                    ]);
                    console.log(`关卡${level}漫画控制器初始化完成`);
                    callback?.();
                } catch (error) {
                    console.error(`预加载第一帧失败:`, error);
                    callback?.();
                }
            };

            preloadFrames();
        });
    }

    /**
     * 播放开场动画
     * @param level 关卡数
     * @param callback 动画播放完成回调
     */
    public playStartAnimation(level: number, callback: Function): void {

        this.initPanel();
        this.darkMask.active = true;
        this.playAnimation(level, LBL_AnimationType.START, callback);
    }

    /**
     * 播放结局动画
     * @param level 关卡数
     * @param callback 动画播放完成回调
     */
    public playEndAnimation(level: number, callback: Function): void {
        this.initPanel();
        this.playAnimation(level, LBL_AnimationType.END, callback,true);
    }

    /**
     * 播放死亡动画
     * @param level 关卡数
     * @param callback 动画播放完成回调
     */
    public playDeathAnimation(level: number, callback: Function): void {
        this.initPanel();
        this.playAnimation(level, LBL_AnimationType.DEATH, callback,true);
    }

    private initPanel(){
        // 隐藏节点并设置初始透明度
        this.comicPanel.active = true;
        this.comicNode.active = true;
        this.comicOpacity.opacity = 0;
        this.backgroundNode.active = true;
        this.backgroundOpacity.opacity = 0;
        this.dialogNode.active = false;

    }

    /**
     * 跳过当前动画
     */
    public skipAnimation(): void {
        if (!this.isPlaying) return;

        // 1. 停止所有定时器
        this.unscheduleAllCallbacks();

        // 2. 关键：标记回调取消，已发起的请求会在回调中被过滤
        this.isAbortLoadCallback = true;
        // 清空请求数组（避免残留未完成任务，不影响已发起的加载，仅标记回调无效）
        this.loadRequests = [];

        // 3. 淡出动画逻辑不变
        this.isPlaying = false;

        if(this.currentAnimationType == LBL_AnimationType.DEATH ||this.currentAnimationType == LBL_AnimationType.END ){
              this.comicNode.active = false;
            this.backgroundNode.active = false;
            this.dialogNode.active = false;
            this.comicPanel.active = false;
            this.animationCallback?.();
            this.darkMask.active = false;
            this.animationCallback = null;
            // 重置回调开关，避免影响后续新动画加载
            this.isAbortLoadCallback = false;
            // 释放资源
            this.releaseAnimationResources();
        }
        else{
             tween(this.comicOpacity)
            .to(0.3, { opacity: 0 })
            .call(() => {
            this.comicNode.active = false;
            })
            .start();

        tween(this.backgroundOpacity)
            .to(0.3, { opacity: 0 })
            .call(() => {
            this.backgroundNode.active = false;
            this.dialogNode.active = false;
            this.comicPanel.active = false;
            this.animationCallback?.();
              this.darkMask.active = false;
            this.animationCallback = null;
            // 重置回调开关，避免影响后续新动画加载
            this.isAbortLoadCallback = false;
            // 释放资源
            this.releaseAnimationResources();
            })
            .start();
        }
    }

    /**
     * 播放动画的通用方法
     */
    private async playAnimation(level: number, type: LBL_AnimationType, callback: Function,needMask:boolean = false): Promise<void> {
        this.skipButton.on(Node.EventType.TOUCH_END, this.skipAnimation, this);
        // 如果正在播放，先停止
        if (this.isPlaying) {
            this.skipAnimation();
        }
        if(type == LBL_AnimationType.DEATH || type == LBL_AnimationType.START){
            level = 1;  
        }

        this.levelConfig = this.levelConfigs.find(config => config.level === level);

        // 关键：初始化回调开关为false，确保当前动画的加载回调正常执行
        this.isAbortLoadCallback = false;
        this.isPlaying = true;
        this.currentAnimationType = type;
        this.currentFrameIndex = 1;
        this.currentDialogIndex = 0;
        this.animationCallback = callback;
        this.loadRequests = []; // 清空历史请求，避免影响当前动画


        // // 隐藏节点并设置初始透明度
        // this.comicNode.active = true;
        // this.comicOpacity.opacity = 0;
        // this.backgroundNode.active = true;
        // this.backgroundOpacity.opacity = 0;
        // this.dialogNode.active = false;

        // 获取当前动画配置
        const animationConfig = this.levelConfig ? this.levelConfig[type] : null;
        if (!animationConfig) {
            console.error(`未找到关卡${level}的${type}动画配置`);
            this.finishAnimation();
            return;
        }

        // 加载第一帧（如果需要）
        if (level !== this.currentLevel || !this.frameSprites[this.getFrameKey(level, type, 1)]) {
            try {
                await this.loadFrame(level, type, 1, true);
            } catch (error) {
                console.error(`加载第一帧失败:`, error);
                this.finishAnimation();
                return;
            }
        }

        // 设置第一帧图片
        const firstFrameKey = this.getFrameKey(level, type, 1);
        this.comicSprite.spriteFrame = this.frameSprites[firstFrameKey];






        if(needMask){
        // 背景淡入
        tween(this.backgroundOpacity)
            .to(0.5, { opacity: 255 })
            .start();

        // 幻灯片淡入
        tween(this.comicOpacity)
            .to(0.5, { opacity: 255 })
            .call(() => {
                this.processCurrentFrame(level, animationConfig);
            })
            .start();
        }
        else{
            this.backgroundOpacity.opacity = 255;
                    this.comicOpacity.opacity = 255;
                    this.processCurrentFrame(level, animationConfig);
        }


         




        // // 背景淡入
        // tween(this.backgroundOpacity)
        //     .to(0.5, { opacity: 255 })
        //     .start();

        // // 幻灯片淡入
        // tween(this.comicOpacity)
        //     .to(0.5, { opacity: 255 })
        //     .call(() => {
        //         this.processCurrentFrame(level, animationConfig);
        //     })
        //     .start();
    }

   /**
     * 处理当前帧的显示和对话
     */
    private processCurrentFrame(level: number, animationConfig: LBL_AnimationConfig): void {
        const frameData = animationConfig.frames[this.currentFrameIndex - 1];
        if (!frameData) {
            console.error(`未找到第${this.currentFrameIndex}帧的数据`);
            this.nextFrame(level, animationConfig);
            return;
        }

        // 处理对话（带参数传递+可取消定时器）
        if (frameData.dialogs.length > 0) {
            this.dialogNode.active = true;
            this.showCurrentDialog(frameData.dialogs);
            
            // 1. 先取消之前残留的对话定时器（用绑定函数引用匹配）
            if (this.boundDialogTimer) {
                this.unschedule(this.boundDialogTimer);
                this.boundDialogTimer = null;
            }
            // 2. 绑定当前帧的level和animationConfig参数，生成新函数引用
            this.boundDialogTimer = this.onDialogTimer.bind(this, level, animationConfig);
            // 3. 注册定时器：间隔2秒，循环次数=对话数-1，初始延迟0秒（修正原2秒延迟导致第一句对话延迟）
            this.schedule(this.boundDialogTimer, 0.8, frameData.dialogs.length - 1, 0);
        } 
        // 处理无对话（1秒切帧+可取消定时器）
        else {
            this.dialogNode.active = false;
            
            // 1. 先取消之前残留的帧定时器（用绑定函数引用匹配）
            if (this.boundFrameTimer) {
                this.unschedule(this.boundFrameTimer);
                this.boundFrameTimer = null;
            }
            // 2. 绑定当前帧的level和animationConfig参数，生成新函数引用
            this.boundFrameTimer = this.onFrameTimer.bind(this, level, animationConfig);
            // 3. 注册单次定时器（1秒后执行）
            this.scheduleOnce(this.boundFrameTimer, 0.8);
        }

        // 预加载下一帧（逻辑不变）
        if (this.currentFrameIndex < animationConfig.frameCount) {
            this.loadFrame(level, this.currentAnimationType, this.currentFrameIndex + 1)
                .catch(err => console.warn(`预加载第${this.currentFrameIndex + 1}帧失败:`, err));
        }
    }
    /**
     * 显示当前对话
     */
    private showCurrentDialog(dialogs: LBL_DialogData[]): void {
        if (this.currentDialogIndex >= dialogs.length) {
            return;
        }

        const dialog = dialogs[this.currentDialogIndex];
        if(dialog.iconID !== 0){
             // 设置头像（iconID从1开始，数组索引从0开始）
            this.avatarSprite.spriteFrame = this.avatarSprites[dialog.iconID - 1] || this.avatarSprites[0];
            this.avatarSprite.node.active = true;
        }
        else{
            this.avatarSprite.node.active = false;
        }
        // 设置对话内容
        this.contentLabel.string = dialog.content;
       
    }

    /**
     * 对话计时器回调
     */
    private onDialogTimer(level: number, animationConfig: LBL_AnimationConfig): void {
        this.currentDialogIndex++;
        const frameData = animationConfig.frames[this.currentFrameIndex - 1];
        
        if (this.currentDialogIndex < frameData.dialogs.length) {
            this.showCurrentDialog(frameData.dialogs);
        } else {
            // 对话播放完毕，切换到下一帧
            this.nextFrame(level, animationConfig);
        }
    }

    /**
     * 帧计时器回调
     */
    private onFrameTimer(level: number, animationConfig: LBL_AnimationConfig): void {
        this.nextFrame(level, animationConfig);
    }

   /**
     * 切换到下一帧
     */
    private nextFrame(level: number, animationConfig: LBL_AnimationConfig): void {
        // 取消当前帧的定时器并重置引用（避免残留）
        if (this.boundDialogTimer) {
            this.unschedule(this.boundDialogTimer);
            this.boundDialogTimer = null;
        }
        if (this.boundFrameTimer) {
            this.unschedule(this.boundFrameTimer);
            this.boundFrameTimer = null;
        }

        this.currentDialogIndex = 0;
        
        this.currentFrameIndex++;
        if (this.currentFrameIndex > animationConfig.frameCount) {
            // 所有帧播放完毕
            this.finishAnimation();
            return;
        }

        // 设置当前帧图片
        const frameKey = this.getFrameKey(level, this.currentAnimationType, this.currentFrameIndex);
        const frameSprite = this.frameSprites[frameKey];
        
        if (frameSprite) {
            this.comicSprite.spriteFrame = frameSprite;
            this.processCurrentFrame(level, animationConfig);
        } else {
            console.error(`第${this.currentFrameIndex}帧资源未加载`);
            this.finishAnimation();
        }
    }

   /**
     * 完成动画播放
     */
    private finishAnimation(): void {
        this.skipButton.off(Node.EventType.TOUCH_END, this.skipAnimation, this);
        this.darkMask.active = false;
        this.unscheduleAllCallbacks();
        // 重置定时器引用（避免内存泄漏）
        this.boundDialogTimer = null;
        this.boundFrameTimer = null;






        
        this.comicOpacity.opacity = 0;
        this.comicNode.active = false;
        this.backgroundOpacity.opacity = 0;
          this.backgroundNode.active = false;
                this.dialogNode.active = false;
                this.comicPanel.active = false;
                this.isPlaying = false;
                this.animationCallback?.();
                this.animationCallback = null;
                
                // 释放资源（保留第一帧）
                this.releaseAnimationResources(true);


        // // 淡出动画（逻辑不变）
        // tween(this.comicOpacity)
        //     .to(0.3, { opacity: 0 })
        //     .call(() => {
        //         this.comicNode.active = false;
        //     })
        //     .start();

        // tween(this.backgroundOpacity)
        //     .to(0.3, { opacity: 0 })
        //     .call(() => {
        //         this.backgroundNode.active = false;
        //         this.dialogNode.active = false;
        //         this.comicPanel.active = false;
        //         this.isPlaying = false;
        //         this.animationCallback?.();
        //         this.animationCallback = null;
                
        //         // 释放资源（保留第一帧）
        //         this.releaseAnimationResources(true);
        //     })
        //     .start();
    }

   /**
     * 加载指定帧
     */
    private loadFrame(level: number, type: LBL_AnimationType, frameIndex: number, keep: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            const frameKey = this.getFrameKey(level, type, frameIndex);
            const resourcePath = `comics/level_${level}/${type}/${frameIndex}/spriteFrame`;
            const fullPath = "Sprites/" + resourcePath;

            // 1. 先判断：资源已加载或请求已存在，避免重复加载
            if (this.frameSprites[frameKey]) {
                resolve();
                return;
            }
            const existingTask = this.loadRequests.find(task => task.path === fullPath);
            if (existingTask) {
                resolve(); // 已有相同请求，直接返回（避免重复发起）
                return;
            }

            // 2. 发起Bundle加载请求，存储自定义任务到数组
            BundleManager.GetBundle('40_LBL_Bundle').load(fullPath, SpriteFrame, (err, spriteFrame) => {
                    if (err) {
                        return console.error(err);
                    }

                    // 3. 回调过滤：如果已标记取消，直接移除任务并终止回调
                    if (this.isAbortLoadCallback) {
                        this.loadRequests = this.loadRequests.filter(task => task.path !== fullPath);
                        return;
                    }

                    // 4. 正常流程：加载完成后从数组移除任务
                    this.loadRequests = this.loadRequests.filter(task => task.path !== fullPath);

                    // // 5. 处理加载结果
                    // if (err) {
                    //     console.error(`加载图片${fullPath}失败:`, err);
                    //     reject(err);
                    //     return;
                    // }
                    this.frameSprites[frameKey] = spriteFrame;
                    resolve();
                })
                    // bundle.load(fullPath, SpriteFrame, (err, spriteFrame) => {
                    // });
                    // 6. 将自定义任务压入数组（类型匹配，可正常压入和查找）
                this.loadRequests.push({
                path: fullPath,
                // task: rawTask
            });
        });
    }

    
    /**
     * 生成帧的唯一键
     */
    private getFrameKey(level: number, type: LBL_AnimationType, frameIndex: number): string {
        return `${level}_${type}_${frameIndex}`;
    }

    /**
     * 释放动画资源
     */
    private releaseAnimationResources(keepFirstFrame: boolean = false): void {
        if (!this.currentAnimationType || !this.currentLevel) return;
        
        Object.keys(this.frameSprites).forEach(key => {
            const parts = key.split('_');
            if (parts.length >= 3 && parseInt(parts[0]) === this.currentLevel && parts[1] === this.currentAnimationType) {
                const frameIndex = parseInt(parts[2]);
                // 如果需要保留第一帧，并且当前是第一帧，则不释放
                if (keepFirstFrame && frameIndex === 1) return;
                
                // 释放资源
                delete this.frameSprites[key];
            }
        });
    }

    protected onDestroy(): void {
        // 1. 标记所有未完成请求的回调无效
        this.isAbortLoadCallback = true;
        // 2. 清空请求数组，避免内存泄漏
        this.loadRequests = [];
        // 3. 释放其他资源
        this.frameSprites = {};
        this.unscheduleAllCallbacks();
    }
}

// 为了TypeScript能识别Texture2D
declare class Texture2D {
    image: ImageAsset;
    constructor();
}
