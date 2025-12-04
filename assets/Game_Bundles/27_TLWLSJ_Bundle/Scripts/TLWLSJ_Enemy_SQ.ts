import { _decorator, Collider2D, Component, find, instantiate, IPhysics2DContact, misc, Node, Prefab, v2, v3, Vec3 } from 'cc';
import { TLWLSJ_EnemyController } from './TLWLSJ_EnemyController';
import { TLWLSJ_BulletController } from './TLWLSJ_BulletController';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

enum Ani {
    None = "",
    Fire = "kaiqiang",
}

@ccclass('TLWLSJ_Enemy_SQ')
export class TLWLSJ_Enemy_SQ extends TLWLSJ_EnemyController {

    @property
    Capacity: number = 2;

    @property
    Rate: number = 1;

    Dir: Vec3 = new Vec3();
    Muzzle: Node = null;

    private _surplus: number = 2;
    private _randDir: Vec3 = new Vec3();

    protected onLoad(): void {
        super.onLoad();
        this.Muzzle = find("武器/Muzzle", this.node);
        this._surplus = this.Capacity;
    }

    tracePlayer(isFire: boolean = false) {
        const speed = isFire ? 0 : this.Speed;
        this.Dir = this.Target.getWorldPosition().subtract(this.node.getWorldPosition()).normalize();
        this.RigidBody.linearVelocity = v2(this.Dir.x * speed, this.Dir.y * speed);
        this.node.scale = this.Dir.x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);
        //设置武器的旋转
        let angleRadians = Math.atan2(this.Dir.y, this.Dir.x);
        let angleDegrees = misc.radiansToDegrees(angleRadians);

        this.Weapon.angle =
            (angleDegrees > 90 && angleDegrees <= 180) ||
                (angleDegrees < -90 && angleDegrees >= -180)
                ? 180 - angleDegrees
                : angleDegrees;
    }

    randMove() {
        this.RigidBody.linearVelocity = v2(this._randDir.x * this.Speed, this._randDir.y * this.Speed);
        this.node.scale = this._randDir.x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);
    }

    attack() {
        if (this.IsAttack || !this.InRange || this.IsMove) return;
        if (this._surplus <= 0) {
            //随机移动
            const dirX: number = TLWLSJ_Tool.GetRandom(-0.8, 0.8);
            const dirY: number = TLWLSJ_Tool.GetRandom(-0.8, 0.8);
            this._randDir = v3(this.Dir.x + dirX, this.Dir.y + dirY, 0);
            this._surplus = this.Capacity;
            this.IsMove = true;
            this.scheduleOnce(() => { this.IsMove = false }, 2);
            return;
        }
        this.IsAttack = true;
        this.showTips();
        this.scheduleOnce(() => {
            this.hideTips();
            this.tracePlayer(true);
            if (TLWLSJ_GameManager.Instance.IsPause) {
                this.IsAttack = false;
                return;
            }
            this.playAni(Ani.Fire, false, () => {
                this.State = Ani.None;
                this.IsAttack = false;
                this._surplus--;
                this.attack();
                //对玩家造成伤害
                this.fireBullet(this.node.name);
            });
        }, this.Rate);
    }

    //发射子弹
    fireBullet(bulletName: string = "") {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "子弹_敌人").then((prefab: Prefab) => {
            const bullet: Node = instantiate(prefab);
            bullet.parent = TLWLSJ_GameManager.Instance.BulletLayout;
            bullet.setWorldPosition(this.Muzzle.getWorldPosition());
            bullet.getComponent(TLWLSJ_BulletController).fire(bulletName, this.Dir.x, this.Dir.y);
        });
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
}


