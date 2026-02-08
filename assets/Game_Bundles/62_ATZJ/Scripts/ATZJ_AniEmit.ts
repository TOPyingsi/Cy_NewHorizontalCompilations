import { _decorator, Component, Node, v2 } from 'cc';
import { ATZJ_Unit } from './ATZJ_Unit';
const { ccclass, property } = _decorator;

@ccclass('ATZJ_AniEmit')
export class ATZJ_AniEmit extends Component {
    Emit(AniName: string) {
        this.node.parent.getComponent(ATZJ_Unit).AniEmit(AniName);
    }
    MovePosX(num: number, Time: number = 0.1) {
        this.node.parent.getComponent(ATZJ_Unit).MovePos(v2(num, 0), Time);
    }
    MovePosY(num: number, Time: number = 0.1) {
        this.node.parent.getComponent(ATZJ_Unit).MovePos(v2(0, num), Time);
    }
    Turnto() {
        this.node.parent.getComponent(ATZJ_Unit).TurnTo();
    }
}


