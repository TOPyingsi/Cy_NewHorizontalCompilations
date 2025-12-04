import { _decorator, color, Component, Label, Node, Sprite } from 'cc';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { XGTW_QualityColorHex } from '../Framework/Const/XGTW_Constant';
const { ccclass, property } = _decorator;


@ccclass('XGTW_ItemNameTitle')
export default class XGTW_ItemNameTitle extends Component {
    Label: Label | null = null;
    QualityBar: Node | null = null;
    onLoad() {
        this.Label = this.node.getComponent(Label);
        this.QualityBar = NodeUtil.GetNode("QualityBar", this.node);
    }
    Init() {
        this.QualityBar.getComponent(Sprite).color = color().fromHEX(XGTW_QualityColorHex.Epic);
    }
    start() {

    }
}