import { _decorator, Component, math, Node, Tween, tween, v3, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { SJZ_Constant } from '../SJZ_Constant';
const { ccclass, property } = _decorator;

const originalPos: Vec3 = v3();

@ccclass('SJZ_ArrowGuide')
export class SJZ_ArrowGuide extends Component {
    Arrow: Node = null;

    @property({ type: Number })
    floatHeight: number = 20; // 上下浮动的高度

    @property({ type: Number })
    duration: number = 0.5;

    target: Node = null;

    protected onLoad(): void {
        this.Arrow = NodeUtil.GetNode("Arrow", this.node);
        originalPos.set(this.node.position.clone());
        this.HIDE_TUTORIAL();
        EventManager.on(SJZ_Constant.Event.SHOW_TUTORIAL, this.SHOW_TUTORIAL, this);
        EventManager.on(SJZ_Constant.Event.HIDE_TUTORIAL, this.HIDE_TUTORIAL, this);
    }

    SHOW_TUTORIAL(target: Node) {
        if (!target) return;
        this.node.active = true;
        this.target = target;

        tween(this.Arrow)
            .repeatForever(
                tween()
                    .to(this.duration, { position: new Vec3(originalPos.x + this.floatHeight, originalPos.y, originalPos.z) }, { easing: 'sineInOut' })
                    .to(this.duration, { position: originalPos }, { easing: 'sineInOut' })
            )
            .start();
    }

    HIDE_TUTORIAL() {
        this.node.active = false;
        Tween.stopAllByTarget(this.Arrow);
    }

    protected update(dt: number): void {
        if (!this.target) return;
        let dir = this.target.worldPosition.clone().subtract(this.node.worldPosition.clone()).normalize();
        let angle = math.toDegree(Math.atan2(dir.y, dir.x));
        this.node.angle = angle;
    }

}