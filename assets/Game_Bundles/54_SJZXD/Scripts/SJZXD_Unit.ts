import { _decorator, Color, Component, director, instantiate, Node, Prefab, sp, Sprite, tween, v3, Vec3 } from 'cc';
import { SJZXD_GameManager } from './SJZXD_GameManager';
import { SJZXD_Constant, SJZXD_WeaponItem } from './SJZXD_Constant';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_I_weapon } from './InterFace/SJZXD_I_weapon';
import { SJZXD_AudioManager } from './SJZXD_AudioManager';
import { SJZXD_EventManager } from './SJZXD_EventManager';
import { SJZXD_PoolManager } from './SJZXD_PoolManager';
import { SJZXD_DamageTip } from './SJZXD_DamageTip';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Unit')
export class SJZXD_Unit extends Component {
    public MaxHp: number = 500;
    public Hp: number = 500;
    public moveSpeed: number = 300;//移动速度
    public AttackSpeed: number = 1;//攻速倍率
    public Attack: number = 80;//攻击
    public Defensive: number = 0;//防御


    public Camp: number = 0;//阵营(0我方1敌方)
    public UnitState: number = 0;//（0待机1移动2滑铲3死亡）
    public EnemyArray: SJZXD_Unit[] = [];
    public LockEnemy: SJZXD_Unit = null;
    public LockEnemyState: boolean = false;//是否正在索敌
    public GunAngle: number = 0;//非锁敌情况下的角度
    public orientation: boolean = false;//朝向true为左false为右

    public WeaponData: SJZXD_WeaponItem = null;
    public WeaponNode: Node = null;
    public Weapon: SJZXD_I_weapon = null;
    public WeaponAnimationNode: Node = null;
    private BuffList: { Name: string, value: number, Time: number, Key: number }[] = [];
    private IsGunAttack: boolean = false;//是否使用枪械攻击中

    public IsBlock: boolean = false;//是否有阻塞事件(比如治疗)

    public FindModle: number = 0;//0为自动索敌1为手动索敌
    private AnimationNode: Node = null;//动画节点

    public DieIsDes: boolean = true;//死亡是否销毁
    protected update(dt: number): void {
        this.BuffList.forEach(element => {//buff计时
            element.Time -= dt;
            if (element.Time <= 0) {
                this.RemoveBuff(element.Key);
                this.BuffList.splice(this.BuffList.indexOf(element), 1);
            }
        });
        if (this.IsGunAttack) this.FollowWeapon();//攻击中人物随着枪转向
        if (this.FindModle == 0) {
            if (this.LockEnemy && this.LockEnemy.node?.isValid && this.LockEnemy.Hp > 0 && this.IsGunAttack && this.WeaponData.武器类型 == "远程") {
                //武器索敌(旋转到敌人)
                this.LockEnemyState = true;
                this.WeaponNode.getComponent(SJZXD_I_weapon).SetWeaponRotation(this.LockEnemy.node.worldPosition);
            } else {
                this.LockEnemyState = false;
            }
        } else {
            //通过角度控制
            this.WeaponNode.getComponent(SJZXD_I_weapon).SetWeaponRotationToAngle(this.GunAngle);
        }


    }

    protected start(): void {
        this.AnimationNode = this.node.getChildByName("动画");
        SJZXD_GameManager.Instance.UnitArray.push(this);
        this.scheduleOnce(() => {//一秒后开始筛选敌人(用于自动索敌)
            this.FindEnemy();
        }, 1)
        this.schedule(() => {
            this.second_incident();
        }, 1)
        director.getScene().on(SJZXD_EventManager.单位死亡, (nd: Node) => {
            if (nd == this.LockEnemy?.node) {//如果索敌单位死亡，重新索敌
                this.LockEnemy = null;
                this.LockEnemyState = false;
            }
        });
    }
    //秒事件
    second_incident() {
        if (this.EnemyArray.length > 0) {
            this.FindLockEnemy();
        }
    }
    //锁定敌人
    public FindLockEnemy() {
        if (this.EnemyArray.length === 0) {
            this.LockEnemy = null;
            return;
        }
        // 找到距离最近的敌人
        let closestEnemy: SJZXD_Unit = null;
        let minDistance = Infinity;
        for (let i = 0; i < this.EnemyArray.length; i++) {
            const enemy = this.EnemyArray[i];

            // 检查敌人是否仍然有效
            if (!enemy?.node?.isValid) {
                continue;
            }
            if (enemy.Hp <= 0) {//已经死亡不再锁定
                continue;
            }
            // 计算与当前敌人的距离
            const distance = this.node.worldPosition.clone().subtract(enemy.node.worldPosition).length();
            // 如果这个敌人更近，则更新最近敌人
            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        }
        // 如果最近的敌人距离超过1500，则不锁定任何敌人
        if (minDistance > 1500) {
            this.LockEnemy = null;
        } else {
            // 设置锁定的敌人为距离最近的敌人
            this.LockEnemy = closestEnemy;
        }
    }

    //筛选可攻击数组
    public FindEnemy() {
        this.EnemyArray = [];
        for (let i = 0; i < SJZXD_GameManager.Instance.UnitArray.length; i++) {
            if (SJZXD_GameManager.Instance.UnitArray[i].Camp != this.Camp) {
                this.EnemyArray.push(SJZXD_GameManager.Instance.UnitArray[i]);
            }
        }
    }

    //装备武器
    public EquipWeapon(Name: string) {
        this.WeaponData = SJZXD_Constant.getWeaponDataByName(Name);
        SJZXD_Incident.Loadprefab("Prefabs/武器/" + this.WeaponData.Name).then((prefab: Prefab) => {
            let wp = instantiate(prefab);
            wp.setParent(this.node.getChildByName("武器"));
            // wp.setPosition(v3(0, 0, 0));
            this.WeaponNode = wp;
            this.Weapon = wp.getComponent(SJZXD_I_weapon);
            this.WeaponAnimationNode = wp.getChildByName("动画");
            //设置武器伤害((攻击力+武器伤害)/10)
            this.Weapon.SetAttack((this.Attack + SJZXD_Constant.getPropDataByName(this.WeaponData.Name).property) / 3);
            this.Weapon.SetCamp(this.Camp);
        });
    }

    //武器开火
    FIRE_START(Havedirection: boolean, direction: Vec3 = v3(0, 0, 0)) {
        if (this.IsBlock) {
            this.FIRE_STOP();
            return;
        }
        if (this.WeaponData.武器类型 == "近战") {
            this.WeaponNode.getComponent(SJZXD_I_weapon).Attack();
        }
        if (this.WeaponData.武器类型 == "远程") {
            this.IsGunAttack = true;
            if (Havedirection) {
                let angleInRadians = Math.atan2(direction.y, direction.x);
                angleInRadians = angleInRadians * (180 / Math.PI);
                this.GunAngle = angleInRadians;
                this.WeaponNode.getComponent(SJZXD_I_weapon).Attack();
            } else {
                this.WeaponNode.getComponent(SJZXD_I_weapon).Attack();
            }
        }
    }
    //武器停火
    FIRE_STOP() {
        this.IsGunAttack = false;
        this.WeaponNode.getComponent(SJZXD_I_weapon).StopAttack();
    }

    //受到伤害
    public TakeDamage(Damage: number) {
        if (this.Hp <= 0) {
            return;
        }
        Damage *= (1 - this.Defensive / (this.Defensive + 100)) * 2;
        Damage = Math.floor(Damage);
        this.Hp -= Damage;
        let nd = SJZXD_PoolManager.Instance.Get("伤害显示图");
        nd.getComponent(SJZXD_DamageTip).Show(Damage, this.node.worldPosition);
        // console.log("受到伤害！！！");
        if (this.Hp <= 0) {
            SJZXD_AudioManager.globalAudioPlay("死亡音效");
            if (this.DieIsDes) {
                if (this.Camp != 0) {
                    SJZXD_GameManager.KillEnemy++;
                }
                director.getScene().emit(SJZXD_EventManager.单位死亡, this.node);
            }
        } else {
            SJZXD_AudioManager.globalAudioPlay("受击");
            this.HitFlash();//受击特效
        }
    }


    //#region Buff区
    private buffKey: number = 0;//buff的key
    //给角色添加BUFF(BUFF名字，数值，持续时间)
    AddBuff(Name: string, value: number, Time: number) {
        switch (Name) {
            case "增加移速":
                this.moveSpeed += value;
                break;
            case "防御力增加":
                this.Defensive += value;
                break;
        }
        this.BuffList.push({ Name: Name, value: value, Time: Time, Key: this.buffKey });
        this.buffKey++;
    }
    //卸载BUff
    RemoveBuff(Key: number) {
        let buff = null;
        for (let i = 0; i < this.BuffList.length; i++) {
            if (this.BuffList[i].Key == Key) {
                buff = this.BuffList[i];
                break;
            }
        }
        if (buff) {
            switch (buff.Name) {
                case "增加移速":
                    this.moveSpeed -= buff.value;
                    break;
                case "防御力增加":
                    this.Defensive -= buff.value;
                    break;
            }
        }
    }
    //#endregion

    //设置朝向
    SetOrientation(orientation: boolean) {
        if (this.orientation == orientation) return;
        if (this.IsGunAttack) {//枪械攻击中，永远和枪械保持同方向
            return;
        }
        // console.log("设置朝向");

        this.orientation = orientation;
        this.AnimationNode.scale = v3(orientation ? -1 : 1, 1, 1);
        if (this.WeaponNode) {
            this.WeaponNode.parent.scale = v3(orientation ? -0.4 : 0.4, 0.4, 1);
        }
        this.GunAngle = 180 - this.GunAngle;
    }
    //设置索敌模式
    public setFindModle(modle: number) {
        this.FindModle = modle;
    }


    //角色跟随武器
    public FollowWeapon() {
        // console.log("角色朝向追随武器");
        // 获取武器的角度
        let weaponAngle = this.WeaponAnimationNode.angle;
        let normalizedAngle = Math.abs(weaponAngle % 360);

        if (this.orientation) {
            normalizedAngle = 180 - normalizedAngle;
        }
        // console.log(normalizedAngle);
        if (normalizedAngle > 90 || normalizedAngle < -90) {
            // console.log("左");
            // 武器朝左，设置角色朝左
            if (!this.orientation) {
                this.orientation = true;
                this.AnimationNode.scale = v3(-1, 1, 1);
                this.WeaponNode.parent.scale = v3(-0.4, 0.4, 1);
            }
        } else {
            // console.log("右");
            // 武器朝右，设置角色朝右
            if (this.orientation) {
                this.orientation = false;
                this.AnimationNode.scale = v3(1, 1, 1);
                this.WeaponNode.parent.scale = v3(0.4, 0.4, 1);
            }
        }
    }

    //回血
    AddHP(num: number) {
        this.Hp += num;
        if (this.Hp > this.MaxHp) {
            this.Hp = this.MaxHp;
        }
    }

    //开始治疗
    public StartTreat(AddHP: number, Time: number) {
        this.IsBlock = true;
        let nd = this.node.getChildByName("治疗进度模块");
        if (nd) {
            nd.getChildByName("加载条").getComponent(Sprite).fillRange = 0;
            nd.active = true;
            tween(nd.getChildByName("加载条").getComponent(Sprite))
                .to(Time, { fillRange: 1 })
                .call(() => {
                    this.AddHP(this.MaxHp * AddHP / 100);
                    this.IsBlock = false;
                    nd.active = false;
                })
                .start();
        } else {
            this.scheduleOnce(() => {
                this.IsBlock = false;
                this.AddHP(this.MaxHp * AddHP / 100);
            }, Time)
        }
    }

    //受击泛红特效
    public HitFlash() {
        tween(this.node.getChildByPath("动画/主角").getComponent(sp.Skeleton))
            .to(0.1, { color: Color.RED })
            .to(0.1, { color: Color.WHITE })
            .start();
    }
}


