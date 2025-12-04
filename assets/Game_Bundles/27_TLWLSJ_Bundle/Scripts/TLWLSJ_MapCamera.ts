import { _decorator, Component, Node, tween, v3, Vec3 } from 'cc';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_MapCamera')
export class TLWLSJ_MapCamera extends Component {
    public static Instance: TLWLSJ_MapCamera = null;

    Target: Node = null;

    MinX: number = -10000;
    MaxX: number = 10000;
    MinY: number = -1000;
    MaxY: number = 1000;

    protected onLoad(): void {
        TLWLSJ_MapCamera.Instance = this;
    }

    protected update(dt: number): void {
        // && !this._isShake
        if (this.Target && !this._isShake) {
            let targetPos: Vec3 = this.Target.getWorldPosition().clone();
            this.node.setWorldPosition(this.getConformPos(targetPos));
            // console.error(targetPos.x, targetPos.y, targetPos.z);
            // this.node.setWorldPosition(v3(targetPos.x, targetPos.y, 1000));
        }
    }

    getConformPos(pos: Vec3): Vec3 {
        const x = TLWLSJ_Tool.Clamp(pos.x, this.MinX, this.MaxX);
        const y = TLWLSJ_Tool.Clamp(pos.y, this.MinY, this.MaxY);
        return v3(x, y, 1000);
    }

    setClamp(minX: number, maxX: number, minY: number, maxY: number) {
        this.MinX = minX;
        this.MaxX = maxX;
        this.MinY = minY;
        this.MaxY = maxY;
    }

    private _isShake: boolean = false;

    /**
     * @param shakeTime 屏幕抖动的次数
     * @param shakeAmount 屏幕抖动幅度
     * @returns 
     */
    shakeCamera(shakeTime: number = 7, duration: number = 0.025, shakeAmount: number = 15) {
        if (shakeTime <= 0) return;
        this._isShake = true;
        let targetPos: Vec3 = this.Target.getWorldPosition().clone();
        let conformPos = this.getConformPos(new Vec3(targetPos.x + (Math.random() - 0.5) * shakeAmount * 2, targetPos.y + (Math.random() - 0.5) * shakeAmount * 2, 1000));
        tween(this.node)
            // .to(duration, { worldPosition: new Vec3(this.Target.getWorldPosition().x + (Math.random() - 0.5) * shakeAmount * 2, this.Target.getWorldPosition().y + (Math.random() - 0.5) * shakeAmount * 2, 1000) })
            .to(duration, { worldPosition: conformPos }, { easing: `sineOut` })
            .call(() => {
                this._isShake = false;
                this.shakeCamera(shakeTime - 1, duration, shakeAmount);
            })
            .start();

    }

}