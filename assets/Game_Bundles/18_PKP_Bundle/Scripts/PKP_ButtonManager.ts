import { _decorator, AudioClip, director, Component, Node, find } from 'cc';
import { PKP_CardManager } from './PKP_CardManager';
import { PKP_BattleManager } from './PKP_BattleManager';
import { PKP_Player } from './PKP_Player';
import { PKP_Opponent } from './PKP_Opponent';
import { PKP_AudioManager } from './PKP_AudioManager';
import { PKP_ScoreManager } from './PKP_ScoreManager';
const { ccclass, property } = _decorator;

@ccclass('PKP_ButtonManager')
export class PKP_ButtonManager extends Component {
    // 单例模式
    private static _instance: PKP_ButtonManager = null;
    public static get instance(): PKP_ButtonManager {
        return PKP_ButtonManager._instance;
    }

    @property(AudioClip)
    public attackAudio: AudioClip = null;
    public buttons: any[] = [];
    public delayTime: number = 1; // 按钮点击后延迟时间

    onLoad() {
        PKP_ButtonManager._instance = this;
    }

    start() {

    }

    // 显示按钮
    public show() {
        console.log('显示按钮');
        if (this.node.active == false) {
            this.node.active = true;
        }
    }

    // 隐藏按钮
    public hide() {
        console.log('隐藏按钮');
        if (this.node.active == true) {
            this.node.active = false;
        }
    }

    // 攻击按钮1
    public onClick_Attack1() {
        console.log("Fire");
        PKP_AudioManager.instance.playOneShot(this.attackAudio, 2);
        this.hide(); // 隐藏按钮
        // 播放人物的拍击动画
        this.playAttackAnimation(1); // x秒后再次调用changeTurn方法
    }

    // 攻击按钮2
    public onClick_Attack2() {
        console.log("Fire Fire");
        PKP_AudioManager.instance.playOneShot(this.attackAudio, 2);
        this.hide(); // 隐藏按钮
        // 播放人物的拍击动画
        this.playAttackAnimation(2); // x秒后再次调用changeTurn方法
    }

    // 攻击按钮3
    // 点击攻击按钮3
    public onClick_Attack3() {
        console.log("Fire Fire Fire");
        PKP_AudioManager.instance.playOneShot(this.attackAudio, 2);
        this.hide(); // 隐藏按钮
        // 播放人物的拍击动画
        this.playAttackAnimation(3); // x秒后再次调用changeTurn方法
    }

    // 播放攻击动画
    public playAttackAnimation(index: number) {
        if (PKP_BattleManager.instance.isPlayerTurn) {
            // TODO:播放玩家攻击动画
            PKP_Player.instance.playAttackAnimation(index);
        }
        else {
            // TODO:播放对手攻击动画
            PKP_Opponent.instance.playAttackAnimation(index);
        }
    }

    // 攻击按钮事件
    public attackAnimatoinFinish() {

        // 翻牌，接着播放翻牌动画
        PKP_CardManager.instance.filpCard();    // 调用CardManager的filpCard方法

        console.log("检查游戏是否结束");
        PKP_ScoreManager.instance.checkGameOver();

        // 翻牌后，转换回合
        this.scheduleOnce(() =>
            PKP_BattleManager.instance.changeTurn(),

            this.delayTime); // x秒后再次调用changeTurn方法
    }

    // 随机触发一个攻击按钮
    public randomAttack() {
        let randomNum = Math.floor(Math.random() * 3) + 1;
        switch (randomNum) {
            case 1:
                this.onClick_Attack1();
                break;
            case 2:
                this.onClick_Attack2();
                break;
            case 3:
                this.onClick_Attack3();
                break;
        }
    }
}