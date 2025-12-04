import { _decorator, Component, Label, Node, Sprite, UITransform, Vec2 } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
const { ccclass, property } = _decorator;

export enum GridCellState {
    None = "#FFFFFF00",
    CanPut = "#A4FFA43C",
    CanntPut = "#FFA4A43C"
}

@ccclass('SJZ_GridCell')
export class SJZ_GridCell extends Component {
    Trans: UITransform = null;
    Background: Sprite = null;

    pos: Vec2 = new Vec2();

    protected onLoad(): void {
        this.Trans = this.node.getComponent(UITransform);
        this.Background = NodeUtil.GetComponent("Background", this.node, Sprite);
    }

    SetState(state: GridCellState) {
        this.Background.color = Tools.GetColorFromHex(state);
    }

    ClearState() {
        this.Background.color = Tools.GetColorFromHex(GridCellState.None);
    }

}