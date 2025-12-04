import { Vec3 } from 'cc';
import { TKJWL_Waypoint } from './TKJWL_Waypoint';
import { TKJWL_BinaryHeap } from './TKJWL_BinaryHeap';

// A*算法节点类
export class TKJWL_AStarNode {
    waypoint: TKJWL_Waypoint;
    parent: TKJWL_AStarNode | null = null;
    gCost: number = 0; // 从起点到当前节点的成本
    hCost: number = 0; // 从当前节点到目标的估计成本
    
    constructor(waypoint: TKJWL_Waypoint) {
        this.waypoint = waypoint;
    }
    
    // 总成本
    get fCost(): number {
        return this.gCost + this.hCost;
    }
}

// // 二叉堆实现
// export class TKJWL_BinaryHeap {
//     private elements: TKJWL_AStarNode[] = [];
    
//     get count(): number {
//         return this.elements.length;
//     }
    
//     push(node: TKJWL_AStarNode) {
//         this.elements.push(node);
//         let childIndex = this.elements.length - 1;
        
//         while (childIndex > 0) {
//             const parentIndex = Math.floor((childIndex - 1) / 2);
//             if (this.elements[childIndex].fCost >= this.elements[parentIndex].fCost)
//                 break;
                
//             this.swap(childIndex, parentIndex);
//             childIndex = parentIndex;
//         }
//     }
    
//     pop(): TKJWL_AStarNode | undefined {
//         if (this.elements.length === 0) return undefined;
        
//         const frontItem = this.elements[0];
//         const lastIndex = this.elements.length - 1;
//         this.elements[0] = this.elements[lastIndex];
//         this.elements.pop();
        
//         let parentIndex = 0;
//         while (true) {
//             const leftChildIndex = 2 * parentIndex + 1;
//             const rightChildIndex = 2 * parentIndex + 2;
//             let smallestChildIndex = parentIndex;
            
//             if (leftChildIndex < this.elements.length && 
//                 this.elements[leftChildIndex].fCost < this.elements[smallestChildIndex].fCost) {
//                 smallestChildIndex = leftChildIndex;
//             }
            
//             if (rightChildIndex < this.elements.length && 
//                 this.elements[rightChildIndex].fCost < this.elements[smallestChildIndex].fCost) {
//                 smallestChildIndex = rightChildIndex;
//             }
            
//             if (smallestChildIndex === parentIndex)
//                 break;
                
//             this.swap(parentIndex, smallestChildIndex);
//             parentIndex = smallestChildIndex;
//         }
        
//         return frontItem;
//     }
    
//     private swap(index1: number, index2: number) {
//         const temp = this.elements[index1];
//         this.elements[index1] = this.elements[index2];
//         this.elements[index2] = temp;
//     }
    
//     contains(node: TKJWL_AStarNode): boolean {
//         return this.elements.includes(node);
//     }
    
//     updateNode(node: TKJWL_AStarNode) {
//         const index = this.elements.indexOf(node);
//         if (index === -1) return;
        
//         let childIndex = index;
//         while (childIndex > 0) {
//             const parentIndex = Math.floor((childIndex - 1) / 2);
//             if (this.elements[childIndex].fCost >= this.elements[parentIndex].fCost)
//                 break;
                
//             this.swap(childIndex, parentIndex);
//             childIndex = parentIndex;
//         }
//     }
// }

export class TKJWL_AStar {

    // 若无需其他用途，可删除该类，或保留基础节点定义
    static createNode(waypoint: TKJWL_Waypoint): TKJWL_AStarNode {
        return new TKJWL_AStarNode(waypoint);
    }

    // 查找从起点到终点的路径
    findPath(start: TKJWL_Waypoint, end: TKJWL_Waypoint): TKJWL_Waypoint[] | null {
        const openSet = new TKJWL_BinaryHeap();
        const closedSet = new Set<TKJWL_Waypoint>();
        const nodeMap = new Map<TKJWL_Waypoint, TKJWL_AStarNode>();
        
        const startNode = new TKJWL_AStarNode(start);
        const endNode = new TKJWL_AStarNode(end);
        
        nodeMap.set(start, startNode);
        openSet.push(startNode);
        
        while (openSet.count > 0) {
            const currentNode = openSet.pop();
            if (!currentNode) break;
            
            closedSet.add(currentNode.waypoint);
            
            // 到达终点
            if (currentNode.waypoint === endNode.waypoint) {
                return this.retracePath(startNode, currentNode);
            }
            
            // 检查所有邻居
            currentNode.waypoint.connectedWaypoints.forEach(neighborWaypoint => {
                if (!neighborWaypoint || closedSet.has(neighborWaypoint))
                    return;
                    
                // 计算成本
                const newMovementCostToNeighbor = currentNode.gCost + 
                    Vec3.distance(
                        currentNode.waypoint.node.worldPosition, 
                        neighborWaypoint.node.worldPosition
                    );
                    
                let neighborNode = nodeMap.get(neighborWaypoint);
                if (!neighborNode) {
                    neighborNode = new TKJWL_AStarNode(neighborWaypoint);
                    nodeMap.set(neighborWaypoint, neighborNode);
                }
                
                // 如果找到更优路径
                if (newMovementCostToNeighbor < neighborNode.gCost || !openSet.contains(neighborNode)) {
                    neighborNode.gCost = newMovementCostToNeighbor;
                    neighborNode.hCost = this.calculateHCost(neighborWaypoint, endNode.waypoint);
                    neighborNode.parent = currentNode;
                    
                    if (!openSet.contains(neighborNode)) {
                        openSet.push(neighborNode);
                    } else {
                        openSet.updateNode(neighborNode);
                    }
                }
            });
        }
        
        // 找不到路径
        return null;
    }
    
    // 计算启发式成本（使用欧几里得距离）
    private calculateHCost(waypointA: TKJWL_Waypoint, waypointB: TKJWL_Waypoint): number {
        return Vec3.distance(waypointA.node.worldPosition, waypointB.node.worldPosition);
    }
    
    // 回溯路径
    private retracePath(startNode: TKJWL_AStarNode, endNode: TKJWL_AStarNode): TKJWL_Waypoint[] {
        const path: TKJWL_Waypoint[] = [];
        let currentNode: TKJWL_AStarNode | null = endNode;
        
        while (currentNode !== startNode && currentNode) {
            path.push(currentNode.waypoint);
            currentNode = currentNode.parent;
        }
        
        path.push(startNode.waypoint);
        path.reverse();
        
        return path;
    }
}
    