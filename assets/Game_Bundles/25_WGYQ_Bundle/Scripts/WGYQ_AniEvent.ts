import { _decorator, Animation, Component, Node } from 'cc';
import { WGYQ_BattlePanel } from './WGYQ_BattlePanel';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_AniEvent')
export class WGYQ_AniEvent extends Component {

    CountEnd() {
        WGYQ_BattlePanel.Instance.BattleStart();
    }

    CarEnd() {
        this.node.parent.active = false;
    }

    ActionEnd() {
        this.getComponent(Animation).play("playermove");
    }

    AtkEnd() {
        PoolManager.PutNode(this.node);
    }

    KiteHit() {
        WGYQ_BattlePanel.Instance.KiteHit();
    }

}


