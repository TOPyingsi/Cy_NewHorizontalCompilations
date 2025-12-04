import { _decorator, Component, Node } from 'cc';
import { XZPQ_GameManager } from './XZPQ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_mon4')
export class XZPQ_mon4 extends Component {

    @property(Node)
    mon1Images1: Node = null;

    @property(Node)
    mon1Images2: Node = null;

    protected start(): void {
    }

    Show(active: boolean) {
        this.node.active = active;
    }

    RefreashPig() {

    }

}


