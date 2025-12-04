import { _decorator, assetManager, clamp, Color, Component, director, EventTouch, instantiate, Label, Node, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec2, Vec3 } from 'cc';
import { UIManager, Panel } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { LBL_DataManager } from './LBL_DataManager';
import { LBL_PlayerController } from './LBL_PlayerController';
import { LBL_PointData } from './LBL_PointData';
import { LBL_Const } from './LBL_Const';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('LBL_GameUI')
export class LBL_GameUI extends Component {

    private static instance: LBL_GameUI;

    public static get Instance(): LBL_GameUI {
        return this.instance;
    }

    // @property(JJTW_ScanSysem)
    // scanSysem: JJTW_ScanSysem;

    @property(Node)
    btnReturn2: Node;

    @property(Node)
    touchPanel: Node;

    @property(Node)
    joyBase: Node;

    @property(Node)
    playerNode: Node;


    @property(Node)
    btnInteract: Node;

    @property(Node)
    pointTip: Node;

    @property(Node)
    comicPanel:Node;

    @property(Node)
    homePanel: Node;

    @property(Node)
    levelSelectPanel: Node;

    @property(Node)
    levelSelectPanelCloseBtn: Node;

    @property(Node)
    operatePanel: Node = null;

    @property(Node)
    lockedTip: Node = null;

    // @property(Node)
    // btnTipClose: Node;

    @property(Node)
    bagPanel: Node;

  @property(Node)
    darkMask:Node;

    // @property(SpriteFrame)
    // compassSps: SpriteFrame[]=[];



    @property(Node)
    beginningTipPanel: Node;

    @property(Node)
    btnBeginningTipClose: Node;

    @property(Node)
    deadPanel: Node;

    @property(Node)
    winPanel: Node;

    @property(Node)
    btnReturn:Node;

    
    @property(LBL_PlayerController)
    playerCtrl:LBL_PlayerController = null;

    beginningTipShowTime:number = 1;

    lightTime = 60;

    lightPassTime = 0;

    
    scanTime = 10;

    scanPassTime = 0;


    pastPos: Vec2 = null;
    // delta: Vec3;
    // treaNames = ["煤炭", "绿宝石", "金块", "紫宝石", "红宝石", "钻石"];

    protected onLoad(): void {
        LBL_GameUI.instance = this;
    }

    start() {
        this.hideAllTip();
        // this.keyDoorTipPanel.active = false;
        // this.AdPanel.active = false;
        // this.exitDoorTipPanel.active = false;
        // this.beginningTipPanel.active = true;

        LBL_DataManager.Instance.isGameStart = false;
        this.showHomePanel()

        this.touchPanel.on(Node.EventType.TOUCH_START, this.CameraTouchStart, this);
        this.touchPanel.on(Node.EventType.TOUCH_MOVE, this.CameraTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_START, this.PlayerTouchStart, this);
        this.joyBase.on(Node.EventType.TOUCH_MOVE, this.PlayerTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_END, this.PlayerTouchEnd, this);
        this.joyBase.on(Node.EventType.TOUCH_CANCEL, this.PlayerTouchEnd, this);
        this.btnInteract.on("click", this.onInteractClicked, this);

        this.winPanel.getChildByName("btnBack").on("click",this.onBtnBackClick,this)
        this.winPanel.getChildByName("btnReset").on("click",this.onBtnResetClick,this)
        this.deadPanel.getChildByName("btnBack").on("click",this.onBtnBackClick,this)
        this.deadPanel.getChildByName("btnReset").on("click",this.onBtnResetClick,this)
        this.btnReturn.on("click",this.onBtnReturnClick,this)
        this.btnReturn2.on("click",this.onBtnReturn2Click,this)
        // ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.more);
        // LBL_DataManager.Instance.isGameStart = true;

        // ProjectEventManager.emit(ProjectEvent.弹出窗口, "狼伴侣");

        this.onListenEvent();
    }

    update(deltaTime: number) {
        // if(LBL_DataManager.Instance.isGameStart){
        //     this.beginningTipShowTime -= deltaTime;
        //     if(this.beginningTipShowTime <= 0){
        //         this.beginningTipPanel.active = true;
        //         this.btnBeginningTipClose.on("click", this.onBeginningTipCloseClicked, this);
        //         LBL_DataManager.Instance.isGameStart = false;
        //     }
        // }

        if(LBL_DataManager.Instance.isPlayerDead) return;
        // if(LBL_DataManager.Instance.isStartToLightDownCount){
        //     if(LBL_DataManager.Instance.isLightCanOpen && LBL_DataManager.Instance.isFlashlight){

        //         this.lightPassTime += deltaTime;
        //         this.btnFlashlight.getComponentInChildren(Sprite).fillRange = this.lightPassTime / this.lightTime;
        //         // console.log("lightPassTime",this.lightPassTime);
    
        //         // console.log("fillRange",this.btnFlashlight.getComponentInChildren(Sprite).fillRange);
        //         if(this.lightPassTime >= this.lightTime){
        //             LBL_DataManager.Instance.isFlashlight = false;
        //             this.lightPassTime = 0;
        //             LBL_DataManager.Instance.isLightCanOpen = false;
        //             this.btnFlashlight.getComponentInChildren(Sprite).fillRange = 1;
        //             // this.closeFlashlight();
        //         }
        //         // else {
        //         //     this.openFlashlight();
        //         // }
        //     }
        // }

   
            // if(LBL_DataManager.Instance.isScaning){
            //     if(!this.btnScan.getComponentInChildren(Sprite).node.active){
            //         this.btnScan.getComponentInChildren(Sprite).node.active = true;                    // this.closeFlashlight();
            //         this.btnScan.getComponentInChildren(Sprite).fillRange = 0;
            //     }
            //     this.scanPassTime += deltaTime;
            //     this.btnScan.getComponentInChildren(Sprite).fillRange = -(this.scanTime - this.scanPassTime) / this.scanTime;
            //     // console.log("lightPassTime",this.lightPassTime);
    
            //     // console.log("fillRange",this.btnFlashlight.getComponentInChildren(Sprite).fillRange);
            //     if(this.scanPassTime >= this.scanTime){
            //         LBL_DataManager.Instance.isScaning = false;
            //         this.scanPassTime = 0;
            //         this.btnScan.getComponentInChildren(Sprite).fillRange = 0;
            //         this.btnScan.getComponentInChildren(Sprite).node.active = false;                    // this.closeFlashlight();
            //     }
            //     // else {
            //     //     this.openFlashlight();
            //     // }
            // }
        
       
        // else{
        //     this.closeFlashlight();
        // }
    }

    CameraTouchStart(event: EventTouch) {
        this.pastPos = event.getUILocation();
    }

    CameraTouchMove(event: EventTouch) {
        if(LBL_DataManager.Instance.isPlayerDead) return;
        var delta = event.getUILocation().subtract(this.pastPos).multiplyScalar(0.1);
        var euler = v3(this.playerNode.children[0].eulerAngles);
        euler.add3f(delta.y, -delta.x, 0);
        euler.x = clamp(euler.x, -50, 30);
        this.playerNode.children[0].setRotationFromEuler(euler);
        this.pastPos = event.getUILocation();
    }

    PlayerTouchStart() {
        LBL_DataManager.Instance.isMove = true;
        if(LBL_DataManager.Instance.isGuidanding){
            if(LBL_DataManager.Instance.currentStepIndex == 0){
                EventManager.Scene.emit("JJTW_JOYSTICK_Start");
            }
            else if(LBL_DataManager.Instance.currentStepIndex == 2){
                EventManager.Scene.emit("JJTW_Scream_Start");
            }
        }
    }

    PlayerTouchMove(event: EventTouch) {
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

        LBL_DataManager.Instance.delta = delta;
    }
    
    PlayerTouchEnd() {
        var joy = this.joyBase.children[0];
        joy.setPosition(Vec3.ZERO);
        LBL_DataManager.Instance.isMove = false;
        if(LBL_DataManager.Instance.isGuidanding){
            if(LBL_DataManager.Instance.currentStepIndex == 0){
                EventManager.Scene.emit("JJTW_JOYSTICK_End");
            }
            // else if(LBL_DataManager.Instance.currentStepIndex == 2){
            //     if(LBL_DataManager.Instance.isScream){
            //         EventManager.Scene.emit("JJTW_Scream_End");
            //     }
            // }
        }
    }


    // ScreamTouchStart(){
    //     LBL_DataManager.Instance.isScream = true;
    //     if(LBL_DataManager.Instance.isGuidanding && LBL_DataManager.Instance.currentStepIndex == 2){
    //         EventManager.Scene.emit("JJTW_Scream_Start");
    //     }
    // }

    // ScreamTouchEnd(){
    //     LBL_DataManager.Instance.isScream = false; 
    // }
    

    // onFlashlightClicked(){
    //     if(LBL_DataManager.Instance.isLightCanOpen){
    //         LBL_DataManager.Instance.isFlashlight = !LBL_DataManager.Instance.isFlashlight;
    //     }
    //     else{
    //         this.showAdTip()
    //     }
    //     // LBL_DataManager.Instance.isFlashlight = !LBL_DataManager.Instance.isFlashlight;
    //     // this.btnFlashlight.getComponent(Sprite).spriteFrame = LBL_DataManager.Instance.isFlashlight ? LBL_DataManager.Instance.spriteFlashlightOn : LBL_DataManager.Instance.spriteFlashlightOff; 
    // }

    onInteractClicked(){
        this.playerCtrl.interact();
        // LBL_PlayerController.Instance.interact();
    }

    showHomePanel(){
        this.homePanel.active = true;
        this.homePanel.getChildByName("btnStart").on("click",this.hideHomePanel,this);
    }

    hideHomePanel(){
        this.homePanel.getChildByName("btnStart").off("click",this.hideHomePanel,this);
        this.homePanel.active = false;
        this.showLevelSelectPanel();
    }

    showLevelSelectPanel(){
        let levelContain = this.levelSelectPanel.getChildByName("levelContain");
         let passLevels = LBL_DataManager.Instance.passLevels;
         let levelData = LBL_DataManager.Instance.levelData;
         this.levelSelectPanelCloseBtn.on("click",this.backToMain,this);
        levelContain.children.forEach((item,index)=>{
             item.getChildByName("bg").getComponent(Sprite).color = new Color("FFFFFF")
           if(passLevels.indexOf(index + 1) !== -1 ){
                item.getChildByName("ending").active = true;
                item.getChildByName("title").getComponent(Label).string = levelData[index+1].endingTitle;
                item.getChildByName("title").active = true;
            }
            else{
                item.getChildByName("ending").active = false;
                // item.getChildByName("title").active = false;
            }

            let onLevelItemClick = ()=>{
                 levelContain.children.forEach((item,index)=>{
                    item.getChildByName("bg").getComponent(Sprite).color = new Color("FFFFFF")
                 })
                item.getChildByName("bg").getComponent(Sprite).color = new Color("FFEB07")
                if(index >= 4){
                    this.showLockedTip("请先通过前4关");
                }
                else{

                    let handle = ()=>{
                        item.off("click",onLevelItemClick,this);
                        LBL_DataManager.Instance.currentPoints.level = index + 1;
                        console.log("当前关卡"+(index + 1));
                        LBL_DataManager.Instance.currentPoints.round = 1;
                        this.showOperatePanel();
                        EventManager.Scene.emit(LBL_Const.EventName.StartGame);
                        // LBL_GameManager.getInstance().startGame();
                        this.hideLevelSelectPanel();
                    }
                    if(index == 0){
                        handle()
                    }
                    else{
                        if(LBL_DataManager.Instance.passLevels.includes(index)){
                            handle();
                        }
                        else{
                            this.showLockedTip(`请先通过前一关`);
                        }
                    }

                }
            }
            item.on("click",onLevelItemClick,this);
        })

        this.levelSelectPanel.active = true;
    }

    backToMain(){
        this.hideLevelSelectPanel();
        this.showHomePanel();
    }


    showLockedTip(string:string){
        this.lockedTip.active = true;
        this.lockedTip.getChildByName("contant").getComponent(Label).string = string;
        this.lockedTip.getChildByName("mask").on("click",this.hideLockedTip,this);
    }

    hideLockedTip(){
        this.lockedTip.getChildByName("mask").off("click",this.hideLockedTip,this);
        this.lockedTip.active = false;
    }

    hideLevelSelectPanel(){
        this.levelSelectPanelCloseBtn.off("click",this.hideLevelSelectPanel,this);
        this.levelSelectPanel.active = false;
    }

    showOperatePanel(){
        this.operatePanel.active = true;
    }
    hideOperatePanel(){
        this.operatePanel.active = false;
    }

    showPointTip(pointData:LBL_PointData){
        let bg = this.pointTip.getChildByName("bg");
        bg.getChildByName("icon").active = false;
        let handle = ()=>{
            bg.getChildByName("title").getComponent(Label).string = pointData.title;
            bg.getChildByName("tip").getComponent(Label).string = pointData.tipcontent;

            // 初始缩放为0
            bg.setScale(0, 0);
            this.pointTip.active = true;
                    
            // 添加缩放动画
            tween(bg)
                .to(0.3, { scale: Vec3.ONE }, { easing: 'backOut' })
                .start();

            this.pointTip.getChildByName("mask").on("click",this.hidePointTip,this)
        }
        if(pointData.iconId){
            LBL_DataManager.Instance.isGetIcon = true;
            const fullPath = "Sprites/item/" + pointData.iconId + "/spriteFrame";
            BundleManager.GetBundle('40_LBL_Bundle').load(fullPath, SpriteFrame, (err, spriteFrame) => {
                    if (err) {
                        return console.error(err);
                    }

                    bg.getChildByName("icon").getComponent(Sprite).spriteFrame = spriteFrame;
                    bg.getChildByName("icon").active = true;
                    handle();
                })
        }
        else{
            handle();
        }
          
    }

    hidePointTip(){
        this.updateBag();
        this.pointTip.getChildByName("mask").off("click",this.hidePointTip,this)
        this.pointTip.active = false;
    }



    // onScanClicked(){
    //     if(!LBL_DataManager.Instance.isScaning){
    //         LBL_DataManager.Instance.setTargetPos();
    //         if(LBL_DataManager.Instance.currentTargetPos){
    //             this.scanSysem.showArrow();
    //             LBL_DataManager.Instance.isScaning  = true;
    //         }
    //         else{
    //             this.showToExitPanel();
    //         }
    //     }
    //     else{
    //         this.showWaitTip();
    //     }
    // }

    // showAdTip(){
    //     this.hideAllTip();
    //     this.AdPanel.active = true;
    //     this.btnWatchAd.on("click",this.onWatchAdClicked,this);
    //     this.btnAdTipClose.on("click",this.hideAdTip,this);
    // }

    // hideAdTip(){
    //     this.AdPanel.active = false;
    //     this.btnWatchAd.off("click",this.onWatchAdClicked,this);
    //     this.btnAdTipClose.off("click",this.hideAdTip,this);
    // }

    // onWatchAdClicked(){
    //   // 这里应该调用视频广告接口
    //     Banner.Instance.ShowVideoAd(()=>{
    //         // 假设视频播放完成
    //         LBL_DataManager.Instance.isLightCanOpen = true;
    //         LBL_DataManager.Instance.isFlashlight = true;
    //         this.hideAdTip();
    //     });
    // }


    clearUI(){
        this.pointTip.active = false;
        this.clearBag();
    }

    clearBag(){
        this.bagPanel.getChildByName("Layout").children.forEach((item)=>{
            item.getChildByName("icon").active = false;
        })
    }

    updateBag(){

        if(!LBL_DataManager.Instance.isGetIcon){
            return;
        }
        LBL_DataManager.Instance.isGetIcon = false;

        let iconIds = LBL_DataManager.Instance.getCurrentIconIds();
        iconIds.forEach((iconId,index)=>{
            let iconNode = this.bagPanel.getChildByName("Layout").children[index];
            const fullPath = "Sprites/item/" + iconId + "/spriteFrame";
            BundleManager.GetBundle('40_LBL_Bundle').load(fullPath, SpriteFrame, (err, spriteFrame) => {
                    if (err) {
                        return console.error(err);
                    }

                    iconNode.children[0].getComponent(Sprite).spriteFrame = spriteFrame;
                    iconNode.children[0].active = true;
                })
            });
}

    // updateNPCUI(){
    //     LBL_DataManager.Instance.liveNPCData.forEach((item)=>{
    //         let npc = this.npcContainer.children[item.id];
    //         if(item.isDead){
    //             npc.getChildByName("dead").active = true;
    //         }
    //         else{
    //             npc.getChildByName("dead").active = false;
    //         }
    //     })
    // }

    // showKeyDoorTip(){
    //     this.hideAllTip();
    //     this.keyDoorTipPanel.active = true;
    //     this.unschedule(this.CloseKeyDoorTip);
    //     this.scheduleOnce(this.CloseKeyDoorTip, 4);
    // }

    // CloseKeyDoorTip(){
    //     this.keyDoorTipPanel.active = false;
    // }

    // showExitDoorTip(){
    //     this.hideAllTip();
    //     this.exitDoorTipPanel.active = true;         
    //     this.unschedule(this.CloseExitDoorTip);
    //     this.scheduleOnce(this.CloseExitDoorTip, 4);
    // }

    // CloseExitDoorTip(){
    //     this.exitDoorTipPanel.active = false;
    // }

    onBeginningTipCloseClicked(){
        this.beginningTipPanel.active = false;
        this.btnBeginningTipClose.off("click", this.onBeginningTipCloseClicked, this);
    }


    showWinAnim(){
        let uiOpacity = this.winPanel.getComponent(UIOpacity);
        uiOpacity.opacity = 0;
        this.winPanel.active = true;
        this.deadPanel.active = false;

        // let labelNode1 = this.winPanel.getChildByName("Label_1");
        // let lblUIOpacity = labelNode1.getComponent(UIOpacity);
        // lblUIOpacity.opacity = 0;
        // labelNode1.active = false;

        // let labelNode2 = this.winPanel.getChildByName("Label_2");
        // let lblUIOpacity2 = labelNode1.getComponent(UIOpacity);
        // lblUIOpacity2.opacity = 0;
        // labelNode2.active = false;

        tween(uiOpacity)
        .to(1,{opacity:255})
        .call(()=>{
            //  ProjectEventManager.emit(ProjectEvent.游戏结束, "尖叫逃亡");
            // labelNode1.active = true;
            // tween(lblUIOpacity)
            // .to(1,{opacity:255})
            // .delay(1)
            // .call(()=>{
            //     if(LBL_DataManager.Instance.fileData.isGot){
            //         tween(lblUIOpacity2)
            //         .to(1,{opacity:255})
            //         .delay(1)
            //         .call(()=>{
            //             tween(lblUIOpacity)
            //             .to(1,{opacity:0})
            //             .start()

            //            tween(lblUIOpacity2)
            //            .to(1,{opacity:0})
            //             .call(()=>{
            //                 UIManager.ShowPanel(Panel.LoadingPanel, "JJTW_GameScene");
            //             })
            //             .start()
            //         })
            //         .start()
            //     }
            //     else{
            //         tween(lblUIOpacity)
            //        .to(1,{opacity:0})
            //        .call(()=>{
            //             UIManager.ShowPanel(Panel.LoadingPanel, "JJTW_GameScene");
            //         })
            //         .start()
            //     }
            // })
            // .start();
        })
        .start();
    }

    showDeadAnim(){
        let uiOpacity = this.deadPanel.getComponent(UIOpacity);
        uiOpacity.opacity = 355;
        this.deadPanel.active = true;
        this.winPanel.active = false;
        // let labelNode = this.deadPanel.getChildByName("Label");
        // let lblUIOpacity = labelNode.getComponent(UIOpacity);
        // lblUIOpacity.opacity = 0;
        // labelNode.active = false;
        // tween(uiOpacity)
        // .to(1,{opacity:255})
        // .call(()=>{
             ProjectEventManager.emit(ProjectEvent.游戏结束, "狼伴侣");
            // labelNode.active = true;
            // tween(lblUIOpacity)
            // .to(1,{opacity:255})
            // .delay(1)
            // .to(1,{opacity:0})
            // .call(()=>{
            //     director.loadScene("JJTW_GameScene");
            // })
            // .start();
        // })
        // .start();
    }

    onBtnBackClick(){
        // ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
        //     UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
        //         ProjectEventManager.emit(ProjectEvent.返回主页, "尖叫逃亡");
        //     })
        // });

        this.clearUI();
                    LBL_DataManager.Instance.initcurrentLevel();

        LBL_DataManager.Instance.setCurrentRoundNodes();
        this.showLevelSelectPanel();
        this.deadPanel.active = false;
    }

    onBtnResetClick(){
        // director.loadScene("JJTW_GameScene");
        this.clearUI();
        LBL_DataManager.Instance.initcurrentLevel();

        LBL_DataManager.Instance.setCurrentRoundNodes();
        EventManager.Scene.emit(LBL_Const.EventName.StartGame);

        // LBL_GameManager.getInstance().startGame();
        this.deadPanel.active = false;
    }


    // showToExitPanel(){
    //     this.hideAllTip();
    //     this.toExitPanel.active = true;
    //     this.unschedule(this.CloseToExitTip);
    //     this.scheduleOnce(this.CloseToExitTip, 3);
    // }

    // CloseToExitTip(){
    //     this.toExitPanel.active = false;
    // }

    // showWaitTip(){
    //     this.hideAllTip();
    //     this.waitTipPanel.active = true;
    //     this.unschedule(this.closeWaitTip); 
    //     this.scheduleOnce(this.closeWaitTip, 2);
    // }

    // closeWaitTip(){
    //     this.waitTipPanel.active = false;
    // }

    onBtnReturnClick(){
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                // LBL_DataManager.Instance.destroyInstance();
                ProjectEventManager.emit(ProjectEvent.返回主页, "狼伴侣");
            })
        });
    }

    onBtnReturn2Click(){
        EventManager.Scene.emit(LBL_Const.EventName.BackToSelete);

        // LBL_GameManager.getInstance().backToSelete();
    }

    hideAllTip(){
        // this.AdPanel.active = false;
        // this.keyDoorTipPanel.active = false;
        // this.toExitPanel.active = false;
        // this.waitTipPanel.active = false;
        // this.exitDoorTipPanel.active = false;
        this.clearBag();
        this.pointTip.active = false;
        this.beginningTipPanel.active = false;
        this.comicPanel.active = false;
        this.darkMask.active = false;

        this.homePanel.active = false;
        this.levelSelectPanel.active = false;
        this.hideLockedTip();
        this.deadPanel.active = false;
        this.winPanel.active = false;
    }
    // FlyTouchStart(event: EventTouch) {
    //     DiggingAHoleCV_PlayerController.Instance.isFly = true;
    // }

    // FlyTouchEnd(event: EventTouch) {
    //     DiggingAHoleCV_PlayerController.Instance.isFly = false;
    // }


    // Dig() {
    //     DiggingAHoleCV_PlayerController.Instance.Dig();
    // }

    // BackPack() {
    //     this.packPanel.active = true;
    // }

    // FullPack() {
    //     this.fullPack.active = true;
    //     this.unschedule(this.CloseFull);
    //     this.scheduleOnce(this.CloseFull, 2);
    // }

    // CloseFull() {
    //     this.fullPack.active = false;
    // }

    // GetTrea(type: number) {
    //     this.getTrea.active = true;
    //     this.getTrea.children[0].getComponent(Label).string = this.treaNames[type];
    //     this.unschedule(this.CloseGet);
    //     this.scheduleOnce(this.CloseGet, 2);
    // }

    // CloseGet() {
    //     this.getTrea.active = false;
    // }

    // Sell() {
    //     this.sellPanel.active = true;
    //     ProjectEventManager.emit(ProjectEvent.弹出窗口, "掘地求财方块版");
    // }

    // Upgrade() {
    //     this.upgradePanel.active = true;
    //     ProjectEventManager.emit(ProjectEvent.弹出窗口, "掘地求财方块版");
    // }

    // ShowElc() {
    //     this.elc.fillRange = DiggingAHoleCV_PlayerController.Instance.elc / (10 * (parseInt(localStorage.getItem("DAHCV_Elc")) + 1));
    // }

    // ShowNeedElc() {
    //     this.needElc.active = true;
    //     this.unschedule(this.CloseElc);
    //     this.scheduleOnce(this.CloseElc, 2);
    // }

    // CloseElc() {
    //     this.needElc.active = false;
    // }

    // Mode() {
    //     if (Banner.IsShowServerBundle) {
    //         UIManager.ShowPanel(Panel.MoreGamePanel, false);
    //     }
    //     else director.loadScene(GameManager.StartScene);
    //     ProjectEventManager.emit(ProjectEvent.弹出窗口, "掘地求财方块版");
    // }

    // Back() {
    //     // director.loadScene(GameManager.StartScene);
    //     // ProjectEventManager.emit(ProjectEvent.返回主页, "掘地求财方块版");
    //     ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
    //         UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
    //             ProjectEventManager.emit(ProjectEvent.返回主页, "掘地求财方块版");
    //         })
    //     });
    // }

    // ShowHome() {
    //     this.sell.active = true;
    //     this.upgrade.active = true;
    // }

    // CloseHome() {
    //     this.sell.active = false;
    //     this.upgrade.active = false;
    // }

    // onDestroy(){
    //     this.touchPanel.off(Node.EventType.TOUCH_START, this.CameraTouchStart, this);
    //     this.touchPanel.off(Node.EventType.TOUCH_MOVE, this.CameraTouchMove, this);
    //     this.joyBase.off(Node.EventType.TOUCH_START, this.PlayerTouchStart, this);
    //     this.joyBase.off(Node.EventType.TOUCH_MOVE, this.PlayerTouchMove, this);
    //     this.joyBase.off(Node.EventType.TOUCH_END, this.PlayerTouchEnd, this);
    //     this.joyBase.off(Node.EventType.TOUCH_CANCEL, this.PlayerTouchEnd, this);
    //     this.btnScream.off(Node.EventType.TOUCH_START, this.ScreamTouchStart, this);
    //     this.btnScream.off(Node.EventType.TOUCH_END, this.ScreamTouchEnd, this);
    //     this.btnScream.off(Node.EventType.TOUCH_CANCEL, this.ScreamTouchEnd, this);
    //     this.btnFlashlight.off("click", this.onFlashlightClicked, this);
    //     this.btnInteract.off("click", this.onInteractClicked, this);
    //     this.btnScan.off("click", this.onScanClicked, this);
    // }

    protected onDestroy(): void {
        this.offListenEvent()
    }


    onListenEvent(){
        EventManager.on(LBL_Const.EventName.ShowPointTip, this.showPointTip, this);
    }
    offListenEvent(){
        EventManager.off(LBL_Const.EventName.ShowPointTip, this.showPointTip, this);
    }

}


