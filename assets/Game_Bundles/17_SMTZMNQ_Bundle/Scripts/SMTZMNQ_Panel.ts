import { _decorator, Component, EventTouch, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_Panel')
export class SMTZMNQ_Panel extends Component {
    @property(Node)
    SelectNodes: Node[] = [];

    @property(Node)
    ParticularsPanels: Node[] = [];


    TargetSelect: Node = null;
    TargetParticulars: Node = null;


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

}


