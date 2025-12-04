import { _decorator, BoxCollider2D, Component, Label, Node, tween, UIOpacity, v3 } from 'cc';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_BloodLabel_Mtr')
export class MTRNX_BloodLabel_Mtr extends Component {

    Init(str: number) {
        this.node.setScale(this.node.parent.scale.x, 1, 1);
        if (this.node.parent.getComponent("ZUnit")) this.node.setPosition(0, this.node.parent.getComponent(BoxCollider2D).size.height / 2);
        else this.node.setPosition(0, this.node.parent.getComponent(BoxCollider2D).size.height);
        this.node.getComponent(Label).string = str.toFixed(0);
        this.node.getComponent(UIOpacity).opacity = 255;
        tween(this.node)
            .delay(0.5)
            .to(1, { position: v3(0, this.node.position.y + 100) })
            .call(() => {
                MTRNX_PoolManager.Instance.PutNode(this.node);
            })
            .start()
        tween(this.node.getComponent(UIOpacity))
            .delay(0.5)
            .to(1, { opacity: 0 })
            .start()
    }
}


