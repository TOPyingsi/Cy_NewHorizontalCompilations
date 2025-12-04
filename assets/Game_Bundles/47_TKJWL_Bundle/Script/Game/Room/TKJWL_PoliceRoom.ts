import { _decorator, Collider, Component, ITriggerEvent, Node, SkeletalAnimation, tween } from 'cc';
import { TKJWL_DataManager } from '../../Manager/TKJWL_DataManager';
import { TKJWL_RoomBase } from '../../Common/TKJWL_RoomBase';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../../Common/TKJWL_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_PoliceRoom')
export class TKJWL_PoliceRoom extends TKJWL_RoomBase {


    spine:SkeletalAnimation = null;

    protected onLoad(): void {
        this.spine = this.node.getChildByName("police").getComponent(SkeletalAnimation);
    }
    start() {
        super.start();
        this.animEndCb();
    }

    animEndCb(){
        const currentState = this.spine.getState('idle');
        if (!currentState?.isPlaying) {
            this.spine.crossFade('idle', 0.2);
        }
        this.scheduleOnce(()=>{
            //播放跑步动画
            const currentState = this.spine.getState('run');
            if (!currentState?.isPlaying) {
                this.spine.crossFade('run', 0.2);
                tween(this.node.getChildByName("police"))
                .to(2,{worldPosition:this.node.getChildByName("targetPos").worldPosition})
                .start();
                this.scheduleOnce(()=>{
                    const currentState = this.spine.getState('idle');
                    if (!currentState?.isPlaying) {
                        this.spine.crossFade('idle', 0.2);
                    }
                },2)
            }
        },1)
       
    }

    protected onDestroy(): void {

    }
}


