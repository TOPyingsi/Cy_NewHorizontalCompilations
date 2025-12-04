import { _decorator, Component, EventTouch, Input, instantiate, Node, Prefab, Touch, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XCT_Events } from './XCT_Events';
const { ccclass, property } = _decorator;

@ccclass('XCT_DishNodeDrag')
export class XCT_DishNodeDrag extends Component {

    startPos: Vec3 = null;

    @property(Node)
    targetArea: Node = null; // 锅子节点



    private isCanMove: boolean = false;

    protected onLoad(): void {
        this.startPos = this.node.getWorldPosition();
        // 注册触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /** 触摸开始：初始化角度 */
    private onTouchStart(event: Touch): void {
        this.isCanMove = true;

        const touchPos = event.getUILocation(); // 触摸点世界坐标
        this.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));
    }

    /** 触摸移动：实时更新角度和旋转 */
    private onTouchMove(event: Touch): void {
        if (!this.isCanMove) return;
        const touchPos = event.getUILocation();

        this.node.setWorldPosition(v3(touchPos.x, touchPos.y, 0));
    }


    /** 触摸结束：重置状态 */
    private onTouchEnd(event: Touch): void {
        if (!this.isCanMove) return;
        const uiTrans = this.targetArea.getComponent(UITransform);
        const isInside = uiTrans.getBoundingBoxToWorld().contains(v2(this.node.getWorldPosition().x, this.node.getWorldPosition().y))

        if (isInside) {
            this.node.active = false;
            this.node.setWorldPosition(this.startPos);
            EventManager.Scene.emit(XCT_Events.Dish_Drag_End);

        } else {
            this.node.setWorldPosition(this.startPos);
        }
    }
}


