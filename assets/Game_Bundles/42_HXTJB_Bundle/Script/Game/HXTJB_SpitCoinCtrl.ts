import { _decorator, Component, Node, Camera, EventTouch, Vec2, Vec3, PhysicsSystem, Prefab, instantiate, BoxCollider, ICollisionEvent, geometry, v3 } from 'cc';
import { HXTJB_Coin } from './HXTJB_Coin';
import { HXTJB_PHY_GROUP } from '../Common/HXTJB_PHY_GROUP';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_SpitCoinCtrl')
export class HXTJB_SpitCoinCtrl extends Component {
    @property(Camera)
    camera: Camera = null;  // 主相机

    @property(Camera)
    UICamera: Camera = null;  // 主相机

    @property(Node)
    touchLayer: Node = null;  // 左出币口

    @property(Node)
    coinsLayer: Node = null;  // 主相机
    
    @property(BoxCollider)
    targetArea: BoxCollider = null;  // 目标区域碰撞体

    @property(Node)
    leftCoinEmitter: Node = null;  // 左出币口

    @property(Node)
    rightCoinEmitter: Node = null;  // 右出币口

    @property(Prefab)
    coinPrefab: Prefab = null;  // 金币预制体

    @property(Node)
    sccoreArea: Node = null;  // 右出币口



    onLoad(){
        
        // 在游戏初始化时调用
        // PhysicsSystem.instance.gravity = new Vec3(0, -9.8 * 0.7, 0); // 重力加速度减半
        PhysicsSystem.instance.defaultMaterial.friction = 1; // 设置默认摩擦力

        this.touchLayer.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    start() {
        // 确保物理系统已启用
        if (!PhysicsSystem.instance.enable) {
            PhysicsSystem.instance.enable = true;
            PhysicsSystem.instance.gravity = new Vec3(0, 0, 0); // 禁用重力
        }
    }

    // 处理触摸结束事件
    onTouchEnd(event: EventTouch) {
        const touchPos = event.getLocation();
        // console.log("点击屏幕位置:", touchPos);
        const worldPos = this.getWorldPositionFromScreen(touchPos);
        // console.log("点击射线位置:", worldPos);
        if (worldPos /*&& this.isPointInTargetArea(worldPos)*/) {
            const area = this.checkClickArea(worldPos);
            this.shootCoin(worldPos, area);
        }
    }

    // 将屏幕坐标转换为3D世界坐标
    getWorldPositionFromScreen(pos: Vec2): Vec3 | null {
        if (!this.camera) {
            console.error("请指定主相机");
            return null;
        }

        let ray = new geometry.Ray;
        
        // let v = v3();
        // this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
        // this.camera.screenPointToRay(v.x, v.y, ray);

        // 创建射线
        this.camera.screenPointToRay(pos.x, pos.y,ray);
        
                // 射线检测所有碰撞体
        const mask = HXTJB_PHY_GROUP.ClickArea ; // 检测所有分组
        const maxDistance = 700;
        const queryTrigger = true;


        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
            const result = PhysicsSystem.instance.raycastClosestResult;
            // console.log("点击位置:", result.hitPoint);
            return result.hitPoint;
        }
        // if (PhysicsSystem.instance.raycast(ray, mask, maxDistance, queryTrigger)) {
        //     const result = PhysicsSystem.instance.raycastResults[0];
        //     console.log("点击模型:", result.collider.node.name);
        //     console.log("点击位置:", result.hitPoint);
        //     return result.hitPoint;
        // }
        return null;
    }

    // // 检查点是否在目标区域内
    // isPointInTargetArea(pos: Vec3): boolean {
    //     if (!this.targetArea) {
    //         console.error("请指定目标区域碰撞体");
    //         return false;
    //     }

    //     const bounds = this.targetArea.worldBounds;
    //     return bounds.contains(pos);
    // }

    // 判断点击位置在左半还是右半
    checkClickArea(position: Vec3): 'left' | 'right' {
        if (!this.targetArea) {
            console.error("请指定目标区域碰撞体");
            return 'left';
        }
        // console.log("目标区域:", this.targetArea.node.worldPosition);
        const center = this.targetArea.node.worldPosition;
        return position.x < center.x ? 'left' : 'right';
    }

    // 发射金币
    shootCoin(targetPos: Vec3, area: 'left' | 'right') {
        if(HXTJB_DataManager.Instance.currentCoins <= 0){
            HXTJB_DataManager.Instance.Tip = '金币不足,请先兑币'
            EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_TIP_PANEL)
            return;
        } 
        // if(!HXTJB_DataManager.Instance.isInit){
        //     HXTJB_DataManager.Instance.isInit = true;
        //     // EventManager.Scene.emit(HXTJB_GameEvents.UI_Hide_TIP_PANEL)
        //     return;
        // }
        EventManager.Scene.emit(HXTJB_GameEvents.UI_HIDE_CLICK_TIP);
        if (!this.coinPrefab) {
            console.error("请指定金币预制体");
            return;
        }

        // 选择出币口
        const emitter = area === 'left' ? this.rightCoinEmitter : this.leftCoinEmitter;
        
        if (!emitter) {
            console.error("请指定出币口节点");
            return;
        }

        // 创建金币
        const coin = instantiate(this.coinPrefab);
        this.coinsLayer.addChild(coin);
        coin.setWorldPosition(emitter.getChildByName("createPoint").worldPosition);

        // 获取金币组件并设置飞行参数
        const coinComp = coin.getComponent(HXTJB_Coin);
        if (coinComp) {
            coinComp.bindScoreArea(this.sccoreArea);
            coinComp.flyTo(targetPos);
            HXTJB_DataManager.Instance.currentCoins -= 1;
            HXTJB_DataManager.Instance.saveData();
            EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_COIN)

        } else {
            console.error("金币预制体缺少HJTJB_Coin组件");
            coin.destroy();
        }
    }
}
