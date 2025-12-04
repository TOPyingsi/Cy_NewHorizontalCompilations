import { _decorator, Component, Node, Animation, AudioClip } from 'cc';
import { PKP_ButtonManager } from './PKP_ButtonManager';
import { PKP_BattleManager } from './PKP_BattleManager';
import { PKP_AudioManager } from './PKP_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('PKP_Player')
export class PKP_Player extends Component {
    // 单例模式
    private static _instance: PKP_Player = null;
    public static get instance(): PKP_Player {
        return PKP_Player._instance;
    }

    @property
    private delayTime: number = 0.5; // 延迟时间

    @property(Animation)
    public animation: Animation = null; // 动画组件

    @property(AudioClip)
    public attackAudio: AudioClip = null; // 攻击音效

    onLoad() {
        PKP_Player._instance = this;
        console.log('玩家实例化' + PKP_Player.instance);
    }

    start() {
    }

    public attack() {
        console.log('玩家攻击'); // 在这里编写玩家攻击的逻辑
        PKP_ButtonManager.instance.show(); // 显示按钮

        this.scheduleOnce(() => {
            // 显示卡片
        }, this.delayTime)
    }

    // 播放攻击动画
    public playAttackAnimation(index: number) {
        switch (index) {
            case 1:
                this.animation.play('Attack1_Player');
                break;
            case 2:
                this.animation.play('Attack2_Player');
                break;
            case 3:
                this.animation.play('Attack3_Player');
                break;
        }
    }

    // 玩家动画播放完毕事件触发
    player_AnimationFinish() {
        console.log('玩家动画播放完毕');
        PKP_ButtonManager.instance.attackAnimatoinFinish();    // 调用CardManager的filpCard方法
    }

    // 播放攻击音效
    playAttackAudio() {
        // 播放攻击音效
        PKP_AudioManager.instance.playOneShot(this.attackAudio, 2);
    }
}