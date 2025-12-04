import { _decorator, Component, Node } from 'cc';
import { SJNDGZ_PICKAXE } from './SJNDGZ_Constant';
const { ccclass, property } = _decorator;

@ccclass('SJNDGZ_Pickaxe')
export class SJNDGZ_Pickaxe extends Component {
    Name: string = "";
    Num: number = 1;
    Gain: number = 1;//增益

    constructor(name: string, gain: number) {
        super();
        this.Name = name;
        this.Num = 1;
        this.Gain = gain;
    }
}


