import { _decorator, Component, Node } from 'cc';

import { KKDKF_MoveTouch } from './KKDKF_MoveTouch';
import { KKDKF_Cup } from './KKDKF_Cup';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_Coldwater')
export class KKDKF_Coldwater extends KKDKF_MoveTouch {
    //抬起事件
    TouchEndEvent() {
        if (!this.Target) return;
        if (this.Target.name == "碗") {
            this.Target.getComponent(KKDKF_Cup).Add_Water_cold();
        }
        if (this.Target.name == "大杯子") {
            this.Target.getComponent(KKDKF_Cup).Add_Water_cold();
        }
    }
}


