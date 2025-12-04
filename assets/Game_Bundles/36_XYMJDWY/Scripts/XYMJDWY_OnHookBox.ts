import { _decorator, Component, Node, Sprite, SpriteFrame, tween, v3, Vec3 } from 'cc';
import { XYMJDWY_Incident } from './XYMJDWY_Incident';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_OnHookBox')
export class XYMJDWY_OnHookBox extends Component {
    start() {
        this.playParabolaAnimation();
    }
    Init(name: string) {
        XYMJDWY_Incident.LoadSprite("Sprites/Prop/" + name).then((sp: SpriteFrame) => {
            this.node.getComponent(Sprite).spriteFrame = sp;
        })
    }
    playParabolaAnimation() {
        // 获取节点初始位置
        const startPos = this.node.position.clone();

        // 定义抛物线的最高点（控制点）和落点
        // 假设水平向右移动400，向上跳跃300，最终落回屏幕外（下方）
        let x = startPos.x + (Math.random() * 1600 - 800);
        let y = startPos.x + (Math.random() * 600 + 200);
        const peakPos = new Vec3(x, startPos.y + y, 0); // 控制点（抛物线顶点）
        const endPos = new Vec3(x, -1000, 0); // 终点落到屏幕外下方

        // 二次贝塞尔曲线公式
        const twoBezier = (t: number, p0: Vec3, p1: Vec3, p2: Vec3) => {
            const x = (1 - t) * (1 - t) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x;
            const y = (1 - t) * (1 - t) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y;
            return new Vec3(x, y, 0);
        };

        // 设置Tween持续时间
        const duration = 1.5;

        tween(this.node.position)
            .to(duration, new Vec3(), { // 此处目标值仅为占位，实际位置在onUpdate中计算
                onUpdate: (target: Vec3, ratio: number) => {
                    // 根据当前进度比例计算贝塞尔曲线上的位置
                    const newPos = twoBezier(ratio, startPos, peakPos, endPos);
                    this.node.setPosition(newPos);
                }
            })
            .call(() => {
                // 动画完成，销毁节点
                if (this.node.isValid) {
                    this.node.destroy(); // 正确销毁节点:cite[2]:cite[4]:cite[7]
                }
            })
            .start();
        let angle = Math.random() * 1800 + 900;
        tween(this.node)
            .to(4, { angle: angle })
            .start();
        tween(this.node)
            .to(4, { scale: v3(5, 5, 5) })
            .start();
    }
}


