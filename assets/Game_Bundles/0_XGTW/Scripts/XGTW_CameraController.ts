import { _decorator, Vec2, v2, Component, Camera, Tween, tween, Vec3, v3, PostSettingsInfo } from 'cc';
const { ccclass, property } = _decorator;

import { EasingType } from '../../../Scripts/Framework/Utils/TweenUtil';
import XGTW_GameManager from './XGTW_GameManager';
import { EventManager } from '../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from './Framework/Managers/XGTW_Event';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
const v2_0: Vec3 = v3();
const v2_1: Vec3 = v3();
const v2_2: Vec3 = v3();
const v2_3: Vec3 = v3();

@ccclass('XGTW_CameraController')
export default class XGTW_CameraController extends Component {
    static Instance: XGTW_CameraController = null;
    camera: Camera | null = null;
    stopFollow: boolean = false;
    onLoad() {
        XGTW_CameraController.Instance = this;
        this.camera = this.node.getComponent(Camera);
    }
    Move(delta: Vec3) {
        this.stopFollow = true;
        this.node.getPosition(v2_3);
        v2_3.add(delta.negative().multiplyScalar(5));
        v2_3.set(v3(Tools.Clamp(v2_3.x, -5000, 5000), Tools.Clamp(v2_3.y, -5000, 5000)));
        this.node.setPosition(v3(v2_3.x, v2_3.y, 1000));
    }
    ZoomIn() {
        Tween.stopAllByTarget(this.camera);
        tween(this.camera).to(0.2, { orthoHeight: 400 }, { easing: EasingType.quadIn }).start();
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
        if (!XGTW_GameManager.Instance.player) return;
        this.node.getPosition(v2_0);
        XGTW_GameManager.Instance.player.getPosition(v2_1);
        Vec2.lerp(v2_2, v2_0, v2_1, 0.2);
        this.node.setPosition(v3(v2_2.x, v2_2.y, 1000));
    }
    protected onEnable(): void {
        EventManager.on(XGTW_Event.CameraZoomIn, this.ZoomIn, this);
        EventManager.on(XGTW_Event.CameraZoomOut, this.ZoomOut, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.CameraZoomIn, this.ZoomIn, this);
        EventManager.off(XGTW_Event.CameraZoomOut, this.ZoomOut, this);
    }
}