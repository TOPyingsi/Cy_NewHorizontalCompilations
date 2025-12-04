import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_SkinPanel')
export class XYMJ_SkinPanel extends Component {

    OnExit() {
        this.node.active = false;

    }

}


