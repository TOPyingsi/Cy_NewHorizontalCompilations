import { _decorator, Component, instantiate, Node, Sprite, SpriteFrame, tween, UITransform, v3, Vec3 } from 'cc';
import { DH_LoadManager } from '../Manager/DH_LoadManager';
import { DH_DataManager } from '../Manager/DH_DataManager';
const { ccclass, property } = _decorator;

@ccclass('DH_FishLine')
export class DH_FishLine extends Component {
    public startUpdateLine: boolean = false;
    private startNode:Node = null;
    private endNode:Node = null;

    setStartNode(startNode:Node){
        this.startNode = startNode;
    }

    setSkin(fishingRodId:string){
        DH_LoadManager.Instance.getFishingRodIconById(fishingRodId, (spriteFrame:SpriteFrame) => {
            if (spriteFrame) {
                this.node.getComponent(Sprite).spriteFrame = spriteFrame;
            }
        });
    }


    hideLine(){
        this.startNode = null;
        this.endNode = null;
        this.startUpdateLine = false;
        this.node.active = false;
    }

    setStartAndEndNode(startNode:Node,endNode:Node) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.startUpdateLine = true;
        this.node.active = true
    }
    
    private isEndNeedMove = false;
    private moveSpeed = 2000;
    reelLine(){
        if(!this.endNode || !this.startNode)return;
        // this.node.active = false;
        let node = new Node;
        node.setParent(this.node.parent);
        node.setWorldPosition(this.endNode.worldPosition.clone())
        this.endNode = node;
        tween(node)
        .to(0.05,{worldPosition:this.startNode.worldPosition})
        .call(()=>{
            this.hideLine();
        })
        .start()
        // this.isEndNeedMove = true
    }

    killLine(){
        if(!this.endNode || !this.startNode)return;
        this.node.active = false;
        let node = new Node;
        node.setParent(this.node.parent);
        node.setWorldPosition(this.endNode.worldPosition.clone())
        this.endNode = node;
        let pos = this.startNode.worldPosition.clone();
        tween(node)
        .to(0.05,{worldPosition:v3(pos.x,pos.y+600,pos.z)})
        .call(()=>{
            this.hideLine();
        })
        .start()
    }

    update(deltaTime: number) {
        this.updateLine();
    }


    updateLine(){
        if(!this.startUpdateLine || !DH_DataManager.Instance.dynamicData.isFishingLineOpen)return;
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
            let sacle = DH_DataManager.Instance.dynamicData.isFishDirectionLeft?-1:1;
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


