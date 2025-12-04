import { _decorator, Collider2D, color, Component, Contact2DType, find, instantiate, IPhysics2DContact, JsonAsset, Node, Prefab, RigidBody2D, sp, Sprite, tween, Tween, UIOpacity, v2, v3, Vec3 } from 'cc';
import TLWLSJ_PlayerController from './TLWLSJ_PlayerController'; import { TLWLSJ_GameManager } from './TLWLSJ_GameManager';
import { Audios, TLWLSJ_AudioManager } from './TLWLSJ_AudioManager';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';

const { ccclass, property } = _decorator;

enum Ani {
    None = "",
    Fire = "animation",
}


@ccclass('TLWLSJ_EnemyController')
export class TLWLSJ_EnemyController extends Component {

    @property
    Speed: number = 10;

    RigidBody: RigidBody2D = null;
    Colliders: Collider2D[] = null;
    Tips: Node = null;
    Icon: Sprite = null;

    InRange: boolean = false;
    IsAttack: boolean = false;
    Target: Node = null;
    TipsInitPos: Vec3 = new Vec3();

    Weapon: Node = null;
    Skeleton: sp.Skeleton = null;
    State: string = "";
    CB: Function = null;
    IsMove: boolean = false;

    HP: number = 0;
    Harm: number = 0;
    Armor: number = 0;

    UIOpacity: UIOpacity = null;
    IsDie: boolean = false;

    protected onLoad(): void {
        this.RigidBody = this.node.getComponent(RigidBody2D);
        this.Colliders = this.node.getComponents(Collider2D);
        this.Tips = find("Tips", this.node);
        this.Icon = find("Icon", this.node).getComponent(Sprite);

        this.Weapon = find("武器", this.node);
        if (this.Weapon) {
            this.Skeleton = this.Weapon.getComponent(sp.Skeleton);
            this.Skeleton.setCompleteListener((trackEntry: sp.spine.TrackEntry) => { this.CB && this.CB() });
        }

        if (this.Colliders[1]) {
            this.Colliders[1].on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.Colliders[1].on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }

        this.UIOpacity = this.node.addComponent(UIOpacity);
    }

    protected start(): void {
        this.Target = TLWLSJ_PlayerController.Instance.node;
        this.TipsInitPos = this.Tips.getPosition().clone();
        BundleManager.LoadJson(GameManager.GameData.DefaultBundle, "EnemyData").then((jsonAsset: JsonAsset) => {
            const json = jsonAsset.json;
            const data = json[this.node.name];
            this.HP = data.hp;
            this.Harm = data.harm;
            this.Armor = data.armor;
        })
    }

    protected update(dt: number): void {
        if (TLWLSJ_GameManager.Instance.IsPause) {
            this.RigidBody.linearVelocity = v2(0, 0);
            return;
        }
        if (this.IsDie) {
            this.RigidBody.linearVelocity = v2(0, 0);
        } else if (this.IsMove) {
            this.randMove();
        } else if (this.Target && !this.IsAttack) {
            this.tracePlayer();
        } else {
            this.RigidBody.linearVelocity = v2(0, 0);
        }
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

    randMove() {

    }

    tracePlayer(isFire: boolean = false) {
        const Dir = this.Target.getWorldPosition().subtract(this.node.getWorldPosition()).normalize();
        this.RigidBody.linearVelocity = v2(Dir.x * this.Speed, Dir.y * this.Speed);
        this.node.scale = Dir.x < 0 ? v3(-1, 1, 1) : v3(1, 1, 1);
    }

    showTips() {
        Tween.stopAllByTarget(this.Tips);
        this.Tips.active = true;
        tween(this.Tips)
            .by(0.1, { position: v3(0, 20, 0) }, { easing: `sineOut` })
            .start();
    }

    hideTips() {
        Tween.stopAllByTarget(this.Tips);
        this.Tips.active = false;
        this.Tips.setPosition(this.TipsInitPos);
    }

    hit(harm: number, armor: number) {
        if (this.IsDie) return;
        TLWLSJ_AudioManager.PlaySound(Audios.Hit);
        const surplusArmor = armor > this.Armor ? 0 : this.Armor - armor;
        const surplusHarm = harm > surplusArmor ? harm - surplusArmor : 0;
        this.HP -= surplusHarm;
        if (this.Icon) this.Icon.color = color(158, 158, 158, 255);
        this.scheduleOnce(() => {
            if (this.Icon) this.Icon.color = color(255, 255, 255, 255);
        }, 0.1);

        if (this.HP <= 0) {
            this.IsDie = true;
            this.Colliders.filter(e => e.enabled = false);
            tween(this.UIOpacity)
                .to(0.3, { opacity: 100 }, { easing: `sineInOut` })
                .call(() => {
                    this.removeSelf();
                })
                .start();
        }
    }

    removeSelf() {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "金币").then((prefab: Prefab) => {
            const awardNum = TLWLSJ_Tool.GetRandomIntWithMax(2, 8);
            this.creatorGold(prefab, awardNum);
            this.scheduleOnce(() => { this.node.destroy(); }, 1)
        })
    }

    creatorGold(prefab: Prefab, number: number) {
        for (let index = 0; index < number; index++) {
            const gold: Node = instantiate(prefab);
            gold.parent = TLWLSJ_GameManager.Instance.BulletLayout;
            const offsetX = TLWLSJ_Tool.GetRandom(-50, 50);
            const offsetY = TLWLSJ_Tool.GetRandom(-50, 50);
            const pos: Vec3 = this.node.getWorldPosition().add3f(offsetX, offsetY, 0);
            gold.setWorldPosition(pos)
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
    }
}


