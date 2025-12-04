import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TipController')
export class TipController extends Component {

    windowsDisapear(){
        this.node.setScale(0, 0, 0);
    }
}


