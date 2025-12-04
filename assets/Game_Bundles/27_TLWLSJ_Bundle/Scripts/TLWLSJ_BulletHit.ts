import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_BulletHit')
export class TLWLSJ_BulletHit extends Component {

    show(worldPos: Vec3, angle: number) {
        this.node.setWorldPosition(worldPos);
        const randAngle = TLWLSJ_Tool.GetRandom(-5, 5);
        this.node.angle = angle + randAngle;
        this.scheduleOnce(() => { this.node.destroy() }, 0.1);
    }

}


