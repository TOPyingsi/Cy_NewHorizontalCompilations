import { _decorator, Animation, Camera, CapsuleCharacterController, CapsuleCollider, Component, EventTouch, geometry, ITriggerEvent, Node, PhysicsSystem, RigidBody, v3, Vec2, Vec3, view } from 'cc';
import { TaiKongWaJue_GameUI } from './TaiKongWaJue_GameUI';
import { TaiKongWaJue_CubeManager } from './TaiKongWaJue_CubeManager';
import { TaiKongWaJue_CubeGroup } from './TaiKongWaJue_CubeGroup';
import { TaiKongWaJue_Audio } from './TaiKongWaJue_Audio';
const { ccclass, property } = _decorator;

@ccclass('TaiKongWaJue_PlayerController')
export class TaiKongWaJue_PlayerController extends Component {

    private static instance: TaiKongWaJue_PlayerController;

    public static get Instance(): TaiKongWaJue_PlayerController {
        return this.instance;
    }

    protected onLoad(): void {
        TaiKongWaJue_PlayerController.instance = this;
    }

    @property(Node)
    point: Node;

    @property(Camera)
    UICamera: Camera;

    @property
    speed = 0;

    rig: RigidBody;

    isMove = false;
    isFly = false;
    isO2 = false;

    elc = 50;
    o2 = 60;

    private treasures: number[] = [0, 0, 0, 0, 0, 0];

    public get Treasures(): number[] {
        return this.treasures;
    }

    public set Treasures(value: number[]) {
        this.treasures = value;
        localStorage.setItem("DAHCV_Treasures", JSON.stringify(this.treasures));
    }


    start() {
        this.rig = this.node.getComponent(RigidBody);
        this.rig.useCCD = true;
        if (localStorage.getItem("DAHCV_Treasures") == "" || localStorage.getItem("DAHCV_Treasures") == null) this.treasures = [0, 0, 0, 0, 0, 0];
        else this.treasures = JSON.parse(localStorage.getItem("DAHCV_Treasures"));
        if (localStorage.getItem("DAHCV_Dig") == "" || localStorage.getItem("DAHCV_Dig") == null) localStorage.setItem("DAHCV_Dig", "0");
        if (localStorage.getItem("DAHCV_Fill") == "" || localStorage.getItem("DAHCV_Fill") == null) localStorage.setItem("DAHCV_Fill", "0");
        if (localStorage.getItem("DAHCV_Elc") == "" || localStorage.getItem("DAHCV_Elc") == null) localStorage.setItem("DAHCV_Elc", "0");
        if (localStorage.getItem("DAHCV_Fly") == "" || localStorage.getItem("DAHCV_Fly") == null) localStorage.setItem("DAHCV_Fly", "0");
        if (localStorage.getItem("DAHCV_Video") == "" || localStorage.getItem("DAHCV_Video") == null) localStorage.setItem("DAHCV_Video", "2");
        this.elc = 10 * (1 + parseInt(localStorage.getItem("DAHCV_Elc")));
        let collider = this.node.getComponent(CapsuleCollider);
        collider.on('onTriggerEnter', this.onTriggerEnter, this);
        collider.on('onTriggerExit', this.onTriggerExit, this);
        this.schedule(this.UseO2, 1);
    }

    update(deltaTime: number) {
        if (this.isMove && TaiKongWaJue_GameUI.Instance.delta?.length() > 1) {
            let delta = v3();
            delta = Vec3.normalize(delta, TaiKongWaJue_GameUI.Instance.delta).multiplyScalar(this.speed);
            let v = v3();
            this.rig.getLinearVelocity(v);
            if (this.isFly) {
                this.rig.useGravity = false;
                if (this.node.getPosition().y < 28) v.y = 2;
                else v.y = 0;
            }
            else this.rig.useGravity = true;
            delta.z = -delta.y;
            delta.y = v.y;
            let radian = Vec3.angle(Vec3.FORWARD, v3(this.node.children[0].forward.x, 0, this.node.children[0].forward.z).normalize());
            if (this.node.children[0].eulerAngles.y < 0) {
                radian = this.node.children[0].eulerAngles.y % 360 >= -180 ? -radian : radian;
            }
            if (this.node.children[0].eulerAngles.y > 0) {
                radian = this.node.children[0].eulerAngles.y % 360 >= 180 ? -radian : radian;
            }
            Vec3.rotateY(delta, delta, Vec3.ZERO, radian);
            this.rig.setLinearVelocity(delta);
        }
        else if (this.isFly) {
            this.rig.useGravity = false;
            let v = v3();
            if (this.node.getPosition().y < 28) v.y = 2;
            else v.y = 0;
            this.rig.setLinearVelocity(v);
        }
        else this.rig.useGravity = true;
        // TaiKongWaJue_CubeManager.Instance.CheckGroup();
        if (this.isO2) {
            this.o2 = Math.min(this.o2 + 1, 60);
            TaiKongWaJue_GameUI.Instance.ShowO2();
        }
    }

    UseO2() {
        if (this.isO2) return;
        if (this.o2 <= 0) return TaiKongWaJue_GameUI.Instance.Die();
        this.o2--;
        TaiKongWaJue_GameUI.Instance.ShowO2();
        if (this.o2 < 20) TaiKongWaJue_GameUI.Instance.ShowNeedO2();
    }

    Dig() {
        let ray = new geometry.Ray;
        let camera = this.node.children[0].getComponent(Camera);
        let v = v3();
        this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
        camera.screenPointToRay(v.x, v.y, ray);
        if (PhysicsSystem.instance.raycastClosest(ray, 0xffffffff, 3)) {
            if (this.elc == 0) return TaiKongWaJue_GameUI.Instance.ShowNeedElc();
            this.elc--;
            TaiKongWaJue_GameUI.Instance.ShowElc();
            this.node.children[0].children[0].getComponent(Animation).play();
            console.log(PhysicsSystem.instance.raycastClosestResult.collider.getMask());
            if (PhysicsSystem.instance.raycastClosestResult.collider.getGroup() == 1 << 19) {
                let cube = PhysicsSystem.instance.raycastClosestResult.collider.node;
                let group = cube.parent.parent.getComponent(TaiKongWaJue_CubeGroup);
                group.Dig(cube);
            }
            else if (PhysicsSystem.instance.raycastClosestResult.collider.getGroup() == 1 << 20) {
                let num = 0;
                for (let i = 0; i < this.treasures.length; i++) {
                    const element = this.treasures[i];
                    num += element;
                }
                if (num >= (40 + 10 * parseInt(localStorage.getItem("DAHCV_Fill")))) return TaiKongWaJue_GameUI.Instance.FullPack();
                let trea = PhysicsSystem.instance.raycastClosestResult.collider.node;
                let group = trea.parent.parent.getComponent(TaiKongWaJue_CubeGroup);
                group.DigTreasure(trea);
                TaiKongWaJue_Audio.Instance.PlayAudio("trea");
            }
        }
    }


    onTriggerEnter(event: ITriggerEvent) {
        if (event.otherCollider.node.name == "Home") TaiKongWaJue_GameUI.Instance.ShowHome();
        else if (event.otherCollider.node.name == "O2") this.isO2 = true;
    }

    onTriggerExit(event: ITriggerEvent) {
        if (event.otherCollider.node.name == "Home") TaiKongWaJue_GameUI.Instance.CloseHome();
        else if (event.otherCollider.node.name == "O2") this.isO2 = false;
    }

}


