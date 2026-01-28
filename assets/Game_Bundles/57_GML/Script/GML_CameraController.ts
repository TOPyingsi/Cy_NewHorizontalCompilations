import { _decorator, Component, Vec3, v3, tween, Tween, Node, Quat, director } from 'cc';
// import { EventController, GML_Events } from './EventController';
import { GML_CameraAssist2 } from './GML_CameraAssist2';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { GML_Events } from './GML_Events';

const { ccclass, property } = _decorator;

const v3_0 = v3();
const v = v3();
const quat_0: Quat = new Quat();

@ccclass('GML_CameraController')
export class GML_CameraController extends Component {

    @property(Node)
    public bindNode: Node = null;

    private _targetAngles: Vec3 = v3();
    private _target: Node = null;
    private _rotationToEnemy: boolean = false;

    private shakeDuration: number = 0.12;
    private shakeIntensity: number = 0.3;
    private originalPosition: Vec3 = new Vec3();
    private shakeTime: number = 0;
    private isShaking: boolean = false;

    private isUnlock: boolean = false;//是否锁定状态
    private isBoundToNewNode: boolean = false;//是否已绑定到新节点
    private initialParent: Node = null;//初始父节点
    private initialLocalPosition: Vec3 = new Vec3();//初始本地位置
    private initialLocalRotation: Quat = new Quat();//初始本地旋转
    private initialIsthirdperson: boolean = false;//初始第三人称状态
    private boundCameraAssist: GML_CameraAssist2 = null;//绑定的相机辅助组件

    private initTargetAngles: Vec3 = v3();

    protected start(): void {

        this.addListener();

        // 记录摄像机的原始位置
        this.originalPosition.set(this.node.position);
        // EventController.on(GML_Events.Shake, this.Shake, this);
        
        // 保存相机的初始状态
        this.initialParent = this.node.parent;
        this.initialLocalPosition = this.node.position.clone();
        this.initialLocalRotation = this.node.rotation.clone();
        this.initialIsthirdperson = this.Isthirdperson;
        this.boundCameraAssist = this.getComponent(GML_CameraAssist2);
    }


    LookAtTarget(node: Node) {
        this._rotationToEnemy = true;
        this._target = node;
    }

    Reset() {
        this._target = null;
        this._rotationToEnemy = false;
    }

    SetInitTargetAngle(x: number, y: number, z: number) {
        
        let worldPosition = this.node.parent.parent.worldPosition.clone();

        let node = new Node();
        node.parent =  this.bindNode;
        node.setWorldPosition(worldPosition);
        
        // 将相机设置到新节点下，保持当前世界位置和旋转
        let worldPosition2 =  this.node.parent.worldPosition.clone();
        this.node.parent.setParent(node);
        this.node.parent.setWorldPosition(worldPosition2);
        

        this.initTargetAngles.set(x, y, z);
        this._targetAngles.set(x, y, z);
    }

    SetTargetAngle(x: number, y: number, z: number) {
        this._targetAngles.set(x, y, z);
    }

    Shake(range: number, time: number) {
        if (this.isShaking) return;
        let camTs = this.getComponent(GML_CameraAssist2);
        if (camTs) {
            camTs.enabled = false;

            this.scheduleOnce(() => {
                camTs.enabled = true;
            }, this.shakeDuration);
        }


        this.shakeIntensity = range;
        this.shakeDuration = time;
        this.isShaking = true;
        this.shakeTime = 0;
    }

    protected update(dt: number): void {
        if (!this.isShaking) return;
        this.shakeTime += dt;

        if (this.shakeTime >= this.shakeDuration) {
            // 晃动结束，恢复摄像机位置
            this.isShaking = false;
            this.node.position = this.originalPosition;
            return;
        }

        // 生成随机的摄像机偏移
        const offsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
        const offsetY = (Math.random()) * 2 * this.shakeIntensity;

        // 应用摄像机偏移
        this.node.position = new Vec3(this.originalPosition.x + offsetX, this.originalPosition.y + offsetY, this.originalPosition.z);
    }

    lateUpdate(deltaTime: number) {
        if (this.isUnlock) return;
        if (this._rotationToEnemy && this._target) {
            Vec3.subtract(v, this._target.worldPosition, this.node.worldPosition);
            Quat.fromViewUp(quat_0, v.normalize());
            Quat.rotateY(quat_0, quat_0, Math.PI);
            Quat.lerp(quat_0, this.node.rotation, quat_0, 0.1);
            this.node.setRotation(quat_0);
        }

        if (this.Isthirdperson) {
            v3_0.set(this.node.parent.eulerAngles);
            Vec3.lerp(v3_0, v3_0, this._targetAngles, 0.5);
            this.SetCameraPos();
        } else {
            v3_0.set(this.node.eulerAngles);
            Vec3.lerp(v3_0, v3_0, this._targetAngles, 0.5);
            this.SetCameraPos1();
        }


    }
    public Isthirdperson: boolean = true;//是否是第三人称
    //如果是第三人称需要设定相机位置
    SetCameraPos() {
        this.node.parent.setRotationFromEuler(v3_0);
    }
    //如果是第一人称
    SetCameraPos1() {
        this.node.setRotationFromEuler(v3_0);
    }
    //锁定相机
    public KeepTime(Time: number) {
        this.isUnlock = true;
        this.scheduleOnce(() => {
            this.isUnlock = false;
        }, Time)
    }
    
    /**
     * 固定相机
     */
    public FixedCamera(): void {
        if (!this.bindNode) return;

        let worldPosition = this.node.parent.parent.worldPosition.clone();

        let node = new Node();
        node.parent =  this.bindNode;
        node.setWorldPosition(worldPosition);

        // 记录当前状态并停止相机更新
        this.isBoundToNewNode = true;
        this.isUnlock = false;
        
        // 将相机设置到新节点下，保持当前世界位置和旋转
        let worldPosition2 =  this.node.parent.worldPosition.clone();
        this.node.parent.setParent(node);
        this.node.parent.setWorldPosition(worldPosition2);
        
        // 禁用相机辅助组件
        if (this.boundCameraAssist) {
            this.boundCameraAssist.enabled = false;
        }
        
        // 停止旋转到敌人功能
        this.Reset();
    }
    
    /**
     * 恢复相机到初始状态
     */
    public RestoreInitialState(): void {
        if (!this.isBoundToNewNode) return;
        
        // 恢复初始状态
        this.isBoundToNewNode = false;
        this.isUnlock = false;
        
        // 将相机设置回初始父节点
        if (this.initialParent) {
            this.node.setParent(this.initialParent, true);
            this.node.setPosition(this.initialLocalPosition);
            this.node.setRotation(this.initialLocalRotation);
        }
        
        // 恢复初始第三人称状态
        this.Isthirdperson = this.initialIsthirdperson;
        
        // 启用相机辅助组件
        if (this.boundCameraAssist) {
            this.boundCameraAssist.enabled = true;
        }

        // 重置目标角度
        this._targetAngles.set(this.initTargetAngles);
    }


    

    addListener(){

        EventManager.on(GML_Events.FIXED_CAMERA, this.FixedCamera, this);
    }

    removeListener(){
        EventManager.off(GML_Events.FIXED_CAMERA, this.FixedCamera, this);
    }

    // 车辆销毁前重置刚体速度，防止内存残留
    protected onDestroy(): void {
        this.removeListener();
    }
}