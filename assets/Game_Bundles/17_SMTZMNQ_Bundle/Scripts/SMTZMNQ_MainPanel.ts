import { _decorator, Component, EventTouch, Node, tween, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_MainPanel')
export class SMTZMNQ_MainPanel extends Component {
    @property(Node)
    SelectNodes: Node[] = [];

    @property(Node)
    ParticularsPanels: Node[] = [];

    @property(UIOpacity)
    RPMUIOpacity: UIOpacity = null;

    TargetSelect: Node = null;
    TargetParticulars: Node = null;

    protected start(): void {
        this.StartRPMFlicker();
    }

    ButtonClick(event: EventTouch) {
        if (this.TargetSelect) {
            this.CloseParticulars();
            return;
        }
        this.TargetSelect = event.getCurrentTarget();
        this.ShowParticulars();
    }

    ShowParticulars() {
        this.SelectNodes.filter(node => node.active = false);
        this.TargetSelect.active = true;
        const index = this.SelectNodes.indexOf(this.TargetSelect);
        this.TargetParticulars = this.ParticularsPanels[index];
        this.TargetParticulars.active = true;
    }

    CloseParticulars() {
        this.TargetSelect = null;
        this.TargetParticulars.active = false;
        this.TargetParticulars = null;
        this.SelectNodes.filter(node => node.active = true);
    }

    StartRPMFlicker() {
        tween(this.RPMUIOpacity)
            .to(2, { opacity: 100 }, { easing: `sineOut` })
            .to(2, { opacity: 255 }, { easing: `sineOut` })
            .union()
            .repeatForever()
            .start();
    }
}


