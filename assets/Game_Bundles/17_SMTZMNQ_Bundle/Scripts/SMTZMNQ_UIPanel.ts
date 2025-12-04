import { _decorator, color, Component, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SMTZMNQ_ItemMN } from './SMTZMNQ_ItemMN';
import { SMTZMNQ_ItemQC } from './SMTZMNQ_ItemQC';
import { SMTZMNQ_GameManager } from './SMTZMNQ_GameManager';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_UIPanel')
export class SMTZMNQ_UIPanel extends Component {
    public static Instance: SMTZMNQ_UIPanel = null;

    @property(Node)
    BloodPanel: Node = null;

    @property(Node)
    MNPanel: Node = null;

    @property(Node)
    QCPanel: Node = null;

    @property(Node)
    YWPanel: Node = null;

    @property(Sprite)
    MZIcon1: Sprite = null;

    @property(Sprite)
    MZIcon2: Sprite = null;

    @property(Label)
    YWLabel: Label = null;

    @property(Label)
    JSLabel: Label = null;

    @property(Label)
    SWLabel: Label = null;

    @property(Node)
    YWContent: Node = null;

    @property(Node)
    JSContent: Node = null;

    @property(Node)
    SWContent: Node = null;

    @property(Label)
    NLLabel: Label = null;

    @property(Label)
    XBLabel: Label = null;

    @property(Label)
    TZLabel: Label = null;

    @property(Label)
    XQLabel: Label = null;

    @property(Node)
    OverNode: Node = null;

    TargetPanel: Node = null;
    TargetLabel: Label = null;
    TargetContent: Node = null;

    protected onLoad(): void {
        SMTZMNQ_UIPanel.Instance = this;
    }

    ButtonClick(event: EventTouch) {
        const target = event.getCurrentTarget();
        switch (target.name) {
            case "血液报告":
                this.TargetPanel = this.BloodPanel;
                break;
            case "模拟":
                this.TargetPanel = this.MNPanel;
                break;
            case "切除":
                this.TargetPanel = this.QCPanel;
                break;
            case "药物":
                this.TargetPanel = this.YWPanel;
                break;
        }
        if (this.TargetPanel) this.TargetPanel.active = true;
    }

    CloseTargetPanel() {
        if (this.TargetPanel) {
            this.TargetPanel.active = false;
            this.TargetPanel = null;
        }
    }

    MNItemClick(event: EventTouch) {
        const target = event.getCurrentTarget();
        target.getComponent(SMTZMNQ_ItemMN).click();
    }

    QCItemClick(event: EventTouch) {
        const target = event.getCurrentTarget();
        target.getComponent(SMTZMNQ_ItemQC).click();
    }

    YWTitleClick(event: EventTouch) {
        const target = event.getCurrentTarget();
        switch (target.name) {
            case "药物":
                this.TargetLabel = this.YWLabel;
                this.TargetContent = this.YWContent;
                break;
            case "激素":
                this.TargetLabel = this.JSLabel;
                this.TargetContent = this.JSContent;
                break;
            case "食物":
                this.TargetLabel = this.SWLabel;
                this.TargetContent = this.SWContent;
                break;
        }

        if (!this.TargetContent.active) this.showYW();
    }

    showMNIcon(sf: SpriteFrame = null) {
        if (sf) {
            this.MZIcon1.node.active = false;
            this.MZIcon2.node.active = true;
            this.MZIcon2.spriteFrame = sf;
        } else {
            this.MZIcon1.node.active = true;
            this.MZIcon2.node.active = false;
        }
    }

    showYW() {
        if (!this.TargetLabel || !this.TargetContent) return;

        this.YWLabel.color = color(122, 122, 122, 255);
        this.JSLabel.color = color(122, 122, 122, 255);
        this.SWLabel.color = color(122, 122, 122, 255);

        this.YWContent.active = false;
        this.JSContent.active = false;
        this.SWContent.active = false;

        this.TargetLabel.color = color(0, 0, 0, 255);
        this.TargetContent.active = true;
    }

    showLabel() {
        this.NLLabel.string = SMTZMNQ_GameManager.Instance.Age;
        this.XBLabel.string = SMTZMNQ_GameManager.Instance.Gender;
        this.TZLabel.string = SMTZMNQ_GameManager.Instance.Weight;
        this.XQLabel.string = SMTZMNQ_GameManager.Instance.Blood;
    }

    ShowGameOverPanel() {
        this.OverNode.active = true;
    }

}


