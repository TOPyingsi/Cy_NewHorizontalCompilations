import { _decorator, Animation, Button, Component, EventKeyboard, EventTouch, instantiate, KeyCode, Label, Node, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_AnglerJsonData, XGDY_DataManager, XGDY_FishingRodJsonData, XGDY_SkillJsonData, XGDY_SpecialItem } from '../Manager/XGDY_DataManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_SkillDamageParams, XGDY_SkillId } from '../Common/XGDY_ISkillParams';
import { XGDY_SkillManager } from '../Manager/XGDY_SkillManager';
import { XGDY_GameManager } from '../Manager/XGDY_GameManager';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
import { XGDY_AudioManager } from '../Manager/XGDY_AudioManager';
import { XGDY_Constant } from '../Common/XGDY_Constant';
const { ccclass, property } = _decorator;

@ccclass('XGDY_GameUI')
export class XGDY_GameUI extends Component {

    @property(Node)
    private joyBase: Node;

    @property(Node)
    private tipContainer: Node;

    @property(Node)
    private btnCastRod: Node;

    @property(Node)
    private btnReelRod: Node;

    @property(Node)
    private btnKill: Node;

    @property(Node)
    private btnPullLine: Node;

    @property(Sprite)
    private spLineProgress: Sprite;

    @property(Label)
    private lblFishLineLength: Label;

    @property(Label)
    private lblHpProgress: Label;

    @property(Sprite)
    private spHpLateProgress: Sprite;

    @property(Sprite)
    private spHpProgress: Sprite;

    @property(Label)
    private lblFishName: Label;

    @property(Node)
    private fishDataNode: Node;

    @property(Node)
    private btnInteract: Node;

    @property(Node)
    private rollNode: Node;
    
        
    @property(Node)
    private skillContainer: Node;

    @property(Node)
    private skillTipContainer: Node;

    @property(Node)
    private btnSpecialItem: Node;

    @property(Node)
    private specialItemsContainer: Node;
    
    @property(Node)
    private specialItemsPanel: Node;

    @property(Node)
    private specialItemsTipContainer: Node;

    @property(Node)
    private fishingItems: Node[] = [];
    
    


    private isAddLinstener = false;

    private isPulling = false;
    private skillCdList:{skillId:string,cd:number,skillItem:Node}[]= [];
    private usingSkillIds:string[] = [];


    private cameraTargets: string[] = [];


    onLoad(){
        this.addListener();
    }

    init(){
        if(!this.isAddLinstener){
            this.addListener();
        }
        this.tipContainer.children[0].active = false;
        this.btnCastRod.active = true;
        this.btnReelRod.active = false;
        this.btnPullLine.active = false;
        this.fishDataNode.active = false;
        this.btnKill.active = false;
        this.btnInteract.active = false;
        this.isPulling = false;
        this.skillContainer.children[0].active = false;
        this.skillContainer.active = false;
        this.specialItemsPanel.active = false;
        this.specialItemsTipContainer.children.forEach((item)=>{
            item.active = false;
        })
    }

    update(deltaTime: number) {
        if (this.keyboardDir.length() > 0) {
            // console.log(1111);
            // 如果有键盘输入，则使用键盘方向
            this._dir = this.keyboardDir.clone().normalize();
            EventManager.Scene.emit(XGDY_GameEvents.Player_Move, this._dir.multiplyScalar(80));
        }

        if(XGDY_DataManager.Instance.dynamicData.isFishHooking){
            this.updateHpLate(deltaTime);
            this.updateWheel(deltaTime);
        }

        if(this.skillCdList.length>0){
            this.updateSkillCd(deltaTime);
        }
    }
    
    PlayerTouchStart() {
        if(!XGDY_DataManager.Instance.dynamicData.isGameStart ) return;
        XGDY_DataManager.Instance.dynamicData.isMove = true;
        // if(TKJWL_DataManager.Instance.isGuidanding){
        //     if(TKJWL_DataManager.Instance.currentStepIndex == 0){
        //         EventManager.Scene.emit("JJTW_JOYSTICK_Start");
        //     }
        //     else if(TKJWL_DataManager.Instance.currentStepIndex == 2){
        //         EventManager.Scene.emit("JJTW_Scream_Start");
        //     }
        // }
    }

    PlayerTouchMove(event: EventTouch) {
        if(!XGDY_DataManager.Instance.dynamicData.isGameStart ) return;
        var joy = this.joyBase.children[0];
        var pos = event.getUILocation();
        var basePos = this.joyBase.getWorldPosition();
        var delta = v3(pos.x - basePos.x, pos.y - basePos.y, 0);
        var maxDis = this.joyBase.getComponent(UITransform).width / 2;
        if (delta.length() > maxDis) {
            delta = delta.normalize().multiplyScalar(maxDis);
            joy.setPosition(delta);
        }
        else joy.setWorldPosition(v3(pos.x, pos.y));
        // console.log(delta);

        XGDY_DataManager.Instance.dynamicData.moveDir = delta;
    }
    
    PlayerTouchEnd() {
        if(!XGDY_DataManager.Instance.dynamicData.isGameStart ) return;
        var joy = this.joyBase.children[0];
        joy.setPosition(Vec3.ZERO);
        XGDY_DataManager.Instance.dynamicData.isMove = false;
    }

    
   

    keyboardDir: Vec3 = v3(0, 0, 0);
    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.keyboardDir.y = 1;
                break;
            case KeyCode.KEY_S:
                this.keyboardDir.y = -1;
                break;
            case KeyCode.KEY_A:
                this.keyboardDir.x = -1;
                break;
            case KeyCode.KEY_D:
                this.keyboardDir.x = 1;
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
            case KeyCode.KEY_S:
                this.keyboardDir.y = 0;
                break;
            case KeyCode.KEY_A:
            case KeyCode.KEY_D:
                this.keyboardDir.x = 0;
                break;
        }

        // 如果没有按键按下，停止移动
        if (this.keyboardDir.length() === 0) {
            this.onKeyboardStop();
        }
    }

    onKeyboardStop() {
        // 键盘停止时重置摇杆位置
        var joy = this.joyBase.children[0];
        joy.worldPosition = this.joyBase.worldPosition;
        EventManager.Scene.emit(XGDY_GameEvents.Player_Stop, this._dir);
    }


    private _dir: Vec3 = Vec3.ZERO;
    onTouchStart(event: EventTouch) {
        if(!XGDY_DataManager.Instance.dynamicData.isGameStart ) return;
         if(!XGDY_DataManager.Instance.dynamicData.isGameStart ) return;
        
        var joy = this.joyBase.children[0];

        let touchPos = v3(event.getUILocation().x, event.getUILocation().y);

        joy.worldPosition = touchPos;

        let distance = touchPos.clone().subtract(this.joyBase.worldPosition);

        let maxLength = this.joyBase.getComponent(UITransform).width / 2;

        this._dir = distance.clone().normalize();

        XGDY_DataManager.Instance.dynamicData.moveDir = this._dir.clone();

        XGDY_DataManager.Instance.dynamicData.isMove = true;
        EventManager.Scene.emit(XGDY_GameEvents.Player_Move, this._dir);
    }

    onTouchMove(event: EventTouch) {
        if(!XGDY_DataManager.Instance.dynamicData.isGameStart ) return;
        let touchPos = v3(event.getUILocation().x, event.getUILocation().y);
        var joy = this.joyBase.children[0];

        let distance = touchPos.clone().subtract(this.joyBase.worldPosition);

        let disLength = distance.clone().length();

        let maxLength = this.joyBase.getComponent(UITransform).width / 2;

        this._dir = distance.clone().normalize();

        let offset = this._dir.multiplyScalar(maxLength);

        if (disLength < maxLength) {
            joy.worldPosition = touchPos;
        }
        else {
            joy.position = offset;
        }

        XGDY_DataManager.Instance.dynamicData.moveDir = this._dir.clone();
        XGDY_DataManager.Instance.dynamicData.isMove = true;

        EventManager.Scene.emit(XGDY_GameEvents.Player_Move, this._dir);
    }

    onTouchEnd(event: EventTouch) {
        if(!XGDY_DataManager.Instance.dynamicData.isGameStart ) return;
        var joy = this.joyBase.children[0];
        joy.worldPosition = this.joyBase.worldPosition;
        XGDY_DataManager.Instance.dynamicData.moveDir = null;
        XGDY_DataManager.Instance.dynamicData.isMove = false;
        EventManager.Scene.emit(XGDY_GameEvents.Player_Stop, this._dir);
    }


    onBtnCastRodClick(){
        if(XGDY_DataManager.Instance.dynamicData.isStopInteract)return;
        if(XGDY_DataManager.Instance.dynamicData.isFallingIntoWater)return;
        if(XGDY_DataManager.Instance.dynamicData.isFishing)return;
        if(!XGDY_DataManager.Instance.checkIsMapCanFishing())return;
        if(XGDY_DataManager.Instance.goToFishing()){
            XGDY_DataManager.Instance.dynamicData.isStopInteract = true;
            this.btnCastRod.active = false;
            this.btnReelRod.active = true;
            this.btnPullLine.active = false;
            this.btnKill.active = false;
            this.isPulling = false;
        }
    }

    onBtnReelRodClick(){
        if(XGDY_DataManager.Instance.dynamicData.isStopInteract)return;
        if(!XGDY_DataManager.Instance.dynamicData.isFishing)return;
        if(XGDY_DataManager.Instance.endFishing()){
            XGDY_DataManager.Instance.dynamicData.isStopInteract = true;
            this.btnCastRod.active = true;
            this.btnReelRod.active = false;
            this.btnPullLine.active = false;
            this.btnKill.active = false;
            this.isPulling = false;
        }
    }

    onKill(){
        if(!XGDY_DataManager.Instance.dynamicData.isFishing)return;
        if(XGDY_DataManager.Instance.endFishing()){
            XGDY_DataManager.Instance.dynamicData.isStopInteract = true;
             XGDY_AudioManager.getInstance().playMusic("bgm");
            this.btnCastRod.active = true;
            this.btnReelRod.active = false;
            this.btnPullLine.active = false;
            this.btnKill.active = false;
            this.isPulling = false;
            if(XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.length){
                XGDY_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills = [...XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds];
            }
            this.hideSkillList();
           
        }
    }




    onBtnKillClick(){
        if(XGDY_DataManager.Instance.dynamicData.isStopInteract)return;
        XGDY_DataManager.Instance.dynamicData.isStopInteract = true;
        EventManager.Scene.emit(XGDY_GameEvents.Kill) 
        EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish,XGDY_DataManager.Instance.dynamicData.currentFishId) 
        EventManager.Scene.emit(XGDY_GameEvents.Clear_Skill);
    }


    onBtnPullLineTouchStart(){
        if(!XGDY_DataManager.Instance.dynamicData.isFishHooking)return;
        XGDY_SkillManager.Instance.startPullLine();
        this.isPulling = true;
    }

    onBtnPullLineTouchMove(){
        // XGDY_SkillDamageManager.Instance.stopPullLine();
    }

    onBtnPullLineTouchEnd(){
        XGDY_SkillManager.Instance.stopPullLine();
        this.isPulling = false;
        // let anim = this.rollNode.getComponent(Animation)
        // anim.clips[0].speed = -1;
        // anim.play();
        // this.isPulling = false;
    }

   

    showCastRodBtn(){
        // if(!XGDY_DataManager.Instance.dynamicData.isFishing)return;
        this.btnCastRod.active = true;
        this.btnReelRod.active = false;
        this.btnPullLine.active = false;
        this.fishDataNode.active = false;
        // let anim = this.rollNode.getComponent(Animation)
        // anim.clips[0].speed = 2;
        // anim.stop();
    }

    showTip(tip: string) {
        // 显示提示文本
       let tipItem = this.tipContainer.children[0];
       this.tipContainer.children[0].active = false;
       let newTipItem = instantiate(tipItem);
       newTipItem.getComponentInChildren(Label).string = tip;
       newTipItem.parent = this.tipContainer;
       newTipItem.setPosition(0,0);
       newTipItem.active = true;
       tween(newTipItem)
       .delay(2)
       .to(1,{position:new Vec3(0,100,0)})
       .call(()=>{
        newTipItem.destroy();
       })
       .start();

       tween(newTipItem.getComponent(UIOpacity))
      .delay(2)
      .to(1,{opacity:0})
      .start();

    }


    updateFishLineLength(){
        let isFound = false;
        let rodLinLangth = 0;
        Object.keys(XGDY_DataManager.Instance.saveData.fishingRodData).forEach(key=>{
            if(!isFound){
                if(XGDY_DataManager.Instance.saveData.fishingRodData[key].isEquipped){
                    isFound = true;
                    let rodData = XGDY_DataManager.Instance.getItemDataById(key) as XGDY_FishingRodJsonData;  // 获取鱼的数量
                    rodLinLangth =  rodData.鱼线长度;
                }
            }
        })
        this.spLineProgress.fillRange = XGDY_DataManager.Instance.dynamicData.lineLength/rodLinLangth;
        this.lblFishLineLength.string = XGDY_DataManager.Instance.dynamicData.lineLength + "m";
    }

    updateHp(){
        this.lblHpProgress.string = XGDY_DataManager.Instance.dynamicData.currentFishHp.toFixed(0) + "/" + XGDY_DataManager.Instance.dynamicData.fishMaxHp;
        let hpProgress = XGDY_DataManager.Instance.dynamicData.currentFishHp/XGDY_DataManager.Instance.dynamicData.fishMaxHp;
        this.spHpProgress.fillRange = hpProgress;
        let lateWidth = this.spHpLateProgress.node.getComponent(UITransform).width*this.spHpLateProgress.fillRange;
        let width = this.spHpProgress.node.getComponent(UITransform).width*this.spHpProgress.fillRange;
        XGDY_DataManager.Instance.dynamicData.lateDamageSpeed = (lateWidth - width)/0.3;
    }


    updateHpLate(dt){
        let hpProgress = XGDY_DataManager.Instance.dynamicData.currentFishHp/XGDY_DataManager.Instance.dynamicData.fishMaxHp;
        if(hpProgress < this.spHpLateProgress.fillRange){
            let width = this.spHpLateProgress.node.getComponent(UITransform).width;
            let rangeSpeed = XGDY_DataManager.Instance.dynamicData.lateDamageSpeed/width;
            this.spHpLateProgress.fillRange -= dt*rangeSpeed;
            if(this.spHpLateProgress.fillRange < hpProgress){
                this.spHpLateProgress.fillRange = hpProgress;
            }
        }
    }

    updateWheel(dt){
        if(!this.isPulling){
            this.rollNode.eulerAngles =  v3(0,0,this.rollNode.eulerAngles.z+dt*180)
        }
        else{
            this.rollNode.eulerAngles =  v3(0,0,this.rollNode.eulerAngles.z-dt*760)
        }
    }



    updateFishData(params){
        let fishData = XGDY_DataManager.Instance.dynamicData.currentFishData;
        if(!fishData) return;
        this.lblFishName.string = fishData.名称 +"  "+ fishData.斤数 + "斤";
        this.updateHp();
        this.spHpLateProgress.fillRange = 1;
        this.fishDataNode.active = true;
    }

    showPullLineBtn(){
        this.btnPullLine.active = true;
                this.btnKill.active = true;
        this.btnReelRod.active = false;
        this.btnCastRod.active = false;
        // let anim = this.rollNode.getComponent(Animation)
        // anim.clips[0].speed = -1;
        // anim.play();
        this.showSkillList();
    }

    showInteractBtn(){
        this.btnInteract.active = true;
    }
    hideInteractBtn(){
        this.btnInteract.active = false;
    }

    onBtnInteractClick(){
        let interactEntity = XGDY_DataManager.Instance.dynamicData.interactionTarget;
        
        let targetType = interactEntity.name.split("_")[0];
        switch(targetType){
            case "NPC":
                XGDY_DataManager.Instance.dynamicData.currentNpcId = interactEntity.name;
                EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_DIALOUGE_PANEL);
                break;
            case "tractor":
                XGDY_GameManager.Instance.exitGame();
                break;
        }
    }

    hideKillBtn(){
        this.btnKill.active = false;
    }

    UI_Hide_MoveBtn(){
        this.joyBase.active = false;
    }

    UI_Show_MoveBtn(){
        this.joyBase.active = true;
        this.hideSkillList();
    }

    hideSkillList(){
        this.skillContainer.active = false;
        this.skillTipContainer.active = false;
        this.usingSkillIds = [];
        this.skillCdList = [];
        XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds = [];
    }

    showSkillList(){
        // 清空anglerId到技能项的映射
        XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap = {};
        this.skillContainer.children.forEach((skillItem,idx)=>{
            if(idx == 0){
                skillItem.active = false;
                return;
            } 
            skillItem.destroy();
        })
        let anglerIds = XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds;
        let skillItem = this.skillContainer.children[0];
        let skillIds = [];
        anglerIds.forEach((anglerId)=>{
            let angerSaveData = XGDY_DataManager.Instance.saveData.anglerData[anglerId];
            let level = angerSaveData.level;
            let anglerData = XGDY_DataManager.Instance.getItemDataById(anglerId) as XGDY_AnglerJsonData;
            Object.keys(anglerData.技能列表).forEach((key)=>{
                let skillData = anglerData.技能列表[key];
                if(skillData<= level){
                    skillIds.push(key);
                }
            })
        })
        let spCount = 0;

        let sps:{anglerId:string,sp:SpriteFrame}[] =[]; 
        skillIds.forEach((skillId)=>{
            sps.push(null);
        })
        
        anglerIds.forEach((anglerId)=>{
            let angerSaveData = XGDY_DataManager.Instance.saveData.anglerData[anglerId];
            let unlockedSkillIds = [];

            let level = angerSaveData.level;
            let anglerData = XGDY_DataManager.Instance.getItemDataById(anglerId) as XGDY_AnglerJsonData;
            Object.keys(anglerData.技能列表).forEach((key)=>{
                let skillData = anglerData.技能列表[key];
                if(skillData <= level){
                    unlockedSkillIds.push(key);
                }
            })

            unlockedSkillIds.forEach((skillId)=>{
                XGDY_LoadManager.Instance.getSkillIconById(skillId,(sp)=>{
                    spCount++;
                    sps[skillIds.indexOf(skillId)] = {anglerId:anglerId,sp:sp};
                
                    if(spCount == skillIds.length){
                        skillIds.forEach((skillId)=>{
                            let newSkillItem = instantiate(skillItem);
                            newSkillItem.parent = this.skillContainer;
                            newSkillItem.active = true;
        
                            let lblkillName = newSkillItem.getChildByName("lblSkillName").getComponent(Label);
                            let spSkill = newSkillItem.getChildByName("spSkill").getComponent(Sprite);
                            let mask = newSkillItem.getChildByName("mask");
                            let lblDownCount = newSkillItem.getChildByName("lblDownCount").getComponent(Label);
                            let lblHealthCost = newSkillItem.getChildByName("lblHealthCost").getComponent(Label);
                            let skillTipNode = newSkillItem.getChildByName("skillTipNode")
                            skillTipNode.active = false;

                            let skillData = XGDY_DataManager.Instance.getItemDataById(skillId) as XGDY_SkillJsonData;
                            let skillLevel =  XGDY_DataManager.Instance.saveData.skillData[skillId];
                            let levelData = skillData.等级配置[skillLevel];
                            lblHealthCost.string = "体力："+levelData.体力消耗;
                            lblkillName.string = skillData.名称;
                            spSkill.spriteFrame =  sps[skillIds.indexOf(skillId)].sp;
                            // spSkill.node.getComponent(UITransform).width = spSkill.spriteFrame.width;
                            // spSkill.node.getComponent(UITransform).height = spSkill.spriteFrame.height;
                            let scale = 110/spSkill.spriteFrame.width;
                            spSkill.node.setScale(0.7,0.7);
                            mask.active = false;
                            lblDownCount.string = "";


                            let angrlLevel  = angerSaveData.level;
                            let anglerData = XGDY_DataManager.Instance.getItemDataById(anglerId) as XGDY_AnglerJsonData;
                            let anglerAdd = anglerData.等级配置["1"].钓法加成+angrlLevel*5;

                            let itemAddCount = 0;
                            if(XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.龙形锦鲤]){
                                itemAddCount = XGDY_DataManager.Instance.saveData.usedSpecialItemData[XGDY_SpecialItem.龙形锦鲤];
                            }

                            let specialItemDamageAdd = itemAddCount*0.5;
                            if(specialItemDamageAdd > 5){
                                specialItemDamageAdd = 5;
                            }

                            // 记录anglerId到技能项的映射
                            if(!XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[sps[skillIds.indexOf(skillId)].anglerId]){
                                XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[sps[skillIds.indexOf(skillId)].anglerId] = [];
                            }
                            XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[sps[skillIds.indexOf(skillId)].anglerId].push({skillId:skillId,skillItem:newSkillItem});
                        

                            let skillInfo:{
                                技能id:string,
                                技能等级:number,
                                冷却时间: number; // 单位：秒
                                持续时间: number; // 单位：秒
                                体力消耗: number;
                                拉力: number;
                                总伤: number;
                                angler:string,
                            } = {
                                技能id:skillId,
                                技能等级:skillLevel,
                                冷却时间:skillData.冷却时间,
                                持续时间:XGDY_DataManager.Instance.dynamicData.skillTimeData[skillId],
                                体力消耗:levelData.体力消耗,
                                拉力:levelData.拉力 * anglerAdd/100,
                                总伤:levelData.总伤 * (anglerAdd/100+specialItemDamageAdd),
                                angler:skillId,
                            }
                            newSkillItem.on("click",()=>{
                                this.onSkillClick(
                                    skillInfo,
                                    skillId,
                                    sps[skillIds.indexOf(skillId)].anglerId,
                                    newSkillItem
                                );
                            })
                        })
                        this.skillContainer.active = true;
                    }
                });
            })
        })
    }
    
    onSkillClick( 
        skillData:{
            技能id:string,
            技能等级:number,
            冷却时间: number; // 单位：秒
            持续时间: number; // 单位：秒
            体力消耗: number;
            拉力: number;
            总伤: number;
            angler:string,
        },
        skillId:XGDY_SkillId,
        anglerId:string,
        newSkillItem:Node
    ){

        if(XGDY_DataManager.Instance.dynamicData.isStopInteract)return;
        let createTip =()=>{
            let skillTipNode = newSkillItem.getChildByName("skillTipNode")
    
            let newTip = instantiate(skillTipNode);
            let worldPosition = skillTipNode.worldPosition.clone();
            newTip.setParent(this.skillTipContainer);
            newTip.setWorldPosition(worldPosition);
            newTip.active = true;
    
            newTip.getComponent(UIOpacity).opacity = 0;
            newTip.setWorldPosition(worldPosition.x,worldPosition.y-30,worldPosition.z);
            tween(newTip)
            .to(0.3,{worldPosition:new Vec3(worldPosition.x,worldPosition.y,worldPosition.z)})
            .delay(1)
            .to(0.3,{worldPosition:new Vec3(worldPosition.x,worldPosition.y+100,worldPosition.z)})
            .call(()=>{
                newTip.destroy();
            })
            .start();
     
            tween(newTip.getComponent(UIOpacity))
            .to(0.3,{opacity:255})
           .delay(1)
           .to(0.3,{opacity:0})
           .start();
           this.skillTipContainer.active = true;
        }
    if(this.usingSkillIds.indexOf(skillId) != -1){
        createTip();
        return;
    }
     if(XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.indexOf(anglerId)==-1){
        if(XGDY_DataManager.Instance.dynamicData.currentHealth < skillData.体力消耗){
            this.showTip("体力不足");
            return;
        }
        let cdParma : {skillId:string,cd:number,skillItem:Node} = {
            skillId:skillId,
            cd:XGDY_Constant.skillCdTime,
            skillItem:newSkillItem
        }
        this.skillCdList.push(cdParma);
        this.usingSkillIds.push(skillId);
        cdParma.skillItem.getChildByName("mask").active = true; 

        //体力消耗
        XGDY_DataManager.Instance.dynamicData.currentHealth -= skillData.体力消耗;
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Health);

        //创建技能
        XGDY_SkillManager.Instance.createSkill(skillData);
        XGDY_DataManager.Instance.dynamicData.usingSkillAnglerIds.push(anglerId);

        //玩家动画
        EventManager.Scene.emit(XGDY_GameEvents.Use_Skill,{anglerId:anglerId,skillId:skillId});
        
        //相机操作
        let idx = XGDY_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(anglerId);
        XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[idx];
        EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,4.5,false);
        XGDY_DataManager.Instance.dynamicData.cameraTargets.push(XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[idx]);
        this.scheduleOnce(()=>{
            XGDY_DataManager.Instance.dynamicData.cameraTargets.splice(XGDY_DataManager.Instance.dynamicData.cameraTargets.indexOf(XGDY_DataManager.Instance.dynamicData.currentAnglerNodes[idx]),1);
            if(XGDY_DataManager.Instance.dynamicData.cameraTargets.length == 0 && XGDY_DataManager.Instance.dynamicData.isFishHooking){
                XGDY_DataManager.Instance.dynamicData.cameraTarget = XGDY_DataManager.Instance.dynamicData.hookPoint;
                EventManager.Scene.emit(XGDY_GameEvents.Update_Camera_Tartget,4.5);
            }
        },0.7)
    }
     else{
        createTip();
     }
    }


    deleteAnglerSkillItems(anglerId:string){
        if(XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[anglerId]){
            XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[anglerId].forEach((skillItem)=>{
                skillItem.skillItem.removeFromParent();
                skillItem.skillItem.destroy();
                skillItem.skillItem = null;
            })
            XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[anglerId] = [];
        }
    }

    banAnglerSkills(anglerId:string){
        if(XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[anglerId]){
            XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[anglerId].forEach((skillItem)=>{
                skillItem.skillItem.getComponent(Button).interactable = false;
                skillItem.skillItem.getChildByName("ban").active = true;
            })
        }
        this.usingSkillIds = [];
    }

    resumAnglerSkills(){
        Object.keys(XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap).forEach((anglerId)=>{
            XGDY_DataManager.Instance.dynamicData.anglerIdToSkillItemMap[anglerId].forEach((skillItem)=>{
                skillItem.skillItem.getComponent(Button).interactable = true;
                skillItem.skillItem.getChildByName("ban").active = false;
            })
        })
    }


    updateSkillCd(dt){
        this.skillCdList.forEach((cdParma)=>{
            cdParma.cd -= dt;
            if(cdParma.skillItem && cdParma.skillItem.isValid){
                cdParma.skillItem.getChildByName("lblDownCount").getComponent(Label).string = Math.floor(cdParma.cd).toString();
            }

            if(cdParma.cd <= 0){
                cdParma.cd = 0;
                if(cdParma.skillItem  && cdParma.skillItem.isValid){
                    cdParma.skillItem.getChildByName("lblDownCount").getComponent(Label).string = "";
                    cdParma.skillItem.getChildByName("mask").active = false; 
                }
               
                while(this.usingSkillIds.indexOf(cdParma.skillId) != -1){
                    this.usingSkillIds.splice(this.usingSkillIds.indexOf(cdParma.skillId),1);
                }

                this.skillCdList.splice(this.skillCdList.indexOf(cdParma),1);
            } 
        })
        

    }


    updateSpecialItemPanel(){
         this.specialItemsContainer.children.forEach((item)=>{
            let itemName = item.name;
            let itemCount= XGDY_DataManager.Instance.saveData.itemData[itemName] || 0;
            let itemLabel = item.getChildByName("lblCount").getComponent(Label);
            itemLabel.string = itemCount.toString();
        })
    }


    onBtnSpecialItemClick(){
        this.specialItemsContainer.children.forEach((item)=>{
            let itemName = item.name;
            let itemCount= XGDY_DataManager.Instance.saveData.itemData[itemName] || 0;
            let itemLabel = item.getChildByName("lblCount").getComponent(Label);
            itemLabel.string = itemCount.toString();
        })
        if(!this.specialItemsPanel.active){
            this.specialItemsPanel.active = true;
            this.specialItemsPanel.setScale(new Vec3(0,0,0));
            tween(this.specialItemsPanel)
                .to(0.2,{scale:new Vec3(1,1,1)})
                .start();
        }
        else{
            this.specialItemsPanel.setScale(new Vec3(1,1,1));
            tween(this.specialItemsPanel)
            .to(0.3,{scale:new Vec3(0,0,0)})
            .call(()=>{
                this.specialItemsPanel.active = false;
            })
            .start();
        }
    }


    onSpecialItemClick(item:Node){
       let itemName = item.name;
       if(XGDY_DataManager.Instance.dynamicData.isFishing){
        XGDY_DataManager.Instance.saveData.itemData[itemName] = XGDY_DataManager.Instance.saveData.itemData[itemName] || 0;
        if(XGDY_DataManager.Instance.saveData.itemData[itemName] > 0){
           XGDY_DataManager.Instance.executeItemEffect(itemName);
        }
        else{
            XGDY_DataManager.Instance.dynamicData.currentSpecialItemId = item.name;
            EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_ITEM_DIALOUGE_PANEL);
        }
       }
       else{
            XGDY_DataManager.Instance.dynamicData.currentSpecialItemId = item.name;
            EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_ITEM_DIALOUGE_PANEL);
       }
      
    //    this.specialItemsPanel.active = false;
    }

    updateSpecialItemTip(data:{itemName:XGDY_SpecialItem,remainTime:number}){
        let itemNode = this.specialItemsTipContainer.getChildByName(data.itemName);

        switch(data.itemName){
            case XGDY_SpecialItem.祖传饵料:
                let min = Math.floor(data.remainTime / 60);
                let sec = Math.floor(data.remainTime % 60);
                let timeString = min + "分" + sec + "秒";
                itemNode.getComponent(Label).string = "祖传饵料生效中:" + timeString;
                break;
        }
    }

    showSpecialItemTip(data:{itemName:XGDY_SpecialItem}){
        let itemNode = this.specialItemsTipContainer.getChildByName(data.itemName);
        itemNode.active = true;
    }

    hideSpecialItemTip(data:{itemName:XGDY_SpecialItem}){
        let itemNode = this.specialItemsTipContainer.getChildByName(data.itemName);
        itemNode.active = false;
    }



    hideFishingUIItems(){
        this.fishingItems.forEach((item)=>{
            item.active = false;
        })
    }

    showFishingUIItems(){
        this.fishingItems.forEach((item)=>{
            item.active = true;
        })
    }


    
    addListener(){
        this.isAddLinstener = true;
        // EventManager.on(XGDY_GameEvents.Show_Tip,this.showTip,this);
        EventManager.on(XGDY_GameEvents.Show_CastRod_Btn,this.showCastRodBtn,this);
        EventManager.on(XGDY_GameEvents.UI_Update_Line_length,this.updateFishLineLength,this)
        EventManager.on(XGDY_GameEvents.UI_Update_Hp,this.updateHp,this)
        EventManager.on(XGDY_GameEvents.UI_Update_Fish_Data,this.updateFishData,this)
        EventManager.on(XGDY_GameEvents.FishHooking, this.showPullLineBtn, this);
        EventManager.on(XGDY_GameEvents.UI_Show_Btn_Interact,this.showInteractBtn,this);
        EventManager.on(XGDY_GameEvents.UI_Hide_Btn_Interact,this.hideInteractBtn,this);
        EventManager.on(XGDY_GameEvents.UI_Hide_MoveBtn,this.UI_Hide_MoveBtn,this);
        EventManager.on(XGDY_GameEvents.UI_Show_MoveBtn,this.UI_Show_MoveBtn,this);
        EventManager.on(XGDY_GameEvents.Kill,this.onKill,this);
        EventManager.on(XGDY_GameEvents.Clear_Skill_DownCound,this.hideSkillList,this);
        EventManager.on(XGDY_GameEvents.Hide_Kill_Btn,this.hideKillBtn,this);

        EventManager.on(XGDY_GameEvents.Show_Special_Item_Tip,this.showSpecialItemTip,this);
        EventManager.on(XGDY_GameEvents.Update_Special_Item_Tip,this.updateSpecialItemTip,this);
        EventManager.on(XGDY_GameEvents.Hide_Special_Item_Tip,this.hideSpecialItemTip,this);

        //鱼技能相关
        //切线，删除对应技能项
        EventManager.on(XGDY_GameEvents.UI_Delete_Angler_Skill_Item,this.deleteAnglerSkillItems,this);
        //钓法禁用
        EventManager.on(XGDY_GameEvents.UI_Ban_Angler_Skill_Item,this.banAnglerSkills,this);
        //
        EventManager.on(XGDY_GameEvents.End_Ban_Skill,this.resumAnglerSkills,this);

        EventManager.on(XGDY_GameEvents.UI_Hide_UIItem_Fishing,this.hideFishingUIItems,this);
        EventManager.on(XGDY_GameEvents.UI_Show_UIItem_Fishing,this.showFishingUIItems,this);
      
        EventManager.on(XGDY_GameEvents.UI_Update_SpecialItemPanel,this.updateSpecialItemPanel,this);


        

        this.joyBase.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.joyBase.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.joyBase.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.btnCastRod.on(Node.EventType.TOUCH_END, this.onBtnCastRodClick, this);
        this.btnReelRod.on(Node.EventType.TOUCH_END, this.onBtnReelRodClick, this);
        this.btnPullLine.on(Node.EventType.TOUCH_START, this.onBtnPullLineTouchStart, this);
        this.btnPullLine.on(Node.EventType.TOUCH_MOVE, this.onBtnPullLineTouchMove, this);
        this.btnPullLine.on(Node.EventType.TOUCH_END, this.onBtnPullLineTouchEnd, this);
        this.btnPullLine.on(Node.EventType.TOUCH_CANCEL, this.onBtnPullLineTouchEnd, this);
        this.btnKill.on(Node.EventType.TOUCH_END, this.onBtnKillClick, this);
        this.btnInteract.on(Node.EventType.TOUCH_END, this.onBtnInteractClick, this);
        this.btnSpecialItem.on(Node.EventType.TOUCH_END, this.onBtnSpecialItemClick, this);
        this.specialItemsContainer.children.forEach((item)=>{
            item.on(Node.EventType.TOUCH_END, (event)=>{
                this.onSpecialItemClick(item);
            }, this);
        })


    }
    removeListener(){
        // EventManager.off(XGDY_GameEvents.Show_Tip,this.showTip,this);
        EventManager.off(XGDY_GameEvents.Show_CastRod_Btn,this.showCastRodBtn,this);
        EventManager.off(XGDY_GameEvents.UI_Update_Line_length,this.updateFishLineLength,this)
        EventManager.off(XGDY_GameEvents.UI_Update_Hp,this.updateHp,this)
        EventManager.off(XGDY_GameEvents.UI_Update_Fish_Data,this.updateFishData,this)
        EventManager.off(XGDY_GameEvents.FishHooking, this.showPullLineBtn, this);
        EventManager.off(XGDY_GameEvents.UI_Show_Btn_Interact,this.showInteractBtn,this);
        EventManager.off(XGDY_GameEvents.UI_Hide_Btn_Interact,this.hideInteractBtn,this);
        EventManager.off(XGDY_GameEvents.UI_Hide_MoveBtn,this.UI_Hide_MoveBtn,this);
        EventManager.off(XGDY_GameEvents.UI_Show_MoveBtn,this.UI_Show_MoveBtn,this);
        EventManager.off(XGDY_GameEvents.Kill,this.onKill,this);
        EventManager.off(XGDY_GameEvents.Clear_Skill_DownCound,this.hideSkillList,this);
        EventManager.off(XGDY_GameEvents.Hide_Kill_Btn,this.hideKillBtn,this);

        EventManager.off(XGDY_GameEvents.Show_Special_Item_Tip,this.showSpecialItemTip,this);
        EventManager.off(XGDY_GameEvents.Update_Special_Item_Tip,this.updateSpecialItemTip,this);
        EventManager.off(XGDY_GameEvents.Hide_Special_Item_Tip,this.hideSpecialItemTip,this);
        EventManager.off(XGDY_GameEvents.UI_Delete_Angler_Skill_Item,this.deleteAnglerSkillItems,this);

        EventManager.off(XGDY_GameEvents.UI_Hide_UIItem_Fishing,this.hideFishingUIItems,this);
        EventManager.off(XGDY_GameEvents.UI_Show_UIItem_Fishing,this.showFishingUIItems,this);
        EventManager.off(XGDY_GameEvents.UI_Update_SpecialItemPanel,this.updateSpecialItemPanel,this);


    }

    

    protected onDestroy(): void {
        this.removeListener();
    }

}


