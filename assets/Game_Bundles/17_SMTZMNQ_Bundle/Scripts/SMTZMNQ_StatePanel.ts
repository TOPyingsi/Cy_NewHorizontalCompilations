import { _decorator, Component, Node } from 'cc';
import { SMTZMNQ_STATE } from './SMTZMNQ_Constant';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_StatePanel')
export class SMTZMNQ_StatePanel extends Component {

    public static Instance: SMTZMNQ_StatePanel = null;

    @property(Node)
    Content: Node = null;

    @property(Node)
    TempContent: Node = null;

    @property({ type: Node, displayName: "呼吸困难" })
    HXKNState: Node = null;

    @property({ type: Node, displayName: "呼吸中止" })
    HXZZState: Node = null;

    @property({ type: Node, displayName: "心脏骤停" })
    XZZTtate: Node = null;

    @property({ type: Node, displayName: "脑死亡" })
    NSWState: Node = null;

    @property({ type: Node, displayName: "低血钾" })
    JState: Node = null;

    @property({ type: Node, displayName: "低血糖" })
    TState: Node = null;

    @property({ type: Node, displayName: "室颤" })
    SSState: Node = null;

    @property({ type: Node, displayName: "高血压" })
    GXYState: Node = null;

    @property({ type: Node, displayName: "大出血" })
    DCXState: Node = null;

    @property({ type: Node, displayName: "血容量减少" })
    XRJSState: Node = null;

    @property({ type: Node, displayName: "高血钙" })
    GXGState: Node = null;

    HP: number = 1000;
    IsDie: boolean = false;
    Debug: number = 1;

    protected onLoad(): void {
        SMTZMNQ_StatePanel.Instance = this;
    }

    protected update(dt: number): void {
        if (this.IsDie) return;
        this.HP -= dt * this.Debug;
        if (this.HP <= 500) {
            this.ShowPanelByName(SMTZMNQ_STATE.室颤);
        } else if (this.HP <= 100) {
            this.ShowPanelByName(SMTZMNQ_STATE.呼吸困难);
        } else if (this.HP <= 0) {
            this.IsDie = true;
            this.ShowPanelByName(SMTZMNQ_STATE.心脏骤停);
            this.ShowPanelByName(SMTZMNQ_STATE.呼吸中止);
            this.ShowPanelByName(SMTZMNQ_STATE.脑死亡);
        }
    }

    ShowPanelByName(state: SMTZMNQ_STATE) {
        switch (state) {
            case SMTZMNQ_STATE.呼吸困难:
                this.showPanel(this.HXKNState);
                break;
            case SMTZMNQ_STATE.呼吸中止:
                this.showPanel(this.HXZZState);
                break;
            case SMTZMNQ_STATE.心脏骤停:
                this.showPanel(this.XZZTtate);
                break;
            case SMTZMNQ_STATE.脑死亡:
                this.showPanel(this.NSWState);
                break;
            case SMTZMNQ_STATE.低血钾:
                this.showPanel(this.JState);
                break;
            case SMTZMNQ_STATE.低血糖:
                this.showPanel(this.TState);
                break;
            case SMTZMNQ_STATE.室颤:
                this.showPanel(this.SSState);
                break;
            case SMTZMNQ_STATE.高血压:
                this.showPanel(this.GXYState);
                break;
            case SMTZMNQ_STATE.大出血:
                this.showPanel(this.DCXState);
                break;
            case SMTZMNQ_STATE.血容量减少:
                this.showPanel(this.XRJSState);
                break;
            case SMTZMNQ_STATE.高血钙:
                this.showPanel(this.GXGState);
                break;
        }
    }

    HidePanelByName(state: SMTZMNQ_STATE) {
        switch (state) {
            case SMTZMNQ_STATE.呼吸困难:
                this.hidePanel(this.HXKNState);
                break;
            case SMTZMNQ_STATE.呼吸中止:
                this.hidePanel(this.HXZZState);
                break;
            case SMTZMNQ_STATE.心脏骤停:
                this.hidePanel(this.XZZTtate);
                break;
            case SMTZMNQ_STATE.脑死亡:
                this.hidePanel(this.NSWState);
                break;
            case SMTZMNQ_STATE.低血钾:
                this.hidePanel(this.JState);
                break;
            case SMTZMNQ_STATE.低血糖:
                this.hidePanel(this.TState);
                break;
            case SMTZMNQ_STATE.室颤:
                this.hidePanel(this.SSState);
                break;
            case SMTZMNQ_STATE.高血压:
                this.hidePanel(this.GXYState);
                break;
            case SMTZMNQ_STATE.大出血:
                this.hidePanel(this.DCXState);
                break;
            case SMTZMNQ_STATE.血容量减少:
                this.hidePanel(this.XRJSState);
                break;
            case SMTZMNQ_STATE.高血钙:
                this.hidePanel(this.GXGState);
                break;
        }
    }

    showPanel(panel: Node) {
        if (panel && panel.active) return;
        panel.active = true;
        panel.parent = this.Content;
    }

    hidePanel(panel: Node) {
        panel.active = false;
        panel.parent = this.TempContent;
    }

    QCBody(name: string) {
        let DebugState: SMTZMNQ_STATE[] = [];
        switch (name) {
            case "肾脏":
                DebugState.push(SMTZMNQ_STATE.高血压)
                break;
            case "胃":
                DebugState.push(SMTZMNQ_STATE.低血糖, SMTZMNQ_STATE.低血钾);
                break;
            case "肝脏":
                DebugState.push(SMTZMNQ_STATE.大出血);
                break;
            case "甲状腺":
                DebugState.push(SMTZMNQ_STATE.血容量减少);
                break;
            case "脾脏":
                DebugState.push(SMTZMNQ_STATE.高血钙);
                break;
        }

        for (let index = 0; index < DebugState.length; index++) {
            this.ShowPanelByName(DebugState[index])
        }
    }

}


