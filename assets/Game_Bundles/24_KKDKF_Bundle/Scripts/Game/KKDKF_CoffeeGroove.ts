import { _decorator, Component, Node, v3 } from 'cc';

import { KKDKF_MoveTouch } from './KKDKF_MoveTouch';
import { KKDKF_EventManager, KKDKF_MyEvent } from '../KKDKF_EventManager';
import { KKDKF_Incident } from '../KKDKF_Incident';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_CoffeeGroove')
export class KKDKF_CoffeeGroove extends KKDKF_MoveTouch {

    public State: number = 0;//0全空态1.有咖啡豆2.咖啡豆压碎了
    public IshaveCoffemachine: boolean = true;//是否在咖啡机器下
    //抬起事件
    TouchEndEvent() {
        if (!this.Target) return;
        if (this.Target.name == "咖啡豆遮罩" && this.State == 0) {
            this.IsEnable = false;
            this.PlayAnimation1();
        }
    }


    SetState(State: number) {
        this.State = State;
        if (State == 0) {
            this.node.getChildByName("咖啡豆").active = false;
            this.node.getChildByName("咖啡粉").active = false;
        }
        if (State == 1) {
            this.node.getChildByName("咖啡豆").active = true;
            this.node.getChildByName("咖啡粉").active = false;
        }
        if (State == 2) {
            this.IsEnable = true;
            this.node.getChildByName("咖啡豆").active = false;
            this.node.getChildByName("咖啡粉").active = true;
        }
    }

    //播放动画1(到咖啡机装豆子然后到压碎机左边)
    PlayAnimation1() {
        this.IshaveCoffemachine = false;
        KKDKF_Incident.Tween_To(this.node, this.node.parent.getChildByName("咖啡豆遮罩").getPosition().subtract(v3(0, 100, 0)), 0.5, () => {
            this.scheduleOnce(() => {
                this.SetState(1);
                KKDKF_Incident.Tween_To(this.node, this.node.parent.getChildByName("压平器").getPosition().subtract(v3(140, 50, 0)), 0.5);
                KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.拖动咖啡勺到机器下);
            }, 1)
        });
    }
}


