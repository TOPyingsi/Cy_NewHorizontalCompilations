import { _decorator, Component, Sprite, Color } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';

@ccclass('XGTS_HPBar')
export default class XGTS_HPBar extends Component {
    HPBarFG: Sprite | null = null;

    protected onLoad(): void {
        if(!this.HPBarFG){
            this.HPBarFG = NodeUtil.GetComponent("HPBarFG", this.node, Sprite);
        }
    }

    Init(color: Color = Color.RED) {
        if(!this.HPBarFG){
            this.HPBarFG = NodeUtil.GetComponent("HPBarFG", this.node, Sprite);
        }
        this.HPBarFG.color = color;
        this.Set(1);
    }

    Set(rate: number) {
        if(!this.HPBarFG){
            this.HPBarFG = NodeUtil.GetComponent("HPBarFG", this.node, Sprite);
        }
        rate = Tools.Clamp(rate, 0, 1);
        this.HPBarFG.fillRange = rate;
    }
}