import { _decorator, color, Component, Label, Node, Sprite } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { XGTS_QualityColorHex } from './XGTS_Constant';
const { ccclass, property } = _decorator;


@ccclass('XGTS_ItemNameTitle')
export default class XGTS_ItemNameTitle extends Component {
    Label: Label | null = null;
    QualityBar: Node | null = null;
    onLoad() {
        this.Label = this.node.getComponent(Label);
        this.QualityBar = NodeUtil.GetNode("QualityBar", this.node);
    }
    Init() {
        this.QualityBar.getComponent(Sprite).color = color().fromHEX(XGTS_QualityColorHex.Epic);
    }
    start() {

    }
}