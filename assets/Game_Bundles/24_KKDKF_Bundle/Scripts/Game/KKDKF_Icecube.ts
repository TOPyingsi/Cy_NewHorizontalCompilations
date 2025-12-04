import { _decorator, Component, Node } from 'cc';
import { KKDKF_MoveTouch } from './KKDKF_MoveTouch';
import { KKDKF_Cup } from './KKDKF_Cup';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_Icecube')
export class KKDKF_Icecube extends KKDKF_MoveTouch {
    //抬起事件
    TouchEndEvent() {
        if (!this.Target) return;
        if (this.Target.getComponent(KKDKF_Cup)) {
            this.Target.getComponent(KKDKF_Cup).Add_Icecube();
        }
    }
}


