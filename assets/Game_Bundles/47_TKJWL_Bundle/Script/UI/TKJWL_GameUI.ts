import { _decorator, assetManager, clamp, Color, Component, director, EventTouch, instantiate, Label, Node, PhysicsSystem, ProgressBar, Sprite, SpriteFrame, tween, UIOpacity, UITransform, v3, Vec2, Vec3 } from 'cc';

import { TKJWL_PlayerController } from '../Game/TKJWL_PlayerController';
import { TKJWL_DataManager } from '../Manager/TKJWL_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../Common/TKJWL_GameEvents';
import { TKJWL_ItemType } from '../Common/TKJWL_ItemType';
import { TKJWL_UIItemType } from '../Common/TKJWL_UIType';
import { TKJWL_Slider } from './UIItem/TKJWL_Slider';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

const { ccclass, property } = _decorator;

@ccclass('TKJWL_GameUI')
export class TKJWL_GameUI extends Component {

    @property(Node)
    private touchPanel: Node;

    @property(Node)
    private joyBase: Node;
    
    @property(Node)
    private itemUIs: Node[]=[];

    @property(Node)
    private btnInteract: Node = null;

    @property(Node)
    private btnHoldOn: Node = null;

    
    @property(Node)
    private btnRelease: Node = null;

        
    @property(Node)
    private btnSitDown: Node = null;

    @property(Node)
    private btnStandUp: Node = null;

    @property(Node)
    private btnEat: Node = null;

    @property(Node)
    private btnOpenFire: Node = null;

    @property(Node)
    private btnCloseFire: Node = null;

    @property(Node)
    private taskTip: Node = null;

    @property(Node)
    private progress: Node = null;

    @property(Node)
    private btnBack: Node;

    private pastPos: Vec2 = null;

    protected onLoad(): void {
        this.addListener();
    }

    start() {
        
        // let slider = this.cameraSlider.getComponent(TKJWL_Slider);
        // slider.setProgress(0.3);
    }

    update(deltaTime: number) {
        if(TKJWL_DataManager.Instance.isFail) return;
    }

    CameraTouchStart(event: EventTouch) {
        //  if(!TKJWL_DataManager.Instance.isGameStart ) return;
        this.pastPos = event.getUILocation();
    }

    CameraTouchMove(event: EventTouch) {
        // if(!TKJWL_DataManager.Instance.isGameStart ) return;
        if(TKJWL_DataManager.Instance.isFail) return;
        var delta = event.getUILocation().subtract(this.pastPos).multiplyScalar(0.1);
        let deltaEuler = v3(-delta.y, -delta.x, 0);
        EventManager.Scene.emit(TKJWL_GameEvents.CAMERA_ROTATION, deltaEuler);
        this.pastPos = event.getUILocation();
    }


    PlayerTouchStart() {
        if(!TKJWL_DataManager.Instance.isGameStart ) return;
        TKJWL_DataManager.Instance.isMove = true;
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
        if(!TKJWL_DataManager.Instance.isGameStart ) return;
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

        TKJWL_DataManager.Instance.delta = delta;
    }
    
    PlayerTouchEnd() {
        if(!TKJWL_DataManager.Instance.isGameStart ) return;
        var joy = this.joyBase.children[0];
        joy.setPosition(Vec3.ZERO);
        TKJWL_DataManager.Instance.isMove = false;
        // if(TKJWL_DataManager.Instance.isGuidanding){
        //     if(TKJWL_DataManager.Instance.currentStepIndex == 0){
        //         EventManager.Scene.emit("JJTW_JOYSTICK_End");
        //     }
        //     // else if(TKJWL_DataManager.Instance.currentStepIndex == 2){
        //     //     if(TKJWL_DataManager.Instance.isScream){
        //     //         EventManager.Scene.emit("JJTW_Scream_End");
        //     //     }
        //     // }
        // }
    }


    protected onDestroy(): void {
        this.removeListener()
    }

    showUIItem(itemType: string){
        if(!itemType){
            // if(!TKJWL_DataManager.Instance.HoldItem){
                this.itemUIs.forEach(itemUI => {
                    itemUI.active = false;
                    if(itemUI.name == TKJWL_UIItemType.摇杆){
                        itemUI.active = true;
                    }
                });
                return;
            // }
            // else{
            //     TKJWL_DataManager.Instance.isLookTargetContainer = false;
            //     this.itemUIs.forEach(itemUI => {
            //         itemUI.active = false;
            //         if(itemUI.name == TKJWL_UIItemType.摇杆 || itemUI.name == TKJWL_UIItemType.放下 ){
            //             itemUI.active = true;
            //         }
            //     });
            //     return;
            // }
        
        }
        let showUIs = TKJWL_DataManager.Instance.itemShowUIMap[itemType] as string[];
        this.itemUIs.forEach(itemUI => {
            itemUI.active = false;
            if(showUIs.includes(itemUI.name)){
                itemUI.active = true;
                this.initUIItem(itemUI,itemType);
            }
        });
    }

    showUIItemHoldOn(itemType: string){
        if(!itemType){
            this.itemUIs.forEach(itemUI => {
                itemUI.active = false;
            });
            return;
        }
        let showUIs = TKJWL_DataManager.Instance.itemHoldOnShowUIMap[itemType] as string[];
        this.itemUIs.forEach(itemUI => {
            itemUI.active = false;
            if(showUIs.includes(itemUI.name)){
                itemUI.active = true;
                this.initUIItem(itemUI,itemType);
            }
        });
    }


    initUIItem(itemUI:Node,itemType:string){
        switch(itemUI.name){
            //按钮类
            case TKJWL_UIItemType.交互:
            case TKJWL_UIItemType.坐下:
            case TKJWL_UIItemType.站起来:   
                break;
            case TKJWL_UIItemType.拿起来:
                if(TKJWL_DataManager.Instance.HoldItem){
                    itemUI.active = false;
                }
                break;
            case TKJWL_UIItemType.放下:
                if(TKJWL_DataManager.Instance.isTelescopeWatching)return;
                if(TKJWL_DataManager.Instance.targetItemType !== itemType){
                    TKJWL_DataManager.Instance.isLookTargetContainer = false;
                    itemUI.active = false;
                }
                else{
                    TKJWL_DataManager.Instance.isLookTargetContainer = true;
                }
                break;
            case TKJWL_UIItemType.吃:
                break;
            case TKJWL_UIItemType.进度条:
                itemUI.getComponent(ProgressBar).progress = 0.02;
                break;
            //滑块类
            case TKJWL_UIItemType.滑块:
                EventManager.Scene.emit(TKJWL_GameEvents.SET_TELESCOPE_PROGRESS,0.3);
                if(!TKJWL_DataManager.Instance.isTelescopeTutorialShowed){
                    EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TELESCOPE_TUTORIAL);
                }
                
                break;
             case TKJWL_UIItemType.提示:
                itemUI.getComponentInChildren(Label).string = TKJWL_DataManager.Instance.itemTipMap[itemType];
                // slider.setProgress(0.3);
                break;
        }
    }

    onBtnBackToMainClick(){
        TKJWL_DataManager.Instance.isFail = false;
        PhysicsSystem.instance.gravity = new Vec3(0, -80, 0);

        // this.node.active = false;
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                // LBL_DataManager.Instance.destroyInstance();
                ProjectEventManager.emit(ProjectEvent.返回主页, "他看见我了");
            })
        });
        
    }

    onClickInteract(){
        EventManager.Scene.emit(TKJWL_GameEvents.ITEM_INTERACT);
    }

    onClickHoldOn(){
        EventManager.Scene.emit(TKJWL_GameEvents.ITEM_HOLE_ON);
    }

    onClickRelease(){
        // if( TKJWL_DataManager.Instance.isLookTargetContainer){
            EventManager.Scene.emit(TKJWL_GameEvents.ITEM_RELEASE);
        // }
        // else{
        //     EventManager.Scene.emit(TKJWL_GameEvents.CreateItem);
        // }
    }

    onClickSitDown(){
        // EventManager.Scene.emit();
        EventManager.Scene.emit(TKJWL_GameEvents.ITEM_SIT_DOWN);
    }

    onClickStandUp(){
        // EventManager.Scene.emit();
        EventManager.Scene.emit(TKJWL_GameEvents.ITEM_STAND_UP);
    }

    onClickEat(){
    // EventManager.Scene.emit();
        EventManager.Scene.emit(TKJWL_GameEvents.ITEM_EAT); 
    }

    onOpenFire(){
        EventManager.Scene.emit(TKJWL_GameEvents.ITEM_OPEN_FIRE); 
    }

    onCloseFire(){
        EventManager.Scene.emit(TKJWL_GameEvents.ITEM_CLOSE_FIRE); 
    }

    EatTouchStart(){

    }

    EatTouchMove(){
        this.progress.getComponent(ProgressBar).progress += 0.05;
    }

    EatTouchEnd(){
        if(this.progress.getComponent(ProgressBar).progress == 1){
            EventManager.Scene.emit(TKJWL_GameEvents.ITEM_EAT); 
        }
    }



    updateTaskTip(){
        let taskId = TKJWL_DataManager.Instance.currentTask;
        if(!TKJWL_DataManager.Instance.subTaskIndex[taskId]){
            TKJWL_DataManager.Instance.subTaskIndex[taskId] = 0;
        }
        let num = TKJWL_DataManager.Instance.subTaskIndex[taskId];
        let taskTip1 = this.taskTip.getChildByName("taskTip").getComponentInChildren(Label);
        let taskTip2 = this.taskTip.getChildByName("lblTask_1").getComponent(Label);
        taskTip1.string = TKJWL_DataManager.Instance.taskMap[taskId].content.replace("${}",num.toString());
        taskTip2.string = TKJWL_DataManager.Instance.taskMap[taskId].content.replace("${}",num.toString());
        this.taskTip.active = true;
    }

    showTaskTip(taskId:string,isNeedAnim = true){
        let opacity = this.taskTip.getComponent(UIOpacity);
        if(isNeedAnim){
            tween(opacity)
                .to(0.2, { opacity: 0 })
                .call(()=>{
                    if(!TKJWL_DataManager.Instance.subTaskIndex[taskId]){
                        TKJWL_DataManager.Instance.subTaskIndex[taskId] = 0;
                    }
                    let num = TKJWL_DataManager.Instance.subTaskIndex[taskId];
                    let taskTip1 = this.taskTip.getChildByName("taskTip").getComponentInChildren(Label);
                    let taskTip2 = this.taskTip.getChildByName("lblTask_1").getComponent(Label);
                    taskTip1.string = TKJWL_DataManager.Instance.taskMap[taskId].content.replace("${}",num.toString());
                    taskTip2.string = TKJWL_DataManager.Instance.taskMap[taskId].content.replace("${}",num.toString());
                    this.taskTip.active = true;
                })
                .to(0.2, { opacity: 255 })
                .start();
        }
        else{
            opacity.opacity = 0;
            this.taskTip.active = true;
            tween(opacity)
                .to(0.2, { opacity: 255 })
                .start();
        }

    }

    hideTaskTip(){
        let opacity = this.taskTip.getComponent(UIOpacity);
        tween(opacity)
            .to(0.2, { opacity: 0 })
            .call(()=>{
                this.taskTip.active = false;
            })
            .start();
    }



    addListener(){
        EventManager.on(TKJWL_GameEvents.SHOW_UI_ITEM, this.showUIItem, this);
        EventManager.on(TKJWL_GameEvents.SHOW_UI_ITEM_HOLD_ON,this.showUIItemHoldOn,this)
        EventManager.on(TKJWL_GameEvents.UPDATE_TASK_Tip,this.updateTaskTip,this);
        EventManager.on(TKJWL_GameEvents.SHOW_TASK_TIP,this.showTaskTip,this);
        EventManager.on(TKJWL_GameEvents.HIDE_TASK_TIP,this.hideTaskTip,this);

        this.touchPanel.on(Node.EventType.TOUCH_START, this.CameraTouchStart, this);
        this.touchPanel.on(Node.EventType.TOUCH_MOVE, this.CameraTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_START, this.PlayerTouchStart, this);
        this.joyBase.on(Node.EventType.TOUCH_MOVE, this.PlayerTouchMove, this);
        this.joyBase.on(Node.EventType.TOUCH_END, this.PlayerTouchEnd, this);
        this.joyBase.on(Node.EventType.TOUCH_CANCEL, this.PlayerTouchEnd, this);

        this.btnInteract.on(Node.EventType.TOUCH_END, this.onClickInteract, this);
        this.btnHoldOn.on(Node.EventType.TOUCH_END, this.onClickHoldOn, this);
        this.btnRelease.on(Node.EventType.TOUCH_END, this.onClickRelease, this);
        this.btnSitDown.on(Node.EventType.TOUCH_END, this.onClickSitDown, this);
        this.btnStandUp.on(Node.EventType.TOUCH_END, this.onClickStandUp, this);
        this.btnOpenFire.on(Node.EventType.TOUCH_END, this.onOpenFire, this);
        this.btnCloseFire.on(Node.EventType.TOUCH_END, this.onCloseFire, this);
        this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackToMainClick, this);

        this.btnEat.on(Node.EventType.TOUCH_END, this.onClickEat, this);
        // this.btnEat.on(Node.EventType.TOUCH_START, this.EatTouchStart, this);
        // this.btnEat.on(Node.EventType.TOUCH_MOVE, this.EatTouchMove, this);
        // this.btnEat.on(Node.EventType.TOUCH_END, this.EatTouchEnd, this);
        // this.btnEat.on(Node.EventType.TOUCH_CANCEL, this.EatTouchEnd, this);

    }
    removeListener(){
        EventManager.off(TKJWL_GameEvents.SHOW_UI_ITEM, this.showUIItem, this);
        EventManager.off(TKJWL_GameEvents.SHOW_UI_ITEM_HOLD_ON,this.showUIItemHoldOn,this)
        EventManager.off(TKJWL_GameEvents.UPDATE_TASK_Tip,this.updateTaskTip,this);
        EventManager.off(TKJWL_GameEvents.SHOW_TASK_TIP,this.showTaskTip,this);
        EventManager.off(TKJWL_GameEvents.HIDE_TASK_TIP,this.hideTaskTip,this);
        
    }

}


