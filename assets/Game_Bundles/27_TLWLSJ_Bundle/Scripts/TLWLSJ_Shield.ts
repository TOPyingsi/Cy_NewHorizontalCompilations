import { _decorator, Collider2D, Component, Contact2DType, Node, Vec3 } from 'cc';
import { TLWLSJ_Constant } from './TLWLSJ_Constant';
import { TLWLSJ_BulletController } from './TLWLSJ_BulletController';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_Shield')
export class TLWLSJ_Shield extends Component {
    @property
    Shield: number = 10;

    InitPos: Vec3 = new Vec3();
    Collider: Collider2D = null;

    protected onLoad(): void {
        this.InitPos = this.node.getPosition();
        this.Collider = this.node.getComponent(Collider2D);
        this.Collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    protected update(dt: number): void {
        this.node.setPosition(this.InitPos);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYERBULLET) {
            otherCollider.node.getComponent(TLWLSJ_BulletController).subArmor(this.Shield);
        }
    }
}


