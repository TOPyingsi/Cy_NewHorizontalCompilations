import { _decorator, Animation, Collider2D, Component, log, Node, RigidBody2D, v2, v3, Vec2 } from 'cc';
import { XSHY_Constant } from './XSHY_Constant';
import { XSHY_AttackBox } from './XSHY_AttackBox';
const { ccclass, property } = _decorator;

@ccclass('XSHY_Unit')
export class XSHY_Unit extends Component {
    public Speed: number = 0;//移动速度
    public Attack: number = 0;//攻击
    public MaxHp: number = 0;//最大血量
    public Hp: number = 0;//当前血量
    public State: number = 0;//0待机1移动2攻击或技能态3受击态
    public Invincible: boolean = false;//是否无敌态(半透明无法被伤害)
    public exposing: boolean = false;//是否霸体
    public orientation: boolean = false;//朝向，true为左flase为右


    private _sprite: Node = null;//图片
    private _attackBox: Node = null;//伤害碰撞父节点
    private _rg: RigidBody2D = null;//刚体
    private _Ani: Animation = null;//动画

    private startScaleX: number = 1;//默认X缩放

    public NormalAttackNum: number = 2;//角色的普攻段数
    public CurrentNormalAttackNum: number = 0;//角色普攻当前所在的段数
    private NormalAttackTime: number = 0;//普攻结束后衔接的剩余时间
    private NormalAttackMaxTime: number = 0.2;//普攻结束后衔接的剩余时间的最大值，默认是0.2

    private _beatbackTime: number = 0;//受到攻击的僵直时间
    private _beatbackMaxTime: number = 0.4;//受到攻击的僵直默认时间
    public _beatbackNumber: number = 0;//连续受击次数,2次浮空，20次进入霸体
    public _beatbackPos: Vec2 = v2(0, 0);//第一次受击的位置
    public _beatbackHeight: number = 0;//受击高度


    public SkillAttakScale: { Name: string, Scale: number }[] = [

    ]
    start() {
        this._sprite = this.node.getChildByName("图");
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
        this.Attack = data.Attack;
        this.MaxHp = data.HP;
        this.Hp = data.HP;
    }

    protected update(dt: number): void {
        //判断普通攻击连续的间隔
        if (this.State != 2) {
            this.NormalAttackTime -= dt;
            if (this.NormalAttackTime < 0) {
                this.NormalAttackTime = 0;
                this.CurrentNormalAttackNum = 0;
            }
        }
        //判断受击浮空
        if (this.State == 3) {
            this._beatbackTime -= dt;
            if (this._beatbackTime <= 0 && this._beatbackHeight <= 0) {
                this.State = 1;
            }
        }

        this.PlayAni();
    }
    Move(direction: Vec2) {
        if (this.State == 2 || this.State == 3) return;//受击或者攻击态返回
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


    private aniName: string = "待机";
    //设定当前播放的动画名
    SetAniName() {
        if (this.State == 0) {
            this.aniName = "待机";
        }
        if (this.State == 1) {
            this.aniName = "移动";
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
        if (this.State == 2 || this.State == 3) return;//受击或者攻击态返回
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


    //动画帧事件
    AniEmit(Emit: string) {
        switch (Emit) {
            case "普攻结束":
                this.NormalAttackEnd();
                break;
            case "普0":
                this.AttackCollisionLook("普0");
                break;
            case "普1":
                this.AttackCollisionLook("普1");
                break;
        }

    }



    //根据名字伤害碰撞显示
    AttackCollisionLook(name: string) {
        let collider = this.node.getChildByPath("伤害碰撞/" + name);
        collider.getComponent(XSHY_AttackBox).Attack = this.Attack * this.GetSkillScale(name);
        collider.getComponent(XSHY_AttackBox).Attacknode = this.node;
        collider.getComponent(XSHY_AttackBox).Show();

    }

    //受到伤害
    Hurt(attack: number) {
        console.log("被打中了！！造成伤害:" + attack);
        this.Hp -= attack;
        if (this.Hp <= 0) {
            this.die();
        }
    }

    //死亡
    die() {
        this.node.destroy();

    }

    //根据技能名字获得伤害倍率
    GetSkillScale(Name: string) {
        return this.SkillAttakScale.find((data) => { return data.Name == Name }).Scale;
    }
}


