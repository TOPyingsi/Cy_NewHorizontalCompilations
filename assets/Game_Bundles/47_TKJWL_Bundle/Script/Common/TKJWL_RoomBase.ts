import { _decorator, Collider, Component, ITriggerEvent, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_DataManager } from '../Manager/TKJWL_DataManager';
import { TKJWL_GameEvents } from './TKJWL_GameEvents';

const { ccclass, property } = _decorator;

@ccclass('TKJWL_RoomBase')
export class TKJWL_RoomBase extends Component {

    collider:Collider = null;
    start() {
        this.addListener();
        // if(!TKJWL_DataManager.Instance.isTelescopeWatching){
        if(this.node.name == "room_idleMonster"){
            this.node.active = true;
        }
        else{
            this.node.active = false;
        }
        // }
    }

    openRoom(areaId:string){
        if(areaId !== this.node.name.split("_")[1]){
            return;
        }
        this.node.active = true;
    }

    CloseRoom(areaId:string){
        if(areaId !== this.node.name.split("_")[1]){
            return;
        }
        this.node.active = false;
    }


    addListener(){
        EventManager.on(TKJWL_GameEvents.OPEN_ROOM,this.openRoom,this)
        EventManager.on(TKJWL_GameEvents.CLOSE_ROOM,this.CloseRoom,this)
    }

    removeListener(){
        EventManager.off(TKJWL_GameEvents.OPEN_ROOM,this.openRoom,this)
        EventManager.off(TKJWL_GameEvents.CLOSE_ROOM,this.CloseRoom,this)

    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


