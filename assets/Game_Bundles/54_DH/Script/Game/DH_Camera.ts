// 导入Cocos Creator核心模块
import { _decorator, Component, Node, Vec3, tween, Quat, Camera, view, v3 } from 'cc';
import { DH_DataManager } from '../Manager/DH_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
// 导入数据管理器

// 获取装饰器
const { ccclass, property } = _decorator;

/**
 * 相机控制组件
 * 负责实现镜头跟随、镜头控制和镜头抖动效果
 * 遵循游戏设计文档中对相机功能的要求
 */
@ccclass('DH_Camera')
export class DH_Camera extends Component {

    @property({ tooltip: "跟随目标节点" })
    private followTarget: Node = null;

    @property({ tooltip: "跟随平滑度，值越小越平滑" })
    private followSmoothness: number = 0.1;




  

    @property({ tooltip: "默认缩放值" })
    private defaultZoom: number = 1.0;

    @property({ tooltip: "最大缩放值" })
    private maxZoom: number = 2.0;

    @property({ tooltip: "最小缩放值" })
    private minZoom: number = 0.5;

    
    private speedScale:number = 2.0;
    private isShaking: boolean = false; // 是否正在抖动
    private originalPosition: Vec3 = new Vec3(); // 抖动前的原始位置
    private targetPosition: Vec3 = new Vec3(); // 目标位置
    private currentZoom: number = 1.0; // 当前缩放值
    private isFollowing: boolean = false; // 是否正在跟随目标

    private isInit = false; // 是否初始化完成

    private isOrginHight = true; // 是否保持高度
    private orginHight = 0;


    /**
     * 设置缩放值
     * @param zoom 缩放值
     */





    /**
     * 组件加载时的初始化方法
     * Cocos Creator生命周期函数
     */
    onLoad() {
        this.orginHight = this.node.getComponent(Camera).orthoHeight;
    }

    init(){
        this.isInit = true;
        this.addEventListener()
        // 初始化相机位置和缩放
        this.originalPosition = this.node.position.clone();
        this.currentZoom = this.defaultZoom;
        this.setZoom(this.currentZoom);
    }

    exit(){

    }

    setOrignPos(){
        const viewport = view.getVisibleSize();
        let worldPos = v3(viewport.width/2,viewport.height/2,this.node.worldPosition.z);
        this.setCameraPosition(worldPos);
    }

    setCameraPosition(worldPosition:Vec3){
        let pos = worldPosition.clone();
        pos.z = this.node.position.z;
        this.node.setWorldPosition(pos);
        
        // 如果正在震动，更新原始位置以确保震动基于新位置
        if (this.isShaking) {
            this.originalPosition = this.node.worldPosition.clone();
        }
    }

    /**
     * 设置跟随目标
     * @param target 要跟随的节点
     */
    setFollowTarget(target: Node,speedScale = 2,isOrginHight = true) {
        if(!this.isInit)this.init();
        this.speedScale = speedScale;
        this.isOrginHight = isOrginHight;

        this.followTarget = target;
        this.isFollowing = !!target; // 如果目标存在则开启跟随
        
        // 如果设置了新目标，立即更新目标位置
        if (target) {
            this.targetPosition = target.worldPosition.clone();
        }
    }

    /**
     * 停止跟随目标
     */
    stopFollow() {
        this.isFollowing = false;
        this.followTarget = null;
    }

    /**
     * 开始相机跟随
     */
    startFollow() {
        if (this.followTarget) {
            this.isFollowing = true;
        }
    }

    /**
     * 控制镜头移动到指定位置
     * @param position 目标位置
     * @param zoom 目标缩放值
     * @param duration 移动时间(秒)
     */
    moveTo(position: Vec3, zoom: number = this.defaultZoom, duration: number = 1.0) {
        // 停止跟随
        this.isFollowing = false;
        
        // 限制缩放范围
        zoom = Math.max(this.minZoom, Math.min(zoom, this.maxZoom));
        
        // 保存目标位置和缩放
        this.targetPosition = position.clone();
        const targetZoom = zoom;
        
        // 使用缓动动画移动镜头
        const originalPos = this.node.position.clone();
        const originalZoom = this.currentZoom;
        
        let timeElapsed = 0;
        // this.scheduleUpdate(() => {
        //     if (timeElapsed < duration) {
        //         timeElapsed += dt;
        //         const t = timeElapsed / duration;
                
        //         // 计算位置插值
        //         Vec3.lerp(this.node.position, originalPos, this.targetPosition, t);
                
        //         // 计算缩放插值
        //         const currentZoom = originalZoom + (targetZoom - originalZoom) * t;
        //         this.setZoom(currentZoom);
        //     } else {
        //         // 动画结束，设置最终位置和缩放
        //         this.node.position = this.targetPosition.clone();
        //         this.setZoom(targetZoom);
        //         this.unscheduleUpdate();
        //     }
        // });
    }

    /**
     * 设置相机缩放
     * @param zoom 缩放值
     */
    private setZoom(zoom: number) {
        this.currentZoom = zoom;
        // 设置相机的缩放，根据实际使用的相机组件调整
        const camera = this.node.getComponent(Camera);
        if (camera) {
            // 对于正交相机，调整正交大小
            // if (camera.projection === Camera.Projection.ORTHO) {
                camera.orthoHeight = 500 / zoom; // 假设基础正交高度为500
            // } 
            // 对于透视相机，调整视野
            // else {
            //     camera.fov = 60 / zoom; // 假设基础视野为60度
            // }
        }
    }



        
    // 震动相关属性
    private shakeStartTime: number = 0; // 震动开始时间
    private shakeEndTime: number = 0; // 震动结束时间
    private shakeDuration: number = 1;
    private shakeIntensity: number = 45;

    /**
     * 镜头快速抖动效果
     * @param duration 震动持续时间（秒）
     */
    shake(duration: number = this.shakeDuration) {
        if (this.isShaking) return;
        
        this.isShaking = true;
        this.originalPosition = this.node.worldPosition.clone();
        this.shakeStartTime = Date.now();
        this.shakeEndTime = this.shakeStartTime + duration * 1000;
    }

    // /**
    //  * 每帧更新逻辑
    //  * 处理相机跟随
    //  * @param deltaTime 帧间隔时间(秒)
    //  */
    // update(deltaTime: number) {
    //     // 如果正在抖动，不执行跟随逻辑
    //     if (this.isShaking) return;
        
    //     // 处理相机跟随
    //     if (this.isFollowing && this.followTarget) {
    //         // 获取目标位置（忽略Z轴，保持2D效果）
    //         const targetPos = this.followTarget.worldPosition.clone();
    //         targetPos.z = this.node.worldPosition.z; // 保持相机的Z轴位置
            
    //         // 使用平滑插值更新相机位置
    //         let currentPos = this.node.worldPosition.clone();
    //         let newPos = null;
    //         Vec3.lerp(
    //             newPos,
    //             currentPos,
    //             targetPos,
    //             this.followSmoothness / deltaTime
    //         );
    //         this.node.setWorldPosition(newPos);
    //     }
    // }


    targetPos:Vec3 = new Vec3(); //目标位置
      /**
     * 视图跟随玩家
     * @param dt 
     */
      public followPlayer(dt:number)
      {
        if(!this.followTarget ||!this.followTarget.worldPosition)return;
          this.targetPos = this.followTarget.worldPosition.clone();
          
          this.targetPos.z = this.node.worldPosition.z; // 保持相机的Z轴位置

          let targetOrthoHight =this.isOrginHight? this.orginHight:350;
  
          const viewport = view.getVisibleSize();
          let cameraRightLimt = DH_DataManager.Instance.dynamicData.mapWidth/2 - viewport.width/2 + viewport.width/2;
          let cameraLeftLimt = -DH_DataManager.Instance.dynamicData.mapWidth/2 + viewport.width/2 + viewport.width/2;
          let cameraTopLimt = DH_DataManager.Instance.dynamicData.mapHeight/2 - viewport.height/2 + viewport.height/2;
          let cameraBottomLimt = -DH_DataManager.Instance.dynamicData.mapHeight/2 + viewport.height/2  + viewport.height/2;
          if(this.targetPos.x > cameraRightLimt)
          {
              this.targetPos.x = cameraRightLimt;
          }else if(this.targetPos.x < cameraLeftLimt)
          {
              this.targetPos.x =  cameraLeftLimt;
          }    
  
          if(this.targetPos.y > cameraTopLimt)
          {
              this.targetPos.y = cameraTopLimt;
          }else if(this.targetPos.y < cameraBottomLimt)
          {
              this.targetPos.y =  cameraBottomLimt;
          }

          
  
          //摄像机平滑跟随
         
          this.node.setWorldPosition(this.node.worldPosition.lerp(this.targetPos,dt * this.speedScale));
  
                    // 相机视角平滑跟随
            const camera = this.node.getComponent(Camera);
            if (camera) {
                const currentOrthoHeight = camera.orthoHeight;
                const newOrthoHeight = currentOrthoHeight + (targetOrthoHight - currentOrthoHeight) * dt * this.speedScale;
                camera.orthoHeight = newOrthoHeight;
            }
      }
  
  
    //   /**
    //    *把视野定位到给定位置 
    //   * @param px
    //   * @param py
    //   * 
    //   */		
    //   public setViewToPoint(px:number,py:number):void
    //   {
    //       this.targetPos = cc.v2(px,py).sub(cc.v2(cc.winSize.width / 2,cc.winSize.height / 2));
  
    //       if(this.targetPos.x > this._mapParams.mapWidth - cc.winSize.width)
    //       {
    //           this.targetPos.x = this._mapParams.mapWidth - cc.winSize.width;
    //       }else if(this.targetPos.x < 0)
    //       {
    //           this.targetPos.x = 0;
              
    //       }    
  
    //       if(this.targetPos.y > this._mapParams.mapHeight - cc.winSize.height)
    //       {
    //           this.targetPos.y = this._mapParams.mapHeight - cc.winSize.height;
    //       }else if(this.targetPos.y < 0)
    //       {
    //           this.targetPos.y = 0;
    //       }
          
    //       this.camera.node.position = this.targetPos;
          
    //       if(this._mapParams.mapLoadModel == MapLoadModel.slices)
    //       {
    //           this.mapLayer.loadSliceImage(this.targetPos.x,this.targetPos.y);
    //       }
    //   }
      
    //   /**
    //    * 将视野对准玩家
    //    */
    //   public setViewToPlayer():void
    //   {
    //       this.setViewToPoint(this.player.node.x,this.player.node.y);
    //   }
  
  
      update (dt) {
        // 处理震动效果
        if (this.isShaking) {
            const currentTime = Date.now();
            if (currentTime < this.shakeEndTime) {
                // 计算抖动衰减因子
                const elapsed = (currentTime - this.shakeStartTime) / (this.shakeEndTime - this.shakeStartTime);
                const intensity = this.shakeIntensity * (1 - elapsed);
                
                // 随机生成抖动偏移
                const offsetX = (Math.random() - 0.5) * 2 * intensity;
                const offsetY = (Math.random() - 0.5) * 2 * intensity;
                
                // 设置抖动后的位置
                this.node.setWorldPosition(new Vec3(
                    this.originalPosition.x + offsetX,
                    this.originalPosition.y + offsetY,
                    this.originalPosition.z
                ));
            } else {
                // 抖动结束，恢复原始状态
                this.isShaking = false;
                
                // 恢复到目标位置并继续跟随
                if (this.isFollowing && this.followTarget) {
                    this.followPlayer(dt);
                }
            }
        } else {
            // 处理相机跟随
            if (this.isFollowing && this.followTarget) {
                this.followPlayer(dt);
            }
        }
  
      }

      updateNewTarget(speedScale = 2,isOrginHight = true){
        this.setFollowTarget(DH_DataManager.Instance.dynamicData.cameraTarget,speedScale,isOrginHight);
        
        // 如果正在震动，更新原始位置以确保震动基于新目标位置
        if (this.isShaking) {
            this.originalPosition = this.node.worldPosition.clone();
        }
      }

      addEventListener(){
        EventManager.on(DH_GameEvents.Update_Camera_Tartget,this.updateNewTarget,this)
      }

      removeListener(){
        EventManager.off(DH_GameEvents.Update_Camera_Tartget,this.updateNewTarget,this)

      }

      protected onDestroy(): void {
        this.removeListener();
      }
}