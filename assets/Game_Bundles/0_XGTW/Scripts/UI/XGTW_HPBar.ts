import { _decorator, Component, Sprite, Color } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';

@ccclass('XGTW_HPBar')
export default class XGTW_HPBar extends Component {
    HPBarFG: Sprite | null = null;
    Init(color: Color = Color.RED) {
        this.HPBarFG = NodeUtil.GetComponent("HPBarFG", this.node, Sprite);

        this.HPBarFG.color = color;
        this.Set(1);
    }
    Set(rate: number) {
        rate = Tools.Clamp(rate, 0, 1);
        this.HPBarFG.fillRange = rate;
    }
}