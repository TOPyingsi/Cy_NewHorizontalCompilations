import { _decorator, Animation, Component, Node, Vec3 } from 'cc';
import { SJZXD_PoolManager } from './SJZXD_PoolManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Gun_Effect')
export class SJZXD_Gun_Effect extends Component {
    public setPos(Pos: Vec3): void {
        this.node.setWorldPosition(Pos);
        this.node.getComponent(Animation).play();
    }
    Over() {
        this.node.getComponent(Animation).stop();
        SJZXD_PoolManager.Instance.Put(this.node)
    }

}


