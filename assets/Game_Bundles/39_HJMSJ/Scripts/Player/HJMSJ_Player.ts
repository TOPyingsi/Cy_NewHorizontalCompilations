import { _decorator, AnimationComponent, Button, Collider2D, Component, Contact2DType, director, EventTouch, instantiate, IPhysics2DContact, ITriggerEvent, math, Node, NodeEventType, ParticleSystem2D, PhysicsSystem2D, Prefab, ProgressBar, RigidBody2D, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { HJMSJ_ATKBox } from './HJMSJ_ATKBox';
import { HJMSJ_Body } from './HJMSJ_Body';
import { HJMSJ_AIPlayer } from '../AI/HJMSJ_AIPlayer';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
import { HJMSJ_Prop } from '../Bag/HJMSJ_Prop';
import { HJMSJ_GameData } from '../HJMSJ_GameData';
import { HJMSJ_BagMgr } from '../Bag/HJMSJ_BagMgr';
import { HJMSJ_Incident } from '../HJMSJ_Incident';
import { HJMSJ_Constant } from '../HJMSJ_Constant';
import { HJMSJ_Block } from '../Interact/HJMSJ_Block';
import { HJMSJ_AudioManager } from '../HJMSJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Player')
export class HJMSJ_Player extends Component {

    @property(Node)
    shadow: Node = null;
    @property(Node)
    InteractBtn: Node = null;

    @property(Node)
    mapCamera: Node = null;
    @property(UITransform)
    mapUITransform: UITransform = null;

    @property(Prefab)
    bodyPrefab: Prefab = null;
    @property(Node)
    bodyNodeRoot: Node = null;

    public handPropType: string = null;
    public handPropName: string = null;
    public handPos: Vec3 = null;

    public static couldMove: boolean = true;
    public static couldAttack: boolean = false;

    public bulletPrefab: Prefab = null;
    public bodyRoot: Node = null;

    public particle: ParticleSystem2D = null;   //受击特效

    public healthBar: ProgressBar = null;
    public curHealth: number = 10;
    private maxHealth: number = 10;

    public screenSize: Vec2 = v2(2340, 1080);

    //手上物品的根节点
    public handRoot: Node = null;
    //手上的道具
    public handProp: Node = null;
    //手上道具的数据(是否为武器、攻击力、攻速)
    private handPropData: any = null;
    public handEffect: Node = null;

    public colider: Collider2D = null;
    public atkColider: Collider2D = null;

    public startPos: Vec3 = null;
    private _lastPosition: Vec3 = new Vec3();
    private _lastEulerAngles: Vec3 = new Vec3();

    private model: Node = null;
    private _rigibody: RigidBody2D = null;
    private _dir: Vec3 = v3(0, 0, 0);
    private moveSpeed: number = 3;      //移速
    private attackInterval: number = 0.5;   //攻速

    //相机晃动的参数
    openShake: boolean = true;
    isShaking: boolean = false;
    shakeTime: number = 0;
    shakeDuration: number = 0;
    originalPosition: Vec3 = null;
    shakeIntensity: number = 10;

    isInit: boolean = false;
    shiftTimer: number = 0;
    update(deltaTime: number) {
        if (HJMSJ_GameMgr.instance.isGamePause) {
            return;
        }

        if (this.isOnShift) {

            Vec3.copy(this._lastPosition, this.node.worldPosition);
            Vec3.copy(this._lastEulerAngles, this.node.eulerAngles);

            this.shiftTimer += deltaTime;

            if (this.shiftTimer >= 0.1) {
                this.updateBodyNodes();
            }

        }

        if (this.isDestorySnowBall) {
            if (this.SnowBallArray && this.SnowBallArray.length > 0) {
                for (let i = 0; i < this.SnowBallArray.length; i++) {
                    this.SnowBallArray[i].destroy();
                    console.log("销毁雪球");
                }
            }
        }

        let offset = v3(this._dir.x * this.moveSpeed * deltaTime, this._dir.y * this.moveSpeed * deltaTime);
        this.node.position = this.node.position.add(offset);
        this.handPos = this.node.worldPosition;
        this.handRoot.position = v3(0, -15, 0);
        this.shadow.worldPosition = this.node.worldPosition.clone().add(v3(0, -80, 0));

        if (this.isRepelling) {
            offset = v3(this.playerPos.x * this.repelDistance / 100, this.playerPos.y * this.repelDistance / 100);
            this.node.position = this.node.position.add(offset);
        }


        if (this.openShake) {

            //摄像机是否出界
            let playerOffsetX = Math.abs(this.node.position.x) + this.screenSize.x / 2;
            let playerOffsetY = Math.abs(this.node.position.y) + this.screenSize.y / 2;

            if (playerOffsetX <= this.mapUITransform.width / 2 && playerOffsetY <= this.mapUITransform.height / 2) {
                this.mapCamera.position = v3(this.node.position.x, this.node.position.y, 1000);
            }
            else if (playerOffsetX > this.mapUITransform.width / 2 && playerOffsetY <= this.mapUITransform.height / 2) {
                this.mapCamera.position = v3(this.mapCamera.position.x, this.node.position.y, 1000);
            }
            else if (playerOffsetX <= this.mapUITransform.width / 2 && playerOffsetY > this.mapUITransform.height / 2) {
                this.mapCamera.position = v3(this.node.position.x, this.mapCamera.position.y, 1000);
            }

            if (!this.isShaking) {
                return;
            }

            this.shakeTime += deltaTime;

            //生成随机的摄像机偏移
            let offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            let offsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
            //应用摄像机偏移
            this.mapCamera.position = new Vec3(this.mapCamera.position.x + offsetX, this.mapCamera.position.y + offsetY, this.mapCamera.position.z);

            if (this.shakeTime >= this.shakeDuration) {
                //晃动结束，恢复摄像机位置
                this.isShaking = false;

                //摄像机是否出界
                let playerOffsetX = Math.abs(this.node.position.x) + this.screenSize.x / 2;
                let playerOffsetY = Math.abs(this.node.position.y) + this.screenSize.y / 2;

                if (playerOffsetX <= this.mapUITransform.width / 2 && playerOffsetY <= this.mapUITransform.height / 2) {
                    this.mapCamera.position = v3(this.node.position.x, this.node.position.y, 1000);
                }
                else if (playerOffsetX > this.mapUITransform.width / 2 && playerOffsetY <= this.mapUITransform.height / 2) {
                    this.mapCamera.position = v3(this.mapCamera.position.x, this.node.position.y, 1000);
                }
                else if (playerOffsetX <= this.mapUITransform.width / 2 && playerOffsetY > this.mapUITransform.height / 2) {
                    this.mapCamera.position = v3(this.node.position.x, this.mapCamera.position.y, 1000);
                }

                if (playerOffsetY > this.mapUITransform.height / 2) {
                    this.mapCamera.position = v3(this.node.position.x, this.mapCamera.position.y, 1000);
                }
                // this.mapCamera.position = v3(this.node.position.x, this.mapCamera.position.y, 1000);
                return;
            }
        }

    }

    curSpriteFrame: SpriteFrame = null;
    changeSkin() {
        let skinName = HJMSJ_GameData.Instance.curSkin;
        HJMSJ_Incident.LoadSprite("Sprites/角色/" + skinName).then((sp: SpriteFrame) => {
            let modelSprite = this.model.getComponent(Sprite);
            modelSprite.spriteFrame = sp;
            this.curSpriteFrame = sp;
        });
    }

    health(num: number) {
        if (num < 0) {
            num += HJMSJ_GameData.Instance.armor / 2;
            if (num >= 0) {
                num = 0;
            }
        }

        this.curHealth += num;
        if (this.curHealth >= this.maxHealth) {
            this.curHealth = this.maxHealth;
        }
        if (this.curHealth <= 0) {
            this.curHealth = 0;
        }

        director.getScene().emit("哈基米世界_改变生命值", num);

        // console.log("改变生命值", this.curHealth);

    }

    BlockArray: HJMSJ_Block[] = [];
    AIArray: HJMSJ_AIPlayer[] = [];
    SnowBallArray: Node[] = [];

    onAttackBoxStart(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let group = otherCollider.node;

        if (group.name === "小雪人" || group.name === "AIPlayer" || group.name.startsWith("Boss")) {
            let AITs = group.getComponent(HJMSJ_AIPlayer);
            this.AIArray.push(AITs);
            return;
        }

        if (group.name === "雪球") {
            let snowBall = group;
            this.SnowBallArray.push(snowBall);
            return;
        }

        let blockTs = group.getComponent(HJMSJ_Block);
        if (blockTs && blockTs.couldAttack) {
            this.BlockArray.push(blockTs);
        }
    }

    onAttackBoxEnd(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let group = otherCollider.node;

        if (group.name === "小雪人" || group.name === "AIPlayer" || group.name.startsWith("Boss")) {
            let AITs = group.getComponent(HJMSJ_AIPlayer);
            let index = this.AIArray.indexOf(AITs);
            if (index !== -1) {
                this.AIArray.splice(index, 1);
            }
            return;
        }

        if (group.name === "雪球") {
            let snowBall = group;
            let index = this.SnowBallArray.indexOf(snowBall);
            if (index !== -1) {
                this.SnowBallArray.splice(index, 1);
            }
            return;
        }

        let blockTs = group.getComponent(HJMSJ_Block);
        if (blockTs && blockTs.couldAttack) {
            let index = this.BlockArray.indexOf(blockTs);
            if (index !== -1) {
                this.BlockArray.splice(index, 1);
            }
        }
    }

    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let group = otherCollider.node;
        // console.log(group);

        switch (group.name) {
            case "Prop":
                let PropTs = group.getComponent(HJMSJ_Prop);
                let propNum = HJMSJ_GameData.Instance.GetPropNum(PropTs.propName);
                let bagLenth = HJMSJ_GameData.Instance.getKnapsackLength();

                if (propNum <= 0 && bagLenth >= 36) {
                    console.log("背包已满");
                    return;
                }

                tween(group)
                    .to(0.2, { worldPosition: this.node.worldPosition, scale: v3(0, 0, 0) })
                    .call(() => {
                        let PropTs = group.getComponent(HJMSJ_Prop);

                        if (HJMSJ_GameData.Instance.pushKnapsackData(PropTs.propName, PropTs.propNum, HJMSJ_BagMgr.curBagID)) {
                            HJMSJ_GameMgr.instance.BagMgrTs.pushPropByName(PropTs.propName, PropTs.propNum);
                        }

                        group.destroy();
                    })
                    .start();
                break;
            case "工作台":
            case "BOSS地图":
            case "购买商店":
            case "等级奖励":
            case "皮肤商城":
            case "世界地图":
                this.InteractTarget = group.name;
                this.InteractBtn.active = true;
                break;

        }

    }

    onExitContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let group = otherCollider.node;

        switch (group.name) {
            case "工作台":
            case "BOSS地图":
            case "购买商店":
            case "等级奖励":
            case "皮肤商城":
            case "世界地图":
                this.InteractTarget = "";
                this.InteractBtn.active = false;
                break;

        }
    }

    @property(SpriteFrame)
    blackFrame: SpriteFrame = null;
    @property(SpriteFrame)
    commonFrame: SpriteFrame = null;
    @property(Node)
    blackBg: Node = null;
    InteractTarget: string = "";
    onBtnClick(event: EventTouch) {

        let blackBtn = director.getScene().getChildByName("Canvas").getChildByName("暗黑模式");
        let commonBtn = director.getScene().getChildByName("Canvas").getChildByName("正常模式");

        switch (event.target.name) {
            case "交互":
                director.getScene().emit("哈基米世界_交互", this.InteractTarget);
                break;

            // case "暗黑模式":
            //     let blackSprite = this.model.getComponent(Sprite);
            //     blackSprite.spriteFrame = this.blackFrame;
            //     this.node.getChildByName("暗黑特效").active = true;
            //     this.getComponent(AnimationComponent).play();
            //     this.blackBg.active = true;
            //     blackBtn.active = false;
            //     commonBtn.active = true;
            //     break;
            // case "正常模式":
            //     let commonSprite = this.model.getComponent(Sprite);
            //     commonSprite.spriteFrame = this.commonFrame;
            //     this.node.getChildByName("暗黑特效").active = false;
            //     this.getComponent(AnimationComponent).stop();
            //     this.blackBg.active = false;
            //     blackBtn.active = true;
            //     commonBtn.active = false;
            //     break;

        }
    }

    forwardDir: number = 1;
    onMove(Dir: Vec3) {

        this._dir = v3(Dir.x, Dir.y, 0);

        if (this._dir.x > 0 && this.model.eulerAngles.y === 180) {
            tween(this.model)
                .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
                .start();

            tween(this.handProp)
                .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
                .call(() => {
                    this.handProp.position = v3(50, 0, 0);
                    this.handRoot.getComponent(HJMSJ_ATKBox).Show();
                    this.forwardDir = 1;
                    // this.handPos = this.node.worldPosition;

                    // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));
                })
                .start();
        }

        if (this._dir.x < 0 && this.model.eulerAngles.y === 0) {
            tween(this.model)
                .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
                .start();

            tween(this.handProp)
                .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
                .call(() => {
                    this.handProp.position = v3(-50, 0, 0);
                    this.handRoot.getComponent(HJMSJ_ATKBox).Show();
                    this.forwardDir = -1;
                    // this.handPos = this.node.worldPosition;

                    // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));

                })
                .start();

        }
    }

    preDir: Vec3 = v3(-1, 0, 0);
    onStopMove() {
        this.preDir = this._dir.clone();
        this._dir = v3(0, 0, 0);

    }

    changProp(propName: string) {
        // if (this.handPropName === "") {
        //     this.handProp.getChildByName("手").active = false;
        //     return;
        // }
        // else {
        //     this.handProp.getChildByName("手").active = true;
        // }

        if (!propName || propName === "") {
            this.handProp.getChildByName("手").active = false;
            this.handProp.getComponent(Sprite).spriteFrame = null;
            this.handPropName = null;
            this.handPropType = null;
            return;
        }

        HJMSJ_Incident.LoadSprite("Sprites/物品/" + propName).then((sp: SpriteFrame) => {
            this.handProp.getComponent(Sprite).spriteFrame = sp;
            this.handPropName = propName;
            this.handPropType = HJMSJ_Constant.getTypeByName(propName);
            this.handProp.getChildByName("手").active = true;
        });

    }

    isDestorySnowBall: boolean = false;
    isAttacking: boolean = false;
    //普通攻击
    onCommonAttack(Dir: Vec3) {
        if (this.isAttacking) {
            return;
        }

        this.isAttacking = true;

        if (this.handPropType === "武器") {
            this.handEffect.active = true;
            HJMSJ_AudioManager.instance.playSFX("攻击");
        }


        tween(this.handRoot)
            .by(0.05, { eulerAngles: v3(0, 0, 20 * this.forwardDir) })
            .by(0.1, { eulerAngles: v3(0, 0, -100 * this.forwardDir) })
            .call(() => {
                this.isDestorySnowBall = true;

                tween(this.handRoot)
                    .to(0.1, { eulerAngles: v3(0, 0, 0) })
                    .call(() => {
                        this.isDestorySnowBall = false;

                        this.isAttacking = false;
                        //碰到的敌人数组存在且数组长度不为0
                        if (this.AIArray && this.AIArray.length > 0) {
                            //敌人收到6点伤害
                            this.AIArray.forEach(element => {
                                let atk = HJMSJ_Constant.GetWeaponDataByName(this.handPropName).Attack;
                                element.onAttack(atk);
                                this.Shake(5, 0.8);
                            });
                        }



                        if (this.BlockArray && this.BlockArray.length > 0) {
                            let length = this.BlockArray.length - 1;
                            this.BlockArray[length].onAttack(6);
                            this.Shake(5, 0.8);
                        }

                        this.handEffect.active = false;

                    })
                    .start();
            })
            .start();
    }

    playerPos: Vec3 = v3(0, 0, 0);
    isRepelling: boolean = false;
    repelDistance: number = 100;
    Repel(playerPos: Vec3) {
        this.particle.resetSystem();
        this.isRepelling = true;
        this.playerPos = playerPos;
        // playerPos.multiplyScalar(this.repelDistance)
        this.scheduleOnce(() => {
            this.isRepelling = false;
        }, 0.5);
    }

    //相机晃动
    Shake(range: number, time: number) {
        if (this.isShaking) return;
        this.shakeIntensity = range;
        this.shakeDuration = time;
        this.isShaking = true;
        this.shakeTime = 0;
        // this.originalPosition = this.mapCamera.position.clone();
    }

    //蓄力攻击
    onChargeAttack(Dir: Vec3) {
        UIManager.ShowTip("该功能未开启!");
    }

    StopAttack() {

    }

    //受到攻击
    onAttack(damage: number, playerPos: Vec3) {
        // this.Shake(10, 0.3);
        this.health(damage);
        this.Repel(playerPos);
        // console.log("受到攻击", damage);
    }

    onGetExp(expNum: number) {
        let index = math.randomRangeInt(1, 6);
        HJMSJ_AudioManager.instance.playSFX("经验" + index);
        director.getScene().emit("哈基米世界_改变经验值", expNum);
    }

    //闪避
    shiftNodes: Node[] = [];
    isOnShift: boolean = false;
    onShift() {
        if (this.isOnShift) {
            return;
        }

        this.isOnShift = true;

        this.creatBody(7);

        let offset = v2(0, 0);
        if (this._dir.clone().length() !== 0) {
            offset = v2(this._dir.x * this.moveSpeed * 0.1, this._dir.y * this.moveSpeed * 0.1);

            tween(this.node)
                .to(0.5, { eulerAngles: v3(0, 0, -30 * this.forwardDir) })
                .start();
            tween(this._rigibody)
                .by(0.5, { linearVelocity: offset })
                // .by(0.5, { position: v3(0, 0, 0) })
                .call(() => {
                    tween(this.node)
                        .to(0.3, { eulerAngles: v3(0, 0, 0) })
                        .start();
                })
                .start();
        }
        else {
            offset = v2(this.preDir.x * this.moveSpeed * 0.1, this.preDir.y * this.moveSpeed * 0.1);

            tween(this.node)
                .to(0.5, { eulerAngles: v3(0, 0, -30 * this.forwardDir) })
                .start();
            tween(this._rigibody)
                // .by(0.5, { position: this.preDir.clone().multiplyScalar(this.moveSpeed * 1.5) })
                .by(0.5, { linearVelocity: offset })
                // .by(0.5, { position: v3(0, 0, 0) })
                .call(() => {
                    tween(this.node)
                        .to(0.3, { eulerAngles: v3(0, 0, 0) })
                        .start();
                })
                .start();
        }

        this.scheduleOnce(() => {
            this.isOnShift = false;
            this.shiftTimer = 0;
            this._rigibody.linearVelocity = v2(0, 0);
            for (let i = 0; i < this.bodyNodeRoot.children.length; i++) {
                this.bodyNodeRoot.children[i].destroy();
            }
        }, 0.85);
    }

    creatBody(num: number) {
        let startOp = 255;
        for (let i = 0; i < num; i++) {

            let bodyNode = instantiate(this.bodyPrefab);

            bodyNode.parent = this.bodyNodeRoot;

            let bodySprite = bodyNode.getComponentInChildren(Sprite);
            bodySprite.spriteFrame = this.curSpriteFrame;

            bodyNode.eulerAngles = this.model.eulerAngles;

            if (i === 0) {
                let bodyTs = this.bodyNodeRoot.children[0].getComponent(HJMSJ_Body);
                bodyTs.init(this.model);
                continue;
            }

            let bodyTs = bodyNode.getComponent(HJMSJ_Body);
            bodyTs.init(this.shiftNodes[i - 1]);

            let uiOpc = bodyNode.getComponent(UIOpacity);
            startOp -= 50;
            uiOpc.opacity = startOp;

        }
    }

    updateBodyNodes() {
        if (this.shiftNodes.length === 0) return;

        // 第一个身体节点跟随蛇头
        const firstBody = this.shiftNodes[0].getComponent(HJMSJ_Body);
        if (firstBody) {
            firstBody.spriteNode.eulerAngles = this.model.eulerAngles;
            firstBody.followTarget(this._lastPosition, this._lastEulerAngles);
        }

        // 更新其余身体节点
        for (let x = 1; x < this.shiftNodes.length; x++) {
            const currentBody = this.shiftNodes[x].getComponent(HJMSJ_Body);
            const prevBody = this.shiftNodes[x - 1].getComponent(HJMSJ_Body);

            if (currentBody && prevBody) {
                let distance = prevBody.lastPosition.clone().subtract(currentBody.lastPosition.clone());
                let length = distance.length();
                if (length > 0.2) {
                    // currentBody.node.forward = prevBody.node.forward;
                    currentBody.spriteNode.eulerAngles = this.model.eulerAngles;
                    currentBody.followTarget(prevBody.lastPosition, prevBody.lastEulerAngles);
                }
            }
        }
    }

    start() {
        if (!this.isInit) {
            this.isInit = true;
            this.initData();

            this.schedule(() => {
                HJMSJ_GameData.DateSave();
            }, 5);
        }
    }

    initData() {
        // PhysicsSystem2D.instance.debugDrawFlags = 1;

        this.startPos = this.node.worldPosition.clone();

        this.handRoot = this.node.getChildByName("handRoot");
        this.handProp = this.handRoot.getChildByName("handProp");

        this.model = this.node.getChildByName("Model");
        this.particle = this.model.getChildByName("受击").getComponent(ParticleSystem2D);

        this._rigibody = this.getComponent(RigidBody2D);

        this.colider = this.node.getComponent(Collider2D);
        this.colider.on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
        this.colider.on(Contact2DType.END_CONTACT, this.onExitContact, this);

        director.getScene().on("哈基米世界_开始移动", this.onMove, this);
        director.getScene().on("哈基米世界_停止移动", this.onStopMove, this);

        director.getScene().on("哈基米世界_普通攻击", this.onCommonAttack, this);
        director.getScene().on("哈基米世界_蓄力攻击", this.onChargeAttack, this);
        director.getScene().on("哈基米世界_停止攻击", this.StopAttack, this);

        director.getScene().on("哈基米世界_闪避", this.onShift, this);
        director.getScene().on("哈基米世界_更换皮肤", this.changeSkin, this);

        director.getScene().on("哈基米世界_更换底部道具", (propName: string) => {
            this.changProp(propName);
        }, this);

        //武器盒子
        this.atkColider = this.handRoot.getComponent(Collider2D);
        this.atkColider.on(Contact2DType.BEGIN_CONTACT, this.onAttackBoxStart, this);
        this.atkColider.on(Contact2DType.END_CONTACT, this.onAttackBoxEnd, this);

        Vec3.copy(this._lastPosition, this.model.worldPosition);
        Vec3.copy(this._lastEulerAngles, this.model.eulerAngles);

        this.shiftNodes = this.bodyNodeRoot.children;
        this.handEffect = this.handProp.getChildByName("拖尾");

        this.isInit = true;

        this.changeSkin();

    }

}


