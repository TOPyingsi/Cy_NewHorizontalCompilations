import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_SkinPanel')
export class XYMJXXB_SkinPanel extends Component {

    OnExit() {
        this.node.active = false;

    }

}


