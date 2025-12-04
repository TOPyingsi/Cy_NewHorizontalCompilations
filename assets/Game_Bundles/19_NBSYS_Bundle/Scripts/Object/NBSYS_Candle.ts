import { _decorator, Collider2D, Component, IPhysics2DContact, Node } from 'cc';
import { NBSYS_TouchMonitor } from '../NBSYS_TouchMonitor';
import { NBSYS_QiNan } from './NBSYS_QiNan';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_Candle')
export class NBSYS_Candle extends NBSYS_TouchMonitor {
    public IsBurn: boolean = false;//是否燃烧态

    start() {
        super.start();
    }

    SetBurn(IsBurn: boolean) {
        this.IsBurn = IsBurn;
        if (this.IsBurn) {
            this.node.getChildByName("火苗特效").active = true;
        } else {
            this.node.getChildByName("火苗特效").active = false;
        }
    }

    //事件接口,抬起事件
    TouchMoveInCident() {
        if (this.Lasttarget?.name == "气囊" && this.IsBurn) {
            this.Lasttarget.getComponent(NBSYS_QiNan)?.Add_Candle();
            this.scheduleOnce(() => {
                this.node.destroy();
            })
        }
    }
}


