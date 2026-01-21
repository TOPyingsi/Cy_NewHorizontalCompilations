import { _decorator, Animation, Collider, color, Component, director, find, ICollisionEvent, ITriggerEvent, log, math, Node, ParticleSystem, Quat, RigidBody, SkeletalAnimation, v2, v3, Vec2, Vec3 } from 'cc';

import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { GML_ZTool } from './GML_ZTool';
import { GML_CameraController } from './GML_CameraController';
import { GML_ColliderGroup } from './GML_ColliderGroup';
import { GML_Events } from './GML_Events';
import { GML_GameManager } from './GML_GameManager';
import { GML_AudioManager } from './GML_AudioManager';

const { ccclass, property } = _decorator;
const v3_1 = v3();
const v3_2 = v3();
const v3_move = v3();
const ROTATION_STRENGTH = 20.0;//相机旋转速度
@ccclass('GML_Player')
export class GML_Player extends Component {
    public Hp: number = 100;
    public MaxHp: number = 100;
    public Mp: number = 100;//体力值
    public MaxMp: number = 100;

    public Speed: number = 4;
    public Ani: SkeletalAnimation = null;
    public collider: Collider = null;
    public rigidbody: RigidBody = null;
    private _isMoving: boolean = false;
    public cameraController: GML_CameraController = null;
    public _PlayerModel: Node = null;


    public resurgencePos: Vec3 = v3(2, 1, 0);//复活点位
    public resurgenceInitPos: Vec3 = v3(2, 1, 0);//复活点位
    public resurgenceRotation: Quat = null;//复活朝向
     public resurgenceModelPos: Vec3 = v3(2, 1, 0);//模型位置
    public resurgenceModelRotation: Vec3 = v3(2, 1, 0);//模型朝向


    protected onLoad(): void {
        this.resurgenceInitPos = this.node.worldPosition.clone();
        this.resurgencePos = this.node.worldPosition.clone();
        this.resurgenceRotation = this.node.rotation.clone();

        this._PlayerModel = this.node.getChildByName("PlayerModel");
        this.resurgenceModelPos = this._PlayerModel.position.clone();
        this.resurgenceModelRotation = this._PlayerModel.eulerAngles.clone();

        this.collider = this.node.getComponent(Collider);
        this.rigidbody = this.node.getComponent(RigidBody);
        this.cameraController = this.node.getChildByPath("CameraPoint/Camera").getComponent(GML_CameraController);
        this.cameraController.Isthirdperson = true;
    }

    protected start(): void {
        this.Ani = this.node.getChildByPath("PlayerModel/模型").getComponent(SkeletalAnimation);

        EventManager.on(GML_Events.CAMERA_ROTATE, this.OnRotate, this);
        this.collider.on('onCollisionEnter', this.onCollisionEnter, this);

        EventManager.on(GML_Events.RESET_PLAYER, this.ReStartPos, this);
        EventManager.on(GML_Events.PLAYER_DIE, this.OnPlayerDie, this);


        EventManager.on(GML_Events.Keep_Jump, this.OnKeepJumpStart, this);
        EventManager.on(GML_Events.Stop_Jump, this.OnStopJump, this);
        EventManager.on(GML_Events.Keep_Jump_BACK, this.OnKeepJumpBackStart, this);
        EventManager.on(GML_Events.Stop_Jump_BACK, this.OnStopJumpBack, this);

        this.node.getChildByPath("CameraPoint/Camera")?.getComponent(GML_CameraController).SetInitTargetAngle(-10, 90, 0);

    }

    OnPlayerDie(){
        if(GML_GameManager.Instance.isPlayerDie){ return }
        this.resurgencePos = this.node.worldPosition.clone();
        this.rigidbody.setLinearVelocity(v3(0, 0, 0));
    }

    state:"静止"|"跳跃"|"后退" ="静止";
    private jumpStage: number = 0; // 0:未开始, 1:准备阶段, 2:跳跃阶段, 3:掉落阶段
    private isJumpInterrupted: boolean = false; // 跳跃是否被打断
    private passTime: number = 0; // 跳跃时间

    private downStage: number = 0; // 0:未开始, 1:开始
    private isDownInterrupted: boolean = false; // 后退是否被打断
    private passTime2: number = 0; // 后仰时间

    //若静止或者正在后退中，开始跳跃的3段过程
    OnKeepJumpStart(){
        if (this.state === "静止" || this.state === "后退") {
            this.state = "跳跃";
            this.jumpStage = 1;
            this.isJumpInterrupted = false;
            this.passTime = 0;
            EventManager.emit(GML_Events.UI_Update_Progress,  this.passTime / (this.Ani.getState("jumpUp").duration/0.9));
            this.JumpStageHandler(this.jumpStage);
        }
    }

    //跳跃阶段处理函数
    JumpStageHandler(stage: number,cb?:()=>void) {
        // 检查是否被打断
        if (GML_GameManager.Instance.isPlayerDie|| this.state !== "跳跃") {
            return;
        }

        switch (stage) {
            case 1: // 准备阶段
                this.SetAnimation("jumpUp");
                this.rigidbody.setLinearVelocity(v3(0, 0, 0));
                
                break;
                
            case 2: // 跳跃阶段
                // this.SetAnimation("jumpMiddle");
                GML_AudioManager.getInstance().playSound("跳");

                let speedX = 0;
                let progress = GML_GameManager.Instance.progress;

                if(progress < 0.78 && progress >= 0){
                    speedX = -0.5;
                }
                else if(progress <= 0.9 && progress >= 0.78){
                    speedX = -4;
                }
                else if(progress > 0.9){
                    this._PlayerModel.getComponent(Animation).play("dao1");
                    GML_GameManager.Instance.playerDie();
                   return;
                }

                this.rigidbody.setLinearVelocity(v3(speedX, 12, 0));

                this.scheduleOnce(() => {
                    if ( this.state === "跳跃") {
                        this.jumpStage = 3;
                        this.JumpStageHandler(this.jumpStage);
                    } if(this.state === "后退" || this.state === "静止"){//跳跃中途按下后退情况单独处理
                        this.SetAnimation("jumpDown");
                        this.rigidbody.setLinearVelocity(v3(0, -2, 0));
                        
                        this.scheduleOnce(() => {
                            this.isJumpInterrupted = false; 
                            this.jumpStage = 0; 
                            this.SetAnimation("idle");
                            this.rigidbody.setLinearVelocity(v3(0, 0, 0));
                            if (this.state === "后退") {
                                this.DownStageHandler();
                            }
                            else{//若回到原位前 按下跳跃  不处理
                                this.state = "静止"
                                // this.passTime = 0;
                                // EventManager.emit(GML_Events.UI_Update_Progress, this.passTime / (this.Ani.getState("jumpUp").duration/0.9));
                                EventManager.Scene.emit(GML_Events.UI_Reset_Progress);
                            }
                        }, this.Ani.getState("jumpDown").duration);
                    }
                    
                }, this.Ani.getState("jumpDown").duration);
                            //   }, 3);
                break;
                
            case 3: // 掉落阶段
                this.SetAnimation("jumpDown");
                this.rigidbody.setLinearVelocity(v3(0, -2, 0));
                
                this.scheduleOnce(() => {
                    if (this.state === "跳跃") {
                        EventManager.Scene.emit(GML_Events.UI_Reset_Progress);
                       
                        this.state = "静止"
                        this.jumpStage = 0; // 循环回到准备阶段
                        this.SetAnimation("idle");
                        this.rigidbody.setLinearVelocity(v3(0, 0, 0));
                        this.isJumpInterrupted = false; 
                    }
                }, this.Ani.getState("jumpDown").duration);
                break;
        }
    }

    //若正在跳跃过程中，根据当前阶段执行不同的停止逻辑
    OnStopJump(){
        if (this.state === "跳跃") {
            this.isJumpInterrupted = true;
            
            switch (this.jumpStage) {
                case 1: // 第1阶段：准备阶段
                    this.state = "跳跃";
                    this.jumpStage = 2;
                    this.JumpStageHandler(this.jumpStage);
                    break;
            }
        }
        // 正在后退中不修改状态
    }

    DownStageHandler(){
        if (GML_GameManager.Instance.isPlayerDie) {
            return;
        }
        if (this.state === "跳跃") {
            if(this.jumpStage == 2){
                this.rigidbody.setLinearVelocity(v3(0, 12, 0));
            }
            if(this.jumpStage == 3){
                this.rigidbody.setLinearVelocity(v3(0, -2, 0));
            }
            this.state = "后退";
        }
        else if (this.state === "后退" || this.state === "静止") {
            this.downStage = 1;
            this.isDownInterrupted = false;
            this.passTime2 = 0;
            this.scheduleOnce(() => {
                   
                if(this.state == "后退"){
                    if(!this.isDownInterrupted) {
                        this._PlayerModel.getComponent(Animation).play("dao2");
                        GML_GameManager.Instance.playerDie();
                    }
                    else{
                        this.isDownInterrupted = false;
                    }
                }
            }, 0.5);

        }
    }

    //若正在跳跃中，则要先原地掉落完再播放后退动画，否则直接播放后退动画
    OnKeepJumpBackStart(){
        if (this.state === "跳跃") {
           
            this.downStage = 0;
            this.DownStageHandler();
            return;

        } else if (this.state === "静止") {
            // 非跳跃中直接后退
            this.state = "后退";
            this.downStage = 0;
            this.DownStageHandler();
        }
    }

    //若正在后退中，则直接静止
    OnStopJumpBack(){
        if (this.state === "后退") {
            this.isDownInterrupted = true;
            this.state = "静止";
            EventManager.Scene.emit(GML_Events.UI_Reset_Progress);
          
        }
        // 正在跳跃中不做变化
    }



    //相机旋转
    OnRotate(deltaX: number, deltaY: number) {
        let eulerAngles = this.cameraController.node.parent.eulerAngles;
        this.cameraController.SetTargetAngle(math.clamp(eulerAngles.x + deltaX * ROTATION_STRENGTH, -30, 30)
            , eulerAngles.y + deltaY * ROTATION_STRENGTH, eulerAngles.z);
    }
   
    protected update(dt: number): void {
        if(this.state == "跳跃" && this.jumpStage == 1 && !GML_GameManager.Instance.isPlayerDie){
            this.passTime += dt;
            // EventManager.emit(GML_Events.UI_Update_Progress,  this.passTime / (this.Ani.getState("jumpUp").duration/0.9));
        
        }

        if(this.state == "后退" && this.downStage == 1 && !GML_GameManager.Instance.isPlayerDie){
            this.passTime2 += dt;
        }



    }
    


    private onCollisionEnter(event: ICollisionEvent) {
        
        if (event.otherCollider.node.getComponent(RigidBody).group === GML_ColliderGroup.Car) {
            console.log("撞到了车");
            this.cameraController.FixedCamera()
        }


        if (event.otherCollider.node.getComponent(RigidBody).group == GML_ColliderGroup.PassArea) {
           console.log("通过了");
        }

    }

    //设置动画
    SetAnimation(name: string) {
        if(name == "jumpUp" || name == "jumpMiddle" || name == "jumpDown"  || name == "idle"){
            if (this.Ani.getState(name).isPlaying) { return }
            this.Ani.play(name);
        }
    }


    //复位
    ReStartPos() {
        // 重置玩家位置
        if(GML_GameManager.Instance.isRestart){
            this.resurgencePos = this.resurgenceInitPos.clone();
            GML_GameManager.Instance.isRestart = false;
        }
        this.node.setWorldPosition(v3(this.resurgencePos.x, this.resurgencePos.y+0.3, this.resurgencePos.z));
        this.node.rotation = this.resurgenceRotation;
        
        // 重置玩家朝向
        this._PlayerModel.setPosition(this.resurgenceModelPos);
        this._PlayerModel.eulerAngles = this.resurgenceModelRotation;
        
   
        
        // 重置移动状态
        this._isMoving = false;
       
        
        // 重置刚体速度
        if (this.rigidbody) {
            this.rigidbody.setLinearVelocity(Vec3.ZERO);
        }
        
        // 重置相机相关
        if (this.cameraController) {
            // 恢复相机控制
            this.cameraController.RestoreInitialState();
            // 重置相机角度到初始值
            this.cameraController.SetInitTargetAngle(-10, 90, 0);
        }

        this.state = "静止";
        this.jumpStage = 0;
        this.isJumpInterrupted = false;
        this.downStage = 0;
        this.isDownInterrupted = false;

        EventManager.Scene.emit(GML_Events.UI_Reset_Progress);
        
        // 重置动画
        if (this.Ani) {
            this.Ani.stop();
            this.Ani.play('idle');
        }
    }
   
    protected onDestroy(): void {
        EventManager.off(GML_Events.PLAYER_DIE, this.OnPlayerDie, this);
        EventManager.off(GML_Events.RESET_PLAYER, this.ReStartPos, this);

    }
}


