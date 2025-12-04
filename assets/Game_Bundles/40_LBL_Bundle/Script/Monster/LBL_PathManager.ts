import { _decorator, Component, Director, Vec3 } from 'cc';
const { ccclass, property } = _decorator;
import { LBL_AStar, LBL_AStarNode} from './LBL_AStar';
import { LBL_Waypoint } from './LBL_Waypoint';
import { LBL_BinaryHeap } from './LBL_BinaryHeap';

// 路径请求接口
interface LBL_PathRequest {
    start: LBL_Waypoint;
    end: LBL_Waypoint;
    callback: (path: LBL_Waypoint[] | null, success: boolean) => void;
}

@ccclass('LBL_PathManager')
export class LBL_PathManager extends Component {
    private aStar = new LBL_AStar();
    private pathRequests: LBL_PathRequest[] = [];
    private currentPathRequest: LBL_PathRequest | null = null;
    private isProcessingPath = false;

    // 分帧处理相关
    private maxStepsPerFrame = 5; // 每帧最多处理的步骤
    private currentStep = 0;

    // 单例实例
    public static instance: LBL_PathManager;

    // LBL_PathManager.ts 新增/修改属性
    private currentAStarState: { // A*分帧计算的状态保存
        openSet: LBL_BinaryHeap;
        closedSet: Set<LBL_Waypoint>;
        nodeMap: Map<LBL_Waypoint, LBL_AStarNode>;
        startNode: LBL_AStarNode;
        endNode: LBL_AStarNode;
    } | null = null;


    onLoad() {
        if (LBL_PathManager.instance) {
            this.destroy();
        } else {
            LBL_PathManager.instance = this;
            // Director.instance.addPersistRootNode(this.node); // 设为持久节点
        }
    }

    /**
     * 重置路径管理器状态，用于停止游戏时调用
     */
    public reset(): void {
        // 取消所有未完成的路径请求
        this.pathRequests = [];
        
        // 取消当前正在处理的路径请求
        this.currentPathRequest = null;
        
        // 重置A*算法状态
        this.currentAStarState = null;
        
        // 重置处理标志
        this.isProcessingPath = false;
        
        // 取消所有调度
        this.unschedule(this.processPathStep);
        this.unschedule(this.aa);
    }

    // 请求路径
    public requestPath(start: LBL_Waypoint, end: LBL_Waypoint, callback: (path: LBL_Waypoint[] | null, success: boolean) => void) {
        // 取消相同目标的未处理请求
        this.pathRequests = this.pathRequests.filter(req =>
            !(req.start === start && req.end === end)
        );

        // 检查队列最后一个请求是否相同
        const lastIndex = this.pathRequests.length - 1;
        if (lastIndex >= 0) {
            const lastReq = this.pathRequests[lastIndex];
            if (lastReq.start === start && lastReq.end === end) {
                return; // 队列末尾已有相同请求，不再添加
            }
        }

        const newRequest: LBL_PathRequest = {
            start,
            end,
            callback
        };

        this.pathRequests.push(newRequest);
        this.tryProcessNext();
    }

    // 尝试处理下一个路径请求
    private tryProcessNext() {
        if (!this.isProcessingPath && this.pathRequests.length > 0) {
            this.currentPathRequest = this.pathRequests.shift()!;
            this.isProcessingPath = true;
            this.currentStep = 0;

            // 开始分帧处理路径查找
            this.scheduleOnce(this.processPathStep, 0);
        }
    }

    // 修改processPathStep方法（核心修改）
    private processPathStep() {
        this.unschedule(this.aa)
        if (!this.currentPathRequest) {
            this.isProcessingPath = false;
            this.currentAStarState = null; // 清空状态
            return;
        }

        // 1. 初始化A*状态（首次执行时）
        if (!this.currentAStarState) {
            const openSet = new LBL_BinaryHeap();
            const closedSet = new Set<LBL_Waypoint>();
            const nodeMap = new Map<LBL_Waypoint, LBL_AStarNode>();
            const startNode = new LBL_AStarNode(this.currentPathRequest.start);
            const endNode = new LBL_AStarNode(this.currentPathRequest.end);

            nodeMap.set(this.currentPathRequest.start, startNode);
            openSet.push(startNode);

            this.currentAStarState = { openSet, closedSet, nodeMap, startNode, endNode };
        }

        const { openSet, closedSet, nodeMap, startNode, endNode } = this.currentAStarState;
        let stepCount = 0;
        let path: LBL_Waypoint[] | null = null;
        let success = false;

        // 2. 分帧执行A*核心循环（每帧执行maxStepsPerFrame步）
        while (openSet.count > 0 && stepCount < this.maxStepsPerFrame) {
            const currentNode = openSet.pop();
            if (!currentNode) break;

            closedSet.add(currentNode.waypoint);

            // 到达终点：计算路径并退出
            if (currentNode.waypoint === endNode.waypoint) {
                path = this.retracePath(startNode, currentNode); // 需将retracePath移到Manager中
                success = true;
                break;
            }

            // 处理当前节点的邻居（单步处理）
            currentNode.waypoint.connectedWaypoints.forEach(neighborWaypoint => {
                if (!neighborWaypoint || closedSet.has(neighborWaypoint)) return;

                const newMovementCostToNeighbor = currentNode.gCost +
                    Vec3.distance(
                        currentNode.waypoint.node.worldPosition,
                        neighborWaypoint.node.worldPosition
                    );

                let neighborNode = nodeMap.get(neighborWaypoint);
                if (!neighborNode) {
                    neighborNode = new LBL_AStarNode(neighborWaypoint);
                    nodeMap.set(neighborWaypoint, neighborNode);
                }

                if (newMovementCostToNeighbor < neighborNode.gCost || !openSet.contains(neighborNode)) {
                    neighborNode.gCost = newMovementCostToNeighbor;
                    neighborNode.hCost = Vec3.distance(neighborWaypoint.node.worldPosition, endNode.waypoint.node.worldPosition);
                    neighborNode.parent = currentNode;

                    if (!openSet.contains(neighborNode)) {
                        openSet.push(neighborNode);
                    } else {
                        openSet.updateNode(neighborNode);
                    }
                }
            });

            stepCount++; // 计数+1，控制每帧步骤
        }

        // 3. 判断是否需要继续分帧
        if (success || (openSet.count === 0 && !success)) {
            // 计算完成（成功/失败）：回调结果
            if (success) path.shift();
            this.currentPathRequest.callback(path, success);
            this.currentPathRequest = null;
            this.currentAStarState = null;
            this.isProcessingPath = false;
            this.tryProcessNext(); // 处理下一个请求
        } else {
            console.log("未完成：下一帧继续处理");
            // 未完成：下一帧继续处理
            this.scheduleOnce(this.aa, 0);
        }
    }


    private aa() {
        this.processPathStep();
    }

    // 新增路径回溯方法（从LBL_AStar迁移）
    private retracePath(startNode: LBL_AStarNode, endNode: LBL_AStarNode): LBL_Waypoint[] {
        const path: LBL_Waypoint[] = [];
        let currentNode: LBL_AStarNode | null = endNode;

        while (currentNode !== startNode && currentNode) {
            path.push(currentNode.waypoint);
            currentNode = currentNode.parent;
        }

        path.push(startNode.waypoint);
        path.reverse();
        return path;
    }

}
