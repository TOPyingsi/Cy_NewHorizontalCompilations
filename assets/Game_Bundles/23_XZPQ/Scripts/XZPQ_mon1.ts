import { _decorator, Component, Node } from 'cc';
import { XZPQ_GameManager } from './XZPQ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_mon1')
export class XZPQ_mon1 extends Component {

    @property(Node)
    pig_1: Node = null;

    @property(Node)
    pig_2: Node = null;

    @property(Node)
    pig_3: Node = null;

    protected start(): void {
    }

    Show(active: boolean) {
        this.node.active = active;
        this.RefreashPig();
    }

    RefreashPig() {
        if (XZPQ_GameManager.Instance.peiqi_index == 1) {
            if (!XZPQ_GameManager.Instance.peiqi_clamb) {
                this.pig_1.active = true;
                this.pig_2.active = false;
            } else {
                this.pig_1.active = false;
                this.pig_2.active = true;
            }
        } else {
            this.pig_1.active = false;
            this.pig_2.active = false;
        }
    }

}


