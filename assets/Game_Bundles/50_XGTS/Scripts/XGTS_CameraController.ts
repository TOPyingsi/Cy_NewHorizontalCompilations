import { _decorator, Vec2, v2, Component, Camera, Tween, tween, Vec3, v3, Node, view } from 'cc';
const { ccclass, property } = _decorator;

import { EasingType } from '../../../Scripts/Framework/Utils/TweenUtil';
import { EventManager } from '../../../Scripts/Framework/Managers/EventManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTS_Constant } from './XGTS_Constant';
import { XGTS_LvManager } from './XGTS_LvManager';
import { XGTS_GameManager } from './XGTS_GameManager';

const v2_0: Vec3 = v3();
const v2_1: Vec3 = v3();
const v2_2: Vec3 = v3();
const v2_3: Vec3 = v3();

@ccclass('XGTS_CameraController')
export default class XGTS_CameraController extends Component {
    static Instance: XGTS_CameraController = null;
    camera: Camera | null = null;
    stopFollow: boolean = false;
    target: Node = null;

    player1: Node = null;
    player2: Node = null;

    // 基础相机高度（屏幕五分之四大小对应的高度）
    baseOrthoHeight: number = 540;
    // 最大相机高度（1.5倍屏幕大小）
    maxOrthoHeight: number = 850;

    maxDistanceHight: number = 1200;
    maxDistanceWidth: number = 2800;

    // 屏幕宽高比
    screenRatio: number = 16/9; // 根据实际屏幕设置

    onLoad() {
        XGTS_CameraController.Instance = this;
        this.camera = this.node.getComponent(Camera);
        this.node.setWorldPosition(XGTS_LvManager.Instance.playerPosition.worldPosition);

        // this.screenRatio = view.getVisibleSize().width / view.getVisibleSize().height;
        const visibleSize = view.getVisibleSize();
        this.screenRatio = visibleSize.width / visibleSize.height;
        
        // 计算在maxOrthoHeight下的屏幕尺寸
        const scaleFactor = this.maxOrthoHeight / this.camera.orthoHeight;
        const screenHeightAtMaxOrtho = Math.floor(visibleSize.height * scaleFactor);
        const screenWidthAtMaxOrtho = Math.floor(visibleSize.width * scaleFactor);
        this.maxDistanceHight = screenHeightAtMaxOrtho - 200;
        this.maxDistanceWidth = screenWidthAtMaxOrtho - 200;

        EventManager.on(XGTS_Constant.Event.RESET_CAMERA, this.resetCamera, this);
    }

    protected onDestroy(): void {
        EventManager.off(XGTS_Constant.Event.RESET_CAMERA, this.resetCamera, this);
    }

    resetCamera(){
        this.target = null;
        this.player1 = null;
        this.player2 = null;
    }

    Move(delta: Vec3) {
        this.stopFollow = true;
        this.node.getPosition(v2_3);
        v2_3.add(delta.negative().multiplyScalar(5));
        v2_3.set(v3(Tools.Clamp(v2_3.x, -XGTS_LvManager.Instance.MapSize.x / 2, XGTS_LvManager.Instance.MapSize.x / 2), Tools.Clamp(v2_3.y, -XGTS_LvManager.Instance.MapSize.y / 2, XGTS_LvManager.Instance.MapSize.y / 2)));
        this.node.setPosition(v3(v2_3.x, v2_3.y, 1000));
    }

    ZoomIn() {
        Tween.stopAllByTarget(this.camera);
        tween(this.camera).to(0.2, { orthoHeight: 540 }, { easing: EasingType.quadIn }).start();
    }

    ZoomOut(ratio: number = 600, doneCb: Function = null) {
        Tween.stopAllByTarget(this.camera);
        tween(this.camera).to(0.2, { orthoHeight: ratio }, { easing: EasingType.quadIn }).start();
        tween(this.camera.node).to(0.3, { position: v3(this.camera.node.position.x, this.camera.node.position.y + 1, this.camera.node.position.z) }).call(() => {
            doneCb && doneCb();
        }).start();
    }

    setDoublePlayer(player1:Node,player2:Node) {
        this.player1 = player1;
        this.player2 = player2;
    }

    checkPlayerMovementRestriction(dx: number, dy: number) {
    // 计算临界值（1.5倍屏幕大小）
    
    // 检查是否达到临界值
    const isWidthMaxed = dx >= this.maxDistanceWidth;
    const isHeightMaxed = dy >= this.maxDistanceHight;
    
    // 发送事件通知玩家控制器限制移动
      EventManager.Scene.emit(XGTS_Constant.Event.RESTRICT_PLAYER_MOVEMENT, {
        restrictX: isWidthMaxed,
        restrictY: isHeightMaxed,
        midPoint: this.node.worldPosition
    });
}


    update(dt) {
        if (this.stopFollow) return;
        if(XGTS_GameManager.IsDoubleMode ){
            if(this.player1 && this.player2){
                // 获取两个玩家的世界位置
                this.player1.getWorldPosition(v2_0);
                this.player2.getWorldPosition(v2_1);
                
                // 计算中间点
                const midPoint = v3(
                    (v2_0.x + v2_1.x) / 2,
                    (v2_0.y + v2_1.y) / 2,
                    1000
                );
                
                // 计算两个玩家之间的距离
                const dx = Math.abs(v2_0.x - v2_1.x);
                const dy = Math.abs(v2_0.y - v2_1.y);
                
                // 根据距离计算需要的相机高度
                const requiredWidth = dx / 0.8; // 五分之四屏幕宽度
                const requiredHeight = dy / 0.8; // 五分之四屏幕高度
                
                // 考虑宽高比的实际需要高度
                const requiredOrthoWidth = requiredWidth / this.screenRatio;
                const targetOrthoHeight = Math.max(requiredOrthoWidth, requiredHeight, this.baseOrthoHeight);
                const finalOrthoHeight = Math.min(targetOrthoHeight, this.maxOrthoHeight);
                
                // 设置相机高度
                this.camera.orthoHeight = finalOrthoHeight;
                
                // 平滑移动到中间点
                Vec3.lerp(v2_2, this.node.worldPosition, midPoint, 0.15);
                this.node.setWorldPosition(v2_2);
                
                // 检查是否需要限制玩家移动
                this.checkPlayerMovementRestriction(dx, dy);
            }
             else if(this.player1 || this.player2) {
                // 当只有一位玩家存活时
                const alivePlayer = this.player1 || this.player2;
                alivePlayer.getWorldPosition(v2_0);
                
                // 保持当前高度，仅移动中心点
                Vec3.lerp(v2_2, this.node.worldPosition, v3(v2_0.x, v2_0.y, 1000), 0.1);
                this.node.setWorldPosition(v2_2);
                
                // 检查是否需要限制玩家移动
                this.checkPlayerMovementRestriction(0, 0);
            }
            else {
                // 两位玩家都死亡，停止跟踪
                return;
            }
          
        }
        else{
            if (!this.target) return;
            this.node.getWorldPosition(v2_0);
            this.target.getWorldPosition(v2_1);
            Vec2.lerp(v2_2, v2_0, v2_1, 0.3);
            this.node.setWorldPosition(v3(v2_2.x, v2_2.y, 1000));
        }

    }
}