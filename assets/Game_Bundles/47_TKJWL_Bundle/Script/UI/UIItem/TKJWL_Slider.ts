import { _decorator, Component, Node, Vec3, UITransform, EventTouch, input, Input, Touch, Animation } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_Slider')
export class TKJWL_Slider extends Component {
    @property({ type: Node, tooltip: "滑块容器节点" })
    container: Node = null!;

    @property({ type: Node, tooltip: "滑块按钮节点" })
    point: Node = null!;

    private _containerTrans: UITransform = null!; // 容器的UITransform组件
    private _pointTrans: UITransform = null!;    // 滑块的UITransform组件
    private _minY: number = 0;                   // 滑块最低Y坐标（世界坐标）
    private _maxY: number = 0;                   // 滑块最高Y坐标（世界坐标）
    private _isDragging: boolean = false;        // 是否正在拖拽

    onLoad() {      
        // 注册事件
        this.addListener();
        // 获取UI组件
        this._containerTrans = this.container.getComponent(UITransform)!;
        this._pointTrans = this.point.getComponent(UITransform)!;
        
        // 计算滑块可移动范围（世界坐标）
        this.calculateMoveRange();
    }

    showTutorial(){
        this.node.getChildByName("tutorial").active = true;
        let anim = this.node.getChildByName("tutorial").getComponent(Animation)!;
        anim.play();
    }

    /** 计算滑块可移动的Y轴范围（世界坐标） */
    private calculateMoveRange() {
        // 容器的世界坐标范围
        const containerWorldPos = this.container.worldPosition;
        const containerHalfHeight = this._containerTrans.height / 2;
        
        // 滑块的高度（用于边界计算）
        const pointHeight = this._pointTrans.height;
        
        // 最低Y：容器底部位置（容器中心Y - 容器半高） + 滑块半高（避免滑块超出容器底部）
        this._minY = containerWorldPos.y - containerHalfHeight + pointHeight / 2;
        // 最高Y：容器顶部位置（容器中心Y + 容器半高） - 滑块半高（避免滑块超出容器顶部）
        this._maxY = containerWorldPos.y + containerHalfHeight - pointHeight / 2;
    }

    private onTouchStart(event: EventTouch) {
        this._isDragging = true;
        TKJWL_DataManager.Instance.isTelescopeTutorialShowed = true;
        this.node.getChildByName("tutorial").active = false;
    }

    /** 触摸移动时更新滑块位置 */
    private onTouchMove(event: EventTouch) {
        if (!this._isDragging) return;
        
        // 获取触摸点的世界坐标（UI坐标与世界坐标在2D场景中可直接复用）
        const touchWorldPos = event.getUILocation();
        // 只更新Y轴位置，保持X轴与容器中心一致
        const containerWorldPos = this.container.worldPosition;
        let targetY = touchWorldPos.y;

        // 限制Y轴在可移动范围内
        targetY = Math.max(this._minY, Math.min(targetY, this._maxY));

        // 设置滑块世界坐标（X轴保持与容器中心一致）
        this.point.worldPosition = new Vec3(containerWorldPos.x, targetY, 0);

        // 触发进度更新（可根据需要改为事件通知）
        const progress = this.getProgress();
        EventManager.Scene.emit(TKJWL_GameEvents.TELESCOPE_PROGRESS_CHANGED, progress);
        // return;
        
        // this.onProgressChanged(progress);
        // console.log("当前进度：", progress);
    }

    /** 触摸结束时重置状态 */
    private onTouchEnd() {
        this._isDragging = false;
    }

    /** 根据进度设置滑块位置（功能1）
     * @param progress 进度值（0~1），0对应最底部，1对应最顶部
     */
    public setProgress(progress: number) {
        // 限制进度在0~1范围内
        const clampedProgress = Math.max(0, Math.min(1, progress));
        // 计算目标Y坐标（根据进度映射到minY~maxY范围）
        const targetY = this._minY + clampedProgress * (this._maxY - this._minY);
        // 设置滑块世界坐标（X轴与容器中心一致）
        this.point.worldPosition = new Vec3(this.container.worldPosition.x, targetY, 0);
        // 触发进度更新（可根据需要改为事件通知）
        EventManager.Scene.emit(TKJWL_GameEvents.TELESCOPE_PROGRESS_CHANGED, progress);

        // this.onProgressChanged(progress);
    }

    /** 获取当前进度（功能2）
     * @returns 当前进度值（0~1）
     */
    public getProgress(): number {
        const pointY = this.point.worldPosition.y;
        // 计算进度（Y坐标映射到0~1范围）
        return (pointY - this._minY) / (this._maxY - this._minY);
    }

    /** 进度变化回调（可根据需要扩展） */
    private onProgressChanged(progress: number) {
        return;
        EventManager.Scene.emit(TKJWL_GameEvents.TELESCOPE_PROGRESS_CHANGED, progress);
    }

    addListener(){
        EventManager.on(TKJWL_GameEvents.SET_TELESCOPE_PROGRESS, this.setProgress, this);
        EventManager.on(TKJWL_GameEvents.SHOW_TELESCOPE_TUTORIAL, this.showTutorial, this);

        this.point.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.point.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.point.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.point.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    removeListener(){
        EventManager.off(TKJWL_GameEvents.SET_TELESCOPE_PROGRESS, this.setProgress, this);
        EventManager.off(TKJWL_GameEvents.SHOW_TELESCOPE_TUTORIAL, this.showTutorial, this);
    }

    onDestroy() {
        this.removeListener();
    }
}