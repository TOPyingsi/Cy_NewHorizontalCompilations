import { _decorator, Button, Component, director, Label, Node, tween } from 'cc';

import { XCT_BasePanel, XCT_PanelAnimation } from '../../Common/XCT_BasePanel';
import { XCT_UILayer } from '../../Common/XCT_UILayer';
const { ccclass, property } = _decorator;

@ccclass('XCT_TablePanel')
export class XCT_TablePanel extends XCT_BasePanel {

    protected defaultShowAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    protected defaultHideAnimation: XCT_PanelAnimation = XCT_PanelAnimation.NONE;
    public defaultLayer: XCT_UILayer = XCT_UILayer.Table;
    protected animationDuration: number = 0;


    isAddedEvent: boolean = false;

    protected start(): void {
        if (!this.isAddedEvent) {
            this.addListener();
            this.isAddedEvent = true;
        }
    }


    init() {
    }

    protected onShowComplete() {
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








