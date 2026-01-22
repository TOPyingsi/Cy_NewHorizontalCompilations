import { _decorator, Component, Node } from 'cc';
import { CDXX2_PICKAXE } from './CDXX2_Constant';
const { ccclass, property } = _decorator;

//用来记录一把镐子的名字、持有数量和增益系数，供存档与计算战力时使用。

@ccclass('CDXX2_Pickaxe')
export class CDXX2_Pickaxe extends Component {
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


