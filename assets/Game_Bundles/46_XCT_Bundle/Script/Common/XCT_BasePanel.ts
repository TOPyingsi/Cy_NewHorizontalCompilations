import { _decorator, Component, Node, Button, find, UITransform, tween, Vec3, Tween, UIOpacity, TweenEasing } from 'cc';

import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_UILayer } from './XCT_UILayer';


const { ccclass, property } = _decorator;

// 面板显示/隐藏动画类型
export enum XCT_PanelAnimation {
    NONE = 1,          // 无动画
    FADE = 2,          // 淡入淡出
    SCALE = 3,         // 缩放
    SLIDE_FROM_TOP = 4, // 从顶部滑入
    SLIDE_FROM_BOTTOM = 5, // 从底部滑入
    SLIDE_FROM_LEFT = 6, // 从左侧滑入
    SLIDE_FROM_RIGHT = 7,  // 从右侧滑入

    SLIDE_TO_TOP = 8, // 滑出到顶部
    SLIDE_TO_BOTTOM = 9, // 滑出到底部
    SLIDE_TO_LEFT = 10, // 滑出到左侧
    SLIDE_TO_RIGHT = 11, // 滑出到右侧

    PreLoad_at_Top = 12, //预加载到顶部
    PreLoad_at_Bottom = 13, //预加载到底部
    PreLoad_at_Left = 14, //预加载到左侧
    PreLoad_at_Right = 15, //预加载到右侧
}

@ccclass('XCT_BasePanel')
export class XCT_BasePanel extends Component {
    // @property({ type: XCT_PanelAnimation, tooltip: "面板显示动画" })
    private showAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;

    // 默认显示动画，子类可重写
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected showEasing: TweenEasing = null;

    // @property({ type: XCT_PanelAnimation, tooltip: "面板隐藏动画" })
    private hideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected hideEasing: TweenEasing = null;

    // 默认隐藏动画，子类可重写
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;

    // 默认层级，子类可重写
    public defaultLayer: XCT_UILayer = XCT_UILayer.Game;

    // @property({ tooltip: "动画持续时间(秒)" })
    protected animationDuration: number = 0.2;

    // @property({ tooltip: "是否点击空白处关闭" })
    public closeOnClickOutside: boolean = false;

    // @property({ tooltip: "面板名称，用于UIManager管理" })
    // public panelName: string = "";

    private buttonToCallbackMap: Map<Button, { callback: Function, target: any }> = new Map();

    protected isShowing: boolean = false; // 是否正在显示中
    protected isHiding: boolean = false; // 是否正在隐藏中
    protected maskNode: Node | null = null; // 遮罩节点

    // 生命周期：节点创建时调用
    protected onLoad(): void {
        this.initPanel();
        // this.addListener();
    }

    // 面板初始化
    public init(data?: any): void {

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
    protected addListener(): void {
        // 子类可重写此方法注册事件
    }

    // 取消事件注册
    protected removeListener(): void {
        // 子类可重写此方法取消事件注册
    }

    // 显示面板
    public show(data?: any, showAnimation?: XCT_PanelAnimation): void {
        if (this.isShowing) return;

        // 设置显示动画
        this.showAnimation = showAnimation || this.defaultShowAnimation;

        this.init(data);

        this.isShowing = true;
        this.node.active = true;

        // 执行显示动画
        this.playShowAnimation(() => {
            this.isShowing = false;
            this.onShowComplete();
            // onComplete && onComplete(this.node);
        });
    }

    // 播放显示动画
    protected playShowAnimation(onComplete: () => void): void {
        let originalY = 0 /*this.node.position.y*/;
        let originalX = 0 /*this.node.position.x*/;
        switch (this.showAnimation) {
            case XCT_PanelAnimation.NONE:
                onComplete();
                break;

            case XCT_PanelAnimation.FADE:
                this.node.getComponent(UIOpacity).opacity = 0;
                tween(this.node.getComponent(UIOpacity))
                    .to(this.animationDuration, { opacity: 255 })
                    .call(onComplete)
                    .start();
                break;

            case XCT_PanelAnimation.SCALE:
                this.node.scale = new Vec3(0, 0, 1);
                // 并行执行缩放和透明度动画
                tween(this.node)
                    .parallel(
                        tween().to(this.animationDuration, { scale: new Vec3(1, 1, 1) }, { easing: "backOut" }),
                        // tween(this.node.getComponent(UIOpacity)).to(this.animationDuration, { opacity: 255 })
                    )
                    .call(onComplete)
                    .start();
                break;

            case XCT_PanelAnimation.SLIDE_FROM_TOP:
                originalY = 0 /*this.node.position.y*/;
                this.node.setPosition(this.node.position.x, this.node.getComponent(UITransform).height, this.node.position.z);
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(this.node.position.x, originalY, this.node.position.z) }, /*{ easing: "quadOut" }*/{ easing: this.showEasing })
                    .call(onComplete)
                    .start();
                break;

            case XCT_PanelAnimation.SLIDE_FROM_BOTTOM:
                originalY = 0 /*this.node.position.y*/;
                this.node.setPosition(this.node.position.x, -this.node.getComponent(UITransform).height, this.node.position.z);
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(this.node.position.x, originalY, this.node.position.z) }, { easing: this.showEasing })
                    .call(onComplete)
                    .start();
                break;

            case XCT_PanelAnimation.SLIDE_FROM_LEFT:
                originalX = 0 /*this.node.position.x*/;
                this.node.setPosition(-this.node.getComponent(UITransform).width, this.node.position.y, this.node.position.z);
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(originalX, this.node.position.y, this.node.position.z) }, { easing: this.showEasing })
                    .call(onComplete)
                    .start();
                break;

            case XCT_PanelAnimation.SLIDE_FROM_RIGHT:
                originalX = 0 /*this.node.position.x*/;
                this.node.setPosition(this.node.getComponent(UITransform).width, this.node.position.y, this.node.position.z);
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(originalX, this.node.position.y, this.node.position.z) }, { easing: this.showEasing })
                    .call(onComplete)
                    .start();
                break;

            case XCT_PanelAnimation.PreLoad_at_Top:
                this.node.setPosition(this.node.position.x, this.node.getComponent(UITransform).height, this.node.position.z);
                onComplete();
                break;
            case XCT_PanelAnimation.PreLoad_at_Bottom:
                this.node.setPosition(this.node.position.x, -this.node.getComponent(UITransform).height, this.node.position.z);
                onComplete();
                break;
            case XCT_PanelAnimation.PreLoad_at_Left:
                this.node.setPosition(-this.node.getComponent(UITransform).width, this.node.position.y, this.node.position.z);
                onComplete();
                break;
            case XCT_PanelAnimation.PreLoad_at_Right:
                this.node.setPosition(this.node.getComponent(UITransform).width, this.node.position.y, this.node.position.z);
                onComplete();
                break;

            // 其他动画类型类似实现...
            default:
                onComplete();
                break;
        }
    }

    // 隐藏面板
    public hide(onComplete?: () => void, hideAnimation?: XCT_PanelAnimation): void {
        if (this.isHiding || !this.node.active) return;

        // 设置隐藏动画
        this.hideAnimation = hideAnimation || this.defaultHideAnimation;

        this.isHiding = true;

        // 执行隐藏动画
        this.playHideAnimation(() => {
            this.offButtonClick();
            this.removeListener();
            this.node.active = false;
            this.isHiding = false;
            this.onHideComplete();
            onComplete && onComplete();

        });
    }

    // 播放隐藏动画
    protected playHideAnimation(onComplete: () => void): void {
        switch (this.hideAnimation) {
            case XCT_PanelAnimation.NONE:
                onComplete();
                break;

            case XCT_PanelAnimation.FADE:
                tween(this.node.getComponent(UIOpacity))
                    .to(this.animationDuration, { opacity: 0 })
                    .call(onComplete)
                    .start();
                break;

            case XCT_PanelAnimation.SCALE:
                tween(this.node)
                    .to(this.animationDuration, { scale: new Vec3(0.8, 0.8, 1) }, { easing: "backIn" })
                    .call(() => {
                        this.node.getComponent(UIOpacity).opacity = 0;
                        onComplete();
                    })
                    .start();
                break;

            case XCT_PanelAnimation.SLIDE_TO_TOP:
                this.node.setPosition(0, 0, this.node.position.z);
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(this.node.position.x, this.node.getComponent(UITransform).height, this.node.position.z) }, { easing: this.hideEasing })
                    .call(onComplete)
                    .start();
                // tween(this.node)
                //     .to(this.animationDuration, { position: new Vec3(this.node.position.x, -this.node.getComponent(UITransform).height, this.node.position.z) }, { easing: "quadIn" })
                //     .call(onComplete)
                //     .start();
                break;

            case XCT_PanelAnimation.SLIDE_TO_BOTTOM:
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(this.node.position.x, -this.node.getComponent(UITransform).height, this.node.position.z) }, { easing: this.hideEasing })
                    .call(onComplete)
                    .start();
                break;

            case XCT_PanelAnimation.SLIDE_TO_LEFT:
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(-this.node.getComponent(UITransform).width, this.node.position.y, this.node.position.z) }, { easing: this.hideEasing })
                    .call(onComplete)
                    .start();
                break;

            case XCT_PanelAnimation.SLIDE_TO_RIGHT:
                tween(this.node)
                    .to(this.animationDuration, { position: new Vec3(this.node.getComponent(UITransform).width, this.node.position.y, this.node.position.z) }, { easing: this.hideEasing })
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

    // 添加按钮点击事件
    protected addButtonClick(button: Button, callback: Function, target: any, isNeedAudio: boolean = true, defaultAudio?: boolean) {
        // 绑定按钮点击事件
        const handler = () => {
            if (isNeedAudio) {
                // if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
                //     if(!defaultAudio){
                //         GeometryVibes_AudioManager.getInstance().playSound("cikis")
                //         // GeometryVibes_AudioManager.globalAudioPlay("cikis");
                //     }
                //     else{
                //         GeometryVibes_AudioManager.getInstance().playSound("Item Touch Collect")
                //         // GeometryVibes_AudioManager.globalAudioPlay("Item Touch Collect");
                //     }
                // }
            }


            callback.call(target);
        };

        button.node.on('click', handler, this);

        // 存储事件和回调
        this.buttonToCallbackMap.set(button, { callback, target });

        // 如果需要的话可以增加事件处理代码
    }

    offButtonClick() {
        // 遍历并取消按钮绑定的事件
        this.buttonToCallbackMap.forEach(({ callback, target }, button) => {
            button.node.off('click', callback, target);
        });

        // 清空回调映射
        this.buttonToCallbackMap.clear();
    }
}
