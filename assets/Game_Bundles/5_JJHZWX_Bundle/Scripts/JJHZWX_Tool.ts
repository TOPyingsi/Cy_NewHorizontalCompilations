import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JJHZWX_Tool')
export class JJHZWX_Tool extends Component {

    /* 获取两点之间的角度 */
    public static getAngle(startPos: Vec2, endPos: Vec2) {
        var dir = endPos.subtract(startPos);
        return 180 / Math.PI * Math.atan2(dir.y, dir.x);
    }
    //获得两物体之间的距离
    public static getdistance(ns1: Node, ns2: Node): number {
        let ns1pos: Vec3 = ns1.getWorldPosition().clone();
        let ns2pos: Vec3 = ns2.getWorldPosition().clone();
        let Juli = (ns1pos.subtract(ns2pos).length());
        return Juli;
    }

    //将物体的世界坐标设置为第二个参数物体的世界坐标
    public static ToWorldPos(node1: Node, node2: Node) {
        node1.setWorldPosition(node1.getWorldPosition().clone());
    }

    //判断两个数组内容是否完全相等
    public static ArrayIsEquality(array1: any[], array2: any[]) {
        if (array1.length != array2.length) return false;
        for (let i = 0; i < array1.length; i++) {
            if (array1[i] != array2[i]) return false;
        }
        return true;
    }


}


