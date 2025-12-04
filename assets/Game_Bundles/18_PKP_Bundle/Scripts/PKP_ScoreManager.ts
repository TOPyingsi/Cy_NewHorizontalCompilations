import { _decorator, Component, Node, Label } from 'cc';
import { PKP_CardManager } from './PKP_CardManager';
import { PKP_UIManager } from './PKP_UIManager';
import { PKP_BattleManager } from './PKP_BattleManager';
const { ccclass, property } = _decorator;

@ccclass('PKP_ScoreManager')
export class PKP_ScoreManager extends Component {
    private static _instance: PKP_ScoreManager = null;

    public static get instance(): PKP_ScoreManager {
        return this._instance;
    }

    @property(Label)
    private playerScoreLabel: Label = null;

    @property(Label)
    private OpponentScoreLabel: Label = null;

    public playerScore: number = 0; // 玩家分数
    public OpponentScore: number = 0; // 对手分数

    onLoad() {
        PKP_ScoreManager._instance = this;
    }
    start() {
        this.refreshScoreLabel(this.playerScoreLabel, this.playerScore);
        this.refreshScoreLabel(this.OpponentScoreLabel, this.OpponentScore);
    }

    // 更新分数
    public refreshScoreLabel(label: { string: string }, score: number) {
        label.string = score.toString();
    }

    // 添加分数
    public addScore(score: number, isPlayer: boolean) {
        if (isPlayer) {
            this.playerScore += score;
        }
        else {
            this.OpponentScore += score;
        }
        this.scheduleOnce(() => {
            this.refreshScoreLabel(this.playerScoreLabel, this.playerScore);
            this.refreshScoreLabel(this.OpponentScoreLabel, this.OpponentScore);
        });

        console.log("检查游戏是否结束");
        this.checkGameOver();
    }

    // 检查游戏是否结束
    public checkGameOver() {
        if ((this.playerScore + this.OpponentScore) >= PKP_CardManager.instance.count) {
            console.log("玩家分数：" + this.playerScore + "，对手分数：" + this.OpponentScore);
            PKP_BattleManager.instance.gameOver();
        }
    }

    // 检查是否胜利
    public gameOver_CheckWinner() {
        if (this.playerScore > this.OpponentScore) {
            console.log("玩家胜利");
            // 玩家胜利
            PKP_UIManager.instance.showSucceedUI();
        }
        else if (this.playerScore < this.OpponentScore) {
            console.log("对手胜利");
            // 对手胜利
            PKP_UIManager.instance.showFailedUI();
        }
        else {
            console.log("平局");
            // 平局
            PKP_UIManager.instance.showDrawUI();
        }
    }
}