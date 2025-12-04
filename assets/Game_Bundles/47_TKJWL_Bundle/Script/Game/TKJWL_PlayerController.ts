import { _decorator, Animation, BoxCollider, Camera, CapsuleCharacterController, CapsuleCollider, clamp, Collider, Component, EventKeyboard, EventTouch, geometry, ICollisionEvent, Input, input, ITriggerEvent, KeyCode, Node, physics, PhysicsSystem, RigidBody, SkeletalAnimation, SpotLight, tween, v3, Vec2, Vec3, view } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';

import { TKJWL_Physics_Group } from '../Common/TKJWL_PHY_GROUP';
import { TKJWL_GameEvents } from '../Common/TKJWL_GameEvents';
import { TKJWL_DataManager } from '../Manager/TKJWL_DataManager';
import { TKJWL_AudioManager } from '../Manager/TKJWL_AudioManager';
const { ccclass, property } = _decorator;


@ccclass('TKJWL_PlayerController')
export class TKJWL_PlayerController extends Component {

    @property(Node)
    point: Node;
    @property(Node)
    core: Node = null;

    @property(Node)
    outLineCameras: Node = null;


    @property(Camera)
    UICamera: Camera;

    @property(Node)
    holdOnItemContainer: Node = null;


    normalSpeed = 5;//15

    speed = 0;

    rig: RigidBody;


    camera: Camera;


    cameraRay: geometry.Ray = null;

    isDead: boolean = false;

    isWin: boolean = false;

    lastHouse: Node = null;

    lastCameraPos: Vec3 = null;

    lastCameraWorldPos: Vec3 = null;


    collider:Collider = null;

    initWorldPos:Vec3 = null;

    initCameraRoation:Vec3 = null;


    private ray: geometry.Ray = new geometry.Ray();
    private v: Vec3 = new Vec3();

    protected onLoad(): void {
        this.addListener();

        if(!this.initCameraRoation){
            this.initCameraRoation = v3(this.node.children[0].eulerAngles.clone());
        }
       
        if (!this.collider) {
            this.collider = this.getComponent(Collider);
        }

        if (!this.initWorldPos) {
            this.initWorldPos = this.node.worldPosition.clone();
        }

        this.camera = this.node.getChildByName("camera").getComponent(Camera);
        this.rig = this.node.getComponent(RigidBody);

        this.cameraRay = new geometry.Ray;

        TKJWL_DataManager.Instance.playerNode = this.node;
    }

    start() {
        this.outLineCameras.active = false;
        this.rig.useCCD = true;

        this.lastCameraPos = this.camera.node.position;
        this.lastCameraWorldPos = this.camera.node.getWorldPosition();

        let collider = this.node.getComponent(CapsuleCollider);
        collider.on('onTriggerEnter', this.onTriggerEnter, this);
        collider.on('onTriggerExit', this.onTriggerExit, this);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

        this.onHideHoldonItem();
    }


     openCollider(){
        
        this.collider.on("onCollisionEnter", this.onColliderContact, this);
    }

    closeCollider(){
        this.collider.off("onCollisionEnter", this.onColliderContact, this);
    }

    resetPlayer(){
        // 重置核心状态
        TKJWL_DataManager.Instance.isFail = false;
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
        TKJWL_DataManager.Instance.isMove = false;
        // TKJWL_DataManager.Instance.isScream = false;
    }

    clearPlayer(){
        this.setPlayerDead();
    }


    onColliderContact(event: ICollisionEvent){
        // 检测到障碍物（墙壁/障碍）
        const colliderType = event.otherCollider.node.name.split("_")[0];
        if(colliderType == "monster"){
                //   this.scheduleOnce(()=>{
                TKJWL_AudioManager.getInstance().playSound("惨叫")
            // },0.5)
        }
   }



    setPlayerDead() {
        TKJWL_DataManager.Instance.isMove = false;
        // TKJWL_DataManager.Instance.isScream = false;
        TKJWL_DataManager.Instance.isFail = true;
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
                EventManager.Scene.emit(TKJWL_GameEvents.GAME_OVER);

            })
            .start();
    }



    onKeyDown(event: EventKeyboard) {
        TKJWL_DataManager.Instance.delta = v3(0, 0, 0);
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                TKJWL_DataManager.Instance.isMove = true;
                TKJWL_DataManager.Instance.delta = v3(-10, TKJWL_DataManager.Instance.delta.y, TKJWL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_W:
                TKJWL_DataManager.Instance.isMove = true;

                TKJWL_DataManager.Instance.delta = v3(TKJWL_DataManager.Instance.delta.x, 10, TKJWL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_S:
                TKJWL_DataManager.Instance.isMove = true;
                TKJWL_DataManager.Instance.delta = v3(TKJWL_DataManager.Instance.delta.x, -10, TKJWL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_D:
                TKJWL_DataManager.Instance.isMove = true;

                TKJWL_DataManager.Instance.delta = v3(10, TKJWL_DataManager.Instance.delta.y, TKJWL_DataManager.Instance.delta.z);
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
                TKJWL_DataManager.Instance.isMove = false;
                TKJWL_DataManager.Instance.delta = v3(0, TKJWL_DataManager.Instance.delta.y, TKJWL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_W:
                TKJWL_DataManager.Instance.isMove = false;
                TKJWL_DataManager.Instance.delta = v3(TKJWL_DataManager.Instance.delta.x, 0, TKJWL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_S:
                TKJWL_DataManager.Instance.isMove = false;
                TKJWL_DataManager.Instance.delta = v3(TKJWL_DataManager.Instance.delta.x, 0, TKJWL_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_D:
                TKJWL_DataManager.Instance.isMove = false;
                TKJWL_DataManager.Instance.delta = v3(0, TKJWL_DataManager.Instance.delta.y, TKJWL_DataManager.Instance.delta.z);
                break;
        }
    }

    onPlayerRotation(deltaEuler: Vec3) {
        if(TKJWL_DataManager.Instance.isTelescopeWatching) return;

        var euler = v3(this.node.eulerAngles);
        euler.add3f(deltaEuler.x, deltaEuler.y, 0);
        euler.x = clamp(euler.x, -50, 50);
        this.node.setRotationFromEuler(euler);
    }

    update(deltaTime: number) {
        if(!TKJWL_DataManager.Instance.isGameStart ) return;
        if(TKJWL_DataManager.Instance.isTelescopeWatching) return;
        if (this.isDead || this.isWin) return;

         this.speed = this.normalSpeed;
        if (TKJWL_DataManager.Instance.isMove && TKJWL_DataManager.Instance.delta?.length() > 1) {
            let delta = v3();
            delta = Vec3.normalize(delta, TKJWL_DataManager.Instance.delta).multiplyScalar(this.speed);
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
        if (!TKJWL_DataManager.Instance.isMove) {
          
        }
        else{
            this.rig.useGravity = true;
        } 
        if (TKJWL_DataManager.Instance.isTelescopeWatching)
            return;
        
        if(TKJWL_DataManager.Instance.isSitting){
            return;
        }

        //检查交互物品
        this.checkInteractItem();

    }



    private checkInteractItem() {
        // 获取相机组件
        const camera = this.camera;
        if (!camera) return;

        let ray = this.ray;
        let v = this.v;
        this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
        camera.screenPointToRay(v.x, v.y, ray);

        // 射线检测所有碰撞体
        const mask = TKJWL_Physics_Group.ITEM | TKJWL_Physics_Group.DEFAULT; // 检测所有分组
        const maxDistance = 4;
        const queryTrigger = true;

        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            let rigidBody = result.collider.node.getComponent(RigidBody);
            if(rigidBody && rigidBody.group == TKJWL_Physics_Group.ITEM){
                this.checkLookAtItem(result.collider.node);
                this.outLineCameras.active = true;
                this.camera.visibility = 1 << 30 ;
                return;
            }
        }
        this.camera.visibility =  1 << 23 | 1 << 30 
        if(TKJWL_DataManager.Instance.isHoldOning){
            this.outLineCameras.active = true;
        }
        else{
            this.outLineCameras.active = false;
        }
        this.checkLookAtItem(null);
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM, null);
        
    }

    checkLookAtItem(item:Node){
        if(!item){
            TKJWL_DataManager.Instance.lookAtItem = null;
        }
        else if(item == TKJWL_DataManager.Instance.lookAtItem){
            return;
        }
        else {
            TKJWL_DataManager.Instance.lookAtItem = item;
        }
        EventManager.Scene.emit(TKJWL_GameEvents.UPDATE_LOOKAT_ITEM);
    }
    

    onShowHoldonItem(nodeName){
        this.holdOnItemContainer.children.forEach(child => {
            if(child.name == nodeName){
                child.active = true;
            }
            else{
                child.active = false;
            }
        });
    }

    onHideHoldonItem(){
        this.holdOnItemContainer.children.forEach(child => {
            child.active = false;
        });
    }


    onTriggerEnter(event: ITriggerEvent) {

    }

    onTriggerExit(event: ITriggerEvent) {

    }

    hidePlayerCamera(){
        this.camera.node.active = false;
    }

    showPlayerCamera(){
        this.camera.node.active = true;
    }


    CreateItem(){
        let createPosNode = this.camera.node.getChildByName("createPoint");
        let item = TKJWL_DataManager.Instance.HoldItem;

        // 获取相机组件
        const camera = this.camera;
        if (!camera) return;
        let ray = this.ray;
        let v = this.v;
        this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
        camera.screenPointToRay(v.x, v.y, ray);

        // 射线检测所有碰撞体
        const mask = TKJWL_Physics_Group.ITEM | TKJWL_Physics_Group.DEFAULT; // 检测所有分组
        const maxDistance = Vec3.distance(this.camera.node.worldPosition, createPosNode.worldPosition);
        const queryTrigger = true;

        let createPos = createPosNode.worldPosition.clone();
        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            let hitPoint = result.hitPoint;

            //获取item的碰撞盒子AABB
            let itemCollider = item.getComponent(BoxCollider);
            let maxSize = Math.max(itemCollider.size.x, itemCollider.size.y, itemCollider.size.z);
            //设置createPos为v到hitPoint的向量，长度为  this.camera.node.worldPosition到hitPoint的距离 - maxSize,长度的起点为this.camera.node.worldPosition
            let dir = Vec3.subtract(new Vec3(), hitPoint, this.camera.node.worldPosition);
            dir.normalize();
            Vec3.add(createPos, this.camera.node.worldPosition, Vec3.multiplyScalar(new Vec3(), dir, Vec3.distance(this.camera.node.worldPosition, hitPoint) - maxSize-0.5));



            // let createPosNode2 = this.camera.node.getChildByName("createPoint2");
            // createPos = createPosNode2.worldPosition.clone();
            createPos = result.hitPoint;
        }

        // createPos = this.camera.node.getChildByName("itemContainer").worldPosition.clone();

        item.setWorldPosition(createPos);
        let euler = v3(item.eulerAngles);
        euler.z = 0;
        euler.x = 0;
        item.setRotationFromEuler(euler);
        item.getComponent(RigidBody).type = physics.ERigidBodyType.DYNAMIC;
        item.getComponent(RigidBody).group = TKJWL_Physics_Group.ITEM;
        item.getComponent(RigidBody).useGravity = true;
        item.getComponent(RigidBody).allowSleep = false;
        item.getComponent(RigidBody).linearFactor = new Vec3(1,0.1,1);
        let collider = item.getComponent(Collider);
        let onColliderContact = (event: ICollisionEvent)=>{
console.log(event.otherCollider.node.name)
            // item.getComponent(RigidBody).type = physics.ERigidBodyType.STATIC;
            // collider.off('onCollisionEnter', onColliderContact, this);
        }
        collider.on('onCollisionEnter', onColliderContact, this);

        item.active = true;

        //更新数据
        TKJWL_DataManager.Instance.HoldItem = null;
        TKJWL_DataManager.Instance.isHoldOning = false;
        TKJWL_DataManager.Instance.targetItemType = null;
        //隐藏悬浮物
        EventManager.Scene.emit(TKJWL_GameEvents.HIDE_HOLD_ON_ITEM,item.name);
        // //隐藏按钮
        // let itemType = this.node.name.split("_")[1];
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM,null)
    }


    addListener() {
        EventManager.on(TKJWL_GameEvents.HIDE_PLAYER_CAMERA, this.hidePlayerCamera,this);
        EventManager.on(TKJWL_GameEvents.SHOW_PLAYER_CAMERA, this.showPlayerCamera,this);
        

        EventManager.on(TKJWL_GameEvents.CAMERA_ROTATION, this.onPlayerRotation,this);
        EventManager.on(TKJWL_GameEvents.SHOW_HOLD_ON_ITEM, this.onShowHoldonItem,this);
        EventManager.on(TKJWL_GameEvents.HIDE_HOLD_ON_ITEM, this.onHideHoldonItem,this);

        EventManager.on(TKJWL_GameEvents.CreateItem, this.CreateItem,this);
        // EventManager.on(TKJWL_GameEvents.START_USE_TELESCOPE, this.startUseTelescope,this);
        // EventManager.on(TKJWL_GameEvents.END_USE_TELESCOPE, this.endUseTelescope,this);
    }

    removeListener() {
        EventManager.off(TKJWL_GameEvents.HIDE_PLAYER_CAMERA, this.hidePlayerCamera,this);
        EventManager.off(TKJWL_GameEvents.SHOW_PLAYER_CAMERA, this.showPlayerCamera,this);

        EventManager.off(TKJWL_GameEvents.CAMERA_ROTATION, this.onPlayerRotation,this);
        EventManager.off(TKJWL_GameEvents.SHOW_HOLD_ON_ITEM, this.onShowHoldonItem,this);
        EventManager.off(TKJWL_GameEvents.HIDE_HOLD_ON_ITEM, this.onHideHoldonItem,this);

        EventManager.off(TKJWL_GameEvents.CreateItem, this.CreateItem,this);

        // EventManager.off(TKJWL_GameEvents.START_USE_TELESCOPE, this.startUseTelescope,this);
        // EventManager.off(TKJWL_GameEvents.END_USE_TELESCOPE, this.endUseTelescope,this);
    }

    protected onDestroy(): void {
        this.removeListener();
    }

}


