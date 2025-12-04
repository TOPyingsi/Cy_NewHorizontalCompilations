import { _decorator, Component, Node } from 'cc';
import { XZPQ_GameManager } from './XZPQ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_mon3')
export class XZPQ_mon3 extends Component {

    @property(Node)
    pig: Node = null;

    protected start(): void {
    }

    Show(active: boolean) {
        this.node.active = active;

        this.RefreashPig();
    }

    RefreashPig() {
        if (XZPQ_GameManager.Instance.qiaozhi_index == 3) {
            this.pig.active = true;
        } else {
            this.pig.active = false;
        }
    }


}


