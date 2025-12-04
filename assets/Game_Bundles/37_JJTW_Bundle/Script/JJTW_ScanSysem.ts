import { _decorator, Component, geometry, instantiate, Node, PhysicsSystem, Prefab, Vec3, Quat, v3 } from 'cc';
import { JJTW_ColliderGroupNumber, JJTW_ColliderGroupType } from './JJTW_ColliderGroupNumber';
import { JJTW_DataManager } from './JJTW_DataManager';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
const { ccclass, property } = _decorator;

// A*算法节点接口
interface AStarNode {
    position: Vec3;
    g: number; // 从起点到当前节点的成本
    h: number; // 从当前节点到终点的启发式估计成本
    f: number; // f = g + h，总估计成本
    parent: AStarNode | null; // 父节点，用于回溯路径
}
// 路径点接口
interface JJTW_PathPoint {
    position: Vec3;
    isTurnPoint: boolean; // 是否是转折点
}

// 箭头对象池接口
interface ArrowPool {
    active: Node[];
    inactive: Node[];
}


        const closedSet: Set<string> = new Set(); // 已检查节点（用字符串哈希标识）
@ccclass('JJTW_ScanSysem')
export class JJTW_ScanSysem extends Component {
    @property(Prefab)
    private arrowPrefab: Prefab = null;

    @property(Node)
    private arrowParent: Node = null;

    @property(Node)
    private roadParent: Node = null;

    @property(Node)
    private playerNode: Node = null;

    private roadPointDistance: number = 0.5;

    private maxLoopCount: number = 10; // 最大循环次数

    private sameLayerTolerance: number = 1.5; // 同一层判断的容差

    private floor2Y = -1.602012;

    @property(Number)
    private raycastMask: number = 1; // 射线检测的层掩码

    public roadPoints: Vec3[] = []; // 所有中转点
    public topPoint: Vec3 = null; // 上层中转点
    public middlePoint: Vec3 = null; // 中间中转点
    public middlePoint_up: Vec3 = null;
    public middlePoint_down: Vec3 = null;
    public bottomPoint: Vec3 = null; // 下层中转点

    private downCountTime = 10;
    private passTime = 0;
    private time = 0;

    private isNeedArrow = true;

    // 新增对象池属性
    // 性能优化相关属性
    private arrowPool: ArrowPool = { active: [], inactive: [] };
    private maxPoolSize: number = 70; // 根据需求设置

    // 新增：复用的Ray对象
    private ray: geometry.Ray = new geometry.Ray();

    // 新增：复用的临时向量
    private tempVec3_1: Vec3 = new Vec3();
    private tempVec3_2: Vec3 = new Vec3();

    // 新增：按层分组存储roadPoints（在initRoadPoints中）
    public roadPointsByLayer: { [key: number]: Vec3[] } = { 1: [], 2: [] }; // 假设1=下层，2=上层

    // private updateInterval = 3; // 300ms更新一次，替代原来的每3帧更新
    // private lastUpdateTime = 0;
    private currentPathCalculation: {
        isProcessing: boolean;
        startPos: Vec3;
        endPos: Vec3;
        isNeedCreateArrow: boolean;
        path: JJTW_PathPoint[];
        step: number;
        excludedPoints: Vec3[];
        loopCount: number;
        currentPos: Vec3;
    } = null;


    private isPlayer = true;


    private isCalculating: boolean = false;
    private maxStepsPerFrame: number = 100; // 每帧最大计算步骤
    xunlu = false;


    start() {
        this.roadParent.active = false;
        this.initRoadPoints();
        // 预创建一些箭头对象到对象池
        this.preCreateArrows(50);
    }

    showArrow() {
         this.scheduleCreateArrows();
    }

      createArrowAsync(){

    }

    scheduleCreateArrows() {
        if (JJTW_DataManager.Instance.currentTargetPos ) {
            let playerPos = this.playerNode.getWorldPosition();
            // if(JJTW_DataManager.Instance.itemFloorNumber){
            //     this.generatePath(JJTW_DataManager.Instance.currentPlayerPos,JJTW_DataManager.Instance.currentTargetPos,true,JJTW_DataManager.Instance.itemFloorNumber);
            // }
            // else{
            //     this.generatePath(JJTW_DataManager.Instance.currentPlayerPos,JJTW_DataManager.Instance.currentTargetPos,true);
            // }
            // 如果没有正在进行的路径计算，开始新的计算
            // if (!this.currentPathCalculation?.isProcessing) {
                this.startPathCalculation(
                    playerPos,
                    JJTW_DataManager.Instance.currentTargetPos
                );

                this.scheduleOnce(this.hideArrow, 10)
            // }
        }

    }

  
    hideArrow() {
        JJTW_DataManager.Instance.currentTargetPos = null;
        JJTW_DataManager.Instance.currentPlayerPos = null;
        JJTW_DataManager.Instance.itemFloorNumber = null;
        this.clearArrows();

        // 清除正在进行的计算
        if (this.currentPathCalculation) {
            this.currentPathCalculation.isProcessing = false;
            this.currentPathCalculation = null;
        }
    }

    // 预创建箭头对象
    private preCreateArrows(count: number) {
        for (let i = 0; i < count; i++) {
            const arrow = instantiate(this.arrowPrefab);
            arrow.setParent(this.arrowParent);
            arrow.active = false;
            this.arrowPool.inactive.push(arrow);
        }
    }

    // 从对象池获取箭头
    private getArrowFromPool(): Node {
        if (this.arrowPool.inactive.length > 0) {
            const arrow = this.arrowPool.inactive.pop();
            arrow.active = true;
            this.arrowPool.active.push(arrow);
            return arrow;
        } else {
            // 如果没有可用的，创建新的
            const arrow = instantiate(this.arrowPrefab);
            arrow.setParent(this.arrowParent);
            this.arrowPool.active.push(arrow);
            return arrow;
        }
    }


    // 初始化所有中转点
    private initRoadPoints() {
        this.roadPoints = [];
        this.roadPointsByLayer = { 1: [], 2: [] }; // 重置分组

        for (let i = 0; i < this.roadParent.children.length; i++) {
            const child = this.roadParent.children[i];
            const pos = child.worldPosition.clone();
            this.roadPoints.push(pos);

            // 关键：按Y坐标判断楼层并加入对应分组
            const layer = pos.y > this.floor2Y ? 2 : 1; // 2=上层，1=下层
            this.roadPointsByLayer[layer].push(pos);


            // 记录特殊点
            switch (child.name) {
                case 'top':
                    this.topPoint = pos;
                    break;
                case 'middle':
                    this.middlePoint = pos;
                    break;
                // case 'middle_up':
                //         this.middlePoint_up = pos;
                //     break;
                // case 'middle_down':
                //         this.middlePoint_down = pos;
                //     break;
                case 'bottom':
                    this.bottomPoint = pos;
                    break;
            }
        }
    }

    protected update(dt: number): void {
        // if (JJTW_DataManager.Instance.currentTargetPos && JJTW_DataManager.Instance.currentPlayerPos) {
        //     this.passTime += dt;
        // }

        //     // 使用时间间隔替代帧数判断，更稳定
        //     this.lastUpdateTime += dt;
        //     if (this.lastUpdateTime >= this.updateInterval) {
        //         this.lastUpdateTime = 0;

        //         // if(JJTW_DataManager.Instance.itemFloorNumber){
        //         //     this.generatePath(JJTW_DataManager.Instance.currentPlayerPos,JJTW_DataManager.Instance.currentTargetPos,true,JJTW_DataManager.Instance.itemFloorNumber);
        //         // }
        //         // else{
        //         //     this.generatePath(JJTW_DataManager.Instance.currentPlayerPos,JJTW_DataManager.Instance.currentTargetPos,true);
        //         // }
        //         // 如果没有正在进行的路径计算，开始新的计算
        //         if (!this.currentPathCalculation?.isProcessing) {
        //             this.startPathCalculation(
        //                 JJTW_DataManager.Instance.currentPlayerPos,
        //                 JJTW_DataManager.Instance.currentTargetPos
        //             );
        //         }
        //     }

        //     if (this.passTime >= this.downCountTime) {
        //         this.time = 0;
        //         this.passTime = 0;
        //         JJTW_DataManager.Instance.currentTargetPos = null;
        //         JJTW_DataManager.Instance.currentPlayerPos = null;
        //         JJTW_DataManager.Instance.itemFloorNumber = null;
        //         this.clearArrows();

        //         // 清除正在进行的计算
        //         if (this.currentPathCalculation) {
        //             this.currentPathCalculation.isProcessing = false;
        //             this.currentPathCalculation = null;
        //         }
            
        // }

        //   // 分帧处理路径计算
        //   if (this.currentPathCalculation?.isProcessing) {
        //     this.processPathCalculationFrame();
        // }
    }
    /**
 * 生成从起点到终点的路径
 * @param startPos 起点位置
 * @param endPos 终点位置
 * @returns 路径点数组
 */
    public generatePath(startPos: Vec3, endPos: Vec3, isNeedCreateArrow: boolean = true, isPlayer: boolean = true, layerNum?: number): JJTW_PathPoint[] {
        // //console.log("_________________开始生成路径___________，目的地：" + endPos)
        this.isPlayer = isPlayer;
        this.isNeedArrow = isNeedCreateArrow;
        // 清除已有的箭头
        // this.clearArrows();
        let isSameLayer = layerNum ? this.isSameLayerWithTargetLayer(startPos, layerNum) : this.isSameLayer(startPos, endPos);

        // 判断是否在同一层
        if (isSameLayer) {
            // //console.log("在同一层")
            return this.findPathInSameLayer(startPos, endPos, isPlayer);
        } else {
            //console.log("在不同层")
            return this.findPathInDifferentLayers(startPos, endPos, isPlayer);
        }
    }


    // 开始路径计算（分帧处理）
    private startPathCalculation(startPos: Vec3, endPos: Vec3, isNeedCreateArrow: boolean = true) {
        // 先清除可能残留的箭头
        if (isNeedCreateArrow) {
            // this.clearArrows();
        }

        this.isPlayer = true;
        // 判断是否在同一层
        if (this.isSameLayer(startPos, endPos)) {
            const path = this.findPathInSameLayer(startPos, endPos, true);
            if (isNeedCreateArrow) {
                this.createArrowsAlongPath(path);
            }
            this.currentPathCalculation = null;
        } else {
            // 不同层直接一次性处理（相对简单）
            const path = this.findPathInDifferentLayers(startPos, endPos, true);
            if (isNeedCreateArrow) {
                this.createArrowsAlongPath(path);
            }
            this.currentPathCalculation = null;
        }
    }

    // // 分帧处理路径计算
    // private processPathCalculationFrame() {
    //     if (!this.currentPathCalculation) return;

    //     const { startPos, endPos, isNeedCreateArrow, path, step, excludedPoints, loopCount, currentPos } = this.currentPathCalculation;

    //     // 每帧只处理一步计算，避免阻塞主线程
    //     if (step === 0) {
    //         // 初始检查：当前点到终点是否有障碍物
    //         if (!this.checkObstacle(currentPos, endPos,true)) {
    //             // 没有障碍物，直接到达终点
    //             path.push({
    //                 position: endPos.clone(),
    //                 isTurnPoint: true
    //             });
    //             if (isNeedCreateArrow) {
    //                 this.createArrowsAlongPath(path);
    //             }
    //             this.currentPathCalculation.isProcessing = false;
    //             return;
    //         }

    //         // 进入循环计算阶段
    //         this.currentPathCalculation.step = 1;
    //         this.currentPathCalculation.loopCount = 0;
    //     } else if (step === 1) {
    //         if (loopCount < this.maxLoopCount) {
    //             // 检查：当前点到终点是否有障碍物
    //             if (!this.checkObstacle(currentPos, endPos,true)) {
    //                 // 没有障碍物，直接到达终点
    //                 path.push({
    //                     position: endPos.clone(),
    //                     isTurnPoint: true
    //                 });
    //                 if (isNeedCreateArrow) {
    //                     this.createArrowsAlongPath(path);
    //                 }
    //                 this.currentPathCalculation.isProcessing = false;
    //                 return;
    //             }

    //             // 寻找最近的中转点
    //             const nearestPoint = this.findNearestRoadPoint(currentPos, excludedPoints, endPos);
    //             if (!nearestPoint) {
    //                 // 没有找到中转点
    //                 this.currentPathCalculation.isProcessing = false;
    //                 if (isNeedCreateArrow) {
    //                     this.createArrowsAlongPath(path);
    //                 }
    //                 return;
    //             }

    //             // 检测当前点到中转点是否有障碍物
    //             if (!this.checkObstacle(currentPos, nearestPoint,true)) {
    //                 // 无障碍物，添加中转点到路径
    //                 path.push({
    //                     position: nearestPoint.clone(),
    //                     isTurnPoint: true
    //                 });

    //                 // 将此中转点加入排除列表，避免重复使用
    //                 excludedPoints.push(nearestPoint);
    //                 this.currentPathCalculation.currentPos = nearestPoint.clone();

    //                 // 检查是否到达终点附近
    //                 if (Vec3.distance(nearestPoint, endPos) < this.roadPointDistance * 1.5) {
    //                     path.push({
    //                         position: endPos.clone(),
    //                         isTurnPoint: true
    //                     });
    //                     if (isNeedCreateArrow) {
    //                         this.createArrowsAlongPath(path);
    //                     }
    //                     this.currentPathCalculation.isProcessing = false;
    //                     return;
    //                 }
    //             } else {
    //                 // 有障碍物，将此点加入排除列表
    //                 excludedPoints.push(nearestPoint);
    //             }

    //             // 增加循环计数
    //             this.currentPathCalculation.loopCount++;
    //         } else {
    //             // 达到最大循环次数
    //             if (isNeedCreateArrow) {
    //                 this.createArrowsAlongPath(path);
    //             }
    //             this.currentPathCalculation.isProcessing = false;
    //         }
    //     }
    // }


    // 判断两点是否在同一层
    public isSameLayer(pos1: Vec3, pos2: Vec3): boolean {
        return Math.abs(pos1.y - pos2.y) <= this.sameLayerTolerance;
    }

    // 判断两点是否在同一层
    public isSameLayerWithTargetLayer(pos1: Vec3, pos2LayNumber: number): boolean {
        let startLayerNum = 0;
        if (pos1.y > this.floor2Y) {
            startLayerNum = 2;
        }
        else if (pos1.y < this.bottomPoint.y) {
            startLayerNum = 1;
        }
        return startLayerNum == pos2LayNumber;
    }

    public getFloorByPos(pos: Vec3): number {
        let floorNum = 0;
        if (pos.y > this.floor2Y) {
            floorNum = 2;
        }
        else if (pos.y < this.bottomPoint.y) {
            floorNum = 1;
        }
        return floorNum;
    }

    // 在同一层中寻找路径
    private findPathInSameLayer(startPos: Vec3, endPos: Vec3, isPlayer: boolean): JJTW_PathPoint[] {
        // 1. 初始化A*所需数据结构
        const openSet: AStarNode[] = []; // 待检查节点
        closedSet.clear();
        const path: JJTW_PathPoint[] = [];

        // 2. 获取当前层的候选节点（复用分层数据，提升性能）
        const currentLayer = startPos.y > this.floor2Y ? 2 : 1;
        const candidatePoints = [...this.roadPointsByLayer[currentLayer], endPos]; // 包含终点作为潜在节点

        // 3. 创建起点节点
        const startNode: AStarNode = {
            position: startPos.clone(),
            g: 0,
            h: this.heuristic(startPos, endPos),
            f: 0 + this.heuristic(startPos, endPos),
            parent: null
        };
        openSet.push(startNode);

        // 4. A*主循环
        //console.log("openset" + openSet.length);
        while (openSet.length > 0) {
            // 4.1 从openSet中找到f值最小的节点（优化：使用优先队列可提升性能）
            let currentIndex = 0;
            for (let i = 0; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }
            const currentNode = openSet.splice(currentIndex, 1)[0];

            // 4.2 到达终点，回溯路径
            if (Vec3.distance(currentNode.position, endPos) < this.roadPointDistance * 1.5) {
                let temp: AStarNode | null = currentNode;
                while (temp) {
                    path.unshift({
                        position: temp.position.clone(),
                        isTurnPoint: true
                    });
                    temp = temp.parent;
                }
                // if (this.isNeedArrow) {
                //     this.createArrowsAlongPath(path);
                // }
                return path;
            }

            // 4.3 将当前节点加入已检查集合
            closedSet.add(this.getVec3Hash(currentNode.position));

            // 4.4 获取当前节点的邻居（可达的中转点）
            const neighbors = this.getNeighbors(currentNode.position, candidatePoints, closedSet, isPlayer);

            // 4.5 处理每个邻居节点
            for (const neighborPos of neighbors) {
                // 跳过已检查的节点
                if (closedSet.has(this.getVec3Hash(neighborPos))) {
                    continue;
                }

                // 计算从当前节点到邻居的成本
                const tentativeG = currentNode.g + Vec3.distance(currentNode.position, neighborPos);

                // 检查邻居是否已在openSet中
                let neighborNode = openSet.find(n => Vec3.distance(n.position, neighborPos) < 0.01);
                if (!neighborNode) {
                    // 不在openSet中，创建新节点
                    neighborNode = {
                        position: neighborPos.clone(),
                        g: tentativeG,
                        h: this.heuristic(neighborPos, endPos),
                        f: tentativeG + this.heuristic(neighborPos, endPos),
                        parent: currentNode
                    };
                    openSet.push(neighborNode);
                } else if (tentativeG < neighborNode.g) {
                    // 已在openSet中但找到更优路径，更新成本和父节点
                    neighborNode.g = tentativeG;
                    neighborNode.f = neighborNode.g + neighborNode.h;
                    neighborNode.parent = currentNode;
                }
            }
        }

        // 5. 若循环结束未找到路径，返回空
        //console.log("A*算法未找到可行路径");
        // if (isPlayer) {
        //     this.createArrowsAlongPath(path);
        // }
        return [];
    }
    // 在不同层中寻找路径
    private findPathInDifferentLayers(startPos: Vec3, endPos: Vec3, isPlayer: boolean): JJTW_PathPoint[] {

        // 确保关键节点存在
        if (!this.topPoint || !this.middlePoint || !this.bottomPoint) {
            //console.error("缺少必要的中转点(top, middle, bottom)");
            return [];
        }

        let path: JJTW_PathPoint[] = [];

        // 判断起点位置情况
        if (startPos.y > this.floor2Y) {
            //console.log("起点在上层")
            // 起点在上层
            const upperPath = this.findPathInSameLayer(startPos, this.topPoint, isPlayer);
            if (upperPath.length === 0) return [];

            // 添加中间点和下层点
            upperPath.push({
                position: this.middlePoint.clone(),
                isTurnPoint: true
            });
            upperPath.push({
                position: this.bottomPoint.clone(),
                isTurnPoint: true
            });

            // 从下层点到终点的路径
            const lowerPath = this.findPathInSameLayer(this.bottomPoint, endPos, isPlayer);
            if (lowerPath.length === 0) return upperPath;

            // 合并路径，排除重复的起点
            path = upperPath.concat(lowerPath.slice(1));
        }
        else if (startPos.y < this.bottomPoint.y) {
            //console.log("起点在下层")

            const lowerPath = this.findPathInSameLayer(startPos, this.bottomPoint, isPlayer);
            if (lowerPath.length === 0) return [];

            //console.log("有到达楼梯的路径")
            // 添加中间点和上层点
            lowerPath.push({
                position: this.middlePoint.clone(),
                isTurnPoint: true
            });
            // lowerPath.push({
            //     position: this.middlePoint_up.clone(),
            //     isTurnPoint: true
            // });
            lowerPath.push({
                position: this.topPoint.clone(),
                isTurnPoint: true
            });

            //console.log("有走完楼梯的路径")

            // 从上层点到终点的路径
            const upperPath = this.findPathInSameLayer(this.topPoint, endPos, isPlayer);
            if (upperPath.length === 0) return lowerPath;

            // 合并路径，排除重复的起点
            path = lowerPath.concat(upperPath.slice(1));
        }
        else {
            //console.log("起点在中层")

            // 起点在楼梯中间
            let firstPoint: Vec3;
            let needMiddle = false;

            // 根据终点位置选择第一个目标点
            if (endPos.y > this.middlePoint.y) {
                firstPoint = this.topPoint;
                // 判断中间点是否应该包含在路径中
                needMiddle = this.middlePoint.y > startPos.y;
            } else {
                firstPoint = this.bottomPoint;
                // 判断中间点是否应该包含在路径中
                needMiddle = this.middlePoint.y < startPos.y;
            }

            // 生成到第一个目标点的路径
            let firstPath = this.findPathInSameLayer(startPos, firstPoint, isPlayer);
            if (firstPath.length === 0) return [];

            // 如果需要中间点，插入到路径中
            if (needMiddle) {
                // 找到插入位置
                const insertIndex = firstPath.findIndex(p =>
                    Vec3.distance(p.position, firstPoint) < this.roadPointDistance * 1.5
                );

                if (insertIndex > 0) {
                    firstPath.splice(insertIndex, 0, {
                        position: this.middlePoint.clone(),
                        isTurnPoint: true
                    });
                }
            }

            // 生成从第一个目标点到终点的路径
            const secondPath = this.findPathInSameLayer(firstPoint, endPos, isPlayer);
            if (secondPath.length === 0) return firstPath;

            // 合并路径，排除重复的起点
            path = firstPath.concat(secondPath.slice(1));
        }

        // this.createArrowsAlongPath(path);
        return path;
    }

    // 检查两点之间是否有障碍物
    public checkObstacle(start: Vec3, end: Vec3, isPlayer: boolean): boolean {

        const direction = end.clone().subtract(start).normalize();
        const distance = Vec3.distance(start, end);

        // 复用已有Ray对象，而非每次new
        geometry.Ray.fromPoints(this.ray, start, end);

        // 射线检测时传入mask，过滤无关层
        PhysicsSystem.instance.raycast(this.ray, this.raycastMask);
        const results = PhysicsSystem.instance.raycastResults;

        // 如果有碰撞结果且距离小于两点间距，则表示有障碍物
        if (results && results.length > 0) {
            for (const result of results) {
                const colliderGroup = result.collider.node.getComponent(JJTW_ColliderGroupNumber);
                if (!colliderGroup) continue; // 跳过无分组的碰撞体
                let groupType = [];
                if (!isPlayer) {
                    // 检测到障碍物
                    groupType = [
                        JJTW_ColliderGroupType.Wall,
                        JJTW_ColliderGroupType.Barrier,
                        JJTW_ColliderGroupType.Door_1,
                        JJTW_ColliderGroupType.Door_2,
                        JJTW_ColliderGroupType.Door_3,
                        JJTW_ColliderGroupType.Door_4,
                        JJTW_ColliderGroupType.Door_5,
                        JJTW_ColliderGroupType.Door_6,
                        JJTW_ColliderGroupType.Door_Normal,
                        JJTW_ColliderGroupType.Door_Exit,
                        JJTW_ColliderGroupType.Door_Stair_1,
                        JJTW_ColliderGroupType.Door_Stair_2,
                    ];
                }
                else {
                    groupType = [
                        JJTW_ColliderGroupType.Wall,
                        JJTW_ColliderGroupType.Barrier,
                    ];
                }
                const isObstacle = groupType.includes(colliderGroup.groupType)
                if (isObstacle && result.distance < distance - 0.01) {
                    return true; // 找到后立即返回，无需遍历全部
                }
            }
        }

        return false;
    }

    // 寻找最近的中转点
    private findNearestRoadPoint(currentPos: Vec3, excludedPoints: Vec3[], targetPos: Vec3): Vec3 {
        let nearestPoint: Vec3 = null;
        let minDistance = Infinity;

        // 关键：先获取当前位置所在楼层的中转点，而非遍历所有roadPoints
        const currentLayer = currentPos.y > this.floor2Y ? 2 : 1;
        const candidatePoints = this.roadPointsByLayer[currentLayer] || [];

        for (const point of candidatePoints) {
            // 跳过排除的点
            if (excludedPoints.some(p => Vec3.equals(p, point))) {
                continue;
            }

            // 跳过当前点附近的点
            if (Vec3.distance(currentPos, point) < 0.1) {
                continue;
            }

            // 判断是否在同一层
            if (!this.isSameLayer(currentPos, point)) {
                continue;
            }
            // 计算距离
            const distance = Vec3.distance(currentPos, point);

            // 同时考虑到目标点的方向，优先选择朝向目标点的中转点
            Vec3.subtract(this.tempVec3_1, point, currentPos);
            this.tempVec3_1.normalize(); // toPointDir
            Vec3.subtract(this.tempVec3_2, targetPos, currentPos);
            this.tempVec3_2.normalize(); // toTargetDir
            const dotProduct = Vec3.dot(this.tempVec3_1, this.tempVec3_2);

            // 方向因子，范围0-1，方向越接近目标点权重越高
            const directionFactor = (dotProduct + 1) / 2;

            // 综合距离和方向的权重计算
            const weightedDistance = distance * (1 - directionFactor * 0.3);

            // 更新最近点
            if (weightedDistance < minDistance) {
                minDistance = weightedDistance;
                nearestPoint = point;
            }

            // // 更新最近点
            // if (distance < minDistance) {
            //     minDistance = distance;
            //     nearestPoint = point;
            // }
        }
        // //console.log("有最近点")
        return nearestPoint;
    }

    // 沿着路径创建箭头
    private createArrowsAlongPath(path: JJTW_PathPoint[]) {
        // 清除已有的箭头
        this.clearArrows();

        if (path.length < 2) return;

        // 遍历路径点，在每两个点之间创建箭头
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i].position;
            const end = path[i + 1].position;

            this.createArrowsBetweenPoints(start, end);
        }
    }

    // 在两点之间创建箭头
    private createArrowsBetweenPoints(start: Vec3, end: Vec3) {

        const direction = end.clone().subtract(start);
        const distance = direction.length();
        direction.normalize();

        // 计算需要创建的箭头数量
        const arrowCount = Math.ceil(distance / this.roadPointDistance);

        // 创建箭头
        for (let i = 1; i <= arrowCount; i++) {
            const pos = start.clone().add(direction.clone().multiplyScalar(i * this.roadPointDistance));

            // 确保不超过终点
            if (Vec3.distance(start, pos) > distance) {
                pos.set(end);
            }

            // 从对象池获取箭头
            const arrow = this.getArrowFromPool();
            arrow.worldPosition = pos;

            arrow.eulerAngles = v3(0, 0, 0)
            // 只旋转y轴使本地坐标系x轴正方向指向目标方向
            // 计算绕y轴旋转的角度（在XZ平面上）
            // 计算Y轴旋转角度（仅绕Y轴旋转）
            const angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
            // 保持X轴为0，Z轴不变，仅设置Y轴旋转
            arrow.setRotationFromEuler(0, angle, 0);
        }
    }

    // 清除所有箭头
    private clearArrows() {
        // 将活跃的箭头移至非活跃列表并隐藏
        while (this.arrowPool.active.length > 0) {
            const arrow = this.arrowPool.active.pop();
            arrow.active = false;
            this.arrowPool.inactive.push(arrow);
        }
    }

    // 计算启发式距离（欧氏距离，适用于自由空间）
    private heuristic(pos: Vec3, target: Vec3): number {
        return Vec3.distance(pos, target);
    }

    // 获取节点的邻居（当前节点可达的中转点）
    private getNeighbors(currentPos: Vec3, candidates: Vec3[], closedSet: Set<string>, isPlayer: boolean): Vec3[] {
        const neighbors: Vec3[] = [];
        for (const point of candidates) {
            // 跳过自身和已检查节点
            if (Vec3.distance(currentPos, point) < 0.05 || closedSet.has(this.getVec3Hash(point))) {
                continue;
            }
            // 检查是否可达（无障碍物）
            if (!this.checkObstacle(currentPos, point, isPlayer)) {
                neighbors.push(point);
            }
        }
        return neighbors;
    }

    // 将Vec3转为字符串哈希，用于Set存储
    private getVec3Hash(pos: Vec3): string {
        return `${pos.x.toFixed(2)},${pos.y.toFixed(2)},${pos.z.toFixed(2)}`;
    }
}


