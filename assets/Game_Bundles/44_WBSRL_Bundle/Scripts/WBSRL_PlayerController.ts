import { _decorator, Camera, Component, director, geometry, math, Node, PhysicsRayResult, PhysicsSystem, Quat, RigidBody, tween, v2, v3, Vec2, Vec3 } from 'cc';
import { WBSRL_Joystick } from './WBSRL_Joystick';
import { WBSRL_GameManager } from './WBSRL_GameManager';
import Banner from 'db://assets/Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { WBSRL_CameraController } from './WBSRL_CameraController';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_PlayerController')
export class WBSRL_PlayerController extends Component {
    public static Instance: WBSRL_PlayerController = null;

    @property(Node)
    Camera: Node = null;

    @property
    MaxSpeed: number = 10;

    @property
    rotationSensitivity: number = 0.5;

    @property
    verticalAngleLimit: number = 80;

    @property
    ShakMin: number = 0.1;

    @property
    MaxDistance: number = 0.1;

    @property(WBSRL_CameraController)
    cameraController: WBSRL_CameraController = null;

    IsInteracting: boolean = false;
    IsShowInteracting: boolean = false;

    RigidBody: RigidBody = null;

    private _verticalAngle: number = 0;
    private _dir: Vec2 = new Vec2();
    private _curSpeed: number = 0;

    protected onLoad(): void {
        WBSRL_PlayerController.Instance = this;

        this.RigidBody = this.getComponent(RigidBody);
    }
    private v3_move: Vec3 = v3(0, 0, 0);
    protected update(dt: number): void {
        if (this.IsInteracting) return;
        if (this.RigidBody && this._dir.length() > 0) {
            // 获取玩家当前的Y轴旋转角度
            const playerRotation = this.node.eulerAngles.y * Math.PI / 180; // 转换为弧度

            // 计算相对于玩家朝向的移动方向
            const worldX = this._dir.x * Math.cos(playerRotation) - this._dir.y * Math.sin(playerRotation);
            const worldZ = this._dir.x * Math.sin(playerRotation) + this._dir.y * Math.cos(playerRotation);

            let dir = v3(worldX, 0, -worldZ).normalize();

            let radian = Vec3.angle(Vec3.FORWARD, v3(this.cameraController.node.forward.x, 0, this.cameraController.node.forward.z).normalize());    //Vec3.FORWARD（0，0，-1）

            if (this.cameraController.node.eulerAngles.y < 0) {
                radian = this.cameraController.node.eulerAngles.y % 360 >= -180 ? -radian : radian;
            }

            if (this.cameraController.node.eulerAngles.y > 0) {
                radian = this.cameraController.node.eulerAngles.y % 360 >= 180 ? -radian : radian;
            }

            Vec3.rotateY(this.v3_move, dir, Vec3.ZERO, radian);

            this.RigidBody.setLinearVelocity(this.v3_move.multiplyScalar(this._curSpeed * dt));
        } else {
            this.RigidBody.setLinearVelocity(Vec3.ZERO);
        }

        this.performRaycast();
    }

    SetMove(x: number, y: number, rate: number) {
        this._dir = v2(x, y);
        this._curSpeed = this.MaxSpeed * rate;
    }


    onCameraRotation(dirX: number, dirY: number) {
        if (this.IsInteracting) return;

        // 水平旋转：旋转玩家本体
        // const playerRotation = this.node.eulerAngles.clone();
        // if (Math.abs(dirX * this.rotationSensitivity) > this.ShakMin) {

        //     const playerRotation = new Vec3();
        //     const targetRotation = new Vec3(this.node.eulerAngles.x, this.node.eulerAngles.y - dirX * this.rotationSensitivity, this.node.eulerAngles.z);
        //     Vec3.lerp(playerRotation, this.node.eulerAngles, targetRotation, 1);
        //     this.node.setRotationFromEuler(playerRotation);
        // }
        // // 垂直旋转：旋转摄像机
        // if (this.Camera && Math.abs(dirY * this.rotationSensitivity) > this.ShakMin) {
        //     this._verticalAngle += dirY * this.rotationSensitivity;
        //     this._verticalAngle = Math.max(-this.verticalAngleLimit,
        //         Math.min(this.verticalAngleLimit, this._verticalAngle));

        //     const cameraRotation = new Vec3();
        //     const targetRotation = new Vec3(this._verticalAngle, this.Camera.eulerAngles.y, this.Camera.eulerAngles.z);
        //     Vec3.lerp(cameraRotation, this.Camera.eulerAngles, targetRotation, 1);
        //     this.Camera.setRotationFromEuler(cameraRotation);
        // }
        let eulerAngles = this.cameraController.node.eulerAngles;
        this.cameraController.SetTargetAngle(math.clamp(eulerAngles.x + dirX * this.rotationSensitivity, -80, 80)
            , eulerAngles.y + dirY * this.rotationSensitivity, eulerAngles.z);
    };

    //#region 射线

    private performRaycast() {
        if (this.IsInteracting) return;
        if (!this.Camera) return;
        // 获取摄像机位置和朝向
        const cameraPos = this.Camera.worldPosition;
        const cameraForward = Vec3.FORWARD.clone();

        // 转换到世界坐标系的前方向
        Vec3.transformQuat(cameraForward, cameraForward, this.Camera.worldRotation);

        // 设置射线起点和方向
        const ray: geometry.Ray = new geometry.Ray();
        ray.o.set(cameraPos);
        ray.d.set(cameraForward);

        // 执行射线检测
        if (PhysicsSystem.instance.raycast(ray, -1, this.MaxDistance, true)) {
            if (this.IsShowInteracting) return;
            const results = PhysicsSystem.instance.raycastResults;
            // 检测到碰撞
            for (let i = 0; i < results.length; i++) {
                const hit = results[i]; // 获取最近的碰撞点
                if (hit.collider.node.name == "窗户1") {
                    if (!WBSRL_GameManager.Instance.IsNight) return;
                    this.IsShowInteracting = true;
                    const target: Node = WBSRL_GameManager.Instance.GetPlayerByName(hit.collider.node.name);
                    if (target) {
                        WBSRL_Joystick.Instance.addInteract(
                            () => {
                                this.IsInteracting = true;
                                this.moveToTarget(target, () => {
                                    director.getScene().emit("WBSRL_OpenWindow");
                                    WBSRL_GameManager.Instance.ShowWindowPanel("窗户1");
                                    this.addCameraTargetTexture();
                                });
                            },
                            () => {
                                this.IsInteracting = false;
                                director.getScene().emit("WBSRL_CloseWindow");
                            })
                    }
                } else if (hit.collider.node.name == "窗户2") {
                    if (!WBSRL_GameManager.Instance.IsNight) return;

                    this.IsShowInteracting = true;
                    const target: Node = WBSRL_GameManager.Instance.GetPlayerByName(hit.collider.node.name);
                    if (target) {
                        WBSRL_Joystick.Instance.addInteract(
                            () => {
                                this.IsInteracting = true;
                                this.moveToTarget(target, () => {
                                    director.getScene().emit("WBSRL_OpenWindow");
                                    WBSRL_GameManager.Instance.ShowWindowPanel("窗户2");
                                    this.addCameraTargetTexture();
                                });
                            },
                            () => {
                                this.IsInteracting = false;
                                director.getScene().emit("WBSRL_CloseWindow");
                            })
                    }
                } else if (hit.collider.node.name == "窗户3") {
                    if (!WBSRL_GameManager.Instance.IsNight) return;

                    this.IsShowInteracting = true;
                    const target: Node = WBSRL_GameManager.Instance.GetPlayerByName(hit.collider.node.name);
                    if (target) {
                        WBSRL_Joystick.Instance.addInteract(
                            () => {
                                this.IsInteracting = true;
                                this.moveToTarget(target, () => {
                                    director.getScene().emit("WBSRL_OpenCurtain");
                                    WBSRL_GameManager.Instance.ShowWindowPanel("窗户3");
                                    this.addCameraTargetTexture();
                                });
                            },
                            () => {
                                this.IsInteracting = false;
                                director.getScene().emit("WBSRL_CloseCurtain");
                            })
                    }
                } else if (hit.collider.node.name == "门1") {
                    if (!WBSRL_GameManager.Instance.IsNight) return;

                    this.IsShowInteracting = true;
                    const target: Node = WBSRL_GameManager.Instance.GetPlayerByName(hit.collider.node.name);
                    if (target) {
                        WBSRL_Joystick.Instance.addInteract(
                            () => {
                                this.IsInteracting = true;
                                this.moveToTarget(target, () => {
                                    ProjectEventManager.emit(ProjectEvent.弹出窗口, "我不是人类");
                                    WBSRL_GameManager.Instance.OpenRoomByName(target.name)
                                    this.addCameraTargetTexture();
                                    this.scheduleOnce(() => {
                                        WBSRL_Joystick.Instance.ShowExitButton(true);
                                    }, 1);
                                });
                            },
                            () => {
                                this.IsInteracting = false;
                                // this.scheduleOnce(() => {
                                WBSRL_Joystick.Instance.ShowInteractButton(true);
                                WBSRL_PlayerController.Instance.removeCameraTargetTexture();
                                WBSRL_GameManager.Instance.CloseRoom();
                                // }, 1);
                            })
                    }
                } else if (hit.collider.node.name == "门7") {
                    this.IsShowInteracting = true;
                    const target: Node = WBSRL_GameManager.Instance.GetPlayerByName(hit.collider.node.name);
                    if (target) {
                        WBSRL_Joystick.Instance.addInteract(
                            () => {
                                this.IsInteracting = true;
                                this.moveToTarget(target, () => {
                                    WBSRL_GameManager.Instance.OpenRoomByName(target.name)
                                    director.getScene().emit("WBSRL_OpenDoor");
                                    this.addCameraTargetTexture();
                                    this.scheduleOnce(() => {
                                        WBSRL_Joystick.Instance.ShowExitButton(true);
                                    }, 1);
                                    WBSRL_Joystick.Instance.OpenDoor();
                                });
                            },
                            () => {
                                this.IsInteracting = false;
                                director.getScene().emit("WBSRL_CloseDoor");
                                WBSRL_Joystick.Instance.CloseDoor();
                            })
                    }
                } else if (hit.collider.node.name[0] == "门") {
                    if (WBSRL_GameManager.Instance.IsNight) return;

                    this.IsShowInteracting = true;
                    const target: Node = WBSRL_GameManager.Instance.GetPlayerByName(hit.collider.node.name);
                    if (target) {
                        WBSRL_Joystick.Instance.addInteract(
                            () => {
                                this.IsInteracting = true;
                                this.moveToTarget(target, () => {
                                    WBSRL_GameManager.Instance.OpenRoomByName(target.name)
                                    director.getScene().emit("WBSRL_OpenDoor");
                                    this.addCameraTargetTexture();
                                    this.scheduleOnce(() => {
                                        WBSRL_Joystick.Instance.ShowExitButton(true);
                                    }, 1);
                                    WBSRL_Joystick.Instance.OpenDoor();
                                });
                            },
                            () => {
                                this.IsInteracting = false;
                                director.getScene().emit("WBSRL_CloseDoor");
                                WBSRL_Joystick.Instance.CloseDoor();
                            })
                    }
                }
            }
        } else {
            // 没有检测到碰撞
            if (this.IsShowInteracting) {
                this.IsShowInteracting = false;
                WBSRL_Joystick.Instance.reomveInteract();
            }
        }
    }

    addCameraTargetTexture() {
        this.Camera.getComponent(Camera).targetTexture = WBSRL_GameManager.Instance.RenderTexture;
    }

    removeCameraTargetTexture() {
        this.Camera.getComponent(Camera).targetTexture = null;
    }

    moveToTarget(targetNode: Node, callback?: Function) {
        if (!targetNode) return;

        const targetPos = targetNode.worldPosition.clone();
        let targetAngles = targetNode.eulerAngles.clone();

        // this.cameraController.SetTargetAngle(math.clamp(targetAngles.x, -80, 80)
        //     , targetAngles.y, targetAngles.z);

        // 位置Tween
        tween(this.node)
            .to(1, {
                worldPosition: targetPos
            }, {
                easing: 'smooth',  // 可以是 'linear', 'smooth', 'fade', 'constant' 等
                onComplete: () => {
                    if (callback) callback();
                }
            })
            .start();

        // 旋转Tween（使用自定义插值）
        // const startRot = this.cameraController.node.worldRotation.clone();

        // this.cameraController.SetTargetAngle(math.clamp(targetAngles.x, -80, 80)
        //     , targetAngles.y, targetAngles.z);
        // const v3_0 = this.cameraController.node.eulerAngles
        // const v3_1 = v3(v3_0.x % 360, v3_0.y % 360, v3_0.z % 360)

        // this.cameraController.node.setRotationFromEuler(v3_1);
        if (Math.abs(this.cameraController.node.eulerAngles.y - targetAngles.y) > 180) {
            if (this.cameraController.node.eulerAngles.y > 0) targetAngles.y = math.clamp((targetAngles.y + 360) % 361, -359, 359);
            else targetAngles.y = math.clamp((targetAngles.y - 360) % 361, -359, 359);
        }

        const rotationData = { progress: 0 };
        tween(rotationData)
            .to(1, { progress: 1 }, {
                easing: 'smooth',
                onUpdate: () => {
                    let v3 = this.cameraController.node.eulerAngles;
                    Vec3.slerp(v3, v3, targetAngles, rotationData.progress);
                    this.cameraController.SetTargetAngle(math.clamp(v3.x, -80, 80)
                        , v3.y, v3.z);
                },
                onComplete: () => {
                    this.cameraController.SetTargetAngle(math.clamp(targetAngles.x, -80, 80)
                        , targetAngles.y, targetAngles.z);
                }
            })
            .start();

        // tween(this.Camera)
        //     .to(1, { eulerAngles: new Vec3(0, 180, 0) }, { easing: `smooth` })
        //     .start();

    }


    protected onEnable(): void {
        director.getScene().on("WBHRL_Move", this.SetMove, this);
        director.getScene().on("WBSRL_CameraPlayer", this.onCameraRotation, this);
    }

    protected onDisable(): void {
        director.getScene().off("WBHRL_Move", this.SetMove, this);
        director.getScene().off("WBSRL_CameraPlayer", this.onCameraRotation, this);
    }
}


