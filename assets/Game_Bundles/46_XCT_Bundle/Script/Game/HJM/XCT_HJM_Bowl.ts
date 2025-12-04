import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, tween, Tween, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';

import { XCT_Events } from '../../Common/XCT_Events';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
const { ccclass, property } = _decorator;


@ccclass('XCT_HJM_Bowl')
export class XCT_HJM_Bowl extends Component {

    @property(Node)
    bowlContainer1: Node = null; // 面节点

    @property(Node)
    commonContainer: Node = null; // 面节点

    @property(Node)
    bowlContainer2: Node = null; // 面节点

    @property(Node)
    worldPos_1: Node = null; // 位置1

    @property(Node)
    worldPos_2: Node = null; // 位置2

    count: number = 0; // 点击次数


    protected onLoad(): void {
        this.addListener();
    }

    private moveToPos2() {
        let currentWorldPos = this.node.worldPosition;
        this.node.setParent(this.commonContainer);
        this.node.setWorldPosition(currentWorldPos);
        tween(this.node)
            .call(() => {
                this.node.getChildByName("cookArea").active = true;
            })
            .delay(0.2)
            .to(0.5, { worldPosition: this.worldPos_2.worldPosition })
            .call(() => {
                currentWorldPos = this.node.worldPosition;
                this.node.setParent(this.bowlContainer2);
                this.node.setWorldPosition(currentWorldPos);
            })
            .start();

        tween(this.node)
            .delay(0.2)
            .to(0.5, { scale: v3(this.worldPos_2.scale.x, this.worldPos_2.scale.y, 1) })
            .start();
    }



    private addListener() {
        EventManager.on(XCT_Events.HJM_Change_CookArea, this.moveToPos2, this);
    }

    private removeListener() {
        EventManager.off(XCT_Events.HJM_Change_CookArea, this.moveToPos2, this);
    }

    onDestroy() {
        this.removeListener();
    }
}


