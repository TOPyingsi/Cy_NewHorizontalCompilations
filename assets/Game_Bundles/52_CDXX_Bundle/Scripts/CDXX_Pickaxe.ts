import { _decorator, Component, Node } from 'cc';
import { CDXX_PICKAXE } from './CDXX_Constant';
const { ccclass, property } = _decorator;

@ccclass('CDXX_Pickaxe')
export class CDXX_Pickaxe extends Component {
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


