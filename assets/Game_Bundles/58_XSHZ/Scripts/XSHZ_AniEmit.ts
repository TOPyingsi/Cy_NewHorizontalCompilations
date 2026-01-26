import { _decorator, Component, Node, v2 } from 'cc';
import { XSHZ_Unit } from './XSHZ_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_AniEmit')
export class XSHZ_AniEmit extends Component {
    Emit(AniName: string) {
        this.node.parent.getComponent(XSHZ_Unit).AniEmit(AniName);
    }
    MovePosX(num: number, Time: number = 0.1) {
        this.node.parent.getComponent(XSHZ_Unit).MovePos(v2(num, 0), Time);
    }
    MovePosY(num: number, Time: number = 0.1) {
        this.node.parent.getComponent(XSHZ_Unit).MovePos(v2(0, num), Time);
    }
    Turnto() {
        this.node.parent.getComponent(XSHZ_Unit).TurnTo();
    }
}


