import { _decorator, Animation, Component, Node, Vec3 } from 'cc';
import { SJZGMMT_PoolManager } from './SJZGMMT_PoolManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Gun_Effect')
export class SJZGMMT_Gun_Effect extends Component {
    public setPos(Pos: Vec3): void {
        this.node.setWorldPosition(Pos);
        this.node.getComponent(Animation).play();
    }
    Over() {
        this.node.getComponent(Animation).stop();
        SJZGMMT_PoolManager.Instance.Put(this.node)
    }

}


