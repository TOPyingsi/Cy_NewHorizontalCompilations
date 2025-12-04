import { _decorator, Component, Node, Vec3, Quat, find, PhysicsSystem, Collider, RigidBody, director, Tween, tween, geometry, v3, SkeletalAnimation, ICollisionEvent } from 'cc';
const { ccclass, property } = _decorator;
import { LBL_Waypoint } from './LBL_Waypoint';
import { LBL_PathManager } from './LBL_PathManager';
import { LBL_Door } from './LBL_Door';
import { LBL_DataManager } from '../LBL_DataManager';

@ccclass('LBL_MonsterController ')
export class LBL_MonsterController extends Component {
    @property(Node)
    player: Node = null; // 玩家节点

    @property(Node)
    core: Node = null;

    @property
    detectionRange = 30; // 检测范围

    @property
    chaseSpeed = 5; // 追逐速度

    @property
    normalSpeed = 3; // 正常移动速度

    @property
    waypointReachDistance = 0.1; // 到达路点的判定距离

    @property
    floorHeight = 3; // 每层楼的高度

    @property(Node)
    allWaypointsParent: Node = null; // 场景中所有路点

    @property({ visible: false })
    currentFloor = 1; // 当前所在楼层

    @property(LBL_Waypoint)
    currentWaypoint: LBL_Waypoint | null = null; // 当前所在路点

    // 当前目标路点，怪物正前往的路点
    private targetWaypoint: LBL_Waypoint | null = null;

    @property
    drawGizmos = true; // 是否绘制Gizmos

    @property
    pathColor = new Vec3(1, 0, 0); // 路径颜色

    allWaypoints: LBL_Waypoint[] = []; // 所有路点数组

    private currentPath: LBL_Waypoint[] = []; // 当前路径
    private currentPosPath: Vec3[] = []; // 当前路径的位置数组

    private currentPathIndex = 0; // 当前路径索引
    private isChasing = false; // 是否正在追逐
    private isProcessingPath = false; // 是否正在处理路径
    private currentDoor: LBL_Door | null = null; // 当前正在处理的门
    private rigidBody: RigidBody | null = null; // 刚体组件
    private pathUpdateInterval = 3; // 路径更新间隔（秒）
    private lastPathUpdateTime = 0; // 上次路径更新时间

    lastPoint: LBL_Waypoint;

    spine:SkeletalAnimation = null;

    collider:Collider = null;

    initWorldPos:Vec3 = null;

    initRotationFromEuler:Vec3 = null;

    isContactPlayer:boolean = false;

    onLoad() {
        // 获取刚体组件
        this.rigidBody = this.getComponent(RigidBody);
        if (!this.rigidBody) {
            this.rigidBody = this.addComponent(RigidBody);
            this.rigidBody.type = RigidBody.Type.DYNAMIC;
            this.rigidBody.useGravity = true;
        }

        if (!this.spine) {
            this.spine = this.getComponent(SkeletalAnimation);
        }

        if (!this.collider) {
            this.collider = this.getComponent(Collider);
        }

        if (!this.initWorldPos) {
            this.initWorldPos = this.node.worldPosition.clone();
        }


        if (!this.initRotationFromEuler) {
            this.initRotationFromEuler = this.node.eulerAngles.clone();
        }

        // 确保PathManager存在
        if (!find('PathManager')) {
            const pathManagerNode = new Node('PathManager');
            pathManagerNode.addComponent(LBL_PathManager);
            director.getScene()?.addChild(pathManagerNode);
        }

        // 修改原代码
        this.allWaypoints = [];
        this.collectWaypointsRecursively(this.allWaypointsParent, this.allWaypoints);
       
    }

    openCollider(){
        this.collider.on("onCollisionEnter", this.onColliderContact, this);
    }

    closeCollider(){
        this.collider.off("onCollisionEnter", this.onColliderContact, this);
    }

    resetMonster(){
        LBL_PathManager.instance.reset();
        // 重置位置和旋转
        this.node.setWorldPosition(this.initWorldPos);
        this.node.setRotationFromEuler(this.initRotationFromEuler); // 重置旋转
        
        // 重置路径相关状态
        this.currentPath = [];
        this.currentPosPath = [];
        this.currentPathIndex = 0;
        this.targetWaypoint = null;
        this.currentWaypoint = this.node.getComponent(LBL_Waypoint);
        
        // 停止移动并重置物理状态
        if (this.rigidBody) {
            this.rigidBody.setLinearVelocity(Vec3.ZERO);
            this.rigidBody.setAngularVelocity(Vec3.ZERO);
        }
        
        // 重置其他状态变量
        this.isChasing = false;
        this.isContactPlayer = false;
        this.currentDoor = null;
        this.lastPathUpdateTime = 0;
        
        // 重新初始化碰撞检测
        this.openCollider();
        
        // 重置动画状态
        if (this.spine) {
            this.spine.crossFade('walk', 0.2);
        }
        
        // // 重新查找最近路点
        // this.findNearestWaypoint();
       
    }

    clearMonster(){
        // LBL_PathManager.instance.reset();
        this.closeCollider();
        this.isContactPlayer = false;
    }



    // 新增递归收集方法
    private collectWaypointsRecursively(node: Node, waypoints: LBL_Waypoint[]): void {
        const waypoint = node.getComponent(LBL_Waypoint);
        if (waypoint) {
            waypoints.push(waypoint);
        }

        // 递归处理所有子节点
        for (const child of node.children) {
            this.collectWaypointsRecursively(child, waypoints);
        }
    }



    start() {
        // 初始时找到最近的路点
        // this.findNearestWaypoint();
    }


    onColliderContact(event: ICollisionEvent){
         // 检测到障碍物（墙壁/障碍）
         const colliderType = event.otherCollider.node.name;
         if(colliderType == "Player"){
        // 先转向玩家位置
            const playerPos = event.otherCollider.node.worldPosition;
            const direction = playerPos.clone().subtract(this.node.worldPosition).normalize();
            const angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
            this.node.setRotationFromEuler(0, angle, 0);
            


            // LBL_DataManager.Instance.isPlayerDead = true;
            LBL_DataManager.Instance.isGameStart = false;
            this.isContactPlayer = true;
            const currentState = this.spine.getState('pu');
            if (!currentState?.isPlaying) {
                this.spine.crossFade('pu', 0.2);
            }
         }
            //
    }

    update(deltaTime: number) {
        if (!this.player) return;
        if (!LBL_DataManager.Instance.isGameStart) return;
        if(this.isContactPlayer) {
            //  const currentState = this.spine.getState('pu');
            // if (!currentState?.isPlaying) {
            //     this.spine.crossFade('pu', 0.2);
            // }
            return;
        }

        // 更新当前楼层
        this.updateCurrentFloor();

        // 检测玩家是否在范围内
        this.checkPlayerInRange(deltaTime);

        // 如果正在追逐且有路径，则移动
        if (this.isChasing && this.currentPath.length > 0 && !this.currentDoor) {
            this.moveAlongPath(deltaTime);
        }

        // 处理门交互
        this.handleDoorInteraction();
    }

    // 更新当前所在楼层
    private updateCurrentFloor() {
        this.currentFloor = Math.floor(this.core.worldPosition.y / this.floorHeight) + 1;
    }

    // 检测玩家是否在范围内
    private checkPlayerInRange(deltaTime: number) {
        if (!this.player) return;

        const distanceToPlayer = Vec3.distance(this.core.worldPosition, this.player.worldPosition);

        if (distanceToPlayer <= this.detectionRange) {
            const currentState = this.spine.getState('run');
            if (!currentState?.isPlaying) {
                this.spine.crossFade('run', 0.2);
            }
            if (!this.isChasing) {
                this.isChasing = true;
                this.updateChasePath();
                this.lastPathUpdateTime = 0;
            } else {
                // 定期更新路径
                this.lastPathUpdateTime += deltaTime;
                if (this.lastPathUpdateTime >= this.pathUpdateInterval && !this.isProcessingPath) {
                    this.updateChasePath();
                    this.lastPathUpdateTime = 0;
                }
            }
        } else {
            const currentState = this.spine.getState('walk');
            if (!currentState?.isPlaying) {
                this.spine.crossFade('walk', 0.2);
            }
            this.isChasing = false;
            this.currentPath = [];
            this.targetWaypoint = null;
        }
    }

    // 更新追逐路径
    private updateChasePath() {
        if (!this.player || !this.currentWaypoint || this.isProcessingPath) return;

        this.isProcessingPath = true;

        this.currentWaypoint.connectedWaypoints = [];


        // 找到玩家附近的路点
        const playerWaypoint = this.findNearestWaypointToPosition(this.player.worldPosition);
        // 获取玩家身上的路点组件
        const playerWaypointComponent = this.player.getComponent(LBL_Waypoint);

        // if (Math.abs(playerWaypoint.node.getWorldPosition().y - this.core.getWorldPosition().y) < 0.5) {
            // 检查是否怪物和玩家最近的路点是同一个
            let ray = new geometry.Ray;
            geometry.Ray.fromPoints(ray, this.core.getWorldPosition(), this.player.getChildByName("Node").getWorldPosition());
            if (PhysicsSystem.instance.raycastClosest(ray)) {
                const result = PhysicsSystem.instance.raycastClosestResult;
                let node = result.collider.node;
                if (node == this.player) {
                    if (playerWaypoint) {
                        // 如果玩家身上有LBL_Waypoint组件，直接将其作为唯一路径点
                        if (playerWaypointComponent) {
                            this.onPathFound([playerWaypointComponent], true);
                        } else {
                            // 否则使用玩家附近的路点作为路径点
                            this.onPathFound([playerWaypoint], true);
                        }
                        return; // 直接返回，不需要进行后续路径规划
                    }
                }
            }
        //  }

        this.allWaypoints.sort((a, b) => { return Vec3.distance(a.node.getWorldPosition(), this.core.getWorldPosition()) - Vec3.distance(b.node.getWorldPosition(), this.core.getWorldPosition()); });
        let times = 0;
        for (let i = 0; i < this.allWaypoints.length; i++) {
            const element = this.allWaypoints[i];
            if (this.lastPoint == element) continue;
            if (Vec3.distance(element.node.getWorldPosition(), this.core.getWorldPosition()) < this.waypointReachDistance) continue;
            let abs = Math.abs(element.node.getWorldPosition().y - this.core.getWorldPosition().y);
            if (element.node.name == "Cube-006") console.log(`Cube${abs}`);
            if (abs > 1.5) continue;
            let ray = new geometry.Ray;
            geometry.Ray.fromPoints(ray, this.core.getWorldPosition(), element.node.getWorldPosition());
            if (PhysicsSystem.instance.raycastClosest(ray)) {
                const result = PhysicsSystem.instance.raycastClosestResult;
                let node = result.collider.node;
                if (node == element.node) {
                    this.currentWaypoint.connectedWaypoints.push(element.getComponent(LBL_Waypoint));
                    times++;
                    if (times >= 2) break;
                }
            }
        }

        if (playerWaypoint) {
            // 检查是否在同一楼层
            // if (this.currentWaypoint.floor === playerWaypoint.floor) {
            // 同一楼层，直接规划路径
            LBL_PathManager.instance.requestPath(
                this.currentWaypoint,
                playerWaypoint,
                (path, success) => this.onPathFound(path, success)
            );
            // } else {
            //     // 不同楼层，先找到当前楼层的楼梯
            //     const currentStair = this.findNearestStairway(this.currentWaypoint.floor);

            //     if (currentStair) {
            //         // 找到目标楼层的楼梯
            //         const targetStair = this.findNearestStairway(playerWaypoint.floor);

            //         if (targetStair && currentStair.stairConnections.includes(targetStair)) {
            //             // 1. 规划当前位置到当前楼梯的路径
            //             LBL_PathManager.instance.requestPath(
            //                 this.currentWaypoint, 
            //                 currentStair, 
            //                 (path1, success1) => {
            //                     if (success1 && path1) {
            //                         // 2. 规划两个楼梯之间的路径（包含拐点）
            //                         LBL_PathManager.instance.requestPath(
            //                             currentStair,
            //                             targetStair,
            //                             (stairPath, stairSuccess) => {
            //                                 if (stairSuccess && stairPath) {
            //                                     // 3. 规划目标楼梯到玩家的路径
            //                                     LBL_PathManager.instance.requestPath(
            //                                         targetStair, 
            //                                         playerWaypoint,
            //                                         (path2, success2) => {
            //                                             if (success2 && path2) {
            //                                                 // 合并三段路径：当前位置->当前楼梯->目标楼梯->玩家
            //                                                 // 移除重复的连接点
            //                                                 const combinedPath = [
            //                                                     ...path1,
            //                                                     ...stairPath.slice(1),  // 跳过第一个元素，避免与path1的最后一个元素重复
            //                                                     ...path2.slice(1)       // 跳过第一个元素，避免与stairPath的最后一个元素重复
            //                                                 ];
            //                                                 this.onPathFound(combinedPath, true);
            //                                             } else {
            //                                                 this.onPathFound(null, false);
            //                                             }
            //                                         }
            //                                     );
            //                                 } else {
            //                                     // 楼梯间路径规划失败
            //                                     this.onPathFound(null, false);
            //                                 }
            //                             }
            //                         );
            //                     } else {
            //                         this.onPathFound(null, false);
            //                     }
            //                 }
            //             );
            //         } else {
            //             // 找不到连接的楼梯
            //             this.onPathFound(null, false);
            //         }
            //     } else {
            //         // 找不到当前楼层的楼梯
            //         this.onPathFound(null, false);
            //     }
            // }
        } else {
            // 找不到玩家附近的路点
            this.onPathFound(null, false);
        }
    }

    // 路径找到后的回调
    private onPathFound(newPath: LBL_Waypoint[] | null, success: boolean) {
        this.isProcessingPath = false;

        if (success && newPath && newPath.length > 0) {
            // 添加玩家路点作为最后一个目标（如果不存在）
            const playerWaypointComponent = this.player.getComponent(LBL_Waypoint);
            if (playerWaypointComponent && !newPath.includes(playerWaypointComponent)) {
                newPath = [...newPath, playerWaypointComponent];
            }

            // // 检查是否有当前目标路点
            // if (this.targetWaypoint) {
            //     // 查看当前目标路点是否在新路径的前3个路点中
            //     const lookAheadCount = Math.min(3, newPath.length);
            //     let targetIndex = -1;

            //     for (let i = 0; i < lookAheadCount; i++) {
            //         if (newPath[i] === this.targetWaypoint) {
            //             targetIndex = i;
            //             break;
            //         }
            //     }

            //     // 如果找到了，就从目标路点开始使用新路径
            //     if (targetIndex !== -1) {
            //         newPath = newPath.slice(targetIndex);
            //     }
            // }

            // 保留当前行进进度
            const currentPosition = this.core.worldPosition.clone();

            // 找到新路径中离当前位置最近的有效路点
            let closestIndex = 0;
            let minDistance = Number.MAX_VALUE;

            newPath.forEach((waypoint, index) => {
                const distance = Vec3.distance(currentPosition, waypoint.node.worldPosition);
                if (distance < minDistance && index >= this.currentPathIndex) {
                    minDistance = distance;
                    closestIndex = index;
                }
            });

            // 如果新路径包含当前正在前往的路点，则保持进度
            if (this.currentPath.length > 0 && this.currentPathIndex > 0) {
                const currentTarget = this.currentPath[this.currentPathIndex];
                const newIndex = newPath.findIndex(w => w === currentTarget);
                if (newIndex !== -1 && newIndex >= closestIndex) {
                    closestIndex = newIndex;
                }
            }

            // // 更新路径时保留当前位置之后的路径
            // this.currentPath = newPath.slice(closestIndex);
            this.currentPath = [...newPath];
            this.currentPosPath = this.currentPath.map(waypoint => waypoint.node.worldPosition.clone());
            this.currentPathIndex = 0; // 重置为相对索引

            // 设置当前目标路点
            if (this.currentPath.length > 0) {
                this.targetWaypoint = this.currentPath[0];
            } else {
                this.targetWaypoint = null;
            }

            // 如果当前位置已经超过第一个路径点，则直接前往下一个
            if (closestIndex > 0 && this.currentPath.length > 0) {
                const distanceToFirst = Vec3.distance(currentPosition, this.currentPosPath[0]);
                if (distanceToFirst < this.waypointReachDistance) {
                    this.currentPathIndex = 1;
                    this.targetWaypoint = this.currentPath.length > 1 ? this.currentPath[1] : null;
                }
            }
        }
    }

    // 沿着路径移动
    private moveAlongPath(deltaTime: number) {
        if (!this.rigidBody) return;

        
        let v = v3();
        this.rigidBody.getLinearVelocity(v);
        let y = v.y;
        if (this.currentPathIndex >= this.currentPath.length) {
            // 到达路径终点
            this.currentPath = [];
            this.currentPosPath = [];
            this.targetWaypoint = null;
            this.rigidBody.setLinearVelocity(v3(0, y));
            return;
        }

        const targetWaypoint = this.currentPath[this.currentPathIndex];
        const targetPosition = this.currentPosPath[this.currentPathIndex];

        // 计算方向向量
        const direction = targetPosition.clone().subtract(this.core.worldPosition).normalize();
        const speed = this.isChasing ? this.chaseSpeed : this.normalSpeed;
        // 计算目标线性速度
        let targetVelocity = direction.multiplyScalar(speed);
        targetVelocity.y = y;
        this.rigidBody.setLinearVelocity(targetVelocity);
        // 计算Y轴旋转角度（仅绕Y轴旋转）
        const angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
        // 保持X轴为0，Z轴不变，仅设置Y轴旋转
        this.node.setRotationFromEuler(0, angle, 0);

        // 检查是否到达当前路点
        const distanceToWaypoint = Vec3.distance(this.core.worldPosition, targetPosition);
        if (distanceToWaypoint <= this.waypointReachDistance) {
            // 获取玩家身上的路点组件
            // const playerWaypointComponent = this.player.getComponent(LBL_Waypoint);
            // if (targetWaypoint !== playerWaypointComponent)
            //     this.currentWaypoint = targetWaypoint;
            this.currentPathIndex++;

            this.lastPoint = targetWaypoint;
            // 更新当前目标路点为下一个
            this.targetWaypoint = this.currentPathIndex < this.currentPath.length
                ? this.currentPath[this.currentPathIndex]
                : null;
        }
    }

    // 处理门交互
    private handleDoorInteraction() {
        if (this.currentDoor) {
            // 检查门是否已经打开
            if (this.currentDoor.IsOpen) {
                // 门已打开，继续移动
                this.currentDoor = null;
            }
            return;
        }

        // 发射射线检测前方的门
        let origin = this.core.worldPosition.clone();
        origin.y += 1; // 稍微抬高射线起点
        let end = this.node.forward.clone()

        const ray = geometry.Ray.create(origin.x, origin.y, origin.z, end.x, end.y, end.z);

        if (PhysicsSystem.instance.raycast(ray)) {
            const results = PhysicsSystem.instance.raycastResults;
            for (const result of results) {
                const door = result.collider.getComponent(LBL_Door);
                if (door && !door.IsOpen) {
                    // 找到关闭的门，停止移动并开门
                    this.currentDoor = door;
                    if (this.rigidBody) {
                        this.rigidBody.setLinearVelocity(Vec3.ZERO);
                    }
                    door.openDoor();
                    break;
                }
            }
        }
    }

    // 找到最近的路点
    private findNearestWaypoint() {
        if (this.allWaypoints.length === 0) return;

        let nearest: LBL_Waypoint | null = null;
        let nearestDistance = Number.MAX_VALUE;

        this.allWaypoints.forEach(waypoint => {
            const distance = Vec3.distance(this.core.worldPosition, waypoint.node.worldPosition);
            if (distance < nearestDistance) {
                nearest = waypoint;
                nearestDistance = distance;
            }
        });

        this.currentWaypoint = nearest;
    }

    // 找到指定位置最近的路点
    private findNearestWaypointToPosition(position: Vec3): LBL_Waypoint | null {
        if (this.allWaypoints.length === 0) return null;

        let nearest: LBL_Waypoint | null = null;
        let nearestDistance = Number.MAX_VALUE;

        this.allWaypoints.forEach(waypoint => {
            const distance = Vec3.distance(position, waypoint.node.worldPosition);
            if (distance < nearestDistance) {
                nearest = waypoint;
                nearestDistance = distance;
            }
        });

        return nearest;
    }

    // 找到指定楼层最近的楼梯
    private findNearestStairway(floor: number): LBL_Waypoint | null {
        const stairsOnFloor = this.allWaypoints.filter(w => w.isStair && w.floor === floor);

        if (stairsOnFloor.length === 0) return null;

        let nearestStair: LBL_Waypoint | null = null;
        let nearestDistance = Number.MAX_VALUE;

        stairsOnFloor.forEach(stair => {
            const distance = Vec3.distance(this.core.worldPosition, stair.node.worldPosition);
            if (distance < nearestDistance) {
                nearestStair = stair;
                nearestDistance = distance;
            }
        });

        return nearestStair;
    }
}
