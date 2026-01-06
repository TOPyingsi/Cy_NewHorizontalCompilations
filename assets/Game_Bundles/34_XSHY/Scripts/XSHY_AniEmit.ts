import { _decorator, Component, Node, v2 } from 'cc';
import { XSHY_Unit } from './XSHY_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHY_AniEmit')
export class XSHY_AniEmit extends Component {
    Emit(AniName: string) {
        this.node.parent.getComponent(XSHY_Unit).AniEmit(AniName);
    }
    MovePosX(num: number, Time: number = 0.1) {
        this.node.parent.getComponent(XSHY_Unit).MovePos(v2(num, 0), Time);
    }
    MovePosY(num: number, Time: number = 0.1) {
        this.node.parent.getComponent(XSHY_Unit).MovePos(v2(0, num), Time);
    }
    Turnto() {
        this.node.parent.getComponent(XSHY_Unit).TurnTo();
    }
}


