import { _decorator, Animation, Component, EventKeyboard, EventTouch, instantiate, KeyCode, Label, Node, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_AnglerJsonData, DH_DataManager, DH_FishingRodJsonData, DH_SkillJsonData } from '../Manager/DH_DataManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { DH_SkillDamageParams, DH_SkillId } from '../Common/DH_ISkillParams';
import { DH_SkillManager } from '../Manager/DH_SkillManager';
import { DH_GameManager } from '../Manager/DH_GameManager';
import { DH_LoadManager } from '../Manager/DH_LoadManager';
import { DH_AudioManager } from '../Manager/DH_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('DH_GameUI')
export class DH_GameUI extends Component {

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
    }

    update(deltaTime: number) {
        if (this.keyboardDir.length() > 0) {
            // console.log(1111);
            // 如果有键盘输入，则使用键盘方向
            this._dir = this.keyboardDir.clone().normalize();
            EventManager.Scene.emit(DH_GameEvents.Player_Move, this._dir.multiplyScalar(80));
        }

        if(DH_DataManager.Instance.dynamicData.isFishHooking){
            this.updateHpLate(deltaTime);
            this.updateWheel(deltaTime);
        }

        if(this.skillCdList.length>0){
            this.updateSkillCd(deltaTime);
        }
    }
    
    PlayerTouchStart() {
        if(!DH_DataManager.Instance.dynamicData.isGameStart ) return;
        DH_DataManager.Instance.dynamicData.isMove = true;
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
        if(!DH_DataManager.Instance.dynamicData.isGameStart ) return;
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

        DH_DataManager.Instance.dynamicData.moveDir = delta;
    }
    
    PlayerTouchEnd() {
        if(!DH_DataManager.Instance.dynamicData.isGameStart ) return;
        var joy = this.joyBase.children[0];
        joy.setPosition(Vec3.ZERO);
        DH_DataManager.Instance.dynamicData.isMove = false;
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
        EventManager.Scene.emit(DH_GameEvents.Player_Stop, this._dir);
    }


    private _dir: Vec3 = Vec3.ZERO;
    onTouchStart(event: EventTouch) {
        if(!DH_DataManager.Instance.dynamicData.isGameStart ) return;
         if(!DH_DataManager.Instance.dynamicData.isGameStart ) return;
        
        var joy = this.joyBase.children[0];

        let touchPos = v3(event.getUILocation().x, event.getUILocation().y);

        joy.worldPosition = touchPos;

        let distance = touchPos.clone().subtract(this.joyBase.worldPosition);

        let maxLength = this.joyBase.getComponent(UITransform).width / 2;

        this._dir = distance.clone().normalize();

        DH_DataManager.Instance.dynamicData.moveDir = this._dir.clone();

        DH_DataManager.Instance.dynamicData.isMove = true;
        EventManager.Scene.emit(DH_GameEvents.Player_Move, this._dir);
    }

    onTouchMove(event: EventTouch) {
        if(!DH_DataManager.Instance.dynamicData.isGameStart ) return;
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

        DH_DataManager.Instance.dynamicData.moveDir = this._dir.clone();
        DH_DataManager.Instance.dynamicData.isMove = true;

        EventManager.Scene.emit(DH_GameEvents.Player_Move, this._dir);
    }

    onTouchEnd(event: EventTouch) {
        if(!DH_DataManager.Instance.dynamicData.isGameStart ) return;
        var joy = this.joyBase.children[0];
        joy.worldPosition = this.joyBase.worldPosition;
        DH_DataManager.Instance.dynamicData.moveDir = null;
        DH_DataManager.Instance.dynamicData.isMove = false;
        EventManager.Scene.emit(DH_GameEvents.Player_Stop, this._dir);
    }


    onBtnCastRodClick(){
        if(DH_DataManager.Instance.dynamicData.isStopInteract)return;
        if(DH_DataManager.Instance.dynamicData.isFallingIntoWater)return;
        if(DH_DataManager.Instance.dynamicData.isFishing)return;
        if(DH_DataManager.Instance.goToFishing()){
            DH_DataManager.Instance.dynamicData.isStopInteract = true;
            this.btnCastRod.active = false;
            this.btnReelRod.active = true;
            this.btnPullLine.active = false;
            this.btnKill.active = false;
            this.isPulling = false;
        }
    }

    onBtnReelRodClick(){
        if(DH_DataManager.Instance.dynamicData.isStopInteract)return;
        if(!DH_DataManager.Instance.dynamicData.isFishing)return;
        if(DH_DataManager.Instance.endFishing()){
            DH_DataManager.Instance.dynamicData.isStopInteract = true;
            this.btnCastRod.active = true;
            this.btnReelRod.active = false;
            this.btnPullLine.active = false;
            this.btnKill.active = false;
            this.isPulling = false;
        }
    }

    onKill(){
        if(!DH_DataManager.Instance.dynamicData.isFishing)return;
        if(DH_DataManager.Instance.endFishing()){
            DH_DataManager.Instance.dynamicData.isStopInteract = true;
             DH_AudioManager.getInstance().playMusic("bgm");
            this.btnCastRod.active = true;
            this.btnReelRod.active = false;
            this.btnPullLine.active = false;
            this.btnKill.active = false;
            this.isPulling = false;
            if(DH_DataManager.Instance.dynamicData.usingSkillAnglerIds.length){
                DH_DataManager.Instance.dynamicData.isNeedIgnoreSkillAnimEndSkills = [...DH_DataManager.Instance.dynamicData.usingSkillAnglerIds];
            }
            this.hideSkillList();
           
        }
    }



    onBtnKillClick(){
        if(DH_DataManager.Instance.dynamicData.isStopInteract)return;
        DH_DataManager.Instance.dynamicData.isStopInteract = true;
        EventManager.Scene.emit(DH_GameEvents.Kill) 
        EventManager.Scene.emit(DH_GameEvents.Destory_Fish,DH_DataManager.Instance.dynamicData.currentFishId) 
        EventManager.Scene.emit(DH_GameEvents.Clear_Skill);
    }


    onBtnPullLineTouchStart(){
        if(!DH_DataManager.Instance.dynamicData.isFishHooking)return;
        DH_SkillManager.Instance.startPullLine();
        this.isPulling = true;
    }

    onBtnPullLineTouchMove(){
        // DH_SkillDamageManager.Instance.stopPullLine();
    }

    onBtnPullLineTouchEnd(){
        DH_SkillManager.Instance.stopPullLine();
        this.isPulling = false;
        // let anim = this.rollNode.getComponent(Animation)
        // anim.clips[0].speed = -1;
        // anim.play();
        // this.isPulling = false;
    }

   

    showCastRodBtn(){
        // if(!DH_DataManager.Instance.dynamicData.isFishing)return;
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
        Object.keys(DH_DataManager.Instance.saveData.fishingRodData).forEach(key=>{
            if(!isFound){
                if(DH_DataManager.Instance.saveData.fishingRodData[key].isEquipped){
                    isFound = true;
                    let rodData = DH_DataManager.Instance.getItemDataById(key) as DH_FishingRodJsonData;  // 获取鱼的数量
                    rodLinLangth =  rodData.鱼线长度;
                }
            }
        })
        this.spLineProgress.fillRange = DH_DataManager.Instance.dynamicData.lineLength/rodLinLangth;
        this.lblFishLineLength.string = DH_DataManager.Instance.dynamicData.lineLength + "m";
    }

    updateHp(){
        this.lblHpProgress.string = DH_DataManager.Instance.dynamicData.currentFishHp.toFixed(0) + "/" + DH_DataManager.Instance.dynamicData.fishMaxHp;
        let hpProgress = DH_DataManager.Instance.dynamicData.currentFishHp/DH_DataManager.Instance.dynamicData.fishMaxHp;
        this.spHpProgress.fillRange = hpProgress;
        let lateWidth = this.spHpLateProgress.node.getComponent(UITransform).width*this.spHpLateProgress.fillRange;
        let width = this.spHpProgress.node.getComponent(UITransform).width*this.spHpProgress.fillRange;
        DH_DataManager.Instance.dynamicData.lateDamageSpeed = (lateWidth - width)/0.3;
    }


    updateHpLate(dt){
        let hpProgress = DH_DataManager.Instance.dynamicData.currentFishHp/DH_DataManager.Instance.dynamicData.fishMaxHp;
        if(hpProgress < this.spHpLateProgress.fillRange){
            let width = this.spHpLateProgress.node.getComponent(UITransform).width;
            let rangeSpeed = DH_DataManager.Instance.dynamicData.lateDamageSpeed/width;
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
        let fishData = DH_DataManager.Instance.dynamicData.currentFishData;
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
        let interactEntity = DH_DataManager.Instance.dynamicData.interactionTarget;
        
        let targetType = interactEntity.name.split("_")[0];
        switch(targetType){
            case "NPC":
                DH_DataManager.Instance.dynamicData.currentNpcId = interactEntity.name;
                EventManager.Scene.emit(DH_GameEvents.UI_SHOW_DIALOUGE_PANEL);
                break;
            case "tractor":
                DH_GameManager.Instance.exitGame();
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
        DH_DataManager.Instance.dynamicData.usingSkillAnglerIds = [];
    }

    showSkillList(){
        this.skillContainer.children.forEach((skillItem,idx)=>{
            if(idx == 0){
                skillItem.active = false;
                return;
            } 
            skillItem.destroy();
        })
        let anglerIds = DH_DataManager.Instance.saveData.gameData.currentAnglerIds;
        let skillItem = this.skillContainer.children[0];
        let skillIds = [];
        anglerIds.forEach((anglerId)=>{
            let angerSaveData = DH_DataManager.Instance.saveData.anglerData[anglerId];
            let level = angerSaveData.level;
            let anglerData = DH_DataManager.Instance.getItemDataById(anglerId) as DH_AnglerJsonData;
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
            let angerSaveData = DH_DataManager.Instance.saveData.anglerData[anglerId];
            let unlockedSkillIds = [];

            let level = angerSaveData.level;
            let anglerData = DH_DataManager.Instance.getItemDataById(anglerId) as DH_AnglerJsonData;
            Object.keys(anglerData.技能列表).forEach((key)=>{
                let skillData = anglerData.技能列表[key];
                if(skillData <= level){
                    unlockedSkillIds.push(key);
                }
            })

            unlockedSkillIds.forEach((skillId)=>{
                DH_LoadManager.Instance.getSkillIconById(skillId,(sp)=>{
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

                            let skillData = DH_DataManager.Instance.getItemDataById(skillId) as DH_SkillJsonData;
                            let skillLevel =  DH_DataManager.Instance.saveData.skillData[skillId];
                            let levelData = skillData.等级配置[skillLevel];
                            lblHealthCost.string = "体力："+levelData.体力消耗;
                            lblkillName.string = skillData.名称;
                            spSkill.spriteFrame =  sps[skillIds.indexOf(skillId)].sp;
                            // spSkill.node.getComponent(UITransform).width = spSkill.spriteFrame.width;
                            // spSkill.node.getComponent(UITransform).height = spSkill.spriteFrame.height;
                            let scale = 150/spSkill.spriteFrame.width;
                            spSkill.node.setScale(0.5,0.5);
                            mask.active = false;
                            lblDownCount.string = "";


                            let angrlLevel  = angerSaveData.level;
                            let anglerData = DH_DataManager.Instance.getItemDataById(anglerId) as DH_AnglerJsonData;
                            let anglerAdd = anglerData.等级配置["1"].钓法加成+angrlLevel*5;


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
                                持续时间:DH_DataManager.Instance.dynamicData.skillTimeData[skillId],
                                体力消耗:levelData.体力消耗,
                                拉力:levelData.拉力 * anglerAdd/100,
                                总伤:levelData.总伤 * anglerAdd/100,
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
        skillId:DH_SkillId,
        anglerId:string,
        newSkillItem:Node
    ){

        if(DH_DataManager.Instance.dynamicData.isStopInteract)return;
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
     if(DH_DataManager.Instance.dynamicData.usingSkillAnglerIds.indexOf(anglerId)==-1){
        if(DH_DataManager.Instance.dynamicData.currentHealth < skillData.体力消耗){
            this.showTip("体力不足");
            return;
        }
        let cdParma : {skillId:string,cd:number,skillItem:Node} = {
            skillId:skillId,
            cd:skillData.冷却时间,
            skillItem:newSkillItem
        }
        this.skillCdList.push(cdParma);
        this.usingSkillIds.push(skillId);
        cdParma.skillItem.getChildByName("mask").active = true; 

        //体力消耗
        DH_DataManager.Instance.dynamicData.currentHealth -= skillData.体力消耗;
        EventManager.Scene.emit(DH_GameEvents.UI_Update_Health);

        //创建技能
        DH_SkillManager.Instance.createSkill(skillData);
        DH_DataManager.Instance.dynamicData.usingSkillAnglerIds.push(anglerId);

        //玩家动画
        EventManager.Scene.emit(DH_GameEvents.Use_Skill,{anglerId:anglerId,skillId:skillId});
        
        //相机操作
        let idx = DH_DataManager.Instance.saveData.gameData.currentAnglerIds.indexOf(anglerId);
        DH_DataManager.Instance.dynamicData.cameraTarget = DH_DataManager.Instance.dynamicData.currentAnglerNodes[idx];
        EventManager.Scene.emit(DH_GameEvents.Update_Camera_Tartget,4.5,false);
        this.cameraTargets.push(anglerId);
        this.scheduleOnce(()=>{
            this.cameraTargets.splice(this.cameraTargets.indexOf(anglerId),1);
            if(this.cameraTargets.length == 0 && DH_DataManager.Instance.dynamicData.isFishHooking){
                DH_DataManager.Instance.dynamicData.cameraTarget = DH_DataManager.Instance.dynamicData.hookPoint;
                EventManager.Scene.emit(DH_GameEvents.Update_Camera_Tartget,4.5);
            }
        },0.7)
    }
     else{
        createTip();
     }
    }

    updateSkillCd(dt){
        this.skillCdList.forEach((cdParma)=>{
            cdParma.cd -= dt;
            cdParma.skillItem.getChildByName("lblDownCount").getComponent(Label).string = Math.floor(cdParma.cd).toString();

            if(cdParma.cd <= 0){
                    cdParma.skillItem.getChildByName("lblDownCount").getComponent(Label).string = "";
                cdParma.cd = 0;
                cdParma.skillItem.getChildByName("mask").active = false; 
                while(this.usingSkillIds.indexOf(cdParma.skillId) != -1){
                    this.usingSkillIds.splice(this.usingSkillIds.indexOf(cdParma.skillId),1);
                }

                this.skillCdList.splice(this.skillCdList.indexOf(cdParma),1);
            } 
        })
        

    }
    
    addListener(){
        this.isAddLinstener = true;
        // EventManager.on(DH_GameEvents.Show_Tip,this.showTip,this);
        EventManager.on(DH_GameEvents.Show_CastRod_Btn,this.showCastRodBtn,this);
        EventManager.on(DH_GameEvents.UI_Update_Line_length,this.updateFishLineLength,this)
        EventManager.on(DH_GameEvents.UI_Update_Hp,this.updateHp,this)
        EventManager.on(DH_GameEvents.UI_Update_Fish_Data,this.updateFishData,this)
        EventManager.on(DH_GameEvents.FishHooking, this.showPullLineBtn, this);
        EventManager.on(DH_GameEvents.UI_Show_Btn_Interact,this.showInteractBtn,this);
        EventManager.on(DH_GameEvents.UI_Hide_Btn_Interact,this.hideInteractBtn,this);
        EventManager.on(DH_GameEvents.UI_Hide_MoveBtn,this.UI_Hide_MoveBtn,this);
        EventManager.on(DH_GameEvents.UI_Show_MoveBtn,this.UI_Show_MoveBtn,this);
        EventManager.on(DH_GameEvents.Kill,this.onKill,this);
        EventManager.on(DH_GameEvents.Clear_Skill_DownCound,this.hideSkillList,this);
        EventManager.on(DH_GameEvents.Hide_Kill_Btn,this.hideKillBtn,this);

        
        


        

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


    }
    removeListener(){
        // EventManager.off(DH_GameEvents.Show_Tip,this.showTip,this);
        EventManager.off(DH_GameEvents.Show_CastRod_Btn,this.showCastRodBtn,this);
        EventManager.off(DH_GameEvents.UI_Update_Line_length,this.updateFishLineLength,this)
        EventManager.off(DH_GameEvents.UI_Update_Hp,this.updateHp,this)
        EventManager.off(DH_GameEvents.UI_Update_Fish_Data,this.updateFishData,this)
        EventManager.off(DH_GameEvents.FishHooking, this.showPullLineBtn, this);
        EventManager.off(DH_GameEvents.UI_Show_Btn_Interact,this.showInteractBtn,this);
        EventManager.off(DH_GameEvents.UI_Hide_Btn_Interact,this.hideInteractBtn,this);
        EventManager.off(DH_GameEvents.UI_Hide_MoveBtn,this.UI_Hide_MoveBtn,this);
        EventManager.off(DH_GameEvents.UI_Show_MoveBtn,this.UI_Show_MoveBtn,this);
        EventManager.off(DH_GameEvents.Kill,this.onKill,this);
        EventManager.off(DH_GameEvents.Clear_Skill_DownCound,this.hideSkillList,this);
        EventManager.off(DH_GameEvents.Hide_Kill_Btn,this.hideKillBtn,this);


    }

    

    protected onDestroy(): void {
        this.removeListener();
    }

}


