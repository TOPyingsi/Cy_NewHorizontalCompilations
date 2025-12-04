import { _decorator, Component, math, Node, Rect, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_Camera')
export class HJMWK_Camera extends Component {

    @property(Node)
    Target: Node = null;

    @property(Rect)
    followArea: Rect = new Rect(0, 0, 1000, 1000); // 跟随区域（定义一个矩形区域）

    @property(Vec3)
    cameraOffset: Vec3 = new Vec3(0, 0, 0); // 摄像机的偏移量

    @property(Rect)
    cameraBounds: Rect = new Rect(0, 0, 2000, 2000); // 摄像机的移动范围

    Y: number = 0;
    X: number = 0;

    protected onLoad(): void {
        this.X = this.node.getWorldPosition().clone().x;
    }

    protected update(dt: number): void {
        if (this.Target) {
            // 获取 Player 当前的位置
            const playerPos = this.Target.worldPosition;
            // 判断 Player 是否在跟随区域内
            // 平滑跟随 Player
            const currentCameraPos = this.node.worldPosition;
            const targetPos = new Vec3(playerPos.x + this.cameraOffset.x, playerPos.y + this.cameraOffset.y, currentCameraPos.z);

            // 使用插值 (Lerp) 实现平滑跟随
            const smoothPos = Vec3.lerp(new Vec3(), currentCameraPos, targetPos, 0.1);

            // 限制摄像机的移动范围
            // smoothPos.x = math.clamp(smoothPos.x, this.cameraBounds.xMin, this.cameraBounds.xMax);
            // smoothPos.y = math.clamp(smoothPos.y, this.cameraBounds.yMin, this.cameraBounds.yMax);
            // smoothPos.y = this.Y;
            smoothPos.x = this.X;
            this.node.setWorldPosition(smoothPos);
        }
    }
}


