import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NQXLC_Camera')
export class NQXLC_Camera extends Component {
    public static Instance: NQXLC_Camera = null;

    originalPosition: Vec3 = new Vec3();// 摄像机原始位置

    // 抖动持续时间
    private shakeDuration: number = 0.2;

    // 抖动强度
    private shakeStrength: number = 10;

    protected onLoad(): void {
        NQXLC_Camera.Instance = this;
    }

    protected start(): void {
        this.originalPosition = this.node.getPosition().clone();
    }

    /**
     * 开始屏幕抖动
     */
    shakeCamera(cb: Function = null) {
        console.log(11);

        if (!this.node) {
            console.error('未绑定摄像机节点！');
            return;
        }

        this.originalPosition.set(this.node.position); // 记录摄像机原始位置

        let elapsedTime = 0;
        const shakeInterval = 0.02; // 抖动的间隔时间（越小越平滑）

        this.schedule(() => {
            if (elapsedTime >= this.shakeDuration) {
                // 抖动结束，恢复摄像机到原始位置
                this.node.setPosition(this.originalPosition);
                this.unscheduleAllCallbacks();
                cb && cb();
                return;
            }

            // 随机偏移摄像机位置
            const offsetX = (Math.random() - 0.5) * 2 * this.shakeStrength;
            const offsetY = (Math.random() - 0.5) * 2 * this.shakeStrength;

            const newPosition = new Vec3(
                this.originalPosition.x + offsetX,
                this.originalPosition.y + offsetY,
                this.originalPosition.z
            );

            this.node.setPosition(newPosition);
            elapsedTime += shakeInterval;
        }, shakeInterval);
    }



}


