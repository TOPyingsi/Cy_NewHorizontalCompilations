import { _decorator, Camera, clamp, Color, Component, geometry, Node, PhysicsSystem, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
import { TKJWL_ItemBase } from '../../Common/TKJWL_ItemBase';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
import { TKJWL_Physics_Group } from '../../Common/TKJWL_PHY_GROUP';
import { TKJWL_TaskType } from '../../Common/TKJWL_TaskType';
import { TKJWL_AudioManager } from '../../Manager/TKJWL_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_Telescope')
export class TKJWL_Telescope extends TKJWL_ItemBase {

    maxDistance: number = -2300;

    @property(Node)
    camera: Node = null;

    @property(Node)
    root: Node = null;

    @property(Camera)
    UICamera: Camera;

    @property(Node)
    point: Node;


    private ray: geometry.Ray = new geometry.Ray();
    private v: Vec3 = new Vec3();

    timer: number = 0;
    checkInterval: number = 0.3;


    onLoad(){
        super.onLoad();
    }

    protected start(): void {
        this.camera.active = false;
    }

    onProgressChanged(progress: number) {
        // return;
        // 处理进度变化逻辑
        this.camera.setPosition(0, 0, this.maxDistance * progress);
    }


    OnRotate(deltaEuler: Vec3) {
        if(!TKJWL_DataManager.Instance.isTelescopeWatching){
            return;
        }
        // console.log(deltaEuler);
        var euler = v3(this.root.eulerAngles);
        euler.add3f( - deltaEuler.x, deltaEuler.y, 0);
        euler.x = clamp(euler.x, -30, 30);
        euler.y = clamp(euler.y, -50, 50);
        this.root.setRotationFromEuler(euler);
    }

    update(){
        if(!TKJWL_DataManager.Instance.isTelescopeWatching){
            return;
        }

        this.timer += this.checkInterval;
        if(this.timer < this.checkInterval){
            return;
        }
        this.timer = 0;
        
        this.checkInteractItem();
    }

    private checkInteractItem() {
        // 获取相机组件
        const camera = this.camera.getComponent(Camera);
        if (!camera) return;

        let ray = this.ray;
        let v = this.v;
        this.UICamera.worldToScreen(this.point.getWorldPosition(), v);
        camera.screenPointToRay(v.x, v.y, ray);

        // 射线检测所有碰撞体
        const mask = TKJWL_Physics_Group.KILL_AREA; // 检测所有分组
        const maxDistance = 30;
        const queryTrigger = false;

        if (PhysicsSystem.instance.raycastClosest(ray, mask, maxDistance, queryTrigger)) {
            TKJWL_DataManager.Instance.isWatchingKill = true;
        }
        else{
            TKJWL_DataManager.Instance.isWatchingKill = false;
        }
    }

    protected HoldItem(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }
        TKJWL_DataManager.Instance.isTelescopeWatching = true;
        TKJWL_DataManager.Instance.HoldItem = this.node;
        //显示按钮
        let itemType = this.node.name.split("_")[1];
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM_HOLD_ON,itemType)
        this.root.setRotationFromEuler(v3(0, 0, 0));
        this.camera.active = true;
        EventManager.Scene.emit(TKJWL_GameEvents.HIDE_PLAYER_CAMERA);

        TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.在阳台用望远镜查看情况);
        if(TKJWL_DataManager.Instance.isCanKill){
            TKJWL_AudioManager.getInstance().playLongSound("杀人");
        }

        TKJWL_DataManager.Instance.Tip = "拖动左边的滑块，控制远近";
        TKJWL_DataManager.Instance.tipColor = Color.WHITE;
        EventManager.Scene.emit(TKJWL_GameEvents.UI_SHOW_TIP_PANEL);
    }

    protected ReleaseItem(){
        if(TKJWL_DataManager.Instance.HoldItem !== this.node){
            return;
        }
        TKJWL_DataManager.Instance.HoldItem = null;
        
        if(TKJWL_DataManager.Instance.isStartKill && TKJWL_DataManager.Instance.currentTask == TKJWL_TaskType.他正在向你奔来){
            EventManager.Scene.emit(TKJWL_GameEvents.SHOW_TASK_TIP,TKJWL_DataManager.Instance.currentTask);
            TKJWL_DataManager.Instance.startPolt();
        }
        TKJWL_DataManager.Instance.isTelescopeWatching = false;
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM,null)
        // EventManager.Scene.emit(TKJWL_GameEvents.END_USE_TELESCOPE);
        this.camera.active = false;
        // this.node.active = false;

        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_PLAYER_CAMERA);
        if(TKJWL_DataManager.Instance.isCanKill){
            TKJWL_AudioManager.getInstance().stopLongSound();
        }
    }





    addListener(){
        EventManager.on(TKJWL_GameEvents.TELESCOPE_PROGRESS_CHANGED, this.onProgressChanged, this);
        // EventManager.on(TKJWL_GameEvents.START_USE_TELESCOPE, this.startUse, this);
        // EventManager.on(TKJWL_GameEvents.END_USE_TELESCOPE, this.endUse, this);
        EventManager.on(TKJWL_GameEvents.CAMERA_ROTATION, this.OnRotate, this);
    }

    removeListener(){
        EventManager.off(TKJWL_GameEvents.TELESCOPE_PROGRESS_CHANGED, this.onProgressChanged, this);
        // EventManager.off(TKJWL_GameEvents.START_USE_TELESCOPE, this.startUse, this);
        // EventManager.off(TKJWL_GameEvents.END_USE_TELESCOPE, this.endUse, this);
        EventManager.off(TKJWL_GameEvents.CAMERA_ROTATION, this.OnRotate, this);
    }

    onDestroy(){

    }

}


