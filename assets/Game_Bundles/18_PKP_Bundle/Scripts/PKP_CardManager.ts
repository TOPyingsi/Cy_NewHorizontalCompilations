import { _decorator, Component, Node, randomRangeInt } from 'cc';
import { PKP_CardNode } from './PKP_CardNode';
import { PKP_BattleManager } from './PKP_BattleManager';
import { PKP_ScoreManager } from './PKP_ScoreManager';
import { PKP_Opponent } from './PKP_Opponent';
const { ccclass, property } = _decorator;
@ccclass('PKP_CardManager')
export class PKP_CardManager extends Component {
    // 单例模式
    private static _instance: PKP_CardManager = null;
    public static get instance(): PKP_CardManager {
        return this._instance;
    }

    @property({ type: Node })
    private cardPrefabs: Node[] = []; // 卡片预制体容器
    private cards: PKP_CardNode[] = []; // 卡片容器
    public delayTime: number = 1; // 翻转卡片延迟时间
    public count = 0; // 卡片数量

    onLoad() {
        PKP_CardManager._instance = this; // 单例模式
    }

    start() {
        this.count = this.getCardCount();
        this.init();
    }

    // 初始化卡片——将卡片预制体放入节点中
    public init() {
        for (let i = 0; i < this.cardPrefabs.length; i++) {
            if (i < this.count) {
                let card = this.cardPrefabs[i];
                if (card != null) {
                    card.setParent(this.node);
                    this.cards.push(card.getComponent(PKP_CardNode));
                }
            }
            else {
                this.cardPrefabs[i].active = false;
            }
        }
    }

    // 翻转卡片
    public filpCard() {
        // 全部播放动画
        for (let i = 0; i < this.cards.length; i++) {
            this.cards[i].getComponent(PKP_CardNode).playAnim();
        }

        // 随机选择x张卡片
        let num = randomRangeInt(0, this.cards.length / 2);
        for (let i = 0; i < num; i++) {
            let index = randomRangeInt(0, this.cards.length);
            /* 
            //全部卡牌翻面
            for (let i = 0; i < this.cardPrefabs.length; i++) {
                this.cardPrefabs[i].getComponent(PKP_CardNode).filp();
            }
            */
            this.schedule(() => {
                let card = this.cards[index].getComponent(PKP_CardNode);
                if (card.isFaceUp == false) {
                    card.filp();
                    PKP_ScoreManager.instance.addScore(1, PKP_BattleManager.instance.isPlayerTurn);
                }

            }, this.delayTime);
        }
    }

    // 检查是否全部翻牌
    public checkAllCard(): boolean {
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].getComponent(PKP_CardNode).isFaceUp == false) {
                return false;
            }
        }
        return true;
    }

    // 获取卡片数量
    private getCardCount(): number {
        let index = PKP_Opponent.instance.chooseIndex;
        switch (index) {
            case 0:
                return 6;
            case 1:
                return 8;
            case 2:
                return 10;
            case 3:
                return 12;
            case 4:
                return 12;
            case 5:
                return 14;
        }
    }
}