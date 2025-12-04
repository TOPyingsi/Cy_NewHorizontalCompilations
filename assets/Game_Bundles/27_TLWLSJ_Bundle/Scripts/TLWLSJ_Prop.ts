import { _decorator, Collider2D, Component, Contact2DType, EventTouch, IPhysics2DContact, Label, Node, TERRAIN_SOUTH_INDEX } from 'cc';
import { TLWLSJ_BULLET, TLWLSJ_Constant, TLWLSJ_WEAPON } from './TLWLSJ_Constant';
import { TLWLSJ_GameData } from './TLWLSJ_GameData';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';

import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { TLWLSJ_TipsController } from './TLWLSJ_TipsController';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Prop')
export class TLWLSJ_Prop extends Component {

    Collider2D: Collider2D = null;
    Button: Node = null;

    protected onLoad(): void {
        this.Collider2D = this.getComponent(Collider2D);
        this.Button = this.node.children[0];
        if (this.Collider2D) {
            this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.Collider2D.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }


    protected start(): void {
        if (this.node.name === "枪") {
            TLWLSJ_TipsController.Instance.IsPack = true;
        }
        TLWLSJ_TipsController.Instance.NeedTips++;
    }

    ButtonClick(event: EventTouch) {
        const target: Node = event.getCurrentTarget();
        TLWLSJ_AudioManager.PlaySound(Audios.Get);
        switch (target.name) {
            case "枪":
                TLWLSJ_UIManager.Instance.getZDSQ();
                break;
            case "子弹":
                TLWLSJ_GameData.addBulletByType(TLWLSJ_BULLET.软铅弹头9x19mm, 30);
                break;
        }
        this.node.destroy();
        TLWLSJ_TipsController.Instance.NeedTips--;
        TLWLSJ_TipsController.Instance.check();
    }


    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            this.Button.active = true;
            TLWLSJ_TipsController.Instance.addTarget(this.node);
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            this.Button.active = false;
            TLWLSJ_TipsController.Instance.removeTarget(this.node);
        }
    }
}


