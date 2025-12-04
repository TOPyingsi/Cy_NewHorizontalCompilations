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

    @property({ type: AudioClip })
    private clip: AudioClip = null;
    

    private anim: SkeletalAnimation;


    private rigidbody: RigidBody = null;

    private wanderWaitTime: number = 3;

    // 状态管理
    private currentState: JJTW_MonsterState = JJTW_MonsterState.IDLE;
    private targetPlayer: Node = null; // 目标玩家


    // 游荡数据
    private wanderWaitTimer: number = 0;

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

    private isHaveTarget:boolean = false;

    private wanderedPoses:Vec3[]= [];
    

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
                this.setWanderPath();
                break;
            case JJTW_MonsterState.CHASE:
                this.setChasePath()
                break;
            case JJTW_MonsterState.PATHFIND:
                break;
        }
    }

        
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
                    this.updateChasePath(deltaTime);
                    break;
                case JJTW_MonsterState.PATHFIND:
                    // this.updatePathfinding(deltaTime);
                    break;
            }
        }
    }


  
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
        this.pathFollow.pathPoints = [];
        this.largeCollider.enabled = true;
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
            }
            else if(group2){
                ////console.log("检测到NPC")
                this.targetPlayer = event.otherCollider.node;
                this.isHaveTarget = true;

            }
        } 
    }
      

    // 失去玩家检测
    private onPlayerLost(event: ITriggerEvent) {
        if (this.targetPlayer && event.otherCollider.node === this.targetPlayer) {
            // 仅在追击模式下处理
            if (this.currentState === JJTW_MonsterState.CHASE) {
                this.isHaveTarget = false;
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
              else if ( findRoadTypes.includes(colliderGroup.groupType)) {
                // 记录障碍物
                  ////console.log("撞到障碍物了");
                  const currentState = this.anim.getState('idle');
                  if (!currentState?.isPlaying) {
                      this.anim.crossFade('idle', 0.2);
                  }
              }
              else if(doorTypes.includes(colliderGroup.groupType)){
                const currentState = this.anim.getState('idle');
                if (!currentState?.isPlaying) {
                    this.anim.crossFade('idle', 0.2);
                }
                ////console.log("撞到门了");
                // 无路径时恢复游荡
                this.resetTracking();
                this.switchState(JJTW_MonsterState.WANDER);
                return;
              }
         }
    }


    
    private setWanderPath(){
        let poses:Vec3[] = []
        for(let i = 0; i < this.scanSystem.roadPoints.length; i++){
            if(poses.length >= 4) break;
            let pos = this.scanSystem.roadPoints[i];
            let dis = Vec3.distance(this.node.worldPosition,pos);
            if(dis <0.5){
                continue;
            }
            if(!this.scanSystem.checkObstacle(this.node.worldPosition,pos,false)){
             poses.push(pos);
            }
        }

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

    }


    private setChasePath(){

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

    
    private updateChasePath(deltaTime: number) {
        
        // 路径跟随中
        if (this.pathFollow.pathPoints.length > 0) {
            this.followPath(deltaTime);
            return;
        }
    
            this.setChasePath(); // 切换下一个游荡点
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
        
    }
}


