import { _decorator, Component, Node, AudioClip } from 'cc';
import { PKP_Player } from './PKP_Player';
import { PKP_Opponent } from './PKP_Opponent';
import { PKP_ScoreManager } from './PKP_ScoreManager';
import { PKP_AudioManager } from './PKP_AudioManager';
import { PKP_ButtonManager } from './PKP_ButtonManager';
import { PKP_UIManager } from './PKP_UIManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('PKP_BattleManager')
export class PKP_BattleManager extends Component {
    // 单例模式
    private static _instance: PKP_BattleManager;
    public static get instance(): PKP_BattleManager {
        return this._instance;
    }

    @property
    private delayTime: number = 1; // 延迟时间

    @property(AudioClip)
    private gameMusic: AudioClip = null;

    public isPlayerTurn: boolean = true; // 是否是玩家回合
    public isGameOver: boolean = false; // 是否游戏结束

    onLoad() {
        PKP_BattleManager._instance = this;
        console.log('BattleManager单例初始化成功' + PKP_BattleManager.instance);
        // 播放背景音乐
        PKP_AudioManager.instance.play(this.gameMusic, 1);
        this.isPlayerTurn = true;
        this.isGameOver = false;
    }

    start() {
        // ProjectEventManager.emit(ProjectEvent.游戏开始, "拍卡");
        this.showProfile(); // 显示角色信息

        // 延迟开始游戏
        this.scheduleOnce(() => {
            this.hideProfile(); // 隐藏角色信息
            this.main(); // 开始游戏
        }, 4);
    }

    // 显示角色信息
    private showProfile() {
        PKP_UIManager.instance.showOpponentUI();
    }
    // 隐藏角色信息
    private hideProfile() {
        PKP_UIManager.instance.hideOpponentUI();
    }


    // 游戏主循环
    private main() {
        if (this.isGameOver == false) {
            this.playTurn(this.isPlayerTurn); // 开始游戏
        } else {
            // 游戏结束逻辑
            console.log('游戏结束');
            ProjectEventManager.emit(ProjectEvent.游戏结束, "拍卡");
            this.scheduleOnce(() => PKP_ScoreManager.instance.gameOver_CheckWinner(), 2); // 2秒后调用gameOver函数
            // 显示得分
        }
    }

    // 开始游戏
    private playTurn(isPlayerTurn) {

        // 在这里处理战斗逻辑
        if (this.isPlayerTurn) {    // 如果是玩家回合
            console.log('玩家回合');
            PKP_UIManager.instance.showTurnYouUI();// 显示玩家UI
            PKP_Player.instance.attack(); // 玩家攻击
            this.scheduleOnce(() => PKP_UIManager.instance.hideTurnYouUI(), 1.5); // x秒后隐藏玩家UI
        }
        else {  // 如果是对手回合
            console.log('对手回合');
            PKP_UIManager.instance.showTurnOpponentUI();// 显示对手UI
            PKP_Opponent.instance.attack(); // 对手攻击
            this.scheduleOnce(() => PKP_UIManager.instance.hideTurnOpponentUI(), 1.5); // x秒后隐藏对手UI

        }
    }

    // 延迟切换回合
    public changeTurn() {
        if (this.isGameOver == false) {
            this.isPlayerTurn = !this.isPlayerTurn;
            // this.playTurn(this.isPlayerTurn); // 立即调用playTurn函数
            this.scheduleOnce(() => this.playTurn(this.isPlayerTurn), this.delayTime); // x秒后再次调用playTurn函数            
        }
        else {
            this.main();
        }
    }

    // 游戏结束
    public gameOver() {
        this.isGameOver = true;
        console.log('游戏结束，弹出结算界面');
    }
}