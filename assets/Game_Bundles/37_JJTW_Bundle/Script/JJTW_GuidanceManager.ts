import { _decorator, Component, Node, find, EventTouch, UITransform, Vec3, director, Label, Sprite, UIOpacity, Tween, tween } from 'cc';
import { JJTW_DataManager } from './JJTW_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;

// 引导步骤类型
export enum JJTW_GuidanceStepType {
    INTRODUCTION,    // 游戏介绍
    JOYSTICK,       // 摇杆
    CAMERA_ROTATE,  // 相机旋转
    PATHFIND_BUTTON,// 寻路按钮
    BUTTON_SCREAM,       // 按钮1
    BUTTON_INTERACT,       // 按钮2
    BUTTON_FLASHLIGHT        // 按钮3
}

// 引导步骤数据结构
interface JJTW_GuidanceStep {
    type: JJTW_GuidanceStepType;
    targetNodeName: string;  // 目标节点名称
    tipText: string;         // 提示文本
    hasDemoAnimation?: boolean; // 是否有演示动画
    otherMudule?: string[];    // 其他模块名称
}

@ccclass('JJTW_GuidanceManager')
export class JJTW_GuidanceManager extends Component {
    
    @property(Node)
    modulesLayer: Node = null;         // 模块层

    @property(Node)
    maskLayer: Node = null;         // 遮罩层

    @property(Node)
    operateLayer: Node = null;         // 遮罩层
    
    @property(Node)
    tipPanel: Node = null;         // 提示面板
    
    @property(Node)
    skipButton: Node = null;       // 跳过按钮
    
    @property(Node)
    tipLabel: Node = null;         // 提示文本标签
    
    @property([Node])
    allModules: Node[] = [];       // 所有模块节点
    
    private currentStepIndex: number = 0;
    private currentTargetNode: Node = null;
    private isOperating: boolean = false;
    private otherModules: Node[] = []; // 其他模块节点
    private isHighSpeedMove: boolean = false;

    private lightClickCount: number = 0;
    
    // 新增介绍步骤配置
private introductionSteps: JJTW_GuidanceStep[] = [
    {
        type: JJTW_GuidanceStepType.INTRODUCTION,
        targetNodeName: "",
        tipText: "欢迎来到医院，点击屏幕继续"
    },
    {
        type: JJTW_GuidanceStepType.INTRODUCTION,
        targetNodeName: "",
        tipText: "这是一个恐怖逃脱游戏，你需要探索医院，在躲避怪物的同时，找到六个罗盘才能打开身后的大门逃脱"
    },
    {
        type: JJTW_GuidanceStepType.INTRODUCTION,
        targetNodeName: "",
        tipText: "医院里有一份极为重要的机密文件，找到文件并将文件带出来！"
    },
    {
        type: JJTW_GuidanceStepType.INTRODUCTION,
        targetNodeName: "",
        tipText: "有些门需要钥匙才能打开，合理使用强力扫描技能，它会带你寻找需要的物品"
    },
    {
        type: JJTW_GuidanceStepType.INTRODUCTION,
        targetNodeName: "",
        tipText: "小心躲避医院里的怪物，打开困住它们的门后，它们可自由移动，小心别被抓到！"
    },
        {
        type: JJTW_GuidanceStepType.INTRODUCTION,
        targetNodeName: "",
        tipText: "现在开始操作引导！"
    }
];
    // 引导步骤配置
    private guidanceSteps: JJTW_GuidanceStep[] = [
        {
            type: JJTW_GuidanceStepType.JOYSTICK,
            targetNodeName: "joystick",
            tipText: "摇杆：长按并滑动中央的白色圆形块，可控制角色前后左右移动"
        },
        {
            type: JJTW_GuidanceStepType.CAMERA_ROTATE,
            targetNodeName: "cameraRotateArea",
            tipText: "视角：在屏幕右半部分长按并滑动，可控制视角",
            hasDemoAnimation: true
        },
        {
            type: JJTW_GuidanceStepType.BUTTON_SCREAM,
            targetNodeName: "btnScream",
            tipText: "尖叫：长按此按钮，可使移动速度提升",
            otherMudule: ["joystick"]
        },
        {
            type: JJTW_GuidanceStepType.BUTTON_INTERACT,
            targetNodeName: "btnInteract",
            tipText: "交互：点击此按钮可与道具、门交互"
        },
        {
            type: JJTW_GuidanceStepType.BUTTON_FLASHLIGHT,
            targetNodeName: "btnFlashLight",
            tipText: "手电筒：点击可开关手电筒，手电筒的电池会不断耗电，电量归零后可看视频充电"
        },
        {
            type: JJTW_GuidanceStepType.PATHFIND_BUTTON,
            targetNodeName: "btnScan",
            tipText: "强力扫描：点击后，会强力扫描全医院，创建一条维持10秒的指引路线"
        }
    ];

        // 新增介绍步骤配置
private endSteps: JJTW_GuidanceStep[] = [
    {
        type: JJTW_GuidanceStepType.INTRODUCTION,
        targetNodeName: "",
        tipText: "恭喜你完成了新手引导，点击屏幕开始游戏"
    },
];

    protected onLoad(): void {
        // 初始化事件监听
        this.skipButton.on(Node.EventType.TOUCH_END, this.onSkipGuidance, this);
        
        // // 隐藏所有模块，准备开始引导
        // this.allModules.forEach(module => {
        //     module.active = false;
        // });
    }

    protected update(dt: number): void {
        if (JJTW_DataManager.Instance.isGuidanding && this.currentStepIndex == 2) {
            if(JJTW_DataManager.Instance.isMove && JJTW_DataManager.Instance.isScream){
                this.isHighSpeedMove = true;
            }
        }
        if(this.isHighSpeedMove && this.currentStepIndex == 2){
            if(!JJTW_DataManager.Instance.isMove && !JJTW_DataManager.Instance.isScream){
               this.onbtnScreamEnd();
            }
        }
    }

    protected start(): void {
        // 开始第一个引导步骤
        this.startGuidance();
    }

    // 开始引导流程
    startGuidance() {
        JJTW_DataManager.Instance.isGuidanding = true;
        this.currentStepIndex = 0;
       // 先执行介绍步骤
        if(this.introductionSteps.length > 0) {
            this.maskLayer.on(Node.EventType.TOUCH_END, this.onIntroductionClick, this);
            this.showIntroduction();
        } else {
            this.showCurrentStep();
        }
    }

    // 新增介绍点击处理
private onIntroductionClick() {
    this.currentStepIndex++;
    
    if(this.currentStepIndex >= this.introductionSteps.length) {
        // 介绍完成，开始新手引导
        this.maskLayer.off(Node.EventType.TOUCH_END, this.onIntroductionClick, this);
        this.currentStepIndex = 0;
        this.showCurrentStep();
    } else {
        this.showIntroduction();
    }
}

private showFinishIntroduction() {
const step = this.endSteps[0];
    this.tipLabel.getComponent(Label).string = step.tipText;
    this.maskLayer.active = true;
    this.tipPanel.active = true;
    this.maskLayer.on(Node.EventType.TOUCH_END, this.onFinishIntroductionClick, this);
    // 隐藏所有操作模块
    this.allModules.forEach(module => {
        module.active = false;
    });
}

onFinishIntroductionClick() {
    this.finishGuidance();
}

// 新增显示介绍方法
private showIntroduction() {
    const step = this.introductionSteps[this.currentStepIndex];
    this.tipLabel.getComponent(Label).string = step.tipText;
    this.maskLayer.active = true;
    this.tipPanel.active = true;
    
    // 隐藏所有操作模块
    this.allModules.forEach(module => {
        module.active = false;
    });
}

    // 显示当前引导步骤
    private showCurrentStep() {
        if (this.currentStepIndex >= this.guidanceSteps.length) {
            // 引导结束
            this.showFinishIntroduction();
            return;
        }
        
        const step = this.guidanceSteps[this.currentStepIndex];
        this.currentTargetNode = this.modulesLayer.getChildByName(step.targetNodeName);
        
        if (!this.currentTargetNode) {
            //console.error(`找不到目标节点: ${step.targetNodeName}`);
            this.nextStep();
            return;
        }
        
        // 更新提示文本
        this.tipLabel.getComponent(Label).string = step.tipText;
        
        // 显示遮罩并高亮当前模块
        this.maskLayer.active = true;
        this.updateMaskHole();
        
        // 显示当前模块和提示面板
        this.showAllModules();
        
        // 添加当前模块的事件监听
        this.addCurrentModuleListener(step.type);
        
        // 如果有演示动画，播放
        if (step.hasDemoAnimation) {
            this.playDemoAnimation(step.type);
        }
    }

    // 更新遮罩层的孔洞（高亮区域）
    private updateMaskHole() {
        // const maskScript = this.maskLayer.getComponent('MaskWithHole');
        // if (maskScript && this.currentTargetNode) {
        //     const targetTrans = this.currentTargetNode.getComponent(UITransform);
        //     const worldPos = this.currentTargetNode.convertToWorldSpaceAR(Vec3.ZERO);
        //     const maskPos = this.maskLayer.convertToNodeSpaceAR(worldPos);
            
        //     maskScript.setHoleInfo(maskPos, targetTrans.width / 2, targetTrans.height / 2);
        // }

        let lastWorPosition = this.currentTargetNode.worldPosition; // 初始化
        this.currentTargetNode.setParent(this.operateLayer)
        this.currentTargetNode.setWorldPosition(lastWorPosition); // 重置
        const step = this.guidanceSteps[this.currentStepIndex];
        if(step.otherMudule && step.otherMudule.length > 0){
            this.otherModules = []; // 清空之前的模块
            for(let i = 0; i < step.otherMudule.length; i++){
                let node = this.modulesLayer.getChildByName(step.otherMudule[i]);
                let lastWorPosition2 = node.worldPosition; // 初始化
                node.setParent(this.operateLayer)
                node.setWorldPosition(lastWorPosition2); // 重置
                this.otherModules.push(node); // 添加到其他模块数组
            }
        }
    }

    // 只显示当前模块
    private showOnlyCurrentModule() {
        this.allModules.forEach(module => {
            module.active = module.name === this.currentTargetNode.name;
            const step = this.guidanceSteps[this.currentStepIndex];
            if(step.otherMudule && step.otherMudule.length > 0){
                if(step.otherMudule.indexOf(module.name) > -1){
                    module.active = true;
                }
            }
        });
        this.tipPanel.active = true;
    }

    // 显示所有模块
    private showAllModules() {
        this.allModules.forEach(module => {
            module.active = true;
        });
        this.tipPanel.active = true;
    }

    // 为当前模块添加事件监听
    private addCurrentModuleListener(type: JJTW_GuidanceStepType) {
        // 先移除之前的监听
        this.removeCurrentModuleListener();
        
        switch (type) {
            case JJTW_GuidanceStepType.JOYSTICK:
                EventManager.on("JJTW_JOYSTICK_Start",this.onJoystickStart,this);
                EventManager.on("JJTW_JOYSTICK_End",this.onJoystickEnd,this);
                break;
                
            case JJTW_GuidanceStepType.CAMERA_ROTATE:
                this.currentTargetNode.children[0].active = true;
                const uiOpacity = this.currentTargetNode.children[0].getComponent(UIOpacity);
                // Tween.stopAllByTarget(uiOpacity); // 先停止已有动画
                // tween(uiOpacity)
                //     .to(1.0, { opacity: 100 }) // 1秒到100
                //     .to(1.0, { opacity: 0 })    // 1秒到0
                //     .reverse() // 往返播放
                //     .repeatForever() // 无限循环
                //     .start();
                this.currentTargetNode.on(Node.EventType.TOUCH_START, this.onCameraTouchStart, this);
                this.currentTargetNode.on(Node.EventType.TOUCH_END, this.onCameraTouchEnd, this);
                this.currentTargetNode.on(Node.EventType.TOUCH_CANCEL, this.onCameraTouchEnd, this);
                break;

            case JJTW_GuidanceStepType.BUTTON_SCREAM:
                EventManager.on("JJTW_Scream_Start",this.onbtnScreamStart,this);
            case JJTW_GuidanceStepType.BUTTON_SCREAM:
                JJTW_DataManager.Instance.isStartToLightDownCount = true;
                this.currentTargetNode.on(Node.EventType.TOUCH_END, this.onButtonClick, this);
                
            default: // 按钮类
                this.currentTargetNode.on(Node.EventType.TOUCH_END, this.onButtonClick, this);
                break;
        }
    }

    // 移除当前模块的事件监听
    private removeCurrentModuleListener() {
        if (!this.currentTargetNode) return;
        
        const type = this.guidanceSteps[this.currentStepIndex].type;
        
        switch (type) {
            case JJTW_GuidanceStepType.JOYSTICK:
                // this.currentTargetNode.off(Node.EventType.TOUCH_START, this.onJoystickStart, this);
                // this.currentTargetNode.off(Node.EventType.TOUCH_MOVE, this.onJoystickMove, this);
                // this.currentTargetNode.off(Node.EventType.TOUCH_END, this.onJoystickEnd, this);
                // this.currentTargetNode.off(Node.EventType.TOUCH_CANCEL, this.onJoystickEnd, this);
                break;
                
            case JJTW_GuidanceStepType.CAMERA_ROTATE:
             
                this.currentTargetNode.off(Node.EventType.TOUCH_START, this.onCameraTouchStart, this);
                this.currentTargetNode.off(Node.EventType.TOUCH_END, this.onCameraTouchEnd, this);
                this.currentTargetNode.off(Node.EventType.TOUCH_CANCEL, this.onCameraTouchEnd, this);
                break;
                
            default: // 按钮类
                this.currentTargetNode.off(Node.EventType.TOUCH_END, this.onButtonClick, this);
                break;
        }
    }

    // 摇杆开始操作
    private onJoystickStart() {
        EventManager.off("JJTW_JOYSTICK_Start",this.onJoystickStart,this);
        this.enterOperatingState();
    }

    // 摇杆开始操作
    private onJoystickMove() {
    }
    

    // 摇杆结束操作
    private onJoystickEnd() {
        EventManager.off("JJTW_JOYSTICK_End",this.onJoystickEnd,this);
        this.exitOperatingState();
        this.nextStep();
    }

    // 相机触摸开始
    private onCameraTouchStart() {
        const uiOpacity = this.currentTargetNode.children[0].getComponent(UIOpacity);
        Tween.stopAllByTarget(uiOpacity); // 先停止已有动画
        this.currentTargetNode.children[0].active = false;
        this.enterOperatingState();
    }

    // 相机触摸结束
    private onCameraTouchEnd() {
        this.exitOperatingState();
        this.nextStep();
    }

    // 摇杆开始操作
    private onbtnScreamStart() {
        EventManager.off("JJTW_Scream_Start",this.onbtnScreamStart,this);
        this.enterOperatingState();
    }


    // 摇杆结束操作
    private onbtnScreamEnd() {
        this.exitOperatingState();
        this.nextStep();
    }

    // 按钮点击
    private onButtonClick() {
        this.enterOperatingState();
        
        // 对于寻路按钮，显示2秒后继续
        if (this.guidanceSteps[this.currentStepIndex].type === JJTW_GuidanceStepType.PATHFIND_BUTTON) {
            this.currentTargetNode.off(Node.EventType.TOUCH_END, this.onButtonClick, this);
            setTimeout(() => {
                this.exitOperatingState();
                this.nextStep();
            }, 2000);
        } else if(this.guidanceSteps[this.currentStepIndex].type === JJTW_GuidanceStepType.BUTTON_FLASHLIGHT){
            this.lightClickCount++;
            if(this.lightClickCount == 2){
                this.currentTargetNode.off(Node.EventType.TOUCH_END, this.onButtonClick, this);
                this.exitOperatingState();
                this.nextStep();
            }
        }else {
            // 交互按钮立即继续
            // setTimeout(() => {
                this.exitOperatingState();
                this.nextStep();
            // }, 2000);
        }
    }

    // 进入操作状态
    private enterOperatingState() {
        if (this.isOperating) return;
        
        this.isOperating = true;
        this.maskLayer.active = false; // 移除遮罩
        this.showOnlyCurrentModule(); // 只显示当前模块
    }

    // 退出操作状态
    private exitOperatingState() {
        if (!this.isOperating) return;
        
        this.isOperating = false;
        let lastWorPosition = this.currentTargetNode.worldPosition; // 初始化
        this.currentTargetNode.setParent(this.modulesLayer)
        this.currentTargetNode.setWorldPosition(lastWorPosition); // 重置
        if(this.currentTargetNode.name == "cameraRotateArea"){
            this.currentTargetNode.setSiblingIndex(0);
        }
        if(this.otherModules.length > 0){
            for(let i = 0; i < this.otherModules.length; i++){
                let node =this.otherModules[i];
                let lastWorPosition = node.worldPosition; // 初始化
                node.setParent(this.modulesLayer)
                node.setWorldPosition(lastWorPosition); // 重置
                if(node.name == "cameraRotateArea"){
                    node.setSiblingIndex(0);
                }
            }
            this.otherModules = []; // 清空之前的模块
        }
    }

    // 播放演示动画
    private playDemoAnimation(type: JJTW_GuidanceStepType) {
        // // 这里实现演示动画逻辑，例如相机旋转的示例动画
        // if (type === JJTW_GuidanceStepType.CAMERA_ROTATE) {
        //     // 示例：播放相机旋转动画
        //     const camera = find('MainCamera');
        //     if (camera) {
        //         // 这里可以添加简单的相机旋转动画
        //         //console.log("播放相机旋转演示动画");
        //     }
        // }
    }

    // 进入下一步
    private nextStep() {
        this.removeCurrentModuleListener();
        this.currentStepIndex++;
        JJTW_DataManager.Instance.currentStepIndex = this.currentStepIndex;
        this.showCurrentStep();
    }

    // 跳过引导
    private onSkipGuidance() {
        this.removeCurrentModuleListener();
        // this.currentStepIndex >= this.guidanceSteps.length;
        this.currentStepIndex = this.guidanceSteps.length;
        JJTW_DataManager.Instance.currentStepIndex = this.guidanceSteps.length;
        this.maskLayer.off(Node.EventType.TOUCH_END, this.onIntroductionClick, this);
        
        EventManager.off("JJTW_JOYSTICK_Start",this.onJoystickStart,this);
        EventManager.off("JJTW_JOYSTICK_End",this.onJoystickEnd,this);
        EventManager.off("JJTW_Scream_Start",this.onbtnScreamStart,this);
        JJTW_DataManager.Instance.isStartToLightDownCount = true;
        
        this.allModules.forEach(node => {
            let lastWorPosition = node.worldPosition; // 初始化
                node.setParent(this.modulesLayer)
                node.setWorldPosition(lastWorPosition); // 重置
                if(node.name == "cameraRotateArea"){
                    node.setSiblingIndex(0);
                    node.children[0].active = false;
                }
        });

        this.finishGuidance();
    }

    // 完成引导
    private finishGuidance() {
        this.maskLayer.off(Node.EventType.TOUCH_END, this.onFinishIntroductionClick, this);
        this.maskLayer.active = false;
        this.showAllModules();
        this.tipPanel.active = false;
        // 发送开始游戏事件
       JJTW_DataManager.Instance.isGameStart = true;
        //console.log("新手引导结束，开始游戏");
    }

    protected onDestroy(): void {
        this.skipButton.off(Node.EventType.TOUCH_END, this.onSkipGuidance, this);
        this.removeAllModuleListener();
    }

    private removeAllModuleListener(){
        this.skipButton.off(Node.EventType.TOUCH_END, this.onSkipGuidance, this);

        // 移除介绍点击监听
        this.maskLayer.off(Node.EventType.TOUCH_END, this.onIntroductionClick, this);
        this.maskLayer.off(Node.EventType.TOUCH_END, this.onFinishIntroductionClick, this);

        // 移除事件管理器监听
        EventManager.off("JJTW_JOYSTICK_Start", this.onJoystickStart, this);
        EventManager.off("JJTW_JOYSTICK_End", this.onJoystickEnd, this);
        EventManager.off("JJTW_Scream_Start", this.onbtnScreamStart, this);

        // 移除所有模块的触摸监听
        this.allModules.forEach(node => {
        node.off(Node.EventType.TOUCH_START, this.onCameraTouchStart, this);
        node.off(Node.EventType.TOUCH_END, this.onCameraTouchEnd, this);
        node.off(Node.EventType.TOUCH_CANCEL, this.onCameraTouchEnd, this);
        node.off(Node.EventType.TOUCH_END, this.onButtonClick, this);
        });
    }
}
