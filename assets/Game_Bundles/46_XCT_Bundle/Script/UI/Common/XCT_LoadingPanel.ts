import { _decorator, Button, Component, director, Label, Node, tween, TweenEasing } from 'cc';

import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
const { ccclass, property } = _decorator;

@ccclass('XCT_LoadingPanel')
export class XCT_LoadingPanel extends XCT_BasePanel {

    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.SLIDE_FROM_TOP;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.SLIDE_TO_TOP;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Loading;
    protected animationDuration: number = 0.6;
    protected hideEasing: TweenEasing = "quadOut";
    protected showEasing: TweenEasing = "quadIn";


    isAddedEvent: boolean = false;
    private callback: () => void = null;

    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init(callback: () => void) {
        this.callback = callback;
    }

    protected onShowComplete() {
        this.callback?.();
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








