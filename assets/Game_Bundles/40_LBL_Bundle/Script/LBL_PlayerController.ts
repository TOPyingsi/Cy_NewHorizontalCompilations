import { _decorator, Animation, Camera, CapsuleCharacterController, CapsuleCollider, Collider, Component, EventKeyboard, EventTouch, geometry, ICollisionEvent, Input, input, ITriggerEvent, KeyCode, Node, PhysicsSystem, RigidBody, SkeletalAnimation, SpotLight, tween, v3, Vec2, Vec3, view } from 'cc';
import { LBL_DataManager } from './LBL_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { LBL_Const } from './LBL_Const';
import { LBL_ColliderType } from './LBL_ColliderType';
import { LBL_PHY_GROUP } from './LBL_PHY_GROUP';
const { ccclass, property } = _decorator;


@ccclass('LBL_PlayerController')
export class LBL_PlayerController extends Component {

    @property(Node)
    point: Node;
    @property(Node)
    core: Node = null;

    @property(Camera)
    UICamera: Camera;


    normalSpeed = 5;

    speed = 0;

    rig: RigidBody;

    light: SpotLight;

    camera: Camera;

    lightTime = 10;

    lightRemainTime = 10;

    cameraRay: geometry.Ray = null;

    isDead: boolean = false;

    isWin: boolean = false;

    lastHouse: Node = null;

    lastCameraPos: Vec3 = null;

    lastCameraWorldPos: Vec3 = null;


    collider:Collider = null;

    initWorldPos:Vec3 = null;

    initCameraRoation:Vec3 = null;

    protected onLoad(): void {

        if(!this.initCameraRoation){
            this.initCameraRoation = v3(this.node.children[0].eulerAngles.clone());
        }
       
        if (!this.collider) {
            this.collider = this.getComponent(Collider);
        }

        if (!this.initWorldPos) {
            this.initWorldPos = this.node.worldPosition.clone();
        }

    }


     openCollider(){
        
        this.collider.on("onCollisionEnter", this.onColliderContact, this);
    }

    closeCollider(){
        this.collider.off("onCollisionEnter", this.onColliderContact, this);
    }

    resetPlayer(){
        // 重置核心状态
        LBL_DataManager.Instance.isPlayerDead = false;
        this.isDead = false;
        this.isWin = false;
    
        // 重置变换属性
        this.node.setWorldPosition(this.initWorldPos);
        this.node.children[0].setRotationFromEuler(this.initCameraRoation);
        
        // 重置物理状态
        if (this.rig) {
            this.rig.setLinearVelocity(Vec3.ZERO);
            this.rig.setAngularVelocity(Vec3.ZERO);
            this.rig.enabled = true;
        }
        
        // 重置碰撞检测
        this.openCollider();
        
        // 重置数据管理器状态
        LBL_DataManager.Instance.isMove = false;
        LBL_DataManager.Instance.isScream = false;
    }

    clearPlayer(){
        this.setPlayerDead();
    }


    onColliderContact(event: ICollisionEvent){
        // 检测到障碍物（墙壁/障碍）
        const colliderType = event.otherCollider.node.name;
        if(colliderType == "monster"){
           LBL_DataManager.Instance.isGameStart = false;
           this.clearPlayer();
        }
   }



    setPlayerDead() {
        LBL_DataManager.Instance.isMove = false;
        LBL_DataManager.Instance.isScream = false;
        LBL_DataManager.Instance.isPlayerDead = true;
        this.isDead = true;
        this.rig.enabled = false;
        // 小碰撞器：检测障碍物和玩家接触
        
        this.collider.off('onTriggerEnter', this.onTriggerEnter, this);
        this.collider.off('onTriggerExit', this.onTriggerExit, this);

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        tween(this.node)
            .delay(0.2)
            .call(() => {
                this.closeCollider();
                EventManager.Scene.emit(LBL_Const.EventName.GameOver);

            })
            .start();
    }


    start() {
        this.cameraRay = new geometry.Ray;
        this.rig = this.node.getComponent(RigidBody);
        this.light = this.node.getComponentInChildren(SpotLight);
        this.camera = this.node.getComponentInChildren(Camera);

        this.rig.useCCD = true;

        this.lastCameraPos = this.camera.node.position;
        this.lastCameraWorldPos = this.camera.node.getWorldPosition();

        let collider = this.node.getComponent(CapsuleCollider);
        collider.on('onTriggerEnter', this.onTriggerEnter, this);
        collider.on('onTriggerExit', this.onTriggerExit, this);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        LBL_DataManager.Instance.delta = v3(0, 0, 0);
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                LBL_DataManager.Instance.isMove = true;
                LBL_DataManager.Instance.delta = v3(-10, LBL_DataManager.Instance.delta.y, LBL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_W:
                LBL_DataManager.Instance.isMove = true;

                LBL_DataManager.Instance.delta = v3(LBL_DataManager.Instance.delta.x, 10, LBL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_S:
                LBL_DataManager.Instance.isMove = true;
                LBL_DataManager.Instance.delta = v3(LBL_DataManager.Instance.delta.x, -10, LBL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_D:
                LBL_DataManager.Instance.isMove = true;

                LBL_DataManager.Instance.delta = v3(10, LBL_DataManager.Instance.delta.y, LBL_DataManager.Instance.delta.z);
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                LBL_DataManager.Instance.isMove = false;
                LBL_DataManager.Instance.delta = v3(0, LBL_DataManager.Instance.delta.y, LBL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_W:
                LBL_DataManager.Instance.isMove = false;
                LBL_DataManager.Instance.delta = v3(LBL_DataManager.Instance.delta.x, 0, LBL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_S:
                LBL_DataManager.Instance.isMove = false;
                LBL_DataManager.Instance.delta = v3(LBL_DataManager.Instance.delta.x, 0, LBL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_D:
                LBL_DataManager.Instance.isMove = false;
                LBL_DataManager.Instance.delta = v3(0, LBL_DataManager.Instance.delta.y, LBL_DataManager.Instance.delta.z);
                break;
        }
    }

    update(deltaTime: number) {

        if (this.isDead || this.isWin) return;

        if (LBL_DataManager.Instance.isFlashlight) {
            this.openFlashlight();
        }
        else {
            this.closeFlashlight();
        }

        if (LBL_DataManager.Instance.isScream) {
            this.speed = this.normalSpeed * 3;
        }
        else {
            this.speed = this.normalSpeed;
        }
        if (LBL_DataManager.Instance.isMove && LBL_DataManager.Instance.delta?.length() > 1) {
            let delta = v3();
            delta = Vec3.normalize(delta, LBL_DataManager.Instance.delta).multiplyScalar(this.speed);
            let v = v3();
            this.rig.getLinearVelocity(v);

            delta.x = delta.x
            delta.z = -delta.y;
            delta.y = v.y;

            // 新增坐标系转换逻辑
            const inverseRotation = this.node.children[0].getWorldRotation();
            Vec3.transformQuat(delta, delta, inverseRotation);


            delta.y = 0;
            this.rig.setLinearVelocity(delta);
        }
        if (!LBL_DataManager.Instance.isMove) {

        }

        else this.rig.useGravity = true;

        if (LBL_DataManager.Instance.currentTargetPos) {
            LBL_DataManager.Instance.currentPlayerPos = this.node.getWorldPosition();
        }
    }

    public interact() {
        // 获取相机组件
        const camera = this.camera;
        if (!camera) return;

        let ray = new geometry.Ray;
        let v = v3();
        this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
        camera.screenPointToRay(v.x, v.y, ray);

        // 射线检测所有碰撞体
        const mask = LBL_PHY_GROUP.Item ; // 检测所有分组
        const maxDistance = 10;
        const queryTrigger = true;


        const targetTypes = [
            LBL_ColliderType.Point,
            LBL_ColliderType.Door,
        ];

        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            const colliderType = result.collider.node.name.split("_")[0];
            if (colliderType && targetTypes.includes(colliderType)) {
                this.handleInteract(result);
            }
        }
    }


    handleInteract(result) {
        switch (result.collider.node.name.split("_")[0]) {
            case LBL_ColliderType.Point:
                result.collider.node.active = false;
                this.handlePoint(result.collider.node.name);
                break;
        }
    }


    handlePoint(pointName) {
        let level = pointName.split("_")[1];
        let round = pointName.split("_")[2];
        let number = pointName.split("_")[3];
        LBL_DataManager.Instance.gotPoint(number);
        let pointData = LBL_DataManager.Instance.levelData[level].round[round][number];
        if (pointData) {
            EventManager.Scene.emit(LBL_Const.EventName.ShowPointTip, pointData);
        }
    }


    public openFlashlight() {
        this.light.enabled = true;
    }

    public closeFlashlight() {
        this.light.enabled = false;
    }


    onTriggerEnter(event: ITriggerEvent) {

    }

    onTriggerExit(event: ITriggerEvent) {

    }

}


