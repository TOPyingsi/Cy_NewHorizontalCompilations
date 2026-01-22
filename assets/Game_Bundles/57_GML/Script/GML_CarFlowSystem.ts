import { _decorator, Component, Node, Prefab, instantiate, Vec3, randomRange } from 'cc';
import { GML_CarCtrl, CarArriveCallback } from './GML_CarCtrl';
import { GML_GameManager } from './GML_GameManager';
const { ccclass, property } = _decorator;

@ccclass('GML_CarFlowSystem')
export class GML_CarFlowSystem extends Component {
    @property({ type: Prefab, displayName: "所有车辆预制体" })
    public carPrefabs: Prefab[] = [];

    @property({ type: Node, displayName: "所有路线节点" })
    public roadParent: Node = null;

    private roadNodes: Node[] = [];

    private readonly MIN_SPAWN_TIME: number = 0;
    private readonly MAX_SPAWN_TIME: number = 5;
    private isFirstSpawn: boolean = true;

    // ======== 新增核心变量 ========
    // 车流运行状态开关，核心控制启停
    private isCarFlowRunning: boolean = true;
    // 存储所有路线的生成循环任务，用于停止时终止异步循环
    private spawnLoopTasks: Promise<void>[] = [];

    onLoad() {
        // 初始化所有路线节点
        this.roadNodes = this.roadParent.children;

        this.checkConfig();
    }

    start() {
        // 启动车流
        this.startAllCarSpawnLoop();
    }

    /**
     * 校验配置合法性
     */
    private checkConfig() {
        if (this.carPrefabs.length === 0) console.warn("【车流系统】警告：未配置车辆预制体！");
        if (this.roadNodes.length === 0) console.warn("【车流系统】警告：未配置路线节点！");
        this.roadNodes.forEach((roadNode, idx) => {
            if (roadNode.children.length !== 2) {
                console.error(`【车流系统】错误：路线节点${idx+1}(${roadNode.name})的子节点数量必须是2个！`);
            }
        });
    }

    /**
     * 统一启动所有路线的车流循环
     */
    private startAllCarSpawnLoop() {
        this.spawnLoopTasks = [];
        this.isCarFlowRunning = true;
        // 遍历所有路线，执行生成循环并存储任务
        this.roadNodes.forEach(roadNode => {
            const task = this.startCarSpawnLoop(roadNode);
            this.spawnLoopTasks.push(task);
        });
    }

    /**
     * ✅ 核心：带启停控制的车辆生成循环
     * 逻辑链：生成车辆 → 等待车辆抵达终点 → 随机等0-5秒 → 重复循环 (运行中可随时终止)
     */
    private async startCarSpawnLoop(roadNode: Node) {
        // 循环条件：车流处于运行状态
        let createCar = () => {
            if(!roadNode) return;
            if(this.isCarFlowRunning) {
                // 1. 生成车辆，车辆抵达终点后才会执行后续逻辑
                this.spawnCarOnRoad(roadNode,()=>{
                     // 2. 首次生成后，永久改为正常端点生成规则
                    if (this.isFirstSpawn) {
                        this.isFirstSpawn = false;
                    }
                    
                    // 3. 车辆抵达终点后，随机等待0~5秒再生成下一辆
                    const randomDelay = randomRange(this.MIN_SPAWN_TIME, this.MAX_SPAWN_TIME);
                    this.scheduleOnce(createCar,randomDelay);
                });
            }
        }

        createCar();
    }

    /**
     * 生成车辆，并返回Promise，车辆抵达终点时Promise才会resolve
     */
    private spawnCarOnRoad(roadNode: Node,cb:()=>void){
            // 如果已停止，直接结束
            if(!this.isCarFlowRunning) return;

            const pointA = roadNode.children[0].worldPosition;
            const pointB = roadNode.children[1].worldPosition;

            if (this.carPrefabs.length === 0) return;
            const randomCarPrefab = this.carPrefabs[Math.floor(randomRange(0, this.carPrefabs.length))];
            if (!randomCarPrefab) return;

            const carNode = instantiate(randomCarPrefab);
            carNode.parent = this.node;
            const carCtrl = carNode.getComponent(GML_CarCtrl);
            if (!carCtrl) {
                carNode.destroy();
                return;
            }

            let spawnPos: Vec3, targetPos: Vec3;
            if (this.isFirstSpawn) {
                // 首次生成：两点连线随机位置，随机方向
                const randomRatio = randomRange(0, 1);
                spawnPos = Vec3.lerp(new Vec3(), pointA, pointB, randomRatio);
                targetPos = Math.random() > 0.5 ? pointA : pointB;
            } else {
                // 正常生成：随机端点为起点，往另一端移动
                const isSpawnAtA = Math.random() > 0.5;
                spawnPos = isSpawnAtA ? pointA : pointB;
                targetPos = isSpawnAtA ? pointB : pointA;
            }

            carCtrl.initCarMove(spawnPos, targetPos);
            
            // 绑定回调：当车辆抵达终点时，解锁后续的等待逻辑
            carCtrl.onCarArriveCallback = () => {
               cb();
            };
    }

    // /**
    //  * 等待指定秒数（异步等待）
    //  */
    // private waitTime(time: number): Promise<void> {
    //        let instance = GML_GameManager.Instance;
    //     return new Promise(resolve => {
    //                     if(!instance) return resolve();
    //         const timer = setTimeout(() => {
    //                         if(!instance) return resolve();
    //             resolve();
    //         }, time * 1000);
    //         // 停止时清除定时器，防止内存泄漏
    //         if(!this.isCarFlowRunning) clearTimeout(timer);
    //     });
    // }

    // ======================================
    // ========== 对外开放的控制方法 ==========
    // ======================================
    /**
     * ✅ 公开方法：停止所有车流【外部可直接调用】
     * 功能：1.终止所有车辆生成循环 2.销毁场景中所有已生成的车辆 3.清空异步任务
     */
    public stopCarFlow() {
        this.isCarFlowRunning = false;
        this.spawnLoopTasks = [];
        // 销毁当前所有车辆
        this.node.destroyAllChildren();
        console.log("【车流系统】已停止所有车流");
    }

    /**
     * ✅ 公开方法：重启所有车流【外部可直接调用】
     * 功能：1.停止当前所有车流 2.重置首次生成标记 3.重新启动所有路线的车流循环
     * 特点：重启后会重新触发「随机位置开局」，和游戏初始效果一致，不呆板
     */
    public restartCarFlow() {
        // 先停止，防止重复启动
        this.stopCarFlow();
        // 重置首次生成标记，重启后开局随机位置生成
        this.isFirstSpawn = true;
        // 重新启动车流
        this.startAllCarSpawnLoop();
        console.log("【车流系统】已重启所有车流");
    }
}