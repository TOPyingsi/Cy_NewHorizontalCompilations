import { _decorator, Component, Sprite, Label, Color, color } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';

@ccclass('XGTW_ValueBar')
export default class XGTW_ValueBar extends Component {
    ValueBarFG: Sprite | null = null;
    TitleLabel: Label | null = null;
    protected onLoad(): void {
        this.ValueBarFG = NodeUtil.GetComponent("ValueBarFG", this.node, Sprite);
        this.TitleLabel = NodeUtil.GetComponent("TitleLabel", this.node, Label);
    }
    Init(value: number = 1, name: string = ``, color: Color = Color.WHITE) {
        this.ValueBarFG = NodeUtil.GetComponent("ValueBarFG", this.node, Sprite);
        this.TitleLabel = NodeUtil.GetComponent("TitleLabel", this.node, Label);
        this.ValueBarFG.color = color;
        this.TitleLabel.string = name;

        this.Set(value);
    }
    Set(rate: number) {
        rate = Tools.Clamp(rate, 0, 1);
        this.ValueBarFG.fillRange = rate;
        if (this.TitleLabel.string == "耐久度") {
            this.ValueBarFG.color = color(255, 255 * rate, 255 * rate, 255);
        }
    }
    SetAll(rate: number, name: string = ``) {
        rate = Tools.Clamp(rate, 0, 1);
        this.ValueBarFG.fillRange = rate;
        this.TitleLabel.string = name;
        if (this.TitleLabel.string == "耐久度") {
            this.ValueBarFG.color = color(255, 255 * rate, 255 * rate, 255);
        }
    }
}