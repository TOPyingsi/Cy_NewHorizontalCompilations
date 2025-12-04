import { _decorator, Collider2D, Component, Contact2DType, director, instantiate, IPhysics2DContact, Label, Node, NodeEventType, Prefab, ProgressBar, RigidBody2D, sp, Sprite, SpriteFrame, v2, v3, Vec2, Vec3 } from 'cc';
import { XYMJ_Pile } from './XYMJ_Pile';
import { XYMJ_GameManager } from './XYMJ_GameManager';
import { XYMJ_Constant } from './XYMJ_Constant';
import { XYMJ_Incident } from './XYMJ_Incident';
import { XYMJ_GameData } from './XYMJ_GameData';
import { XYMJ_AIPlayer } from './XYMJ_AIPlayer';
import { XYMJ_Bullet } from './XYMJ_Bullet';
import { XYMJ_AudioManager } from './XYMJ_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { XYMJ_Lock } from './XYMJ_Lock';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XYMJ_BagProp } from './XYMJ_BagProp';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_Player')
export class XYMJ_Player extends Component {


    @property(Node)
    public PickUpBtn: Node = null;

    @property(Node)
    mapCamera: Node = null;
    @property(Node)
    pileCamera: Node = null;

    public static couldMove: boolean = true;
    public static couldAttack: boolean = false;

    public bulletPrefab: Prefab = null;

    public healthBar: ProgressBar = null;
    public curHealth: number = 500;
    private maxHealth: number = 500;

    //手上物品的根节点
    public handRoot: Node = null;
    //手上的道具
    public handProp: Node = null;
    //手上道具的数据(是否为武器、攻击力、攻速)
    private handPropData: any = null;

    public colider: Collider2D = null;
    public atkColider: Collider2D = null;

    public startPos: Vec3 = null;

    private _rigibody: RigidBody2D = null;
    private _dir: Vec3 = v3(0, 0, 0);
    private moveSpeed: number = 3;      //移速
    private attackInterval: number = 0.5;   //攻速

    isInit: boolean = false;
    update(deltaTime: number) {
        if (XYMJ_GameManager.Instance.isGameOver) {
            return;
        }
        if (!this.isInit) {
            return;
        }

        if (!this.isAttacking && this.startATK) {
            this.Attack(this.attackDir);
        }

        if (!XYMJ_Player.couldMove) {
            return;
        }

        let offset = v3(this._dir.x * this.moveSpeed * deltaTime, this._dir.y * this.moveSpeed * deltaTime);
        this.node.position = this.node.position.add(offset);

        this.handRoot.position = v3(0, 0, 0);

        if (this.handProp?.isValid) {
            this.handProp.position = v3(0, this.handProp.position.y, 0);
            if (this.handRoot.eulerAngles.z < 90 && this.handRoot.eulerAngles.z > -90) {
                this.handProp.eulerAngles = v3(180, 0, this.handRoot.children[0].eulerAngles.z);
            }
        }


        // if (this.handRoot.eulerAngles.z > 90 && this.handRoot.eulerAngles.z < -90) {
        //     this.handProp.eulerAngles = v3(0, 0, this.handRoot.children[0].eulerAngles.z);
        // }

        this.mapCamera.position = v3(this.node.position.x, this.node.position.y, 1000);
        this.pileCamera.position = v3(this.node.position.x, this.node.position.y, 1000);

        // let mapOffset = v3(-this._dir.x * this.moveSpeed * deltaTime, -this._dir.y * this.moveSpeed * deltaTime, 0)
        // this.mapNode.worldPosition = this.mapNode.worldPosition.add(mapOffset);

    }

    health(num: number) {
        this.curHealth += num;
        if (this.curHealth >= this.maxHealth) {
            this.curHealth = this.maxHealth;
        }
        this.healthBar.progress = this.curHealth / this.maxHealth;
    }

    PickUpSelf: boolean = false;
    propNameSelf: string = "";
    couldOpenLock: boolean = false;
    curPlie: XYMJ_Pile = null;
    AIArray: XYMJ_AIPlayer[] = [];
    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let group = otherCollider.node;
        // console.log(group);

        if (group.name === "AIPlayer") {
            this.hitAI = true;

            let AITs = group.getComponent(XYMJ_AIPlayer);
            let index = this.AIArray.indexOf(AITs);
            if (index === -1) {
                this.AIArray.push(AITs);
            }
            // console.log(this.AIArray);
        }

        if (group.name === "横锁" || group.name === "竖锁") {
            this.PickUpBtn.active = true;

            let lockTs = otherCollider.node.getComponent(XYMJ_Lock);
            let isHasKey = XYMJ_GameData.Instance.GetPropNum(lockTs.keyName);
            //碰到锁
            this.curLockTs = lockTs;

            if (isHasKey > 0) {
                this.couldOpenLock = true;
            }

        }

        if (group.name === "BagProp") {
            this.PickUpSelf = true;
            this.PickUpBtn.active = true;
            this.propNameSelf = group.getComponent(XYMJ_BagProp).propName;
            return;
        }

        let isPlie = group.name.startsWith("Plie");
        if (isPlie) {
            this.curPlie = otherCollider.node.getComponent(XYMJ_Pile);
            if (this.curPlie.isSearch) {
                if (this.curPlie.getNum < 3) {
                    this.curPlie.hidePile(true);
                }
                return;
            }

            this.PickUpBtn.active = true;

        }

        if (group.name === "撤离点") {
            XYMJ_GameManager.Instance.startExtrac();
        }
    }

    onExitContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let group = otherCollider.node.name;

        if (group === "AIPlayer") {
            if (otherCollider.node.getComponent(XYMJ_AIPlayer)) {
                if (this.AIArray.indexOf(otherCollider.node.getComponent(XYMJ_AIPlayer)) != -1) {
                    this.AIArray.splice(this.AIArray.indexOf(otherCollider.node.getComponent(XYMJ_AIPlayer)), 1);
                    if (this.AIArray.length == 0) {
                        this.hitAI = false;
                    }
                }
            }
        }

        if (group === "横锁" || group === "竖锁") {
            this.PickUpBtn.active = false;

            this.couldOpenLock = false;
            this.curLockTs = null;
        }

        if (group === "BagProp") {
            this.PickUpSelf = false;
            this.PickUpBtn.active = false;
            this.propNameSelf = "";
            return;
        }

        let isPlie = group.startsWith("Plie");
        if (isPlie) {
            this.curPlie = otherCollider.node.getComponent(XYMJ_Pile);
            if (this.curPlie.isSearch && this.curPlie.getNum < 3) {
                this.curPlie.hidePile(false);
                return;
            }

            this.PickUpBtn.active = false;
            // this.curPlie = null;

        }

        if (group === "撤离点") {
            XYMJ_GameManager.Instance.exitExtrac();
        }
    }


    onMove(Dir: Vec3) {

        this._dir = v3(Dir.x, Dir.y, 0);

        XYMJ_Player.couldMove = true;
    }

    onStopMove() {

        XYMJ_Player.couldMove = false;
        this._dir = v3(0, 0, 0);

    }

    curLockTs: XYMJ_Lock = null;
    PickUp() {
        if (!this.node.parent.active) {
            return;
        }

        // if (this.PickUpSelf && this.propNameSelf && this.propNameSelf !== "") {
        //     XYMJ_GameManager.Instance.gameBagTs.addPropToBagByName(this.propNameSelf);
        // }

        if (this.couldOpenLock && this.curLockTs) {
            this.curLockTs.openDoor();
            this.PickUpBtn.active = false;
            return;
        }

        if (!this.couldOpenLock && this.curLockTs) {
            UIManager.ShowTip("背包中没有" + this.curLockTs.keyName + "！请先获取！");
            return;
        }

        // console.log("拾取");

        XYMJ_AudioManager.globalAudioPlay("捡东西");

        this.curPlie.creatProp();

        this.PickUpBtn.active = false;
    }

    isAttacking: boolean = false;
    attackDir: Vec3 = v3(0, 0, 0);
    startATK: boolean = false;
    hitAI: boolean = false;
    Attack(Dir: Vec3) {
        this.attackDir = Dir;
        this.startATK = true;

        let dir = v3(Dir.x, Dir.y, 0);
        let angleRad = Math.atan2(dir.y, dir.x);

        let angleDeg = angleRad * 180 / Math.PI;

        this.handRoot.eulerAngles = v3(0, 0, angleDeg);

        if (this.isAttacking) {
            return;
        }
        // console.log("攻击");

        this.handPropData = XYMJ_Constant.GetDataByName(this.handProp.name);

        if (this.handPropData.type !== "武器" || !this.handPropData) {
            return;
        }

        this.handPropData = XYMJ_Constant.GetWeaponDataByName(this.handProp.name);

        let attack = this.handPropData.Attack;
        let attackSpeed = this.handPropData.AttackSpeed;

        // XYMJ_Player.couldAttack = true;
        this.isAttacking = true;


        let attackInterval = 1 / attackSpeed;

        let propName = this.handPropData.Name;
        if (propName === "极简武力" || propName === "怒火手枪" || propName === "冰霜神话" || propName === "冲锋枪"
            || propName === "x手枪" || propName === "感染核心" || propName === "敢死队" || propName === "特战英豪"
            || propName === "巨龙传说" || propName === "至尊天极武士"
        ) {

            XYMJ_AudioManager.globalAudioPlay("枪声");

            let bulletNode = instantiate(this.bulletPrefab);

            let bulletTs = bulletNode.getComponent(XYMJ_Bullet);
            bulletTs.ATK = attack;
            bulletTs.owner = "Player";

            bulletTs.Dir = dir;

            bulletTs.rotate = this.handRoot.eulerAngles.clone();
            bulletTs.startForward = this.handRoot.forward.clone();

            // bulletNode.parent = this.handProp;

            bulletNode.parent = this.node.parent;

            bulletNode.worldPosition = this.handProp.getChildByName("firePos").worldPosition.clone();

            // bulletTs.start();

            this.handProp.getComponent(sp.Skeleton).animation = "kaiqiang";

            this.scheduleOnce(() => {
                this.isAttacking = false;
                if (propName === "巨龙传说" || propName === "至尊天极武士"
                ) {
                    this.handProp.getComponent(sp.Skeleton).animation = "daiji";
                    this.handProp.getComponent(sp.Skeleton).loop = true;
                } else {
                    this.handProp.getComponent(sp.Skeleton).loop = false;
                }
            }, attackInterval);

            return;
        }

        XYMJ_AudioManager.globalAudioPlay("近战击中");

        this.handProp.getComponent(sp.Skeleton).animation = "animation";

        // console.log("攻击间隔", attackInterval);

        this.scheduleOnce(() => {
            this.isAttacking = false;

            for (let i = 0; i < this.AIArray.length; i++) {
                this.AIArray[i].onAttack(attack);
            }

            // console.log("攻击结束");
            // XYMJ_Player.couldAttack = true;
        }, attackInterval);
    }

    StopAttack() {
        this.startATK = false;

        // this.handProp.getComponent(sp.Skeleton).animation = "None";
    }

    //收到攻击
    onAttack(damage: number) {
        this.curHealth -= damage;
        if (this.curHealth <= 0) {
            this.curHealth = 0;
            XYMJ_Player.couldAttack = false;
            this.isAttacking = false;
            this.node.active = false;
            XYMJ_GameData.Instance.KnapsackData = [];
            XYMJ_GameManager.Instance.lost();
            // director.loadScene("XYMJ_Start");
            // ProjectEventManager.emit(ProjectEvent.返回主页);
        }

        this.healthBar.progress = this.curHealth / this.maxHealth;
    }

    initData() {

        this.PickUpBtn = director.getScene().getChildByName("UICanvas").getChildByName("PickUp");
        this.pileCamera = director.getScene().getChildByName("PileCanvas").getChildByName("pileCamera");
        this.mapCamera = director.getScene().getChildByName("Canvas").getChildByName("mapCamera");

        this.startPos = this.node.worldPosition.clone();

        this._rigibody = this.getComponent(RigidBody2D);

        this.colider = this.node.getComponent(Collider2D);
        this.colider.on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
        this.colider.on(Contact2DType.END_CONTACT, this.onExitContact, this);

        director.getScene().on("校园摸金_开始移动", this.onMove, this);
        director.getScene().on("校园摸金_停止移动", this.onStopMove, this);

        director.getScene().on("校园摸金_开始攻击", this.Attack, this);
        director.getScene().on("校园摸金_停止攻击", this.StopAttack, this);

        this.handRoot = this.node.getChildByName("handRoot");
        this.handProp = this.handRoot.children[0];

        this.atkColider = this.handRoot.getComponent(Collider2D);
        this.atkColider.on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
        this.atkColider.on(Contact2DType.END_CONTACT, this.onExitContact, this);

        this.healthBar = this.node.getChildByName("healthBar").getComponent(ProgressBar);

        XYMJ_Incident.LoadSprite("Sprites/皮肤/" + XYMJ_GameData.Instance.Skin).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getChildByName("角色图").getComponent(Sprite).spriteFrame = sp;
            }
        });

        XYMJ_Incident.Loadprefab("Prefabs/子弹").then((prefab: Prefab) => {
            if (this.node?.isValid) {
                this.bulletPrefab = prefab;
            }
        });

        this.initBtnPickUp();

        this.isInit = true;

        XYMJ_GameManager.Instance.player = this;
    }

    initBtnPickUp() {
        this.PickUpBtn.on(NodeEventType.TOUCH_END, this.PickUp, this);
    }
}


