import { Vec3 } from 'cc';
import { LBL_Waypoint } from './LBL_Waypoint';

// A*算法节点类
export class LBL_AStarNode {
    waypoint: LBL_Waypoint;
    parent: LBL_AStarNode | null = null;
    gCost: number = 0; // 从起点到当前节点的成本
    hCost: number = 0; // 从当前节点到目标的估计成本
    
    constructor(waypoint: LBL_Waypoint) {
        this.waypoint = waypoint;
    }
    
    // 总成本
    get fCost(): number {
        return this.gCost + this.hCost;
    }
}
