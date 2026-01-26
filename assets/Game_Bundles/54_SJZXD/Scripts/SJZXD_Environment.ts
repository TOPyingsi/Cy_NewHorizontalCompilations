import { _decorator, Animation, Component, Node, ParticleSystem2D, tween, v3 } from 'cc';
import { SJZXD_AudioManager } from './SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Environment')
export class SJZXD_Environment extends Component {

    start() {
        this.schedule(() => {
            SJZXD_AudioManager.globalAudioPlay("炮火轰炸");
            this.scheduleOnce(() => {
                this.node.getChildByName("爆炸").position = Math.random() < 0.5 ? v3(-784, 69, 0) : v3(300, 51, 0);
                this.node.getChildByName("爆炸").getComponent(Animation).play();
                this.BGShadow();
                this.scheduleOnce(() => {
                    this.node.getChildByName("砂砾").getComponent(ParticleSystem2D).resetSystem();
                }, 0.8)
            }, 2.8)
        }, 15)
    }

    //背景抖动
    BGShadow() {
        // 保存原始位置和旋转
        const originalPos = this.node.position;
        const originalAngle = this.node.angle; // 保存原始旋转角度

        // 定义抖动参数
        const duration = 0.8; // 总抖动时间
        const maxShake = 20; // 最大位置抖动幅度
        const maxRotation = 3; // 最大旋转角度
        const shakeDecay = 0.85; // 抖动衰减系数
        const rotationDecay = 0.85; // 旋转衰减系数

        // 创建抖动序列
        let shakeCount = 0;
        const maxShakes = 10; // 抖动次数

        const shakeSequence = () => {
            if (shakeCount < maxShakes) {
                // 计算当前抖动幅度（逐渐减小）
                const currentShake = maxShake * Math.pow(shakeDecay, shakeCount);
                const currentRotation = maxRotation * Math.pow(rotationDecay, shakeCount);

                // 随机上下方向抖动
                const posDirection = Math.random() > 0.5 ? 1 : -1;
                const rotDirection = Math.random() > 0.5 ? 1 : -1;

                const offsetY = currentShake * posDirection;
                const rotOffset = currentRotation * rotDirection;

                // 执行抖动动画（位置和旋转同时变化）
                tween(this.node.getChildByName("室外"))
                    .by(0.05, {
                        y: offsetY,
                        angle: rotOffset
                    }) // 快速移动到偏移位置并旋转
                    .by(0.05, {
                        y: -offsetY,
                        angle: -rotOffset
                    }) // 返回原始位置和旋转
                    .call(() => {
                        shakeCount++;
                        // 递归调用下一次抖动
                        if (shakeCount < maxShakes) {
                            shakeSequence();
                        } else {
                            // 最后确保回到原始位置和角度
                            this.node.setPosition(originalPos);
                            this.node.angle = originalAngle;
                        }
                    })
                    .start();
            }
        };

        // 开始抖动序列
        shakeSequence();
    }
}


