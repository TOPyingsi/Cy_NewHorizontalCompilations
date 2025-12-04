import { _decorator, Component, Node } from 'cc';
import { NBSYS_TouchMonitor } from '../NBSYS_TouchMonitor';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_alcohol_burner')
export class NBSYS_alcohol_burner extends NBSYS_TouchMonitor {
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
}


