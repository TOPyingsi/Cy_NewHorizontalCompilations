import { _decorator, Animation, Component, Node, Vec3 } from 'cc';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_GEffect')
export class MTRNX_GEffect extends Component {
    Init(pos: Vec3, time: number) {
        this.node.setWorldPosition(pos);
        this.node.getComponent(Animation).play("animation");
        this.scheduleOnce(() => {
            MTRNX_PoolManager.Instance.PutNode(this.node)
        }, time)
    }
}


