import { _decorator, Component, EventTouch, Label, Node, NodeEventType, Sprite, tween, v3 } from 'cc';
import { MFXR_GameManager } from './MFXR_GameManager';
const { ccclass, property } = _decorator;

@ccclass('MFXR_SmallGame_BMYS')
export class MFXR_SmallGame_BMYS extends Component {
    @property(Label)
    timelb: Label = null;
    @property(Sprite)
    jdt: Sprite = null;
    Time: number = 5;//剩余花时间
    index: number = 0;//进度
    GameStart: boolean = false;//游戏开始了吗
    start() {
        MFXR_GameManager.Instance.OpenText("闭目养神");
        this.node.getChildByName("拖动框").on(NodeEventType.TOUCH_MOVE, (touch) => { this.Move(touch) })
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
    Move(touch: EventTouch) {
        if (!this.GameStart) {
            return;
        }
        this.node.getChildByName("指针").angle -= 2;
        this.index += 20;
        this.jdt.fillRange = this.index / 6000;
        if (this.index >= 6000) {
            MFXR_GameManager.Instance.RamdonGameNumber--;
            MFXR_GameManager.Instance.GoRamDomGame();
            this.node.destroy();
        }
    }

}


