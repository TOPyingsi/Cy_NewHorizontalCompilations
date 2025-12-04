import { _decorator, clamp, Component, Node, RigidBody, tween, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
import { TKJWL_ItemBase } from '../../Common/TKJWL_ItemBase';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
import { TKJWL_TaskType } from '../../Common/TKJWL_TaskType';
import { TKJWL_Physics_Group } from '../../Common/TKJWL_PHY_GROUP';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_Knob')
export class TKJWL_Knob extends TKJWL_ItemBase {

    @property(Boolean)
    IsOpen:boolean = false;


    // isOpening:boolean = false;

    onLoad(){
        super.onLoad();
    }

    protected start(): void {
    }


    open(){
        let currentAngle = this.node.eulerAngles;
        let newAngle = v3(currentAngle.x,currentAngle.y,90);
        tween(this.node)
        .to(0.3,{eulerAngles:newAngle})
        .call(()=>{
            TKJWL_DataManager.Instance.updateTask(TKJWL_TaskType.打开煤气灶烧水);
        })
        .delay(1)
        .call(()=>{
            this.node.getChildByName("selected").active = false;
            this.getComponent(RigidBody).group = TKJWL_Physics_Group.DEFAULT;
            this.noramlNodes.forEach(node => {
                node.layer = 1 << 30;
            });
        })
        .start();
        // this.isOpening = false;
    }

    close(){
        let currentAngle = this.node.eulerAngles;
        let newAngle = v3(currentAngle.x,currentAngle.y,90);
        tween(this.node)
        .to(0.3,{eulerAngles:newAngle})
        .start();
        // this.isOpening = true;
    }



    protected Interact(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return; 
        }
  
        else{
            this.close()
        }
    }

    protected OpenFire(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }
        this.open()
    }

    protected CloseFire(){
        if(TKJWL_DataManager.Instance.lookAtItem !== this.node){
            return;
        }
        this.close()
    }



    addListener(){

    }

    removeListener(){

    }

    onDestroy(){

    }

}


