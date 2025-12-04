import { _decorator, Component, Node, find, Animation, AudioClip } from 'cc';
import { PKP_ButtonManager } from './PKP_ButtonManager';
import { PKP_BattleManager } from './PKP_BattleManager';
import { PKP_AudioManager } from './PKP_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('PKP_Opponent')
export class PKP_Opponent extends Component {
    // 单例模式
    private static _instance: PKP_Opponent = null;
    public static get instance(): PKP_Opponent {
        return PKP_Opponent._instance;
    }

    @property
    private delayTime: number = 0.5; // 对手攻击的延迟时间

    @property(Animation)
    public animation: Animation = null; // 动画组件

    @property(AudioClip)
    public attackAudio: AudioClip = null; // 攻击音频

    @property(Number)
    public chooseIndex: number = 0; // 选择对手模型

    @property({ type: Node })
    public opponentModel: Node[] = []; // 对手模型节点

    onLoad() {
        PKP_Opponent._instance = this;
        console.log('对手实例化' + PKP_Opponent.instance);
    }

    start() {
        this.initOpponentModel(); // 初始化对手模型
    }

    // 初始化对手模型
    public initOpponentModel() {
        console.log('初始化对手模型' + this.chooseIndex);
        for (let i = 0; i < this.opponentModel.length; i++) {
            if (i == this.chooseIndex) {
                this.opponentModel[i].active = true;
            } else {
                this.opponentModel[i].active = false;
            }
        }
    }

    // 攻击
    public attack() {
        console.log('对手攻击'); // 在这里编写对手攻击的逻辑
        PKP_ButtonManager.instance.hide(); // 隐藏按钮
        // PKP_ButtonManager.instance.randomAttack(); // 随机攻击

        this.scheduleOnce(() => PKP_ButtonManager.instance.randomAttack(), this.delayTime);

        // this.scheduleOnce(() => {
        //     // 显示卡片
        // }, this.delayTime)
    }

    // 播放攻击动画
    public playAttackAnimation(index: number) {
        switch (index) {
            case 1:
                this.animation.play('Attack1_Opponent');
                break;
            case 2:
                this.animation.play('Attack2_Opponent');
                break;
            case 3:
                this.animation.play('Attack3_Opponent');
                break;
        }
    }

    // 播放动画完成
    opponent_AnimationFinish() {
        console.log('对手动画播放完毕');
        PKP_ButtonManager.instance.attackAnimatoinFinish();    // 调用CardManager的filpCard方法
    }

    // 播放音频
    opponent_AttackAudio() {
        PKP_AudioManager.instance.playOneShot(this.attackAudio, 2);
    }
}