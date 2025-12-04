import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_CountdownTimer')
export class HJMWK_CountdownTimer extends Component {

    @property(Label)
    Timer: Label = null;

    @property(Node)
    Video: Node = null;

    @property
    initialTime: number = 60; // 初始倒计时秒数（默认60秒）

    IsRunning: boolean = false; // 是否正在倒计时

    private remainingTime: number = 0; // 剩余时间（秒）
    private countdownSchedule: any = null; // 调度引用

    /**
     * 开始倒计时
     * @param time 可选，覆盖初始时间（秒）
     */
    public startCountdown(time?: number, cb: Function = null) {
        this.stopCountdown(); // 先停止当前计时
        this.Timer.node.active = true;
        this.Video.active = false;

        this.remainingTime = time !== undefined ? time : this.initialTime;
        this.IsRunning = true;

        this.updateDisplay();

        // 每秒更新一次
        this.countdownSchedule = this.schedule(() => {
            if (this.remainingTime > 0) {
                this.remainingTime--;
                this.updateDisplay();
            } else {
                this.stopCountdown();
                cb && cb();
            }
        }, 1); // 间隔1秒
    }

    // 更新显示（格式M:SS）
    private updateDisplay() {
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        this.Timer.string = `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 停止倒计时并重置
     */
    public stopCountdown() {
        if (this.countdownSchedule) {
            this.unschedule(this.countdownSchedule);
            this.countdownSchedule = null;
        }
        this.IsRunning = false;
        this.remainingTime = 0;
        this.updateDisplay(); // 显示0:00
        if (this.Timer.node) this.Timer.node.active = false;
        this.Video.active = true;
    }

    /**
     * 获取剩余时间（秒）
     */
    public get timeLeft(): number {
        return this.remainingTime;
    }

    onDestroy() {
        this.stopCountdown();
    }
}


