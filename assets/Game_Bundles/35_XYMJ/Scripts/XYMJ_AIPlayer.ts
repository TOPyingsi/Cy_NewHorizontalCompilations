import { _decorator, Collider2D, Color, Component, Contact2DType, IPhysics2DContact, math, Node, ParticleSystem2D, ProgressBar, RigidBody2D, sp, Sprite, SpriteFrame, tween, v3, Vec3 } from 'cc';
import { XYMJ_Incident } from './XYMJ_Incident';
import { XYMJ_GameData } from './XYMJ_GameData';
import { XYMJ_Constant } from './XYMJ_Constant';
import { XYMJ_Player } from './XYMJ_Player';
import { XYMJ_GameManager } from './XYMJ_GameManager';
import { XYMJ_AudioManager } from './XYMJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_AIPlayer')
export class XYMJ_AIPlayer extends Component {
    playerNode: Node = null;

    handRoot: Node = null;
    handProp: Node = null;

    moveSpeed: number = 2;
    searchBox: Collider2D = null;
    chasePlayer: boolean = false;

    public healthBar: ProgressBar = null;
    private curHealth: number = 100;
    private maxHealth: number = 100;
    public static SkinData: string[] = ["666", "亲亲", "吃瓜", "哭笑", "滑稽", "小丑", "爱慕", "坏笑", "遮眼"];//人机能使用的皮肤列表
    isDie: boolean = false;

    ATK: number = 25;
    attackInterval: number = 1.5;
    start() {
        this.maxHealth = XYMJ_Constant.level * XYMJ_Constant.level * 50 + 200;
        this.curHealth = XYMJ_Constant.level * XYMJ_Constant.level * 50 + 200;
        this.ATK = XYMJ_Constant.level * 10 + 20;
        this.searchBox = this.node.getChildByName("SearchBox").getComponent(Collider2D);

        this.handRoot = this.node.getChildByName("handRoot");
        this.handProp = this.handRoot.children[0];

        this.healthBar = this.node.getChildByName("healthBar").getComponent(ProgressBar);

        this.searchBox.on(Contact2DType.BEGIN_CONTACT, this.searchPlayer, this);
        this.searchBox.on(Contact2DType.END_CONTACT, this.onExitContact, this);

        let SkinName: string = XYMJ_AIPlayer.SkinData[Math.floor(Math.random() * XYMJ_AIPlayer.SkinData.length)];
        XYMJ_Incident.LoadSprite("Sprites/皮肤/" + SkinName).then((sp: SpriteFrame) => {
            if (this.node?.isValid) {
                this.node.getComponent(Sprite).spriteFrame = sp;
            }
        })
        this.node.getChildByName("handRoot").children[Math.floor(Math.random() * 4)].active = true;

        this.schedule(this.randomMove, this.moveInterval);
    }

    timer: number = 0;
    moveTimer: number = 0;
    update(deltaTime: number) {
        if (XYMJ_GameManager.Instance.isGameOver) {
            this.unschedule(this.randomMove);
            return;
        }
        if (this.isDie) {
            return;
        }

        this.handRoot.position = v3(0, 0, 0);
        this.searchBox.node.position = v3(0, 0, 0);

        if (this.chasePlayer) {
            let distance = this.node.worldPosition.clone().subtract(this.playerNode.worldPosition.clone());
            let dir = distance.clone().normalize().negative();
            if (distance.length() < 100) {

                this.timer += deltaTime;

                if (this.timer > this.attackInterval) {
                    // console.log("开始攻击");
                    this.Attack(dir);
                    this.timer = 0;
                }
            }
            else {
                // console.log("正在追逐玩家");
                this.timer = 0;
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

    searchPlayer(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

        let group = otherCollider.node.name;

        if (group.startsWith("Player")) {
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
    Attack(Dir: Vec3) {
        if (this.isAttacking) {
            return;
        }

        let dir = v3(Dir.x, Dir.y, 0);
        let angleRad = Math.atan2(dir.y, dir.x);

        let angleDeg = angleRad * 180 / Math.PI;

        this.handRoot.eulerAngles = v3(0, 0, angleDeg);

        let handPropData = XYMJ_Constant.GetWeaponDataByName(this.handProp.name);

        let attck = handPropData.Attack;
        let attackSpeed = handPropData.AttackSpeed;

        // XYMJ_Player.couldAttack = true;
        this.isAttacking = true;

        this.handProp.getComponent(sp.Skeleton).animation = "animation";

        let attackInterval = 1 / attackSpeed;

        console.log("攻击间隔", attackInterval);

        this.scheduleOnce(() => {
            this.isAttacking = false;

            this.playerNode.getComponent(XYMJ_Player).onAttack(attck);

            // console.log("攻击结束");
            // XYMJ_Player.couldAttack = true;
        }, attackInterval);
    }

    onAttack(damage: number) {
        // console.log("AI被打了,剩余生命:" + this.curHealth);

        this.curHealth -= damage;
        if (this.curHealth <= 0 && this.isDie == false) {
            XYMJ_GameData.Instance.GameData[1] += 5;
            XYMJ_AudioManager.globalAudioPlay("击杀");
            this.curHealth = 0;
            this.isDie = true;
            this.DieAni();
        }

        this.getComponent(Sprite).color = Color.RED;

        this.scheduleOnce(() => {
            this.getComponent(Sprite).color = Color.WHITE;
        }, 0.1);
        if (XYMJ_GameManager.Instance.player) {
            let distance = this.node.worldPosition.clone().subtract(XYMJ_GameManager.Instance.player.node.worldPosition.clone());
            let dir = distance.clone().normalize().negative();
            tween(this.node)
                .to(0.2, { position: this.node.position.clone().add(dir.multiplyScalar(-15)) }, { easing: "backOut" })
                .start();
            XYMJ_AudioManager.globalAudioPlay("受击");
        }
        this.node.getChildByName("血液溅射").getComponent(ParticleSystem2D).resetSystem();
        this.healthBar.progress = this.curHealth / this.maxHealth;
    }

    DieAni() {

        this.unschedule(this.randomMove);

        this.searchBox.off(Contact2DType.BEGIN_CONTACT, this.searchPlayer);
        this.searchBox.off(Contact2DType.END_CONTACT, this.onExitContact);

        this.searchBox.enabled = false;
        this.searchBox.getComponent(RigidBody2D).enabled = false;

        // console.log(this.searchBox.enabled);
        // console.log(this.searchBox.getComponent(RigidBody2D).enabled);

        this.handRoot.active = false;
        this.healthBar.node.active = false;

        let randomX = math.randomRange(-1, 1) * 50;

        tween(this.node)
            .by(2, { eulerAngles: v3(0, 0, 2160) })
            .start();

        tween(this.node)
            .by(0.5, { position: v3(randomX, 50, 0) }, { easing: "backInOut" })
            .by(1, { position: v3(0, -2500, 0) }, { easing: "circIn" })
            .call(() => {
                this.node.destroy();
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
}