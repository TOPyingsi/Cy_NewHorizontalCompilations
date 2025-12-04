import { _decorator, BoxCollider2D, Component, Node, ProgressBar, UITransform, v3, Vec3 } from 'cc';
import { MTRNX_ZTool } from '../Utils/MTRNX_ZTool';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_BloodBar_Mtr')
export class MTRNX_BloodBar_Mtr extends Component {

    bar: ProgressBar = null;
    _scale: Vec3 = v3();

    protected onLoad(): void {
        this.bar = this.node.getComponent(ProgressBar);
    }

    Init(scale: Vec3 = Vec3.ONE) {
        this._scale.set(scale);
        this.ResetScale();
        this.node.setPosition(0, this.node.parent.getComponent(BoxCollider2D).size.height + MTRNX_ZTool.GetRandom(10, 25));
        this.SetBar(1);
    }

    SetBar(ration: number) {
        this.bar.progress = ration;
    }
    SetBlueBar(ration: number) {
        this.node.getChildByName("BlueBar").getComponent(ProgressBar).progress = ration;
    }
    ResetScale() {
        this.node.setScale(this.node.parent.scale.x * this._scale.x, this._scale.y, this._scale.z);
    }
}
