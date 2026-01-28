// 导入Cocos Creator核心模块
import { _decorator, Component, Node, Vec3, Animation, tween, v3, instantiate, UIOpacity, Label, UITransform } from 'cc';
import { DH_DataManager, DH_FishJsonData, DH_ItemType } from '../Manager/DH_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
// 导入数据管理器

// 获取装饰器
const { ccclass, property } = _decorator;

/**
 * 鱼组件类
 * 处理鱼的移动、动画、受力计算和伤害逻辑
 */
@ccclass('DH_Fish')
export class DH_Fish extends Component {
    @property(Animation)
    protected fishAnimation: Animation = null; // 鱼的动画组件

    @property(Node)
    protected fishMouthNode: Node = null; // 鱼嘴节点，用于鱼线连接

    @property([Node])
    protected fishingLinePoints: Node[] = []; // 鱼线点位节点数组

    @property(Node)
    protected bleedNode: Node = null; // 鱼流血节点

    protected waterNode: Node = null; // 鱼水节点

    protected bleedNodeContainer: Node = null; // 鱼流血节点

    protected placeConter:Node  = null;

    protected fishId: string = ""; // 当前鱼的ID
    protected strength: number = 0; // 鱼的力气值
    private health: number = 0; // 鱼的体力值
    private speed: Vec3 = new Vec3(0, 0, 0); // 鱼的当前速度
    private maxSpeed: number = 50; // 鱼的最大速度（默认50/s）
    private isStruggling: boolean = true; // 是否在挣扎
    private isBeingPulled: boolean = false; // 是否被拉扯中

    isAddListener:boolean = false;

    isDie:boolean = false;

    /**
     * 初始化鱼组件
     * @param fishId 鱼的ID
     */
    init(fishId: string,placeConter:Node,bleedContainer:Node) {
        if(!this.isAddListener){
            this.addListener();
        }

        this.waterNode = this.node.getChildByName("水花");
        if(this.waterNode){
            this.waterNode.active = true;
        }
   

        this.fishId = fishId;
        this.placeConter = placeConter;
        this.bleedNodeContainer = bleedContainer;

        this.bleedNode.active = false;

        let level =  this.fishId.split("_")[1]
        let addScales = {
            0:0,
            1:0,
            2:0,
            3:0,
            4:0.2,
            5:0.4,
            6:0.6,
            7:0.8,
            8:1
        }
        this.waterNode.setScale(this.waterNode.scale.x+addScales[parseInt(level)],this.waterNode.scale.y+addScales[parseInt(level)],this.waterNode.scale.z)
        let sp = this.node.getChildByName("sp");
        sp.setScale(sp.scale.x+addScales[parseInt(level)],sp.scale.y+addScales[parseInt(level)],sp.scale.z)
        
        // 从数据管理器获取鱼的静态数据
        const fishData = DH_DataManager.Instance.getItemDataById(fishId) as DH_FishJsonData;
        if (!fishData) {
            console.error(`Fish data not found for id: ${fishId}`);
            return;
        }

        DH_DataManager.Instance.dynamicData.currentFishData = fishData;
        DH_DataManager.Instance.dynamicData.fishMaxHp = fishData.血量;
        DH_DataManager.Instance.dynamicData.currentFishHp = fishData.血量;
        EventManager.Scene.emit(DH_GameEvents.UI_Update_Fish_Data);



        // // 初始化鱼的属性
        // this.strength = fishData.力气 || 10;
        // this.health = fishData.体力 || 100;
        // this.maxSpeed = fishData.初始速度 || 50;
        
        // 初始化鱼嘴节点到数据管理器
        if (this.fishMouthNode) {
            DH_DataManager.Instance.dynamicData.fishMouth = this.fishMouthNode;
        }

        DH_DataManager.Instance.dynamicData.fishMouthPoints = this.fishingLinePoints;

        // // 播放挣扎动画
        // this.playStruggleAnimation();
         this.fishAnimation.play('struggle');
    }

    // /**
    //  * 播放挣扎动画
    //  */
    // private playStruggleAnimation() {
    //     if (this.fishAnimation) {
    //         this.fishAnimation.play('struggle');
    //     } else {
    //         console.warn('Struggle animation not found');
    //     }
    // }

    // /**
    //  * 播放被钓起动画
    //  */
    // private playCatchAnimation() {
    //     if (this.fishAnimation && this.fishAnimation.getState('caught_1')) {
    //         this.fishAnimation.play('caught_1');
    //         this.isStruggling = false;
    //     } else {
    //         console.warn('Caught animation not found');
    //     }
    // }

    /**
     * 更新鱼的移动逻辑
     * @param deltaTime 帧间隔时间
     */
    protected updateMovement(deltaTime: number) {
        if (this.isDie || !DH_DataManager.Instance.dynamicData.isFishHooking)return;
        // // 如果鱼不再挣扎，停止移动更新
        // if (!this.isStruggling) return;

        // // 计算总拉力（来自钓友、钓竿和技能）
        // const totalPullForce = DH_DataManager.Instance.calculateTotalPullForce();
        // // 计算动力：鱼的力气 - 总拉力
        // const power = this.strength - totalPullForce;

        // // 根据动力计算加速度（简化为直接影响速度）
        // let acceleration = power * 0.1;
        // // 限制加速度范围
        // acceleration = Math.max(-5, Math.min(5, acceleration));

        // // 更新速度
        // this.speed.x += acceleration * deltaTime * 60; // 乘以60转换为每秒速度
        // // 限制最大速度
        // this.speed.x = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.speed.x));
        this.updateSpeed(deltaTime);
        // 应用速度到位置
        let scale = DH_DataManager.Instance.dynamicData.isFishDirectionLeft?-1:1;
        let scaleX = DH_DataManager.Instance.dynamicData.isFishDirectionLeft?-1:1;
        let nodeScale = this.node.scale;
        this.node.setScale(v3(scaleX*Math.abs(nodeScale.x),nodeScale.y,nodeScale.z));
        const newPosition = this.node.worldPosition.clone();
        newPosition.x += DH_DataManager.Instance.dynamicData.currentSpeed * deltaTime * scale;
        let startPosX = DH_DataManager.Instance.dynamicData.lengthStartPointNode.worldPosition.x;
        if(!DH_DataManager.Instance.dynamicData.isFishDirectionLeft && newPosition.x < startPosX){
            newPosition.x = startPosX;
        }
        if(DH_DataManager.Instance.dynamicData.isFishDirectionLeft && newPosition.x > startPosX){
            newPosition.x = startPosX;
        }
        this.node.setWorldPosition(newPosition);
    }


    
    /**
     * 每帧更新速度
     */
    updateSpeed(deltaTime: number) {
    //    let netForce  =  DH_DataManager.Instance.dynamicData.currentPullForce - DH_DataManager.Instance.dynamicData.currentFishData.力气 ;

    //     netForce = 0.001*netForce;
    //     // 步骤2：计算质量（简化为鱼斤数×0.5，游戏化调整）
    //     const mass = 0;
    //     // 避免质量为0（比如小鱼）
    //     const safeMass = Math.max(mass, 0);

    //     // 步骤3：计算加速度（基础物理+游戏化缩放）
    //     const baseAccel = netForce / safeMass;
    //     const accel = baseAccel * 0.2;

    //     // 步骤4：计算速度增量+累积
    //     const speedDelta = accel * deltaTime;
    //     let currentSpeed = DH_DataManager.Instance.dynamicData.currentSpeed + speedDelta;

    //     // 步骤6：限制速度上下限
    //     currentSpeed = Math.max(DH_DataManager.Instance.dynamicData.speedMin, Math.min(DH_DataManager.Instance.dynamicData.speedMax, currentSpeed));
    //     currentSpeed = DH_DataManager.Instance.dynamicData.isFishDirectionLeft ? currentSpeed : -currentSpeed;
    //     // if(netForce > 0){
    //     //     currentSpeed = currentSpeed*0.2;
    //     // }
    //     DH_DataManager.Instance.dynamicData.currentSpeed = Math.round(currentSpeed * 100) / 100; // 保留两位小数，避免精度问题
        this.calculateFishSpeed(deltaTime,DH_DataManager.Instance.dynamicData.currentSpeed,DH_DataManager.Instance.dynamicData.currentPullForce,DH_DataManager.Instance.dynamicData.currentFishData.力气);

    }


    // 核心常量（可根据手感调整）
    private MAX_ESCAPE_SPEED = 60;    // 鱼远离玩家的最大速度（正）
    private MAX_PULL_SPEED = -12000;    // 鱼朝向玩家的最大速度（负）
    private ACCEL_COEFFICIENT = 3;   // 加速度系数（差值转加速度的比例）
    private FLASH_THRESHOLD = 1500;    // 闪现阈值（差值超过此值无加减速）
    private SPEED_DAMP = 0.98;         // 速度阻尼（可选，增加手感）

        /**
     * 计算鱼的每帧速度
     * @param dt 帧时间（秒）
     * @param lastSpeed 上一帧速度
     * @param playerPull 玩家拉力（0~2000）
     * @param fishPull 鱼拉力（0~2000）
     * @returns 当前帧速度
     */
    private calculateFishSpeed(
        dt: number,
        lastSpeed: number,
        playerPull: number,
        fishPull: number
    ){
        // 1. 基础拉力差值计算
        let pullDiff: number;
        if (playerPull === 0) {
            // 玩家未按按钮：只有鱼力，差值为鱼力（远离方向）
            pullDiff = fishPull;
        } else {
            // 玩家按按钮：差值 = 鱼力 - 玩家拉力（正=鱼赢，负=玩家赢）
            pullDiff = fishPull - playerPull;
        }

        let currentSpeed = lastSpeed;

        // 2. 闪现逻辑（差值超过阈值，直接到最大速度）
        if (Math.abs(pullDiff) >= this.FLASH_THRESHOLD) {
            currentSpeed = pullDiff > 0 ? this.MAX_ESCAPE_SPEED : this.MAX_PULL_SPEED;
        } else {
            // 3. 加减速逻辑（差值较小，逐步变速）
            // 计算目标加速度：差值 * 加速度系数（正=远离加速，负=朝向加速）
            const acceleration = pullDiff * this.ACCEL_COEFFICIENT * dt;
            currentSpeed += acceleration;

            // 4. 速度边界限制（不超过最大速度）
            if (currentSpeed > this.MAX_ESCAPE_SPEED) {
                currentSpeed = this.MAX_ESCAPE_SPEED;
            } else if (currentSpeed < this.MAX_PULL_SPEED) {
                currentSpeed = this.MAX_PULL_SPEED;
            }

            // 可选：添加速度阻尼，让变速更顺滑（避免突变）
            currentSpeed *= this.SPEED_DAMP;
        }

        DH_DataManager.Instance.dynamicData.currentSpeed = currentSpeed;
    }

    /**
     * 更新伤害逻辑
     * @param deltaTime 帧间隔时间
     */
    protected updateDamage(deltaTime: number) {
        // if (!this.isStruggling) return;

        // // 计算总伤害
        // const totalDamage = DH_DataManager.Instance.calculateTotalDamage();
        // // 根据时间计算伤害（秒伤 * 时间）
        // const damage = totalDamage * deltaTime;
        // // 扣除体力
        // this.health -= damage;

        // // 检查是否体力耗尽
        // if (this.health <= 0) {
        //     this.health = 0;
        //     this.handleFishCaught();
        // }
    }

    // /**
    //  * 处理鱼被捕获的逻辑
    //  */
    // private handleFishCaught() {
    //     this.isStruggling = false;
    //     this.speed = new Vec3(0, 0, 0);
    //     this.playCatchAnimation();

    //     // 更新鱼获数据
    //     DH_DataManager.Instance.saveData.fishData[this.fishId] = 
    //         (DH_DataManager.Instance.saveData.fishData[this.fishId] || 0) + 1;
    //     DH_DataManager.Instance.saveToStorage();

    //     // 移动到上钩点
    //     this.moveToHookPoint();
    // }

    // /**
    //  * 移动鱼到上钩点
    //  */
    // private moveToHookPoint() {
    //     const hookPoint = DH_DataManager.Instance.dynamicData.hookPoint;
    //     if (!hookPoint) return;

    //     // 创建缓动动画，将鱼移动到上钩点
    //     tween(this.node.position)
    //         .to(2, hookPoint, {
    //             onUpdate: (target: Vec3) => {
    //                 this.node.setPosition(target);
    //             },
    //             easing: 'smooth'
    //         })
    //         .call(() => {
    //             // 到达上钩点后触发收杆逻辑
    //             this.onReachHookPoint();
    //         })
    //         .start();
    // }

    protected moveToPlace(){
        this.fishAnimation.play('caught_1');
        let playerPos = DH_DataManager.Instance.dynamicData.currentAnglerNodes[0].worldPosition;
        let targetHighPos = v3(playerPos.x,playerPos.y+700,this.node.worldPosition.z);
        let placeNodePos = DH_DataManager.Instance.dynamicData.fishPlaceNode.worldPosition;
        let targetPlacePos1 = v3(playerPos.x-200,playerPos.y+500,this.node.worldPosition.z);
        let width = this.node.getChildByName('sp').getChildByName("2");
        let targetPlacePos2 = v3(placeNodePos.x+Math.random()*50-50,placeNodePos.y+100*Math.random(),this.node.worldPosition.z);
        tween(this.node)
        .to(0.5,{worldPosition:targetHighPos})
        .call(()=>{
            let worldPos = this.node.worldPosition.clone();
            this.node.setParent(this.placeConter);
            this.node.setWorldPosition(worldPos);
            this.fishAnimation.play('caught_2');
            this.removeListener();
            EventManager.Scene.emit(DH_GameEvents.Clear_Lines);
            DH_DataManager.Instance.catchFish( DH_DataManager.Instance.dynamicData.currentFishId);
            let sp = this.node.getChildByName("sp").getChildByName("2");
            let num = parseInt(this.fishId.split("_")[1]);
            let width = sp.getComponent(UITransform).width;
            let pos1 = sp.worldPosition.clone();
            let scaleX = DH_DataManager.Instance.dynamicData.isFishDirectionLeft?-1:1;
            if(num >= 3){
                width =  sp.getComponent(UITransform).height;
            }
            sp.setWorldPosition(pos1.x+width*scaleX,pos1.y,pos1.z);
        })
        .to(0.1,{worldPosition:targetPlacePos1})
        .to(0.2,{worldPosition:targetPlacePos2})
        .call(()=>{
           
        })
        .start();
    }

    // /**
    //  * 到达上钩点后的处理
    //  */
    // private onReachHookPoint() {
    //     // 标记鱼已上钩完成
    //     DH_DataManager.Instance.dynamicData.isFishHooking = false;
    //     // 停止钓鱼状态
    //     DH_DataManager.Instance.dynamicData.isFishing = false;
        
    //     // 触发收杆事件（可以通过事件管理器实现）
    //     // EventManager.emit('rod_reel_in');
    // }

    protected die(){
       
        if(this.waterNode){
            this.waterNode.active = false;
        }
           
        this.isDie = true;
        this.moveToPlace();
    }

    /**
     * 技能效果：暂停鱼的力气
     * @param duration 暂停时间（秒）
     */
    protected pauseStrength(duration: number = 0.3) {
        const originalStrength = this.strength;
        this.strength = 0; // 临时将力气设为0
        
        // 一段时间后恢复力气
        setTimeout(() => {
            if (this.isValid) { // 检查组件是否仍然有效
                this.strength = originalStrength;
            }
        }, duration * 1000);
    }

    /**
     * 组件每帧更新
     * @param deltaTime 帧间隔时间（秒）
     */
    update(deltaTime: number) {
        // 只有在钓鱼中且鱼上钩时才更新
        // if (!this.isDie && DH_DataManager.Instance.dynamicData.isUpdateSkillEffect) {
            this.updateMovement(deltaTime);
            // this.updateDamage(deltaTime);
        // }
    }

    protected addOtherEvents(){

    }

    protected removeOtherEvents(){

    }

    protected bleed(){
        let bleed = DH_DataManager.Instance.dynamicData.currentFishBleed;
        if(bleed > 0){
            let bleedNode = instantiate(this.bleedNode);
            bleedNode.getComponentInChildren(Label).string = "-"+bleed.toFixed(0);
             bleedNode.getComponentInChildren(Label).outlineWidth = 3.5;
            bleedNode.setParent(this.bleedNodeContainer);
            let pos = v3(this.fishMouthNode.worldPosition.x+Math.random()*50-50,this.fishMouthNode.worldPosition.y+30,this.fishMouthNode.worldPosition.z);
            bleedNode.setWorldPosition(pos);
            bleedNode.active = true;
            tween(bleedNode)
            .to(0.2,{worldPosition:v3(pos.x,pos.y+120+50*Math.random()-50,pos.z)})
            .delay(0.2)
            .delay(0.4)
            .call(()=>{
                bleedNode.destroy();
            })
            .start();

            bleedNode.setScale(v3(0,0,0));
            tween(bleedNode)
            .to(0.2,{scale:v3(1.7+Math.random()*0.5,1.7+Math.random()*0.5,1)})
            .start();
    
            tween(bleedNode.getComponent(UIOpacity))
            .delay(0.4)
            .to(0.4,{opacity:0})
            .start();
        }
    }

    destoryFish(fishId){
        if(this.fishId != fishId)return;
        this.node.destroy();
    }

    addListener(){
        this.isAddListener = true;
        EventManager.on(DH_GameEvents.Play_ReelIn_Animation,this.die,this)
        EventManager.on(DH_GameEvents.Fish_Bleeding,this.bleed,this)
        EventManager.on(DH_GameEvents.Destory_Fish,this.destoryFish,this)
        
        this.addOtherEvents();
    }

    removeListener(){
        EventManager.off(DH_GameEvents.Play_ReelIn_Animation,this.die,this)
        EventManager.off(DH_GameEvents.Fish_Bleeding,this.bleed,this)
        EventManager.off(DH_GameEvents.Destory_Fish,this.destoryFish,this)

        this.removeOtherEvents();
    }

    /**
     * 组件销毁时的清理
     */
    onDestroy() {
        this.removeListener();
    }
}