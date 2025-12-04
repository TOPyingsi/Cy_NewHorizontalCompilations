import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_PusherMovement')
export class HXTJB_PusherMovement extends Component {
 // 推板移动的最大距离（从中心向两边的距离）
    moveRange: number = 25;
    
    // 运动周期（完成一次来回运动的时间，单位：秒）
    period: number = 4;

    saveDateTime: number = 4;
    passTime: number = 0;
    
    // 初始位置（用于重置）
    private startPos: Vec3 = Vec3.ZERO;
    
    // 时间累计
    private time: number = 0;

    onLoad() {
        // 记录初始位置
        this.startPos = this.node.position.clone();
    }

    setPos(pos: Vec3){
        this.node.setPosition(pos);
    }


    update(dt: number) {
        if(!HXTJB_DataManager.Instance.isGameStart)return;

        this.passTime += dt;
        if(this.passTime >= this.saveDateTime){
            this.passTime = 0;
            this.saveDateTime = 4;
            HXTJB_DataManager.Instance.saveData();
        }

        // 累加时间
        this.time += dt;
        
        // 计算正弦函数值（范围：-1 到 1）
        // 使用正弦函数的导数作为速度参考，实现加速-减速效果
        const speedFactor = Math.cos((this.time / this.period) * Math.PI * 2);
        
        // 计算当前位置的百分比（基于正弦函数）
        // 使用负的余弦函数是因为我们希望从0开始运动
        const positionFactor = -Math.cos((this.time / this.period) * Math.PI * 2) / 2 + 0.5;
        
        // 计算目标位置（从左到右：0 到 1 映射到 -moveRange 到 moveRange）
        const targetZ = this.startPos.z + (positionFactor * 2 - 1) * this.moveRange;
        
        // 设置位置（保持Y坐标不变）
        this.node.setPosition(this.startPos.x, this.startPos.y, targetZ);
    }
    
    // 重置推板位置和运动状态
    reset() {
        this.time = 0;
        this.node.position = this.startPos.clone();
    }
}



