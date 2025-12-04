import { _decorator, AudioClip, AudioSource, Collider, Component, director, ICollisionEvent, ITriggerEvent, Material, math, Node, RigidBody, SkeletalAnimation, SpriteFrame, tween, v3, Vec3 } from 'cc';
import { JJTW_ScanSysem } from './JJTW_ScanSysem';
import { JJTW_ColliderGroupNumber, JJTW_ColliderGroupType } from './JJTW_ColliderGroupNumber';
import { JJTW_DataManager } from './JJTW_DataManager';
import { JJTW_GameUI } from './JJTW_GameUI';
import { JJTW_NPCAICtrl } from './JJTW_NPCAICtrl';
import { JJTW_PlayerController } from './JJTW_PlayerController';
const { ccclass, property } = _decorator;

// 怪物状态枚举
enum JJTW_MonsterState {
    IDLE = "idle",       // 闲置
    WANDER = "wander",   // 游荡
    CHASE = "chase",     // 追击
    PATHFIND = "pathfind" // 寻路中
}

// 路径跟随配置
interface JJTW_PathFollowConfig {
    currentPointIndex: number; // 当前路径点索引
    pathPoints: Vec3[]; // 路径点数组
    arrivedThreshold: number; // 到达判定阈值
}

@ccclass('JJTW_MonsterAI')
export class JJTW_MonsterAI extends Component {

    @property(JJTW_GameUI)
    GameUI:JJTW_GameUI;

   @property({ type: JJTW_ScanSysem, tooltip: "扫描系统实例" })
    private scanSystem: JJTW_ScanSysem = null;
    
    @property({ type: Number, tooltip: "移动速度" })
    private moveSpeed: number = 2;

    @property({ type: Number, tooltip: "路径点到达阈值" })
    private arrivedThreshold: number = 0.3;

    @property({ type: Collider, tooltip: "小碰撞器（检测障碍物/玩家接触）" })
    private smallCollider: Collider = null;

    @property({ type: Collider, tooltip: "大碰撞器（检测玩家范围）" })
    private largeCollider: Collider = null;

    @property({ type: Node })
    private player: Node = null;

    @property({ type: Node })
    private NpcNodes: Node[] = [];

    @property({ type: AudioClip })
    private clip: AudioClip = null;
    

    private distanceRange: number = 8;

    private anim: SkeletalAnimation;


    private rigidbody: RigidBody = null;

    private wanderWaitTime: number = 3;

    private time: number = 0;

    // 状态管理
    private currentState: JJTW_MonsterState = JJTW_MonsterState.IDLE;
    private targetPlayer: Node = null; // 目标玩家
    private lastPlayerPos: Vec3 = null; // 记录的玩家位置
    private isSameLayerWithPlayer: boolean = false; // 是否与玩家同层


    // 游荡数据
    private wanderTargetPoint: Vec3 = null;
    private wanderWaitTimer: number = 0;

    // 障碍物标记
    private isObstacleHit: boolean = false;

    private isHitDoor:boolean = false;

    // 新增卡死检测属性
    private stuckTimer: number = 0;
    private lastPosition: Vec3 = v3();
    
    // 路径跟随数据
    private pathFollow: JJTW_PathFollowConfig = {
        currentPointIndex: 0,
        pathPoints: [],
        arrivedThreshold: 0.3
    };

    private isHitPeople:boolean = false;

          // 游荡路径生成相关
    private isGeneratingWanderPath: boolean = false;
    private wanderTryCount: number = 0;
    private maxWanderTryCount: number = 10;

    private canGoPoses:Vec3[]=[];

    private isHaveTarget:boolean = false;

    private wanderedPoses:Vec3[]= [];

    update(deltaTime: number) {
        if(JJTW_DataManager.Instance.isGameStart && ! this.isHitPeople){
        // 卡死检测（在所有状态生效）
            this.checkStuck(deltaTime);
                // this.findPlayerAndNPC();
            switch (this.currentState) {
                case JJTW_MonsterState.WANDER:
                    // this.updateWander(deltaTime);
                    this.updateWanderPath(deltaTime);
                    break;
                case JJTW_MonsterState.CHASE:
                    // this.updateChase(deltaTime);
                    this.updateRunPath(deltaTime);
                    break;
                case JJTW_MonsterState.PATHFIND:
                    // this.updatePathfinding(deltaTime);
                    break;
            }
        }
    }

    

    start(){
        this.anim = this.node.getComponent(SkeletalAnimation);

        this.rigidbody = this.node.getComponent(RigidBody);
        // this.startWander();
        this.initColliders();
        this.switchState(JJTW_MonsterState.WANDER); // 初始进入游荡状态
           this.schedule(this.changeState,3)
    }

    private changeState(){
        if(this.isHaveTarget){
            this.switchState(JJTW_MonsterState.CHASE);
        }
        else{
            this.switchState(JJTW_MonsterState.WANDER);
        }
    }
    // 初始化碰撞器监听
    private initColliders() {
        // 大碰撞器：检测玩家进入范围
        this.largeCollider.on("onTriggerEnter", this.onPlayerDetected, this);
        this.largeCollider.on("onTriggerExit", this.onPlayerLost, this);

        // 小碰撞器：检测障碍物和玩家接触
        this.smallCollider.on("onCollisionEnter", this.onSmallColliderContact, this);
    }



    // 状态切换
    private switchState(newState: JJTW_MonsterState) {
        this.currentState = newState;
        switch (newState) {
            case JJTW_MonsterState.WANDER:
                ////console.log("进入游荡模式")
                // this.anim.play("walk");
                // this.startWander();
                this.setWanderPath();
                break;
            case JJTW_MonsterState.CHASE:
                ////console.log("进入追击模式")
                this.setRunPath()
                // this.anim.play("run");
                break;
            case JJTW_MonsterState.PATHFIND:
                ////console.log("进入寻路模式")

                // this.anim.play("walk");
                break;
        }
    }

     // ------------------------ 追击检测 ------------------------


    // // 新增目标检测方法
    //     private findPlayerAndNPC() {
    //         this.time++;
    //         if(this.time % 5 == 0){
    //             this.time  = 0 + math.random() * 5;

    //                 // 情况3：无目标时检测新目标
    //                 if(this.currentState == JJTW_MonsterState.WANDER){
    //                 ////console.log("游荡中检测距离");

    //                 // if (!this.targetPlayer) {
    //                     let nearestTarget: Node = null;
    //                     let minDistance = Infinity;

    //                     // 检测玩家
    //                     const playerDistance = Vec3.distance(
    //                         this.node.worldPosition,
    //                         this.player.worldPosition
    //                     );
    //                     if (playerDistance <= this.distanceRange) {
    //                         nearestTarget = this.player;
    //                         minDistance = playerDistance;
    //                     }

    //                     // 检测NPC
    //                     for (const npc of this.NpcNodes) {
    //                         const npcDistance = Vec3.distance(
    //                             this.node.worldPosition,
    //                             npc.worldPosition
    //                         );
    //                         if (npcDistance <= this.distanceRange && npcDistance < minDistance) {
    //                             nearestTarget = npc;
    //                             minDistance = npcDistance;
    //                         }
    //                     }

    //                     if (nearestTarget) {
    //                         ////console.log("发现新目标，转为追击模式:", nearestTarget.name);
    //                         this.targetPlayer = nearestTarget;
    //                         this.switchState(JJTW_MonsterState.CHASE);
    //                     }
    //                 // }
    //             }

    //             // 情况1：已有追踪目标且未记录最后位置
    //             if(this.currentState == JJTW_MonsterState.CHASE){
    //                 ////console.log("追击中检测距离");
    //                 // if (this.targetPlayer && !this.lastPlayerPos) {
    //                     const currentDistance = Vec3.distance(
    //                         this.node.worldPosition,
    //                         this.targetPlayer.worldPosition
    //                     );
                        
    //                     if (currentDistance > this.distanceRange) {
    //                         ////console.log("目标超出追踪范围");
    //                         this.resetTracking();
    //                         this.switchState(JJTW_MonsterState.WANDER);
    //                     }
    //                     return;
    //                 // }
    //             }

     
                
    //             // // 情况2：到达最后记录位置后检测
    //             // if (this.targetPlayer && this.lastPlayerPos) {
    //             //     const arrived = Vec3.distance(
    //             //         this.node.worldPosition,
    //             //         this.lastPlayerPos
    //             //     ) <= this.arrivedThreshold;

    //             //     if (arrived) {
    //             //         const newDistance = Vec3.distance(
    //             //             this.node.worldPosition,
    //             //             this.targetPlayer.worldPosition
    //             //         );
                        
    //             //         if (newDistance > this.distanceRange) {
    //             //             ////console.log("目标最终超出范围");
    //             //             this.resetTracking();
    //             //             this.switchState(JJTW_MonsterState.WANDER);
    //             //         } else {
    //             //             this.lastPlayerPos = null; // 重置最后位置
    //             //             this.switchState(JJTW_MonsterState.CHASE);
    //             //         }
    //             //     }
    //             //     return;
    //             // }    
    //         }
    //     }

     // ------------------------ 卡死检测 ------------------------

    
    // 新增卡死检测方法
    private checkStuck(deltaTime: number) {
        const currentPos = this.node.worldPosition;
        
        // 位置变化小于阈值视为卡死
        if (Vec3.distance(currentPos, this.lastPosition) < 0.2) {
            this.stuckTimer += deltaTime;
            
            if (this.stuckTimer >= 3.5) {
                this.stuckTimer = 0
                //console.warn("检测到卡死，重置状态");
                this.resetTracking();
                this.switchState(JJTW_MonsterState.WANDER);
            }
        } else {
            this.stuckTimer = 0;
            this.lastPosition = currentPos.clone();
        }
    }

    // 重置追踪信息
    private resetTracking() {
        // this.targetPlayer = null;
        this.lastPlayerPos = null;
        this.pathFollow.pathPoints = [];
        this.largeCollider.enabled = true;
    }


     // ------------------------ 游荡模式 ------------------------
    //  private startWander() {
    //     // 随机选择中转点
    //     let path = null;
    //     while (!path || path.length === 0) {
    //         this.wanderTargetPoint = this.getRandomRoadPoint();
    //         if (this.wanderTargetPoint) {
    //             path = this.scanSystem.generatePath(
    //                 this.node.worldPosition,
    //                 this.wanderTargetPoint,
    //                 false,
    //                 false
    //             );
    //         }
    //     }
    //     this.node.setWorldPosition(path[0].position);
    //     this.setPath(path.map(p => p.position));
    //     // this.wanderTargetPoint = this.getRandomRoadPoint() ;

    //     // if (this.wanderTargetPoint) {
    //     //     // 生成到中转点的路径
    //     //     path = this.scanSystem.generatePath(
    //     //         this.node.worldPosition,
    //     //         this.wanderTargetPoint,
    //     //         true
    //     //     );

    //     // }
    // }

    private startWander() {
        // // 随机选择中转点
        // let path = null;
        // while (!path || path.length === 0) {
        //     this.wanderTargetPoint = this.getRandomRoadPoint();
        //     if (this.wanderTargetPoint) {
        //         path = this.scanSystem.generatePath(
        //             this.node.worldPosition,
        //             this.wanderTargetPoint,
        //             true,
        //             false
        //         );
        //     }
        // }
        // this.node.setWorldPosition(path[0].position);
        // this.setPath(path.map(p => p.position));
        // // this.wanderTargetPoint = this.getRandomRoadPoint() ;

        // // if (this.wanderTargetPoint) {
        // //     // 生成到中转点的路径
        // //     path = this.scanSystem.generatePath(
        // //         this.node.worldPosition,
        // //         this.wanderTargetPoint,
        // //         true
        // //     );

        // // }
            // 设置游荡状态标志
    this.isGeneratingWanderPath = true;
    this.wanderTryCount = 0;
    this.maxWanderTryCount = 20; // 最大尝试次数，避免无限循环
    
    // 初始尝试生成路径
    this.tryGenerateWanderPath();
    }

xunlu = false;
// 分帧尝试生成游荡路径
private tryGenerateWanderPath() {
    if(this.xunlu)return;
    this.xunlu = true;
    //console.log("尝试生成游荡路径")
    if (this.wanderTryCount >= this.maxWanderTryCount) {
        // 达到最大尝试次数，放弃并恢复游荡
        this.isGeneratingWanderPath = false;
        //console.warn("无法找到有效的游荡路径");
   // 如果没有找到有效路径，安排下一帧继续尝试
    this.scheduleOnce(() => {
        this.xunlu = false;
    }, 5 * Math.random());
        return;
    }
    
    this.wanderTryCount++;
    this.wanderTargetPoint = this.getRandomRoadPoint();
    
    if (this.wanderTargetPoint) {
        const path = this.scanSystem.generatePath(
            this.node.worldPosition,
            this.wanderTargetPoint,
            false,
            false
        );
        
        if (path && path.length > 0) {
            // 找到有效路径，设置路径并清除生成标志
            this.node.setWorldPosition(path[0].position);
            this.setPath(path.map(p => p.position));
            this.isGeneratingWanderPath = false;
            this.canGoPoses.push(this.wanderTargetPoint);
   // 如果没有找到有效路径，安排下一帧继续尝试
    this.scheduleOnce(() => {
        this.xunlu = false;
    }, 5 * Math.random());
            return;
        }
    }
    if(this.canGoPoses.length > 0){
          this.wanderTargetPoint = this.canGoPoses[Math.floor(Math.random() * this.canGoPoses.length)];
        const path = this.scanSystem.generatePath(
            this.node.worldPosition,
            this.wanderTargetPoint,
            false,
            false
        );
        
        if (path && path.length > 0) {
            // 找到有效路径，设置路径并清除生成标志
            this.node.setWorldPosition(path[0].position);
            this.setPath(path.map(p => p.position));
            this.isGeneratingWanderPath = false;
            this.canGoPoses.push(this.wanderTargetPoint);
   // 如果没有找到有效路径，安排下一帧继续尝试
    this.scheduleOnce(() => {
        this.xunlu = false;
    }, 5 * Math.random());
            return;
        }
    }
      
   // 如果没有找到有效路径，安排下一帧继续尝试
    this.scheduleOnce(() => {
        this.xunlu = false;
    }, 5 * Math.random());
}


    // 随机获取中转点
    private getRandomRoadPoint(): Vec3 {
        const roadPoints = this.scanSystem.roadPoints; // 获取扫描系统中的中转点
        if (roadPoints.length === 0) return null;
        
        // 排除当前位置附近的点
       let validPoints = roadPoints.filter(point => 
            Vec3.distance(this.node.worldPosition, point) > this.arrivedThreshold
        );

        if(!JJTW_DataManager.Instance.isDownStairDoorOpen && !JJTW_DataManager.Instance.isUpStairDoorOpen) {
            let floorNum = this.scanSystem.getFloorByPos(this.node.worldPosition)
            validPoints = validPoints.filter(point => {
                return this.scanSystem.isSameLayerWithTargetLayer(point,floorNum);
                // return point.y > 0;
           })
        }
        
        
        return validPoints.length > 0 
            ? validPoints[Math.floor(Math.random() * validPoints.length)] 
            : roadPoints[Math.floor(Math.random() * roadPoints.length)];
    }
    
        private updateWander(deltaTime: number) {
        // 路径跟随中
        if (this.pathFollow.pathPoints.length > 0) {
            this.followPath(deltaTime);
            return;
        }

        // 到达目标点后等待
        this.wanderWaitTimer += deltaTime;
        const currentState = this.anim.getState('idle');
        if (!currentState?.isPlaying) {
            this.anim.crossFade('idle', 0.2);
        }
        if (this.wanderWaitTimer >= this.wanderWaitTime) {
            this.wanderWaitTimer = 0;
            this.startWander(); // 切换下一个游荡点
        }
    }



    // ------------------------ 追击模式 ------------------------
    // 检测到玩家
    private onPlayerDetected(event: ITriggerEvent) {
        ////console.log("大碰撞器开启监听"+event.otherCollider);
        let groupType = event.otherCollider.node.getComponent(JJTW_ColliderGroupNumber)?.groupType;
        if(groupType /* && !this.targetPlayer */){
            let group1 = event.otherCollider.node.getComponent(JJTW_ColliderGroupNumber)?.groupType == JJTW_ColliderGroupType.Player_Collider;
            let group2 = event.otherCollider.node.getComponent(JJTW_ColliderGroupNumber)?.groupType == JJTW_ColliderGroupType.NPC_Collider;
            if(group1) {
                ////console.log("检测到玩家")
                this.targetPlayer = event.otherCollider.node;
                this.isHaveTarget = true;
                // this.isSameLayerWithPlayer = this.scanSystem.isSameLayer(
                //     this.node.worldPosition,
                //     this.targetPlayer.worldPosition
                // );
                // this.switchState(JJTW_MonsterState.CHASE);
            }
            else if(group2){
                ////console.log("检测到NPC")
                this.targetPlayer = event.otherCollider.node;
                this.isHaveTarget = true;

                // this.isSameLayerWithPlayer = this.scanSystem.isSameLayer(
                //     this.node.worldPosition,
                //     this.targetPlayer.worldPosition
                // );
                // this.switchState(JJTW_MonsterState.CHASE);
            }
        } 
    }
      

    //     if (event.otherCollider.node.name === "Player" && !this.targetPlayer) {
    //         this.targetPlayer = event.otherCollider.node;
    //         this.isSameLayerWithPlayer = this.scanSystem.isSameLayer(
    //             this.node.worldPosition,
    //             this.targetPlayer.worldPosition
    //         );
    //         this.switchState(JJTW_MonsterState.CHASE);
    //     }
    // }

    // 失去玩家检测
    private onPlayerLost(event: ITriggerEvent) {
        if (this.targetPlayer && event.otherCollider.node === this.targetPlayer) {
            // 仅在追击模式下处理
            if (this.currentState === JJTW_MonsterState.CHASE) {
                // this.targetPlayer = null;
                this.isHaveTarget = false;
                // this.switchState(JJTW_MonsterState.WANDER);
                // this.lastPlayerPos = this.targetPlayer.worldPosition.clone();
                // this.startPathfindingToTarget(this.lastPlayerPos);
            }
        }
    }

    // 小碰撞器接触检测
    private onSmallColliderContact(event: ICollisionEvent) {
            // 检测到障碍物
            const findRoadTypes = [
                JJTW_ColliderGroupType.Wall,
                JJTW_ColliderGroupType.Barrier,
            ];

            // 检测到障碍物
            const doorTypes = [
                JJTW_ColliderGroupType.Wall,
                JJTW_ColliderGroupType.Barrier,
                JJTW_ColliderGroupType.Door_1,
                JJTW_ColliderGroupType.Door_2,
                JJTW_ColliderGroupType.Door_3,
                JJTW_ColliderGroupType.Door_4,
                JJTW_ColliderGroupType.Door_5,
                JJTW_ColliderGroupType.Door_6,
                JJTW_ColliderGroupType.Door_Normal,
                JJTW_ColliderGroupType.Door_Exit,
                JJTW_ColliderGroupType.Door_Stair_1,
                JJTW_ColliderGroupType.Door_Stair_2,
            ];
        
         // 检测到障碍物（墙壁/障碍）
         const colliderGroup = event.otherCollider.node.getComponent(JJTW_ColliderGroupNumber);
         if(colliderGroup){
            //
            if(colliderGroup.groupType == JJTW_ColliderGroupType.Player_Collider){
                    
                let playCtrl = event.otherCollider.node.getComponent(JJTW_PlayerController);
                tween(this.node)
                .call(()=>{
                    this.isHitPeople = true;

                    this.getComponent(AudioSource).playOneShot(this.clip,0.5);
    
                    const currentState = this.anim.getState('end');
                    if (!currentState?.isPlaying) {
                        this.anim.crossFade('end', 0.2);
                    }
                    playCtrl?.setPlayerDead();
                })
                .delay(2)
                .call(()=>{
                    this.isHitPeople = false;
                    this.resetTracking();
                    this.switchState(JJTW_MonsterState.WANDER);
                })
                .start()
             
                ////console.log("撞到玩家了，游戏结束"
              } 
              else if(colliderGroup.groupType == JJTW_ColliderGroupType.NPC_Collider){
                ////console.log("撞到NPC了，NPC出局")
                // const currentState = this.anim.getState('end');
                // if (!currentState?.isPlaying) {
                    this.anim.crossFade('end', 0.2);
                // }
                let NPCAIComp = event.otherCollider.node.getComponent(JJTW_NPCAICtrl);
                if(NPCAIComp){
                    NPCAIComp.setNPCDead();
                }

                this.resetTracking();
                this.switchState(JJTW_MonsterState.WANDER);

                JJTW_DataManager.Instance.liveNPCData[parseInt(event.otherCollider.node.name.split("_")[1])-1].isDead = true;
                this.GameUI.updateNPCUI();
              }
              else if ( findRoadTypes.includes(colliderGroup.groupType)) {
                // 记录障碍物
                  ////console.log("撞到障碍物了");
                  const currentState = this.anim.getState('idle');
                  if (!currentState?.isPlaying) {
                      this.anim.crossFade('idle', 0.2);
                  }
                  this.isObstacleHit = true;
              }
              else if(doorTypes.includes(colliderGroup.groupType)){
                const currentState = this.anim.getState('idle');
                if (!currentState?.isPlaying) {
                    this.anim.crossFade('idle', 0.2);
                }
                ////console.log("撞到门了");
                this.isHitDoor = true;
                this.isHitDoor = false;
                // 无路径时恢复游荡
                this.resetTracking();
                this.switchState(JJTW_MonsterState.WANDER);
                return;
              }
         }
    }


    private updateChase(deltaTime: number) {
        if (!this.targetPlayer) return;

        
        // 检测是否与玩家同层
        this.isSameLayerWithPlayer = this.scanSystem.isSameLayer(
            this.node.worldPosition,
            this.targetPlayer.worldPosition
        );

        // 有障碍物或不同层时启动寻路
        if (this.isObstacleHit || !this.isSameLayerWithPlayer) {
            this.lastPlayerPos = this.targetPlayer.worldPosition.clone();
            this.isObstacleHit = false; // 重置障碍物标记
            ////console.log("追击中(需要寻路/无路)：",this.targetPlayer.name)
            this.startPathfindingToTarget(this.lastPlayerPos);
            return;
        }
        // else if(this.isHitDoor){
        //     this.isHitDoor = false;
        //         // 无路径时恢复游荡
        //         this.resetTracking();
        //         this.switchState(JJTW_MonsterState.WANDER);
        //         return;
        // }

        // 同层无障碍物 - 直线追击
        ////console.log("追击中（无需中转）：",this.targetPlayer.name)
        this.moveToTarget(this.targetPlayer.worldPosition, deltaTime);
    }
    
    // ------------------------ 寻路模式 ------------------------
    private startPathfindingToTarget(targetPos: Vec3) {
        // 关闭大碰撞器避免寻路中重复检测
        this.largeCollider.enabled = false;
        
        // 判断是否需要先到楼梯
        const isSameLayer = this.scanSystem.isSameLayer(this.node.worldPosition, targetPos);
        let pathPoints: Vec3[] = [];

        if (!isSameLayer) {
            // 不同层：先到楼梯再到目标
            const stairPoint = this.getStairPointForDifferentLayer(targetPos);
            if (stairPoint) {
                // 生成到楼梯的路径
                const stairPath = this.scanSystem.generatePath(this.node.worldPosition, stairPoint,false);
                if (stairPath.length > 0) {
                    pathPoints = pathPoints.concat(stairPath.map(p => p.position));
                    
                    // 生成从楼梯到目标的路径
                    const targetPath = this.scanSystem.generatePath(stairPoint, targetPos,false,false);
                    pathPoints = pathPoints.concat(targetPath.map(p => p.position).slice(1)); // 去重
                }
            }
        } else {
            // 同层：直接生成到目标的路径
            const path = this.scanSystem.generatePath(this.node.worldPosition, targetPos,false,false);
            pathPoints = path.map(p => p.position);
        }

        if (pathPoints.length > 0) {
            this.setPath(pathPoints);
            this.switchState(JJTW_MonsterState.PATHFIND);
        } else {
            // 无路径时恢复游荡
            this.targetPlayer = null;
            this.largeCollider.enabled = true;
            this.switchState(JJTW_MonsterState.WANDER);
        }
    }

    private updatePathfinding(deltaTime: number) {
        // 路径跟随中
        if (this.pathFollow.pathPoints.length > 0) {
            this.followPath(deltaTime);
            return;
        }

        // 寻路完成 - 重新开启玩家检测
        this.largeCollider.enabled = true;
        this.targetPlayer = null; // 清除目标，等待重新检测
        this.switchState(JJTW_MonsterState.WANDER);
    }

    //获取跨层所需的楼梯点
    private getStairPointForDifferentLayer(targetPos: Vec3): Vec3 {
        const myY = this.node.worldPosition.y;
        const targetY = targetPos.y;
        const middleY = this.scanSystem["middlePoint"].y;

        // 玩家在下层，我在上层 → 去bottom
        if (myY > middleY && targetY < middleY) {
            return this.scanSystem["bottomPoint"];
        }
        // 玩家在上层，我在下层 → 去top
        else if (myY < middleY && targetY > middleY) {
            return this.scanSystem["topPoint"];
        }
        // 在中层 → 根据目标方向选择楼梯
        else {
            return targetY > middleY ? this.scanSystem["topPoint"] : this.scanSystem["bottomPoint"];
        }
    } 



    // ------------------------ 移动控制 ------------------------
    // 设置路径
    private setPath(points: Vec3[]) {
        this.pathFollow.pathPoints = points;
        this.pathFollow.currentPointIndex = 0;
    }

    // 跟随路径移动
    private followPath(deltaTime: number) {
        if (this.pathFollow.currentPointIndex >= this.pathFollow.pathPoints.length) {
            this.pathFollow.pathPoints = []; // 清空路径表示完成
            return;
        }

        if(!this.isHitPeople){
            const currentState = this.anim.getState('walk');
            if (!currentState?.isPlaying) {
                this.anim.crossFade('walk', 0.2);
            }
        }

        const targetPoint = this.pathFollow.pathPoints[this.pathFollow.currentPointIndex];
        this.moveToTarget(targetPoint, deltaTime);

        // 检查是否到达当前路径点
        if (Vec3.distance(this.node.worldPosition, targetPoint) <= this.arrivedThreshold) {
            this.pathFollow.currentPointIndex++;
        }
    }
// 移动到目标点（使用线性速度）
    private moveToTarget(targetPos: Vec3, deltaTime: number) {
        // 计算方向向量
        const direction = targetPos.clone().subtract(this.node.worldPosition).normalize();
        
        // 计算目标线性速度
        const targetVelocity = direction.multiplyScalar(this.moveSpeed);




        // 设置节点的线性速度（假设使用的物理系统有rigidbody组件）
        // 这里假设节点有刚体组件，命名为rigidbody
        if (this.rigidbody) {
            this.rigidbody.setLinearVelocity(targetVelocity);
            // 计算Y轴旋转角度（仅绕Y轴旋转）
            const angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
            // 保持X轴为0，Z轴不变，仅设置Y轴旋转
            this.node.setRotationFromEuler(0, angle, 0);
            // ////console.log("MonsterWorldPos",this.node.getWorldPosition())
        } else {
            // 如果没有刚体组件，作为备选方案仍使用位置更新
            const moveStep = direction.multiplyScalar(this.moveSpeed * deltaTime);
            this.node.worldPosition = this.node.worldPosition.clone().add(moveStep);
        }
        
        // // 转向目标
        // if (direction.length() > 0.1) {
        //     const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
        //     this.node.setRotationFromEuler(0, 0, angle);
        // }
    }


    
    private setWanderPath(){
        let poses:Vec3[] = []
        for(let i = 0; i < this.scanSystem.roadPoints.length; i++){
            let pos = this.scanSystem.roadPoints[i];
            let dis = Vec3.distance(this.node.worldPosition,pos);
            if(dis <0.5){
                continue;
            }
            if(!this.scanSystem.checkObstacle(this.node.worldPosition,pos,false)){
             poses.push(pos);
            }
        }

        // poses.push(this.scanSystem.topPoint);
        // poses.push(this.scanSystem.bottomPoint);

        let distance = 1000000000;
        let targetPos = poses[0];
        for(let i = 0; i < poses.length; i++){
            let pos = poses[i];

            if(!this.scanSystem.isSameLayer(this.node.worldPosition,pos)){
                if(!JJTW_DataManager.Instance.isUpStairDoorOpen && !JJTW_DataManager.Instance.isDownStairDoorOpen){
                    continue;
                }
            }

            if(this.wanderedPoses.indexOf(pos) != -1){
                continue;
            }
            
            let dis = Vec3.distance(this.node.worldPosition,pos);
            if(dis < distance){
                distance = dis;
                targetPos = pos;
            }
        }

        if(targetPos){
            let Points:Vec3[] = [targetPos];

            if(Vec3.distance(this.node.worldPosition,this.scanSystem.topPoint) < 0.2){
                Points.push(this.scanSystem.bottomPoint);
            }
            if(Vec3.distance(this.node.worldPosition,this.scanSystem.bottomPoint) < 0.2){
                Points.push(this.scanSystem.topPoint);
            }

            let targetPos2 = Points[Math.floor(Math.random() * Points.length)];

            if(targetPos2 == this.scanSystem.bottomPoint && !this.scanSystem.isSameLayer(this.node.worldPosition,targetPos2)){
                let path = [this.node.worldPosition,this.scanSystem.middlePoint,this.scanSystem.bottomPoint];
                this.setPath(path);
                return;
            }
            else if(targetPos2 == this.scanSystem.topPoint && !this.scanSystem.isSameLayer(this.node.worldPosition,targetPos2)){
                let path = [this.node.worldPosition,this.scanSystem.middlePoint,this.scanSystem.topPoint];
                this.setPath(path);
                return;
            }

            this.wanderedPoses.push(targetPos);
            if(this.wanderedPoses.length > 3){
                this.wanderedPoses.shift();
            }

           let path = [this.node.worldPosition,targetPos];
            this.setPath(path);
        }
        else{
            let path = [this.node.worldPosition,poses[Math.floor(Math.random() * poses.length)]];
            this.setPath(path);
        }

        // this.scanSystem.checkObstacle()
    }


    private setRunPath(){
        // if(this.isRuning) return;
        // this.isRuning = true;

        if(!this.scanSystem.checkObstacle(this.node.worldPosition,this.targetPlayer.worldPosition,false)){
            let path = [this.node.worldPosition,this.targetPlayer.worldPosition];
            this.setPath(path);
            return;
        }


        let poses:Vec3[] = []
        for(let i = 0; i < this.scanSystem.roadPoints.length; i++){
            let pos = this.scanSystem.roadPoints[i];
              if(!this.scanSystem.isSameLayer(this.node.worldPosition,pos)){
                continue;
            }
            if(!this.scanSystem.checkObstacle(this.node.worldPosition,pos,false)){
             poses.push(pos);
            }
        }

        if(Vec3.distance(this.node.worldPosition,this.scanSystem.topPoint) < 0.2){
            poses.push(this.scanSystem.bottomPoint);
        }
        if(Vec3.distance(this.node.worldPosition,this.scanSystem.bottomPoint) < 0.2){
            poses.push(this.scanSystem.topPoint);
        }

        let distance = 100000;
        let targetPos = poses[0];
        poses.forEach((pos,i)=>{
            let dis = Vec3.distance(this.targetPlayer.worldPosition,pos);
            //    // 计算NPC到怪物的方向向量（单位向量）
            // const npcToMonster = this.targetPlayer.worldPosition.clone().subtract(this.node.worldPosition).normalize();
            // // 计算NPC到候选点的方向向量
            // const npcToPoint = pos.clone().subtract(this.node.worldPosition).normalize();
            // // 点积 < 0 表示方向相反（远离怪物）
            // const isOppositeDirection = Vec3.dot(npcToMonster, npcToPoint) < 0;
            
            // if(!isOppositeDirection){
            //     return;
            // }
            if(dis < distance){
                distance = dis;
                targetPos = pos;
            }
        })
        if(targetPos){
            let path = [this.node.worldPosition,targetPos];
            this.setPath(path);
        }
        else{
            let path = [this.node.worldPosition,poses[Math.floor(Math.random() * poses.length)]];
            this.setPath(path);
        }

    }

    
    private updateWanderPath(deltaTime: number) {
        // 如果正在生成路径，则等待
        // if (this.isGeneratingWanderPath) {
        //     return;
        // }
        
        // 路径跟随中
        if (this.pathFollow.pathPoints.length > 0) {
            this.followPath(deltaTime);
            return;
        }
    
        // 到达目标点后等待
        this.wanderWaitTimer += deltaTime;
        const currentState = this.anim.getState('idle');
        if (!currentState?.isPlaying) {
            this.anim.crossFade('idle', 0.2);
        }
        if (this.wanderWaitTimer >= this.wanderWaitTime) {
            this.wanderWaitTimer = 0;
            this.setWanderPath(); // 切换下一个游荡点
        }
    }

    
    private updateRunPath(deltaTime: number) {
        // 如果正在生成路径，则等待
        // if (this.isGeneratingWanderPath) {
        //     return;
        // }
        
        // 路径跟随中
        if (this.pathFollow.pathPoints.length > 0) {
            this.followPath(deltaTime);
            return;
        }
    
        // // 到达目标点后等待
        // this.wanderWaitTimer += deltaTime;
        // const currentState = this.anim.getState('idle');
        // if (!currentState?.isPlaying) {
        //     this.anim.crossFade('idle', 0.2);
        // }
        // if (this.wanderWaitTimer >= this.wanderWaitTime) {
        //     this.wanderWaitTimer = 0;
            this.setRunPath(); // 切换下一个游荡点
        // }
    }
}


