import { _decorator, Animation, BoxCollider, BoxCollider2D, CircleCollider2D, Collider, Collider2D, Component, Contact2DType, EventTouch, geometry, ICollisionEvent, IPhysics2DContact, ITriggerEvent, Label, math, Node, PhysicsRayResult, PhysicsSystem, Prefab, resources, RigidBody, RigidBody2D, SphereCollider, Tween, tween, UIOpacity, v2, v3, Vec2, Vec3 } from 'cc';

import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { MTRNX_UIManager } from './MTRNX_UIManager';
import { MTRNX_BloodBar_Mtr } from './UI/MTRNX_BloodBar_Mtr';
import { MTRNX_GameManager } from './MTRNX_GameManager';
import { MTRNX_Constant, MTRNX_GameMode, MTRNX_JKType } from './Data/MTRNX_Constant';
import { MTRNX_AudioManager } from './MTRNX_AudioManager';
import { MTRNX_PoolManager } from './Utils/MTRNX_PoolManager';
import { MTRNX_BloodLabel_Mtr } from './UI/MTRNX_BloodLabel_Mtr';
import { MTRNX_GameDate } from './MTRNX_GameDate';
import { MTRNX_EasyController, MTRNX_EasyControllerEvent } from './MTRNX_EasyController';
const { ccclass, property } = _decorator;
const { Ray } = geometry;
const outRay = new geometry.Ray();

@ccclass('MTRNX_Unit')
export class MTRNX_Unit extends Component {
    public Id: number = 0;//ID
    public IsEnemy: boolean = false;//是否为敌人
    public IsHitFly: boolean = false;//受击是否被击飞
    public IsFlyUnit: boolean = false;//是否为飞行单位
    public IsInTheAir: boolean = true;//是否浮空
    public IsTrapped: boolean = false;//是否被禁锢
    public attack: number = 15;//攻击力
    public Hp: number = 100;//当前生命值
    public maxHp: number = 100;//最大生命值
    public Mp: number = 100;//当前法力值
    public maxMp: number = 100;//最大法力值
    public AttackDistance: number = 100;//攻击距离(Px)  
    public State: number = null;//(0正常移动,1.攻击态,2.死亡状态)
    public forward = v2(1, 0);
    public TargetNodes: Node[] = [];//攻击对象
    public v2_line = v2();//单位线速度
    public speedBase: number = 3;//基础速度
    public speedScale: number = 1;//速度乘区
    private doubleHitNum: number = 0;//被连击次数

    public _rigibody2D: RigidBody2D = null;//刚体
    public _animation: Animation = null;//动画
    public IsSingleAtk: boolean = true;//是否为单体攻击
    public boxcollider: BoxCollider2D = null;//单位碰撞盒
    public circlecollider: CircleCollider2D = null;//攻击范围触发器
    public bloodBarScale: Vec3 = Vec3.ONE;//血条默认大小

    public StateTime: number[] = [0, 0];//（状态时间）0回血1回蓝
    public StateNum: number[] = [0, 0];//(状态数值)0回血1回蓝

    public IsMassacreUnit: boolean = false;//是否为杀戮主角，默认为否
    _direction: number = 0;//杀戮模式移动方向，0：停止移动，1：向右移动，-1：向左移动
    Btns = ["跳跃", "普通攻击", "技能一", "技能二", "技能三", "技能四"];

    canAttack = false;
    canShoot = false;
    canSkill = false;
    canSkill2 = false;
    canSkill3 = false;
    public SubMp(num: number): boolean {
        if (this.Mp < num) {
            MTRNX_UIManager.HopHint("能量不足，无法施放技能！")
            return false;
        } else {
            this.Mp -= num;
            this.node.getChildByName("BloodBar")?.getComponent(MTRNX_BloodBar_Mtr).SetBlueBar(this.Mp / this.maxMp);
            return true;
        }
    }

    public get SpeedScale(): number {
        return this.speedScale;
    }

    public set SpeedScale(v: number) {
        this.speedScale = v;
        this.v2_line.set(this.forward.clone().multiplyScalar(this.speedBase * this.speedScale));
    }

    start() {
        if (this.IsEnemy) {
            this.forward = v2(-1, 0);
        }
        this._rigibody2D = this.node.getComponent(RigidBody2D);
        this._animation = this.node.getComponent(Animation);
        this.v2_line.set(this.forward.clone().multiplyScalar(this.speedBase * this.speedScale));

        this.boxcollider = this.node.getComponent(BoxCollider2D);
        this.circlecollider = this.node.getComponent(CircleCollider2D);
        //攻击范围检测
        this.circlecollider.on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            if (otherCollider.node.getComponent(MTRNX_Unit) && this.IsEnemy != otherCollider.node.getComponent(MTRNX_Unit).IsEnemy
                && otherCollider.node.getComponent(MTRNX_Unit).State != 2 && this.TargetNodes.indexOf(otherCollider.node) == -1) {//检测单位是否为敌方且检测单位为非死亡状态
                this.TargetNodes.push(otherCollider.node);
                if (this.State == 0) this.State = 1;
            }
        })
        this.circlecollider.on(Contact2DType.END_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            if (otherCollider.node.getComponent(MTRNX_Unit) && this.IsEnemy != otherCollider.node.getComponent(MTRNX_Unit).IsEnemy && this.TargetNodes.indexOf(otherCollider.node) != -1) {
                this.TargetNodes.splice(this.TargetNodes.indexOf(otherCollider.node), 1);
            }
        })

        this.boxcollider.on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            if (this.State == 2) return;
            if (otherCollider.node.name == "黑色") {
                this.OnLand();
            }
            else {
                if (this.IsEnemy) {
                    //敌方单位进入我方单位基地
                    if (otherCollider.node.name == "我方单位") {
                        MTRNX_GameManager.Instance.RedHP -= Math.ceil((MTRNX_Constant.MTTypePointCost[this.Id] / 100));
                        this.scheduleOnce(() => { this.node.destroy(); });
                        MTRNX_GameManager.Instance.ShakeWhite();
                    }
                }
                else {
                    //我方单位进入敌方单位基地
                    if (otherCollider.node.name == "敌方单位") {
                        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless) {
                            MTRNX_GameManager.Instance.Score += Math.floor(MTRNX_Constant.JKTypePointCost[this.Id] / 5);
                        } else {
                            if (MTRNX_JKType[this.Id] == "激光监控人") {
                                MTRNX_GameManager.Instance.BlueHP -= 1;
                            } else {
                                MTRNX_GameManager.Instance.BlueHP -= Math.ceil((MTRNX_Constant.JKTypePointCost[this.Id] / 100));
                            }
                        }
                        this.scheduleOnce(() => { this.node.destroy(); });
                        MTRNX_GameManager.Instance.ShakeWhite();
                    }
                }
            }
        })
        BundleManager.GetBundle("2_MTRNX_Bundle").load("Prefabs/UI/BloodBar", Prefab, (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            let blood = MTRNX_PoolManager.Instance.GetNode(res, this.node);
            blood.getComponent(MTRNX_BloodBar_Mtr).Init(this.bloodBarScale);
        })

        if (this.IsFlyUnit) {
            this._rigibody2D.gravityScale = 0;
            this.OnLand();
        }
        tween(this.node)
            .delay(1)
            .call(() => {
                this.secondupdate();
            })
            .union()
            .repeatForever()
            .start();

    }

    /**实例化杀戮模式监听 */
    InitMassacreEvent() {
        if (this.IsMassacreUnit) {
            //杀戮模式操作监听
            MTRNX_EasyController.on(MTRNX_EasyControllerEvent.MOVEMENT, this.onMovement, this);
            MTRNX_EasyController.on(MTRNX_EasyControllerEvent.MOVEMENT_STOP, this.onMovementRelease, this);
            MTRNX_EasyController.on(MTRNX_EasyControllerEvent.JUMP, this.onJump, this);
            for (let i of this.Btns) {
                MTRNX_GameManager.Instance.UI.getChildByName(i).on(Node.EventType.TOUCH_END, this.ButtonClicked, this);
            }
        }
    }

    ButtonClicked(event: EventTouch) {
        if (this.ZunitState() == 0) {
            switch (event.target.name) {
                case "跳跃": this.onJump(); break;
                case "普通攻击":
                    {
                        this.canAttack = true;
                        this.node.setScale(Vec3.ONE);
                    }
                    break;
                case "技能一":
                    {
                        this.canShoot = this.SubMp(MTRNX_Constant.PlayerMpconsume[MTRNX_GameDate.Instance.CurrentSelect][2]);
                        this.node.setScale(Vec3.ONE);
                    }
                    break;
                case "技能二":
                    {
                        this.canSkill = this.SubMp(MTRNX_Constant.PlayerMpconsume[MTRNX_GameDate.Instance.CurrentSelect][3]);
                        this.node.setScale(Vec3.ONE);
                    }
                    break;
                case "技能三":
                    {
                        this.canSkill2 = this.SubMp(MTRNX_Constant.PlayerMpconsume[MTRNX_GameDate.Instance.CurrentSelect][4]);
                        this.node.setScale(Vec3.ONE);
                    }
                    break;
                case "技能四":
                    {
                        this.canSkill3 = this.SubMp(MTRNX_Constant.PlayerMpconsume[MTRNX_GameDate.Instance.CurrentSelect][5]);
                        this.node.setScale(Vec3.ONE);
                    }
                    break;
            }
            this.ReleaseSkill(event.target.name);
        }
    }

    /** 摇杆移动 */
    onMovement(degree: number, offset: number) {//offset范围0-1
        if (degree < 180) {
            //向左移动
            if (this._direction != -1) {
                if (this.ZunitState() == 0) {
                    this._direction = -1;
                    this.ChangeUnitScale();
                }
            }
        }
        else {
            //向右移动
            if (this._direction != 1) {
                if (this.ZunitState() == 0) {
                    this._direction = 1;
                    this.ChangeUnitScale();
                }
            }
        }
    }
    /** 摇杆释放 */
    onMovementRelease() {
        this._direction = 0;
        if (this.ZunitState() == 0) this._animation.play("idle");
    }

    ReleaseSkill(data: string) {

    }

    ZunitState(): number {
        return;
    }

    /** 跳跃 */
    onJump() {
        if (!this.IsInTheAir) {
            this.IsInTheAir = true;
            let force = 1200000;
            switch (MTRNX_GameManager.Instance.SelectUnit) {
                case "泰坦监控人": force = 1500000; break;
                case "泰坦音响人": force = 1200000; break;
                case "泰坦电视人": force = 800000; break;
                case "泰坦监控人2": force = 2500000; break;
                case "泰坦音响人2": force = 2000000; break;
                case "泰坦电视人2": force = 800000; break;
            }
            this._rigibody2D.applyForceToCenter(v2(0, force), true);
        }
    }

    update(deltaTime: number) {

        // geometry.Ray.fromPoints(outRay, this.node.worldPosition, this.node.worldPosition.clone().add(this.forward));
        // if (PhysicsSystem.instance.raycastClosest(outRay, 0xffffffff)) {
        //     let raycastClosestResult = PhysicsSystem.instance.raycastClosestResult;
        //     if (raycastClosestResult.distance < this.AttackDistance && raycastClosestResult.collider.node.getComponent(Unit).IsEnemy != this.IsEnemy
        //         && this.State == 0) { //如果对象范围小于我的攻击距离且对象阵营与我不同且我还在移动状态
        //         this.TargetNode = raycastClosestResult.collider.node;
        //         this.Attack();
        //         this.State = 1;
        //     }
        // }

        switch (this.State) {
            case 0://移动状态
                {
                    this.Move(deltaTime);
                }
                break;
            case 1://攻击状态
                {
                    this.Attack();
                }
                break;
        }

    }

    //单位落地
    OnLand() {
        if (this.IsInTheAir) {
            this.IsInTheAir = false;
            if (this.TargetNodes.length <= 0) {
                this.State = 0;//没有目标单位时前进
            }
            else {
                this.State = 1;//有目标单位则攻击他
            }
            this.doubleHitNum = 0;
        }
    }

    //移动
    Move(deltaTime: number) {
        if (this.State == 2 || this.IsTrapped) return;
        // //默认方案
        // if (this.IsEnemy == false) {
        //     this.node.setPosition(this.node.position.add(v3(this.Speed * deltaTime, 0, 0)))
        // } else {
        //     this.node.setPosition(this.node.position.add(v3(-this.Speed * deltaTime, 0, 0)))
        // }

        //线速度移动方案
        let lineY: number;
        try {
            lineY = this._rigibody2D.linearVelocity.y;
        } catch (error) {

        }
        if (this.IsTrapped) { return };
        this._rigibody2D.linearVelocity = v2(this.v2_line.x, lineY);
        //这里只是播放攻击动画
        if (!this._animation?.getState("move").isPlaying) {
            this.ChangeUnitScale();
            this._animation?.play("move");
        }
    }

    //根据目标所在位置改变朝向
    ChangeUnitScale() {
        if (this.State == 2) {
            return;
        }
        let scalex = this.node.scale.x;
        if (!this.IsMassacreUnit) {
            if (this.TargetNodes.length > 0) {//执行攻击动画时根据目标所在位置改变朝向
                if (this.IsEnemy) {
                    if (this.TargetNodes[0].worldPosition.x - this.node.worldPosition.x > 0) {
                        this.node.setScale(Vec3.ONE);
                    }
                    else {
                        this.node.setScale(-1, 1, 1);
                    }
                }
                else {
                    if (this.TargetNodes[0].worldPosition.x - this.node.worldPosition.x < 0) {
                        this.node.setScale(-1, 1, 1);
                    }
                    else {
                        this.node.setScale(Vec3.ONE);
                    }
                }
            }
            else {
                //执行移动动画前恢复朝向
                if (this.IsEnemy) {
                    this.node.setScale(-1, 1, 1);
                }
                else {
                    this.node.setScale(Vec3.ONE);
                }
            }
        }
        else {
            if (this._direction == 1) {
                this.node.setScale(Vec3.ONE);
            }
            if (this._direction == -1) {
                this.node.setScale(-1, 1, 1);
            }
        }
        this.node.getChildByName("BloodBar")?.getComponent(MTRNX_BloodBar_Mtr).ResetScale();//人物翻转的同时血条也需要翻转

        if (this.node.scale.x != scalex) this.ResetCollider();
    }

    ResetCollider() {
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre) return;
        for (let i of this.node.getComponents(BoxCollider2D)) {
            i.offset.x = -i.offset.x;
            i.enabled = false;
            i.enabled = true;
        }
    }

    //攻击
    Attack() {
        if (this.State == 2) return;
        //这里只是播放攻击动画
        if (!this._animation?.getState("attack").isPlaying) {
            this._animation?.play("attack");
            this._rigibody2D.linearVelocity = v2(0, this._rigibody2D.linearVelocity.y);
            this.ChangeUnitScale();
        }
    }
    //攻击帧事件
    Attackincident() {
        //重写这个方法实现攻击
        //近战
        // console.log("攻击")
        if (this.TargetNodes.length > 0) {
            if (this.IsSingleAtk) {
                this.TargetNodes[0].getComponent(MTRNX_Unit).Hurt(this.attack);
            }
            else {
                for (let i of this.TargetNodes) {
                    i.getComponent(MTRNX_Unit).Hurt(this.attack);
                }
            }
        }
        this.ChangeUnitScale();
    }

    //攻击结束，放在攻击动画的最后一帧
    AttackOver() {
        if (this.State == 2) return;
        if (this.TargetNodes.length <= 0) {
            this.State = 0;//没有目标单位时前进
        }
        else {
            this.State = 1;//有目标单位则继续攻击
        }
        this.ChangeUnitScale();
    }

    //受击
    Hurt(atk: number) {
        if (this.State == 2) return;
        this.Hp -= atk;
        this.node.getChildByName("BloodBar")?.getComponent(MTRNX_BloodBar_Mtr).SetBar(this.Hp / this.maxHp);
        try {
            this._rigibody2D.linearVelocity = v2(0, this._rigibody2D.linearVelocity.y);
        } catch (error) {
        }
        if (this.Hp <= 0) {
            this.Die();
        }
        if (this.IsHitFly && !this.IsTrapped) {
            this.IsInTheAir = true;
            this.doubleHitNum++;
            if (this.doubleHitNum <= 5) {
                this._rigibody2D.applyForceToCenter(v2(this.forward.clone().multiplyScalar(-300).x, 5000), true);
            }
        }
        MTRNX_AudioManager.AudioClipPlay("受击");

        BundleManager.GetBundle("2_MTRNX_Bundle").load("Prefabs/UI/BloodLabel", Prefab, (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            let bloodlabel: Node = MTRNX_PoolManager.Instance.GetNode(res, this.node);
            bloodlabel.getComponent(MTRNX_BloodLabel_Mtr).Init(atk);
        })
    }

    //被禁锢
    Trapped(trapTime: number) {
        if (!this.IsTrapped) this.IsTrapped = true;;
        Tween.stopAllByTarget(this.node);
        this._animation?.pause();
        try {
            this._rigibody2D.linearVelocity = v2(0, this._rigibody2D.linearVelocity.y);
        } catch (error) {
        }
        tween(this.node)
            .delay(trapTime)
            .call(() => {
                this.IsTrapped = false;
                this._animation?.resume();
            })
            .start()
    }



    //死亡
    Die() {
        this.State = 2;
        this.circlecollider.enabled = false;
        this.boxcollider.enabled = false;
        this.boxcollider.enabled = true;
        if (this.IsFlyUnit) this._rigibody2D.gravityScale = 1;
        MTRNX_PoolManager.Instance.PutNode(this.node.getChildByName("BloodBar"));
        //这里只是播放攻击动画
        if (!this._animation?.getState("dead").isPlaying) {
            this._animation?.play("dead");
        }
        if (this.IsEnemy) MTRNX_AudioManager.AudioClipPlay("马桶死亡");
    }
    //死亡帧事件
    Dieincident() {
        this.node.addComponent(UIOpacity);
        tween(this.node.getComponent(UIOpacity))
            .to(3, { opacity: 0 })
            .call(() => {
                this.node.destroy();
            })
            .start()

        //无尽模式加分
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless && this.IsEnemy == true) {
            MTRNX_GameManager.Instance.Score += Math.floor(MTRNX_Constant.MTTypePointCost[this.Id] / 5);
        }
        //杀戮模式加分
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre && this.IsEnemy == true) {
            MTRNX_GameManager.Instance.Score += Math.floor(MTRNX_Constant.MTTypePointCost[this.Id] / 5 * MTRNX_GameManager.Gamedifficulty);
        }
    }

    //秒事件
    secondupdate() {
        if (this.StateTime[0] > 0) {//回血
            this.Hp += this.StateNum[0];
            if (this.Hp > this.maxHp) {
                this.Hp = this.maxHp;
            }
            this.node.getChildByName("BloodBar")?.getComponent(MTRNX_BloodBar_Mtr).SetBar(this.Hp / this.maxHp);
        }

        if (this.StateTime[1] > 0) {//回蓝
            this.Mp += this.StateNum[1];
            if (this.Mp > this.maxMp) {
                this.Mp = this.maxMp;
            }
            this.node.getChildByPath("BloodBar")?.getComponent(MTRNX_BloodBar_Mtr).SetBlueBar(this.Mp / this.maxMp);
        }

        for (let i = 0; i < this.StateTime.length; i++) {
            if (this.StateTime[i] > 0) {
                this.StateTime[i]--;
            }
        }
    }

    //增益_自动回血（第一个参数是回血/秒，第二个参数是回血量）
    Buff_recover(Hpnum: number = 10, RecoverTime: number = 3) {
        this.StateNum[0] = Hpnum;
        this.StateTime[0] = RecoverTime;
    }

}


