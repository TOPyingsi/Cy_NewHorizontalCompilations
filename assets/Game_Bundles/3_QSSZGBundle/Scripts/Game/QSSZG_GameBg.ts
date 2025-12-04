import { _decorator, Component, EventTouch, Node, tween, v3, Vec2, Vec3 } from 'cc';
import { QSSZG_GameManager } from './QSSZG_GameManager';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_GameBg')
export class QSSZG_GameBg extends Component {
    public CD: number = 0.15;
    public MAXCD: number = 0.15;
    public IsLoadFood: boolean = false;
    public Pos: Vec2 = null;
    start() {
        tween(this.node)
            .by(4, { position: v3(-25, 0, 0) })
            .by(4, { position: v3(25, 0, 0) })
            .union()
            .repeatForever()
            .start();
        this.node.on(Node.EventType.TOUCH_START, (Touch) => { this.StartLoadFood(Touch); });
        this.node.on(Node.EventType.TOUCH_MOVE, (Touch) => { this.StartLoadFood(Touch); });
        this.node.on(Node.EventType.TOUCH_END, () => { this.EndtLoadFood(); });
        this.node.on(Node.EventType.TOUCH_CANCEL, () => { this.EndtLoadFood(); });
    }
    protected update(dt: number): void {
        this.CD -= dt;
        if (this.IsLoadFood && this.CD < 0) {
            this.CD = this.MAXCD;
            QSSZG_GameManager.Instance.LoadFishing_Lure(this.Pos);
        }
    }
    StartLoadFood(Touch: EventTouch) {
        QSSZG_GameManager.Instance.Off_SelectFish();
        QSSZG_GameManager.Instance.Off_SelectAccessories();
        this.IsLoadFood = true;
        this.Pos = Touch.getUILocation();
    }
    EndtLoadFood() {
        this.IsLoadFood = false;
    }
}


