import { _decorator, Component, Node } from 'cc';
import { NBSYS_TouchMonitor } from '../NBSYS_TouchMonitor';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_Cup')
export class NBSYS_Cup extends NBSYS_TouchMonitor {
    @property()
    public substance: string = "";//瓶中物质
    start(): void {
        super.start();

    }


}


