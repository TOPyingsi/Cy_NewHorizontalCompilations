import { _decorator, Component, Node, Vec3, Quat, find, PhysicsSystem, Collider, RigidBody, director, Tween, tween, geometry, v3, SkeletalAnimation, ICollisionEvent, ITriggerEvent } from 'cc';
const { ccclass, property } = _decorator;
import { TKJWL_Waypoint } from './TKJWL_Waypoint';
import { TKJWL_PathManager } from './TKJWL_PathManager';

import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
import { TKJWL_Door } from '../Items/TKJWL_Door';
import { TKJWL_Physics_Group } from '../../Common/TKJWL_PHY_GROUP';
import { TKJWL_AudioManager } from '../../Manager/TKJWL_AudioManager';

@ccclass('TKJWL_MonsterController1')
export class TKJWL_MonsterController1 extends Component {
    @property(Node)
    core: Node = null;

    detectionRange = 1000; // 检测范围

    speed = 0;
    chaseSpeed = 3; // 追逐速度
    normalSpeed = 3; // 正常移动速度

    waypointReachDistance = 0.5; // 到达路点的判定距离

    floorHeight = 3; // 每层楼的高度

    // @property(Node)
    // allWaypointsParent: Node = null; // 场景中所有路点

    // @property({ visible: false })
    // currentFloor = 1; // 当前所在楼层
    // @property(TKJWL_Waypoint)
    currentWaypoint: TKJWL_Waypoint | null = null; // 当前所在路点

    // 当前目标路点，怪物正前往的路点
    private targetWaypoint: TKJWL_Waypoint | null = null;

    allWaypoints: TKJWL_Waypoint[] = []; // 所有路点数组

    private currentPath: TKJWL_Waypoint[] = []; // 当前路径
    private currentPosPath: Vec3[] = []; // 当前路径的位置数组

    private currentPathIndex = 0; // 当前路径索引
    private isChasing = false; // 是否正在追逐
    private isProcessingPath = false; // 是否正在处理路径
    private currentDoor: TKJWL_Door | null = null; // 当前正在处理的门
    private rigidBody: RigidBody | null = null; // 刚体组件
    private pathUpdateInterval = 1; // 路径更新间隔（秒）
    private lastPathUpdateTime = 0; // 上次路径更新时间

    lastPoint: TKJWL_Waypoint;

    spine:SkeletalAnimation = null;

    collider:Collider = null;
    doorChecker:Collider = null;

    initWorldPos:Vec3 = null;

    initRotationFromEuler:Vec3 = null;

    isContactPlayer:boolean = false;

    private startPlotLogic = false;
    private isOpeningDoor = false;
    private isIdle = false;
    private needCheckPlayer = false;
    private isFinding = false;
    private isRun = true;

    private pathEndCb:()=>void = null;


    onLoad() {
        this.addListener();
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

        if (!this.doorChecker) {
            this.doorChecker = this.node.getChildByName("doorChecker").getComponent(Collider);
        }

        if (!this.initWorldPos) {
            this.initWorldPos = this.node.worldPosition.clone();
        }


        if (!this.initRotationFromEuler) {
            this.initRotationFromEuler = this.node.eulerAngles.clone();
        }

        this.node.active = false;

        // // 确保PathManager存在
        // if (!find('PathManager')) {
        //     const pathManagerNode = new Node('PathManager');
        //     pathManagerNode.addComponent(TKJWL_PathManager);
        //     director.getScene()?.addChild(pathManagerNode);
        // }
    }

    start() {
        // 初始时找到最近的路点
        // this.findNearestWaypoint();
    }

    resetMonster(){
        TKJWL_PathManager.instance.reset();
        // // 重置位置和旋转
        // this.node.setWorldPosition(this.initWorldPos);
        // this.node.setRotationFromEuler(this.initRotationFromEuler); // 重置旋转
        this.startPlotLogic = false;
        this.isOpeningDoor = false;

        // 重置路径相关状态
        this.currentPath = [];
        this.currentPosPath = [];
        this.currentPathIndex = 0;
        this.targetWaypoint = null;
        this.currentWaypoint = this.node.getComponent(TKJWL_Waypoint);
        
        // // 停止移动并重置物理状态
        // if (this.rigidBody) {
        //     this.rigidBody.setLinearVelocity(Vec3.ZERO);
        //     this.rigidBody.setAngularVelocity(Vec3.ZERO);
        // }
        
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
        // TKJWL_PathManager.Instance.reset();
        this.closeCollider();
        this.isContactPlayer = false;
    }

    hideMonsterPlot(monsterId:string){
        if(monsterId == this.node.name.split("_")[1]){
            this.node.active = false;
        }
    }

    setMonsterPlot(){
        if(TKJWL_DataManager.Instance.plotNum.toString() !==this.node.name.split("_")[1])
            return;
        // this.node.setWorldPosition(initPosNode.worldPosition);
        // 修改原代码
        this.resetMonster();
        switch(TKJWL_DataManager.Instance.plotNum){
            case 999:
                TKJWL_DataManager.Instance.hideAllPath();
                TKJWL_DataManager.Instance.showPath(TKJWL_DataManager.Instance.path_plot999);
                this.setPath(TKJWL_DataManager.Instance.path_plot999);

                let setIdle0 = ()=>{
                    // 待机
                    this.rigidBody.setLinearVelocity(v3(0, 0 ,0));
                    const currentState = this.spine.getState('idle');
                    if (!currentState?.isPlaying) {
                        this.spine.crossFade('idle', 0.2);
                    }
                }

                this.pathEndCb = ()=>{
                    // 路径结束后，重置速度和动画
                    setIdle0();      
                    this.node.active = false;      
                    TKJWL_DataManager.Instance.plotNum = 0;
                }
                break;
            case 1:
                TKJWL_DataManager.Instance.hideAllPath();
                TKJWL_DataManager.Instance.showPath(TKJWL_DataManager.Instance.waypoints_plot1);
                 this.allWaypoints = TKJWL_DataManager.Instance.waypoints_plot1;
                break;
            case 2:
                TKJWL_DataManager.Instance.hideAllPath();
                TKJWL_DataManager.Instance.showPath(TKJWL_DataManager.Instance.waypoints_plot1);
                this.allWaypoints = TKJWL_DataManager.Instance.waypoints_plot1;
                break;
            case 3:
                TKJWL_DataManager.Instance.hideAllPath();
                this.isRun = false;
                
                TKJWL_DataManager.Instance.showPath(TKJWL_DataManager.Instance.paths_plot3["0"]);
                this.needCheckPlayer = true;
                this.setPath(TKJWL_DataManager.Instance.paths_plot3["0"]);
                let setIdle = ()=>{
                    // 待机
                    this.rigidBody.setLinearVelocity(v3(0, 0 ,0));
                    const currentState = this.spine.getState('idle');
                    if (!currentState?.isPlaying) {
                        this.spine.crossFade('idle', 0.2);
                    }
                }

                this.pathEndCb = ()=>{
                    this.needCheckPlayer = true;

                    // 路径结束后，重置速度和动画
                    setIdle();      
                    TKJWL_DataManager.Instance.hideAllPath();
                    this.isRun = false;
                    TKJWL_DataManager.Instance.showPath(TKJWL_DataManager.Instance.paths_plot3["1"]);
                    this.setPath(TKJWL_DataManager.Instance.paths_plot3["1"]);
                    this.isIdle = true;
                    this.scheduleOnce(()=>{
                         this.isIdle = false;
                    },1)
                    this.pathEndCb = ()=>{
                        this.needCheckPlayer = true;

                        // 路径结束后，重置速度和动画
                        setIdle(); 
                        TKJWL_DataManager.Instance.hideAllPath();
                        this.isRun = false;
                        TKJWL_DataManager.Instance.showPath(TKJWL_DataManager.Instance.paths_plot3["2"]);
                        this.setPath(TKJWL_DataManager.Instance.paths_plot3["2"]);
                        this.isIdle = true;
                        this.scheduleOnce(()=>{
                            this.isIdle = false;
                        },2)
                        this.pathEndCb = ()=>{
                            //暂停监听
                            this.needCheckPlayer = false;

                            // 路径结束后，重置速度和动画
                            setIdle(); 
                            TKJWL_DataManager.Instance.hideAllPath();
                            this.isRun = false;
                            TKJWL_DataManager.Instance.showPath(TKJWL_DataManager.Instance.paths_plot3["3"]);
                            this.setPath(TKJWL_DataManager.Instance.paths_plot3["3"]);
                            this.isIdle = true;
                            this.scheduleOnce(()=>{
                                this.isIdle = false;
                            },0.2)
                            this.pathEndCb = ()=>{
                                //暂停监听
                                this.needCheckPlayer = false;
                                
                                setIdle(); 
                                TKJWL_DataManager.Instance.hideAllPath();
                                this.isRun = false;
                                TKJWL_DataManager.Instance.showPath(TKJWL_DataManager.Instance.paths_plot3["4"]);
                                this.setPath(TKJWL_DataManager.Instance.paths_plot3["4"]);
                                this.isIdle = true;
                                this.scheduleOnce(()=>{
                                    this.isIdle = false;
                                },2)
                                this.pathEndCb = ()=>{
                                    //恢复监听
                                    this.needCheckPlayer = true;

                                    setIdle(); 
                                    TKJWL_DataManager.Instance.hideAllPath();
                                    this.isRun = false;
                                    TKJWL_DataManager.Instance.showPath(TKJWL_DataManager.Instance.paths_plot3["5"]);
                                    this.setPath(TKJWL_DataManager.Instance.paths_plot3["5"]);
                                    this.isIdle = true;
                                    this.scheduleOnce(()=>{
                                        this.isIdle = false;
                                    },1)
                                    this.pathEndCb = ()=>{
                                        setIdle(); 
                                        this.isIdle = true;
                                    };
                                };
                            };
                        };
                    };
                }
                break;
            case 4:
                this.allWaypoints = TKJWL_DataManager.Instance.waypoints_plot4;
                this.setPath(TKJWL_DataManager.Instance.waypoints_plot4);
                let setIdle2 = ()=>{
                    // 待机
                    this.rigidBody.setLinearVelocity(v3(0, 0 ,0));
                    const currentState = this.spine.getState('idle');
                    if (!currentState?.isPlaying) {
                        this.spine.crossFade('idle', 0.2);
                    }
                }

                this.pathEndCb = ()=>{
                    this.needCheckPlayer = true;

                    // 路径结束后，重置速度和动画
                    setIdle2();      
                    this.isIdle = true;
                    // this.scheduleOnce(()=>{
                    //      this.isIdle = false;
                    // },1)
                }
                break;
        }
       
        this.startPlotLogic = true;
        this.node.active = true;
    }




    openCollider(){
        this.collider.on("onCollisionEnter", this.onColliderContact, this);
        this.doorChecker.on("onTriggerEnter", this.onTriggerEnter, this);
    }

    closeCollider(){
        this.collider.off("onCollisionEnter", this.onColliderContact, this);
        this.doorChecker.off("onTriggerEnter", this.onTriggerEnter, this);
    }


    onTriggerEnter(event: ITriggerEvent) {

          const door = event.otherCollider.node.getComponent(TKJWL_Door);
            if (door && !door.isOpening) {
                // 找到关闭的门，停止移动并开门
                // this.currentDoor = door;
                // if (this.rigidBody) {
                //     this.rigidBody.setLinearVelocity(Vec3.ZERO);
                // }
                // const currentState = this.spine.getState('run');
                // if (!currentState?.isPlaying) {
                //     this.spine.crossFade('pu', 0.2);
                // }

                door.openDoor();

                this.isOpeningDoor = true;
                // this.scheduleOnce(()=>{
                    this.isOpeningDoor = false;
                // },0.2)
                // break;
            }

    }


    onColliderContact(event: ICollisionEvent){
        if(!TKJWL_DataManager.Instance.isGameStart ) return;
         // 检测到障碍物（墙壁/障碍）
         const colliderType = event.otherCollider.node.name;
         if(colliderType == "Player"){
        // 先转向玩家位置
            const playerPos = event.otherCollider.node.worldPosition;
            const direction = playerPos.clone().subtract(this.node.worldPosition).normalize();
            const angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
            this.node.setRotationFromEuler(0, angle, 0);
            


            // TKJWL_DataManager.Instance.isPlayerDead = true;
            this.isContactPlayer = true;
            const currentState = this.spine.getState('attack');
            if (!currentState?.isPlaying) {
                this.spine.crossFade('attack', 0.2);
            }
            TKJWL_DataManager.Instance.isFail = true;
            TKJWL_DataManager.Instance.isGameStart = false;
            EventManager.Scene.emit(TKJWL_GameEvents.UI_SHOW_END_PANEL);
         }
            //
    }


    update(deltaTime: number) {
        if(!TKJWL_DataManager.Instance.isGameStart ) return;
        if (!TKJWL_DataManager.Instance.playerNode) return;
        if(!this.startPlotLogic ) return;
        if(this.isOpeningDoor) return;
        switch(TKJWL_DataManager.Instance.plotNum){
            case 999:
                this.plot_Logic(deltaTime);
                break;
            case 1:
                this.plot_1Logic(deltaTime);
                break;
            case 2:
                this.plot_2Logic(deltaTime);
                break;
            case 3:
                this.plot_3Logic(deltaTime);
                break;
            case 4:
                this.plot_4Logic(deltaTime);
                break;
            default:
                break;
        }
       
    }

    plot_Logic(deltaTime: number) {
        if(this.isContactPlayer) {
            return;
        }


        if(this.isIdle) return;

        const currentState = this.spine.getState('run');
        if (!currentState?.isPlaying) {
            this.spine.crossFade('run', 0.2);
        }

        //  if(this.isFinding){
        // // 如果正在追逐且有路径，则移动
        //     if (this.isChasing && this.currentPath.length > 0 ) {
        //         this.speed = 12;
        //         this.moveAlongPath(deltaTime);
        //     }
        //  }
        //  else{
            if (this.currentPath.length > 0 ) {
                this.speed = 19;
                this.moveAlongPath(deltaTime);
            }
        //  }

     }

    plot_1Logic(deltaTime: number) {
        // if (!TKJWL_DataManager.Instance.isGameStart) return;
        if(this.isContactPlayer) {
            return;
        }

        // 处理门交互
        // this.handleDoorInteraction();

        // 检测玩家是否在范围内
        this.checkPlayerInRange(deltaTime);

        // 如果正在追逐且有路径，则移动
        if (this.isChasing && this.currentPath.length > 0 ) {
            this.speed = 12;
            this.moveAlongPath(deltaTime);
        }
    }

    plot_2Logic(deltaTime: number) {
        // if (!TKJWL_DataManager.Instance.isGameStart) return;
        if(this.isContactPlayer) {
            return;
        }

        // 处理门交互
        // this.handleDoorInteraction();

        // 检测玩家是否在范围内
        this.checkPlayerInRange(deltaTime);

        // 如果正在追逐且有路径，则移动
        if (this.isChasing && this.currentPath.length > 0 ) {
            this.speed = 10;
            this.moveAlongPath(deltaTime);
        }
    }



    plot_3Logic(deltaTime: number) {
        if(this.isContactPlayer) {
            return;
        }

        if(this.needCheckPlayer){
            if(TKJWL_DataManager.Instance.currentArea == "area_5" || TKJWL_DataManager.Instance.currentArea == "area_6") {
                this.allWaypoints = TKJWL_DataManager.Instance.paths_plot3["find"]
                // 检测玩家是否在范围内
                this.checkPlayerInRange(deltaTime);
                this.pathEndCb = null;
                this.isIdle = false;
                this.isFinding = true;
            }
        }

         if(this.isIdle) return;

         if(this.isRun){
            const currentState = this.spine.getState('run');
            if (!currentState?.isPlaying) {
                this.spine.crossFade('run', 0.2);
            }
         }
         else{
            const currentState = this.spine.getState('walk');
            if (!currentState?.isPlaying) {
                this.spine.crossFade('walk', 0.2);
            }
         }



         if(this.isFinding){
            const currentState = this.spine.getState('run');
            if (!currentState?.isPlaying) {
                this.spine.crossFade('run', 0.2);
            }
        // 如果正在追逐且有路径，则移动
            if (this.isChasing && this.currentPath.length > 0 ) {
                this.speed = 12;
                this.moveAlongPath(deltaTime);
            }
         }
         else{
            if (this.currentPath.length > 0 ) {
                this.speed = 6;
                this.moveAlongPath(deltaTime);
            }
         }

  
    }

    plot_4Logic(deltaTime: number) {
        if(this.isContactPlayer) {
            return;
        }

        if(this.needCheckPlayer){
            // if(TKJWL_DataManager.Instance.currentArea == "area_5" || TKJWL_DataManager.Instance.currentArea == "area_6") {
            //     this.allWaypoints = TKJWL_DataManager.Instance.paths_plot3["find"]
                // 检测玩家是否在范围内
                this.checkPlayerInRange(deltaTime);
                // this.pathEndCb = null;
                this.isIdle = false;
                this.isFinding = true;
            // }
        }

         if(this.isIdle) return;

        const currentState = this.spine.getState('walk');
        if (!currentState?.isPlaying) {
            this.spine.crossFade('walk', 0.2);
        }

         if(this.isFinding){
        // 如果正在追逐且有路径，则移动
            if (this.isChasing && this.currentPath.length > 0 ) {
                this.speed = 3;
                this.moveAlongPath(deltaTime);
            }
         }
         else{
            if (this.currentPath.length > 0 ) {
                this.speed = 3;
                this.moveAlongPath(deltaTime);
            }
         }
    }


    // // 更新当前所在楼层
    // private updateCurrentFloor() {
    //     this.currentFloor = Math.floor(this.core.worldPosition.y / this.floorHeight) + 1;
    // }

    // 检测玩家是否在范围内
    private checkPlayerInRange(deltaTime: number) {
        if (!TKJWL_DataManager.Instance.playerNode) return;

        // const distanceToPlayer = Vec3.distance(this.core.worldPosition, TKJWL_DataManager.Instance.playerNode.worldPosition);

        // if (distanceToPlayer <= this.detectionRange) {
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
        // } else {
        //     const currentState = this.spine.getState('walk');
        //     if (!currentState?.isPlaying) {
        //         this.spine.crossFade('walk', 0.2);
        //     }
        //     this.isChasing = false;
        //     this.currentPath = [];
        //     this.targetWaypoint = null;
        // }
    }

    // 更新追逐路径
    private updateChasePath() {
        if (!TKJWL_DataManager.Instance.playerNode || !this.currentWaypoint || this.isProcessingPath) return;

        this.isProcessingPath = true;

        this.currentWaypoint.connectedWaypoints = [];


        // 找到玩家附近的路点
        const playerWaypoint = this.findNearestWaypointToPosition(TKJWL_DataManager.Instance.playerNode.worldPosition);
        // 获取玩家身上的路点组件
        const playerWaypointComponent = TKJWL_DataManager.Instance.playerNode.getComponent(TKJWL_Waypoint);

        // 检查是否怪物和玩家最近的路点是同一个
        let ray = new geometry.Ray;
        geometry.Ray.fromPoints(ray, this.core.getWorldPosition(), TKJWL_DataManager.Instance.playerNode.getChildByName("Node").getWorldPosition());
        const mask = TKJWL_Physics_Group.DEFAULT ; // 检测所有分组
        if (PhysicsSystem.instance.raycastClosest(ray,mask)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            let node = result.collider.node;
            if (node == TKJWL_DataManager.Instance.playerNode) {
                if (playerWaypoint) {
                    // 如果玩家身上有TKJWL_Waypoint组件，直接将其作为唯一路径点
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
        //若不是同一个

        //按照距离排列路点
        this.allWaypoints.sort((a, b) => { return Vec3.distance(a.node.getWorldPosition(), this.core.getWorldPosition()) - Vec3.distance(b.node.getWorldPosition(), this.core.getWorldPosition()); });
        let times = 0;
        for (let i = 0; i < this.allWaypoints.length; i++) {
            const element = this.allWaypoints[i];
            //排除上一路点
            if (this.lastPoint == element) 
                continue;
            //排除已到达路点
            if (Vec3.distance(element.node.getWorldPosition(), this.core.getWorldPosition()) < this.waypointReachDistance) 
                continue;
           //排除不同楼层路点
            let abs = Math.abs(element.node.getWorldPosition().y - this.core.getWorldPosition().y);
            if (element.node.name == "Cube-006") console.log(`Cube${abs}`);
            if (abs > 1.5) continue;

            //从剩余路点中找到2个可通行路点压入可通行路点
            let ray = new geometry.Ray;
            geometry.Ray.fromPoints(ray, this.core.getWorldPosition(), element.node.getWorldPosition());

            const mask = TKJWL_Physics_Group.DEFAULT ; // 检测所有分组
            if (PhysicsSystem.instance.raycastClosest(ray,mask)) {
                const result = PhysicsSystem.instance.raycastClosestResult;
                let node = result.collider.node;
                if (node == element.node) {
                    this.currentWaypoint.connectedWaypoints.push(element.getComponent(TKJWL_Waypoint));
                    times++;
                    if (times >= 2) break;
                }
            }
        }

        if (playerWaypoint) {
            TKJWL_PathManager.instance.requestPath(
                this.currentWaypoint,
                playerWaypoint,
                (path, success) => this.onPathFound(path, success)
            );
        } else {
            // 找不到玩家附近的路点
            this.onPathFound(null, false);
        }
    }

    setPath(newPath:TKJWL_Waypoint[]){
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

    // 路径找到后的回调
    private onPathFound(newPath: TKJWL_Waypoint[] | null, success: boolean) {
        this.isProcessingPath = false;

        if (success && newPath && newPath.length > 0) {
            // 添加玩家路点作为最后一个目标（如果不存在）
            const playerWaypointComponent = TKJWL_DataManager.Instance.playerNode.getComponent(TKJWL_Waypoint);
            if (playerWaypointComponent && !newPath.includes(playerWaypointComponent)) {
                newPath = [...newPath, playerWaypointComponent];
            }

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
            this.pathEndCb && this.pathEndCb();
            return;
        }

        const targetWaypoint = this.currentPath[this.currentPathIndex];
        const targetPosition = this.currentPosPath[this.currentPathIndex];

        // 计算方向向量
        const direction = targetPosition.clone().subtract(this.core.worldPosition).normalize();
        const speed = this.speed;
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
            // const playerWaypointComponent = TKJWL_DataManager.Instance.playerNode.getComponent(TKJWL_Waypoint);
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
            if (this.currentDoor.isOpening) {
                // 门已打开，继续移动
                this.currentDoor = null;
            }
            return;
        }

        // 发射射线检测前方的门
        let origin = this.core.worldPosition.clone();
        origin.y += 0.5; // 稍微抬高射线起点
        let end = this.node.forward.clone()

        const ray = geometry.Ray.create(origin.x, origin.y, origin.z, end.x, end.y, - end.z);


        const maxDistance = 2;
        const queryTrigger = true;


        if (PhysicsSystem.instance.raycastClosest(ray,null,maxDistance,queryTrigger)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            // for (const result of results) {
                const door = result.collider.getComponent(TKJWL_Door);
                if (door && !door.isOpening) {
                    // 找到关闭的门，停止移动并开门
                    this.currentDoor = door;
                    if (this.rigidBody) {
                        this.rigidBody.setLinearVelocity(Vec3.ZERO);
                    }
                    const currentState = this.spine.getState('run');
                    if (!currentState?.isPlaying) {
                        this.spine.crossFade('pu', 0.2);
                    }

                    door.openDoor();

                    this.isOpeningDoor = true;
                    // this.scheduleOnce(()=>{
                        this.isOpeningDoor = false;
                    // },0.2)
                    // break;
                }
            // }
        }
    }

    // 找到最近的路点
    private findNearestWaypoint() {
        if (this.allWaypoints.length === 0) return;

        let nearest: TKJWL_Waypoint | null = null;
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
    private findNearestWaypointToPosition(position: Vec3): TKJWL_Waypoint | null {
        if (this.allWaypoints.length === 0) return null;

        let nearest: TKJWL_Waypoint | null = null;
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
    private findNearestStairway(floor: number): TKJWL_Waypoint | null {
        const stairsOnFloor = this.allWaypoints.filter(w => w.isStair && w.floor === floor);

        if (stairsOnFloor.length === 0) return null;

        let nearestStair: TKJWL_Waypoint | null = null;
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


    addListener(){
        
        EventManager.on(TKJWL_GameEvents.HIDE_MONSTER_POLT,this.hideMonsterPlot,this)
        EventManager.on(TKJWL_GameEvents.SET_MONSTER_POLT,this.setMonsterPlot,this)
    }

    removeListener(){
        EventManager.off(TKJWL_GameEvents.HIDE_MONSTER_POLT,this.hideMonsterPlot,this)
        EventManager.off(TKJWL_GameEvents.SET_MONSTER_POLT,this.setMonsterPlot,this)


    }

    protected onDestroy(): void {
        this.removeListener();
    }
}
