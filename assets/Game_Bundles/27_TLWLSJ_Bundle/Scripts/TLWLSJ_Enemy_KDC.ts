import { _decorator, Collider, Collider2D, Component, Contact2DType, find, IPhysics2DContact, Node, sp, Vec3 } from 'cc';
import { TLWLSJ_EnemyController } from './TLWLSJ_EnemyController';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_Constant } from './TLWLSJ_Constant';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController'; const { ccclass, property } = _decorator;

enum Ani {
    None = "",
    Fire = "animation",
}

@ccclass('TLWLSJ_Enemy_KDC')
export class TLWLSJ_Enemy_KDC extends TLWLSJ_EnemyController {

    WeaponCollider: Collider2D = null;
    WeaponInitPos: Vec3 = new Vec3();

    protected onLoad(): void {
        super.onLoad();
        this.WeaponCollider = this.Weapon.getComponent(Collider2D);
        this.WeaponCollider.enabled = false;
        this.WeaponCollider.on(Contact2DType.BEGIN_CONTACT, this.onWeaponBeginContact, this);
        this.WeaponInitPos = this.Weapon.getPosition().clone();
    }

    protected start(): void {
        super.start();
    }

    protected update(dt: number): void {
        super.update(dt);
        this.Weapon.setPosition(this.WeaponInitPos);
    }

    attack() {
        if (this.IsAttack || !this.InRange) return;
        this.IsAttack = true;
        this.showTips();
        this.scheduleOnce(() => {
            this.hideTips();
            if (TLWLSJ_GameManager.Instance.IsPause) {
                this.IsAttack = false;
                return;
            }
            this.WeaponCollider.enabled = true;
            this.playAni(Ani.Fire, false, () => {
                this.State = Ani.None;
                this.WeaponCollider.enabled = false;
                this.IsAttack = false;
                this.attack();
                //对玩家造成伤害
            });
        }, 1)
    }


    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        this.InRange = true;
        this.attack();
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        this.InRange = false;
    }

    onWeaponBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            TLWLSJ_PlayerController.Instance.hit(this.Harm);
        }
    }
}
