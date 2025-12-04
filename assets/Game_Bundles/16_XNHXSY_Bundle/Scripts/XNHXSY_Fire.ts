import { _decorator, Component, Label, Node, tween, v3, Vec3 } from 'cc';
import { XNHXSY_TouchMonitor } from './XNHXSY_TouchMonitor';
import { XNHXSY_GameData } from './XNHXSY_GameData';
import { XNHXSY_GameManager } from './XNHXSY_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XNHXSY_Fire')
export class XNHXSY_Fire extends XNHXSY_TouchMonitor {

    //是否在烧杯底下
    public IsOnCpuDown: boolean = false;

    start() {
        super.start();
        this.InitPoint = this.node.position.clone();
    }


    OnTouchDown(even) {
        if (XNHXSY_GameManager.GameScene == 0) {
            if (XNHXSY_GameManager.Instance.courseIndex == 4) {
                XNHXSY_GameManager.Instance.UINode.getChildByName("小手3").active = false;
                XNHXSY_GameManager.Instance.courseIndex = 5;
            }
        }
        let cuppos: Vec3 = this.TargetNode.worldPosition.clone().subtract(v3(0, 300));
        if (this.IsOnCpuDown) {
            //离开烧杯底下且删除高温
            XNHXSY_GameManager.Instance.Beaker.Sub("高温");
            this.restoration();
            this.IsOnCpuDown = false;
        } else {
            //移动到烧杯底下且加入高温
            tween(this.node)
                .to(0.5, { worldPosition: cuppos })
                .call(() => {
                    XNHXSY_GameManager.Instance.Beaker.Add("高温");
                    this.IsOnCpuDown = true;
                })
                .start();
        }
    }


}


