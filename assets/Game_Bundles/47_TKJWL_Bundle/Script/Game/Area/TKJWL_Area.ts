import { _decorator, Collider, Component, ITriggerEvent, Node } from 'cc';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_Area')
export class TKJWL_Area extends Component {

    collider:Collider = null;
    start() {
        this.addListener();
        if(!TKJWL_DataManager.Instance.isStartPlot){
            this.node.active = false;
        }
    }

    openTrgger(areaId:string){
        if(areaId !== this.node.name.split("_")[1]){
            return;
        }
        this.node.active = true;
    }

    CloseTrgger(areaId:string){
        if(areaId !== this.node.name.split("_")[1]){
            return;
        }
        this.node.active = false;
    }

    onTriggerEnter(event: ITriggerEvent) {
        if(event.otherCollider.node.name == "Player"){
            TKJWL_DataManager.Instance.setPoltArea(this.node.name,true);
            // this.node.active = false;
        }
    }

    onTriggerExit(event: ITriggerEvent) {
        if(event.otherCollider.node.name == "Player"){
            TKJWL_DataManager.Instance.setPoltArea(this.node.name,false);
            // this.node.active = false;
        }
    }



    addListener(){
        EventManager.on(TKJWL_GameEvents.OPEN_AREA,this.openTrgger,this)
        EventManager.on(TKJWL_GameEvents.CLOSE_AREA,this.CloseTrgger,this)

        this.collider = this.node.getComponent(Collider);
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
        this.collider.on('onTriggerExit', this.onTriggerExit, this);

    }

    removeListener(){
        EventManager.off(TKJWL_GameEvents.OPEN_AREA,this.openTrgger,this)
        EventManager.off(TKJWL_GameEvents.CLOSE_AREA,this.CloseTrgger,this)

    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


