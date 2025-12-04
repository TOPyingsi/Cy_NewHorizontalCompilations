import { _decorator, Collider2D, Component, instantiate, IPhysics2DContact, math, Node, ParticleSystem2D, Prefab, tween, UITransform, v3, Vec3 } from 'cc';
import { HJMSJ_AIPlayer } from './HJMSJ_AIPlayer';
import { HJMSJ_Player } from '../Player/HJMSJ_Player';
import { HJMSJ_ATKBox } from '../Player/HJMSJ_ATKBox';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
import { HJMSJ_SnowBall } from './HJMSJ_SnowBall';
import { HJMSJ_IceBall } from './HJMSJ_IceBall';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Boss3')
export class HJMSJ_Boss3 extends HJMSJ_AIPlayer {

    //雪球预制体
    @property(Prefab)
    SnowBallPrefab: Prefab = null;
    //冰球预制体
    @property(Prefab)
    IceBallPrefab: Prefab = null;
    //小雪人预制体
    @property(Prefab)
    SnowManPrefab: Prefab = null;

    private iceParticle: ParticleSystem2D = null;
    private iceEffect: Node = null;

    private leftHand: Node = null;
    private rightHand: Node = null;

    override update(deltaTime: number): void {
        this.handRoot.position = v3(0, 0, 0);
        this.searchBox.node.position = v3(0, 0, 0);

        if (HJMSJ_GameMgr.instance.isGamePause) {
            return;
        }

        if (HJMSJ_GameMgr.instance.isGameOver) {
            this.unschedule(this.randomMove);
            return;
        }

        if (this.isDie) {
            return;
        }

        if (this.handRoot) {
            this.onMove(this.getPlayerDir());
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

        if (this.chasePlayer) {
            let distance = this.getPlayerDistance();

            if (distance.length() < this.MinDistance) {

                this.timer += deltaTime;

                if (this.timer > this.attackInterval) {
                    console.log("开始攻击");
                    this.Attack();
                    this.timer = 0;
                }
            }
            else {
                console.log("正在追逐玩家");
                this.timer = 0;
                let dir = this.getPlayerDir();
                this.node.worldPosition = this.node.worldPosition.clone().add(dir.multiplyScalar(this.moveSpeed));

            }
        }


    }

    override Attack() {
        if (this.isAttacking) {
            return;
        }

        this.isAttacking = true;

        // tween(this.handRoot)
        //     .to(0.15, { eulerAngles: v3(0, 0, -70) })
        //     .to(0.25, { eulerAngles: v3(0, 0, 30) })
        //     .start();


        this.scheduleOnce(() => {
            let playerTs = this.playerNode.getComponent(HJMSJ_Player);
            //延迟时间内若玩家与AI距离仍小于阈值则玩家被攻击
            if (this.getPlayerDistance().length() < this.MinDistance) {
                // this.SnowBall();
                // this.IceBall();
                // this.CreatSnowMan();

                let random = math.randomRangeInt(0, 3);
                switch (random) {
                    case 0:
                        this.SnowBall();
                        break;
                    case 1:
                        this.IceBall();
                        break;
                    case 2:
                        this.CreatSnowMan();
                        break;
                }
            }
            //无论是否攻击都重置状态
            this.isAttacking = false;

        }, 0.4);

    }

    //雪球技能持续时间
    snowBallTime: number = 4;
    //雪球生成间隔
    snowBallInterval: number = 0.2;
    private isSkilling: boolean = false;
    //发射雪球
    SnowBall() {
        if (!this.leftHand) {
            this.leftHand = this.handProp.getChildByName("leftHand");
            this.rightHand = this.handProp.getChildByName("rightHand");
        }

        if (this.isSkilling) {
            return;
        }

        this.isSkilling = true;

        let times = this.snowBallTime / this.snowBallInterval;
        this.schedule(this.creatSnowBall, this.snowBallInterval, times);

        tween(this.leftHand)
            .by(this.snowBallTime / 2, { eulerAngles: v3(0, 0, -135) })
            .call(() => {
                tween(this.leftHand)
                    .by(this.snowBallTime / 2, { eulerAngles: v3(0, 0, 135) })
                    .start();
            })
            .start();

        tween(this.rightHand)
            .by(this.snowBallTime / 2, { eulerAngles: v3(0, 0, -135) })
            .call(() => {
                tween(this.rightHand)
                    .by(this.snowBallTime / 2, { eulerAngles: v3(0, 0, 135) })
                    .call(() => {
                        this.chasePlayer = false;
                    })
                    .start();
            })
            .start();

        this.scheduleOnce(() => {
            this.moveSelf = true;
            this.unschedule(this.creatSnowBall);
        }, this.snowBallTime);

        this.scheduleOnce(() => {
            this.isSkilling = false;
            this.chasePlayer = true;
        }, this.snowBallTime * 2);
    }

    //发射冰球
    IceBall() {
        if (!this.leftHand) {
            this.leftHand = this.handProp.getChildByName("leftHand");
            this.rightHand = this.handProp.getChildByName("rightHand");
        }

        if (this.isSkilling) {
            return;
        }

        this.isSkilling = true;

        let times = 1;
        let iceEffect = null;
        switch (this.forwardDir) {
            case -1:
                //施法特效
                iceEffect = this.leftHand.getChildByName("冰球特效");
                this.iceParticle = iceEffect.getComponent(ParticleSystem2D);
                this.iceParticle.resetSystem();
                this.iceEffect = iceEffect.getChildByName("拖尾");
                this.iceEffect.active = true;
                this.chasePlayer = false;

                //施法手动画
                this.schedule(this.creatIceBall, this.iceBallInterval, times);

                tween(this.leftHand)
                    .by(0.5, { eulerAngles: v3(0, 0, 10) })
                    .call(() => {
                        tween(this.leftHand)
                            .by(0.2, { eulerAngles: v3(0, 0, -90) })
                            .start();
                    })
                    .start();
                //施法手回正
                this.scheduleOnce(() => {
                    tween(this.leftHand)
                        .to(0.3, { eulerAngles: v3(0, 180, -25) })
                        .call(() => {
                            this.iceEffect.active = false;
                        })
                        .start();
                }, 0.9);

                this.scheduleOnce(() => {
                    this.chasePlayer = true;
                    this.isSkilling = false;
                }, this.iceBallTime * 3);
                break;

            case 1:
                //施法特效
                iceEffect = this.rightHand.getChildByName("冰球特效");
                this.iceParticle = this.rightHand.getChildByName("冰球特效").getComponent(ParticleSystem2D);
                this.iceParticle.resetSystem();
                this.iceEffect = iceEffect.getChildByName("拖尾");
                this.iceEffect.active = true;
                this.chasePlayer = false;

                //施法手动画
                this.schedule(this.creatIceBall, this.iceBallInterval, times);

                tween(this.rightHand)
                    .by(0.5, { eulerAngles: v3(0, 0, 10) })
                    .call(() => {
                        tween(this.rightHand)
                            .by(0.3, { eulerAngles: v3(0, 0, -90) })
                            .start();
                    })
                    .start();
                //施法手回证
                this.scheduleOnce(() => {
                    tween(this.rightHand)
                        .to(0.3, { eulerAngles: v3(0, 0, -25) })
                        .call(() => {
                            this.iceEffect.active = false;
                        })
                        .start();
                }, 0.9);

                this.scheduleOnce(() => {
                    this.chasePlayer = true;
                    this.isSkilling = false;
                }, this.iceBallTime * 3);

                break;
        }
    }

    //召唤雪人技能持续时间
    snowManTime: number = 2;
    //召唤雪人生成间隔
    snowManInterval: number = 0.4;
    snowManPos: UITransform = null;
    //召唤小雪人
    CreatSnowMan() {
        if (!this.leftHand) {
            this.leftHand = this.handProp.getChildByName("leftHand");
            this.rightHand = this.handProp.getChildByName("rightHand");
        }

        if (this.isSkilling) {
            return;
        }

        if (!this.snowManPos) {
            this.snowManPos = this.Model.getChildByName("雪人召唤点").getComponent(UITransform);
        }

        this.isSkilling = true;
        this.chasePlayer = false;

        //左手施法特效
        this.iceEffect = this.leftHand.getChildByName("冰球特效");
        this.iceParticle = this.iceEffect.getComponent(ParticleSystem2D);
        this.iceParticle.resetSystem();
        //右手施法特效
        this.iceEffect = this.rightHand.getChildByName("冰球特效");
        this.iceParticle = this.iceEffect.getComponent(ParticleSystem2D);
        this.iceParticle.resetSystem();

        this.schedule(this.creatSnowMan, this.snowManInterval, this.snowManTime);

        this.scheduleOnce(() => {
            this.isSkilling = false;
            this.chasePlayer = true;
        }, this.snowManTime * 2);
    }

    //创建雪球
    creatSnowBall() {
        let leftPos = this.leftHand.getChildByName("pos").worldPosition.clone();
        let rightPos = this.rightHand.getChildByName("pos").worldPosition.clone();

        let leftDir = leftPos.clone().subtract(this.leftHand.worldPosition.clone()).normalize();
        let rightDir = rightPos.clone().subtract(this.rightHand.worldPosition.clone()).normalize();

        //左手雪球
        let snowBall1 = instantiate(this.SnowBallPrefab);
        snowBall1.parent = HJMSJ_GameMgr.instance.mapNode.children[0];
        snowBall1.worldPosition = leftPos;
        snowBall1.getComponent(HJMSJ_SnowBall).init(leftDir);

        //右手雪球
        let snowBall2 = instantiate(this.SnowBallPrefab);
        snowBall2.parent = HJMSJ_GameMgr.instance.mapNode.children[0];
        snowBall2.worldPosition = rightPos;
        snowBall2.getComponent(HJMSJ_SnowBall).init(rightDir);

    }

    iceBallTime: number = 1;
    iceBallInterval: number = 0.1;
    iceBallNum: number = 10;
    //创建冰球
    creatIceBall() {
        let iceBallNode = this.Model.getChildByName("冰球制造点");
        let IceBallPos = iceBallNode.worldPosition.clone().add(v3(0, 90, 0));
        let iceBallRange = iceBallNode.getComponent(UITransform).width;
        let iceBallInterval = iceBallRange / this.iceBallNum * this.forwardDir;

        for (let i = 0; i < this.iceBallNum; i++) {
            let iceBall = instantiate(this.IceBallPrefab);
            iceBall.parent = HJMSJ_GameMgr.instance.mapNode.children[0];
            //冰球间隔
            iceBall.worldPosition = IceBallPos.clone().add(v3(iceBallInterval * i, 0, 0));
            //冰球初始化
            let iceBallTs = iceBall.getComponent(HJMSJ_IceBall);
            iceBallTs.init(v3(0, -1, 0));
        }
    }

    creatSnowMan() {
        let snowMan = instantiate(this.SnowManPrefab);
        snowMan.parent = HJMSJ_GameMgr.instance.mapNode.children[0];

        let random = math.randomRange(-1, 1) * (this.snowManPos.width / 2);
        snowMan.worldPosition = this.snowManPos.node.worldPosition.clone().add(v3(random, random, 0));

    }

    override onMove(Dir: math.Vec3): void {
        this._dir = v3(Dir.x, Dir.y, 0);

        // console.log(this._dir.y);
        if (this._dir.x < 0 && this.Model.eulerAngles.y === 180) {
            tween(this.Model)
                .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
                .call(() => {
                    this.forwardDir = 1;
                })
                .start();

            // tween(this.handProp)
            //     .to(0.2, { eulerAngles: v3(0, 0, 0) }, { easing: "backInOut" })
            //     .call(() => {
            //         // this.handProp.position = v3(-100, -60, 0);
            //         // this.handRoot.getComponent(HJMSJ_ATKBox).Show();
            //         // this.forwardDir = 1;
            //         // this.handPos = this.node.worldPosition;

            //         // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));
            //     })
            //     .start();
        }

        if (this._dir.x > 0 && this.Model.eulerAngles.y === 0) {
            tween(this.Model)
                .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
                .call(() => {
                    this.forwardDir = -1;
                })
                .start();

            // tween(this.handProp)
            //     .to(0.2, { eulerAngles: v3(0, 180, 0) }, { easing: "backInOut" })
            //     .call(() => {
            //         // this.handProp.position = v3(100, -60, 0);
            //         // this.handRoot.getComponent(HJMSJ_ATKBox).Show();
            //         this.forwardDir = -1;
            //         // this.handPos = this.node.worldPosition;

            //         // this.handPos = this.node.worldPosition.clone().add(v3(-120 * this.forwardDir, 0, 0));

            //     })
            //     .start();

        }
    }

    override onExitContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    override shake(): void {

    }
}


