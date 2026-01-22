import { _decorator, Collider2D, Component, Contact2DType, Enum, instantiate, IPhysics2DContact, Label, Node, Prefab, Sprite, tween, Tween, UIOpacity, Vec3 } from 'cc';
import { CDXX2_ELIXIR_NAME, CDXX2_ENEMY, CDXX2_ENEMY_CONFIG, CDXX2_FRAGMENT_DROP_RATE, CDXX2_GROUP, getEnemyTier } from './CDXX2_Constant';
import { CDXX2_UIController } from './CDXX2_UIController';
import { CDXX2_PoolManager } from './CDXX2_PoolManager';
import { CDXX2_Bullet } from './CDXX2_Bullet';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { CDXX2_GameManager } from './CDXX2_GameManager';
import { CDXX2_HarmText } from './CDXX2_HarmText';
import { CDXX2_Tool } from './CDXX2_Tool';
import CDXX2_PlayerController from './CDXX2_PlayerController';
import { CDXX2_Equipment } from './CDXX2_Equipment';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_GameData } from './CDXX2_GameData';
const { ccclass, property } = _decorator;

//“敌人控制器”从配置表读取 HP/攻击，出生即上下浮动并追玩家，靠近后定时攻击
// 被镐子子弹命中即扣血并弹出伤害数字，血条空时掉落预设丹药并回池，同时响应全局暂停/继续。

@ccclass('CDXX2_EnemyController')
export class CDXX2_EnemyController extends Component {

    @property({ type: Enum(CDXX2_ENEMY) })
    Enemy: CDXX2_ENEMY = CDXX2_ENEMY.初级妖兽;

    @property({ type: Enum(CDXX2_ELIXIR_NAME) })
    Elixir: CDXX2_ELIXIR_NAME = CDXX2_ELIXIR_NAME.凡丹一阶;

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
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_PAUSE, this.Pause, this);
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_RESUME, this.Resume, this);
        CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_ENEMY_REMOVE, this.RemoveSelf, this);

    }

    protected update(dt: number): void {
        if (this._isRemove || this._isPause) return;

        this._curTime += dt
        this._playerPos = CDXX2_PlayerController.Instance.node.worldPosition.clone();

        if (Vec3.distance(this._playerPos, this.node.worldPosition) < this._dis) {
            if (this._curTime > this._harmTime) {
                this._curTime = 0;
                this.Attack();
            }
        } else {
            this._dir = this._playerPos.subtract(this.node.worldPosition);
            this._v_0 = this._dir.normalize().multiplyScalar(this.Speed * dt);
            this.node.worldPosition = this.node.worldPosition.add(this._v_0);
            
            // 根据移动方向改变敌人朝向
            if (this._dir.x !== 0) {
                this.node.scale = new Vec3(this._dir.x > 0 ? -1 : 1, this.node.scale.y, this.node.scale.z);
            }
        }
    }

    Init() {
        this._isPause = false;
        this.Injury = 0;
        this._isRemove = false;
        this._curTime = 0;
        this.HP = CDXX2_ENEMY_CONFIG.get(CDXX2_Tool.GetEnumKeyByValue(CDXX2_ENEMY, this.Enemy)).HP;
        this.Harm = CDXX2_ENEMY_CONFIG.get(CDXX2_Tool.GetEnumKeyByValue(CDXX2_ENEMY, this.Enemy)).Harm;

        this.NameLabel.string = CDXX2_Tool.GetEnumKeyByValue(CDXX2_ENEMY, this.Enemy);
        Tween.stopAllByTarget(this.ProgressUIOpacity);
        this.ProgressUIOpacity.opacity = 0;
        this.Move();
    }


    BeHit(harm: number) {
        this.Injury += harm
        this.updateProgress();
        const node: Node = CDXX2_PoolManager.Instance.get(this.HarmTextPrefab);
        node.parent = CDXX2_GameManager.Instance.Canvas;
        node.getComponent(CDXX2_HarmText).show(this.node.getWorldPosition().clone(), harm);
    }

    updateProgress() {
        if (this.Injury >= this.HP) {
            this._isRemove = true;
            
            // 获取丹药名称
            const elixirName = CDXX2_Tool.GetEnumKeyByValue(CDXX2_ELIXIR_NAME, this.Elixir);
            
            // 特殊丹药列表（不受倍率丹影响）
            const specialElixirs = ["倍率丹", "灵兽boss属性丹", "兽王boss属性丹", "仙兽boss属性丹", "内丹", "速度面包", "哈基米南北绿豆"];
            
            // 判断是否为特殊丹药
            const isSpecialElixir = specialElixirs.includes(elixirName);
            
            // 获取丹药倍率（特殊丹药不受倍率影响）
            const elixirMultiplier = isSpecialElixir ? 1 : CDXX2_GameData.GetElixirMultiplier();
            const actualElixirCount = this.ElixirNumber * elixirMultiplier;
            
            // 掉落丹药
            CDXX2_Equipment.Instance.addElixir(elixirName, actualElixirCount);
            
            // 20%概率掉落碎片，数量=怪物阶级
            const dropRoll = Math.random();
            if (dropRoll < CDXX2_FRAGMENT_DROP_RATE) {
                const tier = getEnemyTier(this.Enemy);
                CDXX2_GameData.AddFragment(tier);
                CDXX2_Equipment.Instance.addProp("碎片", tier);
                console.log(`掉落碎片! 怪物:${CDXX2_Tool.GetEnumKeyByValue(CDXX2_ENEMY, this.Enemy)}, 阶级:${tier}, 当前碎片:${CDXX2_GameData.Instance.userData["碎片"]}`);
            }
            
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
            CDXX2_PoolManager.Instance.put(this.node);
        })
    }

    Pause() {
        this._isPause = true;
    }

    Resume() {
        this._isPause = false;
    }

    Move() {
        // tween(this.node)
        //     .by(0.3, { y: this._moveY }, { easing: `sineIn` })
        //     .by(0.3, { y: -this._moveY }, { easing: `sineIn` })
        //     .union()
        //     .repeatForever()
        //     .start();
    }

    Attack() {
        CDXX2_PlayerController.Instance.BeHit(this.Harm);
        // 播放怪物攻击音效
        CDXX2_UIController.Instance.PlayMonsterAttack();
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (this._isRemove) return;
        // 敌人不再主动判定伤害，由玩家的攻击范围碰撞来主动施加伤害
        // 这样防止双重触发导致多次伤害
        // if (otherCollider.group == CDXX2_GROUP.CDXX2_PICKAXE) {
        //     this.BeHit(CDXX2_GameData.Instance.Harm);
        //     CDXX2_UIController.Instance.PlayHit();
        // }
    }

}


