import { _decorator, Collider2D, Color, Component, Contact2DType, director, Enum, instantiate,  MotionStreak,  Node,  ParticleSystem2D,  Prefab, RigidBody2D, Sprite, SpriteFrame, Texture2D, Tween, tween, UITransform, v2, Vec2, Vec3 } from 'cc';
import { GeometryVibes_DataManager, GeometryVibes_ItemType, GeometryVibes_PlaneColor, GeometryVibes_PlaneStyle, GeometryVibes_ShopItemConfig, GeometryVibes_TailStyle } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
import { GeometryVibes_AudioManager } from '../Manager/GeometryVibes_AudioManager';
const { ccclass, property } = _decorator;

export enum GeometryVibes_ColliderTag {
    Obstacle = 1,
    Ceiling = 2,
    Floor = 3,
    EndLine = 4,
}


@ccclass('GeometryVibes_PlaneController')
export class GeometryVibes_PlaneController extends Component {
    @property(RigidBody2D)
    private _rigidBody: RigidBody2D = null;

    public fallSpeed: number = 50;
    public riseSpeed: number = 50;

    public speedY: number = 22;
    public speedX: number = 22;

    public defaultAngle: number = 0;

    @property(Collider2D)
    public colliders: Collider2D[] = [];

    @property(SpriteFrame)
    public planeIcons: SpriteFrame[] = [];

    @property(Texture2D)
    public tailTexture: Texture2D[] = [];
    
    
    private _isTouching: boolean = false;
    private _collider: Collider2D = null;

    private onComplete: Function= null;

    private PosY1: number = 0;
    private PosY2: number = 0;

    // private _trail: ParticleSystem2D = null;

    // ... existing code ...
    private _isOnCeiling: boolean = false;
    private _isOnFloor: boolean = false;
    private _isEnd: boolean = false;

    private _lastYBeforeCollision: number = 0;  // 记录碰撞前的y位置
    private _isWallSliding: boolean = false;    // 是否处于贴壁状态
    private _lastTouching: boolean = false;    // 记录上一帧的触摸状态
    private _isExploded: boolean = false;    // 记录是否碰撞
    private _isPlaying: boolean = false;    // 记录是否播放旋转动画


    private rotationTween :Tween=null; 
    private tailSnow: ParticleSystem2D = null;
    private tailSnowTween:Tween = null;


    init(onComplete: Function/* info:  { style: GeometryVibes_PlaneStyle, color: GeometryVibes_PlaneColor, trail: GeometryVibes_TailStyle }  */) {
       
        this._rigidBody = this.node.getComponent(RigidBody2D);

        this.resetState();
        
        this.PosY1 = GeometryVibes_DataManager.getInstance().getCurrentLevelData().ceilingPosY;
        this.PosY2 = GeometryVibes_DataManager.getInstance().getCurrentLevelData().floorPosY;

        this.onComplete = onComplete;
        // 应用飞机样式
        this.applyAppearance(/* info */);

        // this.initBgParticle()
        
        // // 初始化物理组件
        // this._trail = this.getComponentInChildren(ParticleSystem2D);

         

        // 绑定碰撞回调
        if(this._collider) {
            this._collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
            this._collider.on(Contact2DType.END_CONTACT, this.onCollisionExit, this);
            // this._collider.on('onCollisionEnter', this.onCollisionEnter, this);
        }
    }

    resetState(){
            this._isOnCeiling= false;
            this._isOnFloor= false;
            this._isEnd = false;

            this._lastYBeforeCollision = 0;  // 记录碰撞前的y位置
            this. _isWallSliding = false;    // 是否处于贴壁状态
            this._lastTouching = false;    // 记录上一帧的触摸状态
            this._isExploded= false;    // 记录是否碰撞
    }

    update(dt: number) {
        // //console.log(this.node.worldPosition)
        // if (this._isEnd || GeometryVibes_DataManager.getInstance().getIsPaused()) {
        //     if(this.rotationTween )this.rotationTween.stop();
        //      return;
        // }
        // else{
        //     if(this.rotationTween )
        //      this.rotationTween.start();
        // }
        if (this._isEnd || GeometryVibes_DataManager.getInstance().getIsPaused()) {
             this._rigidBody.linearVelocity = new Vec2(0,0)
            if(this.rotationTween && this._isPlaying) {
                // this.tailSnow.stopSystem();
                this.rotationTween.stop();
                this._isPlaying = false;
            }
            return;
        }
        else if(this.rotationTween && !this._isPlaying) {
            // this.tailSnowTween.start();
            this.rotationTween.start();
            this._isPlaying = true;
        }
        
        const isTouching = GeometryVibes_DataManager.getInstance().getIsTouching();
        
        // 使用世界坐标计算位置（原代码使用本地坐标导致偏移）
        let worldPos = this.node.worldPosition;
        const deltaX = this.speedX * dt;

        // 应用X轴速度
        this._rigidBody.linearVelocity = new Vec2(this.speedX, this._rigidBody.linearVelocity.y);
        

        if(this._lastTouching !== isTouching && this._isWallSliding) {

            if(this._isOnCeiling){
                // 先回到碰撞时的y位置
                this.node.setWorldPosition(worldPos.x + 1, this._lastYBeforeCollision - 1,0);
                this.node.angle = this.defaultAngle + 0;
            }
            if(this._isOnFloor){
                // 先回到碰撞时的y位置
                this.node.setWorldPosition(worldPos.x + 1, this._lastYBeforeCollision + 1,0);
                this.node.angle = this.defaultAngle + 90;
            }


            // 触摸状态改变
            this._isWallSliding = false;
            this._isOnCeiling = false;
            this._isOnFloor = false;
        }
        this._lastTouching = isTouching;

        // 贴壁状态处理
        if (this._isWallSliding) {
            // this.node.setPosition(this.node.position.x, this.PosY1);
            if(this._isOnCeiling){
        this._rigidBody.linearVelocity = new Vec2(this.speedX, 0);

                // this.node.setWorldPosition(new Vec3(worldPos.x + this.speedX * dt + (this.PosY1-worldPos.y), this.PosY1));
                this.node.angle = this.defaultAngle +  -45;
            }

            if(this._isOnFloor){
        this._rigidBody.linearVelocity = new Vec2(this.speedX, 0);

                // this.node.setWorldPosition(new Vec3(worldPos.x + this.speedX * dt+ (worldPos.y - this.PosY2), this.PosY2));
                this.node.angle = this.defaultAngle +  -45;
            }
            // // 触摸状态改变时才离开墙壁
            // if ((this._isOnCeiling && !isTouching) || 
            //     (this._isOnFloor && isTouching)) {
                
            //     // 先回到碰撞时的y位置
            //     this.node.setPosition(pos.x, this._lastYBeforeCollision);
                
            //     // 重置状态
            //     this._isWallSliding = false;
            //     this._isOnCeiling = false;
            //     this._isOnFloor = false;
            // }
            // 否则保持贴壁状态不移动y轴
            // 贴壁状态下X轴仍移动
            // this.node.setWorldPosition(new Vec3(this.node.worldPosition.x+ this.speedX * dt, this.PosY1));
            // this.node.setPosition(pos.x , pos.y);
            return;
        }

        // worldPos = this.node.worldPosition;
        // // X轴持续移动
        // const newX = worldPos.x + this.speedX * dt;
        
        // 正常飞行逻辑
        // if (isTouching) {
        //     this.node.setWorldPosition(newX, worldPos.y + this.speedY * dt,0);
        //     this.node.eulerAngles = Vec3.ZERO;
        // } else {
        //     this.node.setWorldPosition(newX, worldPos.y - this.speedY * dt,0);
        //     this.node.eulerAngles = new Vec3(0, 0, -90);
        // }
        
        if (isTouching) {
            this._rigidBody.linearVelocity=new Vec2(this.speedX, this.speedY);
            this.node.eulerAngles = new Vec3(0, 0, this.defaultAngle);;
        } else {
            this._rigidBody.linearVelocity=new Vec2(this.speedX, -this.speedY);
            this.node.eulerAngles = new Vec3(0, 0, this.defaultAngle-90);
        }

    }

    private applyAppearance(/* info: { style: GeometryVibes_PlaneStyle, color: GeometryVibes_PlaneColor, trail: GeometryVibes_TailStyle } */) {
        // 根据配置设置飞机样式、颜色和拖尾效果
        // ...

        this._collider = this.node.getComponent(Collider2D);

        //tail
        const selectedTailId = GeometryVibes_DataManager.getInstance().getSelectedItemIdByType(GeometryVibes_ItemType.TRAIL);
        const tailConfig = this.shopItemsConfig.find(item => item.id === selectedTailId);
        if (tailConfig ) {
            // 新增拖尾效果设置
             const motionStreak = this.node.getComponent(MotionStreak);
                if (motionStreak && this.tailTexture[tailConfig.tail]) {
                    motionStreak.texture = this.tailTexture[tailConfig.tail];
                }
        }

        const selectedPlaneId = GeometryVibes_DataManager.getInstance().getSelectedItemIdByType(GeometryVibes_ItemType.PLANE);
        const planeConfig = this.shopItemsConfig.find(item => item.id === selectedPlaneId);
        if (planeConfig) {
            switch(planeConfig.style){
                case GeometryVibes_PlaneStyle.Square:
                    this.defaultAngle = -45;
                    // this.node.getComponent(MotionStreak).enabled = false;

                    // this.node.getChildByName("type").children.forEach(child => {
                    //     child.active = false;
                    // });
                    // this.node.getChildByName("type").getChildByName("squareCollider").active = true;
                    // this._collider = this.colliders[1];
                    break;
                case GeometryVibes_PlaneStyle.Circle:
                    // this.node.getChildByName("type").children.forEach(child => {
                    //     child.active = false;
                    // });
                    // this.node.getChildByName("type").getChildByName("circleCollider").active = true;
                    // this._collider = this.colliders[2];
                    //  this._collider = this.node.getChildByName("collider").getComponent(Collider2D);
                    // this.node.getComponent(MotionStreak).enabled = false;
                    
                    this.rotationTween = tween(this.node.getChildByName("sp"))
                    .to(0.1, {angle: -90})
                    .to(0.1, {angle: -180})
                    .to(0.1, {angle: -270})
                    .to(0.1, {angle: 0})
                    .union()
                    .repeatForever();
    
                    this.tailSnow = this.node.getChildByName("TailSnow").getComponent(ParticleSystem2D);

                    // this.tailSnowTween = tween( this.tailSnow )
                    // .call(()=>{
                    //     this.tailSnow.node.setPosition(-1225,0,0);
                    //     this.tailSnow.resetSystem();
                    // })
                    // .delay(0.4)
                    // .call(()=>{
                    //     this.tailSnow.node .setPosition(0,0,0);
                    // })
                    // .union()


                    if (!GeometryVibes_DataManager.getInstance().getIsPaused()) {
                        // this.tailSnowTween.start();
                        this.rotationTween.start();
                    }
                    break;
                default:
                    // this.node.getChildByName("type").children.forEach(child => {
                    //     child.active = false;
                    // });
                    // this.node.getChildByName("type").getChildByName("triangleCollider").active = true;
                    // this._collider = this.colliders[0];
                    let  spriteCom= this.node.getChildByName("sp").getComponent(Sprite);
                    spriteCom.spriteFrame = this.planeIcons[planeConfig.style];

                    const selectedColorId = GeometryVibes_DataManager.getInstance().getSelectedItemIdByType(GeometryVibes_ItemType.COLOR);
                    const colorConfig = this.shopItemsConfig.find(item => item.id === selectedColorId);
                    if (colorConfig ) {
                        spriteCom.color = new Color(colorConfig.color)
                    }
                    break;
            }
            
        }

      
       this.node.angle = this.defaultAngle -45;
        
        this.onComplete && this.onComplete();
    }

    private initBgParticle(){
        let Particle2DNode = this.node.getChildByName("Particle2D");
        tween( Particle2DNode)
        .call(()=>{
            Particle2DNode.setPosition(-1280,0,0);
        })
        .delay(0.1)
        .call(()=>{
            Particle2DNode.setPosition(2250,0,0);
        })
        .start();
    }

    public onCollisionEnter(selfcollider: Collider2D, other: Collider2D) {
        if (other.tag === GeometryVibes_ColliderTag.Obstacle) {
            this.explode();
        } 
        else if (other.tag === GeometryVibes_ColliderTag.Ceiling || 
                other.tag === GeometryVibes_ColliderTag.Floor) {
                   
            if(this._isWallSliding) return;
            // 设置贴壁状态
            this._isWallSliding = true;
            
            // 记录碰撞前的y位置
            this._lastYBeforeCollision = this.node.worldPosition.y;
            
            
            // 对齐到天花板/地板
            if (other.tag === GeometryVibes_ColliderTag.Ceiling) {
                // const ceilingY = other.node.worldPosition.y - other.node.getComponent(UITransform).height/2;
                // this.node.setPosition(this.node.position.x, ceilingY);
                // this.node.setPosition(this.node.position.x, this.PosY1);
                this._isOnCeiling = true;
            } 
            else { // Floor
                // const floorY = other.node.worldPosition.y + other.node.getComponent(UITransform).height/2;
                // this.node.setPosition(this.node.position.x, floorY);
                // this.node.setPosition(this.node.position.x, this.PosY2);
                this._isOnFloor = true;
            }
            
            // 固定朝向为右
            this.node.eulerAngles = Vec3.ZERO;
        }
        else if (other.tag === GeometryVibes_ColliderTag.EndLine) {
            this.passLevel();
        }
    }

    public onCollisionExit(selfcollider: Collider2D, other: Collider2D) {
        // if (other.tag === GeometryVibes_ColliderTag.Ceiling) {
        //     this._isOnCeiling = false;
        // } 
        // else if (other.tag === GeometryVibes_ColliderTag.Floor) {
        //     this._isOnFloor = false;
        // }
        
        // // 如果都不在墙上，取消贴壁状态
        // if (!this._isOnCeiling && !this._isOnFloor) {
        //     this._isWallSliding = false;
        // }
    }

    private explode() {
        if(this._isExploded) return;
        this._isExploded = true;
        this._isEnd = true;
        GeometryVibes_DataManager.getInstance().setIsPaused(true);
        // 播放爆炸粒子效果
        // 缩放动画
        tween(this.node)
            .to(0.2, { scale: new Vec3(0, 0, 0) })
            .start()

        // 获取并播放爆炸粒子效果
        const explodeNode = this.node.getChildByName("explode");
        if (explodeNode) {
            const particleSystem = explodeNode.getComponent(ParticleSystem2D);
            if (particleSystem) {
                particleSystem.resetSystem(); // 播放一次粒子效果
            }
        }

        if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
            // GeometryVibes_AudioManager.globalAudioPlay("Explosion");
            GeometryVibes_AudioManager.getInstance().playSound("Explosion");
        }
        // 延迟销毁节点
        this.scheduleOnce(() => {
            this.node.active = false;
            this.node.setScale(new Vec3(1,1,1));
            GeometryVibes_GameManager.getInstance().gameOver(false);
        }, 0.3);


        // 加速拖尾消失
        // 使用MotionStreak组件加速拖尾消失
        const motionStreak = this.node.getComponent(MotionStreak);
        if (motionStreak) {
            motionStreak.fadeTime = 0.3; // 设置快速消失时间
            // motionStreak.reset(); // 重置拖尾
        }
    }

    private passLevel() {
        this._isEnd = true;
        GeometryVibes_DataManager.getInstance().setIsPassLevel(true);
        GeometryVibes_DataManager.getInstance().setIsPaused(true);

        if(GeometryVibes_DataManager.getInstance().isSoundEnabled()){
            // GeometryVibes_AudioManager.globalAudioPlay("Entering portal",0.5);
            GeometryVibes_AudioManager.getInstance().playSound("Entering portal");
        }
        // 创建并行动画：旋转、缩小、移动
        tween(this.node)
            .parallel(
                tween()
                    .to(1.5, { eulerAngles: new Vec3(0, 0, 720) }), // 旋转两圈(720度)
                tween()
                    .to(1.5, { scale: Vec3.ZERO }), // 缩小到0
                tween()
                    .to(1.5, { worldPosition:  GeometryVibes_DataManager.getInstance().getCurrentLevelData().endPos }) // 移动到终点位置
            )
            .call(() => {
                this.node.destroy();
                GeometryVibes_GameManager.getInstance().gameOver(true);
            })
            .start();
        }

            // 获取商店物品配置（实际应该从DataManager获取，这里为了简化代码）
    private get shopItemsConfig(): GeometryVibes_ShopItemConfig[] {
        return GeometryVibes_DataManager.getInstance().getShopItemsByType(GeometryVibes_ItemType.PLANE)
            .concat( GeometryVibes_DataManager.getInstance().getShopItemsByType(GeometryVibes_ItemType.TRAIL))
            .concat( GeometryVibes_DataManager.getInstance().getShopItemsByType(GeometryVibes_ItemType.COLOR));
    }



        /**
     * 彻底销毁飞机控制器相关资源：
     * 1. 停止所有动画（Tween/旋转/粒子）
     * 2. 移除碰撞回调监听
     * 3. 释放物理组件状态
     * 4. 重置所有引用为null，避免内存泄漏
     */
    public cleanup() {
        // 1. 停止并清理所有Tween动画（包括旋转、缩放、粒子位置动画）
        // 停止旋转动画
        if (this.rotationTween) {
            this.rotationTween.stop();
            this.rotationTween = null;
        }
        // 停止尾迹粒子动画
        if (this.tailSnowTween) {
            this.tailSnowTween.stop();
            this.tailSnowTween = null;
        }
        // // 停止所有动态创建的Tween（如爆炸缩放、通关动画）
        // this._activeTweens.forEach(tween => {
        //     if (tween && !tween.isStopped()) {
        //         tween.stop();
        //     }
        // });
        // this._activeTweens = null;

        // 2. 停止所有粒子系统（尾迹、爆炸）
        // 停止尾迹粒子
        if (this.tailSnow) {
            this.tailSnow.stopSystem();
            this.tailSnow = null;
        }
        // 停止爆炸粒子
        const explodeNode = this.node.getChildByName("explode");
        if (explodeNode) {
            const explodeParticle = explodeNode.getComponent(ParticleSystem2D);
            if (explodeParticle) {
                explodeParticle.stopSystem();
            }
        }
        // 停止拖尾效果
        const motionStreak = this.node.getComponent(MotionStreak);
        if (motionStreak) {
            // motionStreak.clear(); // 清空现有拖尾
            motionStreak.enabled = false;
        }

        // 3. 移除碰撞回调（避免空引用调用）
        if (this._collider) {
            this._collider.off(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
            this._collider.off(Contact2DType.END_CONTACT, this.onCollisionExit, this);
            this._collider = null;
        }

        // 4. 重置物理组件状态（避免节点销毁后物理引擎报错）
        if (this._rigidBody) {
            this._rigidBody.linearVelocity = Vec2.ZERO; // 停止速度
            this._rigidBody.angularVelocity = 0; // 停止旋转
            this._rigidBody = null;
        }

        // 5. 取消所有定时器（如爆炸延迟销毁）
        this.unscheduleAllCallbacks();

        // 6. 重置关键引用（帮助GC回收）
        this.onComplete = null;
        // this.node = null; // 断开节点引用
        this._isPlaying = false;
        this._isEnd = true;
    }
}
