import { _decorator, clamp, Component, Node, tween, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
import { TKJWL_ItemBase } from '../../Common/TKJWL_ItemBase';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_LightSwitch')
export class TKJWL_LightSwitch extends TKJWL_ItemBase {

    @property(Node)
    lightNode:Node = null;


    isLightOpen:boolean = false;

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


    closeLight(lightId?:number){
        if(!lightId){
            this.lightNode.active = false;
            this.isLightOpen = false;
        }
        else{
            let selfLightId = this.node.name.split("_")[2];
            if(selfLightId == lightId.toString()){
                this.lightNode.active = false;
                this.isLightOpen = false;
            }
        }
    }

    openLight(lightId?:number){
        if(!lightId){
            this.lightNode.active = true;
             this.isLightOpen = true;
        }
        else{
            let selfLightId = this.node.name.split("_")[2];
            if(selfLightId == lightId.toString()){
                this.lightNode.active = true;
                this.isLightOpen = true;
            }
        }
    }



    protected Interact(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }
        if(this.isLightOpen){
            this.closeLight()
            // this.isLightOpen = false;
        }
        else{
            this.openLight()
            // this.isLightOpen = true;
        }
    }


    addListener(){
        EventManager.on(TKJWL_GameEvents.OPEN_LIGHT,this.openLight,this)
        EventManager.on(TKJWL_GameEvents.CLOSE_LIGHT,this.closeLight,this)
    }

    removeListener(){
        EventManager.off(TKJWL_GameEvents.OPEN_LIGHT,this.openLight,this)
        EventManager.off(TKJWL_GameEvents.CLOSE_LIGHT,this.closeLight,this)

    }

    onDestroy(){
        this.removeListener();
    }

}


