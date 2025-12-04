import { _decorator, Vec2, v2, Component, Camera, Tween, tween, Vec3, v3, Node } from 'cc';
const { ccclass, property } = _decorator;

import { EasingType } from '../../../Scripts/Framework/Utils/TweenUtil';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_LvManager } from './SJZ_LvManager';

const v2_0: Vec3 = v3();
const v2_1: Vec3 = v3();
const v2_2: Vec3 = v3();
const v2_3: Vec3 = v3();

@ccclass('SJZ_CameraController')
export default class SJZ_CameraController extends Component {
    static Instance: SJZ_CameraController = null;
    camera: Camera | null = null;
    stopFollow: boolean = false;
    target: Node = null;

    onLoad() {
        SJZ_CameraController.Instance = this;
        this.camera = this.node.getComponent(Camera);
        this.node.setWorldPosition(SJZ_LvManager.Instance.playerPosition.worldPosition.x, SJZ_LvManager.Instance.playerPosition.worldPosition.y, this.node.worldPosition.z);
    }

    Move(delta: Vec3) {
        this.stopFollow = true;
        this.node.getPosition(v2_3);
        v2_3.add(delta.negative().multiplyScalar(5));
        v2_3.set(v3(Tools.Clamp(v2_3.x, -SJZ_LvManager.Instance.MapSize.x, SJZ_LvManager.Instance.MapSize.x), Tools.Clamp(v2_3.y, -SJZ_LvManager.Instance.MapSize.y, SJZ_LvManager.Instance.MapSize.y)));
        this.node.setPosition(v3(v2_3.x, v2_3.y, 1000));
    }

    ZoomIn() {
        Tween.stopAllByTarget(this.camera);
        tween(this.camera).to(0.2, { orthoHeight: 540 }, { easing: EasingType.quadIn }).start();
    }

    ZoomOut(ratio: number = 600, doneCb: Function = null) {
        Tween.stopAllByTarget(this.camera);
        tween(this.camera).to(0.2, { orthoHeight: ratio }, { easing: EasingType.quadIn }).start();
        tween(this.camera.node).to(0.3, { position: v3(this.camera.node.position.x, this.camera.node.position.y + 1, this.camera.node.position.z) }).call(() => {
            doneCb && doneCb();
        }).start();
    }

    update(dt) {
        if (this.stopFollow) return;
        if (!this.target) return;
        this.node.getWorldPosition(v2_0);
        this.target.getWorldPosition(v2_1);
        Vec2.lerp(v2_2, v2_0, v2_1, 0.3);
        this.node.setWorldPosition(v3(v2_2.x, v2_2.y, 1000));
    }
}