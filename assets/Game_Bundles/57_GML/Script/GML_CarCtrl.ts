import { _decorator, Component, Node, Vec3, RigidBody, Collider, ITriggerEvent } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { GML_Events } from './GML_Events';
import { GML_GameManager } from './GML_GameManager';
import { GML_AudioManager } from './GML_AudioManager';
const { ccclass, property } = _decorator;

// 定义车辆抵达终点的回调函数类型
export type CarArriveCallback = () => void;

@ccclass('GML_CarCtrl')
export class GML_CarCtrl extends Component {

    @property(Number)
    public carSpeed: number = 20;

    // 移动目标点（世界坐标）
    private targetWorldPos: Vec3 = new Vec3();
    // 移动方向（单位向量）
    private moveDir: Vec3 = new Vec3();
    // 抵达终点的判定阈值（防止浮点精度问题）
    private readonly ARRIVE_THRESHOLD: number = 0.4;
    // 车辆刚体组件（核心：物理移动依赖）
    private rigidBody: RigidBody = null!;
    // 车辆抵达终点的回调函数
    public onCarArriveCallback: CarArriveCallback | null = null;
    // 相机固定触发器
    private trigger: Collider = null!;

    onLoad() {
        this.addListener();

        // 组件挂载时获取刚体组件，做容错校验
        this.rigidBody = this.node.getComponent(RigidBody);
        if (!this.rigidBody) {
            console.error(`【车辆脚本】${this.node.name} 缺少刚体组件(RigidBody)，刚体移动失效！`);
        }
    }

    /**
     * 设置车辆的移动起点和终点（外部调用，车流系统调用此方法初始化）
     * @param startWorldPos 出生世界坐标
     * @param targetWorldPos 目标世界坐标
     */
    public initCarMove(startWorldPos: Vec3, targetWorldPos: Vec3) {
        if (!this.rigidBody) return;
        
        // 设置车辆初始位置
        this.node.worldPosition = startWorldPos;
        // 保存目标点
        this.targetWorldPos = targetWorldPos;
        // 计算从起点到终点的单位移动方向
        Vec3.subtract(this.moveDir, this.targetWorldPos, startWorldPos);
        Vec3.normalize(this.moveDir, this.moveDir);

        // 车辆朝向目标点（车头朝前）
        this.node.lookAt(this.targetWorldPos);
        this.node.eulerAngles = new Vec3(0, this.node.eulerAngles.y-180, 0);

        // ✅ 核心：给刚体设置【线性速度】，物理驱动移动，替代原来的坐标修改
        this.rigidBody.setLinearVelocity(this.moveDir.multiplyScalar(this.carSpeed));
    }

    update(deltaTime: number) {
        if (!this.rigidBody || this.moveDir.length() <= 0) return;
        
        // 持续检测是否抵达终点
        const distance = Vec3.distance(this.node.worldPosition, this.targetWorldPos);
        if (distance <= this.ARRIVE_THRESHOLD) {
            // ✅ 抵达终点：先停止刚体运动 → 执行回调 → 销毁车辆
            this.rigidBody.setLinearVelocity(Vec3.ZERO);
            this.onCarArriveCallback && this.onCarArriveCallback();
            this.node.destroy();
        }
    }


       onTriggerEnter(event: ITriggerEvent) {
            if(event.otherCollider.node.name == "Player"){
                console.log("车辆碰撞到玩家");
                GML_AudioManager.getInstance().playSound("撞");
                if(!GML_GameManager.Instance.isPlayerDie){
                    GML_GameManager.Instance.playerDie();
                }
            }
        }
    
        onTriggerExit(event: ITriggerEvent) {
            if(event.otherCollider.node.name == "Player"){

            }
        }
    
  


      addListener(){

        this.trigger = this.node.getComponentInChildren(Collider);
        this.trigger.on('onTriggerEnter', this.onTriggerEnter, this);
        this.trigger.on('onTriggerExit', this.onTriggerExit, this);

    }

    removeListener(){
    }

    // 车辆销毁前重置刚体速度，防止内存残留
    protected onDestroy(): void {
        this.removeListener();
        if (this.rigidBody) {
            this.rigidBody.setLinearVelocity(Vec3.ZERO);
            this.rigidBody.setAngularVelocity(Vec3.ZERO);
        }
    }
}