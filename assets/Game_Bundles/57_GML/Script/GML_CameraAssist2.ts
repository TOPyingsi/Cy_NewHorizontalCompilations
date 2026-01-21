import { _decorator, Component, geometry, Node, PhysicsSystem, Quat, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GML_CameraAssist2')
export class GML_CameraAssist2 extends Component {
    @property(Node)
    public player: Node = null!;

    @property
    public SubDistance: number = 0.02;   // 相机与障碍物安全距离
    @property
    public MAXZ: number = 1.5;            // 默认相机距离
    @property
    public MINZ: number = 0.2;          // 最短距离
    @property
    public smoothSpeed: number = 0.1;   // 平滑插值速度
    @property
    public Yscale: number = 1.5;        // Z→Y比例缩放
    @property
    public backBuffer: number = 0.6;    // 后方障碍物缓冲距离
    
    public Mask: number = 0;

    private mainRay: geometry.Ray = new geometry.Ray();
    private backRay: geometry.Ray = new geometry.Ray();
    private currentZ: number = this.MAXZ;
    private obstacleZ: number = this.MAXZ;

    protected update(dt: number): void {
        if (!this.player) return;

        const playerPos = this.player.worldPosition.clone();
        const cameraPos = this.node.worldPosition.clone();

        // ===== 前向射线检测 =====
        geometry.Ray.fromPoints(this.mainRay, playerPos, cameraPos);
        let hasFrontObstacle = false;
        let nearestFrontDist = this.MAXZ;


        if (PhysicsSystem.instance.raycast(this.mainRay, this.Mask)) {
            for (const r of PhysicsSystem.instance.raycastResults) {
                if (r.collider.node === this.player) continue;
                const dist = Vec3.distance(playerPos, r.hitPoint);
                if (dist < nearestFrontDist && dist < Vec3.distance(playerPos, cameraPos)) {
                    nearestFrontDist = dist;
                    hasFrontObstacle = true;
                }
            }
        }

        if (hasFrontObstacle) {
            this.obstacleZ = nearestFrontDist - this.SubDistance;
            if (this.obstacleZ < this.MINZ) this.obstacleZ = this.MINZ;
        } else {
            this.obstacleZ = this.MAXZ;
        }

        // ===== 后向射线检测 =====
        const backDir = cameraPos.clone().subtract(playerPos).normalize(); // 玩家→相机方向
        const backStart = cameraPos.clone(); // 从相机当前位置开始
        const backEnd = backStart.clone().add(backDir.multiplyScalar(this.MAXZ + 2));
        geometry.Ray.fromPoints(this.backRay, backStart, backEnd);

        let allowBack = true;

        if (PhysicsSystem.instance.raycastClosest(this.backRay)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            if (result.collider.node !== this.player) {
                // 用相机当前位置到障碍物 hitPoint 的真实距离
                const backDistance = result.hitPoint.clone().subtract(cameraPos).length();
                allowBack = backDistance > this.backBuffer;
            }
        }

        // ===== 计算目标 Z =====
        let targetZ = this.obstacleZ;

        if (!hasFrontObstacle && allowBack) {
            // 前方无障碍且后方空旷 → 平滑回退
            targetZ += (this.MAXZ - targetZ) * this.smoothSpeed;
        }

        if (targetZ > this.MAXZ) targetZ = this.MAXZ;

        // ===== 平滑更新 currentZ =====
        this.currentZ += (targetZ - this.currentZ) * this.smoothSpeed;

        // ===== 设置相机本地位置，只控制 Z/Y =====
        const localPos = v3(0, this.currentZ / this.Yscale, this.currentZ);
        this.node.setPosition(localPos);
    }
    
    /**
     * 恢复相机辅助组件到初始状态
     */
    public RestoreInitialState(): void {
        this.currentZ = this.MAXZ;
        this.obstacleZ = this.MAXZ;
    }

}

