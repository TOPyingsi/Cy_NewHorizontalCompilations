import { _decorator, Component, Label, Node, Sprite, tween } from 'cc';
import { MFXR_GameManager } from './MFXR_GameManager';
const { ccclass, property } = _decorator;

@ccclass('MFXR_SmallGame_XIAYAN')
export class MFXR_SmallGame_XIAYAN extends Component {
    @property(Label)
    timelb: Label = null;

    Time: number = 5;//剩余花时间
    index: number = 0;//进度
    GameStart: boolean = false;//游戏开始了吗
    start() {
        MFXR_GameManager.Instance.OpenText("下咽");
        this.scheduleOnce(() => {
            this.GameStart = true;
        }, 1)
    }
    protected update(dt: number): void {
        if (!this.GameStart) {
            return;
        }
        if (this.Time > 0) {
            this.Time -= dt;
            this.timelb.string = this.Time.toFixed(2);
        }
        if (this.Time <= 0) {
            MFXR_GameManager.Instance.OpenText("胃胜诉", () => {
                MFXR_GameManager.Instance.gameOver(false, "胃胜诉");
            });
            this.node.destroy();
        }
    }
    //点击
    OnXiaYanClick() {
        if (!this.GameStart) {
            return;
        }
        this.index += 5;
        tween(this.node.getChildByName("进度条顶部").getComponent(Sprite))
            .to(0.1, { fillRange: this.index / 100 })
            .start();
        if (this.index >= 100) {
            MFXR_GameManager.Instance.RamdonGameNumber--;
            MFXR_GameManager.Instance.GoRamDomGame();
            this.node.destroy();
        }
    }

}


