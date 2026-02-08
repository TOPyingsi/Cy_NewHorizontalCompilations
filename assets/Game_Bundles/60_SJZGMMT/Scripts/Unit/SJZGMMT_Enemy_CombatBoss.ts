import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, director, instantiate, IPhysics2DContact, Node, PhysicsRayResult, Prefab, RigidBody2D, sp, tween, UIOpacity, v3, Vec3 } from 'cc';
import { SJZGMMT_Unit } from '../SJZGMMT_Unit';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Enemy_CombatBoss')
export class SJZGMMT_Enemy_CombatBoss extends Component {    //近战BOSS
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
    @property({ displayName: "攻击范围" })
    public AttackRange: number = 300;//安全距离
    private point: Vec3[] = [];//巡逻点
    @property({ displayName: "识别距离" })
    public EnemyDetectionRange: number = 600;//识别敌人的范围，敌人距离多远会开始检测
    @property({ displayName: "安全距离" })
    public SafetyRange: number = 900;//安全距离
    @property({ displayName: "掉落箱子" })
    public BoxPre: string = "boss箱子";//掉落箱子
    private UnitData: SJZGMMT_Unit = null;
    private UnitSkeleton: sp.Skeleton = null;
    private AttackBox: Node = null;
    // 巡逻相关属性
    private currentPatrolIndex: number = 0;      // 当前巡逻目标点索引
    private isPatrolling: boolean = true;        // 是否在巡逻
    private targetPosition: Vec3 = null;         // 当前目标位置
    private returnToPatrol: boolean = false;     // 是否需要返回巡逻
    private startPosition: Vec3 = null;          // 初始位置，用于返回巡逻时使用
    private returningToPatrolPath: boolean = false; // 是否正在返回巡逻路径

    start() {
        this.UnitData = this.node.getComponent(SJZGMMT_Unit);
        this.UnitSkeleton = this.node.getChildByPath("动画/主角").getComponent(sp.Skeleton);
        this.UnitData.Camp = this.Camp;
        this.node.getChildByName("移动点位").children.forEach(child => {
            this.point.push(child.worldPosition.clone());
        });
        // 记录初始位置
        this.startPosition = this.node.worldPosition.clone();
        this.Init();
        this.Beging();
        director.getScene().on(SJZGMMT_EventManager.单位死亡, this.Die, this);
        this.AttackBox = this.node.getChildByName("AttackBox");
        this.AttackBox.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
    }
    //触碰到单位
    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.getComponent(SJZGMMT_Unit)) {
            if (otherCollider.node.getComponent(SJZGMMT_Unit)?.Camp != this.UnitData.Camp) {
                SJZGMMT_AudioManager.globalAudioPlay("近战攻击");
                otherCollider.node.getComponent(SJZGMMT_Unit).TakeDamage(this.Attack);
            }
        }
    }
    //死亡事件
    Die(nd: Node) {
        if (nd == this.node) {
            SJZGMMT_GameManager.Instance.UnitArray.splice(SJZGMMT_GameManager.Instance.UnitArray.indexOf(this.UnitData), 1);
            this.DropBox(this.node.worldPosition.clone());
            this.SetPlayerState(3);
            this.node.getComponent(RigidBody2D).enabled = false;
            this.node.getComponent(Collider2D).enabled = false;
            director.getScene().emit(SJZGMMT_EventManager.AI单位死亡, this.node);
        }
    }
    private isAttacking: boolean = false; // 添加攻击状态标识
    //设置状态
    SetPlayerState(state: number) {
        // 如果正在攻击，则不允许改变状态，避免攻击动画被中断
        // 但是死亡状态(3)应该能够中断任何状态
        if (this.isAttacking && state !== 3) { // 死亡状态可以中断攻击
            return;
        }
        if (this.UnitData.UnitState == state) {
            // 即使状态相同，但在移动时如果动画不是移动动画，也应强制更新
            if (state === 1 && this.UnitData.UnitState === 1) {
                // 检查当前动画是否为移动动画，如果不是则重新设置
                const currentAnim = this.UnitSkeleton.getCurrent(0);
                if (currentAnim && currentAnim.animation.name !== "zoulu") {
                    this.UnitSkeleton.setAnimation(0, "zoulu", true);
                }
            }
            return;
        }
        this.UnitData.UnitState = state;
        switch (this.UnitData.UnitState) {
            case 0:
                this.UnitSkeleton.setAnimation(0, "daiji", true);
                break;
            case 1:
                // 使用setAnimation来确保动画被正确设置
                this.UnitSkeleton.setAnimation(0, "zoulu", true);
                break;
            case 3:
                // 死亡状态：停止所有行为，播放死亡动画
                this.isAttacking = false; // 确保停止攻击状态
                this.UnitData.LockEnemy = null; // 解除锁定敌人
                // 播放死亡动画
                this.UnitSkeleton.setAnimation(0, "siwang", false);
                this.node.getComponent(RigidBody2D).enabled = false;
                this.node.getComponent(Collider2D).enabled = false;
                // 停止所有行为
                this.FIRE_STOP();
                // 延迟销毁节点
                this.scheduleOnce(() => {
                    tween(this.UnitSkeleton.node.getComponent(UIOpacity)).to(1, { opacity: 0 }).start();
                }, 1);
                this.scheduleOnce(() => {
                    this.node.active = false;
                }, 2);
                break;
        }
    }
    //死亡掉落箱子
    DropBox(pos: Vec3) {
        SJZGMMT_Incident.Loadprefab("Prefabs/容器/" + this.BoxPre).then((prefab: Prefab) => {
            let box = instantiate(prefab);
            box.setParent(SJZGMMT_GameManager.Instance.GameNode.getChildByPath(SJZGMMT_GameManager.GameScene + "/Map/对象层/容器"));
            box.setWorldPosition(pos.clone().add(v3(0, 1500, 0)));
            tween(box)
                .by(0.5, { position: v3(0, -1500, 0) })
                .start();
        })
    }

    //开始行动
    Beging() {
        // 如果有巡逻点，则开始巡逻
        if (this.point && this.point.length > 0) {
            this.startPatrol();
        }
        // 每秒检查一次敌人
        this.schedule(this.checkForEnemies, 1);
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
    startPatrol() {
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
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        if (this.point.length === 0) return;

        this.targetPosition = this.point[this.currentPatrolIndex];
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.point.length;
    }

    // 更新巡逻行为
    updatePatrol(dt: number) {
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        if (!this.isPatrolling || !this.targetPosition) return;
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
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

        // 寻找最近的敌人
        let nearestEnemy: SJZGMMT_Unit = null;
        let minDistance = this.EnemyDetectionRange;

        for (const unit of SJZGMMT_GameManager.Instance.UnitArray) {
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
    beginChase(enemy: SJZGMMT_Unit) {
        // 如果单位已死亡，则不执行追击
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        this.isPatrolling = false;
        this.returnToPatrol = true;
        this.UnitData.LockEnemy = enemy;
    }

    //追击敌人
    chaseEnemy(enemy: SJZGMMT_Unit) {
        // 如果单位已死亡，则不执追击
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        const distanceToEnemy = Vec3.distance(this.node.worldPosition, enemy.node.worldPosition);

        // 到达攻击范围 并且不在攻击状态时 开始攻击
        if (distanceToEnemy <= this.AttackRange && !this.isAttacking) {
            // 开始攻击
            this.FIRE_START();
        }

        // 如果不在攻击范围内 或者 攻击动画播放完毕后继续向敌人移动
        if (distanceToEnemy > this.AttackRange - 100 && !this.isAttacking) {
            const direction = enemy.node.worldPosition.clone().subtract(this.node.worldPosition).normalize();
            const moveDistance = this.UnitData.moveSpeed * this.dt;
            const newPosition = this.node.worldPosition.add(direction.multiplyScalar(moveDistance));
            this.node.setWorldPosition(newPosition);

            // 确保设置为移动状态并播放移动动画
            if (this.UnitData.UnitState !== 1) {
                this.SetPlayerState(1);
            }

            // 根据位置调整朝向
            if (enemy.node.worldPosition.x < this.node.worldPosition.x) {
                this.UnitData.SetOrientation(true); // 敌人在左边，面向左
            } else {
                this.UnitData.SetOrientation(false); // 敌人在右边，面向右
            }
        } else if (!this.isAttacking && this.UnitData.LockEnemy) {
            // 即使距离足够近但不攻击时，也要确保状态正确
            // 如果在攻击范围外，应该保持移动状态
            if (distanceToEnemy > this.AttackRange) {
                if (this.UnitData.UnitState !== 1) {
                    this.SetPlayerState(1);
                }
            }
        }
    }
    FIRE_START() {
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        // 检查是否正在攻击，避免重复攻击
        if (this.isAttacking) {
            return;
        }

        // 设置攻击状态，防止其他动画中断
        this.isAttacking = true;

        // 直接播放攻击动画
        this.UnitSkeleton.clearTrack(0); // 清除当前轨道上的所有动画
        this.UnitSkeleton.setAnimation(0, "gongji", false); // 设置为false，播放一次

        // 监听动画播放进度
        this.UnitSkeleton.setCompleteListener((trackEntry) => {
            if (trackEntry.animation.name === "gongji") {
                // 动画播放完成，重置攻击状态
                this.isAttacking = false;
                // 根据当前情况决定状态
                if (this.UnitData.LockEnemy) {
                    const distanceToEnemy = Vec3.distance(this.node.worldPosition, this.UnitData.LockEnemy.node.worldPosition);
                    // 如果敌人仍然在范围内，继续追击或攻击
                    if (distanceToEnemy <= this.AttackRange) {
                        // 距离够了，准备再次攻击
                        if (!this.isAttacking) {
                            this.FIRE_START();
                        }
                    } else {
                        // 敌人超出范围，继续追击
                        this.SetPlayerState(1); // 设置为移动状态追击
                    }
                } else {
                    // 没有锁定敌人，回到待机状态
                    this.SetPlayerState(0);
                }
            }
        });
        // 监听动画事件，用于在特定时间点触发攻击
        this.UnitSkeleton.setStartListener((trackEntry) => {
            if (trackEntry.animation.name === "gongji") {
                this.scheduleOnce(() => {
                    this.onAttackTrigger(); // 触发攻击
                }, 0.6); // 根据实际需要调整触发时机
            }
        });
    }
    FIRE_STOP() {
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        // 只有当不是在攻击状态时才设置为待机
        this.SetPlayerState(0);
    }

    // 返回巡逻模式
    returnToPatrolMode() {
        // 如果单位已死亡，则不执行返回巡逻
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        this.UnitData.LockEnemy = null;
        this.returnToPatrol = false;
        this.isPatrolling = true;
        // 停止攻击
        this.FIRE_STOP();
        // 恢复满血
        this.UnitData.Hp = this.MaxHP;
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
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
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
    // 攻击触发
    private onAttackTrigger() {
        if (this.UnitData && this.UnitData.UnitState === 3) {
            return;
        }
        this.AttackBox.active = true;
        SJZGMMT_AudioManager.globalAudioPlay("近战攻击");
        this.UnitData.LockEnemy.TakeDamage(this.Attack);

        this.scheduleOnce(() => {
            this.AttackBox.active = false;
        }, 0.1); // 短暂激活后关闭
    }
}


