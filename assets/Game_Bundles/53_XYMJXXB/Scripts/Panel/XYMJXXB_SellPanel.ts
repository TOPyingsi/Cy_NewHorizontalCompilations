import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_SellPanel')
export class XYMJXXB_SellPanel extends Component {
    start() {

    }

    OnExit() {
        this.node.active = false;
    }
}


