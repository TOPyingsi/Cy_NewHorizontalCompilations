import { _decorator, BoxCollider2D, Collider2D, Color, Component, director, instantiate, Node, PhysicsRayResult, Prefab, RigidBody2D, sp, tween, UIOpacity, v3, Vec3 } from 'cc';
import { SJZXD_Unit } from '../SJZXD_Unit';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_Incident } from '../SJZXD_Incident';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Enemy_batman')
export class SJZXD_Enemy_batman extends Component {    //勤务兵（多点来回巡逻的小兵）
    @property({ displayName: "武器" })
    public weapon: string = "神·霓虹战斧";
    @property({ displayName: "阵营" })
    public Camp: number = 1;
    @property({ displayName: "移动速度" })
    public Speed: number = 100;
    @property({ displayName: "生命" })
    public MaxHP: number = 100;
    @property({ displayName: "攻击" })
    public Attack: number = 10;
    @property({ displayName: "防御" })
    public Defense: number = 10;
    private point: Vec3[] = [];//巡逻点
    @property({ displayName: "识别距离" })
    public EnemyDetectionRange: number = 600;//识别敌人的范围，敌人距离多远会开始检测
    @property({ displayName: "安全距离" })
    public SafetyRange: number = 900;//安全距离
    @property({ displayName: "掉落箱子" })
    public BoxPre: string = "敌人掉落箱子";//掉落箱子
    private UnitData: SJZXD_Unit = null;
    private UnitSkeleton: sp.Skeleton = null;

    // 巡逻相关属性
    private currentPatrolIndex: number = 0;      // 当前巡逻目标点索引
    private isPatrolling: boolean = true;        // 是否在巡逻
    private targetPosition: Vec3 = null;         // 当前目标位置
    private returnToPatrol: boolean = false;     // 是否需要返回巡逻
    private startPosition: Vec3 = null;          // 初始位置，用于返回巡逻时使用
    private returningToPatrolPath: boolean = false; // 是否正在返回巡逻路径
    start() {
        this.UnitData = this.node.getComponent(SJZXD_Unit);
        this.UnitData.Camp = this.Camp;
        this.UnitData.EquipWeapon(this.weapon);
        this.node.getChildByName("移动点位").children.forEach(child => {
            this.point.push(child.worldPosition.clone());
        });
        // 记录初始位置
        this.startPosition = this.node.worldPosition.clone();
        this.Init();
        this.Beging();
        director.getScene().on(SJZXD_EventManager.单位死亡, this.Die, this);
        this.UnitSkeleton = this.node.getChildByPath("动画/主角").getComponent(sp.Skeleton);
    }

    //死亡事件
    Die(nd: Node) {
        if (nd == this.node) {
            SJZXD_GameManager.Instance.UnitArray.splice(SJZXD_GameManager.Instance.UnitArray.indexOf(this.UnitData), 1);
            this.DropBox(this.node.worldPosition.clone());
            if (this.UnitData.Weapon) this.UnitData.Weapon.node.active = false;
            this.SetPlayerState(3);
            this.node.getComponent(RigidBody2D).enabled = false;
            this.node.getComponent(Collider2D).enabled = false;
            director.getScene().emit(SJZXD_EventManager.AI单位死亡, this.node);
        }
    }
    //设置状态
    SetPlayerState(state: number) {
        if (this.UnitData.UnitState == state) {
            return;
        }
        this.UnitData.UnitState = state;
        switch (this.UnitData.UnitState) {
            case 0: this.UnitSkeleton.setAnimation(0, "daiji", true); break;
            case 1: this.UnitSkeleton.setAnimation(0, "zoulu", true); break;
            case 3: this.UnitSkeleton.setAnimation(0, "siwang", false);
                this.UnitData.FIRE_STOP();
                this.scheduleOnce(() => {
                    tween(this.UnitSkeleton.node.getComponent(UIOpacity)).to(1, { opacity: 0 }).start();
                }, 1);
                this.scheduleOnce(() => {
                    this.node.destroy();
                }, 2)
                break;
        }
    }

    //死亡掉落箱子
    DropBox(pos: Vec3) {
        SJZXD_Incident.Loadprefab("Prefabs/容器/" + this.BoxPre).then((prefab: Prefab) => {
            let box = instantiate(prefab);
            box.setParent(SJZXD_GameManager.Instance.GameNode.getChildByPath(SJZXD_GameManager.GameScene + "/Map/对象层/容器"));
            box.setWorldPosition(pos.clone().add(v3(0, 1500, 0)));
            tween(box)
                .by(0.5, { position: v3(0, -1500, 0) })
                .to(0.15, { scale: v3(1.2, 1.2, 1.2) })
                .to(0.15, { scale: v3(1, 1, 1) })
                .start();
        })
    }

    //开始行动
    Beging() {
        if (this.UnitData.WeaponNode) {
            // 如果有巡逻点，则开始巡逻
            if (this.point && this.point.length > 0) {
                this.startPatrol();
            }
            // 每秒检查一次敌人
            this.schedule(this.checkForEnemies, 1);
        } else {
            this.scheduleOnce(() => {
                this.Beging();
            }, 2)
        }
    }
    //初始化赋数据
    Init() {
        this.UnitData.Hp = this.MaxHP;
        this.UnitData.MaxHp = this.MaxHP;
        this.UnitData.moveSpeed = this.Speed;
        this.UnitData.Attack = this.Attack;
        this.UnitData.Defensive = this.Defense;
    }

    // 开始巡逻
    startPatrol() { // 如果单位已死亡，则不执行巡逻
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        if (this.point.length === 0) return;

        this.isPatrolling = true;
        this.SetPlayerState(1); // 开始巡逻时设置为移动状态
        this.selectNextPatrolPoint();
    }
    // 选择下一个巡逻点
    selectNextPatrolPoint() {
        // 如果单位已死亡，则不执行巡逻点选择
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        if (this.point.length === 0) return;

        this.targetPosition = this.point[this.currentPatrolIndex];
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.point.length;
    }

    // 更新巡逻行为
    updatePatrol(dt: number) {
        if (!this.isPatrolling || !this.targetPosition) return;

        const currentPosition = this.node.worldPosition;
        const direction = this.targetPosition.clone().subtract(currentPosition);

        // 如果接近目标点
        if (direction.length() < 0.5) {
            // 如果正在返回巡逻路径，完成返回过程
            if (this.returningToPatrolPath) {
                this.returningToPatrolPath = false; // 结束返回巡逻路径状态
            }
            // 选择下一个巡逻点
            this.selectNextPatrolPoint();
        } else {
            // 移动到目标点
            direction.normalize();
            const moveDistance = this.UnitData.moveSpeed * dt;
            const newPosition = currentPosition.add(direction.multiplyScalar(moveDistance));
            this.node.setWorldPosition(newPosition);

            // 根据移动方向更新朝向
            if (direction.x < 0) {
                this.UnitData.SetOrientation(true); // 向左
            } else {
                this.UnitData.SetOrientation(false); // 向右
            }
            // 设置为移动状态
            this.SetPlayerState(1);
        }
    }

    // 检查敌人
    checkForEnemies() {
        // 如果单位已死亡，则不执行敌人检查
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        if (this.UnitData.IsBlock) return; // 如果正在进行阻塞操作（如治疗），则不执行

        // 寻找最近的敌人
        let nearestEnemy: SJZXD_Unit = null;
        let minDistance = this.EnemyDetectionRange;

        for (const unit of SJZXD_GameManager.Instance.UnitArray) {
            if (unit !== this.UnitData && unit.Camp !== this.Camp) {
                const distance = Vec3.distance(this.node.worldPosition, unit.node.worldPosition);

                if (distance <= this.EnemyDetectionRange && distance < minDistance) {
                    minDistance = distance;
                    nearestEnemy = unit;
                }
            }
        }

        if (nearestEnemy) {
            console.log("发现敌人");
            // 发现敌人，开始追踪
            this.beginChase(nearestEnemy);
        } else if (this.returnToPatrol) {
            // 没有敌人且之前在追击，返回巡逻
            this.returnToPatrolMode();
        }

    }
    // 开始追击敌人
    beginChase(enemy: SJZXD_Unit) {
        // 如果单位已死亡，则不执行追击
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        this.isPatrolling = false;
        this.returnToPatrol = true;
        this.UnitData.LockEnemy = enemy;
        this.SetPlayerState(1);
    }
    // 追击敌人
    chaseEnemy(enemy: SJZXD_Unit) {
        // 如果单位已死亡，则不执追击
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        const distanceToEnemy = Vec3.distance(this.node.worldPosition, enemy.node.worldPosition);

        // 如果是近战武器，只需接近到攻击范围内
        if (this.UnitData.WeaponData.武器类型 == "近战" && distanceToEnemy <= 200) {
            // 已经在近战攻击范围内，计算朝向和角度，然后开始攻击
            const direction = enemy.node.worldPosition.clone().subtract(this.node.worldPosition);

            const angleInRadians = Math.atan2(direction.y, direction.x);
            const angleInDegrees = angleInRadians * (180 / Math.PI);

            // 设置武器角度朝向敌人
            this.UnitData.GunAngle = angleInDegrees;
            this.SetPlayerState(0);
            // 开始攻击
            this.UnitData.FIRE_START(true, direction);
        } else if (this.UnitData.WeaponData.武器类型 == "远程") {
            // 对于远程武器，如果在攻击范围内则攻击，否则继续移动
            if (distanceToEnemy <= this.EnemyDetectionRange) {
                const direction = enemy.node.worldPosition.clone().subtract(this.node.worldPosition);

                const angleInRadians = Math.atan2(direction.y, direction.x);
                const angleInDegrees = angleInRadians * (180 / Math.PI);

                // 设置武器角度朝向敌人
                this.UnitData.GunAngle = angleInDegrees;
                this.SetPlayerState(0);
                // 开始攻击
                this.UnitData.FIRE_START(true, direction);
            }
        }

        // 如果不在攻击范围内或为远程武器但超出射程，继续向敌人移动
        if ((this.UnitData.WeaponData.武器类型 == "近战" && distanceToEnemy > 200) ||
            (this.UnitData.WeaponData.武器类型 == "远程" && distanceToEnemy > this.EnemyDetectionRange)) {

            const direction = enemy.node.worldPosition.clone().subtract(this.node.worldPosition).normalize();
            const moveDistance = this.UnitData.moveSpeed * this.dt;
            const newPosition = this.node.worldPosition.add(direction.multiplyScalar(moveDistance));
            this.node.setWorldPosition(newPosition);
            this.SetPlayerState(1);
            // 根据位置调整朝向
            if (enemy.node.worldPosition.x < this.node.worldPosition.x) {
                this.UnitData.SetOrientation(true); // 敌人在左边，面向左
            } else {
                this.UnitData.SetOrientation(false); // 敌人在右边，面向右
            }
        }
    }


    // 返回巡逻模式
    returnToPatrolMode() {
        // 如果单位已死亡，则不执行返回巡逻
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        this.UnitData.LockEnemy = null;
        this.UnitData.UnitState = 0; // 设置为待机状态
        this.returnToPatrol = false;
        this.isPatrolling = true;

        // 停止攻击
        this.UnitData.FIRE_STOP();

        // 重置索敌模式
        this.UnitData.setFindModle(0);

        // 回到巡逻路径上
        this.returnToPatrolPath();
    }
    private dt: number = 0;
    update(dt: number) {
        this.dt = dt;
        // 如果单位已死亡，则不再执行任何更新逻辑
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        // 根据当前状态决定行为
        if (this.isPatrolling && !this.returnToPatrol) {
            this.updatePatrol(dt);
        } else if (this.UnitData.LockEnemy) {
            // 检查是否超出安全距离，如果超出则返回巡逻
            const distanceToStartPosition = Vec3.distance(this.node.worldPosition, this.startPosition);
            if (distanceToStartPosition > this.SafetyRange) {
                this.returnToPatrolMode();
            } else {
                // 检查敌人是否还在安全距离内，如果超出则返回巡逻
                const distanceToEnemy = Vec3.distance(this.node.worldPosition, this.UnitData.LockEnemy.node.worldPosition);
                if (distanceToEnemy > this.SafetyRange) {
                    this.returnToPatrolMode();
                } else {
                    // 敌人在安全范围内，继续追击
                    this.chaseEnemy(this.UnitData.LockEnemy);
                }
            }
        }
    }
    // 返回到巡逻路径
    returnToPatrolPath() {
        if (this.point.length > 0) {
            // 设置标志，表示正在返回巡逻路径
            this.returningToPatrolPath = true;
            // 将目标设置为第一个巡逻点，以便返回巡逻路径
            this.targetPosition = this.point[0];
            this.currentPatrolIndex = 1; // 下一个巡逻点将是第二个点，形成循环
            // 设置为移动状态
            this.SetPlayerState(1);
        }
    }

}


