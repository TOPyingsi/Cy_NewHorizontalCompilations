import { _decorator, Component, Node, Vec3, tween, Quat, Animation, AudioSource, RigidBody, Collider, ICollisionEvent } from 'cc';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_Coin')
export class HXTJB_Coin extends Component {
    // @property(Animation)
    // coinAnimation: Animation = null;  // 金币动画组件

    @property(AudioSource)
    collectSound: AudioSource = null;  // 收集音效

    // @property(Node)
    // ScoreArea: Node = null;  // 收集音效

    @property
    coinValue: number = 1; // 金币基础分值
    
    @property
    isSpecial: boolean = false; // 是否为特殊金币
    
    @property
    specialMultiplier: number = 2; // 特殊金币倍数
    
    private isCollected: boolean = false; // 防止重复收集

    private scoreWorldPosY: number = 0; // 得分区域的世界坐标Y值


        // @property
    coinSpeed: number = 300;  // 金币飞行速度

    // @property
    arcHeight: number = 20;  // 金币飞行弧线高度

    // @property
    // rotateSpeed: number = 360;  // 旋转速度（度/秒）

    // private isFlying: boolean = false;

      
    onLoad() {
        // this.scoreWorldPosY = this.ScoreArea.worldPosition.y; // 获取得分区域的世界坐标Y值
        // const rigidBody = this.getComponent(RigidBody);
        // rigidBody.useCCD = true;
        // // 获取碰撞体组件
        // let collider = this.node.getComponent(Collider);
        // // console.log("collider:", collider);
        // // 监听触发事件
        // collider.on('onCollisionEnter', this.onCollision, this);
    }

    bindScoreArea(ScoreArea: Node){
        if(ScoreArea){
            this.scoreWorldPosY = ScoreArea.worldPosition.y; // 获取得分区域的世界坐标Y值
        }
    }
    

    start() {
        // 自动播放金币旋转动画
        // if (this.coinAnimation && this.coinAnimation.defaultClip) {
        //     this.coinAnimation.play();
        // }
    }

    update(deltaTime: number) {
        const rigidBody = this.getComponent(RigidBody);
        if(!HXTJB_DataManager.Instance.isGameStart){
            rigidBody.enabled = false;
            return;
        }
        else{
            rigidBody.enabled = true;
        }
        // // 飞行中保持旋转
        // if (this.isFlying) {
        //     const rotation = this.node.rotation;
        //     Quat.rotateY(rotation, rotation, (this.rotateSpeed * Math.PI / 180) * deltaTime);
        //     this.node.rotation = rotation;
        // }
        if(this.node.worldPosition.y <= this.scoreWorldPosY){
            console.log("得分");
            
            // 计算实际得分
            const score = this.isSpecial 
                ? this.coinValue * this.specialMultiplier 
                : this.coinValue;
            
            // 通知分数管理器加分
            HXTJB_DataManager.Instance.addScore(score);
            
            // 播放收集效果
            // this.playCollectEffect();
            
            // 销毁金币节点
            // this.scheduleOnce(() => {
            this.node.destroy();
        }
    }

    // 金币飞向目标位置
    flyTo(target: Vec3) {
        let speed = this.coinSpeed
        let arcHeight = this.arcHeight;
        const rigidBody = this.node.getComponent(RigidBody);
        if (!rigidBody) {
            console.error('No RigidBody component found on coin node');
            return;
        }

        // 计算方向向量并设置初速度
        const direction = new Vec3();
        Vec3.subtract(direction, target, this.node.worldPosition).normalize();
        
        // 设置抛物线初速度
        const velocity = new Vec3(
            direction.x * speed,
            direction.y * speed + arcHeight, // 添加初始高度分量
            direction.z * speed
        );
        
        // 应用初速度
        rigidBody.setLinearVelocity(velocity);
        
        // 启用物理模拟
        rigidBody.enabled = true;
        
        rigidBody.useGravity = true;
    }


  
    onCollision (event: ICollisionEvent) {
        console.log("碰撞到物体")

        // 检测是否碰撞到得分区域
        if (event.otherCollider.node.name === "ScoreArea" && !this.isCollected) {
            this.isCollected = true;
            console.log("得分");
            
            // 计算实际得分
            const score = this.isSpecial 
                ? this.coinValue * this.specialMultiplier 
                : this.coinValue;
            
            // 通知分数管理器加分
            HXTJB_DataManager.Instance.addScore(score);
            
            // 播放收集效果
            // this.playCollectEffect();
            
            // 销毁金币节点
            // this.scheduleOnce(() => {
                this.node.destroy();
            // }, 0.5);
        }
    }
    
    // // 播放收集效果
    // playCollectEffect() {
    //     // 停止物理运动
    //     const rigidBody = this.getComponent(RigidBody2D);
    //     if (rigidBody) {
    //         rigidBody.linearVelocity = Vec2.ZERO;
    //         rigidBody.angularVelocity = 0;
    //     }
        
    //     // 这里可以添加金币收集动画和音效
    //     // 例如：缩放动画、粒子效果、收集音效等
    // }
}
    

