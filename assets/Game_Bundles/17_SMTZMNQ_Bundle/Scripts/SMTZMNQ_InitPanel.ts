import { _decorator, Component, EventTouch, Label, Node } from 'cc';
import { SMTZMNQ_GameManager } from './SMTZMNQ_GameManager';
import { SMTZMNQ_UIPanel } from './SMTZMNQ_UIPanel';
import { SMTZMNQ_ItemNL } from './SMTZMNQ_ItemNL';
const { ccclass, property } = _decorator;

const Age = ["20 岁", "40 岁", "60 岁"];
const Gender = ["女性", "男性"];
const Weight = ["45 千克", "64 千克", "82 千克"];
const Blood = ["A", "B", "AB", "O",]
@ccclass('SMTZMNQ_InitPanel')
export class SMTZMNQ_InitPanel extends Component {
    public static Instance: SMTZMNQ_InitPanel = null;

    @property(Label)
    NLLabel: Label = null;

    @property(Label)
    XBLabel: Label = null;

    @property(Label)
    TZLabel: Label = null;

    @property(Label)
    XQLabel: Label = null;

    @property(Node)
    NLPanel: Node = null;

    @property(Node)
    TZPanel: Node = null;

    TargetPanel: Node = null;

    CurNL: number[] = [2, 0];
    TempNL: number[] = [2, 0];

    CurTZ: number[] = [4, 5];
    TempTZ: number[] = [4, 5];

    protected onLoad(): void {
        SMTZMNQ_InitPanel.Instance = this;
    }

    protected start(): void {
        this.TempNL = this.Clone(this.CurNL);
        this.TempTZ = this.Clone(this.CurTZ);
    }

    ButtonClick(event: EventTouch) {
        const target: Node = event.getCurrentTarget();

        switch (target.name) {
            case "年龄":
                this.TargetPanel = this.NLPanel;
                break;
            case "性别":
                SMTZMNQ_GameManager.Instance.Gender = this.click(Gender, SMTZMNQ_GameManager.Instance.Gender);
                this.XBLabel.string = SMTZMNQ_GameManager.Instance.Gender;
                break;
            case "体重":
                this.TargetPanel = this.TZPanel;
                break;
            case "血型":
                SMTZMNQ_GameManager.Instance.Blood = this.click(Blood, SMTZMNQ_GameManager.Instance.Blood);
                this.XQLabel.string = SMTZMNQ_GameManager.Instance.Blood;
                break;
            case "创建":
                SMTZMNQ_UIPanel.Instance.showLabel();
                this.node.active = false;
                return;
        }

        if (this.TargetPanel) this.TargetPanel.active = true;
    }

    click(arr: string[], cur: string): string {
        const index = arr.findIndex(e => e === cur)
        if (index != -1) {
            return arr[(index + 1) % arr.length];
        }
    }

    NLItemClick(event: EventTouch) {
        const target: Node = event.getCurrentTarget();
        const itemTs: SMTZMNQ_ItemNL = target.getComponent(SMTZMNQ_ItemNL);
        itemTs.Show();
        this.TempNL[itemTs.Dir] = itemTs.Num;
    }

    TrueClick_NL(event: EventTouch) {
        this.CurNL = this.Clone(this.TempNL);
        SMTZMNQ_GameManager.Instance.Age = this.CurNL[0].toString() + this.CurNL[1].toString() + " 岁";
        this.NLLabel.string = SMTZMNQ_GameManager.Instance.Age;
        this.FalseClick();
    }

    TZItemClick(event: EventTouch) {
        const target: Node = event.getCurrentTarget();
        const itemTs: SMTZMNQ_ItemNL = target.getComponent(SMTZMNQ_ItemNL);
        itemTs.Show();
        this.TempTZ[itemTs.Dir] = itemTs.Num;
    }

    TrueClick_TZ(event: EventTouch) {
        this.CurTZ = this.Clone(this.TempTZ);
        SMTZMNQ_GameManager.Instance.Weight = this.CurTZ[0].toString() + this.CurTZ[1].toString() + " 千克";
        this.TZLabel.string = SMTZMNQ_GameManager.Instance.Weight;
        this.FalseClick();
    }

    FalseClick() {
        if (this.TargetPanel) {
            this.TargetPanel.active = false;
            this.TargetPanel = null;
        }

        this.TempNL = this.Clone(this.CurNL);
        this.TempTZ = this.Clone(this.CurTZ);
    }

    /*** 深度拷贝*/
    Clone(sObj: any) {
        if (sObj === null || typeof sObj !== "object") {
            return sObj;
        }

        let s: { [key: string]: any } = {};
        if (sObj.constructor === Array) {
            s = [];
        }

        for (let i in sObj) {
            if (sObj.hasOwnProperty(i)) {
                s[i] = this.Clone(sObj[i]);
            }
        }

        return s;
    }
}


