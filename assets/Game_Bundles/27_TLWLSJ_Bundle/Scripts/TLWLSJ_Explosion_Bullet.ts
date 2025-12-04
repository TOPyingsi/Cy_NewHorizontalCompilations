import { _decorator, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, sp, Vec3 } from 'cc';
import { TLWLSJ_MapCamera } from './TLWLSJ_MapCamera';
import { TLWLSJ_Constant } from './TLWLSJ_Constant';
import { TLWLSJ_EnemyController } from './TLWLSJ_EnemyController';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';

const { ccclass, property } = _decorator;

enum Ani {
    None = "",
    Boom = "baozha_texiao",
}

@ccclass('TLWLSJ_Explosion_Bullet')
export class TLWLSJ_Explosion_Bullet extends Component {

    Collider: Collider2D = null;
    Skeleton: sp.Skeleton = null;
    State: string = "";
    CB: Function = null;

    Harm: number = 0;
    Armor: number = 0;

    protected onLoad(): void {
        this.Collider = this.node.getComponent(Collider2D);
        this.Skeleton = this.node.getComponent(sp.Skeleton);
        this.Skeleton.setCompleteListener((trackEntry: sp.spine.TrackEntry) => { this.CB && this.CB() });
        this.Collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

    }

    show(worldPos: Vec3, angle: number, harm: number = 0, armor: number = 0) {
        this.Harm = harm;
        this.Armor = armor;
        this.node.setWorldPosition(worldPos);
        const randAngle = TLWLSJ_Tool.GetRandom(-5, 5);
        this.node.angle = angle + randAngle;
        TLWLSJ_MapCamera.Instance.shakeCamera(4, 0.025, 10);
        TLWLSJ_AudioManager.PlaySound(Audios.Boom);
        this.playAni(Ani.Boom, false, () => {
            this.node.destroy();
        })
    }

    playAni(ani: string, loop: boolean = false, cb: Function = null) {
        if (this.State === ani) return;
        this.State = ani;
        if (this.State == Ani.None) {
            this.Skeleton.timeScale = 0;
            return;
        }
        this.Skeleton.timeScale = 1;
        this.CB = cb;
        this.Skeleton.setAnimation(0, ani, loop);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.ENEMY) {
            otherCollider.node.getComponent(TLWLSJ_EnemyController).hit(this.Harm, this.Armor);
        } else if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            TLWLSJ_PlayerController.Instance.hit(this.Harm);
        }
    }
}


