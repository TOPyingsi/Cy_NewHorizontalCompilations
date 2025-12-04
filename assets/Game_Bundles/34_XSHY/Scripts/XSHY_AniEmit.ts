import { _decorator, Component, Node } from 'cc';
import { XSHY_Unit } from './XSHY_Unit';
const { ccclass, property } = _decorator;

@ccclass('XSHY_AniEmit')
export class XSHY_AniEmit extends Component {
    Emit(AniName: string) {
        this.node.parent.getComponent(XSHY_Unit).AniEmit(AniName);
    }
}


