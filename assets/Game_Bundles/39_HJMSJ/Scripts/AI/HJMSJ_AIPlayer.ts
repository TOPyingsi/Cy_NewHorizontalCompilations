import { _decorator, Collider2D, Color, Component, Contact2DType, director, instantiate, IPhysics2DContact, Label, math, Node, ParticleSystem2D, Prefab, ProgressBar, RigidBody2D, sp, Sprite, SpriteFrame, tween, v3, Vec3 } from 'cc';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
import { HJMSJ_Player } from '../Player/HJMSJ_Player';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { HJMSJ_Prop } from '../Bag/HJMSJ_Prop';
import { HJMSJ_ATKBox } from '../Player/HJMSJ_ATKBox';
import { HJMSJ_AudioManager } from '../HJMSJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_AIPlayer')
export class HJMSJ_AIPlayer extends Component {
    @property(Prefab)
    dropProp: Prefab = null;
    @property(Prefab)
    ExpPrefab: Prefab = null;
    @property()
    ExpNum: number = 6;
    @property()
    repelTime: number = 0.5;
    @property()
    moveSpeed: number = 2;
    @property()
    maxHealth: number = 10;
    @property()
    MinDistance: number = 150;  //AI与玩家的最小距离
    @property()
    ATK: number = 0;
    @property()
    isBossMap: boolean = false;

    protected DropPropArr: { Name: string, Num: number, Percent: number }[] = [
        { Name: "绿宝石", Num: 1, Percent: 1 },
    ]

    playerNode: Node = null;

    handRoot: Node = null;
    handProp: Node = null;
    Model: Node = null;

    searchBox: Collider2D = null;
    chasePlayer: boolean = false;


    private curHealth: number = 0;

    private particle: ParticleSystem2D = null;

    isDie: boolean = false;

    attackInterval: number = 0.5;
    start() {
        this.Model = this.node.getChildByName("Model");
        this.playerNode = HJMSJ_GameMgr.instance.playerNode;
        this.particle = this.Model.getChildByName("受击").getComponent(ParticleSystem2D);

        this.searchBox = this.node.getChildByName("SearchBox").getComponent(Collider2D);

        this.handRoot = this.node.getChildByName("handRoot");
        this.handProp = this.handRoot.children[0];

        this.searchBox.on(Contact2DType.BEGIN_CONTACT, this.searchPlayer, this);
        this.searchBox.on(Contact2DType.END_CONTACT, this.onExitContact, this);

        this.curHealth = this.maxHealth;

        this.schedule(this.randomMove, this.moveInterval);

        this.shake();
    }

    timer: number = 0;
    moveTimer: number = 0;

    update(deltaTime: number) {
        this.handRoot.position = v3(0, 0, 0);
        this.searchBox.node.position = v3(0, 0, 0);

        if (HJMSJ_GameMgr.instance.isGamePause) {
            return;
        }

        if (HJMSJ_GameMgr.instance.isGameOver) {
            console.log("游戏结束");
            this.unschedule(this.randomMove);
            return;
        }
        if (this.isDie) {
            return;
        }



        if (this.handRoot) {
            this.onMove(this.getPlayerDir());
        }

        if (this.chasePlayer) {
            let distance = this.getPlayerDistance();

            if (distance.length() < this.MinDistance) {

                this.timer += deltaTime;

                if (this.timer > this.attackInterval) {
                    // console.log("开始攻击");
                    this.Attack();
                    this.timer = 0;
                }
            }
            else {
                // console.log("正在追逐玩家");
                this.timer = 0;
                let dir = this.getPlayerDir();
                this.node.worldPosition = this.node.worldPosition.clone().add(dir.multiplyScalar(this.moveSpeed));

            }
        }

        if (this.moveSelf) {
            this.moveTimer += deltaTime;
            if (this.moveTimer < 2) {
                let moveDistance = this.node.worldPosition.clone().add(this.moveOffset.clone()).subtract(this.node.worldPosition.clone());
                let moveDir = moveDistance.clone().normalize().negative();
                this.node.worldPosition = this.node.worldPosition.clone().add(moveDir.multiplyScalar(this.moveSpeed));
            }
            else {
                this.moveTimer = 0;
                this.moveSelf = false;
            }
        }


    }

    _dir: Vec3 = v3(0, 0, 0);
    forwardDir = -1;
    onMove(Dir: Vec3) {

        // this._dir = v3(Dir.x, Dir.y, 0);

        // if (this._dir.x > 0 && this.Model.eulerAngles.y === 180) {
        //     tween(this.Model)
        //         .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
        //         .start();

        //     tween(this.handProp)
        //         .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
        //         .call(() => {
        //             this.handProp.position = v3(50, 0, 0);
        //             this.handRoot.getComponent(HJMSJ_ATKBox).Show();
        //             this.forwardDir = 1;
        //             // this.handPos = this.node.worldPosition;

        //             // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));
        //         })
        //         .start();
        // }

        // if (this._dir.x < 0 && this.Model.eulerAngles.y === 0) {
        //     tween(this.Model)
        //         .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
        //         .start();

        //     tween(this.handProp)
        //         .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
        //         .call(() => {
        //             this.handProp.position = v3(-50, 0, 0);
        //             this.handRoot.getComponent(HJMSJ_ATKBox).Show();
        //             this.forwardDir = -1;
        //             // this.handPos = this.node.worldPosition;

        //             // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));

        //         })
        //         .start();

        // }
    }

    searchPlayer(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

        let group = otherCollider.node.name;

        if (group === "Player") {
            this.chasePlayer = true;
            this.playerNode = otherCollider.node;
        }
    }

    onExitContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let group = otherCollider.node.name;

        if (group === "Player") {
            this.chasePlayer = false;
        }
    }

    isAttacking: boolean = false;
    Attack() {
        if (this.isAttacking) {
            return;
        }

        this.isAttacking = true;

        this.scheduleOnce(() => {
            let playerTs = this.playerNode.getComponent(HJMSJ_Player);
            //延迟时间内若玩家与AI距离仍小于阈值则玩家被攻击
            if (this.getPlayerDistance().length() < this.MinDistance) {
                let playerPos = this.getPlayerDir();
                playerTs.onAttack(-this.ATK, playerPos);
                playerTs.Shake(5, 0.2);
            }
            //无论是否攻击都重置状态
            this.isAttacking = false;

        }, 0.5);

    }

    onAttack(damage: number) {
        // console.log("AI被打了,剩余生命:" + this.curHealth);
        if (this.isDie) {
            return;
        }

        this.curHealth -= damage;
        HJMSJ_AudioManager.instance.playSFX(this.node.name + "叫");

        this.Repel();

        if (this.curHealth <= 0) {
            this.curHealth = 0;
            this.isDie = true;
            HJMSJ_AudioManager.instance.playSFX(this.node.name + "死亡");
            if (this.isBossMap) {
                director.getScene().emit("哈基米世界_Boss胜利");
            }
            this.DieAni();
        }

        this.getComponentInChildren(Sprite).color = Color.RED;

        this.scheduleOnce(() => {
            this.getComponentInChildren(Sprite).color = Color.WHITE;
        }, 0.1);

    }

    Repel() {
        this.particle.resetSystem();

        let dir = this.getPlayerDir().negative();

        tween(this.node)
            .by(this.repelTime, { worldPosition: dir.multiplyScalar(100) })
            .start();
    }

    DieAni() {
        // if (this.isDie) {
        //     return;
        // }

        this.DropExp();
        this.DropProp();

        this.unschedule(this.randomMove);

        this.searchBox.off(Contact2DType.BEGIN_CONTACT, this.searchPlayer);
        this.searchBox.off(Contact2DType.END_CONTACT, this.onExitContact);

        this.searchBox.enabled = false;
        this.searchBox.getComponent(RigidBody2D).enabled = false;

        // this.handRoot.active = false;

        let randomX = math.randomRange(-1, 1) * 50;

        tween(this.node)
            .by(2, { eulerAngles: v3(0, 0, 2160) })
            .start();

        tween(this.node)
            .by(0.5, { position: v3(randomX, 50, 0) }, { easing: "backInOut" })
            .by(1, { position: v3(0, -3500, 0) }, { easing: "circIn" })
            .call(() => {
                this.node.destroy();
            })
            .start();

    }

    DropExp() {
        for (let i = 0; i < this.ExpNum; i++) {
            let expNode = instantiate(this.ExpPrefab);
            expNode.parent = HJMSJ_GameMgr.instance.mapNode.children[0];
            let random = math.randomRange(-1, 1) * 100;
            expNode.worldPosition = this.node.worldPosition.clone().add(v3(random, random, 0));
        }
    }

    DropProp() {
        for (let i = 0; i < this.DropPropArr.length; i++) {
            if (this.DropPropArr[i].Percent !== 1) {
                let propRandom = math.randomRange(0, 1);
                if (propRandom > this.DropPropArr[i].Percent) {
                    continue;
                }
            }
            let dropPropNode = instantiate(this.dropProp);
            dropPropNode.parent = this.node.parent;

            let pos = this.node.worldPosition.clone();
            let random = math.randomRange(-1, 1) * 150;
            dropPropNode.worldPosition = pos.clone().add(v3(random, random, 0));

            let dropPropTs = dropPropNode.getComponent(HJMSJ_Prop);
            dropPropTs.propName = this.DropPropArr[i].Name;
            dropPropTs.propNum = this.DropPropArr[i].Num;

            console.log("AI掉落物品:" + dropPropTs.propName);
            HJMSJ_Incident.LoadSprite("Sprites/物品/" + dropPropTs.propName).then((sp: SpriteFrame) => {
                dropPropNode.getChildByName("propSprite").getComponent(Sprite).spriteFrame = sp;
                dropPropNode.getChildByName("propNum").getComponent(Label).string = dropPropTs.propNum.toString();
            });
        }

    }

    sign: number = 1;
    shake() {
        tween(this.node.getChildByName("Model"))
            .by(1, { eulerAngles: v3(0, 0, this.sign * 10) })
            .call(() => {
                this.sign = -this.sign;
                this.shake();
            })
            .start();
    }

    moveSelf: boolean = false;
    moveInterval: number = 4;
    moveOffset: Vec3 = new Vec3(0, 0, 0);
    randomMove() {
        if (this.chasePlayer) {
            return;
        }

        this.moveSelf = true;

        this.moveOffset = v3(math.randomRange(-1, 1) * 200, math.randomRange(-1, 1) * 200, 0);

        this.moveInterval = math.randomRange(2, 7);

    }

    getPlayerDistance(): Vec3 {
        let distance = this.node.worldPosition.clone().subtract(this.playerNode.worldPosition.clone());
        return distance;
    }

    getPlayerDir(): Vec3 {
        let distance = this.node.worldPosition.clone().subtract(this.playerNode.worldPosition.clone());
        let dir = distance.clone().normalize().negative();
        return dir;
    }
}


