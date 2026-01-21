import { _decorator, Component, Node, Vec3, RigidBody, Collider, ITriggerEvent } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { GML_Events } from './GML_Events';
import { GML_GameManager } from './GML_GameManager';
const { ccclass, property } = _decorator;

// 定义车辆抵达终点的回调函数类型
export type CarArriveCallback = () => void;

@ccclass('GML_PassArea')
export class GML_PassArea extends Component {

    trigger: Collider = null!;

    onLoad() {
        this.addListener();
    }

    onTriggerEnter(event: ITriggerEvent) {
        if(event.otherCollider.node.name == "Player"){
            GML_GameManager.Instance.passGame();
            console.log("通过游戏");
        }
    }

    onTriggerExit(event: ITriggerEvent) {
        if(event.otherCollider.node.name == "Player"){
        }
    }

  


    addListener(){
        this.trigger = this.node.getComponent(Collider);
        this.trigger.on('onTriggerEnter', this.onTriggerEnter, this);
        this.trigger.on('onTriggerExit', this.onTriggerExit, this);
    }

    removeListener(){
    }

    // 车辆销毁前重置刚体速度，防止内存残留
    protected onDestroy(): void {
        this.removeListener();
    }
}