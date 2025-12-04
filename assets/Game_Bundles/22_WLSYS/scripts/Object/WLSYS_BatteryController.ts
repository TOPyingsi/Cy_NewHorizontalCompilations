import { _decorator, Component, director, Node } from 'cc';
import { ObjectController } from './WLSYS_ObjectController';
import { circuitSystem } from '../System/WLSYS_circuitSystem';
const { ccclass, property } = _decorator;

enum RotationType { // 以初始状态开始旋转幅度每逆时针90度一档次 {0, 90, 180, 270}
    stateFirst,
    stateSecond,
    stateThird,
    stateFourth
}
enum Direction {
    left,
    right,
    up,
    down,
}

@ccclass('BatteryController')
export class BatteryController extends ObjectController {
    
    circuit : circuitSystem = new circuitSystem();

    protected onLoad(): void {
        super.onLoad();
        this.beNode = true;
        this.Onele = 1;
    }

    negativePole : Direction;
    positivePole : Direction;

    BatteryState: number[][] = [[0, 0], [0, 1], [0, 1], [0, 1]
    , [0, 0], [-1, -1], [-1, -1], [-1, -1], [0, 0], [-1, -1], [-1, -1], [-1, -1], [0, 0], [-1, 0], [-1, -1], [-1, -1]];

    CanbuildGraph : boolean = false;
    override initEle(): void {
        this.Onele = 1;
    }
    override checkType(): void {
        if (this.isDestroy){
            return;
        }
        let curType = 0;
        if (this.leftController && !this.leftController.isDestroy) curType += 8;
        if (this.rightController && !this.rightController.isDestroy) curType += 4;
        if (this.upController && !this.upController.isDestroy) curType += 2;
        if (this.downController && !this.downController.isDestroy) curType += 1;
        if (this.BatteryState[curType][0] == -1){
            console.error("警告！警告！错误的电池摆放");
        }else{
            this.buildCircuit(curType);
        }
    }

    private buildCircuit(curType: number) {
        if (this.isDestroy){
            return;
        }
        this.rotationType = this.BatteryState[curType][1];
        if (this.leftController && this.rightController) {
            this.CanbuildGraph = true;
        } 
        if (this.CanbuildGraph) {
            this.circuit.setBattery(this);
            this.circuit.buildGraph();
        }
    }

    override freshState(): void {
        this.sp.node.angle = this.rotationType * 90;
    }
}


