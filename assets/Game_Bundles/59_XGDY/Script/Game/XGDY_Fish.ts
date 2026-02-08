// 导入Cocos Creator核心模块
import { _decorator, Component, Node, Vec3, Animation, tween, v3, instantiate, UIOpacity, Label, UITransform } from 'cc';
import { XGDY_AnglerJsonData, XGDY_DataManager, XGDY_FishJsonData, XGDY_FishSkills, XGDY_ItemType, XGDY_SkillJsonData, XGDY_SpecialItem } from '../Manager/XGDY_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_Constant } from '../Common/XGDY_Constant';
// 导入数据管理器

// 获取装饰器
const { ccclass, property } = _decorator;

/**
 * 鱼组件类
 * 处理鱼的移动、动画、受力计算和伤害逻辑
 */
@ccclass('XGDY_Fish')
export class XGDY_Fish extends Component {
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
        // LTODO 增加鱼
        let addScales = {
            0:0,
            1:0,
            2:0,
            3:0,
            4:0.2,
            5:0.4,
            6:0.6,
            7:0.8,
            8:1,
            102:0,
        }
        this.waterNode.setScale(this.waterNode.scale.x+addScales[parseInt(level)],this.waterNode.scale.y+addScales[parseInt(level)],this.waterNode.scale.z)
        let sp = this.node.getChildByName("sp");
        sp.setScale(sp.scale.x+addScales[parseInt(level)],sp.scale.y+addScales[parseInt(level)],sp.scale.z)
        
        // 从数据管理器获取鱼的静态数据
        const fishData = XGDY_DataManager.Instance.getItemDataById(fishId) as XGDY_FishJsonData;
        if (!fishData) {
            console.error(`Fish data not found for id: ${fishId}`);
            return;
        }

        XGDY_DataManager.Instance.dynamicData.currentFishData = fishData;
        XGDY_DataManager.Instance.dynamicData.fishMaxHp = fishData.血量;
        XGDY_DataManager.Instance.dynamicData.currentFishHp = fishData.血量;
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Fish_Data);


        //初始化技能相关
        this.isHighSpeeding = false;


        // // 初始化鱼的属性
        // this.strength = fishData.力气 || 10;
        // this.health = fishData.体力 || 100;
        // this.maxSpeed = fishData.初始速度 || 50;
        
        // 初始化鱼嘴节点到数据管理器
        if (this.fishMouthNode) {
            XGDY_DataManager.Instance.dynamicData.fishMouth = this.fishMouthNode;
        }

        XGDY_DataManager.Instance.dynamicData.fishMouthPoints = this.fishingLinePoints;

        // // 播放挣扎动画
        // this.playStruggleAnimation();
         this.fishAnimation.play('struggle');
         if(this.fishId == XGDY_Constant.MAP_7_SpecialFishFirstId){
            this.node.getChildByName("sp").children.forEach((fishSpNode)=>{
                fishSpNode.active = fishSpNode.name ==  XGDY_Constant.MAP_7_SpecialFishFirstId;
            })
            XGDY_DataManager.Instance.dynamicData.SpecialFishCurrentId = XGDY_Constant.MAP_7_SpecialFishFirstId;
         }

         
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
        if (this.isDie || !XGDY_DataManager.Instance.dynamicData.isFishHooking)return;
        if (this.isKilling)return;
        // // 如果鱼不再挣扎，停止移动更新
        // if (!this.isStruggling) return;

        // // 计算总拉力（来自钓友、钓竿和技能）
        // const totalPullForce = XGDY_DataManager.Instance.calculateTotalPullForce();
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
        let scale = XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft?-1:1;
        let scaleX = XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft?-1:1;
        let nodeScale = this.node.scale;
        this.node.setScale(v3(scaleX*Math.abs(nodeScale.x),nodeScale.y,nodeScale.z));
        const newPosition = this.node.worldPosition.clone();
        newPosition.x += XGDY_DataManager.Instance.dynamicData.currentSpeed * deltaTime * scale;
        let startPosX = XGDY_DataManager.Instance.dynamicData.lengthStartPointNode.worldPosition.x;
        if(!XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft && newPosition.x < startPosX){
            newPosition.x = startPosX;
        }
        if(XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft && newPosition.x > startPosX){
            newPosition.x = startPosX;
        }
        this.node.setWorldPosition(newPosition);
    }


    
    /**
     * 每帧更新速度
     */
    updateSpeed(deltaTime: number) {
        let newFishPull = XGDY_DataManager.Instance.dynamicData.currentFishData.力气 + XGDY_DataManager.Instance.dynamicData.reversePullForce;
        this.calculateFishSpeed(deltaTime,XGDY_DataManager.Instance.dynamicData.currentSpeed,XGDY_DataManager.Instance.dynamicData.currentPullForce,newFishPull);

    }


    // 核心常量（可根据手感调整）
    private MAX_ESCAPE_SPEED_NORMAL = 60;    // 鱼远离玩家的最大速度（正常）
    private MAX_ESCAPE_SPEED_PULL_ENHANCE = 150;    // 鱼远离玩家的最大速度（拉力增强）
    private MAX_ESCAPE_SPEED_HIGH_SPEED = 9000;    // 鱼远离玩家的最大速度（高速）
    private MAX_ESCAPE_SPEED = this.MAX_ESCAPE_SPEED_NORMAL;    // 鱼远离玩家的最大速度（正）
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

        fishPull = fishPull*1.15;
        if(XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_3_Challengeing){
            this.MAX_ESCAPE_SPEED = this.MAX_ESCAPE_SPEED_PULL_ENHANCE;
        }else{
            this.MAX_ESCAPE_SPEED = this.MAX_ESCAPE_SPEED_NORMAL;
        }

        if(this.isHighSpeeding){
            this.MAX_ESCAPE_SPEED = this.MAX_ESCAPE_SPEED_HIGH_SPEED;
            fishPull  += 700;
        }
        else{
            this.MAX_ESCAPE_SPEED = this.MAX_ESCAPE_SPEED_NORMAL;
        }

        if(this.isPullEnhancing){
            this.MAX_ESCAPE_SPEED = this.MAX_ESCAPE_SPEED_PULL_ENHANCE;
            fishPull  = fishPull * 1.07;
        }
        else{
            this.MAX_ESCAPE_SPEED = this.MAX_ESCAPE_SPEED_NORMAL;
        }



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

        if(this.isAngrying){
            if(playerPull > fishPull){
                currentSpeed = 0;
            }
        }

        XGDY_DataManager.Instance.dynamicData.currentSpeed = currentSpeed;
    }

    /**
     * 更新伤害逻辑
     * @param deltaTime 帧间隔时间
     */
    protected updateDamage(deltaTime: number) {
        // if (!this.isStruggling) return;

        // // 计算总伤害
        // const totalDamage = XGDY_DataManager.Instance.calculateTotalDamage();
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
    //     XGDY_DataManager.Instance.saveData.fishData[this.fishId] = 
    //         (XGDY_DataManager.Instance.saveData.fishData[this.fishId] || 0) + 1;
    //     XGDY_DataManager.Instance.saveToStorage();

    //     // 移动到上钩点
    //     this.moveToHookPoint();
    // }

    // /**
    //  * 移动鱼到上钩点
    //  */
    // private moveToHookPoint() {
    //     const hookPoint = XGDY_DataManager.Instance.dynamicData.hookPoint;
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
        let playerPos = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[0].worldPosition;
        let targetHighPos = v3(playerPos.x,playerPos.y+700,this.node.worldPosition.z);
        let placeNodePos = XGDY_DataManager.Instance.dynamicData.fishPlaceNode.worldPosition;
        let targetPlacePos1 = v3(playerPos.x-200,playerPos.y+500,this.node.worldPosition.z);
        let targetPlacePos2 = v3(placeNodePos.x+Math.random()*50-50,placeNodePos.y+100*Math.random(),this.node.worldPosition.z);
        tween(this.node)
        .to(0.5,{worldPosition:targetHighPos})
        .call(()=>{
            let worldPos = this.node.worldPosition.clone();
            this.node.setParent(this.placeConter);
            this.node.setWorldPosition(worldPos);
            this.fishAnimation.play('caught_2');
            this.removeListener();

            EventManager.Scene.emit(XGDY_GameEvents.Clear_Lines);
            XGDY_DataManager.Instance.catchFish( XGDY_DataManager.Instance.dynamicData.currentFishId);
            
            let sp = this.node.getChildByName("sp").children[0];
            let num = parseInt(this.fishId.split("_")[1]);
            let width = sp.getComponent(UITransform).width;
            let pos1 = sp.worldPosition.clone();
            let scaleX = XGDY_DataManager.Instance.dynamicData.isFishDirectionLeft?-1:1;
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
    //     XGDY_DataManager.Instance.dynamicData.isFishHooking = false;
    //     // 停止钓鱼状态
    //     XGDY_DataManager.Instance.dynamicData.isFishing = false;
        
    //     // 触发收杆事件（可以通过事件管理器实现）
    //     // EventManager.emit('rod_reel_in');
    // }

    protected die(){
        //被钓起
        //绝境气息停止使用
        XGDY_DataManager.Instance.dynamicData.isUsingDesperateBreath = false;
        EventManager.Scene.emit(XGDY_GameEvents.Hide_Special_Item_Tip,{itemName:XGDY_SpecialItem.绝境气息});

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


    isUsingSkill = false;
    /**
     * 组件每帧更新
     * @param deltaTime 帧间隔时间（秒）
     */
    update(deltaTime: number) {
        if (this.isDie || !XGDY_DataManager.Instance.dynamicData.isFishHooking)return;
        //更新移动速度
        this.updateMovement(deltaTime);

        
        if(XGDY_DataManager.Instance.dynamicData.currentFishData.技能){
            for(let skill of XGDY_DataManager.Instance.dynamicData.currentFishData.技能){
                if(skill.技能名 == XGDY_FishSkills.高速度){
                    //更新高速鱼
                    this.updateHighSpeedFish(deltaTime,skill.参数);
                }
                else if(skill.技能名 == XGDY_FishSkills.拉力增强){
                    //更新拉力增强鱼
                    this.updatePullEnhanceFish(deltaTime,skill.参数);
                }
                else if(skill.技能名 == XGDY_FishSkills.切线){
                    //更新切线鱼
                    this.updateKillLineFish(deltaTime,skill.参数);
                }
                else if(skill.技能名 == XGDY_FishSkills.暴怒){
                    //更新暴怒鱼
                    this.updateAngryFish(deltaTime,skill.参数);
                }
                else if(skill.技能名 == XGDY_FishSkills.钓法禁用){
                    //更新恐惧鱼
                    this.updateFearFish(deltaTime,skill.参数);
                }
                else if(skill.技能名 == XGDY_FishSkills.毒){
                    //更新毒鱼
                    this.updatePoisonFish(deltaTime,skill.参数);
                }
            }
        }
    }




    private isHighSpeeding = false;
    updateHighSpeedFish(dt: number,param:string[]){
        if(!XGDY_DataManager.Instance.dynamicData.isUpdateSkillEffect){
            if(this.isUsingSkill) return;
            this.isUsingSkill = true;
            //高速
            this.isHighSpeeding = true;
        }
        else{
            this.isUsingSkill = false;
            //非高速
            this.isHighSpeeding = false;
        }
     }

    private pullEnhancePassTime = 0;
    private pullEnhanceIntervalTime = 4;
    private isPullEnhancing = false;
    private pullEnhanceDurationTime = 1;//持续时间
    updatePullEnhanceFish(dt: number,param:string[]){
   //随机时间
        this.pullEnhancePassTime += dt;
        if(this.pullEnhancePassTime >= this.pullEnhanceIntervalTime){
            if(this.isUsingSkill) return;
            this.isUsingSkill = true;

            this.pullEnhancePassTime = 0;
            this.pullEnhanceIntervalTime = Math.random()*3+10;

            //显示提示
            let fishName = XGDY_DataManager.Instance.dynamicData.currentFishData.名称;
            EventManager.Scene.emit(XGDY_GameEvents.Show_FishSkill_Tip,fishName+"爆发!拉力增强!");

            //保持3秒爆发
            this.isPullEnhancing = true;
            this.scheduleOnce(()=>{
                this.isUsingSkill = false;
                this.isPullEnhancing = false;
            },this.pullEnhanceDurationTime);
        }
    }

    private killLinePassTime = 0;
    private killLineIntervalTime = 10;
    private isKilling = false;
    updateKillLineFish(dt: number,param:string[]){

        //随机时间
        this.killLinePassTime += dt;
        if(this.killLinePassTime >= this.killLineIntervalTime){
            if(this.isUsingSkill) return;

            this.killLinePassTime = 0;
            this.killLineIntervalTime = Math.random()*5+15;

            //留一人
            if( XGDY_DataManager.Instance.dynamicData.killedAnglerIds.length >= (XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.length-1)){
                return;
            }

            //确认当前血量大于30%
            if(XGDY_DataManager.Instance.dynamicData.currentFishHp <= XGDY_DataManager.Instance.dynamicData.fishMaxHp*0.3){
                return;
            }

            let targetAnglerId = null;

            //倒置数组
            let currentAnglerIds =[] ;
            XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.forEach((anglerId)=>{
                currentAnglerIds.push(anglerId);
            })
            currentAnglerIds.reverse();

            //选择当前未释放技能的钓友,获取钓线起点位置
            currentAnglerIds.forEach((anglerId,idx)=>{
                if(!targetAnglerId){
                  if(anglerId !== XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds[0]&& XGDY_DataManager.Instance.dynamicData.killedAnglerIds.indexOf(anglerId) == -1 && XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.indexOf(anglerId) == -1){
                    targetAnglerId = anglerId;  
                  }
                }
            })
        
            if(!targetAnglerId){
                return;
            }

            //当前玩家技能总伤
            let totalDamage = 0;
            
            //道具加成
            let itemAddCount = 0;
            if(XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.龙形锦鲤]){
                itemAddCount = XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.龙形锦鲤];
            }

            let specialItemDamageAdd = itemAddCount*0.05;
            if(specialItemDamageAdd > 1){
                specialItemDamageAdd = 1;
            }

            Object.keys(XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap).forEach((anglerId)=>{
                //钓法加成
                let angerSaveData = XGDY_DataManager.Instance.saveData.anglerData[anglerId];
                let angrlLevel  = angerSaveData.level;
                let anglerData = XGDY_DataManager.Instance.getItemDataById(anglerId) as XGDY_AnglerJsonData;
                let anglerAdd = anglerData.等级配置["1"].钓法加成+angrlLevel*5;
                XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[anglerId].forEach((skillItem)=>{
                    //技能加成
                    let skillId = skillItem.skillId;
                    let skillData = XGDY_DataManager.Instance.getItemDataById(skillId) as XGDY_SkillJsonData;
                    let skillLevel =  XGDY_DataManager.Instance.saveData.skillData[skillId];
                    let levelData = skillData.等级配置[skillLevel];
                    let skillDamage = levelData.总伤 * (anglerAdd/100+specialItemDamageAdd);
                    totalDamage += skillDamage;
                });
            })


            //如果所有钓友当前技能全部施加2次可以杀掉鱼，鱼不可以切线
            if(XGDY_DataManager.Instance.dynamicData.currentFishHp <= totalDamage*2){
                console.log("鱼打不过，禁止切线");
                return;
            }


           
            this.isUsingSkill = true;

            //显示危险提示，播放危险音效
            EventManager.Scene.emit(XGDY_GameEvents.Show_Danger_Sign,targetAnglerId);
            this.scheduleOnce(()=>{
                //停止线长计算
                XGDY_DataManager.Instance.dynamicData.isStopLineLengthCalc = true;

                //停止速度计算
                this.isKilling = true;

                //记录当前位置
                let worldPos = this.node.worldPosition.clone();

                //播放切割动画，移动到钓线位置
                //关闭挣扎动画
                this.node.getChildByName("sp").setRotationFromEuler(v3(0,15,0));

                let scaleX = this.node.scale.x;
                tween(this.node)
                    // .delay(0.8)
                    .call(()=>{
                        this.fishAnimation.stop();
                    })
                    .to(0.2,{worldPosition:XGDY_DataManager.Instance.dynamicData.killLinePoints[targetAnglerId].worldPosition.clone()})
                    .call(()=>{
                        this.node.setScale(v3(-scaleX,this.node.scale.y,this.node.scale.z));
                
                        //使用航母阻拦索
                        let usingSpecialLine = false;
                        if(XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.航母阻拦索] && XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.航母阻拦索]>=1){
                           usingSpecialLine = true;
                        }
                        //确认钓友是否正在使用钓法
                        if(!usingSpecialLine && XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.indexOf(targetAnglerId) == -1){
                            XGDY_DataManager.Instance.dynamicData.killedAnglerIds.push(targetAnglerId);
                            //未使用钓法，就将该钓友设置成被切线状态（暂时不管钓竿伤害，只影响技能数量，（LTODO，钓竿直接设置成3倍伤害和拉力技能直接使用））
                            EventManager.Scene.emit(XGDY_GameEvents.FishKillLine,targetAnglerId);
                        }
                        else{
                            if(usingSpecialLine){
                                //使用航母阻拦索，显示防御标志
                                EventManager.Scene.emit(XGDY_GameEvents.Show_Defense_Sign,targetAnglerId);
                            }
                            else{
                                //使用钓法，显示闪避标志
                                EventManager.Scene.emit(XGDY_GameEvents.Show_Dodge_Sign,targetAnglerId);
                            } 
                        }
                    })
                    .delay(0.2)
                    .call(()=>{
                        this.node.setScale(v3(scaleX,this.node.scale.y,this.node.scale.z));
                    })
                    .to(0.3,{worldPosition:worldPos})
                    .call(()=>{
                        //回到原位
                        this.node.setWorldPosition(worldPos);
                        this.node.getChildByName("sp").setRotationFromEuler(v3(0,0,0));
                        //恢复线长计算
                        XGDY_DataManager.Instance.dynamicData.isStopLineLengthCalc = false;

                        //恢复速度计算
                        this.isKilling = false;

                        this.isUsingSkill = false;

                        //继续挣扎动画
                        this.fishAnimation.play('struggle');
                    })
                    .start();  
            },1.2)
        }

        

    }


    private AngryPassTime = 0;
    private AngryIntervalTime = 4;
    private isAngrying = false;
    private AngryDurationTime = 3;//持续时间
    updateAngryFish(dt: number,param:string[]){
   //随机时间
        this.AngryPassTime += dt;
        if(this.AngryPassTime >= this.AngryIntervalTime){
                      
            if(this.isUsingSkill) return;
            this.isUsingSkill = true;

            this.AngryPassTime = 0;
            this.AngryIntervalTime = Math.random()*3+10;

            //显示提示
            let fishName = XGDY_DataManager.Instance.dynamicData.currentFishData.名称;
            EventManager.Scene.emit(XGDY_GameEvents.Show_FishSkill_Tip,fishName+"暴怒!无法拉动!");

            //保持3秒爆发
            this.isAngrying = true;
            this.scheduleOnce(()=>{
                this.isAngrying = false;
                this.isUsingSkill = false;
            },this.AngryDurationTime);
        }
    }
    
    private FearPassTime = 0;
    private FearIntervalTime = 4;
    // private isFearring = false;
    private FearDurationTime = 3;//持续时间
    updateFearFish(dt: number,param:string[]){
   //随机时间
        this.FearPassTime += dt;
        if(this.FearPassTime >= this.FearIntervalTime){
            if(this.isUsingSkill) return;
            this.isUsingSkill = true;

            this.FearPassTime = 0;
            this.FearIntervalTime = Math.random()*3+13;

            //显示提示
            EventManager.Scene.emit(XGDY_GameEvents.Show_FishSkill_Tip,"巨物威压!钓法禁用！");
            // this.scheduleOnce(()=>{
                //显示恐惧标志
                EventManager.Scene.emit(XGDY_GameEvents.Show_Fear_Sign);
                EventManager.Scene.emit(XGDY_GameEvents.Ban_Skill);
                //开启钓法禁用
                if(XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.length){
                    XGDY_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills = [...XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds];
                }
                XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds = [];
                EventManager.Scene.emit(XGDY_GameEvents.Ban_Skill);
                EventManager.Scene.emit(XGDY_GameEvents.Start_Ban_Skill);
                
                this.scheduleOnce(()=>{
                    this.isUsingSkill = false;
                    //解除钓法禁用
                    EventManager.Scene.emit(XGDY_GameEvents.End_Ban_Skill);
                },this.FearDurationTime);
            // },0.7)
        }
    }

    updatePoisonFish(dt: number,param:string[]){

    }







    protected bleed(){
        let bleed = XGDY_DataManager.Instance.dynamicData.currentFishBleed;
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
        //切线
        //绝境气息停止使用
        XGDY_DataManager.Instance.dynamicData.isUsingDesperateBreath = false;
        EventManager.Scene.emit(XGDY_GameEvents.Hide_Special_Item_Tip,{itemName:XGDY_SpecialItem.绝境气息});

        this.node.destroy();
    }


    resetFish(){
        let startPosX = XGDY_DataManager.Instance.dynamicData.lengthStartPointNode.worldPosition.x;
        let pos = XGDY_DataManager.Instance.dynamicData.hookPoint.worldPosition.clone();
        // pos.x = startPosX;
        this.node.setWorldPosition(pos);
        
        // 从数据管理器获取鱼的静态数据
        const fishData = XGDY_DataManager.Instance.getItemDataById( this.fishId) as XGDY_FishJsonData;
        if (!fishData) {
            console.error(`Fish data not found for id: ${ this.fishId}`);
            return;
        }
        
        XGDY_DataManager.Instance.dynamicData.currentFishData = fishData;
        XGDY_DataManager.Instance.dynamicData.fishMaxHp = fishData.血量;
        XGDY_DataManager.Instance.dynamicData.currentFishHp = fishData.血量;
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Fish_Data);
    }

    //阴鱼，切换下一条鱼

    checkoutNextFish(){
        if(this.fishId !== XGDY_Constant.MAP_7_SpecialFishFirstId) return;

        let pos = XGDY_DataManager.Instance.dynamicData.hookPoint.worldPosition.clone();
        let currentIdx  = XGDY_Constant.MAP_7_SpecialFishList.indexOf(XGDY_DataManager.Instance.dynamicData.SpecialFishCurrentId);
        let nextFishId =XGDY_Constant.MAP_7_SpecialFishList[currentIdx+1];
        XGDY_DataManager.Instance.dynamicData.SpecialFishCurrentId = nextFishId;

        this.node.getChildByName("sp").children.forEach((fishSpNode)=>{
            fishSpNode.active = fishSpNode.name == nextFishId;
        })
        // pos.x = startPosX;
        // this.node.setWorldPosition(pos);
        
        // 从数据管理器获取鱼的静态数据
        const fishData = XGDY_DataManager.Instance.getItemDataById(XGDY_DataManager.Instance.dynamicData.SpecialFishCurrentId) as XGDY_FishJsonData;
        if (!fishData) {
            console.error(`Fish data not found for id: ${XGDY_DataManager.Instance.dynamicData.SpecialFishCurrentId}`);
            return;
        }
        
        XGDY_DataManager.Instance.dynamicData.currentFishData = fishData;
        XGDY_DataManager.Instance.dynamicData.fishMaxHp = fishData.血量;
        XGDY_DataManager.Instance.dynamicData.currentFishHp = fishData.血量;
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Fish_Data);

    }


    protected addOtherEvents(){

    }

    protected removeOtherEvents(){

    }

    addListener(){
        this.isAddListener = true;
        EventManager.on(XGDY_GameEvents.Fish_Die,this.die,this)
        EventManager.on(XGDY_GameEvents.Fish_Bleeding,this.bleed,this)
        EventManager.on(XGDY_GameEvents.Destory_Fish,this.destoryFish,this)
        EventManager.on(XGDY_GameEvents.Reset_Fish,this.resetFish,this)
        EventManager.on(XGDY_GameEvents.Checkout_Next_FishId,this.checkoutNextFish,this)

        this.addOtherEvents();
    }

    removeListener(){
        EventManager.off(XGDY_GameEvents.Fish_Die,this.die,this)
        EventManager.off(XGDY_GameEvents.Fish_Bleeding,this.bleed,this)
        EventManager.off(XGDY_GameEvents.Destory_Fish,this.destoryFish,this)
        EventManager.off(XGDY_GameEvents.Reset_Fish,this.resetFish,this);
        EventManager.off(XGDY_GameEvents.Checkout_Next_FishId,this.checkoutNextFish,this)




        this.removeOtherEvents();
    }

    /**
     * 组件销毁时的清理
     */
    onDestroy() {
        this.removeListener();
    }
}