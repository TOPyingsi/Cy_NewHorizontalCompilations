import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_ItemBlood')
export class SMTZMNQ_ItemBlood extends Component {
    @property
    Min: number = 0;

    @property
    Max: number = 0;

    @property
    Fixed: number = 0;

    @property()
    Units: string = "";

    @property
    Time: number = 1;

    @property
    IsNull: boolean = false;

    DataLabel: Label = null;

    protected onLoad(): void {
        this.DataLabel = this.node.getChildByName("数值").getComponent(Label);
    }

    protected start(): void {
        if (this.IsNull) {
            this.DataLabel.string = "-";
            return;
        }
        this.getRand();
        this.schedule(this.getRand, this.Time);
    }


    getRand() {
        const rand = Math.random() * (this.Max - this.Min) + this.Min;
        this.DataLabel.string = rand.toFixed(this.Fixed) + this.Units;
    }

}


