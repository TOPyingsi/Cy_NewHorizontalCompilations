
import { _decorator, Component, Node, tween, Vec3, director, game, v3, AudioSource, Tween } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';

const { ccclass, property } = _decorator;

@ccclass('XZPQ_WinPanel')
export class XZPQ_WinPanel extends PanelBase {

    six: Node = null;

    Show(): void {
        super.Show();
        this.scheduleOnce(() => {
            NodeUtil.GetNode("six", this.node).active = true;
        }, 1)
    }

    OnButtonClick(event: Event) {

    }
}
