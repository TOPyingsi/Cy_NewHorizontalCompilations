import { _decorator, Component,Node, Label, Tween, tween, Vec3, UITransform, EventTouch, find, Animation, UIOpacity, Prefab } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
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

@ccclass('HXTJB_TutorialPanel')
export class HXTJB_TutorialPanel extends Component {
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
            content: "欢迎光临，我正在测试这台推币机！",
        },
        {
            title: "步骤2",
              content: "这是我用废品做的，看起来破破的，不过该有的都有！",
        },
        {
            title: "步骤3",
              content: "看到这两个出币口了吗，金币会从这两个出币口吐出来！",
        },
        {
            title: "步骤4",
              content: "只要点击红色区域就可以吐出金币啦！注意点右边区域，是左边出币口吐出，点左边区域是右边出币口吐出，注意金币会滑动哦！",
        },
                {
            title: "步骤5",
              content: "现在你所剩的金币是这些。",
                //             before: () => {
                // EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_ATM_PANEL)
            //   }
        },
        {
            title: "步骤6",
              content: "这里会显示你当前持有的票票数量，当金币不够时可以使用票票兑换。"
        },
                {
            title: "步骤7",
              content: "但是注意兑换比哦，每轮都会变化！",
        },
                {
            title: "步骤8",
              content: "兑换过程中有几率出现特殊金币：雨币，雨币可以用来下金币雨，是达成目标的好帮手",
            //               before: () => {
            //     EventManager.Scene.emit(EMLHJ_GameEvents.UI_HIDE_ATM_PANEL)
            //   }
        },
                {
            title: "步骤9",
              content: "这里是币夹，用来存放特殊币，容量有上限，可以在商店升级币夹容量。"
        },{
            title: "步骤10",
              content: "这里显示你的当前分数和本局目标。"
        },{
            title: "步骤11",
              content: "分数结算是根据掉落金币的价值 1 x 当前的分数倍率，连击次数越多，倍率越高哦！"
        },
        {
            title: "步骤12",
              content: "当达到目标分数之后，就会出现商店入口。",
              before: () => {
                EventManager.Scene.emit(HXTJB_GameEvents.SHOW_BTN_SHOP)
              },
       
        },
        {
            title: "步骤13",
              content: "进入商店后，可以用票票兑换特殊币，也可以用来升级币夹容量，票票和特殊币都可以跨轮次保存。",
                     before: () => {
                EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_SHOP_PANEL)
                 EventManager.Scene.emit(HXTJB_GameEvents.HIDE_BTN_SHOP)
              }
        },
                {
            title: "步骤14",
              content: "这是下一关按钮，点击之后会在上一轮的残局基础上继续新一轮推金币。"
        },
                {
            title: "步骤15",
              content: "现在，开始轮次吧！",
              before: () => {
                EventManager.Scene.emit(HXTJB_GameEvents.UI_HIDE_SHOP_PANEL)
              }
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
        EventManager.Scene.emit(HXTJB_GameEvents.UI_HIDE_ALL_SCREENS)
        HXTJB_DataManager.Instance.isEndTutorial = true;
        HXTJB_DataManager.Instance.isGameStart = true;
        
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