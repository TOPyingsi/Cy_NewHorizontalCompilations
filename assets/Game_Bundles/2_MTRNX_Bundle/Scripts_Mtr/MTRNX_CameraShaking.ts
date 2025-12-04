import { _decorator, Component, Node, TTFFont, Tween, tween, v2, v3, Vec2, Vec3 } from 'cc';
import { MTRNX_ZTool } from './Utils/MTRNX_ZTool';

const { ccclass, property } = _decorator;

const oriPostion: Vec3 = v3();
const position: Vec3 = v3();
const targetPos_1: Vec3 = v3();
const targetPos_2: Vec3 = v3();
@ccclass('MTRNX_CameraShaking')
export class MTRNX_CameraShaking extends Component {
    private static _instance: MTRNX_CameraShaking = null;
    public static get Instance() {
        return this._instance;
    };

    canShake: boolean = true;
    force: number = 10;

    protected onLoad(): void {
        MTRNX_CameraShaking._instance = this;
        oriPostion.set(this.node.position);
    }

    Shaking(force: number = 10) {
        if (force > this.force) {
            Tween.stopAllByTarget(this.node);
            this.canShake = true;
        }

        if (this.canShake) {
            this.canShake = false;
            this.force = force;
            position.set(MTRNX_ZTool.GetRandom(-force, force), MTRNX_ZTool.GetRandom(-force, force), 0);
            targetPos_1.set(oriPostion.clone().add(position));
            targetPos_2.set(oriPostion.clone().add(position.multiplyScalar(-1)));
            tween(this.node).to(0.1, { position: targetPos_1 }).to(0.1, { position: targetPos_2 }).to(0.1, { position: oriPostion }).call(() => {
                this.canShake = true;
            }).start();
        }
    }
}