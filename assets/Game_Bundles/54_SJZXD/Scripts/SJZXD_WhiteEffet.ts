import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_WhiteEffet')
export class SJZXD_WhiteEffet extends Component {
    @property()
    StartPos: Vec3 = new Vec3(0, 0, 0);
    @property()
    EndPos: Vec3 = new Vec3(0, 0, 0);
    @property()
    MoveTime: number = 3;//周期时间
    @property()
    IntervalTime: number = 3;//间隔时间
    start() {
        tween(this.node.getChildByPath("Mask/节点"))
            .to(0, { position: this.StartPos })
            .to(this.MoveTime, { position: this.EndPos })
            .delay(this.IntervalTime)
            .union()
            .repeatForever()
            .start();
    }


}


