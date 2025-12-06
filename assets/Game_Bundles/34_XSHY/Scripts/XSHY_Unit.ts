import { _decorator, Animation, Collider2D, Color, color, Component, director, instantiate, log, Node, Prefab, RigidBody2D, Sprite, tween, UIOpacity, v2, v3, Vec2, Vec3 } from 'cc';
import { XSHY_Constant } from './XSHY_Constant';
import { XSHY_AttackBox } from './XSHY_AttackBox';
import { XSHY_GameManager } from './XSHY_GameManager';
import { XSHY_Bullet } from './XSHY_Bullet';
import TreasureBoxPanel from '../../../Scripts/UI/Panel/TreasureBoxPanel';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_AIControl } from './XSHY_AIControl';
import { XSHY_PlayerControl } from './XSHY_PlayerControl';
import { XSHY_incident } from './XSHY_incident';
import { XSHY_TongLing } from './XSHY_TongLing';
const { ccclass, property } = _decorator;

@ccclass('XSHY_Unit')
export class XSHY_Unit extends Component {
    @property({ type: [Prefab] })
    bullet: Prefab[] = [];//子弹预制体
    public Speed: number = 0;//移动速度
    public Attack: number = 0;//攻击
    public MaxHp: number = 0;//最大血量
    public Hp: number = 0;//当前血量
    public MaxMp: number = 100;//最大法力值
    public Mp: number = 100;//当前法力值
    public SkillCount: number = 4;//技能点数

    public State: number = 0;//0待机1移动2攻击或技能态3受击态4倒地态
    public Invincible: boolean = false;//是否无敌态(半透明无法被伤害)
    public orientation: boolean = false;//朝向，true为左flase为右


    private _sprite: Node = null;//图片
    private _spriteInitPos: Vec3 = v3(0, 0, 0);
    private _attackBox: Node = null;//伤害碰撞父节点
    private _rg: RigidBody2D = null;//刚体
    private _Ani: Animation = null;//动画

    private startScaleX: number = 1;//默认X缩放

    public NormalAttackNum: number = 2;//角色的普攻段数
    public CurrentNormalAttackNum: number = 0;//角色普攻当前所在的段数
    private NormalAttackTime: number = 0;//普攻结束后衔接的剩余时间
    private NormalAttackMaxTime: number = 0.2;//普攻结束后衔接的剩余时间的最大值，默认是0.2

    private _hitStunTime: number = 0; // 受击僵直时间
    private _invincibleTime: number = 0; // 无敌时间
    private readonly _defaultHitStun: number = 0.4; // 默认受击僵直时间
    private readonly _defaultInvincibleTime: number = 0.5; // 默认无敌时间
    private readonly _invincibleThreshold: number = 20; // 进入无敌的连击次数
    private _isSaveSeat: boolean = false;
    private _SaveSeatTime: number = 0;//霸体剩余时间

    private _comboCount: number = 0; // 受到连击次数
    private _isAirborne: boolean = false; // 是否在空中
    private _airborneHeight: number = 0; // 当前浮空高度
    private _defaultairborneHeight: number = 40; // 默认浮空高度(第一次浮空的时候高度)
    private _MaxairborneHeight: number = 400; // 浮空最高高度
    private readonly _floatHeightPerHit: number = 24; // 每次受击增加的高度
    private readonly _gravity: number = 750; // 重力值

    private IsDie: boolean = false;//是否已经死亡
    private HpScale: number = 1;//血量倍率
    private AttackScale: number = 1;//攻击倍率
    public SkillAttakScale: { Name: string, Scale: number }[] = [

    ]


    public infiniteHP: boolean = false;//无限血
    public infiniteMP: boolean = false;//无限蓝
    public infiniteSkillCount: boolean = false;//无限豆子
    start() {
        this._sprite = this.node.getChildByName("图");
        this._spriteInitPos = this._sprite.position.clone();
        this._attackBox = this.node.getChildByName("伤害碰撞");
        this._rg = this.getComponent(RigidBody2D);
        this._Ani = this.node.getChildByName("图").getComponent(Animation);
        this.startScaleX = this._sprite.scale.x;
        this.LoadUnitData();

    }
    //读取角色数据
    LoadUnitData() {
        let data = XSHY_Constant.GetUnitDataByName(this.node.name);
        this.Speed = data.Speed;
        this.Attack = data.Attack * this.AttackScale;
        this.MaxHp = data.HP * this.HpScale;
        this.Hp = data.HP * this.HpScale;
    }

    // 在 update 方法中添加处理逻辑
    protected update(dt: number): void {
        //回蓝
        if (this.Mp < 100) {
            this.Mp += 3 * dt;
            if (this.infiniteMP) {
                this.Mp = 100;
            }
        } else {
            this.Mp = 100;
        }

        // 处理无敌时间
        if (this.Invincible) {
            this._invincibleTime -= dt;
            if (this._invincibleTime <= 0) {
                this._sprite.getComponent(UIOpacity).opacity = 255;
                this.Invincible = false;
            }
        }
        // 处理霸体时间
        if (this._isSaveSeat && this.State != 2) {
            this._SaveSeatTime -= dt;
            if (this._SaveSeatTime <= 0) {
                this._isSaveSeat = false;
            }
        }

        // 处理受击僵直
        if (this.State == 3) {
            this._hitStunTime -= dt;
            if (this._hitStunTime <= 0 && !this._isAirborne) {
                this.State = 0; // 恢复到待机状态
            }
        }

        // 处理浮空效果
        if (this._isAirborne) {
            this.handleAirborne(dt);
        }

        // 判断普通攻击连续的间隔
        if (this.State != 2) {
            this.NormalAttackTime -= dt;
            if (this.NormalAttackTime < 0) {
                this.NormalAttackTime = 0;
                this.CurrentNormalAttackNum = 0;
            }
        }

        this.PlayAni();
    }
    Move(direction: Vec2) {
        if (this.State == 2 || this.State == 3 || this.State == 4) return;//受击或者攻击态返回
        if (direction.x < 0) {
            this.Setorientation(true);
        } else {
            this.Setorientation(false);
        }
        const force = direction.multiplyScalar(this.Speed);
        this._rg.linearVelocity = force;
        this.State = 1;

    }

    StopMove() {
        this._rg.linearVelocity = Vec2.ZERO;
        if (this.State == 1) {
            this.State = 0;
        }

    }

    //设定人物朝向
    Setorientation(_orientation: boolean) {
        if (this.orientation == _orientation) return;
        this.orientation = _orientation;
        if (this.orientation) {
            this._sprite.scale = v3(-this.startScaleX, this._sprite.scale.y, this._sprite.scale.z);
            this._attackBox.scale = v3(-1, 1, 1)
        } else {
            this._sprite.scale = v3(this.startScaleX, this._sprite.scale.y, this._sprite.scale.z);
            this._attackBox.scale = v3(1, 1, 1)
        }
    }
    //转向
    TurnTo() {
        this.Setorientation(!this.orientation);
    }

    private aniName: string = "待机";
    //设定当前播放的动画名
    SetAniName() {
        if (this.State == 3) {
            if (this._comboCount >= 2) {
                this.aniName = "浮空";
            } else {
                this.aniName = "受击";
            }
            return;
        }
        if (this.State == 0) {
            this.aniName = "待机";
        }
        if (this.State == 1) {
            this.aniName = "移动";
        }
        if (this.State == 4) {
            this.aniName = "倒地";
        }
    }
    //播放动画
    PlayAni() {
        this.SetAniName();
        if (!this._Ani.getState(this.aniName).isPlaying) {
            this._Ani.play(this.aniName)
        }
    }


    //攻击按下
    AttackClick(): void {
        if (this.State == 2 || this.State == 3 || this.State == 4) return;//受击或者攻击态返回
        console.log("执行攻击按下");
        this.StopMove();
        this.ReleaseNormalAttack(this.CurrentNormalAttackNum);
        this.State = 2;
    }

    //释放第N段普攻
    ReleaseNormalAttack(num: number): void {
        console.log("播放普" + num + "动画");
        this.aniName = "普" + num;
    }
    //普攻结束事件
    NormalAttackEnd(): void {
        console.log("普攻结束事件");
        this.State = 0;
        this.NormalAttackTime = this.NormalAttackMaxTime;
        this.CurrentNormalAttackNum++;
        if (this.CurrentNormalAttackNum >= this.NormalAttackNum) {
            this.CurrentNormalAttackNum = 0;
        }
    }

    //技能按下
    SkillClick(num: number): void {
        if (this.State == 2 || this.State == 3 || this.State == 4) return;//受击或者攻击态返回
        console.log(`执行${num}技能按下`);
        if (this.Mp < num * 20) {
            return;
        }
        this.Mp -= num * 20;//MP消耗
        director.getScene().emit(XSHY_EasyControllerEvent.释放技能);
        this._isSaveSeat = true;
        this.State = 2;
        this.aniName = "技能" + num;
        this.StopMove();
    }

    //释放通灵
    TongLing(num: number) {
        if (this.State == 2 || this.State == 3 || this.State == 4) return;//受击或者攻击态返回
        console.log(`执行${num}通灵按下`);
        if (this.SkillCount <= 0) {
            return;
        }
        this.SkillCount--;
        if (this.infiniteSkillCount) this.SkillCount++;//无限豆子恢复
        director.getScene().emit(XSHY_EasyControllerEvent.消耗技能豆);
        XSHY_incident.Loadprefab("PreFab/通灵/" + num).then((pre: Prefab) => {
            let TL = instantiate(pre);
            TL.setParent(XSHY_GameManager.Instance.BG);
            TL.setWorldPosition(this.node.worldPosition.clone());
            TL.getComponent(XSHY_TongLing).Init(this.node, this.Attack, !this.orientation);
        });
    }


    //动画帧事件
    AniEmit(Emit: string) {
        switch (Emit) {
            case "普攻结束":
                this.NormalAttackEnd();
                break;
            case "普0":
            case "普1":
            case "普2":
            case "普3":
            case "普4":
                this.AttackCollisionLook(Emit);
                break;


        }
        if (Emit == "技能结束") {
            this._isSaveSeat = false;
            this.State = 0;
        } else if (Emit.charAt(0) == "技") {
            this.AttackCollisionLook(Emit);
        }
    }

    // 在类的其他私有变量声明处添加以下变量
    private _airborneVelocity: number = 0; // 当前下落速度
    private _airborneTimer: number = 0;    // 下落时间计时器
    // 处理浮空效果
    private handleAirborne(dt: number) {
        // 使用简化的物理模拟实现抛物线运动
        // _airborneVelocity 表示当前垂直速度，向上为正，向下为负
        // 重力持续作用于速度，产生自然的抛物线效果

        // 应用重力影响速度 (每帧减少速度，模拟重力向下拉的效果)
        this._airborneVelocity -= this._gravity * dt;

        // 根据当前速度更新高度
        this._airborneHeight += this._airborneVelocity * dt;

        // 更新角色Y坐标
        const currentPosition = this._sprite.position;
        this._sprite.setPosition(currentPosition.x, this._spriteInitPos.y + this._airborneHeight, currentPosition.z);

        // 如果高度回到地面，则结束浮空
        if (this._airborneHeight <= 0) {
            this._airborneHeight = 0;
            this._isAirborne = false;
            this._airborneVelocity = 0;

            // 变为倒地状态
            this.State = 4;
            this.AddBuff("无敌", 1.5);
            this.scheduleOnce(() => {
                if (this.IsDie) return;//死亡就不会再起来了
                this.State = 0;//倒地起立
            }, 0.7)

            // 重置连击次数
            this._comboCount = 0;
        }
    }
    //根据名字伤害碰撞显示
    AttackCollisionLook(name: string) {
        let collider = this.node.getChildByPath("伤害碰撞/" + name);
        collider.getComponent(XSHY_AttackBox).Attack = this.Attack * this.GetSkillScale(name);
        collider.getComponent(XSHY_AttackBox).Attacknode = this.node;
        collider.getComponent(XSHY_AttackBox).Show();

    }


    // 受击方法修改（返回布尔，判断是否打中）
    Hurt(attack: number): boolean {
        // 检查是否无敌
        if (this.Invincible) return false;
        this.StopMove();
        if (this.infiniteHP) {
            attack = 0;//无限血，受伤为0
        }
        this.Hp -= attack;
        this.Mp += 3;
        director.getScene().emit(XSHY_EasyControllerEvent.BeatBack, this.node, attack);
        if (!this._isSaveSeat) { //霸体
            // 增加连击次数
            this._comboCount++;
            // 处理受击效果
            this.handleHitEffect();
        }

        XSHY_incident.Loadprefab("PreFab/击中特效").then((pre: Prefab) => {
            let tx = instantiate(pre);
            tx.setParent(this.node.getChildByName("图"));
            tx.position = v3(0, 50, 0);
            this.scheduleOnce(() => {
                tx.destroy();
            }, 0.4)
        })

        if (this.Hp <= 0) {
            this.die();
        }

        return true;
    }
    // 处理受击效果
    private handleHitEffect() {
        // 设置受击状态
        this.State = 3; // 受击状态
        this._hitStunTime = this._defaultHitStun;

        // 播放受击动画
        this.aniName = "受击";
        director.getScene().emit(XSHY_EasyControllerEvent.受击, this._comboCount);
        // 判断是否浮空
        if (this._comboCount >= 4) {
            this._isAirborne = true;

            // 如果已经在空中，则在当前高度基础上增加
            // 如果在地面，则设置初始高度
            if (this._airborneHeight <= 0) {
                // 从地面起飞，使用基础高度
                let Height = this._defaultairborneHeight + this._floatHeightPerHit * this._comboCount;
                if (Height > this._MaxairborneHeight) Height = this._MaxairborneHeight;
                this._airborneHeight = Height;
            } else {
                // 已经在空中，只需增加一定高度
                this._airborneHeight += this._floatHeightPerHit;
                // 限制最大高度
                if (this._airborneHeight > this._MaxairborneHeight) {
                    this._airborneHeight = this._MaxairborneHeight;
                }
            }
        }

        this._airborneVelocity = 100; //重置下坠抛物线速度
        // 判断是否进入霸体
        if (this._comboCount >= this._invincibleThreshold) {
            this.AddBuff("无敌", 1.5);
        }
    }


    //死亡
    die() {
        this.AddBuff("无敌", 5);
        this.IsDie = true;
        // 设置为空中状态，触发浮空效果
        this._isAirborne = true;
        this._airborneHeight = this._defaultairborneHeight;
        this._airborneVelocity = 150; // 给一个向上的初始速度

        // 设置状态为受击状态，播放浮空动画
        this.State = 3;
        this.aniName = "浮空";

        if (this.node.getComponent(XSHY_AIControl)) this.node.getComponent(XSHY_AIControl).enabled = false;
        if (this.node.getComponent(XSHY_PlayerControl)) this.node.getComponent(XSHY_PlayerControl).enabled = false;
        this.StopMove();
        // 1秒后销毁节点
        this.scheduleOnce(() => {
            director.getScene().emit(XSHY_EasyControllerEvent.角色死亡, this.node.getComponent(XSHY_AIControl) ? true : false);
            this.node.active = false;
        }, 3.0);
    }

    //根据技能名字获得伤害倍率
    GetSkillScale(Name: string) {
        return this.SkillAttakScale.find((data) => { return data.Name == Name }).Scale;
    }


    //生成子弹
    GenerateBullet(id: number, pos: Vec3, attack: number) {
        let nd = instantiate(this.bullet[id]);
        nd.active = false;
        nd.setParent(XSHY_GameManager.Instance.BG);
        nd.setWorldPosition(this.node.getWorldPosition().clone().add(pos));
        nd.active = true;
        nd.getComponent(XSHY_Bullet).Init(this.node, attack, !this.orientation);
    }
    //角色位移
    MovePos(pos: Vec2, Time: number = 0.1) {
        if (this.orientation) { pos.x = -pos.x; }
        pos = v2(this.node.position.x + pos.x, this.node.position.y + pos.y);

        if (pos.y > XSHY_GameManager.Instance.MapData.x) pos.y = XSHY_GameManager.Instance.MapData.x;
        if (pos.y < XSHY_GameManager.Instance.MapData.y) pos.y = XSHY_GameManager.Instance.MapData.y;
        if (pos.x < XSHY_GameManager.Instance.MapData.z) pos.x = XSHY_GameManager.Instance.MapData.z;
        if (pos.x > XSHY_GameManager.Instance.MapData.w) pos.x = XSHY_GameManager.Instance.MapData.w;

        tween(this.node)
            .to(Time, { position: v3(pos.x, pos.y, 0) })
            .start();
    }

    //添加buff，持续时间类型会在原有基础上延长
    AddBuff(buffName: string, BuffTime: number) {
        switch (buffName) {
            case "无敌":
                this.Invincible = true;
                this._invincibleTime += BuffTime;
                this._sprite.getComponent(UIOpacity).opacity = 120;
                break;
            case "无限血":
                this.infiniteHP = true;
                break;
            case "无限蓝":
                this.infiniteMP = true;
                break;
            case "无限豆子":
                this.infiniteSkillCount = true;
                break;
            case "血量倍率":
                this.HpScale = BuffTime;
                break;
            case "攻击倍率":
                this.AttackScale = BuffTime;
                break;
            default:
                break;
        }

    }
}


