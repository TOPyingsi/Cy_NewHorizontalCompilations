import { _decorator, Component, Node, v3 } from 'cc';
import { KKDKF_MoveTouch } from './KKDKF_MoveTouch';
import { KKDKF_CoffeeGroove } from './KKDKF_CoffeeGroove';
import { KKDKF_Incident } from '../KKDKF_Incident';
import { KKDKF_EventManager, KKDKF_MyEvent } from '../KKDKF_EventManager';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_Planish')
export class KKDKF_Planish extends KKDKF_MoveTouch {
    //抬起事件
    TouchEndEvent() {
        if (!this.Target) return;
        if (this.Target.name == "咖啡槽" && this.Target.getComponent(KKDKF_CoffeeGroove).State == 1) {
            this.IsEnable = false;
            this.PlayAnimation1();
        }
    }
    //压咖啡
    PlayAnimation1() {
        let kfc = this.node.parent.getChildByName("咖啡槽");
        KKDKF_Incident.Tween_To(this.node, kfc.position.subtract(v3(0, -180, 0)), 0.5, () => {
            KKDKF_Incident.Tween_To(this.node, kfc.position.subtract(v3(0, -112, 0)), 0.5, () => {
                kfc.getComponent(KKDKF_CoffeeGroove).SetState(2);
                this.scheduleOnce(() => {
                    this.node.position = this.StarPosition.clone();
                    this.IsEnable = true;
                    KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.拖动碾压器到咖啡勺子);
                    KKDKF_Incident.Tween_To(kfc, kfc.getComponent(KKDKF_CoffeeGroove).StarPosition, 1, () => {
                        kfc.getComponent(KKDKF_CoffeeGroove).IshaveCoffemachine = true;
                    });
                }, 1)
            });
        });

    }
}


