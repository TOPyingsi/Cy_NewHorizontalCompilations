import { _decorator, Component,Node, Label, Tween, tween, Vec3, UITransform, EventTouch, find, Animation, UIOpacity, Prefab } from 'cc';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

// 引导步骤配置接口
interface TutorialStep {
    title: string;               // 步骤标题
    content: string;             // 对话内容
    before?: () => void; // 显示前调用方法
    after?: () => void;  // 显示后调用方法
}

// 箭头配置接口
interface ArrowConfig {
    step: number;                // 步骤序号
    show: boolean;               // 是否显示箭头
    position: Vec3;              // 世界坐标位置
}

@ccclass('EMLHJ_TutorialPanel')
export class EMLHJ_TutorialPanel extends Component {
    @property(Node)
    btnBack: Node = null;         // 跳过按钮

    @property(Node)
    dialogPanel: Node = null;     // 对话面板

    @property(Label)
    titleLabel: Label = null;     // 标题标签

    @property(Label)
    contentLabel: Label = null;   // 内容标签

    @property(Node)
    nextButton: Node = null;      // 下一步按钮

    @property(Node)
    arrowContainer: Node = null;  // 箭头容器节点

    @property(Node)
    arrowPrefab: Node = null;     // 箭头预制体

    private currentStep: number = 0;
    private isTyping: boolean = false;
    private isCompleted: boolean = false;
    private tutorialSteps: TutorialStep[] = [];
    private arrowConfigs: ArrowConfig[] = [];
    private currentArrow: Node = null;
    private isAddedEvent: boolean = false;


    data:TutorialStep[] = [
        {
            title: "步骤1",
            content: "欢迎！听说你喜欢赌两把！",
        },
        {
            title: "步骤2",
              content: "不必惊慌！在此畅玩，忘却外界纷扰！",
        },
        {
            title: "步骤3",
              content: "现在我来讲解此地的规则，我只说一遍，听仔细了！",
        },
        {
            title: "步骤4",
              content: "这是你存放金币的地方",

              
        },
                {
            title: "步骤5",
              content: "这是你的剩余轮次、债务和存款。",
                            before: () => {
                EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_ATM_PANEL)
              }
        },
        {
            title: "步骤6",
              content: "若未能在指定轮次内存入足够硬币 Φ... 哼，你很快就会知道后果"
        },
                {
            title: "步骤7",
              content: "每轮结束根据存入的钱币,获得利息。多存多得！",

        },
                {
            title: "步骤8",
              content: "...... 现在！老虎机！！！由你决定每轮次进行多少次旋转！",
                          before: () => {
                EventManager.Scene.emit(EMLHJ_GameEvents.UI_HIDE_ATM_PANEL)
              }
        },
                {
            title: "步骤9",
              content: "点击这里可开始旋转。"
        },{
            title: "步骤10",
              content: "每轮次结束时，还将获得三叶草券，特定条件下，可获得更多。"
        },{
            title: "步骤11",
              content: "这是商城。"
        },
        {
            title: "步骤12",
              content: "用三叶草券购买幸运道具，幸运值越高，中奖几率越高，生存几率越高！。",
              before: () => {
                EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_SHOP_PANEL)
              },
       
        },
        {
            title: "步骤13",
              content: "这是老虎机的符号信息，可以查看符号的价值和概率",
                     before: () => {
                EventManager.Scene.emit(EMLHJ_GameEvents.UI_HIDE_SHOP_PANEL)
              }
        },
                {
            title: "步骤14",
              content: "这是老虎机的奖项，不同奖项获得的金币倍率不同"
        },
                {
            title: "步骤15",
              content: "现在，开始轮次吧！"
        },
    ]

        // 逐字显示文本
        private typeTextIndex: number = 0;
        private typeTextContent: string = "";
        private typeTextCallback: Function = null;
        private typeTextSpeed: number = 50;
        // private isTyping: boolean = false;

     

    protected start(): void {
        this.initUI();
    }

    // 初始化UI
    initUI() {
        if (!this.isAddedEvent) {
            this.registerEvents();
            this.isAddedEvent = true;
        }
        
        // 初始隐藏面板
        this.node.active = false;
        this.dialogPanel.active = false;
        this.startTutorial()
    }

    // 开始引导教程
    startTutorial() {
        this.tutorialSteps = this.data;
        this.currentStep = 0;
        this.isCompleted = false;
        
        // 解析箭头配置
        this.parseArrowConfigs();
        
        // 显示面板
        this.node.active = true;
        this.dialogPanel.active = true;
        
        // 播放面板显示动画
        this.playPanelEnterAnimation();
        
        // 开始第一步
        this.showStep(this.currentStep);
    }

    // 解析箭头配置
    private parseArrowConfigs() {
        this.arrowConfigs = [];
        
        if (!this.arrowContainer) return;
        
        // 遍历容器下的所有子节点
        for (let i = 0; i < this.arrowContainer.children.length; i++) {
            const child = this.arrowContainer.children[i];
            const name = child.name;
            
            // 检查是否符合命名格式 (数字_数字)
            const match = name.match(/^(\d+)_(\d+)$/);
            if (match) {
                const step = parseInt(match[1]);
                const show = parseInt(match[2]) === 1;
                
                // 获取世界坐标
                const worldPos = child.getWorldPosition();
                
                this.arrowConfigs.push({
                    step,
                    show,
                    position: worldPos
                });
            }
        }
    }

    
    // 显示指定步骤
    private showStep(stepIndex: number) {
        if (stepIndex >= this.tutorialSteps.length) {
            // 所有步骤完成
            this.completeTutorial();
            return;
        }

        this.currentStep = stepIndex;
        const step = this.tutorialSteps[stepIndex];
        
        // 更新标题
        this.titleLabel.string = step.title;
        
        // 清空内容
        this.contentLabel.string = "";
        
        // 禁用下一步按钮直到打字完成
        this.nextButton.active = false;
        
        // 显示对应箭头
        this.updateArrow(stepIndex + 1); // 步骤从1开始
        
        // 执行显示前的方法
        if (step.before && typeof step.before === 'function') {
            try {
                step.before();
            } catch (e) {
                console.error(`步骤 ${stepIndex + 1} 显示前方法执行失败:`, e);
            }
        }
        
        // 逐字显示内容，传入回调
        this.typeText(step.content, 50, () => {
            // 执行显示后的方法
            if (step.after && typeof step.after === 'function') {
                try {
                    step.after();
                } catch (e) {
                    console.error(`步骤 ${stepIndex + 1} 显示后方法执行失败:`, e);
                }
            }
        });
    }

   private typeText(text: string, speed: number = 50, callback: Function = null) {
            this.typeTextIndex = 0;
            this.typeTextContent = text;
            this.typeTextCallback = callback;
            this.typeTextSpeed = speed;
            this.contentLabel.string = "";
            this.isTyping = true;
            // 启用下一步按钮（因为update中会控制）
            this.nextButton.active = false;
        }

        update(deltaTime: number) {
            if (this.isTyping && this.typeTextIndex < this.typeTextContent.length) {
                // 计算本次更新应该显示的字符数
                let charsToShow = Math.floor(deltaTime * 1000 / this.typeTextSpeed);
                charsToShow = Math.max(1, charsToShow);

                let endIndex = this.typeTextIndex + charsToShow;
                if (endIndex > this.typeTextContent.length) {
                    endIndex = this.typeTextContent.length;
                }

                this.contentLabel.string += this.typeTextContent.substring(this.typeTextIndex, endIndex);
                this.typeTextIndex = endIndex;

                if (this.typeTextIndex >= this.typeTextContent.length) {
                    this.isTyping = false;
                    // 启用下一步按钮
                    this.nextButton.active = true;
                    if (this.typeTextCallback) {
                        this.typeTextCallback();
                    }
                }
            }
        }

    // 更新箭头显示
    private updateArrow(step: number) {
        this.arrowContainer.children.forEach(child => {
            child.active = false;
            let step2 = parseInt(child.name.split("_")[0]);
            if(step2 == step){
                child.active= true;
            }
        })
        // // 移除当前箭头
        // if (this.currentArrow) {
        //     this.currentArrow.destroy();
        //     this.currentArrow = null;
        // }
        
        // // 查找当前步骤的箭头配置
        // const arrowConfig = this.arrowConfigs.find(config => config.step === step);
        // if (arrowConfig && arrowConfig.show && this.arrowPrefab) {
        //     // 创建新箭头
        //     this.currentArrow = instantiate(this.arrowPrefab);
        //     this.arrowContainer.addChild(this.currentArrow);
            
        //     // 设置位置
        //     this.currentArrow.setWorldPosition(arrowConfig.position);
            
        //     // 播放箭头动画
        //     const anim = this.currentArrow.getComponent(Animation);
        //     if (anim) {
        //         anim.play();
        //     } else {
        //         // 如果没有动画组件，添加简单的缩放动画
        //         this.playArrowAnimation();
        //     }
        // }
    }

    // 箭头动画
    private playArrowAnimation() {
        if (!this.currentArrow) return;
        
        const originalScale = this.currentArrow.scale.clone();
        tween(this.currentArrow)
            .repeatForever(
                tween()
                    .to(0.5, { scale: new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z * 1.2) })
                    .to(0.5, { scale: originalScale })
            )
            .start();
    }

    // 面板进入动画
    private playPanelEnterAnimation() {
        this.dialogPanel.scale.set(1, 1, 1);
        this.dialogPanel.getComponent(UIOpacity).opacity = 0;
        
        tween(this.dialogPanel.getComponent(UIOpacity))
            .to(0.3, { opacity: 255 }, { easing: 'backOut' })
            .start();
    }

    // 完成引导教程
    private completeTutorial() {
        this.isCompleted = true;
        EventManager.Scene.emit(EMLHJ_GameEvents.UI_HIDE_ALL_SCREENS)
        
        // 播放面板退出动画
        tween(this.dialogPanel.getComponent(UIOpacity))
            .to(0.3, { opacity: 0 })
            .call(() => {
                this.node.active = false;
                // 移除箭头
                if (this.currentArrow) {
                    this.currentArrow.destroy();
                    this.currentArrow = null;
                }
            })
            .start();
    }

    // 下一步
    private onNextStep() {
        if (this.isTyping || this.isCompleted) return;
        
        // 播放切换动画
        tween(this.dialogPanel)
            .to(0.1, { scale: new Vec3(0.95, 0.95, 1) })
            .call(() => {
                this.showStep(this.currentStep + 1);
            })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();
    }

    // 跳过引导
    onBtnBackClick() {
        this.completeTutorial();
    }

    // 注册事件监听
    registerEvents() {
        this.btnBack.on("click", this.onBtnBackClick, this);
        this.nextButton.on("click", this.onNextStep, this);
    }

    // 注销事件监听
    unregisterEvents() {
        // this.btnBack.off("click", this.onBtnBackClick, this);
        // this.nextButton.off("click", this.onNextStep, this);
    }

    // 组件销毁时
    onDestroy() {
        this.unregisterEvents();
        this.isAddedEvent = false;
    }
}

// 辅助函数：实例化节点（Cocos Creator 中常用）
function instantiate<T extends Node>(original: T): T {
    if (!original) return null;
    const node = new Node(original.name);
    const parent = original.parent;
    if (parent) {
        parent.addChild(node);
    }
    
    // 复制组件和属性（简化版）
    const components = original.getComponents(Component);
    for (const comp of components) {
        const newComp = node.addComponent(comp.constructor as any);
        // 这里可以根据需要复制组件属性
    }
    
    return node as T;
}
