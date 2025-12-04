import { Vec3 } from 'cc';
import { TKJWL_Waypoint } from './TKJWL_Waypoint';

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
