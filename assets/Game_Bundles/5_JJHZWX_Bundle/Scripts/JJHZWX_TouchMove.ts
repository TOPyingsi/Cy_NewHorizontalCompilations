import { _decorator, Component, debug, Node, v2, Vec2 } from 'cc';
import { JJHZWX_TouchMonitor } from './JJHZWX_TouchMonitor';
import { JJHZWX_GameManager } from './JJHZWX_GameManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZWX_TouchMove')
export class JJHZWX_TouchMove extends JJHZWX_TouchMonitor {
    @property()
    public thisupliftDistance = 300
    public Offset: Vec2 = v2(0, -300);// 触发偏移
    start(): void {
        this.upliftDistance = this.thisupliftDistance;
        super.start();
    }
    ConditionalJudgment(): boolean {
        if (this.ID == JJHZWX_GameManager.Instance.sceneIndex) {
            return true;
        } else {
            JJHZWX_GameManager.Instance.Open_mistakeTip();
            return false;
        }
    }
    TouchMoveInCident() {
        JJHZWX_GameManager.Instance.AnimationPlay(this.ID);
        this.node.active = false;
    }
}


