import { _decorator, Button, Component, Node, SpriteFrame } from 'cc';
import { ObjectController } from './WLSYS_ObjectController';
import { BatteryController } from './WLSYS_BatteryController';
const { ccclass, property } = _decorator;

@ccclass('SwitchController')
export class SwitchController extends ObjectController {
    @property([SpriteFrame])
    sps : SpriteFrame[] = [];
    static cnt : number = 0;
    curType : boolean = false;

    batteryBelong : BatteryController = null;

    setBattery(battery : BatteryController){
        this.batteryBelong = battery;
    }

    protected override onLoad(): void {
        super.onLoad();
        this.beNode = false;
        this.canCross = false;
        this.equleWire = false;
    }
    
    override setEle(type: number): void {
        super.setEle(type);
    }
    override initEle(): void {
        this.Onele = 0;
    }
    freshState(){
    }
    
    freshCircuit(){
        this.curType = !this.curType;
        this.equleWire = !this.equleWire;
        this.beNode = !this.beNode;
        this.sp.spriteFrame = this.sps[Number(this.curType)];
        this.canCross = this.curType;
        if (this.batteryBelong && !this.batteryBelong.isDestroy){
            this.batteryBelong.checkType();
        }
    }

    override onSomething(): void {
        super.onSomething();
        this.button.enabled = true;
        this.button.node.on(Button.EventType.CLICK, this.freshCircuit, this);
    }
    protected override onDisable(): void {
        super.onDisable();
        this.button.node.off(Button.EventType.CLICK, this.freshCircuit, this);
    }
}


