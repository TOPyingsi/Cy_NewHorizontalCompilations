import { _decorator, clamp, Color, Component, Node, tween, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
import { TKJWL_ItemBase } from '../../Common/TKJWL_ItemBase';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
import { TKJWL_AudioManager } from '../../Manager/TKJWL_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_Door')
export class TKJWL_Door extends TKJWL_ItemBase {

    @property(Boolean)
    IsOutDoor:boolean = false;

    

    @property(Boolean)
    isOpening:boolean = false;

    onLoad(){
        super.onLoad();
    }

    protected start(): void {
 
    }

    protected onLookAt(): void {
        super.onLookAt();
        this.node.getChildByName("normal").active = false;
    }

    protected onCanelLookAt(){
        super.onCanelLookAt();
        //取消选中
        this.node.getChildByName("normal").active = true;
    }


    closeDoor(){
        tween(this.node)
        .to(0.3,{eulerAngles:v3(0,0,0)})
        .start();
        this.isOpening = false;
        tween(this.node)
        .delay(0.1)
        .call(()=>{
            if(this.node.name !== "item_Refrigerator"){
                TKJWL_AudioManager.getInstance().playSound("关门")
            }
        })
        .start();
    }

    openDoor(){
        let eulerAngles:Vec3 = null
        if(this.IsOutDoor){
            eulerAngles = v3(0,90,0)
        }
        else{
            eulerAngles = v3(0,-90,0)
        }
        if(this.node.name !== "item_Refrigerator"){
            TKJWL_AudioManager.getInstance().playSound("开门")
        }
        
        tween(this.node)
        .to(0.3,{eulerAngles:eulerAngles})
        .start();
        this.isOpening = true;

    }



    protected Interact(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }

        if(this.node.parent.name.split("_")[1] == "7"){
            TKJWL_DataManager.Instance.Tip = "夜深危险，不建议出门";
            TKJWL_DataManager.Instance.tipColor = Color.WHITE;
            EventManager.Scene.emit(TKJWL_GameEvents.UI_SHOW_TIP_PANEL);
            return;
        }
        if(this.isOpening){
            this.closeDoor()
            TKJWL_DataManager.Instance.setDoor(this.node.parent.name.split("_")[1],false);
        }
        else{
            this.openDoor()
            TKJWL_DataManager.Instance.setDoor(this.node.parent.name.split("_")[1],true);
        }
    }

    onOpenDoor(doorId:string){
        if(doorId !== this.node.parent.name.split("_")[1]){
            return;
        }
        this.openDoor()
    }

    onCloseDoor(doorId:string){
        if(doorId !== this.node.parent.name.split("_")[1]){
            return;
        }
        this.closeDoor()
    }


    addListener(){

        EventManager.Scene.on(TKJWL_GameEvents.CLOSE_DOOR,this.onCloseDoor,this);
        EventManager.Scene.on(TKJWL_GameEvents.OPEN_DOOR,this.onOpenDoor,this);

    }

    removeListener(){
        EventManager.Scene.off(TKJWL_GameEvents.CLOSE_DOOR,this.onCloseDoor,this);
        EventManager.Scene.off(TKJWL_GameEvents.OPEN_DOOR,this.onOpenDoor,this);

    }

    onDestroy(){

    }

}


