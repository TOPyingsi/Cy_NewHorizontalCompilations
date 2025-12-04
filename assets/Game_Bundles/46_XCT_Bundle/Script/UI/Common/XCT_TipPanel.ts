import { _decorator, Button, Component, director, instantiate, Label, Node, tween, TweenEasing, UIOpacity, Vec3 } from 'cc';

import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from '../../Common/XCT_Events';
const { ccclass, property } = _decorator;

@ccclass('XCT_TipPanel')
export class XCT_TipPanel extends XCT_BasePanel {

    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Tip;
    protected animationDuration: number = 0;

    isAddedEvent: boolean = false;

    tipItemPrefab: Node = null;

    tipItemsContainer: Node = null;



    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init() {
        this.tipItemPrefab = this.node.getChildByName("tipitem");
        this.tipItemsContainer = this.node.getChildByName("container");
        this.tipItemPrefab.active = false;
        this.tipItemsContainer.removeAllChildren();
    }

    createTipItem(tip: string) {
        const tipItem = instantiate(this.tipItemPrefab);
        tipItem.parent = this.tipItemsContainer;
        const labels = tipItem.getComponentsInChildren(Label);
        labels.forEach(label => {
            label.string = tip;
        });
        tipItem.active = true;

        // 设置初始位置和透明度
        tipItem.setPosition(0, -100);
        tipItem.getComponent(UIOpacity).opacity = 0;

        // 动画序列：淡入、停留、淡出
        tween(tipItem)
            .to(0.5, { position: Vec3.ZERO }, { easing: 'sineOut' })
            .delay(1)
            .to(0.5, { position: new Vec3(0, 100, 0) }, { easing: 'sineIn' })
            .call(() => {
                tipItem.destroy();
            })
            .start();
        tween(tipItem.getComponent(UIOpacity))
            .to(0.5, { opacity: 255 })
            .delay(1)
            .to(0.5, { opacity: 0 })
            .start();
    }

    protected onShowComplete() {

    }

    // 注册事件监听
    addListener() {
        EventManager.on(XCT_Events.showTip, this.createTipItem, this);
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








