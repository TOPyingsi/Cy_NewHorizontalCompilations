import { _decorator, Component, Node, Vec3, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PKP_CardNode')
export class PKP_CardNode extends Component {

    public isFaceUp: boolean = false; // 是否正面朝上
    private animation: Animation = null; // 动画组件

    onLoad() {
        this.animation = this.getComponent(Animation);
    }

    start() {

    }

    // 翻转卡片
    public filp(): void {
        // 如果卡片是正面朝上，则不执行翻转操作
        if (this.isFaceUp == false) {
            this.isFaceUp = true; // 取反
            // 沿着X轴旋转180度，其它轴不变
            this.node.setRotationFromEuler(180, this.node.eulerAngles.y, this.node.eulerAngles.z);

            this.hideAfterFilp(); // 翻转后隐藏
        }
    }

    // 使卡片不显示
    private hideAfterFilp(): void {
        if (this.isFaceUp) {
            this.scheduleOnce(() => {
                // 播放消失动画
                this.animation.play('disappearCard');
                this.scheduleOnce(() => this.node.active = false, 1); // 使节点不可见
            }, 1);   // x秒后执行
        }
    }

    // 播放动画
    public playAnim(): void {
        this.animation.play();
    }
}