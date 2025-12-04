import { _decorator, Button, Color, Component, director, Graphics, instantiate, Label, Mask, Node, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec3, Widget } from 'cc';

import { EventManager, } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_UIManager } from '../../Manager/XCT_UIManager';
import { XCT_UIPanel } from '../../Common/XCT_UIPanel';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_JBT_DataManager } from '../../Manager/XCT_JBT_DataManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_PassPanel')
export class XCT_PassPanel extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Pass;
    protected animationDuration: number = 0.6;


    isAddedEvent: boolean = false;


    @property(Label)
    label1: Label = null; // 左1标签（小两天）

    @property(Label)
    label2: Label = null; // 左2标签（小一天）

    @property(Label)
    label3: Label = null; // 中间标签（当前天）

    @property(Label)
    label4: Label = null; // 右1标签（大一天）

    @property(Label)
    labelTip: Label = null; // 提示标签

    private labels: Label[] = [];
    private currentDay: number = 1;
    private isAnimating: boolean = false;
    private moveDistance: number = 0;
    private passDayCb: () => void = null;


    onLoad() {
        // 初始化标签数组
        this.labels = [this.label1, this.label2, this.label3, this.label4];
        this.moveDistance = this.label2.node.worldPosition.x - this.label1.node.worldPosition.x;
        this.label4.node.setWorldPosition(v3(this.label3.node.worldPosition.x + this.moveDistance, this.label3.node.worldPosition.y));
    }


    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init(data: { tipConfig: { [key: string]: string; }, currentDay: number, passDayCb: () => void }) {
        this.passDayCb = data.passDayCb;
        if (data.currentDay < 10) {
            this.labelTip.string = data.tipConfig[data.currentDay.toString()];
        }
        else {
            this.labelTip.string = data.tipConfig[Math.floor(10 * Math.random()).toString()];
        }
        // 初始化显示
        this.updateDay(data.currentDay);

        // 启动动画循环
        this.scheduleOnce(this.startAnimation, 1);
    }

    /** 更新天数显示 */
    private updateDay(currentDay: number) {
        this.currentDay = currentDay;

        // 设置标签文本
        this.label1.string = `第${this.currentDay - 1}天`;
        this.label2.string = `第${this.currentDay}天`;
        this.label3.string = `第${this.currentDay + 1}天`;
        this.label4.string = `第${this.currentDay + 2}天`;

        // 控制第一天的特殊显示
        if (this.currentDay <= 1) {
            this.label1.node.active = false;
        } else if (this.currentDay === 2) {
            this.label1.node.active = true;
        } else {
            this.label1.node.active = true;
            this.label2.node.active = true;
        }

        // 设置初始状态（中间标签为激活状态）
        this.resetLabelsState();
    }

    /** 重置标签状态 */
    private resetLabelsState() {
        this.labels.forEach((label, index) => {
            const uiOpacity = label.getComponent(UIOpacity);

            if (index === 1) { // 中间标签
                uiOpacity.opacity = 255; // 满透明度
                label.node.setScale(new Vec3(1, 1)); // 原始大小
            } else { // 其他标签
                uiOpacity.opacity = 204; // 80%透明度 (255*0.8)
                label.node.setScale(new Vec3(0.8, 0.8)); // 80%大小
            }
        });
    }

    /** 开始动画 */
    private startAnimation() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // 记录原始位置
        const originalPositions = this.labels.map(label => label.node.position.clone());

        // 计算移动距离（假设每个标签间距相同，这里取100像素，可根据实际调整）
        // 左1标签动画
        tween(this.label1.node)
            .to(0.5, { worldPosition: new Vec3(this.label1.node.worldPosition.x - this.moveDistance, this.label1.node.worldPosition.y) })
            .start()


        // 中间标签动画
        tween(this.label2.node)
            .to(0.5, { worldPosition: new Vec3(this.label2.node.worldPosition.x - this.moveDistance, this.label2.node.worldPosition.y) })
            .start()
        // 中间标签动画
        tween(this.label2.node)
            .to(0.5, { scale: new Vec3(0.8, 0.8) })
            .start()

        tween(this.label2.getComponent(UIOpacity))
            .to(0.5, { opacity: 204 })
            .start()


        // 中间标签动画
        tween(this.label3.node)
            .to(0.5, { worldPosition: new Vec3(this.label3.node.worldPosition.x - this.moveDistance, this.label3.node.worldPosition.y) })
            .start()
        // 中间标签动画
        tween(this.label3.node)
            .to(0.5, { scale: new Vec3(1, 1) })
            .start()

        tween(this.label3.getComponent(UIOpacity))
            .to(0.5, { opacity: 255 })
            .start()


        // 右1标签动画
        tween(this.label4.node)
            .to(0.5, { worldPosition: new Vec3(this.label4.node.worldPosition.x - this.moveDistance, this.label4.node.worldPosition.y) })
            .start()

        this.scheduleOnce(() => {
            if (this.passDayCb) {
                this.passDayCb();
            }
        }, 1.5)
    }

    // 注册事件监听
    addListener() {

    }

    // 注销事件监听
    removeListener() {

    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








