// ZSTSB_MoveCtrl.ts
import { _decorator, Component, Node, Touch, EventTouch, Vec2, v2, v3, EventMouse, director } from 'cc';
import { ZSTSB_GameMgr } from './ZSTSB_GameMgr';
import { ZSTSB_GameData } from './ZSTSB_GameData';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_MoveCtrl')
export class ZSTSB_MoveCtrl extends Component {
    @property(Node)
    targetNode: Node = null!; // 需要缩放的目标节点

    @property
    wheelZoomSpeed: number = 0.1; // 鼠标滚轮缩放速度

    private touches: Touch[] = [];
    private initialDistance: number = 0;
    private initialScale: Vec2 = v2(1, 1);
    private currentScale: Vec2 = v2(1, 1);

    // 拖拽相关属性
    private isDragging: boolean = false;
    private lastTouchPos: Vec2 = v2(0, 0);
    private initialPosition: Vec2 = v2(0, 0);


    start() {
        director.getScene().on("钻石填色本_初始化游戏", this.initTouchEvent, this);
        director.getScene().on("钻石填色本_退出游戏", this.offTouchEvent, this);
    }

    initTouchEvent() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        // 添加鼠标滚轮事件监听
        this.node.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        console.error(222);
    }

    update(deltaTime: number) {

    }

    offTouchEvent() {
        // 取消监听事件
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        this.node.off(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        this.touches.length = 0;

        this.isDragging = false;
        this.initialDistance = 0;

        this.initialScale.set(1, 1);
        this.currentScale.set(1, 1);
        this.lastTouchPos.set(0, 0);
        this.initialPosition.set(0, 0);
    }

    private onTouchStart(event: EventTouch) {
        // console.log("开始触摸");

        const touch = event.touch;
        if (touch) {
            // 检查是否已存在这个触摸点
            const index = this.touches.findIndex(t => t.getID() === touch.getID());
            if (index === -1) {
                this.touches.push(touch);
            }

            let touchPos = v3(event.getUILocation().x, event.getUILocation().y, 0);

            // 当有两个触摸点时，记录初始距离
            if (this.touches.length === 2) {
                this.initialDistance = this.getTouchDistance(this.touches[0], this.touches[1]);
                if (this.targetNode) {
                    this.initialScale.set(this.targetNode.scale.x, this.targetNode.scale.y);
                }
                // 停止拖拽
                this.isDragging = false;
            }

            // 单指触摸开始时准备拖拽
            if (this.touches.length === 1 && !ZSTSB_GameMgr.instance.isLock) {
                const location = v3(event.getUILocation().x, event.getUILocation().y, 0);
                this.lastTouchPos.set(location.x, location.y);
                if (this.targetNode) {
                    this.initialPosition.set(this.targetNode.worldPosition.x, this.targetNode.worldPosition.y);
                }
            }

            //单指触摸且未拖拽
            if (this.touches.length === 1 && !this.isDragging) {
                ZSTSB_GameMgr.instance.onFill(touchPos);
            }

            // 双指触摸开始时准备拖拽
            if (this.touches.length === 2 && ZSTSB_GameMgr.instance.isLock) {
                this.isDragging = true;
                const location = v3(event.getUILocation().x, event.getUILocation().y, 0);
                this.lastTouchPos.set(location.x, location.y);
                if (this.targetNode) {
                    this.initialPosition.set(this.targetNode.worldPosition.x, this.targetNode.worldPosition.y);
                }
            }

            if (this.touches.length === 1 && ZSTSB_GameMgr.instance.isLock) {
                // console.log("开始填色");
                let touchPos = v3(event.getUILocation().x, event.getUILocation().y, 0);
                ZSTSB_GameMgr.instance.onFill(touchPos);
            }
        }
    }

    private onTouchMove(event: EventTouch) {
        // console.log("触摸中");

        if (ZSTSB_GameData.Instance.isGameFirst) {
            return;
        }

        let touchPos = v3(event.getUILocation().x, event.getUILocation().y, 0);

        // 双指触摸且视角未锁定时(缩放图片)
        if (this.touches.length === 2 && !ZSTSB_GameMgr.instance.isLock) {
            const currentDistance = this.getTouchDistance(this.touches[0], this.touches[1]);
            if (this.initialDistance > 0 && this.targetNode) {
                const scale = currentDistance / this.initialDistance;
                const newScaleX = this.initialScale.x * scale;
                const newScaleY = this.initialScale.y * scale;

                // 设置新的缩放值
                this.targetNode.setScale(newScaleX, newScaleY, this.targetNode.scale.z);
                this.currentScale.set(newScaleX, newScaleY);
            }
        }

        // 双指触摸且视角锁定时(缩放移动图片)
        if (this.touches.length === 2 && ZSTSB_GameMgr.instance.isLock) {
            const currentDistance = this.getTouchDistance(this.touches[0], this.touches[1]);
            if (this.initialDistance > 0 && this.targetNode) {
                const scale = currentDistance / this.initialDistance;
                const newScaleX = this.initialScale.x * scale;
                const newScaleY = this.initialScale.y * scale;

                // 设置新的缩放值
                this.targetNode.setScale(newScaleX, newScaleY, this.targetNode.scale.z);
                this.currentScale.set(newScaleX, newScaleY);
            }

            const currentPos = this.getMidPoint(this.touches[0], this.touches[1]);;

            if (this.touches[1] && this.targetNode) {
                const deltaX = currentPos.x - this.lastTouchPos.x;
                const deltaY = currentPos.y - this.lastTouchPos.y;

                // 更新目标节点位置
                const newX = this.initialPosition.x + deltaX;
                const newY = this.initialPosition.y + deltaY;
                this.targetNode.worldPosition = v3(newX, newY, this.targetNode.position.z);
            }
        }

        // //单指触摸且未锁定视角时(拖拽移动视角)
        // if (this.touches.length === 1 && !this.isDragging) {
        //     ZSTSB_GameMgr.instance.onFill(touchPos);
        // }

        //单指触摸且未锁定视角时(拖拽移动视角)
        if (this.touches.length === 1 && !ZSTSB_GameMgr.instance.isLock) {
            const touch = event.touch;
            this.isDragging = true;
            const currentPos = v3(touch.getUILocation().x, touch.getUILocation().y, 0);

            if (touch && this.targetNode) {
                const deltaX = currentPos.x - this.lastTouchPos.x;
                const deltaY = currentPos.y - this.lastTouchPos.y;

                // 更新目标节点位置
                const newX = this.initialPosition.x + deltaX;
                const newY = this.initialPosition.y + deltaY;
                this.targetNode.worldPosition = v3(newX, newY, this.targetNode.position.z);
            }
        }

        //单指触摸且锁定视角时(拖拽批量填充)
        if (this.touches.length === 1 && ZSTSB_GameMgr.instance.isLock) {
            ZSTSB_GameMgr.instance.onFill(touchPos);
        }
    }

    private onTouchEnd(event: EventTouch) {
        // console.log("结束触摸");

        director.getScene().emit("钻石填色本_结束填色");

        const touch = event.touch;
        if (touch) {
            // 从触摸点数组中移除结束的触摸点
            const index = this.touches.findIndex(t => t.getID() === touch.getID());
            if (index !== -1) {
                this.touches.splice(index, 1);
            }

            // 重置拖拽状态
            if (this.touches.length < 1) {
                this.isDragging = false;
            }
        }

        this.touches.length = 0;
    }

    // 鼠标滚轮事件处理
    private onMouseWheel(event: EventMouse) {
        // 只有在非锁定状态下才能使用鼠标滚轮缩放
        if (!ZSTSB_GameMgr.instance.isLock && this.targetNode) {
            // 获取滚轮滚动方向和幅度
            const wheelDelta = event.getScrollY();

            // 根据滚轮方向计算缩放因子
            const zoomFactor = 1 + (wheelDelta > 0 ? this.wheelZoomSpeed : -this.wheelZoomSpeed);

            // 获取当前缩放值
            const currentScaleX = this.targetNode.scale.x;
            const currentScaleY = this.targetNode.scale.y;

            // 计算新的缩放值
            const newScaleX = currentScaleX * zoomFactor;
            const newScaleY = currentScaleY * zoomFactor;

            // 设置新的缩放值
            this.targetNode.setScale(newScaleX, newScaleY, this.targetNode.scale.z);
            this.currentScale.set(newScaleX, newScaleY);
        }
    }

    // 计算两个触摸点之间的距离的中点
    private getMidPoint(touch1: Touch, touch2: Touch): Vec2 {
        const pos1 = touch1.getLocation();
        const pos2 = touch2.getLocation();

        // 中点坐标 = ((x1 + x2) / 2, (y1 + y2) / 2)
        const midX = (pos1.x + pos2.x) / 2;
        const midY = (pos1.y + pos2.y) / 2;

        return v2(midX, midY);
    }

    // 计算两个触摸点之间的距离
    private getTouchDistance(touch1: Touch, touch2: Touch): number {
        const pos1 = touch1.getLocation();
        const pos2 = touch2.getLocation();
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

