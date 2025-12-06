import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { XSHY_Unit } from './XSHY_Unit';
import { XSHY_GameManager } from './XSHY_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XSHY_AIControl')
export class XSHY_AIControl extends Component {
    private unit: XSHY_Unit = null;

    // AI行为参数
    @property
    private attackRange: number = 100; // 攻击范围

    @property
    private followRange: number = 400; // 跟随范围

    @property
    private stopDistance: number = 50; // 停止距离

    @property
    private moveSpeed: number = 100; // 移动速度

    @property
    private attackCooldown: number = 0.3; // 攻击冷却时间

    @property
    private skill1Cooldown: number = 5.0; // 技能1冷却时间

    @property
    private skill2Cooldown: number = 8.0; // 技能2冷却时间

    @property
    private skill3Cooldown: number = 8.0; // 技能3冷却时间
    // AI状态
    private lastAttackTime: number = 0;
    private lastSkill1Time: number = 0;
    private lastSkill2Time: number = 0;
    private lastSkill3Time: number = 0;
    private lastActionTime: number = 0;

    // 连击相关
    private comboCount: number = 0;
    private maxComboCount: number = 3; // 最大连击数
    private comboWindow: number = 1.0; // 连击窗口时间
    private lastComboTime: number = 0;

    // 移动相关
    private idleTime: number = 0;
    private moveDirection: Vec2 = new Vec2(0, 0);
    private targetPosition: Vec3 = new Vec3(0, 0, 0);
    private hasTargetPosition: boolean = false;
    private lastPlayerPosition: Vec3 = new Vec3(0, 0, 0);
    private positionUpdateTime: number = 0;

    // 战术行为相关
    private tacticalState: number = 1; // 0: 进攻, 1: 防守, 2: 侧翼, 3: 徘徊
    private tacticalTimer: number = 0;
    private tacticalDuration: number = 0;

    // AI难度参数
    @property
    private aggression: number = 0.8; // 攻击性 (0-1)

    @property
    private prediction: number = 0.6; // 预判能力 (0-1)

    @property
    private tacticalVariety: number = 1; // 战术多样性 (0-1)

    private decisionTimer: number = 0;
    private decisionInterval: number = 0.2; // 决策间隔时间

    private Startforbid: number = 2;//AI开局禁止行动秒数
    start() {
        this.unit = this.node.getComponent(XSHY_Unit);
        // 初始化最后玩家位置
        if (XSHY_GameManager.Instance && XSHY_GameManager.Instance.PlayerNode) {
            this.lastPlayerPosition = XSHY_GameManager.Instance.PlayerNode.worldPosition.clone();
        }
        // 初始化战术状态
        this.tacticalState = Math.floor(Math.random() * 4);
        this.tacticalDuration = 2 + Math.random() * 3; // 2-5秒的战术状态
    }

    update(dt: number) {
        this.Startforbid -= dt;
        if (!XSHY_GameManager.Instance || !XSHY_GameManager.Instance.PlayerNode || this.Startforbid > 0) {
            return;
        }

        // 更新计时器
        this.decisionTimer += dt;
        this.idleTime += dt;
        this.lastComboTime += dt;
        this.tacticalTimer += dt;

        // 重置连击计数如果超过窗口时间
        if (this.lastComboTime > this.comboWindow) {
            this.comboCount = 0;
        }

        // 更新战术状态
        if (this.tacticalTimer >= this.tacticalDuration) {
            this.changeTacticalState();
        }

        // 定期重新决策
        if (this.decisionTimer >= this.decisionInterval) {
            this.makeDecision();
            this.decisionTimer = 0;
        }
    }

    /**
     * 改变战术状态
     */
    private changeTacticalState() {
        this.tacticalTimer = 0;
        this.tacticalDuration = 2 + Math.random() * 4; // 2-6秒的战术状态

        // 根据战术多样性决定是否改变战术
        if (Math.random() < this.tacticalVariety) {
            // 有一定概率保持当前状态
            if (Math.random() > 0.3) {
                // 改变战术状态
                const newState = Math.floor(Math.random() * 4);
                // 避免连续相同状态
                this.tacticalState = (newState === this.tacticalState) ? (newState + 1) % 4 : newState;
            }
        }
        // 否则保持当前状态
    }

    /**
     * AI核心决策函数
     */
    private makeDecision() {
        const playerNode = XSHY_GameManager.Instance.PlayerNode;
        const playerPosition = playerNode.worldPosition;

        // 更新最后玩家位置（用于预测）
        this.lastPlayerPosition = playerPosition.clone();
        this.positionUpdateTime = Date.now() / 1000;

        // 计算与玩家的距离
        const selfPosition = this.node.worldPosition;
        const distanceToPlayer = Vec3.distance(selfPosition, playerPosition);

        // 预判玩家位置
        const predictedPlayerPosition = this.predictPlayerPosition(playerPosition, playerNode);
        const distanceToPredicted = Vec3.distance(selfPosition, predictedPlayerPosition);

        // 如果正在攻击或技能状态，处理连击逻辑
        if (this.unit.State === 2) {
            this.handleComboOpportunity(distanceToPlayer);
            return;
        }

        // 如果正在受击或倒地，停止所有操作
        if (this.unit.State === 3 || this.unit.State === 4) {
            this.unit.StopMove();
            return;
        }

        // 根据战术状态执行不同行为
        switch (this.tacticalState) {
            case 0: // 进攻
                this.executeAggressiveBehavior(predictedPlayerPosition, distanceToPredicted);
                break;
            case 1: // 防守
                this.executeDefensiveBehavior(predictedPlayerPosition, distanceToPredicted);
                break;
            case 2: // 侧翼
                this.executeFlankingBehavior(predictedPlayerPosition, distanceToPlayer);
                break;
            case 3: // 徘徊
                this.executeWanderingBehavior(predictedPlayerPosition, distanceToPlayer);
                break;
        }
    }

    /**
     * 预判玩家位置
     */
    private predictPlayerPosition(playerPosition: Vec3, playerNode: Node): Vec3 {
        const playerUnit = playerNode.getComponent(XSHY_Unit);
        const predictedPos = playerPosition.clone();

        if (playerUnit && playerUnit.State === 1) { // 如果玩家在移动
            // 计算玩家移动方向
            const playerDirection = new Vec3();
            if (playerUnit.orientation) {
                playerDirection.set(-1, 0, 0);
            } else {
                playerDirection.set(1, 0, 0);
            }

            // 预测玩家在未来的位置（根据预判能力调整预测距离）
            const predictionDistance = this.prediction * 60;
            Vec3.scaleAndAdd(predictedPos, playerPosition, playerDirection, predictionDistance);
        }

        return predictedPos;
    }

    /**
     * 处理连击机会
     */
    private handleComboOpportunity(distanceToPlayer: number) {
        const currentTime = Date.now() / 1000;

        // 在攻击状态下，如果在连击窗口内且未达到最大连击数
        if (this.comboCount < this.maxComboCount &&
            (currentTime - this.lastAttackTime) < this.comboWindow) {
            // 有一定概率继续连击
            const comboChance = Math.random();
            if (comboChance < 0.7 && distanceToPlayer < this.attackRange) {
                // 继续连击，不打断当前攻击，等待自然结束
                return;
            }
        }
    }

    /**
     * 进攻型行为
     */
    private executeAggressiveBehavior(predictedPlayerPosition: Vec3, distanceToPlayer: number) {
        const selfPosition = this.node.worldPosition;
        const currentTime = Date.now() / 1000;

        // 面向玩家
        const directionToPlayer = new Vec3();
        Vec3.subtract(directionToPlayer, predictedPlayerPosition, selfPosition);
        this.setOrientation(directionToPlayer.x);

        if (distanceToPlayer > this.attackRange) {
            // 距离太远，积极接近
            const direction = new Vec3();
            Vec3.subtract(direction, predictedPlayerPosition, selfPosition);
            direction.normalize();

            const moveDirection = new Vec2(direction.x, direction.y);
            this.unit.Move(moveDirection);
        } else if (distanceToPlayer < this.stopDistance) {
            // 距离太近，稍微后退再攻击
            this.unit.StopMove();

            // 有机会使用突进技能
            if (currentTime - this.lastSkill1Time > this.skill1Cooldown * 0.7) {
                this.unit.SkillClick(1);
                this.lastSkill1Time = currentTime;
                this.lastActionTime = currentTime;
                this.comboCount = 0;
                return;
            }

            // 或者普通攻击
            if (currentTime - this.lastAttackTime > this.attackCooldown) {
                this.unit.AttackClick();
                this.lastAttackTime = currentTime;
                this.lastActionTime = currentTime;
                this.comboCount++;
                this.lastComboTime = 0;
                return;
            }
        } else {
            // 在攻击范围内，停止移动并攻击
            this.unit.StopMove();

            // 优先使用技能
            if (currentTime - this.lastSkill2Time > this.skill2Cooldown) {
                this.unit.SkillClick(2);
                this.lastSkill2Time = currentTime;
                this.lastActionTime = currentTime;
                this.comboCount = 0;
                return;
            }
            if (currentTime - this.lastSkill3Time > this.skill3Cooldown) {
                this.unit.SkillClick(3);
                this.lastSkill3Time = currentTime;
                this.lastActionTime = currentTime;
                this.comboCount = 0;
                return;
            }
            if (currentTime - this.lastSkill1Time > this.skill1Cooldown) {
                this.unit.SkillClick(1);
                this.lastSkill1Time = currentTime;
                this.lastActionTime = currentTime;
                this.comboCount = 0;
                return;
            }

            // 使用普通攻击
            if (currentTime - this.lastAttackTime > this.attackCooldown) {
                this.unit.AttackClick();
                this.lastAttackTime = currentTime;
                this.lastActionTime = currentTime;
                this.comboCount++;
                this.lastComboTime = 0;
                return;
            }
        }
    }

    /**
     * 防守型行为
     */
    private executeDefensiveBehavior(predictedPlayerPosition: Vec3, distanceToPlayer: number) {
        const selfPosition = this.node.worldPosition;
        const currentTime = Date.now() / 1000;

        // 面向玩家
        const directionToPlayer = new Vec3();
        Vec3.subtract(directionToPlayer, predictedPlayerPosition, selfPosition);
        this.setOrientation(directionToPlayer.x);

        if (distanceToPlayer < this.attackRange * 0.8) {
            // 玩家太近，后退
            const direction = new Vec3();
            Vec3.subtract(direction, selfPosition, predictedPlayerPosition);
            direction.normalize();

            const moveDirection = new Vec2(direction.x, direction.y);
            this.unit.Move(moveDirection);
            this.scheduleStopMoving(0.5);
        } else if (distanceToPlayer > this.attackRange * 1.5) {
            // 玩家太远，稍微前进
            const direction = new Vec3();
            Vec3.subtract(direction, predictedPlayerPosition, selfPosition);
            direction.normalize();

            const moveDirection = new Vec2(direction.x, direction.y);
            this.unit.Move(moveDirection);
            this.scheduleStopMoving(0.5);
        } else {
            // 距离适中，停止移动并伺机攻击
            this.unit.StopMove();

            // 有较低概率攻击
            if (Math.random() < 0.3) {
                if (currentTime - this.lastSkill1Time > this.skill1Cooldown) {
                    this.unit.SkillClick(1);
                    this.lastSkill1Time = currentTime;
                    this.lastActionTime = currentTime;
                    this.comboCount = 0;
                    return;
                }

                if (currentTime - this.lastAttackTime > this.attackCooldown) {
                    this.unit.AttackClick();
                    this.lastAttackTime = currentTime;
                    this.lastActionTime = currentTime;
                    this.comboCount++;
                    this.lastComboTime = 0;
                    return;
                }
            }
        }
    }

    /**
     * 侧翼包抄行为
     */
    private executeFlankingBehavior(predictedPlayerPosition: Vec3, distanceToPlayer: number) {
        const selfPosition = this.node.worldPosition;
        const currentTime = Date.now() / 1000;

        // 计算侧翼方向（垂直于敌我连线的方向）
        const directionToPlayer = new Vec3();
        Vec3.subtract(directionToPlayer, predictedPlayerPosition, selfPosition);

        // 计算侧翼方向（90度转向）
        const flankingDirection = new Vec3(-directionToPlayer.y, directionToPlayer.x, 0);
        // 50%概率选择相反侧翼方向
        if (Math.random() > 0.5) {
            flankingDirection.multiplyScalar(-1);
        }
        flankingDirection.normalize();

        // 面向玩家
        this.setOrientation(directionToPlayer.x);

        if (distanceToPlayer > this.attackRange * 2) {
            // 太远，先向侧翼移动再接近
            const moveDirection = new Vec2(flankingDirection.x, flankingDirection.y);
            this.unit.Move(moveDirection);
        } else if (distanceToPlayer < this.attackRange * 0.5) {
            // 太近，向侧翼移动拉开距离
            const moveDirection = new Vec2(flankingDirection.x, flankingDirection.y);
            this.unit.Move(moveDirection);
        } else {
            // 距离适中，停止移动并攻击
            this.unit.StopMove();

            // 侧翼攻击有更高概率使用技能
            if (currentTime - this.lastSkill2Time > this.skill2Cooldown * 0.7) {
                this.unit.SkillClick(2);
                this.lastSkill2Time = currentTime;
                this.lastActionTime = currentTime;
                this.comboCount = 0;
                return;
            }
            if (this.unit.SkillCount > 0) {
                this.unit.TongLing(XSHY_GameManager.SkillData[XSHY_GameManager.EnemyID])
                return;
            }
            if (currentTime - this.lastAttackTime > this.attackCooldown) {
                this.unit.AttackClick();
                this.lastAttackTime = currentTime;
                this.lastActionTime = currentTime;
                this.comboCount++;
                this.lastComboTime = 0;
                return;
            }
        }
    }

    /**
     * 徘徊行为（诱敌深入）
     */
    private executeWanderingBehavior(predictedPlayerPosition: Vec3, distanceToPlayer: number) {
        const selfPosition = this.node.worldPosition;
        const currentTime = Date.now() / 1000;

        // 面向玩家
        const directionToPlayer = new Vec3();
        Vec3.subtract(directionToPlayer, predictedPlayerPosition, selfPosition);
        this.setOrientation(directionToPlayer.x);

        if (distanceToPlayer > this.followRange * 0.7) {
            // 玩家较远，缓慢接近
            const direction = new Vec3();
            Vec3.subtract(direction, predictedPlayerPosition, selfPosition);
            direction.normalize();

            // 减慢移动速度
            const moveDirection = new Vec2(direction.x * 0.5, direction.y * 0.5);
            this.unit.Move(moveDirection);
        } else if (distanceToPlayer < this.attackRange) {
            // 玩家进入攻击范围，有一定概率后退
            if (Math.random() < 0.6) {
                const direction = new Vec3();
                Vec3.subtract(direction, selfPosition, predictedPlayerPosition);
                direction.normalize();

                const moveDirection = new Vec2(direction.x, direction.y);
                this.unit.Move(moveDirection);
                this.scheduleStopMoving(0.7);
            } else {
                // 或者直接攻击
                this.unit.StopMove();

                if (currentTime - this.lastAttackTime > this.attackCooldown) {
                    this.unit.AttackClick();
                    this.lastAttackTime = currentTime;
                    this.lastActionTime = currentTime;
                    this.comboCount++;
                    this.lastComboTime = 0;
                    return;
                }
            }
        } else {
            // 中等距离，停止移动
            this.unit.StopMove();

            // 偶尔攻击
            if (Math.random() < 0.2) {
                if (currentTime - this.lastSkill1Time > this.skill1Cooldown) {
                    this.unit.SkillClick(1);
                    this.lastSkill1Time = currentTime;
                    this.lastActionTime = currentTime;
                    this.comboCount = 0;
                    return;
                }

                if (currentTime - this.lastAttackTime > this.attackCooldown) {
                    this.unit.AttackClick();
                    this.lastAttackTime = currentTime;
                    this.lastActionTime = currentTime;
                    this.comboCount++;
                    this.lastComboTime = 0;
                    return;
                }
            }
        }
    }

    /**
     * 设置角色朝向
     */
    private setOrientation(directionX: number) {
        if (directionX < 0) {
            this.unit.Setorientation(true); // 面向左
        } else {
            this.unit.Setorientation(false); // 面向右
        }
    }

    /**
     * 定时停止移动
     */
    private scheduleStopMoving(delay: number) {
        this.scheduleOnce(() => {
            if (this.unit.State !== 2 && this.unit.State !== 3 && this.unit.State !== 4) {
                this.unit.StopMove();
            }
        }, delay);
    }

    /**
     * 普攻结束回调 - 用于连击控制
     */
    public onNormalAttackEnd() {
        const currentTime = Date.now() / 1000;

        // 如果在连击窗口内且未达到最大连击数，则继续攻击
        if ((currentTime - this.lastAttackTime) < this.comboWindow && this.comboCount < this.maxComboCount) {
            // 不立即触发下一次攻击，在下次决策周期中处理
            return;
        } else {
            // 结束连击
            this.comboCount = 0;
        }
    }


}


