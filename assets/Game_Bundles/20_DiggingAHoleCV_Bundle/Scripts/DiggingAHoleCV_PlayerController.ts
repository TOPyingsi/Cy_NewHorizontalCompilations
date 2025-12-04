import { _decorator, Animation, Camera, CapsuleCharacterController, CapsuleCollider, Component, EventTouch, geometry, ITriggerEvent, Node, PhysicsSystem, RigidBody, v3, Vec2, Vec3, view } from 'cc';
import { DiggingAHoleCV_GameUI } from './DiggingAHoleCV_GameUI';
import { DiggingAHoleCV_CubeManager } from './DiggingAHoleCV_CubeManager';
import { DiggingAHoleCV_CubeGroup } from './DiggingAHoleCV_CubeGroup';
import { DiggingAHoleCV_Audio } from './DiggingAHoleCV_Audio';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHoleCV_PlayerController')
export class DiggingAHoleCV_PlayerController extends Component {

    private static instance: DiggingAHoleCV_PlayerController;

    public static get Instance(): DiggingAHoleCV_PlayerController {
        return this.instance;
    }

    protected onLoad(): void {
        DiggingAHoleCV_PlayerController.instance = this;
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

    elc = 50;

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
    }

    update(deltaTime: number) {
        if (this.isMove && DiggingAHoleCV_GameUI.Instance.delta?.length() > 1) {
            let delta = v3();
            delta = Vec3.normalize(delta, DiggingAHoleCV_GameUI.Instance.delta).multiplyScalar(this.speed);
            let v = v3();
            this.rig.getLinearVelocity(v);
            if (this.isFly) {
                this.rig.useGravity = false;
                if (this.node.getPosition().y < 26) v.y = 2;
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
            if (this.node.getPosition().y < 26) v.y = 2;
            else v.y = 0;
            this.rig.setLinearVelocity(v);
        }
        else this.rig.useGravity = true;
        // DiggingAHoleCV_CubeManager.Instance.CheckGroup();
    }

    Dig() {
        if (this.elc == 0) return DiggingAHoleCV_GameUI.Instance.ShowNeedElc();
        this.elc--;
        DiggingAHoleCV_GameUI.Instance.ShowElc();
        this.node.children[0].children[0].getComponent(Animation).play();
        let ray = new geometry.Ray;
        let camera = this.node.children[0].getComponent(Camera);
        let v = v3();
        this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
        camera.screenPointToRay(v.x, v.y, ray);
        if (PhysicsSystem.instance.raycastClosest(ray, 0xffffffff, 3)) {
            console.log(PhysicsSystem.instance.raycastClosestResult.collider.getMask());
            if (PhysicsSystem.instance.raycastClosestResult.collider.getGroup() == 1 << 19) {
                let cube = PhysicsSystem.instance.raycastClosestResult.collider.node;
                let group = cube.parent.parent.getComponent(DiggingAHoleCV_CubeGroup);
                group.Dig(cube);
            }
            else if (PhysicsSystem.instance.raycastClosestResult.collider.getGroup() == 1 << 20) {
                let num = 0;
                for (let i = 0; i < this.treasures.length; i++) {
                    const element = this.treasures[i];
                    num += element;
                }
                if (num >= (40 + 10 * parseInt(localStorage.getItem("DAHCV_Fill")))) return DiggingAHoleCV_GameUI.Instance.FullPack();
                let trea = PhysicsSystem.instance.raycastClosestResult.collider.node;
                let group = trea.parent.parent.getComponent(DiggingAHoleCV_CubeGroup);
                group.DigTreasure(trea);
                DiggingAHoleCV_Audio.Instance.PlayAudio("trea");
            }
        }
    }


    onTriggerEnter(event: ITriggerEvent) {
        if (event.otherCollider.node.name == "Home") DiggingAHoleCV_GameUI.Instance.ShowHome();
    }

    onTriggerExit(event: ITriggerEvent) {
        if (event.otherCollider.node.name == "Home") DiggingAHoleCV_GameUI.Instance.CloseHome();
    }

}


