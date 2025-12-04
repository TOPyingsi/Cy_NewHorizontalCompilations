import { _decorator, Component, Node } from 'cc';
import { XZPQ_GameManager } from './XZPQ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_mon_home')
export class XZPQ_mon_home extends Component {

    @property(Node)
    pig: Node = null;

    isFirst: boolean = true;
    protected onLoad(): void {
        this.pig.active = false;
    }
    protected start(): void {
    }

    Show(active: boolean) {
        this.node.active = active;
    }

    RefreashPig() {
        if (XZPQ_GameManager.Instance.qiaozhi_index == -1) {
            this.pig.active = true;
        } else {
            this.pig.active = false;
            if (this.isFirst) {
                this.isFirst = false;
            }

            // XZPQ_GameManager.Instance.aniCtrlTs2.StartAction();
        }
    }

}


