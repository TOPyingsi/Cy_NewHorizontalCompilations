import { _decorator, Component, Node, Vec3, UITransform, EventTouch, v3, EventMouse, systemEvent, SystemEvent, SystemEventType, Slider, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BHPD_MoveCtrl')
export class BHPD_MoveCtrl extends Component {

    // 缩放相关属性
    @property
    private minScale: number = 1; // 最小缩放比例

    @property
    private maxScale: number = 2; // 最大缩放比例

    @property
    private zoomSpeed: number = 0.1; // 滚轮缩放速度

    private startPos: Vec3 = new Vec3();
    private touchPos: Vec3 = new Vec3();
    private originalScale: Vec3 = new Vec3(1, 1, 1);
    private isDragging: boolean = false;
    private nodeUITransform: UITransform | null = null;

    start() {
        // 保存初始缩放
        this.originalScale.set(this.node.scale);

        // 获取节点的UITransform组件
        this.nodeUITransform = this.node.getComponent(UITransform);

        // 监听触摸事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        // 监听鼠标滚轮事件
        this.node.on(Node.EventType.MOUSE_WHEEL, this.onMouseWheel, this);

        director.getScene().on("八花拼豆_放缩", (progress: number) => {
            this.onSliderChanged(progress);
        })
    }

    onTouchStart(event: EventTouch) {
        // 只响应单指触摸
        if (event.getTouches().length > 1) return;

        this.isDragging = true;
        // 获取触摸位置
        this.touchPos = v3(event.getUILocation().x, event.getUILocation().y);
        // 转换为本地坐标
        this.node.getComponent(UITransform)?.convertToNodeSpaceAR(this.touchPos, this.startPos);
    }

    onTouchMove(event: EventTouch) {
        if (!this.isDragging) return;

        // 获取当前触摸位置
        this.touchPos = v3(event.getUILocation().x, event.getUILocation().y);
        // 转换为本地坐标并更新节点位置
        this.node.getComponent(UITransform)?.convertToNodeSpaceAR(this.touchPos, this.touchPos);
        let newPosition = new Vec3(
            this.node.position.x + (this.touchPos.x - this.startPos.x),
            this.node.position.y + (this.touchPos.y - this.startPos.y),
            this.node.position.z
        );

        // 限制节点不超出自身边界
        newPosition = this.clampPositionWithinBounds(newPosition);

        this.node.setPosition(newPosition);
    }

    onTouchEnd(event: EventTouch) {
        this.isDragging = false;
    }

    /**
    * 限制节点位置在自身边界内，确保图片边缘始终在UITransform框内
    * @param position 目标位置
    * @returns 限制后的位置
    */
    private clampPositionWithinBounds(position: Vec3): Vec3 {
        if (!this.nodeUITransform) {
            return position;
        }

        // 获取节点的宽高
        const width = this.nodeUITransform.width;
        const height = this.nodeUITransform.height;

        // 考虑当前缩放因子
        const scaleX = Math.abs(this.node.scale.x);
        const scaleY = Math.abs(this.node.scale.y);

        // 计算锚点偏移（相对于中心点）
        const anchorPoint = this.nodeUITransform.anchorPoint;
        const centerOffsetX = (0.5 - anchorPoint.x) * width;
        const centerOffsetY = (0.5 - anchorPoint.y) * height;

        // 计算可视区域边界（考虑缩放）
        const visibleHalfWidth = (width * scaleX) / 2;
        const visibleHalfHeight = (height * scaleY) / 2;

        // 计算可移动范围边界
        const contentHalfWidth = width / 2;
        const contentHalfHeight = height / 2;

        // 计算允许的最大移动范围
        const maxOffsetX = Math.max(0, visibleHalfWidth - contentHalfWidth);
        const maxOffsetY = Math.max(0, visibleHalfHeight - contentHalfHeight);

        // 限制位置在边界内
        const clampedX = Math.min(Math.max(position.x, centerOffsetX - maxOffsetX), centerOffsetX + maxOffsetX);
        const clampedY = Math.min(Math.max(position.y, centerOffsetY - maxOffsetY), centerOffsetY + maxOffsetY);

        return new Vec3(clampedX, clampedY, position.z);
    }

    onSliderChanged(Value: number) {
        // 假设滑动条返回的是0-1之间的值，映射到1-2倍缩放
        const scaleValue = 1 + Value;

        const newScale = new Vec3(
            this.originalScale.x * scaleValue,
            this.originalScale.y * scaleValue,
            this.originalScale.z * scaleValue
        );
        this.node.setScale(newScale);

        // 计算新的缩放值
        const currentScale = this.node.scale;
        let newScaleX = currentScale.x;
        let newScaleY = currentScale.y;
        let newScaleZ = currentScale.z;

        // 限制缩放范围
        newScaleX = Math.min(Math.max(Math.abs(newScaleX), this.minScale), this.maxScale) * Math.sign(newScaleX);
        newScaleY = Math.min(Math.max(Math.abs(newScaleY), this.minScale), this.maxScale) * Math.sign(newScaleY);
        newScaleZ = Math.min(Math.max(Math.abs(newScaleZ), this.minScale), this.maxScale) * Math.sign(newScaleZ);

        // 限制节点不超出自身边界
        let newPosition = new Vec3(
            this.node.position.x - this.startPos.x,
            this.node.position.y - this.startPos.y,
            this.node.position.z
        );

        newPosition = this.clampPositionWithinBounds(newPosition);

        this.node.setPosition(newPosition);

    }

    /**
    * 处理鼠标滚轮事件实现缩放
    * @param event 鼠标事件
    */
    onMouseWheel(event: EventMouse) {
        // 获取滚轮滚动值
        const scrollY = event.getScrollY();

        // 根据滚轮方向计算缩放因子
        const zoomFactor = 1 + (scrollY > 0 ? this.zoomSpeed : -this.zoomSpeed);

        // 计算新的缩放值
        const currentScale = this.node.scale;
        let newScaleX = currentScale.x * zoomFactor;
        let newScaleY = currentScale.y * zoomFactor;
        let newScaleZ = currentScale.z * zoomFactor;

        // 限制缩放范围
        newScaleX = Math.min(Math.max(Math.abs(newScaleX), this.minScale), this.maxScale) * Math.sign(newScaleX);
        newScaleY = Math.min(Math.max(Math.abs(newScaleY), this.minScale), this.maxScale) * Math.sign(newScaleY);
        newScaleZ = Math.min(Math.max(Math.abs(newScaleZ), this.minScale), this.maxScale) * Math.sign(newScaleZ);

        // 应用新缩放
        this.node.setScale(newScaleX, newScaleY, newScaleZ);

        let newPosition = new Vec3(
            this.node.position.x - this.startPos.x,
            this.node.position.y - this.startPos.y,
            this.node.position.z
        );

        // 限制节点不超出自身边界
        newPosition = this.clampPositionWithinBounds(newPosition);

        this.node.setPosition(newPosition);
    }
}