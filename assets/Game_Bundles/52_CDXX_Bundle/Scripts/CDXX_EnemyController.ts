import { _decorator, Collider2D, Component, Contact2DType, Enum, instantiate, IPhysics2DContact, Label, Node, Prefab, Sprite, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { CDXX_ELIXIR_NAME, CDXX_ENEMY, CDXX_ENEMY_CONFIG, CDXX_GROUP } from './CDXX_Constant';
import { CDXX_UIController } from './CDXX_UIController';
import { CDXX_PoolManager } from './CDXX_PoolManager';
import { CDXX_Bullet } from './CDXX_Bullet';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX_GameManager } from './CDXX_GameManager';
import { CDXX_HarmText } from './CDXX_HarmText';
import { CDXX_Tool } from './CDXX_Tool';
import CDXX_PlayerController from './CDXX_PlayerController';
import { CDXX_Equipment } from './CDXX_Equipment';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';
import { CDXX_GameData } from './CDXX_GameData';
const { ccclass, property } = _decorator;

@ccclass('CDXX_EnemyController')
export class CDXX_EnemyController extends Component {

    @property({ type: Enum(CDXX_ENEMY) })
    Enemy: CDXX_ENEMY = CDXX_ENEMY.初级妖兽;

    @property({ type: Enum(CDXX_ELIXIR_NAME) })
    Elixir: CDXX_ELIXIR_NAME = CDXX_ELIXIR_NAME.凡丹一阶;

    @property
    ElixirNumber: number = 1;

    @property(Collider2D)
    Collider2D: Collider2D = null;

    @property(Sprite)
    ProgressSprite: Sprite = null;

    @property(UIOpacity)
    ProgressUIOpacity: UIOpacity = null;

    // @property(Prefab)
    // ElixirPrefab: Prefab = null;

    @property(Prefab)
    HarmTextPrefab: Prefab = null;

    @property(Label)
    NameLabel: Label = null;

    @property
    Speed: number = 100;

    HP: number = 0;
    Injury: number = 0;//受伤
    Harm: number = 0;

    private _isPause: boolean = false;
    private _isRemove: boolean = false;
    private _dir: Vec3 = new Vec3();
    private _v_0: Vec3 = new Vec3();
    private _moveY: number = 6;

    private _dis: number = 100;
    private _harmTime: number = 3;
    private _curTime: number = 0;
    private _playerPos: Vec3 = new Vec3();

    protected onEnable(): void {
        this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_PAUSE, this.Pause, this);
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_RESUME, this.Resume, this);
        CDXX_EventManager.on(CDXX_MyEvent.CDXX_ENEMY_REMOVE, this.RemoveSelf, this);

    }

    protected update(dt: number): void {
        if (this._isRemove || this._isPause) return;

        this._curTime += dt
        this._playerPos = CDXX_PlayerController.Instance.node.worldPosition.clone();

        if (Vec3.distance(this._playerPos, this.node.worldPosition) < this._dis) {
            if (this._curTime > this._harmTime) {
                this._curTime = 0;
                this.Attack();
            }
        } else {
            this._dir = this._playerPos.subtract(this.node.worldPosition);
            this._v_0 = this._dir.normalize().multiplyScalar(this.Speed * dt);
            this.node.worldPosition = this.node.worldPosition.add(this._v_0);
        }
    }

    Init() {
        this._isPause = false;
        this.Injury = 0;
        this._isRemove = false;
        this._curTime = 0;
        this.HP = CDXX_ENEMY_CONFIG.get(CDXX_Tool.GetEnumKeyByValue(CDXX_ENEMY, this.Enemy)).HP;
        this.Harm = CDXX_ENEMY_CONFIG.get(CDXX_Tool.GetEnumKeyByValue(CDXX_ENEMY, this.Enemy)).Harm;

        this.NameLabel.string = CDXX_Tool.GetEnumKeyByValue(CDXX_ENEMY, this.Enemy);
        Tween.stopAllByTarget(this.ProgressUIOpacity);
        this.ProgressUIOpacity.opacity = 0;
        this.Move();
    }


    BeHit(harm: number) {
        this.Injury += harm
        this.updateProgress();
        const node: Node = CDXX_PoolManager.Instance.get(this.HarmTextPrefab);
        node.parent = CDXX_GameManager.Instance.Canvas;
        node.getComponent(CDXX_HarmText).show(this.node.getWorldPosition().clone(), harm);
    }

    updateProgress() {
        if (this.Injury >= this.HP) {
            this._isRemove = true;
            // const elixir: Node = CDXX_PoolManager.Instance.get(this.ElixirPrefab);
            // elixir.parent = CDXX_GameManager.Instance.Canvas;
            CDXX_Equipment.Instance.addElixir(CDXX_Tool.GetEnumKeyByValue(CDXX_ELIXIR_NAME, this.Elixir), this.ElixirNumber);
            this.RemoveSelf();
        }
        this.ProgressSprite.fillRange = (this.HP - this.Injury) / this.HP;
        this.ProgressUIOpacity.opacity = 255;
        Tween.stopAllByTarget(this.ProgressUIOpacity);
        tween(this.ProgressUIOpacity)
            .delay(1)
            .to(0.1, { opacity: 0 }, { easing: `sineOut` })
            .start();
    }

    RemoveSelf() {
        this.scheduleOnce(() => {
            CDXX_PoolManager.Instance.put(this.node);
        })
    }

    Pause() {
        this._isPause = true;
    }

    Resume() {
        this._isPause = false;
    }

    Move() {
        tween(this.node)
            .by(0.3, { y: this._moveY }, { easing: `sineIn` })
            .by(0.3, { y: -this._moveY }, { easing: `sineIn` })
            .union()
            .repeatForever()
            .start();
    }

    Attack() {
        CDXX_PlayerController.Instance.BeHit(this.Harm);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this._isRemove) return;
        if (otherCollider.group == CDXX_GROUP.CDXX_PICKAXE) {
            // this.BeHit(otherCollider.getComponent(CDXX_Bullet).Harm);
            this.BeHit(CDXX_GameData.Instance.Harm);
            CDXX_UIController.Instance.PlayHit();
            otherCollider.getComponent(CDXX_Bullet).RemoveSelf();
        }
    }

}


