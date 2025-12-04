import { _decorator, Component, director, Node, System } from 'cc';
import { placementSystem } from './WLSYS_placementSystem';
import { InputManager } from '../Manager/WLSYS_InputManager';
const { ccclass, property } = _decorator;


enum placementEvent{
    TouchStart = "TouchStart",
    TouchEnd = "TouchEnd"
}

@ccclass('eventSystem')
export class eventSystem extends Component {
    static instance : eventSystem = null;

    @property(Node)
    placementSystem : Node = null;
    @property(Node)
    InputManager : Node = null;

    protected onLoad(): void {
        eventSystem.instance = this;
    }

    protected onEnable(): void {
        this.node.on(placementEvent.TouchStart, this.PlacementTouchStart, this);
        this.node.on(placementEvent.TouchEnd, this.PlacementTouchEnd, this);
        
    }
    
    PlacementTouchStart(){
        
    }
    
    PlacementTouchEnd(){
        
    }
    
    protected onDisable(): void {
        this.node.off(placementEvent.TouchStart, this.PlacementTouchStart, this);
        this.node.off(placementEvent.TouchEnd, this.PlacementTouchEnd, this);
    }

}


