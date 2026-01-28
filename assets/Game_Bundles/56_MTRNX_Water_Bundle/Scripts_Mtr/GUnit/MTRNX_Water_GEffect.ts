import { _decorator, Animation, Component, Node, Vec3 } from 'cc';
import { MTRNX_Water_PoolManager } from '../Utils/MTRNX_Water_PoolManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_GEffect')
export class MTRNX_Water_GEffect extends Component {
    Init(pos: Vec3, time: number) {
        this.node.setWorldPosition(pos);
        this.node.getComponent(Animation).play("animation");
        this.scheduleOnce(() => {
            MTRNX_Water_PoolManager.Instance.PutNode(this.node)
        }, time)
    }
}


