import { _decorator, Color, Component, geometry, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_Waypoint')
export class TKJWL_Waypoint extends Component {

    // @property(TKJWL_Waypoint)
    // scanSysem: TKJWL_Waypoint;
    @property(Number)
    doorId:number= 0; // 门id

    @property
    floor = 1; // 所在楼层

    @property
    isStair = false; // 是否是楼梯

    // @property
    // connectedWaypoint: TKJWL_Waypoint = null; // 相连的路点

    @property(Node)
    connectedWaypointsNode: Node[] = []; // 相连的路点

    @property
    stairConnectionNodes: Node[] = []; // 楼梯连接的其他楼层路点

    @property
    gizmoColor = new Color(1, 1, 0, 1); // 路点 gizmo 颜色

    @property
    gizmoSize = 0.5; // 路点 gizmo 大小

    connectedWaypoints: TKJWL_Waypoint[] = []; // 存储连接的路点

    stairConnections: TKJWL_Waypoint[] = []; // 存储楼梯连接的路点

    start() {

        this.connectedWaypointsNode.forEach(node => {
            const waypoint = node.getComponent(TKJWL_Waypoint); 
            this.connectedWaypoints.push(waypoint);
        })

        this.stairConnectionNodes.forEach(node => {
            const waypoint = node.getComponent(TKJWL_Waypoint); 
            this.stairConnections.push(waypoint);
        })

        // 确保路点连接是双向的
        this.connectedWaypoints.forEach(waypoint => {
            if (waypoint && !waypoint.getComponent(TKJWL_Waypoint).connectedWaypoints.includes(this)) {
                waypoint.getComponent(TKJWL_Waypoint).connectedWaypoints.push(this);
            }
        });

    }

    // 添加连接
    addConnection(waypoint: TKJWL_Waypoint) {
        if (waypoint && !this.connectedWaypoints.includes(waypoint)) {
            this.connectedWaypoints.push(waypoint);
            waypoint.addConnection(this);
        }
    }

    // 移除连接
    removeConnection(waypoint: TKJWL_Waypoint) {
        const index = this.connectedWaypoints.indexOf(waypoint);
        if (index > -1) {
            this.connectedWaypoints.splice(index, 1);
            waypoint.removeConnection(this);
        }
    }

}


