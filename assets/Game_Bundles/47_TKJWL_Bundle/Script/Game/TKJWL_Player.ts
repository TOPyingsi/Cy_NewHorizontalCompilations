import { _decorator, Animation, BoxCollider, Camera, CapsuleCollider, Collider, Color, Component, director, find, Game, geometry, ICollisionEvent, instantiate, ITriggerEvent, log, math, Node, ParticleSystem, PhysicsSystem, Prefab, RigidBody, SkeletalAnimation, tween, v2, v3, Vec3 } from 'cc';
import { TKJWL_CameraController } from './TKJWL_CameraController';
// import { TKJWL_DataManager } from '../Manager/TKJWL_DataManager';
import { TKJWL_Physics_Group } from '../Common/TKJWL_PHY_GROUP';
import { TKJWL_GameEvents } from '../Common/TKJWL_GameEvents';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';


const { ccclass, property } = _decorator;


const v3_1 = v3();
const v3_move = v3();
const ROTATION_STRENGTH = 20.0;//相机旋转速度



@ccclass('TKJWL_Player')
export class TKJWL_Player extends Component {
    @property()
    jumpVelocity = 1.0;//跳跃高度
    @property(Node)
    public WeaponNode: Node = null;//武器节点

    @property(Node)
    public DetectorNode: Node = null;//检测器节点

    @property(Node)
    public modelMonster: Node = null;//怪物模型节点

    velocityScale: number = 1.0;//速度倍率
    speed: number = 6;//速度
    rigidbody: RigidBody = null!;

    camera: Camera = null;
    private cameraController: TKJWL_CameraController = null;




    EquipmentAnimation: SkeletalAnimation = null;//装备动画控制器

    private _birdNd: Node = null!;
    private _remoteNd: Node = null!;
    private _isInTheAir: boolean = false;//是否在飞机上
    public Carrier: Node = null;//所在的载具Node
    public _isMoving: boolean = false;//是否正在移动
    public _isReload: boolean = false;//是否正在换弹
    private _ray: geometry.Ray = null!;
    private _isArplaneMode: boolean = false;//是否飞行模式
    private ArplaneModeForce: number = 0;//飞行模式下上升下降的偏移量
    public AtkScale: number = 1;//伤害倍率

    public EquipmentId: number = -1;//玩家持有装备id
    public defaultEquipmentId: number = 0;//玩家初始装备

    private gun: Node = null!;


    protected onLoad(): void {
        this.cameraController = this.node.getChildByName("Camera").getComponent(TKJWL_CameraController);
        this.rigidbody = this.node.getComponent(RigidBody);
        this.camera = this.node.getChildByName("Camera").getComponent(Camera);
        this._ray = new geometry.Ray();
    }

    start() {
        let collider = this.node.getComponent(CapsuleCollider);
        collider.on('onCollisionEnter', this.onCollisionEnter, this);
        collider.on('onCollisionExit', this.onCollisionExit, this);
        collider.on('onTriggerEnter', this.onTriggerEnter, this);
        collider.on('onTriggerExit', this.onTriggerExit, this);
        this.BeginMonitor();
        //  TKJWL_DataManager.Instance.playerCamera = this.camera;
    }

    //开启监听
    BeginMonitor() {
         EventManager.on(TKJWL_GameEvents.INTERACT, this.OnInteract, this);

        // EventManager.on(TKJWL_GameEvents.CAMERA_ROTATE, this.OnRotate, this);
        EventManager.on(TKJWL_GameEvents.MOVEMENT, this.OnMove, this);
        EventManager.on(TKJWL_GameEvents.MOVEMENT_STOP, this.OnStopMove, this);
    }
    //关闭监听
    ExitReMonitor() {
        EventManager.off(TKJWL_GameEvents.INTERACT, this.OnInteract, this);

        // EventManager.off(TKJWL_GameEvents.CAMERA_ROTATE, this.OnRotate, this);
        EventManager.off(TKJWL_GameEvents.MOVEMENT, this.OnMove, this);
        EventManager.off(TKJWL_GameEvents.MOVEMENT_STOP, this.OnStopMove, this);
    }

    private onCollisionEnter(event: ICollisionEvent) {
        switch (event.otherCollider.node.name) {

        }
    }
    private onCollisionExit(event: ICollisionEvent) {



    }
    private onTriggerEnter(event: ITriggerEvent) {

    }
    private onTriggerExit(event: ITriggerEvent) {

    }
 
    OnInteract(v:Vec3){

        // // 获取相机组件
        // const camera = this.camera;
        // if (!camera) return;

        // let ray = new geometry.Ray;
        // camera.screenPointToRay(v.x, v.y, ray);

        // // 射线检测所有碰撞体
        // const mask = TKJWL_Physics_Group.ITEM ; // 检测所有分组
        // const maxDistance = 10;
        // const queryTrigger = true;



        // if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
        //     const result = PhysicsSystem.instance.raycastClosestResult;
        //     const colliderType = result.collider.node.name.split("_")[0];
        //     if (colliderType == "box") {
        //         // let box = result.collider.node.getComponent(TKJWL_Box);
        //         // if(box){
        //         //     box.openBox();
        //         // }
        //         // let itemId =  result.collider.node.name.split("_")[1];
        //         // // 显示物品提示
        //         // director.getScene().emit(TKJWL_GameEvents.ShowItemTip,itemId);;
        //     }
        //     else if(colliderType == "item"){
        //         // let equipmentId = parseInt(result.collider.node.name.split("_")[1]);
        //         // TKJWL_DataManager.Instance.getNewEquipment(equipmentId)
        //         // result.collider.node.active = false;
        //     }
        // }
    }

    
    //相机旋转
    OnRotate(deltaX: number, deltaY: number) {
        // console.log("相机旋转");

        let eulerAngles = this.cameraController.node.eulerAngles;
        this.cameraController.SetTargetAngle(math.clamp(eulerAngles.x + deltaX * ROTATION_STRENGTH, -80, 80)
            , eulerAngles.y + deltaY * ROTATION_STRENGTH, eulerAngles.z);

    }
    //移动
    OnMove(x: number, y: number, offset: number) {
        this.velocityScale = 1;

        let dir = v3(x, 0, -y).normalize();

        let radian = Vec3.angle(Vec3.FORWARD, v3(this.cameraController.node.forward.x, 0, this.cameraController.node.forward.z).normalize());    //Vec3.FORWARD（0，0，-1）

        if (this.cameraController.node.eulerAngles.y < 0) {
            radian = this.cameraController.node.eulerAngles.y % 360 >= -180 ? -radian : radian;
        }

        if (this.cameraController.node.eulerAngles.y > 0) {
            radian = this.cameraController.node.eulerAngles.y % 360 >= 180 ? -radian : radian;
        }

        Vec3.rotateY(v3_move, dir, Vec3.ZERO, radian);

        v3_move.multiplyScalar(this.speed);

        this._isMoving = true;

        if (!this._isArplaneMode) {
            // AudioManager.Instance.playLookAudio("走路音效");
        }
    }
    //移动停止
    OnStopMove() {
        // AudioManager.Instance.StopLoopAudio("走路音效");
        this._isMoving = false;
        v3_move.set(Vec3.ZERO);
    }
    //跳跃
    OnJump() {
        if (this._isInTheAir) return;
        this.rigidbody.getLinearVelocity(v3_1);
        v3_1.y = this.jumpVelocity;
        this.rigidbody.setLinearVelocity(v3_1);
    }
 
    update(deltaTime: number) {
        //移动
        if (this._isMoving) {
            v3_move.multiplyScalar(this.velocityScale);
            this.rigidbody.getLinearVelocity(v3_1);
            v3_move.y = v3_1.y;
            this.rigidbody.setLinearVelocity(v3_move);
        } else {
            this.rigidbody.getLinearVelocity(v3_move);
            v3_move.set(math.lerp(v3_move.x, 0, 0.1), v3_move.y, math.lerp(v3_move.z, 0, 0.1));
            this.rigidbody.setLinearVelocity(v3_move);
        }
        // this.Attackjudge(deltaTime);
        // // 射线检测
        // this.camera.screenPointToRay(GameManager.Instance.ScreenCenter.x, GameManager.Instance.ScreenCenter.y, this._ray);
        // if (PhysicsSystem.instance.raycastClosest(this._ray, 0xffffffff, 1000, false)) {
        //     const result = PhysicsSystem.instance.raycastClosestResult;
        //     GameManager.Instance.aimType = result.collider.getGroup();
        //     GameManager.Instance.aimPosition = result.hitPoint;
        //     let Maxaimdistance: number = GameManager.Instance.aimdistance;//放置的最远距离
        //     if (Constant.GetEquipmentData(this.EquipmentId)?.类型 == "建筑") {
        //         Maxaimdistance = 5;
        //     }
        //     if (Constant.GetEquipmentData(this.EquipmentId)?.类型 == "造物枪") {//如果是造物枪，射程为100
        //         Maxaimdistance = 100;

        //     }
        //     if (Constant.GetEquipmentData(this.EquipmentId)?.类型 == "建筑" || Constant.GetEquipmentData(this.EquipmentId)?.类型 == "造物枪") {
        //         if (GameManager.Instance.Isadsorb) {//如果开启吸附效果
        //             if (result.hitPoint.clone().subtract(this.node.getWorldPosition().clone()).length() > Maxaimdistance) {
        //                 //如果超过最远建造距离
        //                 let pos = result.hitPoint.clone().subtract(this.node.getWorldPosition().clone()).normalize().multiplyScalar(Maxaimdistance);
        //                 GameManager.Instance.aimPosition = incident.snapToNearestMultiple(this.node.position.clone().add(pos));
        //             } else {
        //                 GameManager.Instance.aimPosition = incident.snapToNearestMultiple(result.hitPoint);
        //             }
        //         } else {
        //             if (result.hitPoint.clone().subtract(this.node.getWorldPosition().clone()).length() > Maxaimdistance) {
        //                 //如果超过最远建造距离
        //                 let pos = result.hitPoint.clone().subtract(this.node.getWorldPosition().clone()).normalize().multiplyScalar(Maxaimdistance);
        //                 GameManager.Instance.aimPosition = this.node.position.clone().add(pos);
        //             } else {
        //                 GameManager.Instance.aimPosition = result.hitPoint;
        //             }
        //         }
        //     }


        //     GameManager.Instance.aimUnit = null;
        //     GameManager.Instance.aimWall = null;
        //     GameManager.Instance.aimCarrier = null;

        //     switch (result.collider.getGroup()) {
        //         //默认
        //         case AimType.default: break;
        //         //玩家
        //         case AimType.player: break;
        //         //地面
        //         case AimType.ground:

        //             break;
        //         //建筑物
        //         case AimType.Wall:
        //             GameManager.Instance.aimWall = result.collider.node;
        //             break;
        //         //所有单位
        //         case AimType.Unit:
        //             GameManager.Instance.aimUnit = result.collider.node;
        //             break;
        //         case AimType.trigger:
        //             break;
        //         //载具
        //         case AimType.carrier:
        //             GameManager.Instance.aimCarrier = result.collider.node;
        //             break;
        //     }
        // } else {
        //     GameManager.Instance.aimUnit = null;
        //     GameManager.Instance.aimWall = null;
        //     GameManager.Instance.aimCarrier = null;
        // }

        // this.SetAnimation();

        //飞行模式下按住上升下降进行偏移
        if (this._isArplaneMode) {
            this.rigidbody.setLinearVelocity(v3(v3_move.x, this.ArplaneModeForce, v3_move.z));
        }
    }

    onDestroy() {
        this.ExitReMonitor();
    }
}


