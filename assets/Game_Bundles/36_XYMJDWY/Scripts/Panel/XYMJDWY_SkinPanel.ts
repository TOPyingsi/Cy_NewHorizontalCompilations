import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_SkinPanel')
export class XYMJDWY_SkinPanel extends Component {

    OnExit() {
        this.node.active = false;

    }

}


