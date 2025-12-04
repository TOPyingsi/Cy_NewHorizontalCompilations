import { _decorator, Component, EventTouch, instantiate, Node, Prefab, v3, Vec3 } from 'cc';
import { NBSYS_TouchMonitor } from '../NBSYS_TouchMonitor';
import { NBSYS_GameManager } from '../NBSYS_GameManager';

const { ccclass, property } = _decorator;

@ccclass('NBSYS_Matchbox')
export class NBSYS_Matchbox extends Component {
    @property(Prefab)
    HC: Prefab = null;

    public HCND: Node = null;
    start() {

        this.node.getChildByName("火柴区域").on(Node.EventType.TOUCH_START, (even) => { this.HCTouchDown(even); });
        this.node.getChildByName("火柴区域").on(Node.EventType.TOUCH_MOVE, (even) => { this.HCTouchMove(even); });
        this.node.getChildByName("火柴区域").on(Node.EventType.TOUCH_END, (even) => { this.HCTouchUp(even); });
        this.node.getChildByName("火柴区域").on(Node.EventType.TOUCH_CANCEL, (even) => { this.HCTouchUp(even); });

        this.node.getChildByName("火柴盒").on(Node.EventType.TOUCH_START, (even) => { this.TouchDown(even); });
        this.node.getChildByName("火柴盒").on(Node.EventType.TOUCH_MOVE, (even) => { this.TouchMove(even); });
        this.node.getChildByName("火柴盒").on(Node.EventType.TOUCH_END, (even) => { this.TouchUp(even); });
        this.node.getChildByName("火柴盒").on(Node.EventType.TOUCH_CANCEL, (even) => { this.TouchUp(even); });
    }

    //偏移位置
    PianYi: Vec3 = v3(0, 0);
    TouchDown(even) {
        this.PianYi = even.getUILocation().clone().subtract(this.node.worldPosition);
    }
    TouchMove(even) {
        let x = even.getUILocation().x;
        let y = even.getUILocation().y;
        this.node.setWorldPosition(v3(x, y, 0).subtract(v3(this.PianYi.x, this.PianYi.y, 0)));
    }
    TouchUp(even) {

    }

    //触摸按下
    HCTouchDown(even) {
        this.HCND = instantiate(this.HC);
        this.HCND.setParent(NBSYS_GameManager.Instance.Bg.getChildByName("顶层"));
        let x = even.getUILocation().x;
        let y = even.getUILocation().y;
        this.HCND.setWorldPosition(v3(x, y, 0));
    }
    //触摸拖拽
    HCTouchMove(even) {
        if (this.HCND) {
            let x = even.getUILocation().x;
            let y = even.getUILocation().y;
            this.HCND.setWorldPosition(v3(x, y, 0));
        }

    }
    //触摸抬起
    HCTouchUp(even: EventTouch) {
        this.HCND.destroy();


    }
}


