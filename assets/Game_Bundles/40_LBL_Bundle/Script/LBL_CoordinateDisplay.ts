import { _decorator, Component, Camera, Vec3, Vec2, Node, UITransform, Prefab, instantiate, view } from 'cc';
import { LBL_DataManager } from './LBL_DataManager';

const { ccclass, property } = _decorator;

// 目标点数据结构
export interface LBL_TargetPoint {
    id: string; // 唯一标识
    targetNode: Node; // 目标节点引用
    worldPosition: Vec3; // 世界坐标
    isVisible: boolean; // 是否可见
    uiPosition: Vec2; // 转换后的UI位置
}

@ccclass('LBL_CoordinateDisplay')
export class LBL_CoordinateDisplay extends Component {
    @property(Camera)
    playerCamera: Camera = null; // 玩家相机，需要在编辑器中绑定
    
    @property(Node)
    canvasNode: Node = null; // 主画布节点
    
    @property(Prefab)
    targetPrefab: Prefab = null; // 白色方块预制体
    
    private targetPoints: Map<string, LBL_TargetPoint> = new Map(); // 存储目标点
    private targetUIElements: Map<string, Node> = new Map(); // 存储UI元素
    private frameCount = 0;
    
    // 初始化
    start() {
        if (!this.playerCamera) {
            this.playerCamera = this.node.getComponent(Camera);
        }

    }
    
    // 接收目标节点列表的接口 - 新方法
    updateTargetNodes(nodes: Node[]) {
        // 移除已不存在的目标点
        const currentIds = nodes.map(node => node.uuid);
        this.targetPoints.forEach((_, id) => {
            if (!currentIds.includes(id)) {
                this.removeTargetPoint(id);
            }
        });
        
        // 添加或更新目标点
        nodes.forEach(node => {
            this.addOrUpdateTargetNode(node);
        });
    }
    
    // 添加或更新目标节点
    private addOrUpdateTargetNode(node: Node) {
        const nodeId = node.uuid; // 使用节点的唯一标识
        
        if (!this.targetPoints.has(nodeId)) {
            // 创建新目标点
            this.targetPoints.set(nodeId, {
                id: nodeId,
                targetNode: node,
                worldPosition: new Vec3(),
                isVisible: false,
                uiPosition: new Vec2()
            });
            
            // 创建UI元素
            const uiElement = instantiate(this.targetPrefab);
            uiElement.parent = this.canvasNode;
            uiElement.active = false;
            this.targetUIElements.set(nodeId, uiElement);
        } else {
            // 更新已有目标点的节点引用
            const target = this.targetPoints.get(nodeId);
            target.targetNode = node;
        }
        
        // 立即更新一次位置
        this.updateTargetNodePosition(nodeId);
    }
    
    // 移除目标点
    private removeTargetPoint(id: string) {
        this.targetPoints.delete(id);
        
        // 移除UI元素
        if (this.targetUIElements.has(id)) {
            const uiElement = this.targetUIElements.get(id);
            uiElement.destroy();
            this.targetUIElements.delete(id);
        }
    }
    
    // 更新目标节点的位置
    private updateTargetNodePosition(id: string) {
        const target = this.targetPoints.get(id);
        if (target && target.targetNode) {
            target.worldPosition = target.targetNode.worldPosition;
        }
    }
    
    // 每帧更新
    update(deltaTime: number) {
        // return;
        if(!LBL_DataManager.Instance.isGameStart) {
            // this.targetUIElements.forEach((uiElement) => {
            //     uiElement.active = false;
            // })
            return;
        }

        this.updateTargetNodes(LBL_DataManager.Instance.currentPointNodes);
        
        this.frameCount++;
    
        // 每3帧更新一次，优化性能
        if (this.frameCount % 1 === 0) {
            this.frameCount = 0;
            this.targetPoints.forEach((target, id) => {
                // // 先更新目标节点的当前位置
                // this.updateTargetNodePosition(id);
                
                // 转换3D世界坐标到屏幕坐标
                const screenPos = this.worldToScreenPoint(target.worldPosition);
                
                // 检查是否在相机视野内
                const isVisible = this.isPointInViewport(screenPos);
                target.isVisible = isVisible;
                target.uiPosition = screenPos;
                
                // 更新UI元素
                const uiElement = this.targetUIElements.get(id);
                if (uiElement) {
                    uiElement.active = isVisible;
                    if (isVisible) {
                        this.updateUIElementPosition(uiElement, screenPos);
                    }
                }
            });
        }
    }
    private worldToScreenPoint(worldPos: Vec3): Vec2 {
        // 增加可见性判断
        if (!this.isPointInFrontOfCamera(worldPos)) {
            return new Vec2(-9999, -9999); // 返回屏幕外坐标
        }
        
        let ndcPos = new Vec3();
        this.playerCamera.convertToUINode(worldPos, this.canvasNode, ndcPos);
        return new Vec2(ndcPos.x, ndcPos.y);
    }
    
    // 新增：判断目标点是否在相机前方
    private isPointInFrontOfCamera(worldPos: Vec3): boolean {
        // 获取相机方向向量
        const cameraForward = this.playerCamera.node.forward.clone();
        
        // 计算目标点相对于相机的方向
        const cameraPos = this.playerCamera.node.worldPosition;
        const toTarget = new Vec3(worldPos.x - cameraPos.x, 
                                worldPos.y - cameraPos.y, 
                                worldPos.z - cameraPos.z);
        
        // 计算点积判断是否同方向
        return Vec3.dot(cameraForward, toTarget) > 0;
    }
    // 检查点是否在视口内
    private isPointInViewport(ndcPos: Vec2): boolean {
        // const screenSize = view.getVisibleSize();

        // // 转换为屏幕坐标范围检查
        // return ndcPos.x >= 0 && ndcPos.x <= screenSize.width && 
        //         ndcPos.y >= 0 && ndcPos.y <= screenSize.height;
        return true;
    }
    
    // 更新UI元素位置
    private updateUIElementPosition(uiElement: Node, screenPos: Vec2) {
        const uiTransform = uiElement.getComponent(UITransform);
        if (uiTransform) {
            // 设置UI位置，考虑锚点
            uiElement.setPosition(screenPos.x, screenPos.y);
        }
    }
}
    