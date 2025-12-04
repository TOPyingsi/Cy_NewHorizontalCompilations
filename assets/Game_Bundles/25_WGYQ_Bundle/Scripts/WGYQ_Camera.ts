import { _decorator, Camera, clamp, Component, Node, size, UITransform, v2, v3, Vec3, view } from 'cc';
import { WGYQ_Player } from './WGYQ_Player';
import { WGYQ_Map } from './WGYQ_Map';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_Camera')
export class WGYQ_Camera extends Component {

    private static instance: WGYQ_Camera;
    public static get Instance(): WGYQ_Camera {
        return this.instance;
    }

    camera: Camera;

    start() {
        WGYQ_Camera.instance = this;
        this.camera = this.getComponent(Camera);
    }

    lateUpdate(deltaTime: number) {
        this.Move();
    }

    Move() {
        let pos = WGYQ_Player.Instance.node.getPosition();
        let mapUI = WGYQ_Map.Instance.getComponent(UITransform);
        const visibleSize = view.getVisibleSize();
        const scale = visibleSize.height / this.camera.orthoHeight / 2;
        const cameraSize = size(visibleSize.width / scale, visibleSize.height / scale);
        let maxPos = v3(mapUI.width / 2 - cameraSize.width / 2, mapUI.height / 2 - cameraSize.height / 2);
        let minPos = v3(-mapUI.width / 2 + cameraSize.width / 2, -mapUI.height / 2 + cameraSize.height / 2);
        pos = Vec3.lerp(pos, this.node.getPosition(), pos, 0.05);
        pos.x = clamp(pos.x, minPos.x, maxPos.x);
        pos.y = clamp(pos.y, minPos.y, maxPos.y);
        pos.z = this.node.getPosition().z;
        this.node.setPosition(pos);
    }

}


