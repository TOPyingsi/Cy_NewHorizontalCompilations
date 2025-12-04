import { _decorator, Component, Node, Button, find, UITransform, tween, Vec3, Tween, UIOpacity } from 'cc';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';
import { GeometryVibes_DataManager } from '../Manager/GeometryVibes_DataManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';


const { ccclass, property } = _decorator;

// 面板显示/隐藏动画类型
export enum GeometryVibes_PanelAnimation {
    NONE = 0,          // 无动画
    FADE = 0.3,          // 淡入淡出
    SCALE = 0.3,         // 缩放
    SLIDE_FROM_TOP = 0.3, // 从顶部滑入
    SLIDE_FROM_BOTTOM = 0.3, // 从底部滑入
    SLIDE_FROM_LEFT = 0.3, // 从左侧滑入
    SLIDE_FROM_RIGHT = 0.3  // 从右侧滑入
}

@ccclass('GeometryVibes_BasePanel')
export class GeometryVibes_BasePanel extends Component {
    // @property({ type: GeometryVibes_PanelAnimation, tooltip: "面板显示动画" })
    public showAnimation: GeometryVibes_PanelAnimation = GeometryVibes_PanelAnimation.NONE;

    // @property({ type: GeometryVibes_PanelAnimation, tooltip: "面板隐藏动画" })
    public hideAnimation: GeometryVibes_PanelAnimation = GeometryVibes_PanelAnimation.NONE;

    @property({ tooltip: "动画持续时间(秒)" })
    public animationDuration: number = 0.2;

    @property({ tooltip: "是否点击空白处关闭" })
    public closeOnClickOutside: boolean = false;

    @property({ tooltip: "面板名称，用于UIManager管理" })
    public panelName: string = "";

    private buttonToCallbackMap: Map<Button, { callback: Function, target: any }> = new Map();

    protected isShowing: boolean = false; // 是否正在显示中
    protected isHiding: boolean = false; // 是否正在隐藏中
    protected maskNode: Node | null = null; // 遮罩节点

    // 生命周期：节点创建时调用
    protected onLoad(): void {
        this.initPanel();
        this.registerEvents();
    }

    // 面板初始化
    public init(): void {

    }
    
    // 初始化面板
    protected initPanel(): void {
        // 如果设置了点击空白关闭，则创建遮罩
        if (this.closeOnClickOutside) {
            this.createMask();
        }

        // // 初始化时隐藏面板
        // this.node.active = false;
    }

    // 创建遮罩
    protected createMask(): void {
        // 检查是否已有遮罩
        this.maskNode = find("mask", this.node);
        if (!this.maskNode) {
            // 创建遮罩节点
            this.maskNode = new Node("mask");
            this.maskNode.setParent(this.node);
            
            // 设置遮罩大小为屏幕大小
            const uiTransform = this.maskNode.addComponent(UITransform);
            uiTransform.setContentSize(1280, 720); // 设置为设计分辨率大小
            
            // 设置遮罩层级在面板之下
            this.maskNode.setSiblingIndex(0);
            
            // 添加点击事件
            const button = this.maskNode.addComponent(Button);
            button.node.on(Button.EventType.CLICK, this.onMaskClick, this);
        }
    }

    // 遮罩点击事件
    protected onMaskClick(): void {
        if (this.closeOnClickOutside) {
            this.hide();
        }
    }

    // 注册事件
    protected registerEvents(): void {
        // 子类可重写此方法注册事件
    }

    // 取消事件注册
    protected unregisterEvents(): void {
        // 子类可重写此方法取消事件注册
    }

    // 显示面板
    public show(): void {
        if (this.isShowing) return;

        
        this.init();

        this.isShowing = true;
        this.node.active = true;
        
        // 执行显示动画
        this.playShowAnimation(() => {
            this.isShowing = false;
            this.onShowComplete();
        });
    }

    // 播放显示动画
    protected playShowAnimation(onComplete: () => void): void {
        switch (this.showAnimation) {
            case GeometryVibes_PanelAnimation.NONE:
                onComplete();
                break;
                
            case GeometryVibes_PanelAnimation.FADE:
                this.node.getComponent(UIOpacity).opacity = 0;
                tween(this.node.getComponent(UIOpacity))
                    .to(this.animationDuration, { opacity: 255 })
                    .call(onComplete)
                    .start();
                break;
                
            case GeometryVibes_PanelAnimation.SCALE:
                this.node.scale = new Vec3(0.8, 0.8, 1);
                // 并行执行缩放和透明度动画
                tween(this.node)
                    .parallel(
                        tween().to(this.animationDuration, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" }),
                        tween(this.node.getComponent(UIOpacity)).to(this.animationDuration, { opacity: 255 })
                    )
                    .call(onComplete)
                    .start();
                break;
                
            case GeometryVibes_PanelAnimation.SLIDE_FROM_TOP:
                const originalY = this.node.position.y;
                this.node.setPosition(this.node.position.x, 1000, this.node.position.z);
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(this.node.position.x, originalY, this.node.position.z) }, { easing: "quadOut" })
                    .call(onComplete)
                    .start();
                break;
                
            // 其他动画类型类似实现...
            default:
                onComplete();
                break;
        }
    }

    // 隐藏面板
    public hide(onComplete?: () => void): void {
        if (this.isHiding || !this.node.active) return;
        
        this.isHiding = true;
        
        // 执行隐藏动画
        this.playHideAnimation(() => {
            this.offButtonClick();
            this.unregisterEvents();
            this.node.active = false;
            this.isHiding = false;
            this.onHideComplete();
            onComplete();
            
            //TODO
            // 通知UIManager面板已隐藏
            // UIManager.getInstance().onPanelHidden(this.panelName);
        });
    }

    // 播放隐藏动画
    protected playHideAnimation(onComplete: () => void): void {
        switch (this.hideAnimation) {
            case GeometryVibes_PanelAnimation.NONE:
                onComplete();
                break;
                
            case GeometryVibes_PanelAnimation.FADE:
                tween(this.node.getComponent(UIOpacity))
                    .to(this.animationDuration, { opacity: 0 })
                    .call(onComplete)
                    .start();
                break;
                
            case GeometryVibes_PanelAnimation.SCALE:
                tween(this.node)
                    .to(this.animationDuration, { scale: new Vec3(0.8, 0.8, 1) }, { easing: "backIn" })
                    .call(() => {
                        this.node.getComponent(UIOpacity).opacity = 0;
                        onComplete();
                    })
                    .start();
                break;
                
            case GeometryVibes_PanelAnimation.SLIDE_FROM_TOP:
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(this.node.position.x, 1000, this.node.position.z) }, { easing: "quadIn" })
                    .call(onComplete)
                    .start();
                break;
                
            // 其他动画类型类似实现...
            default:
                onComplete();
                break;
        }
    }

    // 显示完成回调
    protected onShowComplete(): void {
        // 子类可重写此方法
    }

    // 隐藏完成回调
    protected onHideComplete(): void {
        // 子类可重写此方法
    }

    // 刷新面板数据
    public refresh(data?: any): void {
        // 子类可重写此方法，用于刷新面板数据
    }

    // 生命周期：节点销毁时调用
    protected onDestroy(): void {
        // this.offButtonClick();
        // this.unregisterEvents();
    }

    // 查找子节点（简化版）
    protected findChild(path: string): Node | null {
        return find(path, this.node);
    }

    // // 添加按钮点击事件
    // protected addButtonClick(buttonNode: Node | null, callback: Function, target?: any): void {
    //     if (!buttonNode) return;
        
    //     const button = buttonNode.getComponent(Button);
    //     if (button) {
    //         button.node.on(Button.EventType.CLICK, callback, target || this);
    //     }
    // }

    // 添加按钮点击事件
    protected addButtonClick(button: Button, callback: Function, target: any, isNeedAudio:boolean = true,defaultAudio?:boolean) {
        // 绑定按钮点击事件
        const handler = () => {
            if(isNeedAudio){
                if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
                    if(!defaultAudio){
                        GeometryVibes_AudioManager.getInstance().playSound("cikis")
                        // GeometryVibes_AudioManager.globalAudioPlay("cikis");
                    }
                    else{
                        GeometryVibes_AudioManager.getInstance().playSound("Item Touch Collect")
                        // GeometryVibes_AudioManager.globalAudioPlay("Item Touch Collect");
                    }
                }
            }
 

            callback.call(target);
        };

        button.node.on('click', handler, this);

        // 存储事件和回调
        this.buttonToCallbackMap.set(button, { callback, target });

        // 如果需要的话可以增加事件处理代码
    }

     offButtonClick(){
        // 遍历并取消按钮绑定的事件
        this.buttonToCallbackMap.forEach(({ callback, target }, button) => {
            button.node.off('click', callback, target);
        });

        // 清空回调映射
        this.buttonToCallbackMap.clear();
    }
}
