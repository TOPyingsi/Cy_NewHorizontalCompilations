import { _decorator, Component, Node, tween, v3, Vec2, Vec3 } from 'cc';
import { XYRZZ_PoolManager } from './Utils/XYRZZ_PoolManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_TweenMoney')
export class XYRZZ_TweenMoney extends Component {
    Show(StarWorldPos: Vec3, EndWorldPos: Vec3, CallBack?: Function) {
        let RamX = Math.random() * 200 - 100;
        let RamY = Math.random() * 200 - 100;
        this.node.setWorldPosition(StarWorldPos.clone().add(v3(RamX, RamY)));
        tween(this.node)
            .to(1, { worldPosition: EndWorldPos }, { easing: "backIn" })
            .call(() => {
                if (CallBack) CallBack();
                XYRZZ_PoolManager.Instance.PutNode(this.node);
            })
            .start();
    }


}


