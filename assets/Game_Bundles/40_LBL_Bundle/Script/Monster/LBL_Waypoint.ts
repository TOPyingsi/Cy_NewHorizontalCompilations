import { _decorator, Color, Component, geometry, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LBL_Waypoint')
export class LBL_Waypoint extends Component {

    // @property(LBL_Waypoint)
    // scanSysem: LBL_Waypoint;

    @property
    floor = 1; // 所在楼层

    @property
    isStair = false; // 是否是楼梯

    // @property
    // connectedWaypoint: LBL_Waypoint = null; // 相连的路点

    @property(Node)
    connectedWaypointsNode: Node[] = []; // 相连的路点

    @property
    stairConnectionNodes: Node[] = []; // 楼梯连接的其他楼层路点

    @property
    gizmoColor = new Color(1, 1, 0, 1); // 路点 gizmo 颜色

    @property
    gizmoSize = 0.5; // 路点 gizmo 大小

    connectedWaypoints: LBL_Waypoint[] = []; // 存储连接的路点

    stairConnections: LBL_Waypoint[] = []; // 存储楼梯连接的路点

    // public get connectedWaypoints(): LBL_Waypoint[] {
    //     return this.connectedWaypointsNode.map(node => node.getComponent(LBL_Waypoint));
    // }

    // public get stairConnections(): LBL_Waypoint[] {
    //     return this.stairConnectionNodes.map(node => node.getComponent(LBL_Waypoint));
    // }

    start() {

        this.connectedWaypointsNode.forEach(node => {
            const waypoint = node.getComponent(LBL_Waypoint); 
            this.connectedWaypoints.push(waypoint);
        })

        this.stairConnectionNodes.forEach(node => {
            const waypoint = node.getComponent(LBL_Waypoint); 
            this.stairConnections.push(waypoint);
        })

        // 确保路点连接是双向的
        this.connectedWaypoints.forEach(waypoint => {
            if (waypoint && !waypoint.getComponent(LBL_Waypoint).connectedWaypoints.includes(this)) {
                waypoint.getComponent(LBL_Waypoint).connectedWaypoints.push(this);
            }
        });

        // // 确保路点连接是双向的
        // this.connectedWaypoints.forEach(waypoint => {
        //     if (waypoint && !waypoint.getComponent(LBL_Waypoint).connectedWaypoints.includes(this)) {
        //         waypoint.getComponent(LBL_Waypoint).connectedWaypoints.push(this);
        //     }
        // });
    }

    // 添加连接
    addConnection(waypoint: LBL_Waypoint) {
        if (waypoint && !this.connectedWaypoints.includes(waypoint)) {
            this.connectedWaypoints.push(waypoint);
            waypoint.addConnection(this);
        }
    }

    // 移除连接
    removeConnection(waypoint: LBL_Waypoint) {
        const index = this.connectedWaypoints.indexOf(waypoint);
        if (index > -1) {
            this.connectedWaypoints.splice(index, 1);
            waypoint.removeConnection(this);
        }
    }

    // 绘制Gizmos
    onDrawGizmosSelected() {
        // const rendererComp = this.getComponent(MeshRenderer);
        // if (rendererComp) {
        //     rendererComp.enabled = false; // 隐藏默认模型
        // }

        // // 绘制路点
        // geometry.utils.drawSphere(this.node.worldPosition, this.gizmoSize, this.gizmoColor);

        // // 绘制连接线
        // this.connectedLBL_Waypoints.forEach(LBL_Waypoint => {
        //     if (LBL_Waypoint) {
        //         geometry.utils.drawLine(
        //             this.node.worldPosition, 
        //             LBL_Waypoint.node.worldPosition, 
        //             new Color(1, 1, 1, 1)
        //         );
        //     }
        // });

        // // 绘制楼梯跨楼层连接
        // if (this.isStair) {
        //     this.stairConnections.forEach(LBL_Waypoint => {
        //         if (LBL_Waypoint) {
        //             geometry.utils.drawLine(
        //                 this.node.worldPosition, 
        //                 LBL_Waypoint.node.worldPosition, 
        //                 new Color(0, 1, 1, 1)
        //             );
        //         }
        //     });
        // }
    }
}


