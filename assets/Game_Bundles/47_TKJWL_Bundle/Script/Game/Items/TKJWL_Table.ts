import { _decorator, clamp, Component, Node, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
import { TKJWL_ItemBase } from '../../Common/TKJWL_ItemBase';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
import { TKJWL_ItemType } from '../../Common/TKJWL_ItemType';
import { TKJWL_TaskType } from '../../Common/TKJWL_TaskType';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_Table')
export class TKJWL_Table extends TKJWL_ItemBase {

    @property(Boolean)
    isSitTabel:boolean = false

    @property(Node)
    specialItem1:Node = null;

    @property(Node)
    specialItem2:Node = null;


    onLoad(){
        super.onLoad();
    }

    protected start(): void {

    }

    protected StandUp(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }
        if(this.isSitTabel){
            return;
        }

        TKJWL_DataManager.Instance.isSitting = false;
        TKJWL_DataManager.Instance.lookAtItem  = this.specialItem1;
        let itemType = this.specialItem1.name.split("_")[1];
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM, itemType);

        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_PLAYER_CAMERA);
        this.node.active = false;
        this.specialItem1.active = true;
    }

    protected SitDown(){
        if(!this.isSitTabel){
            return;
        }
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }
        let item = null;
        item = this.specialItem1;//桌子
        if(TKJWL_DataManager.Instance.isPutBeforeDumplings){
            item = this.specialItem2;//饺子
        }
        if(TKJWL_DataManager.Instance.isPutAfterDumplings){
            item = this.specialItem1;//桌子
        }

        TKJWL_DataManager.Instance.isSitting = true;
        TKJWL_DataManager.Instance.lookAtItem  = item;
        let itemType = item.name.split("_")[1];
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM, itemType);
        // EventManager.Scene.emit(TKJWL_GameEvents.UPDATE_LOOKAT_ITEM);

        EventManager.Scene.emit(TKJWL_GameEvents.HIDE_PLAYER_CAMERA);
        this.specialItem1.active = true;
        this.node.active = false;
    }

     update(){
        if(!TKJWL_DataManager.Instance.isSitting){
            return;
        }
        this.checkInteractItem();
    }

    private checkInteractItem() {
        // // 获取相机组件
        // const camera = this.camera.getComponent(Camera);
        // if (!camera) return;

        // let ray = this.ray;
        // let v = this.v;
        // this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
        // camera.screenPointToRay(v.x, v.y, ray);

        // // 射线检测所有碰撞体
        // const mask = TKJWL_Physics_Group.KILL_AREA; // 检测所有分组
        // const maxDistance = 40;
        // const queryTrigger = true;

        // if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
        //     TKJWL_DataManager.Instance.isWatchingKill = true;
        // }
        // else{
        //     TKJWL_DataManager.Instance.isWatchingKill = false;
        // }
    }



    addListener(){

       
    }

    removeListener(){
                
    }

    onDestroy(){

    }

}


