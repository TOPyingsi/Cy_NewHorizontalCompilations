import { _decorator, Collider2D, Contact2DType, IPhysics2DContact, RigidBody2D, v3 } from 'cc';
import { TLWLSJ_GameWeapon } from './TLWLSJ_GameWeapon';
import { TLWLSJ_Weapon } from './TLWLSJ_Weapon';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController'; import { TLWLSJ_Constant } from './TLWLSJ_Constant';
import { TLWLSJ_EnemyController } from './TLWLSJ_EnemyController';
import { TLWLSJ_UIManager } from './TLWLSJ_UIManager';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';

const { ccclass } = _decorator;

enum Ani {
    None = "",
    Fire = "animation",
}

@ccclass('TLWLSJ_GameWeapon_KDC')
export class TLWLSJ_GameWeapon_KDC extends TLWLSJ_GameWeapon {

    rigidBody: RigidBody2D = null;
    collider: Collider2D = null;
    private _data: TLWLSJ_Weapon = null;
    private _harm: number = 30;
    private _armor: number = 999;

    protected start(): void {
        this.rigidBody = this.getComponent(RigidBody2D);
        this.collider = this.getComponent(Collider2D);
        this.collider.enabled = false;
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

        this._data = this.Data;
        TLWLSJ_PlayerController.Instance.WeaponTs = this;
    }

    protected update(dt: number): void {
        this.node.setPosition(v3(0, 0, 0));
    }

    attack() {
        if (TLWLSJ_UIManager.Instance.IsLock) {
            this.getWeapon();
            return;
        }
        if (this.IsFire) return;

        if (this.IsStop) {
            this.IsStop = false;
            this.playAni(Ani.None, false);
            return;
        }

        this.IsFire = true;
        TLWLSJ_AudioManager.PlaySound(Audios.KDC);
        this.playAni(Ani.Fire, false, () => {
            this.IsFire = false;
            this.collider.enabled = true;
            this.scheduleOnce(() => { this.collider.enabled = false; })
            this.State = Ani.None;
            this.attack();
            //发起攻击
        });
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.ENEMY) {
            otherCollider.node.getComponent(TLWLSJ_EnemyController).hit(this._harm, this._armor)
        }
    }
}


