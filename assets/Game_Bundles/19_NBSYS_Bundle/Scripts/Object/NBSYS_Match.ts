import { _decorator, Collider2D, Component, EventTouch, IPhysics2DContact, Node } from 'cc';
import { NBSYS_TouchMonitor } from '../NBSYS_TouchMonitor';
import { NBSYS_Candle } from './NBSYS_Candle';
import { NBSYS_alcohol_burner } from './NBSYS_alcohol_burner';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_Match')
export class NBSYS_Match extends NBSYS_TouchMonitor {
    public isActive: boolean = false;


    start() {
        super.start();
    }
    //进入碰撞
    OnCollider(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        super.OnCollider(selfCollider, otherCollider, contact);
        if (otherCollider.node.name == "蜡烛") {
            otherCollider.node.getComponent(NBSYS_Candle)?.SetBurn(true);
        }
        if (otherCollider.node.name == "酒精灯") {
            otherCollider.node.getComponent(NBSYS_alcohol_burner)?.SetBurn(true);
        }
    }
}


