import { _decorator, Component, Vec3, v3, tween, Tween, Node, Quat, director } from 'cc';

const { ccclass, property } = _decorator;

const v3_0 = v3();
const v = v3();
const quat_0: Quat = new Quat();

@ccclass('WBSRL_CameraController')
export class WBSRL_CameraController extends Component {

    private _targetAngles: Vec3 = v3();
    private _target: Node = null;
    private _rotationToEnemy: boolean = false;

    private shakeDuration: number = 0.12;
    private shakeIntensity: number = 0.3;
    private originalPosition: Vec3 = new Vec3();
    private shakeTime: number = 0;
    private isShaking: boolean = false;

    private isUnlock: boolean = false;//是否锁定状态

    protected start(): void {
        // 记录摄像机的原始位置
        this.originalPosition.set(this.node.position);

    }
    protected onDestroy(): void {

    }
    LookAtTarget(node: Node) {
        this._rotationToEnemy = true;
        this._target = node;
    }

    Reset() {
        this._target = null;
        this._rotationToEnemy = false;
    }

    SetTargetAngle(x: number, y: number, z: number) {
        this._targetAngles.set(x, y, z);
    }

    Shake(range: number, time: number) {
        if (this.isShaking) return;


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
            v3_0.set(v3(v3_0.x % 360, v3_0.y % 360, v3_0.z % 360));
            this.SetCameraPos1();
        }


    }
    public Isthirdperson: boolean = false;//是否是第三人称
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
}