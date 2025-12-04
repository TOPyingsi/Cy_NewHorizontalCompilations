import { _decorator, Component, EventTouch, Node } from 'cc';
import { SMTZMNQ_BodyManager } from './SMTZMNQ_BodyManager';
import { SMTZMNQ_STATE } from './SMTZMNQ_Constant';
import { SMTZMNQ_StatePanel } from './SMTZMNQ_StatePanel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_QCPanel')
export class SMTZMNQ_QCPanel extends Component {
    public static Instance: SMTZMNQ_QCPanel = null;

    @property(Node)
    SZPanel: Node = null;

    @property(Node)
    WPanel: Node = null;

    @property(Node)
    GZPanel: Node = null;

    @property(Node)
    JZXPanel: Node = null;

    @property(Node)
    PZPanel: Node = null;

    TargetPanel: Node = null;
    Name: string = "";

    AddState: SMTZMNQ_STATE = SMTZMNQ_STATE.呼吸中止;

    protected onLoad(): void {
        SMTZMNQ_QCPanel.Instance = this;
    }

    showPanel(name: string) {
        this.Name = name;
        switch (name) {
            case "肾脏":
                this.TargetPanel = this.SZPanel;
                break;
            case "胃":
                this.TargetPanel = this.WPanel;
                break;
            case "肝脏":
                this.TargetPanel = this.GZPanel;
                break;
            case "甲状腺":
                this.TargetPanel = this.JZXPanel;
                break;
            case "脾脏":
                this.TargetPanel = this.PZPanel;
                break;
        }
        if (this.TargetPanel && !this.TargetPanel.active) this.TargetPanel.active = true;
    }

    ButtonClick(event: EventTouch) {
        if (!this.TargetPanel) return;
        SMTZMNQ_StatePanel.Instance.QCBody(this.Name);
        this.TargetPanel.active = false;
        this.TargetPanel = null;
        SMTZMNQ_BodyManager.Instance.QCBody(this.Name);
    }
}


