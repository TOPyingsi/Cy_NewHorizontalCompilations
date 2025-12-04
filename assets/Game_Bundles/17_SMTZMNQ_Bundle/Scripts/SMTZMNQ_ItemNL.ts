import { _decorator, color, Component, Enum, find, Label, Node, Sprite } from 'cc';
import { SMTZMNQ_DIR, SMTZMNQ_EVENTNAME, SMTZMNQ_ITEMTYPE } from './SMTZMNQ_Constant';
import { SMTZMNQ_EventManager } from './SMTZMNQ_EventManager';
import { SMTZMNQ_InitPanel } from './SMTZMNQ_InitPanel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_ItemNL')
export class SMTZMNQ_ItemNL extends Component {
    @property({ type: Enum(SMTZMNQ_DIR) })
    Dir: SMTZMNQ_DIR = SMTZMNQ_DIR.右;

    @property({ type: Enum(SMTZMNQ_ITEMTYPE) })
    Type: SMTZMNQ_ITEMTYPE = SMTZMNQ_ITEMTYPE.年龄;

    @property
    Num: number = 1;

    Sprite: Sprite = null;
    Label: Label = null;

    protected onLoad(): void {
        this.Sprite = find("底部", this.node).getComponent(Sprite);
        this.Label = find("Num", this.node).getComponent(Label);
        SMTZMNQ_EventManager.on(SMTZMNQ_EVENTNAME[this.Dir], this.Hide, this);
    }

    protected start(): void {
        this.Label.string = this.Num.toString();
    }

    Hide() {
        this.Sprite.color = color(255, 255, 255, 255);
        this.Label.color = color(0, 0, 0, 255);
    }

    Show() {
        SMTZMNQ_EventManager.Scene.emit(SMTZMNQ_EVENTNAME[this.Dir]);
        this.Sprite.color = color(0, 0, 0, 255);
        this.Label.color = color(255, 255, 255, 255);
    }

    protected onEnable(): void {
        if (this.Type == SMTZMNQ_ITEMTYPE.年龄 && this.Num == SMTZMNQ_InitPanel.Instance.CurNL[this.Dir]) this.Show();
        else if (this.Type == SMTZMNQ_ITEMTYPE.体重 && this.Num == SMTZMNQ_InitPanel.Instance.CurTZ[this.Dir]) this.Show();
    }
}


