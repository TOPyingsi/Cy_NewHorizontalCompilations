import { _decorator, Component, instantiate, Node, Sprite, SpriteFrame, tween, UITransform, v3, Vec3 } from 'cc';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
import { XGDY_DataManager } from '../Manager/XGDY_DataManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_FishLine')
export class XGDY_FishLine extends Component {
    public startUpdateLine: boolean = false;
    @property(Node)
    startNode:Node = null;
    @property(Node)
    endNode:Node = null;
    private direction:number = 0;

   

    update(deltaTime: number) {
        this.updateLine();
    }

    updateLine(){
        if (this.startNode && this.endNode) {
            let endNode = this.endNode;
            // 计算鱼线长度
            const length = Vec3.distance(this.startNode.worldPosition, endNode.worldPosition);
            // 设置鱼线位置（中点）
            const midPos = new Vec3();
            Vec3.lerp(midPos, this.startNode.worldPosition, endNode.worldPosition, 0.5);
            this.node.worldPosition = midPos;

            const currentRatio = this.calcAngleRatio(this.startNode.worldPosition,endNode.worldPosition); // 当前角度（0~1.0）
            const rotationRad = currentRatio * Math.PI * 2; // 0~1.0 → 0~2π
      
            let sacle = XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft?-1:1;
            if(this.direction){
                sacle = this.direction;
            }
            this.node.eulerAngles = new Vec3(0, 0, sacle*rotationRad * 180 / Math.PI);

            // 缩放鱼线以匹配长度
            this.node.getComponent(UITransform).width = length*(1/Math.abs(this.node.parent.scale.x));
        }
    }

      /** 计算触摸点与中心点连线的角度（转为0~1.0范围） */
      private calcAngleRatio(startPos: Vec3,endPos: Vec3): number {
        // 计算触摸点相对锅中心的偏移向量
        const dir = new Vec3(endPos.x - startPos.x, endPos.y - startPos.y);
        // 计算角度（弧度）：正右为0，逆时针增加，顺时针减小
        let rad = Math.atan2(dir.y, dir.x); // 范围：-π ~ π
        // 转换为0~2π范围
        if (rad < 0) rad += 2 * Math.PI;
        // 转为0~1.0比例
        return rad / (2 * Math.PI);
    }

}


