import { _decorator, Animation, AudioSource, Camera, CapsuleCharacterController, CapsuleCollider, Component, EventKeyboard, EventTouch, geometry, Input, input, ITriggerEvent, KeyCode, Node, PhysicsSystem, RigidBody, SkeletalAnimation, SpotLight, tween, v3, Vec2, Vec3, view } from 'cc';
import { JJTW_DataManager } from './JJTW_DataManager';
import { JJTW_ColliderGroupNumber, JJTW_ColliderGroupType } from './JJTW_ColliderGroupNumber';
import { JJTW_GameUI } from './JJTW_GameUI';
// import { DiggingAHoleCV_GameUI } from './DiggingAHoleCV_GameUI';
// import { DiggingAHoleCV_CubeManager } from './DiggingAHoleCV_CubeManager';
// import { DiggingAHoleCV_CubeGroup } from './DiggingAHoleCV_CubeGroup';
// import { DiggingAHoleCV_Audio } from './DiggingAHoleCV_Audio';
const { ccclass, property } = _decorator;

@ccclass('JJTW_PlayerController')
export class JJTW_PlayerController extends Component {

    private static instance: JJTW_PlayerController;

    public static get Instance(): JJTW_PlayerController {
        return this.instance;
    }

    protected onLoad(): void {
        JJTW_PlayerController.instance = this;
    }

    @property(Node)
    point: Node;

    @property(Camera)
    UICamera: Camera;

    // @property(Node)
    // point: Node;

    // @property(Camera)
    // UICamera: Camera;

    @property(JJTW_GameUI)
    GameUI:JJTW_GameUI;

    normalSpeed = 3.3;

    speed = 0;

    rig: RigidBody;

    anim: SkeletalAnimation;

    light:SpotLight;

    camera:Camera;

    // 新增：复用的Ray对象
    private ray: geometry.Ray = new geometry.Ray();


    lightTime = 10;

    lightRemainTime = 10;

    cameraRay:geometry.Ray =null;

    isDead :boolean = false;

    isWin:boolean = false;

    lastHouse:Node = null;

    lastCameraPos:Vec3 = null;

    lastCameraWorldPos:Vec3 = null;

    distance = 0;

    // isMove = false;
    // isFly = false;

    // elc = 50;

    // private treasures: number[] = [0, 0, 0, 0, 0, 0];

    // public get Treasures(): number[] {
    //     return this.treasures;
    // }

    // public set Treasures(value: number[]) {
    //     this.treasures = value;
    //     localStorage.setItem("DAHCV_Treasures", JSON.stringify(this.treasures));
    // }

     
    setPlayerDead(){
        JJTW_DataManager.Instance.isMove = false;
        JJTW_DataManager.Instance.isScream = false;
        JJTW_DataManager.Instance.isPlayerDead = true;
        this.isDead = true;
        this.rig.enabled = false;
        this.anim.crossFade("dead",0.5); 
        this.getComponent(JJTW_ColliderGroupNumber).destroy();
        // 小碰撞器：检测障碍物和玩家接触
        let collider = this.node.getComponent(CapsuleCollider);
        collider.off('onTriggerEnter', this.onTriggerEnter, this);
        collider.off('onTriggerExit', this.onTriggerExit, this);

        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.getComponent(JJTW_ColliderGroupNumber).destroy();
        tween(this.node)
        .delay(1)
       .call(()=>{
        this.GameUI.showDeadAnim();
       })
       .start();
    }


    start() {
        this.cameraRay = new geometry.Ray;
        this.anim = this.node.getComponent(SkeletalAnimation);
        this.rig = this.node.getComponent(RigidBody);
        this.light = this.node.getComponentInChildren(SpotLight);
        this.camera = this.node.getComponentInChildren(Camera);

        this.rig.useCCD = true;

        let rayPos = this.node.getChildByName("rayPos").position;
        this.lastCameraPos = this.camera.node.position;
        // 计算方向向量（从rayPos指向lastCameraPos）
        // let direction = new Vec3();
        // Vec3.subtract(direction, this.lastCameraPos, rayPos);
        // direction.normalize(); // 归一化为单位向量

        this.lastCameraWorldPos = this.camera.node.getWorldPosition();
        this.distance = Vec3.distance(this.lastCameraWorldPos, this.node.getChildByName("rayPos").getWorldPosition());
        // if (localStorage.getItem("DAHCV_Treasures") == "" || localStorage.getItem("DAHCV_Treasures") == null) this.treasures = [0, 0, 0, 0, 0, 0];
        // else this.treasures = JSON.parse(localStorage.getItem("DAHCV_Treasures"));
        // if (localStorage.getItem("DAHCV_Dig") == "" || localStorage.getItem("DAHCV_Dig") == null) localStorage.setItem("DAHCV_Dig", "0");
        // if (localStorage.getItem("DAHCV_Fill") == "" || localStorage.getItem("DAHCV_Fill") == null) localStorage.setItem("DAHCV_Fill", "0");
        // if (localStorage.getItem("DAHCV_Elc") == "" || localStorage.getItem("DAHCV_Elc") == null) localStorage.setItem("DAHCV_Elc", "0");
        // if (localStorage.getItem("DAHCV_Fly") == "" || localStorage.getItem("DAHCV_Fly") == null) localStorage.setItem("DAHCV_Fly", "0");
        // if (localStorage.getItem("DAHCV_Video") == "" || localStorage.getItem("DAHCV_Video") == null) localStorage.setItem("DAHCV_Video", "2");
        // this.elc = 10 * (1 + parseInt(localStorage.getItem("DAHCV_Elc")));
        let collider = this.node.getComponent(CapsuleCollider);
        collider.on('onTriggerEnter', this.onTriggerEnter, this);
        collider.on('onTriggerExit', this.onTriggerExit, this);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

     onKeyDown (event: EventKeyboard) {
        JJTW_DataManager.Instance.delta = v3(0,0,0);
        switch(event.keyCode) {
            case KeyCode.KEY_A:
                JJTW_DataManager.Instance.isMove = true;
                // console.log("a");
                JJTW_DataManager.Instance.delta = v3(-10,JJTW_DataManager.Instance.delta.y,JJTW_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_W:
                //  console.log("w");
                JJTW_DataManager.Instance.isMove = true;

                 JJTW_DataManager.Instance.delta = v3(JJTW_DataManager.Instance.delta.x,10,JJTW_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_S:
                //  console.log("s");
                JJTW_DataManager.Instance.isMove = true;
                JJTW_DataManager.Instance.delta = v3(JJTW_DataManager.Instance.delta.x,-10,JJTW_DataManager.Instance.delta.z);
                break;       
            case KeyCode.KEY_D:
                //  console.log("d");
                JJTW_DataManager.Instance.isMove = true;

                JJTW_DataManager.Instance.delta = v3(10,JJTW_DataManager.Instance.delta.y,JJTW_DataManager.Instance.delta.z);
                break;
        }
    }
// JJTW_DataManager.Instance.delta = 

    onKeyUp(event: EventKeyboard){
        switch(event.keyCode) {
             case KeyCode.KEY_A:
                JJTW_DataManager.Instance.isMove = false;
                JJTW_DataManager.Instance.delta = v3(0,JJTW_DataManager.Instance.delta.y,JJTW_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_W:
                JJTW_DataManager.Instance.isMove = false;
                 JJTW_DataManager.Instance.delta = v3(JJTW_DataManager.Instance.delta.x,0,JJTW_DataManager.Instance.delta.z);
                break;
            case KeyCode.KEY_S:
                JJTW_DataManager.Instance.isMove = false;
                JJTW_DataManager.Instance.delta = v3(JJTW_DataManager.Instance.delta.x,0,JJTW_DataManager.Instance.delta.z);
                break;       
            case KeyCode.KEY_D:
                JJTW_DataManager.Instance.isMove = false;
                JJTW_DataManager.Instance.delta = v3(0,JJTW_DataManager.Instance.delta.y,JJTW_DataManager.Instance.delta.z);
                break;
        }
    }

    update(deltaTime: number) {

        if(this.isDead || this.isWin) return;

        if(JJTW_DataManager.Instance.isFlashlight){
            this.openFlashlight();
        }
        else{
            this.closeFlashlight();
        }

        if(JJTW_DataManager.Instance.isScream){
            this.speed = this.normalSpeed * 3; 
            if(JJTW_DataManager.Instance.isMove){
                if(!this.getComponent(AudioSource).playing){
                    this.getComponent(AudioSource).play();
                }
            }
            else{
                  if(!this.getComponent(AudioSource).playing){
                    this.getComponent(AudioSource).stop();
                }
            }
        }
        else{
            this.speed = this.normalSpeed; 
            this.getComponent(AudioSource).stop();
        }
        if (JJTW_DataManager.Instance.isMove && JJTW_DataManager.Instance.delta?.length() > 1) {
            if(JJTW_DataManager.Instance.isScream){
                const currentState = this.anim.getState('run');
                if (!currentState?.isPlaying) {
                    this.anim.crossFade('run', 1);
                }
            }
            else{
                const currentState = this.anim.getState('walk');
                if (!currentState?.isPlaying) {
                    this.anim.crossFade('walk', 1);
                }
            }
            // console.log(JJTW_DataManager.Instance.delta)
            let delta = v3();
            delta = Vec3.normalize(delta, JJTW_DataManager.Instance.delta).multiplyScalar(this.speed);
            let v = v3();
            this.rig.getLinearVelocity(v);
            // if (this.isFly) {
            //     this.rig.useGravity = false;
            //     if (this.node.getPosition().y < 26) v.y = 2;
            //     else v.y = 0;
            // }
            // else this.rig.useGravity = true;
            delta.x = - delta.x
            delta.z = delta.y;
            delta.y = v.y;

              // 新增坐标系转换逻辑
            const inverseRotation = this.node.getWorldRotation();
            Vec3.transformQuat(delta, delta, inverseRotation);

            // let radian = Vec3.angle(Vec3.FORWARD, v3(this.node.children[0].forward.x, 0, this.node.children[0].forward.z).normalize());
            // if (this.node.children[0].eulerAngles.y < 0) {
            //     radian = this.node.children[0].eulerAngles.y % 360 >= -180 ? -radian : radian;
            // }
            // if (this.node.children[0].eulerAngles.y > 0) {
            //     radian = this.node.children[0].eulerAngles.y % 360 >= 180 ? -radian : radian;
            // }
            // Vec3.rotateY(delta, delta, Vec3.ZERO, radian);
            delta.y = 0;
            this.rig.setLinearVelocity(delta);
        }
        if(!JJTW_DataManager.Instance.isMove){
            const currentState = this.anim.getState('idle');
            if (!currentState?.isPlaying) {
                this.anim.crossFade('idle', 1);
            }
        }
        // else if (this.isFly) {
        //     this.rig.useGravity = false;
        //     let v = v3();
        //     if (this.node.getPosition().y < 26) v.y = 2;
        //     else v.y = 0;
        //     this.rig.setLinearVelocity(v);
        // }
        else this.rig.useGravity = true;

        if(JJTW_DataManager.Instance.currentTargetPos){
            JJTW_DataManager.Instance.currentPlayerPos = this.node.getWorldPosition();
        }
        // DiggingAHoleCV_CubeManager.Instance.CheckGroup();

        //    // 获取相机组件
        // const camera = this.camera;
        // if (!camera) return;



        // let v = v3();
        // let rayPos = this.node.getChildByName("rayPos").worldPosition;
        // let targetPos = this.camera.node.getWorldPosition();
        // // let a = 0;
        // // let direction = v3();
        // // Vec3.subtract(direction, targetPos, rayPos);
        // // Vec3.normalize(direction, direction);
        // // this.cameraRay.o = rayPos;
        // // this.cameraRay.d = direction;

        // // 复用已有Ray对象，而非每次new
        // geometry.Ray.fromPoints(this.cameraRay, rayPos, targetPos);

        // // 射线检测时传入mask，过滤无关层
        // // PhysicsSystem.instance.raycastClosest(this.ray);

        // // camera.screenPointToRay(v.x, v.y, this.cameraRay);
        //       // 检测到障碍物
        //     const targetTypes = [
        //         JJTW_ColliderGroupType.Wall,
        //         JJTW_ColliderGroupType.Barrier,
        //         JJTW_ColliderGroupType.Door_1,
        //         JJTW_ColliderGroupType.Door_2,
        //         JJTW_ColliderGroupType.Door_3,
        //         JJTW_ColliderGroupType.Door_4,
        //         JJTW_ColliderGroupType.Door_5,
        //         JJTW_ColliderGroupType.Door_6,
        //         JJTW_ColliderGroupType.Door_Normal,
        //         JJTW_ColliderGroupType.Floor,
        //     ];

        // if (PhysicsSystem.instance.raycastClosest(this.cameraRay),0xffffffff , this.distance) {
        // const result = PhysicsSystem.instance.raycastClosestResult;
        //     const colliderGroup = result.collider.node.getComponent(JJTW_ColliderGroupNumber);
        //     if (colliderGroup && targetTypes.includes(colliderGroup.groupType)) {
        //         // if(colliderGroup && colliderGroup.groupType == JJTW_ColliderGroupType.Wall){
        //             this.camera.node.setWorldPosition(result.hitPoint);
        //         }
        //         else{
        //             if(this.lastCameraPos){
        //                 this.camera.node.setPosition(this.lastCameraPos);
        //             }
        //         }
        //     // }
        // }
    }



    public interact(){
        // 获取相机组件
        const camera = this.camera;
        if (!camera) return;

        let ray = new geometry.Ray;
        let v = v3();
        this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
        camera.screenPointToRay(v.x, v.y, ray);

        // // 创建射线
        // const ray = new geometry.Ray();
        // // 从屏幕中心发射射线
        // const screenCenter = new Vec2(view.getVisibleSize().width/2, view.getVisibleSize().height/2);
        // camera.screenPointToRay(screenCenter.x, screenCenter.y, ray);

        // 射线检测所有碰撞体
        const mask = 0xffffffff; // 检测所有分组
        const maxDistance = 10000000;
        const queryTrigger = true;
        
        const targetTypes = [
                JJTW_ColliderGroupType.Key,
                JJTW_ColliderGroupType.Compass_1,
                JJTW_ColliderGroupType.Compass_2,
                JJTW_ColliderGroupType.Compass_3,
                JJTW_ColliderGroupType.Compass_4,
                JJTW_ColliderGroupType.Compass_5,
                JJTW_ColliderGroupType.Compass_6,
                JJTW_ColliderGroupType.File,
                JJTW_ColliderGroupType.Door_1,
                JJTW_ColliderGroupType.Door_2,
                JJTW_ColliderGroupType.Door_3,
                JJTW_ColliderGroupType.Door_4,
                JJTW_ColliderGroupType.Door_5,
                JJTW_ColliderGroupType.Door_6,
                JJTW_ColliderGroupType.Door_Normal,
                JJTW_ColliderGroupType.Door_Exit,
                JJTW_ColliderGroupType.Door_Stair_1,
                JJTW_ColliderGroupType.Door_Stair_2
            ];

        if (PhysicsSystem.instance.raycastClosest(ray)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            const colliderGroup = result.collider.node.getComponent(JJTW_ColliderGroupNumber);
            if (colliderGroup && targetTypes.includes(colliderGroup.groupType)) {
                this.handleInteract(result);
            }
        }
    }


    handleInteract(result){
        if(!result) return;

          switch(result.collider.node.getComponent(JJTW_ColliderGroupNumber).groupType) {
                case JJTW_ColliderGroupType.Key:
                    JJTW_DataManager.Instance.keyData.isGot = true;
                    this.handleItem(result);
                    break;
                case JJTW_ColliderGroupType.Compass_1:
                    JJTW_DataManager.Instance.compassData[0].isGot = true;
                    this.handleItem(result);
                    break;
                case JJTW_ColliderGroupType.Compass_2:
                    JJTW_DataManager.Instance.compassData[1].isGot = true;
                    this.handleItem(result);
                    break;
                case JJTW_ColliderGroupType.Compass_3:
                    JJTW_DataManager.Instance.compassData[2].isGot = true;
                    this.handleItem(result);
                    break;
                case JJTW_ColliderGroupType.Compass_4:
                    JJTW_DataManager.Instance.compassData[3].isGot = true;
                    this.handleItem(result);
                    break;
                case JJTW_ColliderGroupType.Compass_5:
                    JJTW_DataManager.Instance.compassData[4].isGot = true;
                    this.handleItem(result);
                    break;
                case JJTW_ColliderGroupType.Compass_6:
                    JJTW_DataManager.Instance.compassData[5].isGot = true;
                    this.handleItem(result);
                    break;
                case JJTW_ColliderGroupType.File:
                    JJTW_DataManager.Instance.fileData.isGot = true;
                    this.handleItem(result);
                    break;
                case JJTW_ColliderGroupType.Door_1:
                    this.handleKeyDoor(result);
                    break;
                case JJTW_ColliderGroupType.Door_2:
                    this.handleKeyDoor(result);
                    break;
                case JJTW_ColliderGroupType.Door_3:
                    this.handleKeyDoor(result);
                    break;
                case JJTW_ColliderGroupType.Door_4:
                    this.handleKeyDoor(result);
                    break;
                case JJTW_ColliderGroupType.Door_5:
                    this.handleKeyDoor(result);
                    break;
                case JJTW_ColliderGroupType.Door_6:
                    this.handleKeyDoor(result);
                    break;
                case JJTW_ColliderGroupType.Door_Stair_1:
                    JJTW_DataManager.Instance.isDownStairDoorOpen = true;
                    this.handleNormalDoor(result);
                    break;
                case JJTW_ColliderGroupType.Door_Stair_2:
                    JJTW_DataManager.Instance.isUpStairDoorOpen = true;
                    this.handleNormalDoor(result);
                    break;
                case JJTW_ColliderGroupType.Door_Normal:
                    this.handleNormalDoor(result);
                    break;
                case JJTW_ColliderGroupType.Door_Exit:
                    this.handleEXITDoor(result);
                    break;
            }
    }

    handleItem(result){
        result.collider.node.active = false;
        this.GameUI.updateBag();
    }


    handleKeyDoor(result){
        if(JJTW_DataManager.Instance.keyData.isGot){
            result.collider.node.getComponent(JJTW_ColliderGroupNumber).setDoorOpen();
            result.collider.node.active= false;
        }
        else{
            this.GameUI.showKeyDoorTip();
        }
    }

    handleNormalDoor(result){
        result.collider.node.getComponent(JJTW_ColliderGroupNumber).setDoorOpen();
        result.collider.node.active= false;
    }

    handleEXITDoor(result){
        let isAllSet = true;
        let noSetCompasses:{
            id: number;
            worldPos: Vec3;
            isGot: boolean;
            isSet: boolean;
            floorNumber: number;
            }[] = [];
        for(let i = 0; i < JJTW_DataManager.Instance.compassData.length; i++){
            if(!JJTW_DataManager.Instance.compassData[i].isSet){
                isAllSet = false;
                if(JJTW_DataManager.Instance.compassData[i].isGot ){
                    noSetCompasses.push(JJTW_DataManager.Instance.compassData[i]);
                    break;
                }
            }
        }
        if(isAllSet){
            result.collider.node.getComponent(JJTW_ColliderGroupNumber).setDoorOpen();
            result.collider.node.active= false;
        }
        else{
          if(noSetCompasses.length > 0){
            for(let i = 0; i < noSetCompasses.length; i++){
                result.collider.node.getComponent(JJTW_ColliderGroupNumber).compassNode[noSetCompasses[i].id].active = true;
                noSetCompasses[i].isSet = true;
            }
             this.GameUI.updateBag();
          }
          else{
            this.GameUI.showExitDoorTip();
          }
        }
    }

    public openFlashlight(){
        this.light.enabled = true;
    }

    public closeFlashlight(){
        this.light.enabled = false;
    }


    onTriggerEnter(event: ITriggerEvent) {
        // 检测到障碍物（墙壁/障碍）
        const colliderGroup = event.otherCollider.node.getComponent(JJTW_ColliderGroupNumber);
        if(colliderGroup){
            //
            if(colliderGroup.groupType == JJTW_ColliderGroupType.Exit_End){
                    JJTW_DataManager.Instance.isMove = false;
                    JJTW_DataManager.Instance.isScream = false;
                    JJTW_DataManager.Instance.isPlayerDead = true;
                    this.isWin = true;
                    this.rig.enabled = false;
                    this.getComponent(JJTW_ColliderGroupNumber).destroy();
                    // 小碰撞器：检测障碍物和玩家接触
                    let collider = this.node.getComponent(CapsuleCollider);
                    collider.off('onTriggerEnter', this.onTriggerEnter, this);
                    collider.off('onTriggerExit', this.onTriggerExit, this);
            
                    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
                    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
                    this.getComponent(JJTW_ColliderGroupNumber).destroy();
                    tween(this.node)
                   .call(()=>{
                    this.GameUI.showWinAnim();
                   })
                   .start();
                          
            } 
        }
        // if (event.otherCollider.node.name == "Home") DiggingAHoleCV_GameUI.Instance.ShowHome();
    }

    onTriggerExit(event: ITriggerEvent) {
        // if (event.otherCollider.node.name == "Home") DiggingAHoleCV_GameUI.Instance.CloseHome();
    }

}


