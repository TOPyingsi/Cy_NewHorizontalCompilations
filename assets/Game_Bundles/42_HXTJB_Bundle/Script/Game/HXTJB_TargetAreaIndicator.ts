import { _decorator, Component, Node, Color, MeshRenderer, Vec3, Tween, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_TargetAreaIndicator')
export class HXTJB_TargetAreaIndicator extends Component {
    // @property(MeshRenderer)
    // areaRenderer: MeshRenderer = null;  // 区域渲染器

    // @property(Color)
    // normalColor: Color = new Color(1, 0, 0, 0.3);  // 正常状态颜色

    // @property(Color)
    // highlightColor: Color = new Color(1, 0.5, 0, 0.5);  // 高亮状态颜色

    // @property
    // pulseSpeed: number = 2.0;  // 脉冲动画速度

    // private originalScale: Vec3;

    // start() {
    //     this.originalScale = this.node.scale.clone();
        
    //     // 设置初始颜色
    //     if (this.areaRenderer && this.areaRenderer.material) {
    //         this.areaRenderer.material.setProperty('albedoColor', this.normalColor);
    //     }

    //     // 启动脉冲动画
    //     this.startPulseAnimation();
    // }

    // // 开始脉冲动画
    // startPulseAnimation() {
    //     tween(this.node)
    //         .to(this.pulseSpeed / 2, { scale: Vec3.multiplyScalar(new Vec3(), this.originalScale, 1.05) })
    //         .to(this.pulseSpeed / 2, { scale: this.originalScale })
    //         .repeatForever()
    //         .start();
    // }

    // // 高亮显示
    // highlight() {
    //     if (this.areaRenderer && this.areaRenderer.material) {
    //         this.areaRenderer.material.setProperty('albedoColor', this.highlightColor);
    //     }
    // }

    // // 恢复正常显示
    // resetColor() {
    //     if (this.areaRenderer && this.areaRenderer.material) {
    //         this.areaRenderer.material.setProperty('albedoColor', this.normalColor);
    //     }
    // }
}
