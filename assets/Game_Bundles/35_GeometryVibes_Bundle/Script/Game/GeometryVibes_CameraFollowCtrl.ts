import { _decorator, Component, Node, Vec3 } from 'cc';
import { GeometryVibes_DataManager } from '../Manager/GeometryVibes_DataManager';
const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_CameraFollowCtrl')
export class GeometryVibes_CameraFollowCtrl extends Component {
  @property([Node])
    followNodes: Node[] = [];

    private _isMoving = false;
    private _mainTarget: Node | null = null;
    private _initialXOffset = -500;

    startMoving() {
        this._isMoving = true;
    }

    stopMoving() {
        this._isMoving = false;
    }

    bindNode(node: Node) {
        this._mainTarget = node;
        this._initialXOffset = this.node.worldPosition.x - node.worldPosition.x;
        this.startMoving();
    }

    unbindNode() {
        this._mainTarget = null;
        this.stopMoving();
    }

    resetFollow(node: Node) {
        this.stopMoving();
        this._mainTarget = node;
        this.node.setWorldPosition(new Vec3(
            node.worldPosition.x + this._initialXOffset,
            this.node.worldPosition.y,
            this.node.worldPosition.z
        ));
        this.startMoving();
    }

    addFlowNode(node: Node) {
        this.followNodes.push(node); 
    }

    removeFlowNode(node: Node) {
        this.followNodes = this.followNodes.filter(followNode => followNode !== node);
    }


    update(deltaTime: number) {
        if (GeometryVibes_DataManager.getInstance().getIsPaused()||!this._isMoving || !this._mainTarget) return;
        const targetPos = this._mainTarget.worldPosition;
        this.node.setWorldPosition(new Vec3(
            targetPos.x + this._initialXOffset,
            this.node.worldPosition.y,
            this.node.worldPosition.z
        ));
  
        // 更新其他跟随节点的位置
        this.followNodes.forEach(followNode => {
            if (followNode) {
                const offset = followNode.worldPosition.x - this.node.worldPosition.x;
                followNode.worldPosition = new Vec3(
                    this.node.worldPosition.x + offset,
                    followNode.worldPosition.y,
                    followNode.worldPosition.z
                );
            }
        });
    }
}



