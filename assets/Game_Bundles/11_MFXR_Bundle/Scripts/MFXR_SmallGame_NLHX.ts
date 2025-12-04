import { _decorator, Component, Event, EventTouch, Label, Node, NodeEventType, Sprite, v3 } from 'cc';
import { MFXR_GameManager } from './MFXR_GameManager';
const { ccclass, property } = _decorator;

@ccclass('MFXR_SmallGame_NLHX')
export class MFXR_SmallGame_NLHX extends Component {
    @property(Label)
    timelb: Label = null;
    @property(Sprite)
    jdt: Sprite = null;
    public index = 0;//进度（满6000）
    Time: number = 5;//剩余花时间
    GameStart: boolean = false;//游戏开始了吗
    start() {
        MFXR_GameManager.Instance.OpenText("努力呼吸")
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
        let x = this.node.getChildByName("拖动框").position.x + touch.getUIDelta().x;
        if (x < -425) x = -425;
        if (x > 425) x = 425;
        this.node.getChildByName("拖动框").position = v3(x, 0, 0);
        this.index += Math.abs(touch.getUIDelta().x);
        this.jdt.fillRange = this.index / 6000;
        if (this.index >= 6000) {
            MFXR_GameManager.Instance.RamdonGameNumber--;
            MFXR_GameManager.Instance.GoRamDomGame();
            this.node.destroy();
        }
    }
}


