import { _decorator, Animation, Button, Component, director, Graphics, Label, Mask, Node, Sprite, tween } from 'cc';

import { EventManager, MyEvent } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { XCT_Events } from '../../Common/XCT_Events';
import { XCT_HJM_DataManager } from '../../Manager/XCT_HJM_DataManager';

const { ccclass, property } = _decorator;

@ccclass('XCT_HJM_TutorialPanel')
export class XCT_HJM_TutorialPanel extends XCT_BasePanel {
    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Tutorial;
    protected animationDuration: number = 0.6;

    @property(Node)
    arrowContainer: Node = null;  // 箭头容器节点

    private currentTutorialIdx: number = 0;
    private isCompleted: boolean = false;
    // private tutorialSteps: TutorialStep[] = [];
    private tutorialDatas: { idx: number, stepCount: number }[] = [];

    // private arrowConfigs: ArrowConfig[] = [];
    // private currentArrow: Node = null;

    private currentStepIdx: number = 0;

    data: any[] = [
        {
            idx: 0,
            stepCount: 2,
        },
        {
            idx: 1,
            stepCount: 3,
        },
        {
            idx: 2,
            stepCount: 2,
        },
        {
            idx: 3,
            stepCount: 2,
        },
        {
            idx: 4,
            stepCount: 2,
        },
        {
            idx: 5,
            stepCount: 2,
        },
        {
            idx: 6,
            stepCount: 1,
        }
    ]

    isAddedEvent: boolean = false;

    protected start(): void {
    }


    init() {
        if (XCT_HJM_DataManager.Instance.playerData.currentDay !== 1 || XCT_HJM_DataManager.Instance.isTutorialEnd) return;
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
        // 初始隐藏面板
        this.node.active = false;
        this.startTutorial()
    }
    // 开始引导教程
    startTutorial() {
        this.tutorialDatas = this.data;
        this.currentTutorialIdx = 0;
        this.currentStepIdx = 0;
        this.isCompleted = false;

        // 显示面板
        this.node.active = true;

        // 开始第一步
        this.showStep(this.currentTutorialIdx, this.currentStepIdx);
    }



    // 显示指定步骤
    private showStep(tutorialIndex: number, stepIndex: number) {
        if (tutorialIndex >= this.tutorialDatas.length) {
            // 所有步骤完成
            this.completeTutorial();
            return;
        }

        this.currentTutorialIdx = tutorialIndex;
        // const step = this.tutorialDatas[tutorialIndex];


        // 显示对应箭头
        this.updateArrow(tutorialIndex, stepIndex); // 步骤从1开始

        // // 执行显示前的方法
        // if (step.before && typeof step.before === 'function') {
        //     try {
        //         step.before();
        //     } catch (e) {
        //         console.error(`步骤 ${tutorialIndex + 1} 显示前方法执行失败:`, e);
        //     }
        // }
    }

    // 更新箭头显示
    private updateArrow(tutorialIndex: number, stepIndex: number) {
        this.arrowContainer.children.forEach(child => {
            child.getComponent(Animation).stop();
            child.active = false;
            let idxs = child.name.split("_");
            let arrowTutorialIndex = parseInt(idxs[0]);
            let arrowStepIndex = parseInt(idxs[1]);
            if (arrowTutorialIndex == tutorialIndex && arrowStepIndex == stepIndex) {
                child.active = true;
                child.getComponent(Animation).play();
            }
        })
    }



    // 完成引导教程
    private completeTutorial() {
        this.hideArrow();
        this.isCompleted = true;
        XCT_HJM_DataManager.Instance.isTutorialEnd = true;
        XCT_HJM_DataManager.Instance.isNeedShowDragTutorial = true;
        
    }

    // 下一步
    private onNextStep() {
        if (this.isCompleted) return;

        this.currentStepIdx++;
        let stepCount = this.tutorialDatas[this.currentTutorialIdx].stepCount;
        if (this.currentStepIdx > stepCount - 1) {
            // 完成当前教程
            this.currentStepIdx = 0;
            this.currentTutorialIdx++;
            this.showStep(this.currentTutorialIdx, this.currentStepIdx);
            return;
        }

        this.showStep(this.currentTutorialIdx, this.currentStepIdx);
    }

    hideArrow() {
        this.arrowContainer.children.forEach(child => {
            child.getComponent(Animation).stop();
            child.active = false;
        })
    }

    hidePanel() {
        this.arrowContainer.active = false;
    }

    showPanel() {
        this.arrowContainer.active = true;
    }

    // 注册事件监听
    addListener() {
        EventManager.on(XCT_Events.Hide_TutorialPanel, this.hidePanel, this);
        EventManager.on(XCT_Events.Show_TutorialPanel, this.showPanel, this);
        EventManager.on(XCT_Events.HandAnimation_Start, this.hideArrow, this);
        EventManager.on(XCT_Events.HandAnimation_End, this.onNextStep, this);
    }

    // 注销事件监听
    removeListener() {
        EventManager.off(XCT_Events.Hide_TutorialPanel, this.hidePanel, this);
        EventManager.off(XCT_Events.Show_TutorialPanel, this.showPanel, this);
        EventManager.off(XCT_Events.HandAnimation_Start, this.hideArrow, this);
        EventManager.off(XCT_Events.HandAnimation_End, this.onNextStep, this);
    }

    // 注销事件监听
    onDestroy() {
        this.removeListener();
        this.isAddedEvent = false;
    }
}








