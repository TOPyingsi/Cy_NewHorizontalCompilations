import { _decorator, Component, Node, RigidBody, RigidBody2D, v2, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XGDY_SwimingFish')
export class XGDY_SwimingFish extends Component {
    // 移动目标点（世界坐标）
    private targetWorldPos: Vec3 = new Vec3();
    // 移动方向（单位向量）
    private moveDir: Vec3 = new Vec3();
    // 抵达终点的判定阈值（防止浮点精度问题）
    private readonly ARRIVE_THRESHOLD: number = 200;
    // 车辆刚体组件（核心：物理移动依赖）
    private rigidBody: RigidBody2D = null!;

    // 抵达终点时的回调（外部调用，车流系统调用此方法初始化）
    private onCarArriveCallback: () => void = null!;

    fishSpeed = 15;


    onLoad(){
                // 组件挂载时获取刚体组件，做容错校验
        this.rigidBody = this.node.getComponent(RigidBody2D);
        if (!this.rigidBody) {
            console.error(`【车辆脚本】${this.node.name} 缺少刚体组件(RigidBody)，刚体移动失效！`);
        }
    }

     /**
     * 设置车辆的移动起点和终点（外部调用，车流系统调用此方法初始化）
     * @param startWorldPos 出生世界坐标
     * @param targetWorldPos 目标世界坐标
     */
    public init(startWorldPos: Vec3, targetWorldPos: Vec3, onCarArriveCallback: () => void) {
        if (!this.rigidBody) return;
        this.onCarArriveCallback = onCarArriveCallback;
        
        // 设置车辆初始位置
        this.node.worldPosition = startWorldPos;
        // 保存目标点
        this.targetWorldPos = targetWorldPos;
        // 计算从起点到终点的单位移动方向
        Vec3.subtract(this.moveDir, this.targetWorldPos, startWorldPos);
        Vec3.normalize(this.moveDir, this.moveDir);


        let Dir = this.moveDir
        let _dir = v3(Dir.x, Dir.y, 0);

        if (_dir.x > 0 ) {
            let scale = this.node.scale.x*-1;
            this.node.setScale(scale,this.node.scale.y,this.node.scale.z);
        }


        // 车辆朝向目标点（车头朝前）
        // this.node.lookAt(this.targetWorldPos);
        // this.node.eulerAngles = new Vec3(0, this.node.eulerAngles.y-180, 0);

        // ✅ 核心：给刚体设置【线性速度】，物理驱动移动，替代原来的坐标修改
        let newLinearVelocity = v2(_dir.x * this.fishSpeed, _dir.y * this.fishSpeed);
        this.rigidBody.linearVelocity = newLinearVelocity;

    }


    update(deltaTime: number) {
        if (!this.rigidBody) return;
        
        // console.log("this.rigidBody.linearVelocity",this.rigidBody.linearVelocity);
        // 持续检测是否抵达终点
        const distance = Vec3.distance(this.node.worldPosition, this.targetWorldPos);
        if (distance <= this.ARRIVE_THRESHOLD) {
            // ✅ 抵达终点：先停止刚体运动 → 执行回调 → 销毁车辆
            this.rigidBody.linearVelocity = v2(0, 0);
            this.onCarArriveCallback && this.onCarArriveCallback();
            this.node.destroy();
            console.log("节点销毁");
        }
    }


    destoryFish(){
        if (this.rigidBody){
            this.rigidBody.linearVelocity = v2(0, 0);
        }
        this.onCarArriveCallback = null;

        this.node.destroy();
    }

}


