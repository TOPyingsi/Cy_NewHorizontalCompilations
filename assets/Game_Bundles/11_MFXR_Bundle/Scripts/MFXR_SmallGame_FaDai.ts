import { _decorator, Component, Node, v3 } from 'cc';
import { MFXR_GameManager } from './MFXR_GameManager';
const { ccclass, property } = _decorator;

@ccclass('MFXR_SmallGame_FaDai')
export class MFXR_SmallGame_FaDai extends Component {
    @property(Node)
    SanJiao: Node = null;//三角
    @property(Node)
    Winner: Node = null;//胜利区
    GameStart: boolean = false;//游戏开始了吗
    start() {
        MFXR_GameManager.Instance.OpenText("发呆")
        this.Winner.setPosition(Math.random() * 400 - 200, 0, 0);
        this.scheduleOnce(() => {
            this.GameStart = true;
        }, 1)
    }
    isleft: boolean = true;
    update(deltaTime: number) {
        if (!this.GameStart) {
            return;
        }
        if (this.isleft) {
            this.SanJiao.setPosition(this.SanJiao.position.x - 600 * deltaTime, 140, 0)
        } else {
            this.SanJiao.setPosition(this.SanJiao.position.x + 600 * deltaTime, 140, 0)
        }
        if (this.SanJiao.position.x < -470) {
            this.isleft = false;
        }
        if (this.SanJiao.position.x > 470) {
            this.isleft = true;
        }
    }

    //按下触发区
    OnClick() {
        if (!this.GameStart) {
            return;
        }
        if (this.SanJiao.position.x > (this.Winner.position.x - 100) && this.SanJiao.position.x < (this.Winner.position.x + 100)) {
            //胜利
            MFXR_GameManager.Instance.RamdonGameNumber--;
            MFXR_GameManager.Instance.GoRamDomGame();
            this.node.destroy();
        } else {
            //失败
            MFXR_GameManager.Instance.OpenText("胃胜诉", () => {
                MFXR_GameManager.Instance.gameOver(false, "胃胜诉");
            });
            this.node.destroy();
        }
    }
}


