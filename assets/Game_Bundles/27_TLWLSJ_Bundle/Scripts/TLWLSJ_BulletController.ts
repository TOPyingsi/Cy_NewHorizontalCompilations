import { _decorator, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, JsonAsset, misc, Node, Prefab, RigidBody2D, v2, v3, Vec2 } from 'cc';
import { TLWLSJ_Constant } from './TLWLSJ_Constant';
import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { TLWLSJ_BulletHit } from './TLWLSJ_BulletHit';
import { TLWLSJ_EnemyController } from './TLWLSJ_EnemyController';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController'; import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_BulletController')
export class TLWLSJ_BulletController extends Component {

    @property
    Speed: number = 10;

    RigidBody2D: RigidBody2D = null;
    Collider2D: Collider2D = null;

    Name: string = "";

    DirX: number = 0;
    DirY: number = 0;

    Harm: number = 0;
    ArmorPenetration: number = 0;
    IsRemove: boolean = false;

    protected onLoad(): void {
        this.RigidBody2D = this.getComponent(RigidBody2D);
        this.Collider2D = this.getComponent(Collider2D);

        if (this.Collider2D) {
            this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    fire(bulletName: string, dirX: number, dirY: number) {
        this.Name = bulletName;
        this.DirX = dirX;
        this.DirY = dirY;
        BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "AmmoData").then((jsonAsset: JsonAsset) => {
            const json = jsonAsset.json[this.Name];
            this.Harm = json.harm;
            this.ArmorPenetration = json.armorPenetration;
        })

        let angleRadians = Math.atan2(this.DirY, this.DirX);
        let angleDegrees = misc.radiansToDegrees(angleRadians);

        this.node.angle = angleDegrees;
    }

    protected update(dt: number): void {
        if (this.RigidBody2D) {
            const v = new Vec2(this.DirX * this.Speed, this.DirY * this.Speed);
            this.RigidBody2D.linearVelocity = v;
        }
    }

    subArmor(sub: number) {
        this.ArmorPenetration -= sub;
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        if (this.IsRemove) return;
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.ENEMY) {
            otherCollider.node.getComponent(TLWLSJ_EnemyController).hit(this.Harm, this.ArmorPenetration)
            this.removeSelf();
        } else if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            TLWLSJ_PlayerController.Instance.hit(this.Harm);
            this.removeSelf();
        } else if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.MAP) {
            this.removeSelf();
        }
    }

    removeSelf() {
        this.IsRemove = true;
        const worldPos = this.node.getWorldPosition().clone();
        const angle = this.node.angle;
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "子弹击中").then((prefab: Prefab) => {
            const hit = instantiate(prefab);
            hit.parent = TLWLSJ_GameManager.Instance.Canvas;
            hit.getComponent(TLWLSJ_BulletHit).show(worldPos, angle - 90);
        })
        this.scheduleOnce(() => { this.node.destroy(); })
    }

}


