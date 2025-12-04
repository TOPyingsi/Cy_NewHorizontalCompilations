import { _decorator, clamp, Component, Node, RigidBody, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
import { TKJWL_ItemBase } from '../../Common/TKJWL_ItemBase';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
import { TKJWL_ItemType } from '../../Common/TKJWL_ItemType';
import { TKJWL_TaskType } from '../../Common/TKJWL_TaskType';
import { TKJWL_Physics_Group } from '../../Common/TKJWL_PHY_GROUP';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_HoldOnItem')
export class TKJWL_HoldOnItem extends TKJWL_ItemBase {

    @property(String)
    targetItemType: string= "";

    @property(Node)
    nextItem:Node = null;

    @property(Node)
    destoryItem:Node = null;

    @property(Node)
    specialItem1:Node = null;

    @property(Node)
    specialItem2:Node = null;

    onLoad(){
        super.onLoad();
        if(this.node.name === "item_Garbage_1"){
            this.node.getChildByName("selected").active = false;
            this.getComponent(RigidBody).group = TKJWL_Physics_Group.DEFAULT;
            this.noramlNodes.forEach(node => {
                node.layer = 1 << 30;
            });
            return;
        }
        if(this.node.name === "item_CokeCan_1"){
            this.node.getChildByName("selected").active = false;
            this.getComponent(RigidBody).group = TKJWL_Physics_Group.DEFAULT;
            this.noramlNodes.forEach(node => {
                node.layer = 1 << 30;
            });
            return;
        }
        if(this.node.name === "item_CokeCan_2"){
            this.node.getChildByName("selected").active = false;
            this.getComponent(RigidBody).group = TKJWL_Physics_Group.DEFAULT;
            this.noramlNodes.forEach(node => {
                node.layer = 1 << 30;
            });
            return;
        }
        if(this.node.name === "item_CokeCan_3"){
            this.node.getChildByName("selected").active = false;
            this.getComponent(RigidBody).group = TKJWL_Physics_Group.DEFAULT;
            this.noramlNodes.forEach(node => {
                node.layer = 1 << 30;
            });
            return;
        }
    }

    protected start(): void {

    }


    protected HoldItem(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }
        TKJWL_DataManager.Instance.isHoldOning = true;
        TKJWL_DataManager.Instance.HoldItem = this.node;
        //设置目标
        TKJWL_DataManager.Instance.targetItemType = this.targetItemType;
        //隐藏按钮
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM,null)
        //显示悬浮体
        this.node.active = false;
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_HOLD_ON_ITEM,this.node.name)

        let itemType = this.node.name.split("_")[1];
        switch(itemType){

            case TKJWL_ItemType.FullKettle:
                if(this.destoryItem){//煤气灶
                    this.destoryItem.active = true;
                }
                if(this.specialItem1){//旋钮
                    this.specialItem1.active = true;
                }
                break;
            case TKJWL_ItemType.CookEndDumplings:
                if(this.specialItem1){
                    this.specialItem1.active = true;
                }
                if(this.specialItem2){
                    this.specialItem2.active = false;
                }
                break;
        }

        // switch(this.node.name.split("_")[1]){
        //     case TKJWL_ItemType.FrozenDumplings:
        //         //开启铰链
        //         this.getComponent(RigidBody).group = TKJWL_Physics_Group.IGNORE_RAY;
        //         this.getComponent(Constraint).enabled = true;
        //         break;
        //     case TKJWL_ItemType.Telescope:
        //         EventManager.Scene.emit(TKJWL_GameEvents.START_USE_TELESCOPE);
        //         break;
        // }
    }

    protected ReleaseItem(){
        if(TKJWL_DataManager.Instance.HoldItem !== this.node){
            return;
        }
        TKJWL_DataManager.Instance.HoldItem = null;
        TKJWL_DataManager.Instance.isHoldOning = false;
        TKJWL_DataManager.Instance.targetItemType = null;
        //隐藏悬浮物
        EventManager.Scene.emit(TKJWL_GameEvents.HIDE_HOLD_ON_ITEM,this.node.name)
        //隐藏按钮
        let itemType = this.node.name.split("_")[1];
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM,null)

        let createAndDestoryItem = ()=>{
            if(this.nextItem){
                this.nextItem.active = true;
            }
            //销毁接收物
            if(this.destoryItem){
                this.destoryItem.active = false; 
            }
        }

        switch(itemType){
            case TKJWL_ItemType.Kettle:
 
                createAndDestoryItem();
                TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.往锅里装水);
                this.scheduleOnce(()=>{
                    //5秒后水满
                    if(this.specialItem1){
                        this.specialItem1.active = true;
                    }
                    //开启
                    if(this.specialItem2){
                        this.specialItem2.active = true;
                    }
                    this.nextItem.active = false;
                    TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.等待水装好);
                },5)
                break;
            case TKJWL_ItemType.FullKettle:
                createAndDestoryItem();
                if(this.specialItem1){
                    this.specialItem1.active = true;
                }
                if(this.specialItem2){
                    this.specialItem2.active = true;
                }
                TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.将锅放到煤气灶上);
                break;

            case TKJWL_ItemType.CokeCan:
                TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.把垃圾扔进垃圾桶);

                if(TKJWL_DataManager.Instance.subTaskIndex[TKJWL_TaskType.把垃圾扔进垃圾桶] === 2){
                    createAndDestoryItem();
                }
                break;
            case TKJWL_ItemType.Garbage:

                TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.去楼道的垃圾管道扔掉垃圾袋);

                if(TKJWL_DataManager.Instance.subTaskIndex[TKJWL_TaskType.去楼道的垃圾管道扔掉垃圾袋] === 2){
                    createAndDestoryItem();
                }
                break;
            case TKJWL_ItemType.FrozenDumplings:
                
                createAndDestoryItem();
                if(this.specialItem1){
                    this.specialItem1.active = true;
                }

                TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.将水饺放到锅里);
                this.scheduleOnce(()=>{
                    //5秒后水满
                    if(this.specialItem1){
                        this.specialItem1.getChildByName("BoilSmoke").active = true;
                    }
                    //开启
                    this.scheduleOnce(()=>{
                        //5秒后水满
                        if(this.specialItem1){
                            this.specialItem1.active = false;
                        }
                        if(this.specialItem2){
                            this.specialItem2.active = true;
                        }
                        TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.等待水饺煮好);
                    },2)
                },5)
                break;
            case TKJWL_ItemType.CookEndDumplings:
                createAndDestoryItem();
                if(this.specialItem1){
                    this.specialItem1.active = false;
                }
                if(this.specialItem2){
                    this.specialItem2.active = true;
                }
                 TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.将煮好的的水饺放到餐桌上);
                TKJWL_DataManager.Instance.isPutBeforeDumplings = true;
                TKJWL_DataManager.Instance.isPutAfterDumplings = false;
                break;
        }
        
        //    //释放铰链
        //     this.getComponent(RigidBody).group = TKJWL_Physics_Group.ITEM;
        //     this.getComponent(Constraint).enabled = false;
    }

    protected EatItem(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }
        this.node.active = false;
        if(this.nextItem){
            this.nextItem.active = true;
        }
        TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.坐到餐桌前吃掉水饺);
        TKJWL_DataManager.Instance.isPutBeforeDumplings = false;
        TKJWL_DataManager.Instance.isPutAfterDumplings = false;

        TKJWL_DataManager.Instance.lookAtItem  = this.specialItem2;
        let itemType = this.specialItem2.name.split("_")[1];
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM, itemType);

    }



     protected StandUp(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }
        if(this.destoryItem){
            this.destoryItem.active = false;
        }

        TKJWL_DataManager.Instance.isSitting = false;
        TKJWL_DataManager.Instance.lookAtItem  = this.specialItem1;
        let itemType = this.specialItem1.name.split("_")[1];
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM, itemType);

        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_PLAYER_CAMERA);
        // this.node.active = false;
        this.specialItem1.active = true;
    }

    // protected StandUp(){
    //     if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
    //         return;
    //     }

    //     TKJWL_DataManager.Instance.isSitting = false;
    //     TKJWL_DataManager.Instance.lookAtItem  = this.specialItem1;
    //     let itemType = this.specialItem1.name.split("_")[1];
    //     EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM, itemType);

    //     EventManager.Scene.emit(TKJWL_GameEvents.SHOW_PLAYER_CAMERA);
    //     this.node.active = false;
    //     this.specialItem1.active = true;
    // }

    // protected SitDown(){
    //     if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
    //         return;
    //     }
    //     TKJWL_DataManager.Instance.isSitting = true;
    //     TKJWL_DataManager.Instance.lookAtItem  = this.specialItem1;
    //     let itemType = this.specialItem1.name.split("_")[1];
    //     EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM, itemType);
    //     // EventManager.Scene.emit(TKJWL_GameEvents.UPDATE_LOOKAT_ITEM);

    //     EventManager.Scene.emit(TKJWL_GameEvents.HIDE_PLAYER_CAMERA);
    //     this.specialItem1.active = true;
    //     this.node.active = false;
    // }

    //  update(){
    //     if(!TKJWL_DataManager.Instance.isSitting){
    //         return;
    //     }
    //     this.checkInteractItem();
    // }

    // private checkInteractItem() {
    //     // // 获取相机组件
    //     // const camera = this.camera.getComponent(Camera);
    //     // if (!camera) return;

    //     // let ray = this.ray;
    //     // let v = this.v;
    //     // this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
    //     // camera.screenPointToRay(v.x, v.y, ray);

    //     // // 射线检测所有碰撞体
    //     // const mask = TKJWL_Physics_Group.KILL_AREA; // 检测所有分组
    //     // const maxDistance = 40;
    //     // const queryTrigger = true;

    //     // if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
    //     //     TKJWL_DataManager.Instance.isWatchingKill = true;
    //     // }
    //     // else{
    //     //     TKJWL_DataManager.Instance.isWatchingKill = false;
    //     // }
    // }


    showBoilSmoke(){
        this.node.getChildByName("BoilSmoke").active = true;
    }
    hideBoilSmoke(){
        this.node.getChildByName("BoilSmoke").active = false;
    }

    showDumplings(){
        this.node.active = true;
    }

    showGarbage2(){
        this.node.active = true;
    }

    hideGarbageCan(){
        this.node.getChildByName("selected").active = false;
        this.getComponent(RigidBody).group = TKJWL_Physics_Group.DEFAULT;
        this.noramlNodes.forEach(node => {
            node.layer = 1 << 30;
        });

    }

    showGarbage_1(){
        if(this.node.name === "item_Garbage_1"){
            this.node.getChildByName("selected").active = false;
            this.getComponent(RigidBody).group = TKJWL_Physics_Group.ITEM;
            this.noramlNodes.forEach(node => {
                node.layer = 1 << 30;
            });
            return;
        }
    }

    showAllGarbage(){
       if(this.node.name === "item_CokeCan_1"){
            this.node.getChildByName("selected").active = false;
            this.getComponent(RigidBody).group = TKJWL_Physics_Group.ITEM;
            this.noramlNodes.forEach(node => {
                node.layer = 1 << 30;
            });
            return;
        }
        if(this.node.name === "item_CokeCan_2"){
            this.node.getChildByName("selected").active = false;
            this.getComponent(RigidBody).group = TKJWL_Physics_Group.ITEM;
            this.noramlNodes.forEach(node => {
                node.layer = 1 << 30;
            });
            return;
        }
        if(this.node.name === "item_CokeCan_3"){
            this.node.getChildByName("selected").active = false;
            this.getComponent(RigidBody).group = TKJWL_Physics_Group.ITEM;
            this.noramlNodes.forEach(node => {
                node.layer = 1 << 30;
            });
            return;
        }
    }

    addListener(){

          //隐藏按钮
        let itemType = this.node.name.split("_")[1];
        if(itemType === TKJWL_ItemType.FullKettle2){
            EventManager.on(TKJWL_GameEvents.SHOW_BOIL_SMOKE,this.showBoilSmoke,this)
            return;
        }
        if(itemType === TKJWL_ItemType.FrozenDumplings){
            EventManager.on(TKJWL_GameEvents.SHOW_DUMPLINGS,this.showDumplings,this)
            return;
        }
        if(this.node.name === "item_Garbage_2"){
            EventManager.on(TKJWL_GameEvents.SHOW_item_Garbage_2,this.showGarbage2,this)
            return;
        }
        if(this.node.name === "item_GarbageCan"){
            EventManager.on(TKJWL_GameEvents.Hide__Garbage_Can,this.hideGarbageCan,this)
            return;
        }
        if(this.node.name === "item_Garbage_1"){
            EventManager.on(TKJWL_GameEvents.SHOW_item_Garbage_1,this.showGarbage_1,this)
            return;
        }
        if(this.node.name === "item_CokeCan_1" || this.node.name === "item_CokeCan_2" || this.node.name === "item_CokeCan_3"){
            EventManager.on(TKJWL_GameEvents.SHOW_item_All_Garbage,this.showAllGarbage,this)
            return;
        }
       
    }

    removeListener(){
                 //隐藏按钮
        let itemType = this.node.name.split("_")[1];
        if(itemType === TKJWL_ItemType.FullKettle2){
            EventManager.off(TKJWL_GameEvents.HIDE_BOIL_SMOKE,this.hideBoilSmoke,this)
            return;
        }
        if(itemType === TKJWL_ItemType.FrozenDumplings){
            EventManager.off(TKJWL_GameEvents.SHOW_DUMPLINGS,this.showDumplings,this)
            return;
        }
        if(this.node.name == "item_Garbage_2"){
            EventManager.off(TKJWL_GameEvents.SHOW_item_Garbage_2,this.showGarbage2,this)
            return;
        }
        if(this.node.name === "item_GarbageCan"){
            EventManager.off(TKJWL_GameEvents.Hide__Garbage_Can,this.hideGarbageCan,this)
            return;
        }
        if(this.node.name === "item_Garbage_1"){
            EventManager.off(TKJWL_GameEvents.SHOW_item_Garbage_1,this.showGarbage_1,this)
            return;
        }
        if(this.node.name === "item_CokeCan_1" || this.node.name === "item_CokeCan_2" || this.node.name === "item_CokeCan_3"){
            EventManager.off(TKJWL_GameEvents.SHOW_item_All_Garbage,this.showAllGarbage,this)
            return;
        }
       
    }

    onDestroy(){

    }

}


