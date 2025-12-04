import { _decorator, Collider, Component, ITriggerEvent, Node, SkeletalAnimation } from 'cc';
import { TKJWL_RoomBase } from '../../Common/TKJWL_RoomBase';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_DanceRoom')
export class TKJWL_DanceRoom extends TKJWL_RoomBase {

   
    spine:SkeletalAnimation = null;

    protected onLoad(): void {
        this.spine = this.node.getComponent(SkeletalAnimation);
    }
    start() {

    }

    addListener(){

    }

    removeListener(){

    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


