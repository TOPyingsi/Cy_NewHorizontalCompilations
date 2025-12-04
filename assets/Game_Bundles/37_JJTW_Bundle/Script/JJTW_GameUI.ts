import { _decorator, clamp, Component, director, EventTouch, instantiate, Label, Node, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec2, Vec3 } from 'cc';
// import { DiggingAHoleCV_PlayerController } from './DiggingAHoleCV_PlayerController';
import { UIManager, Panel } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import Banner from 'db://assets/Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { JJTW_DataManager } from './JJTW_DataManager';
import { JJTW_PlayerController } from './JJTW_PlayerController';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { JJTW_ScanSysem } from './JJTW_ScanSysem';
const { ccclass, property } = _decorator;

@ccclass('JJTW_GameUI')
export class JJTW_GameUI extends Component {

    private static instance: JJTW_GameUI;

    public static get Instance(): JJTW_GameUI {
        return this.instance;
    }

    @property(JJTW_ScanSysem)
    scanSysem: JJTW_ScanSysem;

    @property(Node)
    touchPanel: Node;

    @property(Node)
    joyBase: Node;

    @property(Node)
    playerNode: Node;

    @property(Node)
    btnScream: Node;

    @property(Node)
    btnFlashlight: Node;

    @property(Node)
    btnInteract: Node;

    @property(Node)
    btnScan: Node;

    @property(Node)
    AdPanel: Node;


    @property(Node)
    btnWatchAd: Node;

    @property(Node)
    btnAdTipClose: Node;

    @property(Node)
    bagPanel: Node;

    @property(SpriteFrame)
    compassSps: SpriteFrame[]=[];

    @property(Node)
    keyDoorTipPanel: Node;

    @property(Node)
    toExitPanel: Node;

    @property(Node)
    waitTipPanel: Node;

    @property(Node)
    exitDoorTipPanel: Node;

    @property(Node)
    beginningTipPanel: Node;

    @property(Node)
    btnBeginningTipClose: Node;

    @property(Node)
    npcContainer: Node;

    @property(Node)
    deadPanel: Node;

    
    @property(Node)
    winPanel: Node;

    @property(Node)
    btnReturn:Node;

    beginningTipShowTime:number = 1;

    lightTime = 60;

    lightPassTime = 0;

    
    scanTime = 10;

    scanPassTime = 0;


    pastPos: Vec2 = null;
    // delta: Vec3;
    // treaNames = ["煤炭", "绿宝石", "金块", "紫宝石", "红宝石", "钻石"];

    protected onLoad(): void {
        JJTW_GameUI.instance = this;
        ProjectEventManager.emit(ProjectEvent.游戏开始, "掘地求财方块版");
    }

    start() {
        this.hideAllTip();
        // this.keyDoorTipPanel.active = false;
        // this.AdPanel.active = false;
        // this.exitDoorTipPanel.active = false;
        this.beginningTipPanel.active = true;
        this.btnFlashlight.getComponentInChildren(Sprite).fillRange = 0;
        // this.updateNPCUI();

        this.btnScan.getComponentInChildren(Sprite).node.active = false;                    // this.closeFlashlight();



        this.touchPanel.on(Node.EventType.TOUCH_START, this.CameraTouchStart, this);
        this.touchPanel.on(Node.EventType.TOUCH_MOVE, this.CameraTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_START, this.PlayerTouchStart, this);
        this.joyBase.on(Node.EventType.TOUCH_MOVE, this.PlayerTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_END, this.PlayerTouchEnd, this);
        this.joyBase.on(Node.EventType.TOUCH_CANCEL, this.PlayerTouchEnd, this);
        this.btnScream.on(Node.EventType.TOUCH_START, this.ScreamTouchStart, this);
        this.btnScream.on(Node.EventType.TOUCH_END, this.ScreamTouchEnd, this);
        this.btnScream.on(Node.EventType.TOUCH_CANCEL, this.ScreamTouchEnd, this);
        this.btnFlashlight.on("click", this.onFlashlightClicked, this);
        this.btnInteract.on("click", this.onInteractClicked, this);
        this.btnScan.on("click", this.onScanClicked, this);
        this.winPanel.getChildByName("btnBack").on("click",this.onBtnBackClick,this)
        this.winPanel.getChildByName("btnReset").on("click",this.onBtnResetClick,this)
        this.deadPanel.getChildByName("btnBack").on("click",this.onBtnBackClick,this)
        this.deadPanel.getChildByName("btnReset").on("click",this.onBtnResetClick,this)
        this.btnReturn.on("click",this.onBtnReturnClick,this)
        // ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.more);
        // JJTW_DataManager.Instance.isGameStart = true;

        this.deadPanel.active = false;
        this.winPanel.active = false;

        ProjectEventManager.emit(ProjectEvent.弹出窗口, "尖叫逃亡");
    }

    update(deltaTime: number) {
        // if(JJTW_DataManager.Instance.isGameStart){
        //     this.beginningTipShowTime -= deltaTime;
        //     if(this.beginningTipShowTime <= 0){
        //         this.beginningTipPanel.active = true;
        //         this.btnBeginningTipClose.on("click", this.onBeginningTipCloseClicked, this);
        //         JJTW_DataManager.Instance.isGameStart = false;
        //     }
        // }

        if(JJTW_DataManager.Instance.isPlayerDead) return;
        if(JJTW_DataManager.Instance.isStartToLightDownCount){
            if(JJTW_DataManager.Instance.isLightCanOpen && JJTW_DataManager.Instance.isFlashlight){

                this.lightPassTime += deltaTime;
                this.btnFlashlight.getComponentInChildren(Sprite).fillRange = this.lightPassTime / this.lightTime;
                // console.log("lightPassTime",this.lightPassTime);
    
                // console.log("fillRange",this.btnFlashlight.getComponentInChildren(Sprite).fillRange);
                if(this.lightPassTime >= this.lightTime){
                    JJTW_DataManager.Instance.isFlashlight = false;
                    this.lightPassTime = 0;
                    JJTW_DataManager.Instance.isLightCanOpen = false;
                    this.btnFlashlight.getComponentInChildren(Sprite).fillRange = 1;
                    // this.closeFlashlight();
                }
                // else {
                //     this.openFlashlight();
                // }
            }
        }

   
            if(JJTW_DataManager.Instance.isScaning){
                if(!this.btnScan.getComponentInChildren(Sprite).node.active){
                    this.btnScan.getComponentInChildren(Sprite).node.active = true;                    // this.closeFlashlight();
                    this.btnScan.getComponentInChildren(Sprite).fillRange = 0;
                }
                this.scanPassTime += deltaTime;
                this.btnScan.getComponentInChildren(Sprite).fillRange = -(this.scanTime - this.scanPassTime) / this.scanTime;
                // console.log("lightPassTime",this.lightPassTime);
    
                // console.log("fillRange",this.btnFlashlight.getComponentInChildren(Sprite).fillRange);
                if(this.scanPassTime >= this.scanTime){
                    JJTW_DataManager.Instance.isScaning = false;
                    this.scanPassTime = 0;
                    this.btnScan.getComponentInChildren(Sprite).fillRange = 0;
                    this.btnScan.getComponentInChildren(Sprite).node.active = false;                    // this.closeFlashlight();
                }
                // else {
                //     this.openFlashlight();
                // }
            }
        
       
        // else{
        //     this.closeFlashlight();
        // }
    }

    CameraTouchStart(event: EventTouch) {
        this.pastPos = event.getUILocation();
    }

    CameraTouchMove(event: EventTouch) {
        if(JJTW_DataManager.Instance.isPlayerDead) return;
        var delta = event.getUILocation().subtract(this.pastPos).multiplyScalar(0.1);
        var euler = v3(this.playerNode.eulerAngles);
        euler.add3f(-delta.y, -delta.x, 0);
        euler.x = clamp(euler.x, -50, 30);
        this.playerNode.setRotationFromEuler(euler);
        this.pastPos = event.getUILocation();
    }

    PlayerTouchStart() {
        JJTW_DataManager.Instance.isMove = true;
        if(JJTW_DataManager.Instance.isGuidanding){
            if(JJTW_DataManager.Instance.currentStepIndex == 0){
                EventManager.Scene.emit("JJTW_JOYSTICK_Start");
            }
            else if(JJTW_DataManager.Instance.currentStepIndex == 2){
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

        JJTW_DataManager.Instance.delta = delta;
    }
    
    PlayerTouchEnd() {
        var joy = this.joyBase.children[0];
        joy.setPosition(Vec3.ZERO);
        JJTW_DataManager.Instance.isMove = false;
        if(JJTW_DataManager.Instance.isGuidanding){
            if(JJTW_DataManager.Instance.currentStepIndex == 0){
                EventManager.Scene.emit("JJTW_JOYSTICK_End");
            }
            // else if(JJTW_DataManager.Instance.currentStepIndex == 2){
            //     if(JJTW_DataManager.Instance.isScream){
            //         EventManager.Scene.emit("JJTW_Scream_End");
            //     }
            // }
        }
    }


    ScreamTouchStart(){
        JJTW_DataManager.Instance.isScream = true;
        if(JJTW_DataManager.Instance.isGuidanding && JJTW_DataManager.Instance.currentStepIndex == 2){
            EventManager.Scene.emit("JJTW_Scream_Start");
        }
    }

    ScreamTouchEnd(){
        JJTW_DataManager.Instance.isScream = false; 
    }
    

    onFlashlightClicked(){
        if(JJTW_DataManager.Instance.isLightCanOpen){
            JJTW_DataManager.Instance.isFlashlight = !JJTW_DataManager.Instance.isFlashlight;
        }
        else{
            this.showAdTip()
        }
        // JJTW_DataManager.Instance.isFlashlight = !JJTW_DataManager.Instance.isFlashlight;
        // this.btnFlashlight.getComponent(Sprite).spriteFrame = JJTW_DataManager.Instance.isFlashlight ? JJTW_DataManager.Instance.spriteFlashlightOn : JJTW_DataManager.Instance.spriteFlashlightOff; 
    }

    onInteractClicked(){
        JJTW_PlayerController.Instance.interact();
    }

    onScanClicked(){
        if(!JJTW_DataManager.Instance.isScaning){
            JJTW_DataManager.Instance.setTargetPos();
            if(JJTW_DataManager.Instance.currentTargetPos){
                this.scanSysem.showArrow();
                JJTW_DataManager.Instance.isScaning  = true;
            }
            else{
                this.showToExitPanel();
            }
        }
        else{
            this.showWaitTip();
        }
    }

    showAdTip(){
        this.hideAllTip();
        this.AdPanel.active = true;
        this.btnWatchAd.on("click",this.onWatchAdClicked,this);
        this.btnAdTipClose.on("click",this.hideAdTip,this);
    }

    hideAdTip(){
        this.AdPanel.active = false;
        this.btnWatchAd.off("click",this.onWatchAdClicked,this);
        this.btnAdTipClose.off("click",this.hideAdTip,this);
    }

    onWatchAdClicked(){
      // 这里应该调用视频广告接口
        Banner.Instance.ShowVideoAd(()=>{
            // 假设视频播放完成
            JJTW_DataManager.Instance.isLightCanOpen = true;
            JJTW_DataManager.Instance.isFlashlight = true;
            this.hideAdTip();
        });
    }


    updateBag(){
        if(JJTW_DataManager.Instance.fileData.isGot){
            this.bagPanel.getChildByName("fileBg").getChildByName("file").active = true;
        }
        else{
            this.bagPanel.getChildByName("fileBg").getChildByName("file").active = false;
        }

        if(JJTW_DataManager.Instance.keyData.isGot){
            this.bagPanel.getChildByName("items").getChildByName("key").active = true;
        }
        else{
            this.bagPanel.getChildByName("items").getChildByName("key").active = false;
        }

        let contain = this.bagPanel.getChildByName("items").getChildByName("compass");
      
        contain.children.forEach((item)=>{
           if(contain.children.length > 1){
            item.destroy();
           }
        })
        
        JJTW_DataManager.Instance.compassData.forEach((item)=>{
            if(item.isGot && !item.isSet){
                let compassItem = instantiate(contain.children[0]);
                compassItem.parent = contain;
                compassItem.active = true;
                compassItem.getComponentInChildren(Sprite).spriteFrame = this.compassSps[item.id];
            }
        })
        contain.children[0].active = false;
    }

    updateNPCUI(){
        JJTW_DataManager.Instance.liveNPCData.forEach((item)=>{
            let npc = this.npcContainer.children[item.id];
            if(item.isDead){
                npc.getChildByName("dead").active = true;
            }
            else{
                npc.getChildByName("dead").active = false;
            }
        })
    }

    showKeyDoorTip(){
        this.hideAllTip();
        this.keyDoorTipPanel.active = true;
        this.unschedule(this.CloseKeyDoorTip);
        this.scheduleOnce(this.CloseKeyDoorTip, 4);
    }

    CloseKeyDoorTip(){
        this.keyDoorTipPanel.active = false;
    }

    showExitDoorTip(){
        this.hideAllTip();
        this.exitDoorTipPanel.active = true;         
        this.unschedule(this.CloseExitDoorTip);
        this.scheduleOnce(this.CloseExitDoorTip, 4);
    }

    CloseExitDoorTip(){
        this.exitDoorTipPanel.active = false;
    }

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
             ProjectEventManager.emit(ProjectEvent.游戏结束, "尖叫逃亡");
            // labelNode1.active = true;
            // tween(lblUIOpacity)
            // .to(1,{opacity:255})
            // .delay(1)
            // .call(()=>{
            //     if(JJTW_DataManager.Instance.fileData.isGot){
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
        uiOpacity.opacity = 0;
        this.deadPanel.active = true;
        this.winPanel.active = false;
        // let labelNode = this.deadPanel.getChildByName("Label");
        // let lblUIOpacity = labelNode.getComponent(UIOpacity);
        // lblUIOpacity.opacity = 0;
        // labelNode.active = false;
        tween(uiOpacity)
        .to(1,{opacity:255})
        .call(()=>{
             ProjectEventManager.emit(ProjectEvent.游戏结束, "尖叫逃亡");
            // labelNode.active = true;
            // tween(lblUIOpacity)
            // .to(1,{opacity:255})
            // .delay(1)
            // .to(1,{opacity:0})
            // .call(()=>{
            //     director.loadScene("JJTW_GameScene");
            // })
            // .start();
        })
        .start();
    }

    onBtnBackClick(){
        this.deadPanel.getChildByName("btnBack").off("click",this.onBtnBackClick,this)
        this.winPanel.getChildByName("btnBack").off("click",this.onBtnBackClick,this)
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "尖叫逃亡");
            })
        });
    }

    onBtnResetClick(){
        this.deadPanel.getChildByName("btnReset").off("click",this.onBtnResetClick,this)
        this.winPanel.getChildByName("btnReset").off("click",this.onBtnResetClick,this)
        director.loadScene("JJTW_GameScene");
    }


    showToExitPanel(){
        this.hideAllTip();
        this.toExitPanel.active = true;
        this.unschedule(this.CloseToExitTip);
        this.scheduleOnce(this.CloseToExitTip, 3);
    }

    CloseToExitTip(){
        this.toExitPanel.active = false;
    }

    showWaitTip(){
        this.hideAllTip();
        this.waitTipPanel.active = true;
        this.unschedule(this.closeWaitTip); 
        this.scheduleOnce(this.closeWaitTip, 2);
    }

    closeWaitTip(){
        this.waitTipPanel.active = false;
    }

    onBtnReturnClick(){
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "尖叫逃亡");
            })
        });
    }

    hideAllTip(){
        this.AdPanel.active = false;
        this.keyDoorTipPanel.active = false;
        this.toExitPanel.active = false;
        this.waitTipPanel.active = false;
        this.exitDoorTipPanel.active = false;
        this.beginningTipPanel.active = false;
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
}


