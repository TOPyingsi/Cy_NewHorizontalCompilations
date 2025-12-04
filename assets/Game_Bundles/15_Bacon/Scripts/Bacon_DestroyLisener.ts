import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
import { BaconAudio, Bacon_Manager } from './Bacon_Manager';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('Bacon_DestroyLisener')
export class Bacon_DestroyLisener extends Component {

    Collider: BoxCollider2D = null;

    protected onLoad(): void {
        this.Collider = this.node.getComponent(BoxCollider2D);
        this.Collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.Collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        if (otherCollider.node.name == "BaconJoint") {
            Banner.Instance.VibrateShort();
            AudioManager.Instance.PlaySFX(Bacon_Manager.Instance.audios[BaconAudio.pa]);
            Bacon_Manager.Instance.ResetBacon();
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体结束接触时被调用一次
        if (otherCollider.node.name == "BaconJoint") {
        }
    }
}


